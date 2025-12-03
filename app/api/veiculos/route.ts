import { NextResponse } from "next/server";
import { db, schema } from "@/lib/db";
import { eq, desc } from "drizzle-orm";
import { authenticateRequest, handleAuthError } from "@/lib/api-auth";

// GET /api/veiculos - Retorna os veículos do usuário
/**
 * @swagger
 * /api/veiculos:
 *   get:
 *     description: Retorna todos os veículos cadastrados para o usuário logado.
 *     tags:
 *       - Veículos
 *     responses:
 *       200:
 *         description: Lista de veículos retornada com sucesso.
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

    const data = await db.query.veiculos.findMany({
      where: eq(schema.veiculos.userId, user.id),
      orderBy: [desc(schema.veiculos.createdAt)],
    });

    return new NextResponse(JSON.stringify({ data }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (e: any) {
    return new NextResponse(
      JSON.stringify({ error: "An internal server error occurred.", details: e.message }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
