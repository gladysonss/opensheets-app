import { NextResponse } from "next/server";
import { db } from "@/lib/db";

/**
 * Health check endpoint para Docker e monitoring
 * GET /api/health
 *
 * Retorna status 200 se a aplicação está saudável
 * Verifica conexão com banco de dados
 */
export async function GET() {
  try {
    // Tenta fazer uma query simples no banco para verificar conexão
    // Isso garante que o app está conectado ao banco antes de considerar "healthy"
    await db.execute("SELECT 1");

    return NextResponse.json(
      {
        status: "ok",
        timestamp: new Date().toISOString(),
        service: "opensheets-app",
      },
      { status: 200 }
    );
  } catch (error) {
    // Se houver erro na conexão com banco, retorna status 503 (Service Unavailable)
    console.error("Health check failed:", error);

    return NextResponse.json(
      {
        status: "error",
        timestamp: new Date().toISOString(),
        service: "opensheets-app",
        error: error instanceof Error ? error.message : "Database connection failed",
      },
      { status: 503 }
    );
  }
}
