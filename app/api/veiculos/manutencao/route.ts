import { NextResponse } from "next/server";
import { db, schema } from "@/lib/db";
import { and, eq } from "drizzle-orm";
import { authenticateRequest, handleAuthError } from "@/lib/api-auth";
import { z } from "zod";
import { uuidSchema } from "@/lib/schemas/common";
import { parseLocalDateString, addMonthsToDate, addMonthsToPeriod } from "@/lib/utils/date";
import { formatDecimalForDbRequired, splitAmount, centsToDecimalString } from "@/lib/utils/currency";

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

// POST /api/veiculos/manutencao
/**
 * @swagger
 * /api/veiculos/manutencao:
 *   post:
 *     description: Cria um novo registro de manutenção e o lançamento financeiro associado.
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
 *               type:
 *                 type: string
 *               serviceName:
 *                 type: string
 *               description:
 *                 type: string
 *               parts:
 *                 type: string
 *               laborCost:
 *                 type: number
 *               partsCost:
 *                 type: number
 *               totalCost:
 *                 type: number
 *               workshop:
 *                 type: string
 *               nextMaintenanceKm:
 *                 type: number
 *               nextMaintenanceDate:
 *                 type: string
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
 *         description: Manutenção criada com sucesso.
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
    const validation = maintenanceSchema.safeParse(body);

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
    const maintenanceDate = parseLocalDateString(data.date);
    const dueDate = data.dueDate ? parseLocalDateString(data.dueDate) : null;
    const period = `${maintenanceDate.getFullYear()}-${String(
      maintenanceDate.getMonth() + 1
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
          ? addMonthsToDate(maintenanceDate, i)
          : maintenanceDate;
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
            name: `Manutenção - ${vehicle.name} - ${data.serviceName}${
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
            pagadorId: pagadorId,
            categoriaId: data.categoriaId,
            note: data.note,
            veiculoId: data.veiculoId,
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
        throw new Error("Falha ao criar lançamento de manutenção.");
      }

      const [manutencao] = await tx.insert(schema.manutencoes).values({
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
      }).returning();

      return { manutencao, lancamentos: createdLancamentos };
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
