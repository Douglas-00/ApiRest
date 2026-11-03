import { PrismaClient } from "@prisma/client";
import { createApp } from "./app";
import { loadConfig } from "./config";

const config = loadConfig();
const prisma = new PrismaClient();
const server = createApp({ prisma, config }).listen(config.port, () =>
  console.log(`API running on http://localhost:${config.port}`),
);

for (const signal of ["SIGINT", "SIGTERM"] as const) {
  process.on(signal, () => {
    server.close(async () => {
      await prisma.$disconnect();
      process.exit(0);
    });
  });
}
