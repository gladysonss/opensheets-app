import { db } from "@/lib/db";
import { getUser } from "@/lib/auth/server";
import { veiculos, abastecimentos, manutencoes } from "@/db/schema";
import { eq, desc, and } from "drizzle-orm";
import { fetchAccountsForUser } from "../contas/data";
import { fetchCardsForUser } from "../cartoes/data";
import { fetchPagadoresWithAccess } from "@/lib/pagadores/access";
import { fetchCategoriesForUser } from "../categorias/data";

export async function getContas() {
  const user = await getUser();
  const { accounts } = await fetchAccountsForUser(user.id);
  return accounts;
}

export async function getCartoes() {
  const user = await getUser();
  const { cards } = await fetchCardsForUser(user.id);
  return cards;
}

export async function getPagadores() {
  const user = await getUser();
  const pagadores = await fetchPagadoresWithAccess(user.id);
  return pagadores;
}

export async function getCategories() {
  const user = await getUser();
  const categories = await fetchCategoriesForUser(user.id);
  return categories;
}

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

export async function getVehicleById(id: string, startDate: Date, endDate: Date) {
  const user = await getUser();

  const data = await db.query.veiculos.findFirst({
    where: and(eq(veiculos.id, id), eq(veiculos.userId, user.id)),
    with: {
      abastecimentos: {
        orderBy: [desc(abastecimentos.date)],
        with: {
          lancamento: true,
        },
      },
      lancamentos: {
        where: (lancamentos, { and, gte, lte }) => 
          and(
            gte(lancamentos.purchaseDate, startDate),
            lte(lancamentos.purchaseDate, endDate)
          ),
        orderBy: (lancamentos, { desc }) => [desc(lancamentos.purchaseDate)],
        limit: 100,
      },
      manutencoes: {
        where: (manutencoes, { and, gte, lte }) => 
          and(
            gte(manutencoes.date, startDate),
            lte(manutencoes.date, endDate)
          ),
        orderBy: [desc(manutencoes.date)],
      },
    },
  });

  return data;
}
