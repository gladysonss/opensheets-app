import { NextResponse } from "next/server";
import { db, schema } from "@/lib/db";
import { and, eq, desc } from "drizzle-orm";
import { authenticateRequest, handleAuthError } from "@/lib/api-auth";

// GET /api/veiculos/[id]/lancamentos - Retorna os lançamentos de um veículo específico
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { user, error, status } = await authenticateRequest(request);
    if (error || !user) {
      return handleAuthError(error || "User not found", status);
    }

    const { id } = await params;

    // Verify if vehicle exists and belongs to user
    const vehicle = await db.query.veiculos.findFirst({
      where: and(eq(schema.veiculos.id, id), eq(schema.veiculos.userId, user.id)),
    });

    if (!vehicle) {
      return new NextResponse(JSON.stringify({ error: "Veículo não encontrado." }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }

    const data = await db.query.lancamentos.findMany({
      where: and(
        eq(schema.lancamentos.userId, user.id),
        eq(schema.lancamentos.veiculoId, id)
      ),
      orderBy: [desc(schema.lancamentos.purchaseDate)],
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
