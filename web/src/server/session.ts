import "server-only";

export const SESSION_COOKIE = "session";

export const apiUrl = () => process.env.API_URL ?? "http://localhost:3000";

/** httpOnly: invisível para JS (protege contra XSS roubar o token).
 * sameSite=lax: o cookie não vai em POSTs de outros sites (CSRF). */
export function sessionCookie(token: string, expiresInSeconds: number) {
  return {
    name: SESSION_COOKIE,
    value: token,
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production" && process.env.INSECURE_COOKIES !== "true",
    path: "/",
    maxAge: expiresInSeconds,
  };
}

export async function upstream(path: string, init: RequestInit & { token?: string } = {}) {
  const { token, headers, ...rest } = init;
  return fetch(`${apiUrl()}${path}`, {
    ...rest,
    headers: {
      "content-type": "application/json",
      ...(token ? { authorization: `Bearer ${token}` } : {}),
      ...headers,
    },
    cache: "no-store",
    signal: AbortSignal.timeout(10_000),
  });
}

export const unavailable = () =>
  Response.json({ message: "API do Cofre indisponível" }, { status: 502 });
