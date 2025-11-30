import { NextResponse } from "next/server";
import { db, schema } from "@/lib/db";
import { and, eq, gte, lte } from "drizzle-orm";
import { z } from "zod";
import { LANCAMENTO_TRANSACTION_TYPES } from "@/lib/lancamentos/constants";

// Função auxiliar para autenticar o token
async function authenticateRequest(request: Request) {
  const authHeader = request.headers.get("Authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return { error: "Authorization header is missing or malformed", status: 401, user: null };
  }

  const token = authHeader.split(" ")[1];
  if (!token) {
    return { error: "API token is missing", status: 401, user: null };
  }

  const user = await db.query.user.findFirst({
    where: eq(schema.user.apiToken, token),
  });

  if (!user) {
    return { error: "Invalid API token", status: 403, user: null };
  }

  return { user, error: null, status: 200 };
}

// GET /api/lancamentos - Retorna os lançamentos do usuário com filtros
export async function GET(request: Request) {
  try {
    const { user, error, status } = await authenticateRequest(request);
    if (error) {
      return new NextResponse(JSON.stringify({ error }), { status, headers: { "Content-Type": "application/json" } });
    }

    // Extrai parâmetros de consulta da URL
    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const limitParam = searchParams.get('limit');

    // Constrói as condições da consulta dinamicamente
    const conditions = [eq(schema.lancamentos.userId, user.id)];
    if (startDate && !isNaN(new Date(startDate).getTime())) {
      conditions.push(gte(schema.lancamentos.purchaseDate, new Date(startDate)));
    }
    if (endDate && !isNaN(new Date(endDate).getTime())) {
      conditions.push(lte(schema.lancamentos.purchaseDate, new Date(endDate)));
    }

    // Define as opções da consulta
    const queryOptions: any = {
      where: and(...conditions),
      orderBy: (lancamentos, { desc }) => [desc(lancamentos.purchaseDate)],
    };

    // Adiciona o limite se for um número válido
    if (limitParam) {
      const limit = parseInt(limitParam, 10);
      if (!isNaN(limit) && limit > 0) {
        queryOptions.limit = limit;
      }
    }

    const lancamentos = await db.query.lancamentos.findMany(queryOptions);

    return NextResponse.json(lancamentos);

  } catch (error: any) {
    console.error("[API_LANCAMENTOS_GET]", error);
    return new NextResponse(
      JSON.stringify({ error: "Internal Server Error", details: error.message }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}


// Esquema de validação para a criação de um lançamento (o que a API espera receber)
const apiCreateLancamentoSchema = z.object({
  description: z.string().min(3, "A descrição precisa ter no mínimo 3 caracteres."),
  amount: z.number().positive("O valor deve ser positivo."),
  date: z.coerce.date({ invalid_type_error: "Data inválida. Use o formato YYYY-MM-DD." }),
  type: z.enum(LANCAMENTO_TRANSACTION_TYPES),
  paymentMethod: z.string().optional().default("Pix"),
  condition: z.string().optional().default("À vista"),
});

// POST /api/lancamentos - Cria um novo lançamento
export async function POST(request: Request) {
  try {
    const { user, error, status } = await authenticateRequest(request);
    if (error) {
      return new NextResponse(JSON.stringify({ error }), { status, headers: { "Content-Type": "application/json" } });
    }

    const body = await request.json();
    const validation = apiCreateLancamentoSchema.safeParse(body);

    if (!validation.success) {
      return new NextResponse(
        JSON.stringify({ error: "Invalid input", details: validation.error.flatten().fieldErrors }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const { description, amount, date, type, paymentMethod, condition } = validation.data;
    
    // O campo 'date' já é um objeto Date por causa do z.coerce.date()
    const period = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`;

    const [newLancamento] = await db.insert(schema.lancamentos).values({
      name: description,
      amount: amount.toString(),
      purchaseDate: date, // Usar o objeto Date diretamente
      transactionType: type,
      userId: user.id,
      condition: condition,
      paymentMethod: paymentMethod,
      period: period,
    }).returning();


    return NextResponse.json(newLancamento, { status: 201 });

  } catch (error: any) {
    console.error("[API_LANCAMENTOS_POST]", error);
    return new NextResponse(
      JSON.stringify({ error: "Internal Server Error", details: error.message }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
