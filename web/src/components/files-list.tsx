"use client";

import { useQuery } from "@tanstack/react-query";
import { filesQuery, useDeleteFile } from "@/lib/queries";
import { downloadUrl } from "@/lib/api";
import { formatBytes, formatDate } from "@/lib/format";
import { Alert, Button, EmptyState, Skeleton } from "./ui";

/** Short type label from the extension (font-independent, unlike emoji). */
export const fileLabel = (name: string) => {
  const ext = name.includes(".") ? name.split(".").pop()!.slice(0, 4).toUpperCase() : "";
  return ext || "ARQ";
};

export function FilesList() {
  const { data, error, isPending, refetch } = useQuery(filesQuery());
  const remove = useDeleteFile();

  if (isPending) {
    return (
      <div className="space-y-2" aria-label="Carregando arquivos">
        {Array.from({ length: 3 }, (_, i) => <Skeleton key={i} className="h-14" />)}
      </div>
    );
  }
  if (error) {
    return (
      <div className="space-y-3">
        <Alert tone="error">Não foi possível carregar seus arquivos: {error.message}</Alert>
        <Button variant="secondary" onClick={() => refetch()}>Tentar novamente</Button>
      </div>
    );
  }
  if (data.length === 0) {
    return <EmptyState title="Nenhum arquivo ainda">Os arquivos que você enviar aparecem aqui.</EmptyState>;
  }

  const total = data.reduce((sum, f) => sum + f.size, 0);
  return (
    <div className="space-y-3">
      <p className="text-sm text-muted">
        {data.length} {data.length === 1 ? "arquivo" : "arquivos"} · {formatBytes(total)}
      </p>
      {remove.error && <Alert tone="error">{remove.error.message}</Alert>}
      <ul className="divide-y divide-border">
        {data.map((file) => (
          <li key={file.id} className="flex items-center justify-between gap-3 py-3">
            <div className="flex min-w-0 items-center gap-3">
              <span
                aria-hidden
                className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-accent-soft font-mono text-[10px] font-semibold text-accent"
              >
                {fileLabel(file.originalName)}
              </span>
              <div className="min-w-0">
                <p className="truncate text-sm font-medium" title={file.originalName}>{file.originalName}</p>
                <p className="text-xs text-muted">{formatBytes(file.size)} · {formatDate(file.createdAt)}</p>
              </div>
            </div>
            <div className="flex shrink-0 gap-2">
              <a
                href={downloadUrl(file.id)}
                download
                aria-label={`Baixar ${file.originalName}`}
                className="inline-flex h-9 items-center rounded-lg border border-border bg-surface px-3 text-sm font-medium hover:bg-background"
              >
                Baixar
              </a>
              <Button
                variant="secondary"
                className="text-danger"
                aria-label={`Excluir ${file.originalName}`}
                disabled={remove.isPending}
                onClick={() => confirm(`Excluir "${file.originalName}"?`) && remove.mutate(file.id)}
              >
                Excluir
              </Button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
