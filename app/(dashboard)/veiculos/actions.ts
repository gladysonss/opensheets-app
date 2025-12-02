"use server";

import { veiculos, abastecimentos, lancamentos } from "@/db/schema";
import { handleActionError, revalidateForEntity } from "@/lib/actions/helpers";
import type { ActionResult } from "@/lib/actions/types";
import { db } from "@/lib/db";
import { getUser } from "@/lib/auth/server";
import { uuidSchema } from "@/lib/schemas/common";
import { and, eq, desc } from "drizzle-orm";
import { z } from "zod";
import { parseLocalDateString } from "@/lib/utils/date";
import { formatDecimalForDbRequired } from "@/lib/utils/currency";

// ==========================================
// Schemas - Veículos
// ==========================================

const vehicleSchema = z.object({
  name: z.string().min(1, "Informe o nome do veículo."),
  brand: z.string().optional(),
  model: z.string().optional(),
  year: z.coerce
    .number()
    .int()
    .min(1900, "Ano inválido")
    .max(new Date().getFullYear() + 1, "Ano inválido")
    .optional()
    .nullable(),
  plate: z.string().optional().nullable(),
  color: z.string().optional().nullable(),
  renavam: z.string().optional().nullable(),
  status: z.enum(["active", "sold", "inactive"]).default("active"),
  type: z.enum(["car", "motorcycle", "truck", "bus", "other"]).default("car"),
});

const createVehicleSchema = vehicleSchema;
const updateVehicleSchema = vehicleSchema.extend({
  id: uuidSchema("Veículo"),
});
const deleteVehicleSchema = z.object({
  id: uuidSchema("Veículo"),
});

type CreateVehicleInput = z.infer<typeof createVehicleSchema>;
type UpdateVehicleInput = z.infer<typeof updateVehicleSchema>;
type DeleteVehicleInput = z.infer<typeof deleteVehicleSchema>;

// ==========================================
// Schemas - Abastecimentos
// ==========================================

const refuelingSchema = z.object({
  veiculoId: uuidSchema("Veículo"),
  date: z.string().refine((val) => !isNaN(Date.parse(val)), "Data inválida"),
  odometer: z.coerce.number().min(0, "Odômetro inválido"),
  liters: z.coerce.number().positive("Litros deve ser maior que zero"),
  pricePerLiter: z.coerce
    .number()
    .positive("Preço por litro deve ser maior que zero"),
  totalCost: z.coerce.number().positive("Custo total deve ser maior que zero"),
  fuelType: z.string().min(1, "Informe o tipo de combustível"),
  isFullTank: z.boolean().default(true),
  // Fields for the expense (lancamento)
  paymentMethod: z.string().min(1, "Informe a forma de pagamento"),
  contaId: uuidSchema("Conta").optional().nullable(),
  cartaoId: uuidSchema("Cartão").optional().nullable(),
  note: z.string().optional().nullable(),
});

const createRefuelingSchema = refuelingSchema;
const updateRefuelingSchema = refuelingSchema.extend({
  id: uuidSchema("Abastecimento"),
});
const deleteRefuelingSchema = z.object({
  id: uuidSchema("Abastecimento"),
});

type CreateRefuelingInput = z.infer<typeof createRefuelingSchema>;
type UpdateRefuelingInput = z.infer<typeof updateRefuelingSchema>;
type DeleteRefuelingInput = z.infer<typeof deleteRefuelingSchema>;

// ==========================================
// Actions - Veículos
// ==========================================

export async function createVehicleAction(
  input: CreateVehicleInput
): Promise<ActionResult> {
  try {
    const user = await getUser();
    const data = createVehicleSchema.parse(input);

    await db.insert(veiculos).values({
      ...data,
      userId: user.id,
    });

    revalidateForEntity("veiculos");
    return { success: true, message: "Veículo criado com sucesso." };
  } catch (error) {
    return handleActionError(error);
  }
}

export async function updateVehicleAction(
  input: UpdateVehicleInput
): Promise<ActionResult> {
  try {
    const user = await getUser();
    const data = updateVehicleSchema.parse(input);

    const existing = await db.query.veiculos.findFirst({
      where: and(eq(veiculos.id, data.id), eq(veiculos.userId, user.id)),
    });

    if (!existing) {
      return { success: false, error: "Veículo não encontrado." };
    }

    await db
      .update(veiculos)
      .set({
        ...data,
        updatedAt: new Date(),
      })
      .where(and(eq(veiculos.id, data.id), eq(veiculos.userId, user.id)));

    revalidateForEntity("veiculos");
    return { success: true, message: "Veículo atualizado com sucesso." };
  } catch (error) {
    return handleActionError(error);
  }
}

