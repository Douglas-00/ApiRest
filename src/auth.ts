import type { RequestHandler } from "express";
import jwt from "jsonwebtoken";
import { HttpError } from "./errors";

declare module "express-serve-static-core" {
  interface Request {
    userId?: number;
  }
}

export function signToken(userId: number, secret: string, expiresInSeconds: number) {
  return jwt.sign({ sub: String(userId) }, secret, { expiresIn: expiresInSeconds });
}

/** Requires "Authorization: Bearer <jwt>" and sets req.userId. */
export function requireAuth(secret: string): RequestHandler {
  return (req, _res, next) => {
    const [type, token] = req.headers.authorization?.split(" ") ?? [];
    if (type !== "Bearer" || !token) throw new HttpError(401, "Token de acesso não informado");
    try {
      const payload = jwt.verify(token, secret) as jwt.JwtPayload;
      req.userId = Number(payload.sub);
      next();
    } catch {
      throw new HttpError(401, "Token inválido ou expirado");
    }
  };
}
