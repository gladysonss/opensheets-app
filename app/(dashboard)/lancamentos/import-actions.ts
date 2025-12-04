"use server";

import { contas, lancamentos } from "@/db/schema";
import {
  INITIAL_BALANCE_CONDITION,
  INITIAL_BALANCE_NOTE,
  INITIAL_BALANCE_PAYMENT_METHOD,
  INITIAL_BALANCE_TRANSACTION_TYPE,
} from "@/lib/accounts/constants";
import { handleActionError, revalidateForEntity } from "@/lib/actions/helpers";
import type { ActionResult } from "@/lib/actions/types";
import { getUser } from "@/lib/auth/server";
import { db } from "@/lib/db";
import {
  LANCAMENTO_CONDITIONS,
  LANCAMENTO_PAYMENT_METHODS,
  LANCAMENTO_TRANSACTION_TYPES,
} from "@/lib/lancamentos/constants";
import { buildEntriesByPagador, sendPagadorAutoEmails } from "@/lib/pagadores/notifications";
import { formatDecimalForDbRequired, splitAmount } from "@/lib/utils/currency";
import {
  addMonthsToDate,
  addMonthsToPeriod,
  getTodayDate,
  parseLocalDateString,
} from "@/lib/utils/date";
import { and, eq, ilike, or } from "drizzle-orm";
import { randomUUID } from "node:crypto";
import { z } from "zod";

// Schema for a single import row
const importRowSchema = z.object({
  date: z.string().trim(),
  period: z.string().trim().optional(),
  description: z.string().trim().min(1, "Descrição é obrigatória"),
  amount: z.number().min(0, "Valor deve ser positivo"),
  type: z.enum(LANCAMENTO_TRANSACTION_TYPES, {
    errorMap: () => ({ message: "Tipo inválido (Despesa, Receita, Transferência)" }),
  }),
  category: z.string().trim().optional(),
  pagador: z.string().trim().optional(),
  paymentMethod: z.enum(LANCAMENTO_PAYMENT_METHODS, {
    errorMap: () => ({ message: "Forma de pagamento inválida" }),
  }).optional(),
  card: z.string().trim().optional(),
  account: z.string().trim().optional(),
  condition: z.enum(LANCAMENTO_CONDITIONS, {
    errorMap: () => ({ message: "Condição inválida" }),
  }).optional(),
  installments: z.number().int().optional(),
  note: z.string().trim().optional(),
  dueDate: z.string().trim().optional(),
});

export type ImportRowInput = z.infer<typeof importRowSchema>;

const resolvePeriod = (purchaseDate: string, period?: string | null) => {
  if (period && /^\d{4}-\d{2}$/.test(period)) {
    return period;
  }
  const date = parseLocalDateString(purchaseDate);
  if (Number.isNaN(date.getTime())) {
    throw new Error("Data inválida para resolução de período.");
  }
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  return `${year}-${month}`;
};

const centsToDecimalString = (value: number) => {
  const decimal = value / 100;
  const formatted = decimal.toFixed(2);
  return Object.is(decimal, -0) ? "0.00" : formatted;
};

// Helper to resolve IDs by name (case-insensitive)
async function resolveIds(
  userId: string,
  names: {
    category?: string;
    pagador?: string;
    card?: string;
    account?: string;
  }
) {
  const results: {
    categoriaId?: string;
    pagadorId?: string;
    cartaoId?: string;
    contaId?: string;
  } = {};

  // Debug logging
  console.log("Resolving IDs for:", names);

  if (names.category) {
    const cat = await db.query.categorias.findFirst({
      where: (t, { and, eq, ilike }) =>
        and(eq(t.userId, userId), ilike(t.name, names.category!)),
    });
    if (cat) results.categoriaId = cat.id;
  }

  if (names.pagador) {
    const pag = await db.query.pagadores.findFirst({
      where: (t, { and, eq, ilike }) =>
        and(eq(t.userId, userId), ilike(t.name, names.pagador!)),
    });
    if (pag) results.pagadorId = pag.id;
  }

  if (names.card) {
    const card = await db.query.cartoes.findFirst({
      where: (t, { and, eq, ilike }) =>
        and(eq(t.userId, userId), ilike(t.name, names.card!)),
    });
    if (card) results.cartaoId = card.id;
  }

  if (names.account) {
    console.log(`Searching account: "${names.account}" for user: ${userId}`);
    const acc = await db.query.contas.findFirst({
      where: (t, { and, eq, ilike }) =>
        and(eq(t.userId, userId), ilike(t.name, names.account!)),
    });
    console.log("Found account:", acc);
    if (acc) results.contaId = acc.id;
  }

  return results;
}

