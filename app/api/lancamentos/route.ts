
import { NextResponse } from "next/server";
import { db, schema } from "@/lib/db";
import { and, eq, gte, lte, inArray } from "drizzle-orm";
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
    if (error || !user) {
      return new NextResponse(JSON.stringify({ error: error || "User not found" }), { status, headers: { "Content-Type": "application/json" } });
    }

    const { searchParams } = new URL(request.url);
    
    // Parâmetros de Paginação
    const page = parseInt(searchParams.get('page') ?? '1', 10);
    const limit = parseInt(searchParams.get('limit') ?? '20', 10);
    const offset = (page - 1) * limit;

    // Condições de filtro
    const conditions = [eq(schema.lancamentos.userId, user.id)];
    if (searchParams.has('startDate')) {
        conditions.push(gte(schema.lancamentos.purchaseDate, new Date(searchParams.get('startDate')!)));
    }
    if (searchParams.has('endDate')) {
        conditions.push(lte(schema.lancamentos.purchaseDate, new Date(searchParams.get('endDate')!)));
    }
    if (searchParams.has('type')) {
        conditions.push(eq(schema.lancamentos.transactionType, searchParams.get('type')!));
    }
     if (searchParams.has('contaId')) {
        conditions.push(eq(schema.lancamentos.contaId, searchParams.get('contaId')!));
    }
    if (searchParams.has('categoriaId')) {
        conditions.push(eq(schema.lancamentos.categoriaId, searchParams.get('categoriaId')!));
    }

    // Query para buscar os dados e a contagem total
    const [data, total] = await Promise.all([
        db.query.lancamentos.findMany({
            where: and(...conditions),
            limit,
            offset,
            orderBy: (lancamentos, { desc }) => [desc(lancamentos.purchaseDate)],
        }),
        db.select({ count: schema.lancamentos.id }).from(schema.lancamentos).where(and(...conditions))
    ]);
    
    const totalCount = total.length > 0 ? total.length : 0;
    const totalPages = Math.ceil(totalCount / limit);

    return new NextResponse(JSON.stringify({
        data,
        meta: {
            page,
            limit,
            total: totalCount,
            totalPages
        }
    }), { status: 200, headers: { "Content-Type": "application/json" } });

  } catch (e: any) {
    return new NextResponse(JSON.stringify({ error: "An internal server error occurred.", details: e.message }), { status: 500, headers: { "Content-Type": "application/json" } });
  }
}


// Schema for a single lancamento in a bulk creation request
const lancamentoInBulkSchema = z.object({
  name: z.string({ required_error: "O campo 'name' é obrigatório." }).min(1, "O campo 'name' não pode ser vazio."),
  amount: z.number({ required_error: "O campo 'amount' é obrigatório." }).positive("O valor deve ser positivo."),
  purchaseDate: z.string({ required_error: "O campo 'purchaseDate' é obrigatório." }).refine((date) => !isNaN(Date.parse(date)), {
    message: "Formato de 'purchaseDate' inválido. Use YYYY-MM-DD.",
  }),
  transactionType: z.enum(LANCAMENTO_TRANSACTION_TYPES, { required_error: "O campo 'transactionType' é obrigatório ('Receita' ou 'Despesa')." }),
  pagadorId: z.string().uuid("ID de pagador inválido.").optional().nullable(),
  contaId: z.string().uuid("ID de conta inválido.").optional().nullable(),
  categoriaId: z.string().uuid("ID de categoria inválido.").optional().nullable(),
  condition: z.string().optional().default('À vista'),
  paymentMethod: z.string().optional().default('Dinheiro'),
  note: z.string().optional().nullable(),
});

// Schema for the bulk creation request (an array of lancamentos)
const createBulkLancamentosSchema = z.array(lancamentoInBulkSchema).min(1, "A requisição deve conter ao menos um lançamento.");

