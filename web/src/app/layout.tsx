import type { Metadata } from "next";
import Link from "next/link";
import { Geist, Geist_Mono } from "next/font/google";
import { Providers } from "./providers";
import { HeaderNav } from "@/components/header-nav";
import "./globals.css";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  title: { default: "Cofre · Arquivos e perfis do GitHub", template: "%s · Cofre" },
  description: "Guarde seus arquivos com segurança e consulte perfis do GitHub.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="pt-BR" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col font-sans">
        <Providers>
          <header className="border-b border-border bg-surface">
            <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-x-4 gap-y-1 px-4 py-2 sm:h-14 sm:flex-nowrap sm:py-0">
              <Link href="/" className="flex items-center gap-2 font-semibold tracking-tight">
                <span aria-hidden className="grid size-6 place-items-center rounded-md bg-accent text-xs text-white">◆</span>
                Cofre
              </Link>
              <HeaderNav />
            </div>
          </header>
          <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-10">{children}</main>
        </Providers>
      </body>
    </html>
  );
}
