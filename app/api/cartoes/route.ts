import { NextResponse } from "next/server";
import { db, schema } from "@/lib/db";
import { eq } from "drizzle-orm";
import { authenticateRequest, handleAuthError } from "@/lib/api-auth";

/**
 * @swagger
 * /api/cartoes:
 *   get:
 *     description: Retorna todos os cartões de crédito cadastrados do usuário.
 *     tags:
 *       - Cartões
 *     responses:
 *       200:
 *         description: Lista de cartões retornada com sucesso.
 *       401:
 *         description: Não autorizado.
 *       500:
 *         description: Erro interno do servidor.
 */
export async function GET(request: Request) {
  try {
    const { user, error, status } = await authenticateRequest(request);
    if (error || !user) {
      return handleAuthError(error || "User not found", status);
    }

    const cartoes = await db.query.cartoes.findMany({
      where: eq(schema.cartoes.userId, user.id),
      orderBy: (cartoes: any, { asc }: any) => [asc(cartoes.name)],
    });

    return NextResponse.json(cartoes);
  } catch (e: any) {
    return NextResponse.json(
      { error: "An internal server error occurred.", details: e.message },
      { status: 500 }
    );
  }
}
