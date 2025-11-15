import { cartoes, contas, lancamentos, pagadores } from "@/db/schema";
import {
  ACCOUNT_AUTO_INVOICE_NOTE_PREFIX,
  INITIAL_BALANCE_NOTE,
} from "@/lib/accounts/constants";
import { db } from "@/lib/db";
import { PAGADOR_ROLE_ADMIN } from "@/lib/pagadores/constants";
import { and, asc, eq, isNull, or, sql } from "drizzle-orm";
import { toNumber } from "@/lib/dashboard/common";

export type TopExpense = {
  id: string;
  name: string;
  amount: number;
  purchaseDate: Date;
  paymentMethod: string;
  logo?: string | null;
};

export type TopExpensesData = {
  expenses: TopExpense[];
};

export async function fetchTopExpenses(
  userId: string,
  period: string,
  cardOnly: boolean = false
): Promise<TopExpensesData> {
  const conditions = [
    eq(lancamentos.userId, userId),
    eq(lancamentos.period, period),
    eq(lancamentos.transactionType, "Despesa"),
    eq(pagadores.role, PAGADOR_ROLE_ADMIN),
    or(
      isNull(lancamentos.note),
      and(
        sql`${lancamentos.note} != ${INITIAL_BALANCE_NOTE}`,
        sql`${
          lancamentos.note
        } NOT LIKE ${`${ACCOUNT_AUTO_INVOICE_NOTE_PREFIX}%`}`
      )
    ),
  ];

  // Se cardOnly for true, filtra apenas pagamentos com cartão
  if (cardOnly) {
    conditions.push(eq(lancamentos.paymentMethod, "Cartão de Crédito"));
  }

  const results = await db
    .select({
      id: lancamentos.id,
      name: lancamentos.name,
      amount: lancamentos.amount,
      purchaseDate: lancamentos.purchaseDate,
      paymentMethod: lancamentos.paymentMethod,
      cartaoId: lancamentos.cartaoId,
      contaId: lancamentos.contaId,
      cardLogo: cartoes.logo,
      accountLogo: contas.logo,
    })
    .from(lancamentos)
    .innerJoin(pagadores, eq(lancamentos.pagadorId, pagadores.id))
    .leftJoin(cartoes, eq(lancamentos.cartaoId, cartoes.id))
    .leftJoin(contas, eq(lancamentos.contaId, contas.id))
    .where(and(...conditions))
    .orderBy(asc(lancamentos.amount))
    .limit(10);

  const expenses = results.map(
    (row): TopExpense => ({
      id: row.id,
      name: row.name,
      amount: Math.abs(toNumber(row.amount)),
      purchaseDate: row.purchaseDate,
      paymentMethod: row.paymentMethod,
      logo: row.cardLogo ?? row.accountLogo ?? null,
    })
  );

  return {
    expenses,
  };
}
