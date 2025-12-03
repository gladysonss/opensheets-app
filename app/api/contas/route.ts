import { NextResponse } from "next/server";
import { db, schema } from "@/lib/db";
import { eq } from "drizzle-orm";
import { authenticateRequest, handleAuthError } from "@/lib/api-auth";

/**
 * @swagger
 * /api/contas:
 *   get:
 *     description: Retorna todas as contas cadastradas do usuário.
 *     tags:
 *       - Contas
 *     responses:
 *       200:
 *         description: Lista de contas retornada com sucesso.
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

    const contas = await db.query.contas.findMany({
      where: eq(schema.contas.userId, user.id),
      orderBy: (contas: any, { asc }: any) => [asc(contas.name)],
    });

    return NextResponse.json(contas);
  } catch (e: any) {
    return NextResponse.json(
      { error: "An internal server error occurred.", details: e.message },
      { status: 500 }
    );
  }
}
