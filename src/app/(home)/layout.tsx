import type { ReactNode } from "react";
import Link from "next/link";

export default function HomeLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <header className="sticky top-0 z-50 flex flex-wrap items-center justify-between gap-y-2 border-b border-fd-border bg-fd-background/80 px-4 py-3 backdrop-blur sm:px-6">
        <Link href="/" className="font-semibold text-fd-foreground">
          CrydenSync
        </Link>
        <nav className="flex flex-wrap items-center justify-end gap-x-3 gap-y-2 text-sm text-fd-muted-foreground sm:gap-x-5">
          <Link href="/docs">Docs</Link>
          <a href="https://discord.gg/xUCYcDBAWx" target="_blank" rel="noreferrer">Discord</a>
          <a
            href="https://chat.whatsapp.com/IkPWOYlnr4DI6zTzEC0g8m"
            target="_blank"
            rel="noreferrer"
          >
            WhatsApp
          </a>
          <a href="https://x.com/CrydenSync" target="_blank" rel="noreferrer">X</a>
          <a
            href="https://github.com/crydensync/cryden"
            target="_blank"
            rel="noreferrer"
            className="rounded-md border border-fd-border px-3 py-1.5 text-fd-foreground hover:bg-fd-accent"
          >
            ⭐ Star on GitHub
          </a>
        </nav>
      </header>
      {children}
    </>
  );
}