export async function importLancamentosAction(
  rows: ImportRowInput[]
): Promise<ActionResult> {
  try {
    const user = await getUser();
    const recordsToInsert: (typeof lancamentos.$inferInsert)[] = [];

    // Pre-fetch or resolve IDs could be optimized, but loop is fine for reasonable batch sizes
    for (const row of rows) {
      // Validate row
      const data = importRowSchema.parse(row);
      console.log("Processing row:", data);

      // Additional validation
      if (data.condition === "Parcelado") {
        if (!data.installments || data.installments < 2) {
          throw new Error(
            `Item "${data.description}": Parcelado requer total de parcelas >= 2.`
          );
        }
      }

      // Resolve IDs
      const ids = await resolveIds(user.id, {
        category: data.category,
        pagador: data.pagador,
        card: data.card,
        account: data.account,
      });

      // Specific validations for payment methods
      if (data.paymentMethod === "Cartão de débito") {
        if (!data.account) {
           throw new Error(`Item "${data.description}": Cartão de débito requer uma conta. Verifique se a coluna 'Conta' está preenchida no arquivo.`);
        }
        if (!ids.contaId) {
          throw new Error(
            `Item "${data.description}": A conta "${data.account}" não foi encontrada no sistema. Verifique a ortografia em Cadastros > Contas.`
          );
        }
      }

      if (data.paymentMethod === "Boleto" && !data.dueDate) {
        throw new Error(
          `Item "${data.description}": Boleto requer uma data de vencimento (coluna 'Vencimento').`
        );
      }

      // Prepare logic vars
      const purchaseDate = parseLocalDateString(data.date);
      const period = resolvePeriod(data.date, data.period);
      const amountSign = data.type === "Despesa" ? -1 : 1;
      const totalCents = Math.round(Math.abs(data.amount) * 100);
      
      // Default payment method if missing? Or error?
      // User didn't specify it's mandatory, but DB might require it.
      // Schema says paymentMethod is text not null.
      // We'll assume "Outros" or fail if not mapped.
      // Let's use the provided one or default to "Dinheiro" if not provided?
      // Better to require it or default to something safe.
      const paymentMethod = data.paymentMethod ?? "Dinheiro";
      
      const condition = data.condition ?? "À vista";
      
      // Logic from createLancamentoAction (simplified for import)
      // We assume no "Split" for now unless we want to support it (complexity).
      // Import usually implies single payer.
      
      const basePayload = {
        name: data.description,
        transactionType: data.type,
        condition,
        paymentMethod,
        note: data.note ?? null,
        contaId: ids.contaId ?? null,
        cartaoId: ids.cartaoId ?? null,
        categoriaId: ids.categoriaId ?? null,
        pagadorId: ids.pagadorId ?? null,
        userId: user.id,
        isDivided: false,
        seriesId: (condition === "Parcelado" || condition === "Recorrente") ? randomUUID() : null,
      };

      const shouldNullifySettled = paymentMethod === "Cartão de crédito";
      // For import, we assume "isSettled" is false unless we add a column for it.
      const isSettled = false;

      const dueDate = data.paymentMethod === "Boleto" && data.dueDate 
        ? parseLocalDateString(data.dueDate) 
        : null;

      if (condition === "Parcelado") {
        const installmentTotal = data.installments!;
        const installmentAmount = splitAmount(totalCents, installmentTotal); // returns array

        for (let i = 0; i < installmentTotal; i++) {
          const instPeriod = addMonthsToPeriod(period, i);
          const instDate = addMonthsToDate(purchaseDate, i);
          
          recordsToInsert.push({
            ...basePayload,
            amount: centsToDecimalString(installmentAmount[i] * amountSign),
            purchaseDate: instDate,
            period: instPeriod,
            isSettled: false, // Installments usually future
            installmentCount: installmentTotal,
            currentInstallment: i + 1,
            recurrenceCount: null,
            dueDate: null, // We don't have due date in import yet for installments
            boletoPaymentDate: null,
          });
        }
      } else if (condition === "Recorrente") {
         // Handle Recorrente (Multiple entries, full amount)
         // If installments > 1, generate multiple entries
         const recurrenceTotal = (data.installments && data.installments > 1) ? data.installments : 1;

         for (let i = 0; i < recurrenceTotal; i++) {
            const recurrencePeriod = addMonthsToPeriod(period, i);
            const recurrenceDate = addMonthsToDate(purchaseDate, i);
            
            // Recorrente uses the FULL amount for each entry
            const amountCents = Math.round(Math.abs(data.amount) * 100);
            const normalizedAmount = centsToDecimalString(amountCents * amountSign);

            recordsToInsert.push({
              ...basePayload,
              amount: normalizedAmount,
              purchaseDate: recurrenceDate,
              period: recurrencePeriod,
              isSettled,
              installmentCount: null,
              currentInstallment: null,
              recurrenceCount: recurrenceTotal,
              dueDate: null,
              boletoPaymentDate: null,
            });
         }
      } else {
        // À vista
        recordsToInsert.push({
          ...basePayload,
          amount: centsToDecimalString(totalCents * amountSign),
          purchaseDate,
          period,
          isSettled,
          installmentCount: null,
          currentInstallment: null,
          recurrenceCount: null,
          dueDate: dueDate,
          boletoPaymentDate: null,
        });
      }
    }

    if (recordsToInsert.length === 0) {
      return { success: false, error: "Nenhum registro válido para importar." };
    }

    await db.transaction(async (tx) => {
      await tx.insert(lancamentos).values(recordsToInsert);
    });

    // Notifications (simplified - maybe skip for bulk import to avoid spam?)
    // If we want notifications, we need to group by pagador.
    // Let's skip for now to keep it fast.

    revalidateForEntity("lancamentos");

    const count = recordsToInsert.length;
    const installments = recordsToInsert.filter(r => r.condition === "Parcelado").length;
    const single = count - installments;

    return {
      success: true,
      message: `Importação concluída! ${count} lançamentos criados (${single} à vista/recorrente, ${installments} parcelas).`,
    };
  } catch (error) {
    return handleActionError(error);
  }
}