// POST /api/lancamentos - Cria um ou mais novos lançamentos
export async function POST(request: Request) {
  try {
    const { user, error, status } = await authenticateRequest(request);
    if (error || !user) {
      return new NextResponse(JSON.stringify({ error: error || "Usuário não encontrado" }), { status, headers: { "Content-Type": "application/json" } });
    }

    const body = await request.json();
    const validation = createBulkLancamentosSchema.safeParse(body);

    if (!validation.success) {
      return new NextResponse(JSON.stringify({ error: "Dados inválidos", details: validation.error.flatten() }), { status: 400, headers: { "Content-Type": "application/json" } });
    }

    const { data: transactions } = validation;
    
    // Busca o pagador padrão do usuário UMA VEZ.
    const userPagador = await db.query.pagadores.findFirst({
        columns: { id: true },
        where: eq(schema.pagadores.userId, user.id)
    });
    const defaultPagadorId = userPagador?.id || null;

    const recordsToInsert = transactions.map(transaction => {
      const purchaseDateObj = new Date(transaction.purchaseDate);
      const year = purchaseDateObj.getFullYear();
      const month = String(purchaseDateObj.getMonth() + 1).padStart(2, '0');
      const period = `${year}-${month}`;

      const amountSign = transaction.transactionType === 'Despesa' ? -1 : 1;
      const finalAmount = (Math.abs(transaction.amount) * amountSign).toFixed(2);
      
      // Usa o pagadorId do lançamento, ou o padrão do usuário se não for provido.
      const pagadorId = transaction.pagadorId ?? defaultPagadorId;

      return {
        ...transaction,
        amount: finalAmount,
        pagadorId: pagadorId,
        userId: user.id,
        period: period,
        purchaseDate: purchaseDateObj,
      };
    });
    
    if (recordsToInsert.length === 0) {
        return new NextResponse(JSON.stringify({ error: "Nenhum lançamento válido para criar." }), { status: 400, headers: { "Content-Type": "application/json" } });
    }

    const inserted = await db.insert(schema.lancamentos).values(recordsToInsert).returning();

    return new NextResponse(JSON.stringify(inserted), { status: 201, headers: { "Content-Type": "application/json" } });

  } catch (e: any) {
    console.error("Erro ao criar lançamento(s) via API:", e);
    return new NextResponse(JSON.stringify({ error: "Ocorreu um erro interno no servidor.", details: e.message }), { status: 500, headers: { "Content-Type": "application/json" } });
  }
}

// Schema para a requisição de deleção
const deleteSchema = z.object({
  ids: z.array(z.string().uuid("Cada ID no array deve ser um UUID válido.")).min(1, "O array de IDs não pode ser vazio."),
});

// DELETE /api/lancamentos - Deleta um ou mais lançamentos
export async function DELETE(request: Request) {
  try {
    // 1. Autenticação
    const { user, error, status } = await authenticateRequest(request);
    if (error || !user) {
      return new NextResponse(JSON.stringify({ error: error || "Usuário não encontrado" }), { status, headers: { "Content-Type": "application/json" } });
    }

    // 2. Validação do Corpo da Requisição
    const body = await request.json();
    const validation = deleteSchema.safeParse(body);

    if (!validation.success) {
      return new NextResponse(JSON.stringify({ error: "Dados inválidos", details: validation.error.flatten() }), { status: 400, headers: { "Content-Type": "application/json" } });
    }

    const { ids } = validation.data;

    // 3. Execução no Banco de Dados
    const deleted = await db.delete(schema.lancamentos).where(
      and(
        inArray(schema.lancamentos.id, ids), // Deleta onde o ID está na lista fornecida
        eq(schema.lancamentos.userId, user.id) // E o lançamento pertence ao usuário autenticado
      )
    ).returning({
        id: schema.lancamentos.id
    });

    // 4. Resposta
    return new NextResponse(JSON.stringify({
      message: `${deleted.length} lançamento(s) foram deletados com sucesso.`,
      deletedIds: deleted.map(d => d.id),
    }), { status: 200, headers: { "Content-Type": "application/json" } });

  } catch (e: any) {
    console.error("Erro ao deletar lançamento(s) via API:", e);
    return new NextResponse(JSON.stringify({ error: "Ocorreu um erro interno no servidor.", details: e.message }), { status: 500, headers: { "Content-Type": "application/json" } });
  }
}

