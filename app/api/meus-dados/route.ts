import { NextResponse } from "next/server";
import { authenticateRequest, handleAuthError } from "@/lib/api-auth";

/**
 * @swagger
 * /api/meus-dados:
 *   get:
 *     description: Retorna os dados do usuário autenticado.
 *     tags:
 *       - Usuário
 *     responses:
 *       200:
 *         description: Dados do usuário retornados com sucesso.
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

    // 6. Se o token for válido, retornar os dados protegidos
    return NextResponse.json({
      id: user.id,
      name: user.name,
      email: user.email,
      message: "Dados protegidos acessados com sucesso!",
    });

  } catch (error: any) {
    console.error("[API_MEUS_DADOS_GET]", error);
    return new NextResponse(
      JSON.stringify({ 
        error: "Internal Server Error", 
        details: error.message 
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
