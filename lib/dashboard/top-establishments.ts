import { cartoes, contas, lancamentos, pagadores } from "@/db/schema";
import {
  ACCOUNT_AUTO_INVOICE_NOTE_PREFIX,
  INITIAL_BALANCE_NOTE,
} from "@/lib/accounts/constants";
import { db } from "@/lib/db";
import { PAGADOR_ROLE_ADMIN } from "@/lib/pagadores/constants";
import { toNumber } from "@/lib/dashboard/common";
import { and, eq, isNull, or, sql } from "drizzle-orm";

export type TopEstablishment = {
  id: string;
  name: string;
  amount: number;
  occurrences: number;
  logo: string | null;
};

export type TopEstablishmentsData = {
  establishments: TopEstablishment[];
};

const shouldIncludeEstablishment = (name: string) => {
  const normalized = name.trim().toLowerCase();

  if (normalized === "saldo inicial") {
    return false;
  }

  if (normalized.includes("fatura")) {
    return false;
  }

  return true;
};

export async function fetchTopEstablishments(
  userId: string,
  period: string
): Promise<TopEstablishmentsData> {
  const rows = await db
    .select({
      name: lancamentos.name,
      totalAmount: sql<number>`coalesce(sum(${lancamentos.amount}), 0)`,
      occurrences: sql<number>`count(${lancamentos.id})`,
      logo: sql<string | null>`max(coalesce(${cartoes.logo}, ${contas.logo}))`,
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
    .groupBy(lancamentos.name)
    .orderBy(sql`ABS(sum(${lancamentos.amount})) DESC`)
    .limit(10);

  const establishments = rows
    .filter((row) => shouldIncludeEstablishment(row.name))
    .map(
      (row): TopEstablishment => ({
        id: row.name,
        name: row.name,
        amount: Math.abs(toNumber(row.totalAmount)),
        occurrences: Number(row.occurrences ?? 0),
        logo: row.logo ?? null,
      })
    );

  return {
    establishments,
  };
}
