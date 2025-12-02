import { authenticateRequest, handleAuthError } from "@/lib/api-auth";
import { categorias, contas, lancamentos, pagadores } from "@/db/schema";
import { db } from "@/lib/db";
import { PAGADOR_ROLE_ADMIN } from "@/lib/pagadores/constants";
import { uuidSchema } from "@/lib/schemas/common";
import {
  TRANSFER_CATEGORY_NAME,
  TRANSFER_CONDITION,
  TRANSFER_ESTABLISHMENT,
  TRANSFER_PAYMENT_METHOD,
} from "@/lib/transferencias/constants";
import { formatDecimalForDbRequired } from "@/lib/utils/currency";
import { and, eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { z } from "zod";

const transferApiSchema = z.object({
  origem: uuidSchema("Conta de origem"),
  destino: uuidSchema("Conta de destino"),
  valor: z
    .number({ message: "O valor deve ser um número." })
    .positive("O valor deve ser maior que zero."),
  data: z.coerce.date({ message: "Informe uma data válida." }),
  periodo: z
    .string({ message: "Informe o período." })
    .trim()
    .min(1, "Informe o período.")
    .regex(/^\d{4}-\d{2}$/, "O período deve estar no formato YYYY-MM."),
});

export async function POST(request: Request) {
  try {
    const authResult = await authenticateRequest(request);

    if (authResult.error) {
      return handleAuthError(authResult.error, authResult.status);
    }

    const user = authResult.user;
    const json = await request.json();
    const data = transferApiSchema.parse(json);

    // Validate that accounts are different
    if (data.origem === data.destino) {
      return NextResponse.json(
        { error: "A conta de origem e destino devem ser diferentes." },
        { status: 400 }
      );
    }

    // Generate a unique transfer ID to link both transactions
    const transferId = crypto.randomUUID();

    await db.transaction(async (tx: typeof db) => {
      // Verify both accounts exist and belong to the user
      const [fromAccount, toAccount] = await Promise.all([
        tx.query.contas.findFirst({
          columns: { id: true, name: true },
          where: and(
            eq(contas.id, data.origem),
            eq(contas.userId, user.id)
          ),
        }),
        tx.query.contas.findFirst({
          columns: { id: true, name: true },
          where: and(
            eq(contas.id, data.destino),
            eq(contas.userId, user.id)
          ),
        }),
      ]);

      if (!fromAccount) {
        throw new Error("Conta de origem não encontrada.");
      }

      if (!toAccount) {
        throw new Error("Conta de destino não encontrada.");
      }

      // Get the transfer category
      const transferCategory = await tx.query.categorias.findFirst({
        columns: { id: true },
        where: and(
          eq(categorias.userId, user.id),
          eq(categorias.name, TRANSFER_CATEGORY_NAME)
        ),
      });

      if (!transferCategory) {
        throw new Error(
          `Categoria "${TRANSFER_CATEGORY_NAME}" não encontrada. Por favor, crie esta categoria antes de fazer transferências.`
        );
      }

      // Get the admin payer
      const adminPagador = await tx.query.pagadores.findFirst({
        columns: { id: true },
        where: and(
          eq(pagadores.userId, user.id),
          eq(pagadores.role, PAGADOR_ROLE_ADMIN)
        ),
      });

      if (!adminPagador) {
        throw new Error(
          "Pagador administrador não encontrado. Por favor, crie um pagador admin."
        );
      }

      // Create outgoing transaction (transfer from source account)
      await tx.insert(lancamentos).values({
        condition: TRANSFER_CONDITION,
        name: `${TRANSFER_ESTABLISHMENT} → ${toAccount.name}`,
        paymentMethod: TRANSFER_PAYMENT_METHOD,
        note: `Transferência para ${toAccount.name}`,
        amount: formatDecimalForDbRequired(-Math.abs(data.valor)),
        purchaseDate: data.data,
        transactionType: "Transferência",
        period: data.periodo,
        isSettled: true,
        userId: user.id,
        contaId: fromAccount.id,
        categoriaId: transferCategory.id,
        pagadorId: adminPagador.id,
        transferId,
      });

      // Create incoming transaction (transfer to destination account)
      await tx.insert(lancamentos).values({
        condition: TRANSFER_CONDITION,
        name: `${TRANSFER_ESTABLISHMENT} ← ${fromAccount.name}`,
        paymentMethod: TRANSFER_PAYMENT_METHOD,
        note: `Transferência de ${fromAccount.name}`,
        amount: formatDecimalForDbRequired(Math.abs(data.valor)),
        purchaseDate: data.data,
        transactionType: "Transferência",
        period: data.periodo,
        isSettled: true,
        userId: user.id,
        contaId: toAccount.id,
        categoriaId: transferCategory.id,
        pagadorId: adminPagador.id,
        transferId,
      });
    });

    return NextResponse.json(
      {
        success: true,
        message: "Transferência registrada com sucesso.",
        transferId,
      },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Dados inválidos.", details: error.errors },
        { status: 400 }
      );
    }

    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json(
      { error: "Ocorreu um erro interno." },
      { status: 500 }
    );
  }
}
