import { Suspense } from "react";
import type { Metadata } from "next";
import { AccountView } from "@/components/account-view";
import { Card, Skeleton } from "@/components/ui";

export const metadata: Metadata = { title: "Minha conta" };

export default function AccountPage() {
  return (
    <div className="mx-auto max-w-md">
      <Card title="Minha conta">
        <Suspense fallback={<Skeleton className="h-64" />}>
          <AccountView />
        </Suspense>
      </Card>
    </div>
  );
}
