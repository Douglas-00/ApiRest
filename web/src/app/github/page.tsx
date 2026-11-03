import type { Metadata } from "next";
import { GithubSearch } from "@/components/github-search";
import { Card } from "@/components/ui";

export const metadata: Metadata = { title: "Perfis do GitHub" };

export default function GithubPage() {
  return (
    <div className="mx-auto max-w-2xl">
      <Card title="Perfis do GitHub" description="Busca na API pública do GitHub, com cache de 5 minutos no servidor.">
        <GithubSearch />
      </Card>
    </div>
  );
}
