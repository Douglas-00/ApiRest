import path from "node:path";

export const TMP = path.join(__dirname, ".tmp");
export const TEST_ENV = {
  DATABASE_URL: `file:${path.join(TMP, "test.db")}`,
  UPLOAD_DIR: path.join(TMP, "uploads"),
  JWT_SECRET: "test-secret-with-enough-length",
  MAX_FILE_BYTES: String(64 * 1024),
};
