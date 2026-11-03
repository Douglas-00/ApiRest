"use client";

import { useState, type FormEvent } from "react";
import Image from "next/image";
import { useMutation } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { isGithubUsername } from "@/lib/validation";
import { formatCount } from "@/lib/format";
import { Alert, Button, Input } from "./ui";

export function GithubSearch() {
  const [username, setUsername] = useState("");
  const [formError, setFormError] = useState<string>();
  const search = useMutation({ mutationFn: (u: string) => api.github(u) });

  function onSubmit(event: FormEvent) {
    event.preventDefault();
    if (!isGithubUsername(username)) return setFormError("Informe um nome de usuário do GitHub válido");
    setFormError(undefined);
    search.mutate(username.trim());
  }

  const profile = search.data;
  return (
    <div className="space-y-4">
      <form onSubmit={onSubmit} className="flex gap-2" noValidate>
        <Input aria-label="Usuário do GitHub" value={username} onChange={(e) => setUsername(e.target.value)} placeholder="Douglas-00" />
        <Button type="submit" disabled={search.isPending} className="shrink-0">
          {search.isPending ? "Buscando…" : "Buscar"}
        </Button>
      </form>
      {formError && <Alert tone="error">{formError}</Alert>}
      {search.error && <Alert tone="error">{search.error.message}</Alert>}
      {profile && (
        <article className="flex gap-4 rounded-xl border border-border p-4">
          <Image src={profile.avatarUrl} alt={`Avatar de ${profile.login}`} width={72} height={72} className="size-18 rounded-full" />
          <div className="min-w-0 space-y-1">
            <h2 className="font-semibold">{profile.name ?? profile.login}</h2>
            <a href={profile.htmlUrl} target="_blank" rel="noreferrer" className="text-sm text-accent">@{profile.login}</a>
            {profile.bio && <p className="text-sm">{profile.bio}</p>}
            {profile.location && <p className="text-sm text-muted">{profile.location}</p>}
            <dl className="flex gap-4 pt-1 text-sm">
              {[
                ["Repositórios", profile.publicRepos],
                ["Seguidores", profile.followers],
                ["Seguindo", profile.following],
              ].map(([label, value]) => (
                <div key={label}>
                  <dt className="text-xs text-muted">{label}</dt>
                  <dd className="font-mono font-medium">{formatCount(value as number)}</dd>
                </div>
              ))}
            </dl>
          </div>
        </article>
      )}
    </div>
  );
}
