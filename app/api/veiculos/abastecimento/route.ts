import { NextResponse } from "next/server";
import { db, schema } from "@/lib/db";
import { and, eq } from "drizzle-orm";
import { authenticateRequest, handleAuthError } from "@/lib/api-auth";
import { z } from "zod";
import { uuidSchema } from "@/lib/schemas/common";
import { parseLocalDateString, addMonthsToDate, addMonthsToPeriod } from "@/lib/utils/date";
import { formatDecimalForDbRequired, splitAmount, centsToDecimalString } from "@/lib/utils/currency";

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
  contaId: z.preprocess(
    (val) => (val === "" ? null : val),
    uuidSchema("Conta").optional().nullable()
  ),
  cartaoId: z.preprocess(
    (val) => (val === "" ? null : val),
    uuidSchema("Cartão").optional().nullable()
  ),
  pagadorId: z.preprocess(
    (val) => (val === "" ? null : val),
    uuidSchema("Pagador").optional().nullable()
  ),
  categoriaId: z.string().optional(),
  note: z.string().optional().nullable(),
  dueDate: z.string().refine((val) => !isNaN(Date.parse(val)), "Data inválida").optional().nullable(),
});

// POST /api/veiculos/abastecimento
/**
 * @swagger
 * /api/veiculos/abastecimento:
 *   post:
 *     description: Cria um novo registro de abastecimento e o lançamento financeiro associado.
 *     tags:
 *       - Veículos
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               veiculoId:
 *                 type: string
 *               date:
 *                 type: string
 *               odometer:
 *                 type: number
 *               liters:
 *                 type: number
 *               pricePerLiter:
 *                 type: number
 *               totalCost:
 *                 type: number
 *               fuelType:
 *                 type: string
 *               isFullTank:
 *                 type: boolean
 *               paymentMethod:
 *                 type: string
 *               condition:
 *                 type: string
 *               installmentCount:
 *                 type: number
 *               contaId:
 *                 type: string
 *               cartaoId:
 *                 type: string
 *               pagadorId:
 *                 type: string
 *               categoriaId:
 *                 type: string
 *               note:
 *                 type: string
 *               dueDate:
 *                 type: string
 *     responses:
 *       201:
 *         description: Abastecimento criado com sucesso.
 *       400:
 *         description: Dados inválidos.
 *       401:
 *         description: Não autorizado.
 *       404:
 *         description: Veículo não encontrado.
 *       500:
 *         description: Erro interno do servidor.
 */
export async function POST(request: Request) {
  try {
    const { user, error, status } = await authenticateRequest(request);
    if (error || !user) {
      return handleAuthError(error || "User not found", status);
    }

    const body = await request.json();
    const validation = refuelingSchema.safeParse(body);

    if (!validation.success) {
      return new NextResponse(
        JSON.stringify({ error: "Dados inválidos", details: validation.error.flatten() }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const data = validation.data;

    const vehicle = await db.query.veiculos.findFirst({
      where: and(eq(schema.veiculos.id, data.veiculoId), eq(schema.veiculos.userId, user.id)),
    });

    if (!vehicle) {
      return new NextResponse(
        JSON.stringify({ error: "Veículo não encontrado." }),
        { status: 404, headers: { "Content-Type": "application/json" } }
      );
    }

    // Default Payer Logic
    let pagadorId = data.pagadorId;
    if (!pagadorId) {
      const defaultPayer = await db.query.pagadores.findFirst({
        where: eq(schema.pagadores.userId, user.id),
      });
      pagadorId = defaultPayer?.id ?? null;
    }

    // Create Expense (Lancamento)
    const purchaseDate = parseLocalDateString(data.date);
    const dueDate = data.dueDate ? parseLocalDateString(data.dueDate) : null;
    const period = `${purchaseDate.getFullYear()}-${String(
      purchaseDate.getMonth() + 1
    ).padStart(2, "0")}`;

    const isParcelado = data.condition === "Parcelado";
    const installmentTotal = isParcelado ? (data.installmentCount ?? 1) : 1;
    const seriesId = isParcelado ? crypto.randomUUID() : null;
    const totalCents = Math.round(data.totalCost * 100);
    const amounts = isParcelado
      ? splitAmount(totalCents, installmentTotal)
      : [totalCents];

    const result = await db.transaction(async (tx) => {
      let firstLancamentoId: string | null = null;
      const createdLancamentos = [];

      for (let i = 0; i < installmentTotal; i++) {
        const currentAmountCents = amounts[i];
        const currentAmount = centsToDecimalString(currentAmountCents * -1); // Expense is negative

        const currentPurchaseDate = isParcelado
          ? addMonthsToDate(purchaseDate, i)
          : purchaseDate;
        const currentPeriod = isParcelado
          ? addMonthsToPeriod(period, i)
          : period;
        
        // Calculate due date for installments if initial due date is provided
        const currentDueDate = dueDate && isParcelado
            ? addMonthsToDate(dueDate, i)
            : dueDate;

        let isSettled = true;
        if (data.paymentMethod === "Cartão de crédito") {
          isSettled = false;
        } else if (isParcelado && i > 0) {
          isSettled = false;
        }

        const [lancamento] = await tx
          .insert(schema.lancamentos)
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
            dueDate: currentDueDate,
            period: currentPeriod,
            contaId: data.contaId,
            cartaoId: data.cartaoId,
            note: data.note,
            veiculoId: data.veiculoId,
            pagadorId: pagadorId,
            categoriaId: data.categoriaId,
            isSettled: isSettled,
            installmentCount: isParcelado ? installmentTotal : null,
            currentInstallment: isParcelado ? i + 1 : null,
            seriesId: seriesId,
          })
          .returning();

        createdLancamentos.push(lancamento);

        if (i === 0) {
          firstLancamentoId = lancamento.id;
        }
      }

      if (!firstLancamentoId) {
        throw new Error("Falha ao criar lançamento de abastecimento.");
      }

      const [abastecimento] = await tx.insert(schema.abastecimentos).values({
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
      }).returning();

      return { abastecimento, lancamentos: createdLancamentos };
    });

    return new NextResponse(JSON.stringify(result), {
      status: 201,
      headers: { "Content-Type": "application/json" },
    });

  } catch (e: any) {
    return new NextResponse(
      JSON.stringify({ error: "An internal server error occurred.", details: e.message }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
