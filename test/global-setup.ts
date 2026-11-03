import { execSync } from "node:child_process";
import fs from "node:fs";
import { TEST_ENV, TMP } from "./paths";

/** Fresh SQLite file with all migrations applied, once per test run. */
export default function globalSetup() {
  fs.rmSync(TMP, { recursive: true, force: true });
  fs.mkdirSync(TMP, { recursive: true });
  execSync("npx prisma migrate deploy", { env: { ...process.env, ...TEST_ENV }, stdio: "ignore" });
}
