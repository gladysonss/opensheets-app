/**
 * Better Auth Configuration
 *
 * Configuração central de autenticação usando Better Auth.
 * Suporta email/password e Google OAuth.
 */

import { seedDefaultCategoriesForUser } from "@/lib/categorias/defaults";
import { db, schema } from "@/lib/db";
import { ensureDefaultPagadorForUser } from "@/lib/pagadores/defaults";
import { normalizeNameFromEmail } from "@/lib/pagadores/utils";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import type { GoogleProfile } from "better-auth/social-providers";
import { eq, and, gt, isNull } from "drizzle-orm";

// ============================================================================
// GOOGLE OAUTH CONFIGURATION
// ============================================================================

const googleClientId = process.env.GOOGLE_CLIENT_ID;
const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET;

/**
 * Extrai nome do usuário do perfil do Google com fallback hierárquico:
 * 1. profile.name (nome completo)
 * 2. profile.given_name + profile.family_name
 * 3. Nome extraído do email
 * 4. "Usuário" (fallback final)
 */
function getNameFromGoogleProfile(profile: GoogleProfile): string {
  const fullName = profile.name?.trim();
  if (fullName) return fullName;

  const fromGivenFamily = [profile.given_name, profile.family_name]
    .filter(Boolean)
    .join(" ")
    .trim();
  if (fromGivenFamily) return fromGivenFamily;

  const fromEmail = profile.email
    ? normalizeNameFromEmail(profile.email)
    : undefined;

  return fromEmail ?? "Usuário";
}

// ============================================================================
// BETTER AUTH INSTANCE
// ============================================================================

// Define trusted origins dynamically
const trustedOrigins = [
  process.env.BETTER_AUTH_URL, // Main production URL
  ...(process.env.TRUSTED_ORIGINS ? process.env.TRUSTED_ORIGINS.split(",") : []) // Additional comma-separated origins
].filter(Boolean) as string[];

export const auth = betterAuth({
  trustedOrigins,
  // Email/Password authentication
  emailAndPassword: {
    enabled: true,
    autoSignIn: true,
  },

  // Database adapter (Drizzle + PostgreSQL)
  database: drizzleAdapter(db, {
    provider: "pg",
    schema,
    camelCase: true,
  }),

  // Google OAuth (se configurado)
  socialProviders:
    googleClientId && googleClientSecret
      ? {
          google: {
            clientId: googleClientId,
            clientSecret: googleClientSecret,
            mapProfileToUser: (profile) => ({
              name: getNameFromGoogleProfile(profile),
              email: profile.email,
              image: profile.picture,
              emailVerified: profile.email_verified,
            }),
          },
        }
      : undefined,

  // Database hooks - Executados após eventos do DB
  databaseHooks: {
    user: {
      create: {
        /**
         * ANTES de criar usuário (Segurança de Convites):
         * 1. BOOTSTRAP: Se não houver usuários, libera (Primeiro Admin).
         * 2. CHECK: Se já houver usuários, exige convite válido para o email.
         */
        before: async (user) => {
          // 1. Bootstrap: Verifica se o banco está vazio
          // Usando findMany com limit 1 para performance e robustez
          const users = await db.query.user.findMany({
            limit: 1,
          });
          
          if (users.length === 0) {
            console.log("[DEBUG] Bootstrap mode: Allowing first user");
            return; // Libera o primeiro usuário sem convite
          }

          // 2. Verifica convite
          console.log("[DEBUG] Checking invite for email:", user.email);
          const invite = await db.query.invitations.findFirst({
            where: (invitations, { eq, and, gt, isNull }) =>
              and(
                eq(invitations.email, user.email),
                gt(invitations.expiresAt, new Date()), // Não expirado
                isNull(invitations.usedAt) // Não usado
              ),
          });

          if (!invite) {
             throw new Error("Cadastro restrito! Você precisa de um convite válido.");
          }

          return {
            data: {
              ...user,
            }
          }
        },
        
        /**
         * DEPOIS de criar usuário:
         * 1. Inicializa dados padrão (Categorias, Pagador).
         * 2. Marca convite como usado.
         */
        after: async (user) => {
          try {
            // Inicializa dados padrão
            await seedDefaultCategoriesForUser(user.id);
            await ensureDefaultPagadorForUser({
              id: user.id,
              name: user.name ?? undefined,
              email: user.email ?? undefined,
              image: user.image ?? undefined,
            });

            // Marca convite como usado (se existir)
            const invite = await db.query.invitations.findFirst({
              where: (invitations, { eq, and, gt, isNull }) =>
                and(
                  eq(invitations.email, user.email),
                  gt(invitations.expiresAt, new Date()),
                  isNull(invitations.usedAt)
                ),
            });

            if (invite) {
             await db
               .update(schema.invitations)
               .set({ usedAt: new Date() })
               .where(eq(schema.invitations.id, invite.id)); 
            }

          } catch (error) {
            console.error(
              "[Auth] Falha no pós-processamento do usuário:",
              error
            );
          }
        },

      },
    },
  },
});

// Aviso em desenvolvimento se Google OAuth não estiver configurado
if (!googleClientId && process.env.NODE_ENV === "development") {
  console.warn(
    "[Auth] Google OAuth não configurado. Defina GOOGLE_CLIENT_ID e GOOGLE_CLIENT_SECRET."
  );
}
