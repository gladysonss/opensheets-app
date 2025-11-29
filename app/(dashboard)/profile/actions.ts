"use server";

import { users } from "@/db/schema";
import { db } from "@/lib/db";
import { getUser } from "@/lib/auth/server";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { nanoid } from "nanoid";

export async function generateApiToken() {
  const { user } = await getUser();
  if (!user) {
    throw new Error("Você precisa estar logado para gerar um token de API.");
  }

  const newApiToken = `opensheets_${nanoid(32)}`;

  try {
    await db
      .update(users)
      .set({
        apiToken: newApiToken,
      })
      .where(eq(users.id, user.id));

    revalidatePath("/profile");

    return {
      success: true,
      message: "Token de API gerado com sucesso!",
    };
  } catch (error) {
    console.error("Erro ao gerar token de API:", error);
    return {
      success: false,
      message:
        "Ocorreu um erro ao gerar o token de API. Tente novamente mais tarde.",
    };
  }
}
