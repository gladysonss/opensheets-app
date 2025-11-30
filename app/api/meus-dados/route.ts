import { NextResponse } from "next/server";
import { db, schema } from "@/lib/db";
import { eq } from "drizzle-orm";

export async function GET(request: Request) {
  try {
    // 1. Pegar o cabeçalho de autorização a partir do objeto request
    const authHeader = request.headers.get("Authorization");

    // 2. Verificar se o cabeçalho existe e está no formato correto ("Bearer ...")
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return new NextResponse(
        JSON.stringify({ error: "Authorization header is missing or malformed" }),
        { status: 401, headers: { "Content-Type": "application/json" } }
      );
    }

    // 3. Extrair o token
    const token = authHeader.split(" ")[1];

    if (!token) {
      return new NextResponse(
        JSON.stringify({ error: "API token is missing" }),
        { status: 401, headers: { "Content-Type": "application/json" } }
      );
    }

    // 4. Procurar o usuário com base no token
    const user = await db.query.user.findFirst({
      where: eq(schema.user.apiToken, token),
    });

    // 5. Se nenhum usuário for encontrado, o token é inválido
    if (!user) {
      return new NextResponse(
        JSON.stringify({ error: "Invalid API token" }),
        { status: 403, headers: { "Content-Type": "application/json" } }
      );
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
