import { Suspense } from "react";
import type { Metadata } from "next";
import { UsersList } from "@/components/users-list";
import { Card, Skeleton } from "@/components/ui";

export const metadata: Metadata = { title: "Usuários" };

export default function UsersPage() {
  return (
    <div className="mx-auto max-w-2xl">
      <Card title="Usuários" description="Visível apenas para quem está logado. Senhas nunca saem da API.">
        <Suspense fallback={<Skeleton className="h-40" />}>
          <UsersList />
        </Suspense>
      </Card>
    </div>
  );
}
