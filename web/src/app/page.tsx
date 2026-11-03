import Link from "next/link";
import { GithubSearch } from "@/components/github-search";
import { Card } from "@/components/ui";

export default function Home() {
  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <div className="space-y-3 text-center">
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">Seus arquivos, só seus.</h1>
        <p className="text-muted">
          Envie arquivos de até 5 MB e baixe quando quiser. Cada arquivo pertence à sua conta e é guardado com um
          nome aleatório no servidor.
        </p>
        <div className="flex justify-center gap-2 pt-2">
          <Link href="/arquivos" className="rounded-lg bg-foreground px-4 py-2 text-sm font-medium text-background">Meus arquivos</Link>
          <Link href="/cadastro" className="rounded-lg border border-border bg-surface px-4 py-2 text-sm font-medium">Criar conta</Link>
        </div>
      </div>
      <Card title="Consultar perfil do GitHub" description="Disponível sem login. Resultados ficam em cache por 5 minutos.">
        <GithubSearch />
      </Card>
    </div>
  );
}
