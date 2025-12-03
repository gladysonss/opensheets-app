import { NextResponse } from "next/server";
import { db, schema } from "@/lib/db";
import { and, eq, gte, lte, inArray } from "drizzle-orm";
import { z } from "zod";
import { LANCAMENTO_TRANSACTION_TYPES } from "@/lib/lancamentos/constants";
import { splitAmount } from "@/lib/utils/currency";
import { addMonthsToDate, addMonthsToPeriod, parseLocalDateString } from "@/lib/utils/date";

import { authenticateRequest, handleAuthError } from "@/lib/api-auth";

// GET /api/lancamentos - Retorna os lançamentos do usuário com filtros
/**
 * @swagger
 * /api/lancamentos:
 *   get:
 *     description: Retorna os lançamentos do usuário com filtros opcionais.
 *     tags:
 *       - Lançamentos
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: Número da página (padrão 1)
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Itens por página (padrão 20)
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Data inicial (YYYY-MM-DD)
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Data final (YYYY-MM-DD)
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [Receita, Despesa, Transferência]
 *         description: Tipo de transação
 *       - in: query
 *         name: contaId
 *         schema:
 *           type: string
 *         description: ID da conta
 *       - in: query
 *         name: categoriaId
 *         schema:
 *           type: string
 *         description: ID da categoria
 *     responses:
 *       200:
 *         description: Lista de lançamentos retornada com sucesso.
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
            orderBy: (lancamentos: any, { desc }: any) => [desc(lancamentos.purchaseDate)],
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
  name: z.string().min(1, "O campo 'name' não pode ser vazio."),
  amount: z.number().positive("O valor deve ser positivo."),
  purchaseDate: z.string().refine((date) => !isNaN(Date.parse(date)), {
    message: "Formato de 'purchaseDate' inválido. Use YYYY-MM-DD.",
  }),
  dueDate: z.string().refine((date) => !isNaN(Date.parse(date)), {
    message: "Formato de 'dueDate' inválido. Use YYYY-MM-DD.",
  }).optional().nullable(),
  transactionType: z.enum(LANCAMENTO_TRANSACTION_TYPES),
  pagadorId: z.string().uuid("ID de pagador inválido.").optional().nullable(),
  contaId: z.string().uuid("ID de conta inválido.").optional().nullable(),
  categoriaId: z.string().uuid("ID de categoria inválido.").optional().nullable(),
  condition: z.string().optional().default('À vista'),
  paymentMethod: z.string().optional().default('Cartão de crédito'),
  note: z.string().optional().nullable(),
  installmentCount: z.number().int().min(1).optional(),
});

// Schema for the bulk creation request (an array of lancamentos)
const createBulkLancamentosSchema = z.array(lancamentoInBulkSchema).min(1, "A requisição deve conter ao menos um lançamento.");

// POST /api/lancamentos - Cria um ou mais novos lançamentos
/**
 * @swagger
 * /api/lancamentos:
 *   post:
 *     description: Cria um ou mais novos lançamentos (Bulk).
 *     tags:
 *       - Lançamentos
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: array
 *             items:
 *               type: object
 *               properties:
 *                 name:
 *                   type: string
 *                 amount:
 *                   type: number
 *                 purchaseDate:
 *                   type: string
 *                 dueDate:
 *                   type: string
 *                 transactionType:
 *                   type: string
 *                   enum: [Receita, Despesa, Transferência]
 *                 pagadorId:
 *                   type: string
 *                 contaId:
 *                   type: string
 *                 categoriaId:
 *                   type: string
 *                 condition:
 *                   type: string
 *                 paymentMethod:
 *                   type: string
 *                 note:
 *                   type: string
 *                 installmentCount:
 *                   type: number
 *     responses:
 *       201:
 *         description: Lançamentos criados com sucesso.
 *       400:
 *         description: Dados inválidos.
 *       401:
 *         description: Não autorizado.
 *       500:
 *         description: Erro interno do servidor.
 */
