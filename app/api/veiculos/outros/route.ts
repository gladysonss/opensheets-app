import { NextResponse } from "next/server";
import { db, schema } from "@/lib/db";
import { and, eq } from "drizzle-orm";
import { authenticateRequest, handleAuthError } from "@/lib/api-auth";
import { z } from "zod";
import { uuidSchema } from "@/lib/schemas/common";
import { parseLocalDateString, addMonthsToDate, addMonthsToPeriod } from "@/lib/utils/date";
import { formatDecimalForDbRequired, splitAmount, centsToDecimalString } from "@/lib/utils/currency";

const otherExpenseSchema = z.object({
  veiculoId: uuidSchema("Veículo"),
  name: z.string().min(1, "O nome não pode ser vazio."),
  amount: z.number().positive("O valor deve ser positivo."),
  date: z.string().refine((val) => !isNaN(Date.parse(val)), "Data inválida"),
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

// POST /api/veiculos/outros
export async function POST(request: Request) {
  try {
    const { user, error, status } = await authenticateRequest(request);
    if (error || !user) {
      return handleAuthError(error || "User not found", status);
    }

    const body = await request.json();
    const validation = otherExpenseSchema.safeParse(body);

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

    // Naming convention logic
    let finalName = data.name;
    const prefix = `Outros - ${vehicle.name} - `;
    if (!finalName.startsWith("Outros - ")) {
      finalName = `${prefix}${finalName}`;
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
    const totalCents = Math.round(data.amount * 100);
    const amounts = isParcelado
      ? splitAmount(totalCents, installmentTotal)
      : [totalCents];

    const result = await db.transaction(async (tx) => {
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
            name: `${finalName}${
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
      }

      return { lancamentos: createdLancamentos };
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
