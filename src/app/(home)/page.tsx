import Link from "next/link";

const codeExample = `package main

import (
    "context"
    "github.com/crydensync/cryden/v2"
    "github.com/crydensync/cryden/v2/store/memory"
)

func main() {
    engine, _ := cryden.New(cryden.Config{
        JWTSecret: "your-secret",
        Users:     memory.NewUserStore(),
        Sessions:  memory.NewSessionStore(),
        Audit:     memory.NewAuditStore(),
    })

    ctx := context.Background()
    cryden.SignUp(ctx, engine, "devray@example.com", "Pass@2026", "127.0.0.1")
    tokens, _ := cryden.Login(ctx, engine, "devray@example.com", "Pass@2026", "127.0.0.1", "cli")
}`;

export default function HomePage() {
  return (
    <main className="flex flex-1 flex-col items-center px-6 py-20 text-center">
      <a
        // TODO: point this at the real latest GitHub release tag once cut
        href="https://github.com/crydensync/cryden/releases"
        target="_blank"
        rel="noreferrer"
        className="mb-6 inline-flex items-center gap-2 rounded-full border border-fd-border bg-fd-card px-4 py-1.5 text-xs text-fd-muted-foreground hover:bg-fd-accent"
      >
        🎉 Latest release: v2.0.0
      </a>

      <h1 className="max-w-3xl text-4xl font-bold tracking-tight text-fd-foreground sm:text-5xl">
        Own your users.
      </h1>
      <p className="mt-4 max-w-xl text-fd-muted-foreground">
        An embeddable, framework-agnostic authentication engine for Go. Self-hosted.
        Zero telemetry. No vendor lock-in.
      </p>

      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <Link
          href="/docs"
          className="rounded-lg bg-fd-primary px-5 py-2.5 text-sm font-medium text-fd-primary-foreground hover:opacity-90"
        >
          Get Started →
        </Link>
        <Link
          href="/ai"
          className="rounded-lg border border-fd-border px-5 py-2.5 text-sm font-medium text-fd-foreground hover:bg-fd-accent"
        >
          ✨ Ask AI
        </Link>
        <Link
          href="/docs/guide/quick-start"
          className="rounded-lg border border-fd-border px-5 py-2.5 text-sm font-medium text-fd-foreground hover:bg-fd-accent"
        >
          Read the Quick Start
        </Link>
      </div>

      {/* Community links — TODO: replace every href below with the real
          invite/handle once created. Left as clearly-marked placeholders
          rather than guessed URLs, so nothing broken ships by accident. */}
      <div className="mt-6 flex flex-wrap items-center justify-center gap-4 text-xs text-fd-muted-foreground">
        <a
          href="https://github.com/crydensync/cryden" // TODO: confirm this is the canonical repo to star
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-1.5 hover:text-fd-foreground"
        >
          ⭐ Star on GitHub
        </a>
        <span className="text-fd-border">·</span>
        <a
          href="https://discord.gg/TODO-REPLACE-WITH-REAL-INVITE"
          target="_blank"
          rel="noreferrer"
          className="hover:text-fd-foreground"
        >
          Discord
        </a>
        <span className="text-fd-border">·</span>
        <a
          href="https://chat.whatsapp.com/TODO-REPLACE-WITH-REAL-INVITE"
          target="_blank"
          rel="noreferrer"
          className="hover:text-fd-foreground"
        >
          WhatsApp Group
        </a>
        <span className="text-fd-border">·</span>
        <a
          href="https://x.com/TODO_REPLACE_HANDLE"
          target="_blank"
          rel="noreferrer"
          className="hover:text-fd-foreground"
        >
          X / Twitter
        </a>
      </div>

      <div className="mt-14 w-full max-w-2xl overflow-hidden rounded-xl border border-fd-border bg-fd-card text-left shadow-sm">
        <div className="flex items-center gap-1.5 border-b border-fd-border px-4 py-2.5">
          <span className="h-2.5 w-2.5 rounded-full bg-red-400" />
          <span className="h-2.5 w-2.5 rounded-full bg-yellow-400" />
          <span className="h-2.5 w-2.5 rounded-full bg-green-400" />
          <span className="ml-2 text-xs text-fd-muted-foreground">main.go</span>
        </div>
        <pre className="overflow-x-auto p-4 text-xs leading-relaxed">
          <code>{codeExample}</code>
        </pre>
      </div>

      <p className="mt-4 text-xs text-fd-muted-foreground">
        No hosted service. No third-party database. Your Postgres, your users, your control.
      </p>
    </main>
  );
}
