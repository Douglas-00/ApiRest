import { Suspense } from "react";
import type { Metadata } from "next";
import { FileUpload } from "@/components/file-upload";
import { FilesList } from "@/components/files-list";
import { Card, Skeleton } from "@/components/ui";

export const metadata: Metadata = { title: "Meus arquivos" };

export default function FilesPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold tracking-tight">Meus arquivos</h1>
      <Card><FileUpload /></Card>
      <Card title="Arquivos">
        <Suspense fallback={<Skeleton className="h-40" />}>
          <FilesList />
        </Suspense>
      </Card>
    </div>
  );
}
