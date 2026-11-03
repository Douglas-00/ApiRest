import { Suspense } from "react";
import type { Metadata } from "next";
import { AuthForm } from "@/components/auth-form";
import { Card, Skeleton } from "@/components/ui";

export const metadata: Metadata = { title: "Entrar" };

export default function Page() {
  return (
    <div className="mx-auto max-w-sm">
      <Card title="Entrar" description="Acesse seus links">
        <Suspense fallback={<Skeleton className="h-64" />}>
          <AuthForm mode="login" />
        </Suspense>
      </Card>
    </div>
  );
}
