"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { useDeleteMe, useUpdateMe } from "@/lib/queries";
import { isEmail } from "@/lib/validation";
import type { UpdateMeInput, User } from "@/lib/types";
import { Alert, Button, Field, Input } from "./ui";

/** Envia só o que mudou. */
export function buildUpdate(user: User, values: { name: string; email: string; password: string }):
  | { ok: true; value: UpdateMeInput }
  | { ok: false; error: string } {
  const value: UpdateMeInput = {};
  const name = values.name.trim();
  const email = values.email.trim().toLowerCase();
  if (!name) return { ok: false, error: "Informe seu nome" };
  if (!isEmail(email)) return { ok: false, error: "Informe um e-mail válido" };
  if (values.password && values.password.length < 8) return { ok: false, error: "A senha deve ter no mínimo 8 caracteres" };
  if (name !== user.name) value.name = name;
  if (email !== user.email) value.email = email;
  if (values.password) value.password = values.password;
  if (Object.keys(value).length === 0) return { ok: false, error: "Nenhuma alteração para salvar" };
  return { ok: true, value };
}

export function AccountForm({ user }: { user: User }) {
  const router = useRouter();
  const [name, setName] = useState(user.name);
  const [email, setEmail] = useState(user.email);
  const [password, setPassword] = useState("");
  const [formError, setFormError] = useState<string>();
  const update = useUpdateMe();
  const remove = useDeleteMe();

  function onSubmit(event: FormEvent) {
    event.preventDefault();
    const result = buildUpdate(user, { name, email, password });
    if (!result.ok) return setFormError(result.error);
    setFormError(undefined);
    update.mutate(result.value, { onSuccess: () => setPassword("") });
  }

  return (
    <div className="space-y-8">
      <form onSubmit={onSubmit} className="space-y-4" noValidate>
        <Field label="Nome"><Input value={name} onChange={(e) => setName(e.target.value)} /></Field>
        <Field label="E-mail"><Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} /></Field>
        <Field label="Nova senha (opcional)">
          <Input type="password" autoComplete="new-password" value={password} onChange={(e) => setPassword(e.target.value)} />
        </Field>
        {formError && <Alert tone="error">{formError}</Alert>}
        {update.error && <Alert tone="error">{update.error.message}</Alert>}
        {update.isSuccess && !update.isPending && <Alert tone="success">Dados atualizados</Alert>}
        <Button type="submit" disabled={update.isPending}>{update.isPending ? "Salvando…" : "Salvar"}</Button>
      </form>

      <div className="space-y-2 border-t border-border pt-6">
        <h2 className="text-sm font-semibold text-danger">Excluir conta</h2>
        <p className="text-sm text-muted">Remove sua conta e todos os seus arquivos. Não dá para desfazer.</p>
        {remove.error && <Alert tone="error">{remove.error.message}</Alert>}
        <Button
          variant="secondary"
          className="text-danger"
          disabled={remove.isPending}
          onClick={() =>
            confirm("Excluir sua conta e todos os arquivos?") &&
            remove.mutate(undefined, { onSuccess: () => (router.push("/"), router.refresh()) })
          }
        >
          Excluir minha conta
        </Button>
      </div>
    </div>
  );
}
