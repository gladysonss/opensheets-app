import { NextResponse } from "next/server";
import { db, schema } from "@/lib/db";
import { eq } from "drizzle-orm";
import { authenticateRequest, handleAuthError } from "@/lib/api-auth";

/**
 * @swagger
 * /api/pagadores:
 *   get:
 *     description: Retorna todos os pagadores cadastrados do usuário.
 *     tags:
 *       - Pagadores
 *     responses:
 *       200:
 *         description: Lista de pagadores retornada com sucesso.
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

    const pagadores = await db.query.pagadores.findMany({
      where: eq(schema.pagadores.userId, user.id),
      orderBy: (pagadores: any, { asc }: any) => [asc(pagadores.name)],
    });

    return NextResponse.json(pagadores);
  } catch (e: any) {
    return NextResponse.json(
      { error: "An internal server error occurred.", details: e.message },
      { status: 500 }
    );
  }
}
