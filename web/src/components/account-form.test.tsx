import { describe, expect, it } from "vitest";
import { buildUpdate } from "./account-form";
import { safeNext } from "./auth-form";

const user = { id: 1, name: "Ana", email: "ana@x.com", created_at: "2026-01-01T00:00:00Z" };
const same = { name: "Ana", email: "ana@x.com", password: "" };

describe("buildUpdate", () => {
  it("envia só o que mudou", () => {
    expect(buildUpdate(user, { ...same, name: "Ana Souza" })).toEqual({ ok: true, value: { name: "Ana Souza" } });
    expect(buildUpdate(user, { ...same, email: " ANA@novo.com ", password: "senha-nova-1" })).toEqual({
      ok: true,
      value: { email: "ana@novo.com", password: "senha-nova-1" },
    });
  });

  it("valida e avisa quando não há mudança", () => {
    expect(buildUpdate(user, same)).toEqual({ ok: false, error: "Nenhuma alteração para salvar" });
    expect(buildUpdate(user, { ...same, email: "x" })).toEqual({ ok: false, error: "Informe um e-mail válido" });
    expect(buildUpdate(user, { ...same, password: "curta" })).toEqual({ ok: false, error: "A senha deve ter no mínimo 8 caracteres" });
  });
});

describe("safeNext", () => {
  it("volta para /arquivos e bloqueia redirecionamento externo", () => {
    expect(safeNext(null)).toBe("/arquivos");
    expect(safeNext("//evil.com")).toBe("/arquivos");
    expect(safeNext("/conta")).toBe("/conta");
  });
});
