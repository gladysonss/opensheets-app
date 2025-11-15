import { createAuthClient } from "better-auth/react";

const baseURL = process.env.BETTER_AUTH_URL?.replace(/\/$/, "");

export const authClient = createAuthClient({
  ...(baseURL ? { baseURL } : {}),
});

/**
 * Indica se o login com Google está habilitado
 * Baseado na variável de ambiente NEXT_PUBLIC_GOOGLE_OAUTH_ENABLED
 */
export const googleSignInAvailable = Boolean(
  process.env.NEXT_PUBLIC_GOOGLE_OAUTH_ENABLED
);
