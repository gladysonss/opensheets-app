import { getSessionCookie } from "better-auth/cookies";
import { NextRequest, NextResponse } from "next/server";

// Rotas protegidas que requerem autenticação
const PROTECTED_ROUTES = [
  "/ajustes",
  "/anotacoes",
  "/calendario",
  "/cartoes",
  "/categorias",
  "/contas",
  "/dashboard",
  "/insights",
  "/lancamentos",
  "/orcamentos",
  "/pagadores",
];

// Rotas públicas (não requerem autenticação)
const PUBLIC_AUTH_ROUTES = ["/login", "/signup"];

export async function proxy(request: NextRequest) {
  const sessionCookie = getSessionCookie(request);
  const { pathname } = request.nextUrl;

  // Redireciona usuários autenticados para longe das páginas de login/signup
  if (sessionCookie && PUBLIC_AUTH_ROUTES.includes(pathname)) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  // Redireciona usuários não autenticados tentando acessar rotas protegidas
  const isProtectedRoute = PROTECTED_ROUTES.some((route) =>
    pathname.startsWith(route)
  );

  if (!sessionCookie && isProtectedRoute) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  /*
   * Corresponde a todos os caminhos de requisição, exceto aqueles que começam com:
   * - api (rotas de API)
   * - _next/static (arquivos estáticos)
   * - _next/image (arquivos de otimização de imagem)
   * - favicon.ico (arquivo de favicon)
   */
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
