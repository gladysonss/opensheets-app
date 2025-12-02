import { db } from "@/lib/db";
import { getUser } from "@/lib/auth/server";
import { veiculos, abastecimentos } from "@/db/schema";
import { eq, desc, and } from "drizzle-orm";

export async function getVehicles() {
  const user = await getUser();

  const data = await db.query.veiculos.findMany({
    where: eq(veiculos.userId, user.id),
    orderBy: [desc(veiculos.createdAt)],
  });

  return data;
}

export async function getVehicleById(id: string) {
  const user = await getUser();

  const data = await db.query.veiculos.findFirst({
    where: and(eq(veiculos.id, id), eq(veiculos.userId, user.id)),
    with: {
      abastecimentos: {
        orderBy: [desc(abastecimentos.date)],
        limit: 50,
      },
      lancamentos: {
        orderBy: (lancamentos, { desc }) => [desc(lancamentos.purchaseDate)],
        limit: 50,
      },
    },
  });

  return data;
}
