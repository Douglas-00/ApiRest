import express from "express";
import type { PrismaClient } from "@prisma/client";
import type { Config } from "./config";
import { authRoutes } from "./routes/auth";
import { userRoutes } from "./routes/users";
import { fileRoutes } from "./routes/files";
import { githubRoutes } from "./routes/github";
import { errorHandler, notFound } from "./errors";

/** Builds the app with its dependencies injected (tests pass their own). */
export function createApp(deps: { prisma: PrismaClient; config: Config; fetch?: typeof fetch }) {
  const { prisma, config } = deps;
  const app = express();
  app.disable("x-powered-by");
  app.use(express.json({ limit: "100kb" }));

  app.get("/health", async (_req, res) => {
    await prisma.$queryRaw`SELECT 1`;
    res.json({ status: "ok" });
  });
  app.use("/auth", authRoutes(prisma, config));
  app.use("/users", userRoutes(prisma, config));
  app.use("/files", fileRoutes(prisma, config));
  app.use("/github", githubRoutes(config, deps.fetch));

  app.use(notFound);
  app.use(errorHandler);
  return app;
}
