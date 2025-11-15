import { lancamentos, pagadores } from "@/db/schema";
import { ACCOUNT_AUTO_INVOICE_NOTE_PREFIX } from "@/lib/accounts/constants";
import { db } from "@/lib/db";
import { toNumber } from "@/lib/dashboard/common";
import { eq, and, sql } from "drizzle-orm";

export type PaymentStatusCategory = {
  total: number;
  confirmed: number;
  pending: number;
};

export type PaymentStatusData = {
  income: PaymentStatusCategory;
  expenses: PaymentStatusCategory;
};

export async function fetchPaymentStatus(
  userId: string,
  period: string
): Promise<PaymentStatusData> {
  // Busca receitas confirmadas e pendentes para o período do pagador admin
  // Exclui lançamentos de pagamento de fatura (para evitar contagem duplicada)
  const incomeResult = await db
    .select({
      confirmed: sql<number>`
        coalesce(
          sum(
            case
              when ${lancamentos.isSettled} = true then ${lancamentos.amount}
              else 0
            end
          ),
          0
        )
      `,
      pending: sql<number>`
        coalesce(
          sum(
            case
              when ${lancamentos.isSettled} = false or ${lancamentos.isSettled} is null then ${lancamentos.amount}
              else 0
            end
          ),
          0
        )
      `,
    })
    .from(lancamentos)
    .innerJoin(pagadores, eq(lancamentos.pagadorId, pagadores.id))
    .where(
      and(
        eq(lancamentos.userId, userId),
        eq(lancamentos.period, period),
        eq(lancamentos.transactionType, "Receita"),
        eq(pagadores.role, "admin"),
        sql`(${lancamentos.note} IS NULL OR ${lancamentos.note} NOT LIKE ${`${ACCOUNT_AUTO_INVOICE_NOTE_PREFIX}%`})`
      )
    );

  // Busca despesas confirmadas e pendentes para o período do pagador admin
  // Exclui lançamentos de pagamento de fatura (para evitar contagem duplicada)
  const expensesResult = await db
    .select({
      confirmed: sql<number>`
        coalesce(
          sum(
            case
              when ${lancamentos.isSettled} = true then ${lancamentos.amount}
              else 0
            end
          ),
          0
        )
      `,
      pending: sql<number>`
        coalesce(
          sum(
            case
              when ${lancamentos.isSettled} = false or ${lancamentos.isSettled} is null then ${lancamentos.amount}
              else 0
            end
          ),
          0
        )
      `,
    })
    .from(lancamentos)
    .innerJoin(pagadores, eq(lancamentos.pagadorId, pagadores.id))
    .where(
      and(
        eq(lancamentos.userId, userId),
        eq(lancamentos.period, period),
        eq(lancamentos.transactionType, "Despesa"),
        eq(pagadores.role, "admin"),
        sql`(${lancamentos.note} IS NULL OR ${lancamentos.note} NOT LIKE ${`${ACCOUNT_AUTO_INVOICE_NOTE_PREFIX}%`})`
      )
    );

  const incomeData = incomeResult[0] ?? { confirmed: 0, pending: 0 };
  const confirmedIncome = toNumber(incomeData.confirmed);
  const pendingIncome = toNumber(incomeData.pending);

  const expensesData = expensesResult[0] ?? { confirmed: 0, pending: 0 };
  const confirmedExpenses = toNumber(expensesData.confirmed);
  const pendingExpenses = toNumber(expensesData.pending);

  return {
    income: {
      total: confirmedIncome + pendingIncome,
      confirmed: confirmedIncome,
      pending: pendingIncome,
    },
    expenses: {
      total: confirmedExpenses + pendingExpenses,
      confirmed: confirmedExpenses,
      pending: pendingExpenses,
    },
  };
}
