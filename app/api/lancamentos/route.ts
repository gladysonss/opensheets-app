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

    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const limitParam = searchParams.get('limit');

    const conditions = [eq(schema.lancamentos.userId, user.id)];
    if (startDate && !isNaN(new Date(startDate).getTime())) {
      conditions.push(gte(schema.lancamentos.purchaseDate, new Date(startDate)));
    }
    if (endDate && !isNaN(new Date(endDate).getTime())) {
      conditions.push(lte(schema.lancamentos.purchaseDate, new Date(endDate)));
    }

    const queryOptions: any = {
      where: and(...conditions),
      orderBy: (lancamentos, { desc }) => [desc(lancamentos.purchaseDate)],
    };

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

// Esquema para um único lançamento
const apiCreateLancamentoSchema = z.object({
  description: z.string().min(3, "A descrição precisa ter no mínimo 3 caracteres."),
  amount: z.number().positive("O valor deve ser positivo."),
  date: z.coerce.date({ invalid_type_error: "Data inválida. Use o formato YYYY-MM-DD." }),
  type: z.string().transform((val, ctx) => {
    const capitalized = val.charAt(0).toUpperCase() + val.slice(1).toLowerCase();
    if (!(LANCAMENTO_TRANSACTION_TYPES as readonly string[]).includes(capitalized)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: `Tipo inválido. Use um de: ${LANCAMENTO_TRANSACTION_TYPES.join(", ")}`,
      });
      return z.NEVER;
    }
    return capitalized as (typeof LANCAMENTO_TRANSACTION_TYPES)[number];
  }),
  paymentMethod: z.string().optional().default("Pix"),
  condition: z.string().optional().default("À vista"),
});

// Esquema que aceita um único objeto ou um array de objetos
const apiBulkCreateSchema = z.union([
  apiCreateLancamentoSchema,
  z.array(apiCreateLancamentoSchema).min(1, "A lista de lançamentos não pode estar vazia.")
]);

// POST /api/lancamentos - Cria um ou mais lançamentos
export async function POST(request: Request) {
  try {
    const { user, error, status } = await authenticateRequest(request);
    if (error) {
      return new NextResponse(JSON.stringify({ error }), { status, headers: { "Content-Type": "application/json" } });
    }

    const body = await request.json();
    const validation = apiBulkCreateSchema.safeParse(body);

    if (!validation.success) {
      return new NextResponse(
        JSON.stringify({ error: "Invalid input", details: validation.error.flatten().fieldErrors }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const lancamentosData = Array.isArray(validation.data) ? validation.data : [validation.data];

    const valuesToInsert = lancamentosData.map(lancamento => {
      const { description, amount, date, type, paymentMethod, condition } = lancamento;
      const period = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`;
      
      // Se for despesa, torna o valor negativo
      const finalAmount = type === 'Despesa' ? amount * -1 : amount;

      return {
        name: description,
        amount: finalAmount.toString(),
        purchaseDate: date,
        transactionType: type,
        userId: user.id,
        condition: condition,
        paymentMethod: paymentMethod,
        period: period,
      };
    });

    const newLancamentos = await db.insert(schema.lancamentos).values(valuesToInsert).returning();

    const result = Array.isArray(validation.data) ? newLancamentos : newLancamentos[0];

    return NextResponse.json(result, { status: 201 });

  } catch (error: any) {
    console.error("[API_LANCAMENTOS_POST]", error);
    return new NextResponse(
      JSON.stringify({ error: "Internal Server Error", details: error.message }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
