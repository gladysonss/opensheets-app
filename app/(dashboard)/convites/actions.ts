"use server";

import { db, schema } from "@/lib/db";
import { getUserSession } from "@/lib/auth/server";
import { revalidatePath } from "next/cache";
import { eq, desc } from "drizzle-orm";
import { randomBytes } from "crypto";

export async function getInvites() {
  const session = await getUserSession();
  if (!session?.user) throw new Error("Unauthorized");

  // Opcional: Verificar se é admin
  // if (session.user.role !== 'admin') throw new Error("Forbidden");

  const invites = await db.query.invitations.findMany({
    orderBy: [desc(schema.invitations.createdAt)],
  });

  return invites.map((invite) => ({
    ...invite,
    status: invite.usedAt
      ? "used"
      : new Date(invite.expiresAt) < new Date()
      ? "expired"
      : "active",
  }));
}

export async function createInvite(email: string) {
  const session = await getUserSession();
  if (!session?.user) throw new Error("Unauthorized");

  // Generates a random token
  const token = randomBytes(24).toString("hex");

  // Expires in 7 days
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7);

  await db.insert(schema.invitations).values({
    email,
    token,
    createdBy: session.user.email || session.user.id,
    expiresAt,
  });

  revalidatePath("/convites");
  return { success: true, token };
}

export async function deleteInvite(id: string) {
  const session = await getUserSession();
  if (!session?.user) throw new Error("Unauthorized");

  await db.delete(schema.invitations).where(eq(schema.invitations.id, id));

  revalidatePath("/convites");
  return { success: true };
}

export async function getInviteByToken(token: string) {
  // 1. Busca apenas pelo token
  const invite = await db.query.invitations.findFirst({
    where: (invitations, { eq }) => eq(invitations.token, token),
  });

  if (!invite) return null; // Token não existe

  // 2. Valida expiração
  if (new Date(invite.expiresAt) < new Date()) {
    console.log("[DEBUG] Invite expired:", invite.expiresAt);
    return null; 
  }

  // 3. Valida se já foi usado
  if (invite.usedAt) {
    console.log("[DEBUG] Invite already used:", invite.usedAt);
    return null;
  }

  return { email: invite.email };
}
