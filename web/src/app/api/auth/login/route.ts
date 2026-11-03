import { cookies } from "next/headers";
import { sessionCookie, unavailable, upstream } from "@/server/session";

/** Troca e-mail/senha por um cookie httpOnly; o token nunca chega ao JS. */
export async function POST(req: Request) {
  let res: Response;
  try {
    res = await upstream("/auth/login", { method: "POST", body: await req.text() });
  } catch {
    return unavailable();
  }
  const body = await res.json().catch(() => ({}));
  if (!res.ok) return Response.json(body, { status: res.status });

  (await cookies()).set(sessionCookie(body.token, body.expiresIn));
  return Response.json({ ok: true });
}
