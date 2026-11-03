"use client";

import { useQuery } from "@tanstack/react-query";
import { meQuery, usersQuery } from "@/lib/queries";
import { formatDate } from "@/lib/format";
import { Alert, Badge, EmptyState, Skeleton } from "./ui";

export function UsersList() {
  const { data, error, isPending } = useQuery(usersQuery());
  const { data: me } = useQuery(meQuery());

  if (isPending) return <Skeleton className="h-40" />;
  if (error) return <Alert tone="error">Não foi possível carregar os usuários: {error.message}</Alert>;
  if (data.length === 0) return <EmptyState title="Nenhum usuário" />;

  return (
    <ul className="divide-y divide-border">
      {data.map((u) => (
        <li key={u.id} className="flex items-center justify-between gap-3 py-3 text-sm">
          <div>
            <p className="font-medium">
              {u.name} {u.id === me?.id && <Badge tone="accent">você</Badge>}
            </p>
            <p className="text-muted">{u.email}</p>
          </div>
          <span className="text-xs text-muted">desde {formatDate(u.created_at)}</span>
        </li>
      ))}
    </ul>
  );
}
