import type { ReactNode } from "react";
import Link from "next/link";

export default function HomeLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <header className="sticky top-0 z-50 flex items-center justify-between border-b border-fd-border bg-fd-background/80 px-6 py-3 backdrop-blur">
        <Link href="/" className="font-semibold text-fd-foreground">
          CrydenSync
        </Link>
        <nav className="flex items-center gap-5 text-sm text-fd-muted-foreground">
          <Link href="/docs">Docs</Link>
          {/* TODO: replace with the real Discord invite link */}
          <a href="#" target="_blank" rel="noreferrer">Discord</a>
          {/* TODO: replace with the real WhatsApp group invite link */}
          <a href="#" target="_blank" rel="noreferrer">WhatsApp</a>
          {/* TODO: replace with the real X/Twitter handle URL */}
          <a href="#" target="_blank" rel="noreferrer">X</a>
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
