import { db } from "@/lib/db";
import { getUser } from "@/lib/auth/server";
import { veiculos, abastecimentos, manutencoes } from "@/db/schema";
import { eq, desc, and } from "drizzle-orm";

export async function getVehicles() {
  const user = await getUser();

  const data = await db.query.veiculos.findMany({
    where: eq(veiculos.userId, user.id),
    orderBy: [desc(veiculos.createdAt)],
    with: {
      abastecimentos: {
        orderBy: [desc(abastecimentos.date)],
        limit: 1,
      },
      manutencoes: {
        orderBy: [desc(manutencoes.date)],
        limit: 5,
      },
    },
  });

  return data;
}

export async function getVehicleById(id: string, period?: Date) {
  const user = await getUser();

  let startOfMonth: Date | undefined;
  let endOfMonth: Date | undefined;

  if (period) {
    startOfMonth = new Date(period.getFullYear(), period.getMonth(), 1);
    endOfMonth = new Date(period.getFullYear(), period.getMonth() + 1, 0);
    endOfMonth.setHours(23, 59, 59, 999);
  }

  const data = await db.query.veiculos.findFirst({
    where: and(eq(veiculos.id, id), eq(veiculos.userId, user.id)),
    with: {
      abastecimentos: {
        where: (abastecimentos, { and, gte, lte }) => 
          period 
            ? and(
                gte(abastecimentos.date, startOfMonth!),
                lte(abastecimentos.date, endOfMonth!)
              )
            : undefined,
        orderBy: [desc(abastecimentos.date)],
        limit: 50,
      },
      lancamentos: {
        where: (lancamentos, { and, gte, lte }) => 
          period 
            ? and(
                gte(lancamentos.purchaseDate, startOfMonth!),
                lte(lancamentos.purchaseDate, endOfMonth!)
              )
            : undefined,
        orderBy: (lancamentos, { desc }) => [desc(lancamentos.purchaseDate)],
        limit: 50,
      },
      manutencoes: {
        where: (manutencoes, { and, gte, lte }) => 
          period 
            ? and(
                gte(manutencoes.date, startOfMonth!),
                lte(manutencoes.date, endOfMonth!)
              )
            : undefined,
        orderBy: [desc(manutencoes.date)],
        limit: 50,
      },
    },
  });

  return data;
}
