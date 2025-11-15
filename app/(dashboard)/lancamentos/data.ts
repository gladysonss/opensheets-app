import { lancamentos } from "@/db/schema";
import { db } from "@/lib/db";
import { and, desc, type SQL } from "drizzle-orm";

export async function fetchLancamentos(filters: SQL[]) {
  const lancamentoRows = await db.query.lancamentos.findMany({
    where: and(...filters),
    with: {
      pagador: true,
      conta: true,
      cartao: true,
      categoria: true,
    },
    orderBy: [desc(lancamentos.purchaseDate), desc(lancamentos.createdAt)],
  });

  return lancamentoRows;
}
