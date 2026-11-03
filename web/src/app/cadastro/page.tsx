import { Suspense } from "react";
import type { Metadata } from "next";
import { AuthForm } from "@/components/auth-form";
import { Card, Skeleton } from "@/components/ui";

export const metadata: Metadata = { title: "Criar conta" };

export default function Page() {
  return (
    <div className="mx-auto max-w-sm">
      <Card title="Criar conta" description="Leva menos de um minuto">
        <Suspense fallback={<Skeleton className="h-64" />}>
          <AuthForm mode="register" />
        </Suspense>
      </Card>
    </div>
  );
}
