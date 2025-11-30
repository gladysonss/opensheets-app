'use server';

import { auth } from "@/lib/auth/config";
import { db, schema } from "@/lib/db";
import { eq, and, ne } from "drizzle-orm";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { randomBytes } from 'crypto';

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
    currentPassword: z.string().min(1, "Senha atual é obrigatória"),
    newPassword: z.string().min(6, "A senha deve ter no mínimo 6 caracteres"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "As senhas não coincidem",
    path: ["confirmPassword"],
  });

const updateEmailSchema = z
  .object({
    password: z.string().optional(), // Opcional para usuários Google OAuth
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

export async function generateApiToken(
  _prevState: { token: string | null; error: string | null },
  _formData: FormData
): Promise<{ token: string | null; error: string | null }> {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user?.id) {
      return { token: null, error: "Não autenticado" };
    }

    const newToken = randomBytes(24).toString('base64url');

    await db
      .update(schema.user)
      .set({ apiToken: newToken })
      .where(eq(schema.user.id, session.user.id));

    revalidatePath("/ajustes");

    return { token: newToken, error: null };
  } catch (error) {
    console.error("Erro ao gerar token de API:", error);
    return { token: null, error: "Ocorreu um erro ao gerar o token. Tente novamente." };
  }
}

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

    revalidatePath("/", "layout");

    return {
      success: true,
      message: "Nome atualizado com sucesso",
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: error.issues[0]?.message || "Dados inválidos",
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

    const userAccount = await db.query.account.findFirst({
      where: and(
        eq(schema.account.userId, session.user.id),
        eq(schema.account.providerId, "google")
      ),
    });

    if (userAccount) {
      return {
        success: false,
        error: "Não é possível alterar senha para contas autenticadas via Google",
      };
    }

    try {
      await auth.api.changePassword({
        body: {
          newPassword: validated.newPassword,
          currentPassword: validated.currentPassword,
        },
        headers: await headers(),
      });

      return {
        success: true,
        message: "Senha atualizada com sucesso",
      };
    } catch (authError: any) {
      console.error("Erro na API do Better Auth:", authError);

      if (authError?.message?.includes("password") || authError?.message?.includes("incorrect")) {
        return {
          success: false,
          error: "Senha atual incorreta",
        };
      }

      return {
        success: false,
        error: "Erro ao atualizar senha. Verifique se a senha atual está correta.",
      };
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: error.issues[0]?.message || "Dados inválidos",
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

    if (!session?.user?.id || !session?.user?.email) {
      return {
        success: false,
        error: "Não autenticado",
      };
    }

    const validated = updateEmailSchema.parse(data);

    const userAccount = await db.query.account.findFirst({
      where: and(
        eq(schema.account.userId, session.user.id),
        eq(schema.account.providerId, "google")
      ),
    });

    const isGoogleAuth = !!userAccount;

    if (!isGoogleAuth) {
      if (!validated.password) {
        return {
          success: false,
          error: "Senha é obrigatória para confirmar a alteração",
        };
      }

      try {
        await auth.api.changePassword({
          body: {
            newPassword: validated.password,
            currentPassword: validated.password,
          },
          headers: await headers(),
        });
      } catch (authError: any) {
        console.error("Erro ao validar senha:", authError);
        return {
          success: false,
          error: "Senha incorreta",
        };
      }
    }

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

    if (validated.newEmail.toLowerCase() === session.user.email.toLowerCase()) {
      return {
        success: false,
        error: "O novo e-mail deve ser diferente do atual",
      };
    }

    await db
      .update(schema.user)
      .set({
        email: validated.newEmail,
        emailVerified: false, 
      })
      .where(eq(schema.user.id, session.user.id));

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
        error: error.issues[0]?.message || "Dados inválidos",
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

    deleteAccountSchema.parse(data);

    await db.delete(schema.user).where(eq(schema.user.id, session.user.id));

    return {
      success: true,
      message: "Conta deletada com sucesso",
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: error.issues[0]?.message || "Dados inválidos",
      };
    }

    console.error("Erro ao deletar conta:", error);
    return {
      success: false,
      error: "Erro ao deletar conta. Tente novamente.",
    };
  }
}
