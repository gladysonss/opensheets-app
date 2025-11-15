import { lancamentos, pagadores, cartoes, contas } from "@/db/schema";
import { ACCOUNT_AUTO_INVOICE_NOTE_PREFIX, INITIAL_BALANCE_NOTE } from "@/lib/accounts/constants";
import { PAGADOR_ROLE_ADMIN } from "@/lib/pagadores/constants";
import { db } from "@/lib/db";
import { eq, and, sql, desc, or, isNull } from "drizzle-orm";
import { toNumber } from "@/lib/dashboard/common";

export type RecentTransaction = {
  id: string;
  name: string;
  amount: number;
  purchaseDate: Date;
  cardLogo: string | null;
  accountLogo: string | null;
};

export type RecentTransactionsData = {
  transactions: RecentTransaction[];
};

export async function fetchRecentTransactions(
  userId: string,
  period: string
): Promise<RecentTransactionsData> {
  const results = await db
    .select({
      id: lancamentos.id,
      name: lancamentos.name,
      amount: lancamentos.amount,
      purchaseDate: lancamentos.purchaseDate,
      cardLogo: cartoes.logo,
      accountLogo: contas.logo,
      note: lancamentos.note,
    })
    .from(lancamentos)
    .innerJoin(pagadores, eq(lancamentos.pagadorId, pagadores.id))
    .leftJoin(cartoes, eq(lancamentos.cartaoId, cartoes.id))
    .leftJoin(contas, eq(lancamentos.contaId, contas.id))
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
    .orderBy(desc(lancamentos.purchaseDate), desc(lancamentos.createdAt))
    .limit(5);

  const transactions = results.map((row): RecentTransaction => {
    return {
      id: row.id,
      name: row.name,
      amount: Math.abs(toNumber(row.amount)),
      purchaseDate: row.purchaseDate,
      cardLogo: row.cardLogo,
      accountLogo: row.accountLogo,
    };
  });

  return {
    transactions,
  };
}
