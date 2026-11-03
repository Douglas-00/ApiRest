import { NextResponse, type NextRequest } from "next/server";

const SESSION_COOKIE = "session";
const PRIVATE = ["/arquivos", "/usuarios", "/conta"];

/** Redireciona antes de renderizar; a API valida o token em cada chamada. */
export function proxy(request: NextRequest) {
  const loggedIn = request.cookies.has(SESSION_COOKIE);
  const { pathname } = request.nextUrl;

  if (PRIVATE.some((p) => pathname.startsWith(p)) && !loggedIn) {
    const url = new URL("/entrar", request.url);
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }
  if ((pathname === "/entrar" || pathname === "/cadastro") && loggedIn) {
    return NextResponse.redirect(new URL("/arquivos", request.url));
  }
  return NextResponse.next();
}

export const config = { matcher: ["/arquivos/:path*", "/usuarios/:path*", "/conta/:path*", "/entrar", "/cadastro"] };