export async function POST(request: Request) {
  try {
    // 1. Autenticação
    const { user, error, status } = await authenticateRequest(request);
    if (error || !user) {
      return handleAuthError(error || "Usuário não encontrado", status);
    }

    // 2. Validação do Corpo da Requisição
    let body = await request.json();
    
    // Se o corpo não for um array, transforma em um array com um único item
    if (!Array.isArray(body)) {
        body = [body];
    }

    const validation = createBulkLancamentosSchema.safeParse(body);

    if (!validation.success) {
      return new NextResponse(JSON.stringify({ error: "Dados inválidos", details: validation.error.flatten() }), { status: 400, headers: { "Content-Type": "application/json" } });
    }

    const { data: transactions } = validation;
    
    // 3. Validação de Integridade (FKs) e Preparação dos Dados
    // Busca IDs válidos para garantir que pertencem ao usuário
    const [userContas, userCategorias, userPagadores] = await Promise.all([
        db.query.contas.findMany({ where: eq(schema.contas.userId, user.id), columns: { id: true } }),
        db.query.categorias.findMany({ where: eq(schema.categorias.userId, user.id), columns: { id: true } }),
        db.query.pagadores.findMany({ where: eq(schema.pagadores.userId, user.id), columns: { id: true } })
    ]);

    const validContaIds = new Set(userContas.map((c: { id: string }) => c.id));
    const validCategoriaIds = new Set(userCategorias.map((c: { id: string }) => c.id));
    const validPagadorIds = new Set(userPagadores.map((p: { id: string }) => p.id));
    
    // Busca o pagador padrão do usuário (se houver)
    const defaultPagadorId = userPagadores.length > 0 ? userPagadores[0].id : null;

    const recordsToInsert: typeof schema.lancamentos.$inferInsert[] = [];

    for (const transaction of transactions) {
        // Validação de FKs
        if (transaction.contaId && !validContaIds.has(transaction.contaId)) {
            return new NextResponse(JSON.stringify({ error: `Conta inválida ou não pertence ao usuário: ${transaction.contaId}` }), { status: 400 });
        }
        if (transaction.categoriaId && !validCategoriaIds.has(transaction.categoriaId)) {
            return new NextResponse(JSON.stringify({ error: `Categoria inválida ou não pertence ao usuário: ${transaction.categoriaId}` }), { status: 400 });
        }
        if (transaction.pagadorId && !validPagadorIds.has(transaction.pagadorId)) {
            return new NextResponse(JSON.stringify({ error: `Pagador inválido ou não pertence ao usuário: ${transaction.pagadorId}` }), { status: 400 });
        }

        const purchaseDateObj = parseLocalDateString(transaction.purchaseDate);
        const dueDateObj = transaction.dueDate ? parseLocalDateString(transaction.dueDate) : null;
        const year = purchaseDateObj.getFullYear();
        const month = String(purchaseDateObj.getMonth() + 1).padStart(2, '0');
        const initialPeriod = `${year}-${month}`;
        
        // Determina o sinal do valor (Despesa = negativo, Receita = positivo)
        const amountSign = transaction.transactionType === 'Despesa' ? -1 : 1;
        const totalAmountCents = Math.round(Math.abs(transaction.amount) * 100);

        // Lógica de Parcelamento
        const isInstallment = transaction.condition === 'Parcelado' && (transaction.installmentCount || 0) > 1;
        
        if (isInstallment) {
            const installmentCount = transaction.installmentCount!;
            const seriesId = crypto.randomUUID(); // Gera um ID único para a série de parcelas
            
            // Imports já realizados no topo do arquivo

            
            const base = Math.trunc(totalAmountCents / installmentCount);
            const remainder = totalAmountCents % installmentCount;
            
            for (let i = 0; i < installmentCount; i++) {
                // Lógica de Data
                const installmentDate = new Date(purchaseDateObj);
                installmentDate.setMonth(installmentDate.getMonth() + i);

                // Lógica de Data de Vencimento
                let currentDueDate = null;
                if (dueDateObj) {
                    currentDueDate = new Date(dueDateObj);
                    currentDueDate.setMonth(currentDueDate.getMonth() + i);
                }
                
                // Lógica de Período
                const pYear = installmentDate.getFullYear();
                const pMonth = String(installmentDate.getMonth() + 1).padStart(2, '0');
                const period = `${pYear}-${pMonth}`;

                // Lógica de Valor
                const installmentAmountCents = base + (i < remainder ? 1 : 0);
                const finalAmount = (installmentAmountCents / 100 * amountSign).toFixed(2);

                recordsToInsert.push({
                    ...transaction,
                    amount: finalAmount,
                    pagadorId: transaction.pagadorId ?? defaultPagadorId,
                    userId: user.id,
                    period: period,
                    purchaseDate: installmentDate,
                    dueDate: currentDueDate,
                    installmentCount: installmentCount,
                    currentInstallment: i + 1,
                    seriesId: seriesId,
                    isDivided: false, // Assumindo false por padrão na API
                });
            }

        } else {
            // Lançamento Único
            const finalAmount = (Math.abs(transaction.amount) * amountSign).toFixed(2);
            
            recordsToInsert.push({
                ...transaction,
                amount: finalAmount,
                pagadorId: transaction.pagadorId ?? defaultPagadorId,
                userId: user.id,
                period: initialPeriod,
                purchaseDate: purchaseDateObj,
                dueDate: dueDateObj,
                installmentCount: null,
                currentInstallment: null,
                seriesId: null,
            });
        }
    }
    
    if (recordsToInsert.length === 0) {
        return new NextResponse(JSON.stringify({ error: "Nenhum lançamento válido para criar." }), { status: 400, headers: { "Content-Type": "application/json" } });
    }

    // 4. Execução (Transaction)
    const inserted = await db.transaction(async (tx: any) => {
        return await tx.insert(schema.lancamentos).values(recordsToInsert).returning();
    });

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
/**
 * @swagger
 * /api/lancamentos:
 *   delete:
 *     description: Deleta um ou mais lançamentos.
 *     tags:
 *       - Lançamentos
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               ids:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       200:
 *         description: Lançamentos deletados com sucesso.
 *       400:
 *         description: Dados inválidos.
 *       401:
 *         description: Não autorizado.
 *       500:
 *         description: Erro interno do servidor.
 */
export async function DELETE(request: Request) {
  try {
    // 1. Autenticação
    const { user, error, status } = await authenticateRequest(request);
    if (error || !user) {
      return handleAuthError(error || "Usuário não encontrado", status);
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
      deletedIds: deleted.map((d: { id: string }) => d.id),
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
/**
 * @swagger
 * /api/lancamentos:
 *   put:
 *     description: Atualiza um ou mais lançamentos (Bulk).
 *     tags:
 *       - Lançamentos
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: array
 *             items:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                 name:
 *                   type: string
 *                 amount:
 *                   type: number
 *                 purchaseDate:
 *                   type: string
 *     responses:
 *       200:
 *         description: Lançamentos atualizados com sucesso.
 *       400:
 *         description: Dados inválidos.
 *       401:
 *         description: Não autorizado.
 *       500:
 *         description: Erro interno do servidor.
 */
export async function PUT(request: Request) {
  try {
    const { user, error, status } = await authenticateRequest(request);
    if (error || !user) {
      return handleAuthError(error || "Usuário não encontrado", status);
    }

    const body = await request.json();
    const validation = updateBulkSchema.safeParse(body);

    if (!validation.success) {
      return new NextResponse(JSON.stringify({ error: "Dados inválidos", details: validation.error.flatten() }), { status: 400, headers: { "Content-Type": "application/json" } });
    }

    const updates = validation.data;
    let updatedCount = 0;
    const updatedIds: string[] = [];

    await db.transaction(async (tx: any) => {
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
