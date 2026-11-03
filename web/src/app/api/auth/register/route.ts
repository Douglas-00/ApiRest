import { cookies } from "next/headers";
import { sessionCookie, unavailable, upstream } from "@/server/session";

/** Cria a conta e já autentica, numa única chamada do navegador. */
export async function POST(req: Request) {
  const input = await req.json().catch(() => ({}));
  try {
    const created = await upstream("/users", { method: "POST", body: JSON.stringify(input) });
    if (!created.ok) return Response.json(await created.json().catch(() => ({})), { status: created.status });

    const login = await upstream("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email: input.email, password: input.password }),
    });
    const body = await login.json();
    if (!login.ok) return Response.json(body, { status: login.status });

    (await cookies()).set(sessionCookie(body.token, body.expiresIn));
    return Response.json({ ok: true }, { status: 201 });
  } catch {
    return unavailable();
  }
}
