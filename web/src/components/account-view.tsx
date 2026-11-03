"use client";

import { useQuery } from "@tanstack/react-query";
import { meQuery } from "@/lib/queries";
import { useHydrated } from "@/lib/use-hydrated";
import { Alert, Skeleton } from "./ui";
import { AccountForm } from "./account-form";

export function AccountView() {
  const hydrated = useHydrated();
  const { data, error, isPending } = useQuery(meQuery());
  if (!hydrated || isPending) return <Skeleton className="h-64" />;
  if (error) return <Alert tone="error">{error.message}</Alert>;
  if (!data) return <Alert tone="error">Sua sessão expirou. Entre novamente.</Alert>;
  return <AccountForm key={data.id} user={data} />;
}
