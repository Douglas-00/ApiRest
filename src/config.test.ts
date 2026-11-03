import path from "node:path";
import { loadConfig } from "./config";

describe("loadConfig", () => {
  it("applies defaults", () => {
    expect(loadConfig({ JWT_SECRET: "x".repeat(16) })).toMatchObject({
      port: 3000,
      jwtExpiresInSeconds: 86_400,
      uploadDir: path.resolve("uploads"),
      maxFileBytes: 5 * 1024 * 1024,
    });
  });

  it("requires a strong JWT secret (the old code hard-coded \"secret\")", () => {
    expect(() => loadConfig({})).toThrow("JWT_SECRET");
    expect(() => loadConfig({ JWT_SECRET: "secret" })).toThrow("JWT_SECRET");
  });
});
