import {
  pagadores,
  pagadorShares,
  user as usersTable,
} from "@/db/schema";
import { db } from "@/lib/db";
import { and, eq } from "drizzle-orm";

export type PagadorWithAccess = typeof pagadores.$inferSelect & {
  canEdit: boolean;
  sharedByName: string | null;
  sharedByEmail: string | null;
  shareId: string | null;
};

export async function fetchPagadoresWithAccess(
  userId: string
): Promise<PagadorWithAccess[]> {
  const [owned, shared] = await Promise.all([
    db
      .select()
      .from(pagadores)
      .where(eq(pagadores.userId, userId)),
    db
      .select({
        shareId: pagadorShares.id,
        pagador: pagadores,
        ownerName: usersTable.name,
        ownerEmail: usersTable.email,
      })
      .from(pagadorShares)
      .innerJoin(
        pagadores,
        eq(pagadorShares.pagadorId, pagadores.id)
      )
      .leftJoin(
        usersTable,
        eq(pagadores.userId, usersTable.id)
      )
      .where(eq(pagadorShares.sharedWithUserId, userId)),
  ]);

  const ownedMapped: PagadorWithAccess[] = owned.map((item) => ({
    ...item,
    canEdit: true,
    sharedByName: null,
    sharedByEmail: null,
    shareId: null,
  }));

  const sharedMapped: PagadorWithAccess[] = shared.map((item) => ({
    ...item.pagador,
    shareCode: null,
    canEdit: false,
    sharedByName: item.ownerName ?? null,
    sharedByEmail: item.ownerEmail ?? null,
    shareId: item.shareId,
  }));

  return [...ownedMapped, ...sharedMapped];
}

export async function getPagadorAccess(
  userId: string,
  pagadorId: string
) {
  const pagador = await db.query.pagadores.findFirst({
    where: and(eq(pagadores.id, pagadorId)),
  });

  if (!pagador) {
    return null;
  }

  if (pagador.userId === userId) {
    return {
      pagador,
      canEdit: true,
      share: null as typeof pagadorShares.$inferSelect | null,
    };
  }

  const share = await db.query.pagadorShares.findFirst({
    where: and(
      eq(pagadorShares.pagadorId, pagadorId),
      eq(pagadorShares.sharedWithUserId, userId)
    ),
  });

  if (!share) {
    return null;
  }

  return { pagador, canEdit: false, share };
}

export async function userCanEditPagador(
  userId: string,
  pagadorId: string
) {
  const pagadorRow = await db.query.pagadores.findFirst({
    columns: { id: true },
    where: and(eq(pagadores.id, pagadorId), eq(pagadores.userId, userId)),
  });

  return Boolean(pagadorRow);
}

export async function userHasPagadorAccess(
  userId: string,
  pagadorId: string
) {
  const access = await getPagadorAccess(userId, pagadorId);
  return Boolean(access);
}