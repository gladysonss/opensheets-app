"use server";

import { userUpdateLog } from "@/db/schema";
import { successResult, type ActionResult } from "@/lib/actions/types";
import { getUser } from "@/lib/auth/server";
import { db } from "@/lib/db";
import { and, eq } from "drizzle-orm";
import { handleActionError } from "../actions/helpers";

export async function markUpdateAsRead(
  updateId: string
): Promise<ActionResult> {
  try {
    const user = await getUser();

    // Check if already marked as read
    const existing = await db
      .select()
      .from(userUpdateLog)
      .where(
        and(
          eq(userUpdateLog.userId, user.id),
          eq(userUpdateLog.updateId, updateId)
        )
      )
      .limit(1);

    if (existing.length > 0) {
      return successResult("Já marcado como lido");
    }

    await db.insert(userUpdateLog).values({
      userId: user.id,
      updateId,
    });

    return successResult("Marcado como lido");
  } catch (error) {
    return handleActionError(error);
  }
}

export async function markAllUpdatesAsRead(
  updateIds: string[]
): Promise<ActionResult> {
  try {
    const user = await getUser();

    // Get existing read updates
    const existing = await db
      .select()
      .from(userUpdateLog)
      .where(eq(userUpdateLog.userId, user.id));

    const existingIds = new Set(existing.map((log) => log.updateId));

    // Filter out already read updates
    const newUpdateIds = updateIds.filter((id) => !existingIds.has(id));

    if (newUpdateIds.length === 0) {
      return successResult("Todos já marcados como lidos");
    }

    // Insert new read logs
    await db.insert(userUpdateLog).values(
      newUpdateIds.map((updateId) => ({
        userId: user.id,
        updateId,
      }))
    );

    return successResult("Todas as atualizações marcadas como lidas");
  } catch (error) {
    return handleActionError(error);
  }
}
