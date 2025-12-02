import { db, schema } from "@/lib/db";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

export type AuthResult =
  | { user: typeof schema.user.$inferSelect; error: null; status: 200 }
  | { user: null; error: string; status: number };

export async function authenticateRequest(request: Request): Promise<AuthResult> {
  const authHeader = request.headers.get("Authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return {
      error: "Authorization header is missing or malformed",
      status: 401,
      user: null,
    };
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

export function handleAuthError(error: string, status: number) {
  return new NextResponse(JSON.stringify({ error }), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}
