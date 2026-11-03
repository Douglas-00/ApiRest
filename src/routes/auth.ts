import { Router } from "express";
import bcrypt from "bcryptjs";
import type { PrismaClient } from "@prisma/client";
import { loginSchema } from "../validation";
import { HttpError } from "../errors";
import { signToken } from "../auth";
import type { Config } from "../config";

// Compared when the e-mail doesn't exist, so both failures cost the same.
const DUMMY_HASH = bcrypt.hashSync("timing-safe-dummy-password", 10);

export function authRoutes(prisma: PrismaClient, config: Config) {
  const router = Router();

  router.post("/login", async (req, res) => {
    const { email, password } = loginSchema.parse(req.body);
    const user = await prisma.user.findUnique({ where: { email } });
    const valid = await bcrypt.compare(password, user?.password ?? DUMMY_HASH);
    // The old API answered "user not found" vs "invalid password" (enumeration).
    if (!user || !valid) throw new HttpError(401, "E-mail ou senha inválidos");

    res.json({
      token: signToken(user.id, config.jwtSecret, config.jwtExpiresInSeconds),
      expiresIn: config.jwtExpiresInSeconds,
      user: { id: user.id, name: user.name, email: user.email },
    });
  });

  return router;
}
