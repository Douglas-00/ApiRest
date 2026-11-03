import { describe, expect, it } from "vitest";
import { isGithubUsername, MAX_FILE_BYTES, validateFile, validateSignUp } from "./validation";
import { formatBytes } from "./format";

const file = (size: number, name = "a.txt") => new File([new Uint8Array(size)], name);

describe("validateFile", () => {
  it("aceita arquivos entre 1 byte e 5 MB", () => {
    expect(validateFile(file(1))).toBeNull();
    expect(validateFile(file(MAX_FILE_BYTES))).toBeNull();
  });
  it("rejeita vazio e acima do limite", () => {
    expect(validateFile(file(0, "vazio.txt"))).toBe('"vazio.txt" está vazio');
    expect(validateFile(file(MAX_FILE_BYTES + 1, "grande.zip"))).toBe('"grande.zip" tem mais de 5 MB');
  });
});

describe("isGithubUsername", () => {
  it.each(["Douglas-00", "a", "a-b-c"])("aceita %s", (v) => expect(isGithubUsername(v)).toBe(true));
  it.each(["", "-a", "a-", "a--b", "a b", "x".repeat(40)])("rejeita %s", (v) => expect(isGithubUsername(v)).toBe(false));
});

describe("validateSignUp", () => {
  it("exige senha com 8+ caracteres", () => {
    expect(validateSignUp({ name: "Ana", email: "a@b.co", password: "1234567" })).toBe("A senha deve ter no mínimo 8 caracteres");
  });
});

describe("formatBytes", () => {
  it.each([
    [512, "512 B"],
    [1536, "1,5 KB"],
    [5 * 1024 * 1024, "5 MB"],
  ])("%i → %s", (n, s) => expect(formatBytes(n)).toBe(s));
});
