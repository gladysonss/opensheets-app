import { lancamentos, pagadorShares, user as usersTable } from "@/db/schema";
import { db } from "@/lib/db";
import { and, desc, eq, type SQL } from "drizzle-orm";

export type ShareData = {
  id: string;
  userId: string;
  name: string;
  email: string;
  createdAt: string;
};

export async function fetchPagadorShares(
  pagadorId: string
): Promise<ShareData[]> {
  const shareRows = await db
    .select({
      id: pagadorShares.id,
      sharedWithUserId: pagadorShares.sharedWithUserId,
      createdAt: pagadorShares.createdAt,
      userName: usersTable.name,
      userEmail: usersTable.email,
    })
    .from(pagadorShares)
    .innerJoin(
      usersTable,
      eq(pagadorShares.sharedWithUserId, usersTable.id)
    )
    .where(eq(pagadorShares.pagadorId, pagadorId));

  return shareRows.map((share) => ({
    id: share.id,
    userId: share.sharedWithUserId,
    name: share.userName ?? "Usuário",
    email: share.userEmail ?? "email não informado",
    createdAt: share.createdAt?.toISOString() ?? new Date().toISOString(),
  }));
}

export async function fetchPagadorLancamentos(filters: SQL[]) {
  const lancamentoRows = await db.query.lancamentos.findMany({
    where: and(...filters),
    with: {
      pagador: true,
      conta: true,
      cartao: true,
      categoria: true,
    },
    orderBy: desc(lancamentos.purchaseDate),
  });

  return lancamentoRows;
}
