import type { NextRequest } from "next/server";
import { cookies } from "next/headers";
import { SESSION_COOKIE, apiUrl, unavailable } from "@/server/session";

/**
 * Proxy BFF: repassa /api/* para a API anexando o JWT do cookie httpOnly.
 * O corpo é repassado como stream (uploads multipart) e os headers de
 * download (nome do arquivo, tipo, tamanho) voltam para o navegador.
 */
const ALLOWED_ROOTS = new Set(["files", "users", "github", "health"]);
const REQUEST_HEADERS = ["content-type", "content-length"];
const RESPONSE_HEADERS = ["content-type", "content-length", "content-disposition", "x-content-type-options", "x-cache"];

async function proxy(req: NextRequest, ctx: RouteContext<"/api/[...path]">) {
  const { path } = await ctx.params;
  if (!ALLOWED_ROOTS.has(path[0])) {
    return Response.json({ message: "Rota não encontrada" }, { status: 404 });
  }

  const jar = await cookies();
  const token = jar.get(SESSION_COOKIE)?.value;
  const headers = new Headers();
  for (const name of REQUEST_HEADERS) {
    const value = req.headers.get(name);
    if (value) headers.set(name, value);
  }
  if (token) headers.set("authorization", `Bearer ${token}`);
  const hasBody = req.method === "POST" || req.method === "PUT";

  let res: Response;
  try {
    res = await fetch(`${apiUrl()}/${path.map(encodeURIComponent).join("/")}${req.nextUrl.search}`, {
      method: req.method,
      headers,
      body: hasBody ? req.body : undefined,
      // Required by Node's fetch to stream a request body.
      ...(hasBody ? { duplex: "half" } : {}),
      cache: "no-store",
      signal: AbortSignal.timeout(30_000),
    } as RequestInit);
  } catch {
    return unavailable();
  }

  if (res.status === 401 && token) jar.delete(SESSION_COOKIE);
  if (res.ok && req.method === "DELETE" && path.join("/") === "users/me") jar.delete(SESSION_COOKIE);

  const out = new Headers();
  for (const name of RESPONSE_HEADERS) {
    const value = res.headers.get(name);
    if (value) out.set(name, value);
  }
  return new Response(res.body, { status: res.status, headers: out });
}

export { proxy as GET, proxy as POST, proxy as PUT, proxy as DELETE };
