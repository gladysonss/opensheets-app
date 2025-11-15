import { lancamentos, pagadores } from "@/db/schema";
import {
  ACCOUNT_AUTO_INVOICE_NOTE_PREFIX,
  INITIAL_BALANCE_NOTE,
} from "@/lib/accounts/constants";
import { PAGADOR_ROLE_ADMIN } from "@/lib/pagadores/constants";
import { db } from "@/lib/db";
import { toNumber } from "@/lib/dashboard/common";
import { and, eq, isNull, or, sql } from "drizzle-orm";

export type PaymentConditionSummary = {
  condition: string;
  amount: number;
  percentage: number;
  transactions: number;
};

export type PaymentConditionsData = {
  conditions: PaymentConditionSummary[];
};

export async function fetchPaymentConditions(
  userId: string,
  period: string
): Promise<PaymentConditionsData> {
  const rows = await db
    .select({
      condition: lancamentos.condition,
      totalAmount: sql<number>`coalesce(sum(${lancamentos.amount}), 0)`,
      transactions: sql<number>`count(${lancamentos.id})`,
    })
    .from(lancamentos)
    .innerJoin(pagadores, eq(lancamentos.pagadorId, pagadores.id))
    .where(
      and(
        eq(lancamentos.userId, userId),
        eq(lancamentos.period, period),
        eq(lancamentos.transactionType, "Despesa"),
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
    .groupBy(lancamentos.condition);

  const summaries = rows.map((row) => {
    const totalAmount = Math.abs(toNumber(row.totalAmount));
    const transactions = Number(row.transactions ?? 0);

    return {
      condition: row.condition,
      amount: totalAmount,
      transactions,
    };
  });

  const overallTotal = summaries.reduce((acc, item) => acc + item.amount, 0);

  const conditions = summaries
    .map((item) => ({
      condition: item.condition,
      amount: item.amount,
      transactions: item.transactions,
      percentage:
        overallTotal > 0
          ? Number(((item.amount / overallTotal) * 100).toFixed(2))
          : 0,
    }))
    .sort((a, b) => b.amount - a.amount);

  return {
    conditions,
  };
}
