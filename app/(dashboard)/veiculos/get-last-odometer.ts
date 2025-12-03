"use server";

import { db } from "@/lib/db";
import { abastecimentos, manutencoes } from "@/db/schema";
import { eq, desc, sql } from "drizzle-orm";

export async function getLastOdometerAction(vehicleId: string) {
  try {
    // Get max odometer from refueling
    const maxRefueling = await db
      .select({ odometer: sql<number>`MAX(${abastecimentos.odometer})` })
      .from(abastecimentos)
      .where(eq(abastecimentos.veiculoId, vehicleId))
      .then((res: { odometer: number }[]) => res[0]?.odometer || 0);

    // Get max odometer from maintenance
    const maxMaintenance = await db
      .select({ odometer: sql<number>`MAX(${manutencoes.odometer})` })
      .from(manutencoes)
      .where(eq(manutencoes.veiculoId, vehicleId))
      .then((res: { odometer: number }[]) => res[0]?.odometer || 0);

    return Math.max(maxRefueling, maxMaintenance);
  } catch (error) {
    console.error("Error getting last odometer:", error);
    return 0;
  }
}
