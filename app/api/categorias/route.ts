import { NextResponse } from "next/server";
import { db, schema } from "@/lib/db";
import { eq } from "drizzle-orm";
import { authenticateRequest, handleAuthError } from "@/lib/api-auth";

export async function GET(request: Request) {
  try {
    const { user, error, status } = await authenticateRequest(request);
    if (error || !user) {
      return handleAuthError(error || "User not found", status);
    }

    const categorias = await db.query.categorias.findMany({
      where: eq(schema.categorias.userId, user.id),
      orderBy: (categorias: any, { asc }: any) => [asc(categorias.name)],
    });

    return NextResponse.json(categorias);
  } catch (e: any) {
    return NextResponse.json(
      { error: "An internal server error occurred.", details: e.message },
      { status: 500 }
    );
  }
}
