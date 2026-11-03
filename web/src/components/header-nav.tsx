"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { meQuery, useLogout } from "@/lib/queries";
import { Button } from "./ui";

const PRIVATE_LINKS = [
  ["/arquivos", "Arquivos"],
  ["/usuarios", "Usuários"],
  ["/conta", "Conta"],
] as const;

export function HeaderNav() {
  const router = useRouter();
  const pathname = usePathname();
  const { data: user, isPending } = useQuery(meQuery());
  const logout = useLogout();
  const link = (href: string, label: string) => (
    <Link
      key={href}
      href={href}
      aria-current={pathname === href ? "page" : undefined}
      className="px-2 py-2 text-muted hover:text-foreground aria-[current=page]:font-medium aria-[current=page]:text-foreground"
    >
      {label}
    </Link>
  );

  return (
    <nav className="-mx-2 flex items-center gap-1 overflow-x-auto text-sm">
      {link("/github", "GitHub")}
      {isPending ? null : user ? (
        <>
          {PRIVATE_LINKS.map(([href, label]) => link(href, label))}
          <Button
            variant="secondary"
            className="ml-1"
            disabled={logout.isPending}
            onClick={() => logout.mutate(undefined, { onSuccess: () => (router.push("/"), router.refresh()) })}
          >
            Sair
          </Button>
        </>
      ) : (
        <>
          {link("/entrar", "Entrar")}
          <Link href="/cadastro" className="ml-1 whitespace-nowrap rounded-lg bg-foreground px-3 py-2 font-medium text-background">
            Criar conta
          </Link>
        </>
      )}
    </nav>
  );
}
