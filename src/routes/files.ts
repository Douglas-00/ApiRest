import { Router } from "express";
import multer from "multer";
import { randomUUID } from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import type { PrismaClient } from "@prisma/client";
import { requireAuth } from "../auth";
import { HttpError } from "../errors";
import { idParam } from "../validation";
import type { Config } from "../config";

const select = { id: true, originalName: true, mimeType: true, size: true, createdAt: true } as const;

/** Keeps only the base name and strips control characters. */
export function sanitizeFilename(name: string): string {
  const base = [...path.basename(name.replace(/\\/g, "/"))]
    .filter((ch) => ch.charCodeAt(0) > 31 && ch.charCodeAt(0) !== 127)
    .join("")
    .trim();
  return base.slice(0, 255) || "arquivo";
}

export function fileRoutes(prisma: PrismaClient, config: Config) {
  fs.mkdirSync(config.uploadDir, { recursive: true });
  const router = Router();
  router.use(requireAuth(config.jwtSecret));

  // Stored under a random UUID: the client-provided name never becomes a path.
  const upload = multer({
    storage: multer.diskStorage({
      destination: config.uploadDir,
      filename: (_req, _file, cb) => cb(null, randomUUID()),
    }),
    limits: { fileSize: config.maxFileBytes, files: 1 },
  });

  const owned = async (rawId: unknown, userId?: number) => {
    const id = idParam.parse(rawId);
    // Same 404 for "missing" and "someone else's file".
    const file = await prisma.file.findFirst({ where: { id, userId } });
    if (!file) throw new HttpError(404, "Arquivo não encontrado");
    return file;
  };

  router.post("/", upload.single("file"), async (req, res) => {
    const file = req.file;
    if (!file) throw new HttpError(400, 'Envie um arquivo no campo "file"');
    if (file.size === 0) {
      fs.rmSync(file.path, { force: true });
      throw new HttpError(400, "O arquivo está vazio");
    }
    // Multer decodes names as latin1; browsers send UTF-8.
    const originalName = sanitizeFilename(Buffer.from(file.originalname, "latin1").toString("utf8"));
    try {
      const saved = await prisma.file.create({
        data: {
          originalName,
          storedName: file.filename,
          mimeType: file.mimetype || "application/octet-stream",
          size: file.size,
          userId: req.userId!,
        },
        select,
      });
      res.status(201).json(saved);
    } catch (error) {
      fs.rmSync(file.path, { force: true });
      throw error;
    }
  });

  router.get("/", async (req, res) => {
    res.json(await prisma.file.findMany({ where: { userId: req.userId }, select, orderBy: { createdAt: "desc" } }));
  });

  router.get("/:id/download", async (req, res) => {
    const file = await owned(req.params.id, req.userId);
    // The old version looked for the file in a different folder than the
    // upload, so downloads always returned 404.
    const fullPath = path.join(config.uploadDir, file.storedName);
    if (!fs.existsSync(fullPath)) throw new HttpError(410, "O conteúdo do arquivo não está mais disponível");
    res.setHeader("X-Content-Type-Options", "nosniff");
    // The path is built by the API (UUID inside uploadDir), so dot-directories
    // in uploadDir are fine; send() would otherwise refuse them.
    res.download(fullPath, file.originalName, {
      dotfiles: "allow",
      headers: { "Content-Type": file.mimeType },
    });
  });

  router.delete("/:id", async (req, res) => {
    const file = await owned(req.params.id, req.userId);
    await prisma.file.delete({ where: { id: file.id } });
    fs.rmSync(path.join(config.uploadDir, file.storedName), { force: true });
    res.json({ message: "Arquivo excluído com sucesso" });
  });

  return router;
}
