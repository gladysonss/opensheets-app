"use server";

import { veiculos, abastecimentos, lancamentos, manutencoes } from "@/db/schema";
import { handleActionError, revalidateForEntity } from "@/lib/actions/helpers";
import type { ActionResult } from "@/lib/actions/types";
import { db } from "@/lib/db";
import { getUser } from "@/lib/auth/server";
import { uuidSchema } from "@/lib/schemas/common";
import { and, eq, desc } from "drizzle-orm";
import { z } from "zod";
import { parseLocalDateString, addMonthsToDate, addMonthsToPeriod } from "@/lib/utils/date";
import { formatDecimalForDbRequired, splitAmount, centsToDecimalString } from "@/lib/utils/currency";
import { randomUUID } from "crypto";

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
  condition: z.string().min(1, "Informe a condição"),
  installmentCount: z.number().optional(),
  contaId: uuidSchema("Conta").optional().nullable(),
  cartaoId: uuidSchema("Cartão").optional().nullable(),
  pagadorId: uuidSchema("Pagador").optional().nullable(),
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

    const isParcelado = data.condition === "Parcelado";
    const installmentTotal = isParcelado ? (data.installmentCount ?? 1) : 1;
    const seriesId = isParcelado ? randomUUID() : null;
    const totalCents = Math.round(data.totalCost * 100);
    const amounts = isParcelado
      ? splitAmount(totalCents, installmentTotal)
      : [totalCents];

    await db.transaction(async (tx) => {
      let firstLancamentoId: string | null = null;

      for (let i = 0; i < installmentTotal; i++) {
        const currentAmountCents = amounts[i];
        const currentAmount = centsToDecimalString(currentAmountCents * -1); // Expense is negative

        const currentPurchaseDate = isParcelado
          ? addMonthsToDate(purchaseDate, i)
          : purchaseDate;
        const currentPeriod = isParcelado
          ? addMonthsToPeriod(period, i)
          : period;

        // Determine if settled
        // Credit card is never settled immediately (it goes to invoice)
        // Parcelado installments (after first) are not settled
        // First installment of Parcelado (if not credit card) might be settled?
        // For simplicity:
        // - Credit Card: always false
        // - Others:
        //   - Not Parcelado: true (paid now)
        //   - Parcelado: First true, others false (unless credit card, then all false)
        let isSettled = true;
        if (data.paymentMethod === "Cartão de crédito") {
          isSettled = false;
        } else if (isParcelado && i > 0) {
          isSettled = false;
        }

        const [lancamento] = await tx
          .insert(lancamentos)
          .values({
            userId: user.id,
            name: `Abastecimento - ${vehicle.name}${
              isParcelado ? ` (${i + 1}/${installmentTotal})` : ""
            }`,
            amount: currentAmount,
            transactionType: "Despesa",
            condition: data.condition,
            paymentMethod: data.paymentMethod,
            purchaseDate: currentPurchaseDate,
            period: currentPeriod,
            contaId: data.contaId,
            cartaoId: data.cartaoId,
            note: data.note,
            veiculoId: data.veiculoId,
            pagadorId: data.pagadorId,
            isSettled: isSettled,
            installmentCount: isParcelado ? installmentTotal : null,
            currentInstallment: isParcelado ? i + 1 : null,
            seriesId: seriesId,
          })
          .returning({ id: lancamentos.id });

        if (i === 0) {
          firstLancamentoId = lancamento.id;
        }
      }

      if (!firstLancamentoId) {
        throw new Error("Falha ao criar lançamento de abastecimento.");
      }

      await tx.insert(abastecimentos).values({
        userId: user.id,
        veiculoId: data.veiculoId,
        lancamentoId: firstLancamentoId,
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

// ==========================================
// Schemas - Manutenções
// ==========================================

const maintenanceSchema = z.object({
  veiculoId: uuidSchema("Veículo"),
  date: z.string().refine((val) => !isNaN(Date.parse(val)), "Data inválida"),
  odometer: z.coerce.number().min(0, "Odômetro inválido"),
  type: z.enum(["preventiva", "corretiva", "revisao", "outros"]),
  serviceName: z.string().min(1, "Informe o nome do serviço"),
  description: z.string().optional().nullable(),
  parts: z.string().optional().nullable(),
  laborCost: z.coerce.number().min(0, "Custo de mão de obra inválido").optional().nullable(),
  partsCost: z.coerce.number().min(0, "Custo de peças inválido").optional().nullable(),
  totalCost: z.coerce.number().positive("Custo total deve ser maior que zero"),
  workshop: z.string().optional().nullable(),
  nextMaintenanceKm: z.coerce.number().min(0).optional().nullable(),
  nextMaintenanceDate: z.string().refine((val) => !val || !isNaN(Date.parse(val)), "Data inválida").optional().nullable(),
  // Fields for the expense (lancamento)
  paymentMethod: z.string().min(1, "Informe a forma de pagamento"),
  condition: z.string().min(1, "Informe a condição"),
  installmentCount: z.number().optional(),
  contaId: uuidSchema("Conta").optional().nullable(),
  cartaoId: uuidSchema("Cartão").optional().nullable(),
  pagadorId: uuidSchema("Pagador").optional().nullable(),
  note: z.string().optional().nullable(),
});

const createMaintenanceSchema = maintenanceSchema;
const updateMaintenanceSchema = maintenanceSchema.extend({
  id: uuidSchema("Manutenção"),
});
const deleteMaintenanceSchema = z.object({
  id: uuidSchema("Manutenção"),
});

type CreateMaintenanceInput = z.infer<typeof createMaintenanceSchema>;
type UpdateMaintenanceInput = z.infer<typeof updateMaintenanceSchema>;
type DeleteMaintenanceInput = z.infer<typeof deleteMaintenanceSchema>;

// ==========================================
// Actions - Manutenções
// ==========================================

export async function createMaintenanceAction(
  input: CreateMaintenanceInput
): Promise<ActionResult> {
  try {
    const user = await getUser();
    const data = createMaintenanceSchema.parse(input);

    const vehicle = await db.query.veiculos.findFirst({
      where: and(eq(veiculos.id, data.veiculoId), eq(veiculos.userId, user.id)),
    });

    if (!vehicle) {
      return { success: false, error: "Veículo não encontrado." };
    }

    // Create Expense (Lancamento)
    const maintenanceDate = parseLocalDateString(data.date);
    const period = `${maintenanceDate.getFullYear()}-${String(
      maintenanceDate.getMonth() + 1
    ).padStart(2, "0")}`;

    const isParcelado = data.condition === "Parcelado";
    const installmentTotal = isParcelado ? (data.installmentCount ?? 1) : 1;
    const seriesId = isParcelado ? randomUUID() : null;
    const totalCents = Math.round(data.totalCost * 100);
    const amounts = isParcelado
      ? splitAmount(totalCents, installmentTotal)
      : [totalCents];

    await db.transaction(async (tx) => {
      let firstLancamentoId: string | null = null;

      for (let i = 0; i < installmentTotal; i++) {
        const currentAmountCents = amounts[i];
        const currentAmount = centsToDecimalString(currentAmountCents * -1); // Expense is negative

        const currentPurchaseDate = isParcelado
          ? addMonthsToDate(maintenanceDate, i)
          : maintenanceDate;
        const currentPeriod = isParcelado
          ? addMonthsToPeriod(period, i)
          : period;

        let isSettled = true;
        if (data.paymentMethod === "Cartão de crédito") {
          isSettled = false;
        } else if (isParcelado && i > 0) {
          isSettled = false;
        }

        const [lancamento] = await tx
          .insert(lancamentos)
          .values({
            userId: user.id,
            name: `Manutenção - ${vehicle.name} - ${data.serviceName}${
              isParcelado ? ` (${i + 1}/${installmentTotal})` : ""
            }`,
            amount: currentAmount,
            transactionType: "Despesa",
            condition: data.condition,
            paymentMethod: data.paymentMethod,
            purchaseDate: currentPurchaseDate,
            period: currentPeriod,
            contaId: data.contaId,
            cartaoId: data.cartaoId,
            pagadorId: data.pagadorId,
            note: data.note,
            veiculoId: data.veiculoId,
            isSettled: isSettled,
            installmentCount: isParcelado ? installmentTotal : null,
            currentInstallment: isParcelado ? i + 1 : null,
            seriesId: seriesId,
          })
          .returning({ id: lancamentos.id });

        if (i === 0) {
          firstLancamentoId = lancamento.id;
        }
      }

      if (!firstLancamentoId) {
        throw new Error("Falha ao criar lançamento de manutenção.");
      }

      await tx.insert(manutencoes).values({
        userId: user.id,
        veiculoId: data.veiculoId,
        lancamentoId: firstLancamentoId,
        date: maintenanceDate,
        odometer: data.odometer,
        type: data.type,
        serviceName: data.serviceName,
        description: data.description,
        parts: data.parts,
        laborCost: data.laborCost
          ? formatDecimalForDbRequired(data.laborCost)
          : null,
        partsCost: data.partsCost
          ? formatDecimalForDbRequired(data.partsCost)
          : null,
        totalCost: formatDecimalForDbRequired(data.totalCost),
        workshop: data.workshop,
        nextMaintenanceKm: data.nextMaintenanceKm,
        nextMaintenanceDate: data.nextMaintenanceDate
          ? parseLocalDateString(data.nextMaintenanceDate)
          : null,
      });
    });

    revalidateForEntity("veiculos");
    revalidateForEntity("lancamentos");
    return { success: true, message: "Manutenção registrada com sucesso." };
  } catch (error) {
    return handleActionError(error);
  }
}

export async function updateMaintenanceAction(
  input: UpdateMaintenanceInput
): Promise<ActionResult> {
  try {
    const user = await getUser();
    const data = updateMaintenanceSchema.parse(input);

    const existing = await db.query.manutencoes.findFirst({
      where: and(eq(manutencoes.id, data.id), eq(manutencoes.userId, user.id)),
    });

    if (!existing) {
      return { success: false, error: "Manutenção não encontrada." };
    }

    const vehicle = await db.query.veiculos.findFirst({
      where: and(eq(veiculos.id, data.veiculoId), eq(veiculos.userId, user.id)),
    });

    if (!vehicle) {
      return { success: false, error: "Veículo não encontrado." };
    }

    const maintenanceDate = parseLocalDateString(data.date);
    const period = `${maintenanceDate.getFullYear()}-${String(
      maintenanceDate.getMonth() + 1
    ).padStart(2, "0")}`;

    await db.transaction(async (tx) => {
      // Update maintenance
      await tx
        .update(manutencoes)
        .set({
          veiculoId: data.veiculoId,
          date: maintenanceDate,
          odometer: data.odometer,
          type: data.type,
          serviceName: data.serviceName,
          description: data.description,
          parts: data.parts,
          laborCost: data.laborCost ? formatDecimalForDbRequired(data.laborCost) : null,
          partsCost: data.partsCost ? formatDecimalForDbRequired(data.partsCost) : null,
          totalCost: formatDecimalForDbRequired(data.totalCost),
          workshop: data.workshop,
          nextMaintenanceKm: data.nextMaintenanceKm,
          nextMaintenanceDate: data.nextMaintenanceDate ? parseLocalDateString(data.nextMaintenanceDate) : null,
        })
        .where(
          and(eq(manutencoes.id, data.id), eq(manutencoes.userId, user.id))
        );

      // Update associated lancamento if it exists
      if (existing.lancamentoId) {
        await tx
          .update(lancamentos)
          .set({
            name: `Manutenção - ${vehicle.name} - ${data.serviceName}`,
            amount: formatDecimalForDbRequired(data.totalCost * -1),
            paymentMethod: data.paymentMethod,
            purchaseDate: maintenanceDate,
            period: period,
            contaId: data.contaId,
            cartaoId: data.cartaoId,
            pagadorId: data.pagadorId,
            note: data.note,
            veiculoId: data.veiculoId,
          })
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
    return { success: true, message: "Manutenção atualizada com sucesso." };
  } catch (error) {
    return handleActionError(error);
  }
}

export async function deleteMaintenanceAction(
  input: DeleteMaintenanceInput
): Promise<ActionResult> {
  try {
    const user = await getUser();
    const data = deleteMaintenanceSchema.parse(input);

    const existing = await db.query.manutencoes.findFirst({
      where: and(eq(manutencoes.id, data.id), eq(manutencoes.userId, user.id)),
    });

    if (!existing) {
      return { success: false, error: "Manutenção não encontrada." };
    }

    await db.transaction(async (tx) => {
      // Delete maintenance
      await tx
        .delete(manutencoes)
        .where(
          and(eq(manutencoes.id, data.id), eq(manutencoes.userId, user.id))
        );

      // Delete associated lancamento if it exists
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
    return { success: true, message: "Manutenção removida com sucesso." };
  } catch (error) {
    return handleActionError(error);
  }
}
