import path from "node:path";

export interface Config {
  port: number;
  jwtSecret: string;
  jwtExpiresInSeconds: number;
  uploadDir: string;
  maxFileBytes: number;
  githubToken?: string;
}

/** Validates the environment once and fails fast on startup. */
export function loadConfig(env: NodeJS.ProcessEnv = process.env): Config {
  const jwtSecret = env.JWT_SECRET;
  if (!jwtSecret || jwtSecret.length < 16) {
    throw new Error("JWT_SECRET must be set and have at least 16 characters");
  }
  return {
    port: Number(env.PORT ?? 3000),
    jwtSecret,
    jwtExpiresInSeconds: Number(env.JWT_EXPIRATION_TIME ?? 86_400),
    uploadDir: path.resolve(env.UPLOAD_DIR ?? "uploads"),
    maxFileBytes: Number(env.MAX_FILE_BYTES ?? 5 * 1024 * 1024),
    githubToken: env.GITHUB_TOKEN || undefined,
  };
}
