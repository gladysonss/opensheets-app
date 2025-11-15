/**
 * Server-side authentication utilities
 *
 * This module consolidates server-side auth functions from:
 * - /lib/get-user.tsx
 * - /lib/get-user-id.tsx
 * - /lib/get-user-session.tsx
 *
 * All functions in this module are server-side only and will redirect
 * to /login if the user is not authenticated.
 */

import { auth } from "@/lib/auth/config";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

/**
 * Gets the current authenticated user
 * @returns User object
 * @throws Redirects to /login if user is not authenticated
 */
export async function getUser() {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session?.user) {
    redirect("/login");
  }

  return session.user;
}

/**
 * Gets the current authenticated user ID
 * @returns User ID string
 * @throws Redirects to /login if user is not authenticated
 */
export async function getUserId() {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session?.user) {
    redirect("/login");
  }

  return session.user.id;
}

/**
 * Gets the current authenticated session
 * @returns Full session object including user
 * @throws Redirects to /login if user is not authenticated
 */
export async function getUserSession() {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session?.user) {
    redirect("/login");
  }

  return session;
}

/**
 * Gets the current session without requiring authentication
 * @returns Session object or null if not authenticated
 * @note This function does not redirect if user is not authenticated
 */
export async function getOptionalUserSession() {
  return auth.api.getSession({ headers: await headers() });
}