export async function deleteVehicleAction(
  input: DeleteVehicleInput
): Promise<ActionResult> {
  try {
    const user = await getUser();
    const data = deleteVehicleSchema.parse(input);

    const existing = await db.query.veiculos.findFirst({
      where: and(eq(veiculos.id, data.id), eq(veiculos.userId, user.id)),
    });

    if (!existing) {
      return { success: false, error: "Veículo não encontrado." };
    }

    await db
      .delete(veiculos)
      .where(and(eq(veiculos.id, data.id), eq(veiculos.userId, user.id)));

    revalidateForEntity("veiculos");
    return { success: true, message: "Veículo removido com sucesso." };
  } catch (error) {
    return handleActionError(error);
  }
}

// ==========================================
// Actions - Abastecimentos
// ==========================================

export async function createRefuelingAction(
  input: CreateRefuelingInput
): Promise<ActionResult> {
  try {
    const user = await getUser();
    const data = createRefuelingSchema.parse(input);

    const vehicle = await db.query.veiculos.findFirst({
      where: and(eq(veiculos.id, data.veiculoId), eq(veiculos.userId, user.id)),
    });

    if (!vehicle) {
      return { success: false, error: "Veículo não encontrado." };
    }

    // Create Expense (Lancamento)
    const purchaseDate = parseLocalDateString(data.date);
    const period = `${purchaseDate.getFullYear()}-${String(
      purchaseDate.getMonth() + 1
    ).padStart(2, "0")}`;

    await db.transaction(async (tx) => {
      const [lancamento] = await tx
        .insert(lancamentos)
        .values({
          userId: user.id,
          name: `Abastecimento - ${vehicle.name}`,
          amount: formatDecimalForDbRequired(data.totalCost * -1), // Expense is negative
          transactionType: "Despesa",
          condition: "À vista", // Assuming fuel is usually paid at once
          paymentMethod: data.paymentMethod,
          purchaseDate: purchaseDate,
          period: period,
          contaId: data.contaId,
          cartaoId: data.cartaoId,
          note: data.note,
          veiculoId: data.veiculoId,
          isSettled: true, // Assuming paid immediately
        })
        .returning({ id: lancamentos.id });

      await tx.insert(abastecimentos).values({
        userId: user.id,
        veiculoId: data.veiculoId,
        lancamentoId: lancamento.id,
        date: purchaseDate,
        odometer: data.odometer,
        liters: formatDecimalForDbRequired(data.liters),
        pricePerLiter: formatDecimalForDbRequired(data.pricePerLiter),
        totalCost: formatDecimalForDbRequired(data.totalCost),
        fuelType: data.fuelType,
        isFullTank: data.isFullTank,
      });
    });

    revalidateForEntity("veiculos");
    revalidateForEntity("lancamentos");
    return { success: true, message: "Abastecimento registrado com sucesso." };
  } catch (error) {
    return handleActionError(error);
  }
}

export async function deleteRefuelingAction(
  input: DeleteRefuelingInput
): Promise<ActionResult> {
  try {
    const user = await getUser();
    const data = deleteRefuelingSchema.parse(input);

    const existing = await db.query.abastecimentos.findFirst({
      where: and(
        eq(abastecimentos.id, data.id),
        eq(abastecimentos.userId, user.id)
      ),
    });

    if (!existing) {
      return { success: false, error: "Abastecimento não encontrado." };
    }

    await db.transaction(async (tx) => {
      // Delete refueling record
      await tx
        .delete(abastecimentos)
        .where(
          and(
            eq(abastecimentos.id, data.id),
            eq(abastecimentos.userId, user.id)
          )
        );

      // Delete associated expense if it exists
      if (existing.lancamentoId) {
        await tx
          .delete(lancamentos)
          .where(
            and(
              eq(lancamentos.id, existing.lancamentoId),
              eq(lancamentos.userId, user.id)
            )
          );
      }
    });

    revalidateForEntity("veiculos");
    revalidateForEntity("lancamentos");
    return { success: true, message: "Abastecimento removido com sucesso." };
  } catch (error) {
    return handleActionError(error);
  }
}