// Schema para um item de atualização em massa
const updateLancamentoSchema = z.object({
  id: z.string().uuid("ID de lançamento inválido."),
  name: z.string().min(1, "O nome não pode ser vazio.").optional(),
  amount: z.number().optional(),
  purchaseDate: z.string().refine((date) => !isNaN(Date.parse(date)), { message: "Data inválida." }).optional(),
  transactionType: z.enum(LANCAMENTO_TRANSACTION_TYPES).optional(),
  pagadorId: z.string().uuid("ID de pagador inválido.").optional().nullable(),
  contaId: z.string().uuid("ID de conta inválido.").optional().nullable(),
  categoriaId: z.string().uuid("ID de categoria inválido.").optional().nullable(),
  note: z.string().optional().nullable(),
});

// Schema para a requisição de atualização em massa
const updateBulkSchema = z.array(updateLancamentoSchema).min(1, "A requisição deve conter ao menos um item para atualizar.");

// PUT /api/lancamentos - Atualiza um ou mais lançamentos
export async function PUT(request: Request) {
  try {
    const { user, error, status } = await authenticateRequest(request);
    if (error || !user) {
      return new NextResponse(JSON.stringify({ error: error || "Usuário não encontrado" }), { status, headers: { "Content-Type": "application/json" } });
    }

    const body = await request.json();
    const validation = updateBulkSchema.safeParse(body);

    if (!validation.success) {
      return new NextResponse(JSON.stringify({ error: "Dados inválidos", details: validation.error.flatten() }), { status: 400, headers: { "Content-Type": "application/json" } });
    }

    const updates = validation.data;
    let updatedCount = 0;
    const updatedIds: string[] = [];

    await db.transaction(async (tx) => {
      for (const update of updates) {
        const { id, ...fieldsToUpdate } = update;

        if (Object.keys(fieldsToUpdate).length === 0) {
          continue;
        }

        const finalFields: Partial<typeof schema.lancamentos.$inferInsert> = { ...fieldsToUpdate };

        if (fieldsToUpdate.purchaseDate) {
          finalFields.period = fieldsToUpdate.purchaseDate.slice(0, 7);
          finalFields.purchaseDate = new Date(fieldsToUpdate.purchaseDate);
        }

        if (fieldsToUpdate.amount !== undefined) {
          const newAmount = fieldsToUpdate.amount;
          const newTransactionType = fieldsToUpdate.transactionType ?? (newAmount < 0 ? 'Despesa' : 'Receita');
          const amountSign = newTransactionType === 'Despesa' ? -1 : 1;
          finalFields.amount = (Math.abs(newAmount) * amountSign).toFixed(2);
          finalFields.transactionType = newTransactionType;
        }

        const [result] = await tx.update(schema.lancamentos)
          .set(finalFields)
          .where(and(eq(schema.lancamentos.id, id), eq(schema.lancamentos.userId, user.id)))
          .returning({ id: schema.lancamentos.id });
        
        if (result) {
          updatedCount++;
          updatedIds.push(result.id);
        }
      }
    });

    return new NextResponse(JSON.stringify({
      message: `${updatedCount} lançamento(s) foram atualizados com sucesso.`,
      updatedIds: updatedIds,
    }), { status: 200, headers: { "Content-Type": "application/json" } });

  } catch (e: any) {
    console.error("Erro ao atualizar lançamento(s) via API:", e);
    return new NextResponse(JSON.stringify({ error: "Ocorreu um erro interno no servidor.", details: e.message }), { status: 500, headers: { "Content-Type": "application/json" } });
  }
}
