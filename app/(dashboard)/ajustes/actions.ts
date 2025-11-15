"use server";

import { auth } from "@/lib/auth/config";
import { db, schema } from "@/lib/db";
import { eq, and, ne } from "drizzle-orm";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { z } from "zod";

type ActionResponse<T = void> = {
  success: boolean;
  message?: string;
  error?: string;
  data?: T;
};

// Schema de validação
const updateNameSchema = z.object({
  firstName: z.string().min(1, "Primeiro nome é obrigatório"),
  lastName: z.string().min(1, "Sobrenome é obrigatório"),
});

const updatePasswordSchema = z
  .object({
    newPassword: z.string().min(6, "A senha deve ter no mínimo 6 caracteres"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "As senhas não coincidem",
    path: ["confirmPassword"],
  });

const updateEmailSchema = z
  .object({
    newEmail: z.string().email("E-mail inválido"),
    confirmEmail: z.string().email("E-mail inválido"),
  })
  .refine((data) => data.newEmail === data.confirmEmail, {
    message: "Os e-mails não coincidem",
    path: ["confirmEmail"],
  });

const deleteAccountSchema = z.object({
  confirmation: z.literal("DELETAR", {
    errorMap: () => ({ message: 'Você deve digitar "DELETAR" para confirmar' }),
  }),
});

// Actions

export async function updateNameAction(
  data: z.infer<typeof updateNameSchema>
): Promise<ActionResponse> {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user?.id) {
      return {
        success: false,
        error: "Não autenticado",
      };
    }

    const validated = updateNameSchema.parse(data);
    const fullName = `${validated.firstName} ${validated.lastName}`;

    await db
      .update(schema.user)
      .set({ name: fullName })
      .where(eq(schema.user.id, session.user.id));

    // Revalidar o layout do dashboard para atualizar a sidebar
    revalidatePath("/", "layout");

    return {
      success: true,
      message: "Nome atualizado com sucesso",
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: error.errors[0]?.message || "Dados inválidos",
      };
    }

    console.error("Erro ao atualizar nome:", error);
    return {
      success: false,
      error: "Erro ao atualizar nome. Tente novamente.",
    };
  }
}

export async function updatePasswordAction(
  data: z.infer<typeof updatePasswordSchema>
): Promise<ActionResponse> {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user?.id || !session?.user?.email) {
      return {
        success: false,
        error: "Não autenticado",
      };
    }

    const validated = updatePasswordSchema.parse(data);

    // Usar a API do Better Auth para atualizar a senha
    try {
      await auth.api.changePassword({
        body: {
          newPassword: validated.newPassword,
          currentPassword: "", // Better Auth pode não exigir a senha atual dependendo da configuração
        },
        headers: await headers(),
      });

      return {
        success: true,
        message: "Senha atualizada com sucesso",
      };
    } catch (authError) {
      console.error("Erro na API do Better Auth:", authError);
      // Se a API do Better Auth falhar, retornar erro genérico
      return {
        success: false,
        error: "Erro ao atualizar senha. Tente novamente.",
      };
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: error.errors[0]?.message || "Dados inválidos",
      };
    }

    console.error("Erro ao atualizar senha:", error);
    return {
      success: false,
      error: "Erro ao atualizar senha. Tente novamente.",
    };
  }
}

export async function updateEmailAction(
  data: z.infer<typeof updateEmailSchema>
): Promise<ActionResponse> {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user?.id) {
      return {
        success: false,
        error: "Não autenticado",
      };
    }

    const validated = updateEmailSchema.parse(data);

    // Verificar se o e-mail já está em uso por outro usuário
    const existingUser = await db.query.user.findFirst({
      where: and(
        eq(schema.user.email, validated.newEmail),
        ne(schema.user.id, session.user.id)
      ),
    });

    if (existingUser) {
      return {
        success: false,
        error: "Este e-mail já está em uso",
      };
    }

    // Atualizar e-mail
    await db
      .update(schema.user)
      .set({
        email: validated.newEmail,
        emailVerified: false, // Marcar como não verificado
      })
      .where(eq(schema.user.id, session.user.id));

    // Revalidar o layout do dashboard para atualizar a sidebar
    revalidatePath("/", "layout");

    return {
      success: true,
      message:
        "E-mail atualizado com sucesso. Por favor, verifique seu novo e-mail.",
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: error.errors[0]?.message || "Dados inválidos",
      };
    }

    console.error("Erro ao atualizar e-mail:", error);
    return {
      success: false,
      error: "Erro ao atualizar e-mail. Tente novamente.",
    };
  }
}

export async function deleteAccountAction(
  data: z.infer<typeof deleteAccountSchema>
): Promise<ActionResponse> {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user?.id) {
      return {
        success: false,
        error: "Não autenticado",
      };
    }

    // Validar confirmação
    deleteAccountSchema.parse(data);

    // Deletar todos os dados do usuário em cascade
    // O schema deve ter as relações configuradas com onDelete: cascade
    await db.delete(schema.user).where(eq(schema.user.id, session.user.id));

    return {
      success: true,
      message: "Conta deletada com sucesso",
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: error.errors[0]?.message || "Dados inválidos",
      };
    }

    console.error("Erro ao deletar conta:", error);
    return {
      success: false,
      error: "Erro ao deletar conta. Tente novamente.",
    };
  }
}
