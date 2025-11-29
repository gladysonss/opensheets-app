
import { NextResponse } from "next/server";
import { z } from "zod";
import { eq } from "drizzle-orm";

import { db } from "@/lib/db";
import { lancamentos } from "@/db/schema";
import { getUser } from "@/lib/auth/server";

// Schema for validating the incoming request body for creating a transaction
const createLancamentoSchema = z.object({
  condition: z.string(),
  name: z.string().min(1, "Nome é obrigatório"),
  paymentMethod: z.string(),
  note: z.string().nullable().optional(),
  amount: z.number().transform((val) => val.toFixed(2)), // Transformed to a fixed-point string
  purchaseDate: z.string().transform((str) => new Date(str)),
  transactionType: z.string(),
  installmentCount: z.number().nullable().optional(),
  period: z.string(),
  currentInstallment: z.number().nullable().optional(),
  recurrenceCount: z.number().nullable().optional(),
  dueDate: z.string().transform((str) => new Date(str)).nullable().optional(),
  isSettled: z.boolean().optional().default(false),
  // Allow empty strings for optional UUIDs, and convert them to null.
  contaId: z.preprocess(
    (val) => (val === "" ? null : val),
    z.string().uuid("ID de conta inválido").nullable().optional()
  ),
  categoriaId: z.preprocess(
    (val) => (val === "" ? null : val),
    z.string().uuid("ID de categoria inválido").nullable().optional()
  ),
  pagadorId: z.string().uuid().nullable().optional(),
  cartaoId: z.string().uuid().nullable().optional(),
});

export async function GET() {
  try {
    const user = await getUser();

    const data = await db
      .select()
      .from(lancamentos)
      .where(eq(lancamentos.userId, user.id));
    
    return NextResponse.json({ data });
  } catch (error) {
    console.error("[LANCAMENTOS_GET]", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const user = await getUser();
    const body = await request.json();

    const validatedBody = createLancamentoSchema.parse(body);

    const [data] = await db
      .insert(lancamentos)
      .values({
        ...validatedBody,
        id: crypto.randomUUID(),
        userId: user.id,
      })
      .returning();

    return NextResponse.json({ message: "Lançamento criado com sucesso!", data }, { status: 201 });

  } catch (error) {
    if (error instanceof z.ZodError) {
      // Return detailed validation errors
      return new NextResponse(JSON.stringify({ error: "Invalid input", details: error.errors }), { status: 400 });
    }
    
    console.error("[LANCAMENTOS_POST]", error);

    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
    return new NextResponse(JSON.stringify({ error: "Internal Server Error", details: errorMessage }), { status: 500 });
  }
}
