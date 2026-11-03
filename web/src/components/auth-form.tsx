"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { keys } from "@/lib/queries";
import { isEmail, validateSignUp } from "@/lib/validation";
import { Alert, Button, Field, Input } from "./ui";

/** Só aceita caminhos internos em ?next= (evita open redirect). */
export function safeNext(next: string | null): string {
  return next && next.startsWith("/") && !next.startsWith("//") ? next : "/arquivos";
}

export function AuthForm({ mode }: { mode: "login" | "register" }) {
  const router = useRouter();
  const params = useSearchParams();
  const queryClient = useQueryClient();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [formError, setFormError] = useState<string>();

  const mutation = useMutation({
    mutationFn: () =>
      mode === "login" ? api.login({ email, password }) : api.register({ name, email, password }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: keys.me });
      router.replace(safeNext(params.get("next")));
      router.refresh();
    },
  });

  function onSubmit(event: FormEvent) {
    event.preventDefault();
    const error =
      mode === "register"
        ? validateSignUp({ name, email, password })
        : !isEmail(email)
          ? "Informe um e-mail válido"
          : !password
            ? "Informe sua senha"
            : null;
    if (error) return setFormError(error);
    setFormError(undefined);
    mutation.mutate();
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4" noValidate>
      {mode === "register" && (
        <Field label="Nome">
          <Input autoComplete="name" value={name} onChange={(e) => setName(e.target.value)} />
        </Field>
      )}
      <Field label="E-mail">
        <Input type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} />
      </Field>
      <Field label="Senha">
        <Input
          type="password"
          autoComplete={mode === "login" ? "current-password" : "new-password"}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </Field>
      {formError && <Alert tone="error">{formError}</Alert>}
      {mutation.error && <Alert tone="error">{mutation.error.message}</Alert>}
      <Button type="submit" disabled={mutation.isPending} className="w-full">
        {mutation.isPending ? "Aguarde…" : mode === "login" ? "Entrar" : "Criar conta"}
      </Button>
      <p className="text-center text-sm text-muted">
        {mode === "login" ? (
          <>Ainda não tem conta? <Link href="/cadastro" className="text-accent">Cadastre-se</Link></>
        ) : (
          <>Já tem conta? <Link href="/entrar" className="text-accent">Entrar</Link></>
        )}
      </p>
    </form>
  );
}
