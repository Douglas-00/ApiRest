import { Router } from "express";
import bcrypt from "bcryptjs";
import fs from "node:fs/promises";
import path from "node:path";
import type { PrismaClient } from "@prisma/client";
import { signUpSchema, updateMeSchema } from "../validation";
import { requireAuth } from "../auth";
import { HttpError } from "../errors";
import type { Config } from "../config";

const publicUser = { id: true, name: true, email: true, created_at: true } as const;
const BCRYPT_ROUNDS = 10;

/**
 * The old API let anyone update or delete any user by id. Now a user can only
 * change their own account (/users/me); listing requires authentication.
 */
export function userRoutes(prisma: PrismaClient, config: Config) {
  const router = Router();
  const auth = requireAuth(config.jwtSecret);

  router.post("/", async (req, res) => {
    const input = signUpSchema.parse(req.body);
    const user = await prisma.user.create({
      data: { ...input, password: await bcrypt.hash(input.password, BCRYPT_ROUNDS) },
      select: publicUser,
    });
    res.status(201).json(user);
  });

  router.get("/", auth, async (_req, res) => {
    res.json(await prisma.user.findMany({ select: publicUser, orderBy: { id: "asc" } }));
  });

  router.get("/me", auth, async (req, res) => {
    const user = await prisma.user.findUnique({ where: { id: req.userId }, select: publicUser });
    if (!user) throw new HttpError(404, "Usuário não encontrado");
    res.json(user);
  });

  router.put("/me", auth, async (req, res) => {
    const input = updateMeSchema.parse(req.body);
    const exists = await prisma.user.count({ where: { id: req.userId } });
    if (!exists) throw new HttpError(404, "Usuário não encontrado");
    const user = await prisma.user.update({
      where: { id: req.userId },
      data: {
        ...input,
        password: input.password ? await bcrypt.hash(input.password, BCRYPT_ROUNDS) : undefined,
      },
      select: publicUser,
    });
    res.json(user);
  });

  router.delete("/me", auth, async (req, res) => {
    const files = await prisma.file.findMany({ where: { userId: req.userId }, select: { storedName: true } });
    const { count } = await prisma.user.deleteMany({ where: { id: req.userId } });
    if (!count) throw new HttpError(404, "Usuário não encontrado");
    // Rows cascade in the database; remove the blobs from disk too.
    await Promise.all(files.map((f) => fs.rm(path.join(config.uploadDir, f.storedName), { force: true })));
    res.json({ message: "Conta excluída com sucesso" });
  });

  return router;
}
