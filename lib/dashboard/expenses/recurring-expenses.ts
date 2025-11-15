import { lancamentos, pagadores } from "@/db/schema";
import {
  ACCOUNT_AUTO_INVOICE_NOTE_PREFIX,
  INITIAL_BALANCE_NOTE,
} from "@/lib/accounts/constants";
import { PAGADOR_ROLE_ADMIN } from "@/lib/pagadores/constants";
import { db } from "@/lib/db";
import { toNumber } from "@/lib/dashboard/common";
import { and, desc, eq, isNull, or, sql } from "drizzle-orm";

export type RecurringExpense = {
  id: string;
  name: string;
  amount: number;
  paymentMethod: string;
  recurrenceCount: number | null;
};

export type RecurringExpensesData = {
  expenses: RecurringExpense[];
};

export async function fetchRecurringExpenses(
  userId: string,
  period: string
): Promise<RecurringExpensesData> {
  const results = await db
    .select({
      id: lancamentos.id,
      name: lancamentos.name,
      amount: lancamentos.amount,
      paymentMethod: lancamentos.paymentMethod,
      recurrenceCount: lancamentos.recurrenceCount,
    })
    .from(lancamentos)
    .innerJoin(pagadores, eq(lancamentos.pagadorId, pagadores.id))
    .where(
      and(
        eq(lancamentos.userId, userId),
        eq(lancamentos.period, period),
        eq(lancamentos.transactionType, "Despesa"),
        eq(lancamentos.condition, "Recorrente"),
        eq(pagadores.role, PAGADOR_ROLE_ADMIN),
        or(
          isNull(lancamentos.note),
          and(
            sql`${lancamentos.note} != ${INITIAL_BALANCE_NOTE}`,
            sql`${lancamentos.note} NOT LIKE ${`${ACCOUNT_AUTO_INVOICE_NOTE_PREFIX}%`}`
          )
        )
      )
    )
    .orderBy(desc(lancamentos.purchaseDate), desc(lancamentos.createdAt));

  const expenses = results.map((row): RecurringExpense => ({
    id: row.id,
    name: row.name,
    amount: Math.abs(toNumber(row.amount)),
    paymentMethod: row.paymentMethod,
    recurrenceCount: row.recurrenceCount,
  }));

  return {
    expenses,
  };
}
