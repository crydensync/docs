"use client";

import { useState } from "react";
import Link from "next/link";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface Source {
  title: string;
  url: string;
}

interface Message {
  role: "user" | "assistant";
  content: string;
  sources?: Source[];
  configured?: boolean;
}

// The model's replies come back as Markdown (**bold**, "- " lists, fenced
// code blocks, etc.) — rendering that as plain text left the literal
// asterisks/backticks visible instead of actually formatting anything.
// These map each Markdown element to the site's existing fd- design tokens
// so the chat matches the rest of the docs UI rather than pulling in a full
// typography plugin just for this one component.
const markdownComponents = {
  p: (props: React.ComponentPropsWithoutRef<"p">) => (
    <p className="mb-2 last:mb-0" {...props} />
  ),
  strong: (props: React.ComponentPropsWithoutRef<"strong">) => (
    <strong className="font-semibold text-fd-foreground" {...props} />
  ),
  ul: (props: React.ComponentPropsWithoutRef<"ul">) => (
    <ul className="mb-2 ml-4 list-disc space-y-1 last:mb-0" {...props} />
  ),
  ol: (props: React.ComponentPropsWithoutRef<"ol">) => (
    <ol className="mb-2 ml-4 list-decimal space-y-1 last:mb-0" {...props} />
  ),
  li: (props: React.ComponentPropsWithoutRef<"li">) => <li className="pl-1" {...props} />,
  h1: (props: React.ComponentPropsWithoutRef<"h1">) => (
    <h1 className="mb-2 mt-3 text-base font-semibold text-fd-foreground first:mt-0" {...props} />
  ),
  h2: (props: React.ComponentPropsWithoutRef<"h2">) => (
    <h2 className="mb-2 mt-3 text-base font-semibold text-fd-foreground first:mt-0" {...props} />
  ),
  h3: (props: React.ComponentPropsWithoutRef<"h3">) => (
    <h3 className="mb-1 mt-3 text-sm font-semibold text-fd-foreground first:mt-0" {...props} />
  ),
  a: (props: React.ComponentPropsWithoutRef<"a">) => (
    <a
      className="text-fd-primary underline underline-offset-2 hover:opacity-80"
      target="_blank"
      rel="noreferrer"
      {...props}
    />
  ),
  pre: (props: React.ComponentPropsWithoutRef<"pre">) => (
    <pre
      className="mb-2 overflow-x-auto rounded-md border border-fd-border bg-fd-background p-3 text-xs last:mb-0"
      {...props}
    />
  ),
  code: ({ className, ...props }: React.ComponentPropsWithoutRef<"code">) => {
    // Fenced code blocks get a `language-xxx` className from remark/rehype;
    // inline `code` spans don't — use that to avoid double-styling code
    // that's already inside the `pre` block above.
    const isBlock = Boolean(className);
    return isBlock ? (
      <code className={`${className ?? ""} font-mono text-xs`} {...props} />
    ) : (
      <code className="rounded bg-fd-accent px-1 py-0.5 font-mono text-[0.85em]" {...props} />
    );
  },
  blockquote: (props: React.ComponentPropsWithoutRef<"blockquote">) => (
    <blockquote
      className="mb-2 border-l-2 border-fd-border pl-3 text-fd-muted-foreground last:mb-0"
      {...props}
    />
  ),
};

export default function AiPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const question = input.trim();
    if (!question || loading) return;

    setMessages((prev) => [...prev, { role: "user", content: question }]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question }),
      });
      const data = await res.json();

      if (data.error) {
        setMessages((prev) => [...prev, { role: "assistant", content: `Error: ${data.error}` }]);
      } else {
        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: data.answer, sources: data.sources, configured: data.configured },
        ]);
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Something went wrong reaching the AI endpoint." },
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="mx-auto flex h-dvh max-w-2xl flex-col px-4 py-6 sm:px-6 sm:py-10">
      <div className="mb-4 shrink-0 sm:mb-6">
        <Link href="/" className="text-xs text-fd-muted-foreground hover:text-fd-foreground">
          ← Back home
        </Link>
        <h1 className="mt-2 text-xl font-bold text-fd-foreground sm:text-2xl">
          ✨ Ask AI about CrydenSync
        </h1>
        <p className="mt-1 text-sm text-fd-muted-foreground">
          Answers are grounded in the actual documentation — ask about the engine, the API, the
          CLI, the SDK, or why something was designed a certain way.
        </p>
      </div>

      {/*
        min-h-0 is required here: a flex child won't shrink below its content
        size by default, which silently defeats overflow-y-auto in a flex
        column — without it this list grows forever instead of scrolling,
        pushing the input form below the fold on mobile.
      */}
      <div className="min-h-0 flex-1 space-y-4 overflow-y-auto">
        {messages.length === 0 && (
          <p className="text-sm text-fd-muted-foreground">
            Try: &ldquo;Why does refresh token rotation revoke the whole session family?&rdquo;
          </p>
        )}
        {messages.map((m, i) => (
          <div
            key={i}
            className={`rounded-lg border border-fd-border p-4 text-sm ${
              m.role === "user" ? "bg-fd-accent" : "bg-fd-card"
            }`}
          >
            <div className="mb-1 text-xs font-medium text-fd-muted-foreground">
              {m.role === "user" ? "You" : "CrydenSync AI"}
            </div>
            <div className="text-fd-foreground">
              <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownComponents}>
                {m.content}
              </ReactMarkdown>
            </div>
            {m.configured === false && (
              <div className="mt-2 text-xs text-fd-muted-foreground">
                (Ask AI answer generation isn&apos;t configured on this deployment yet — showing
                the most relevant doc pages instead.)
              </div>
            )}
            {m.sources && m.sources.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-2">
                {m.sources.map((s) => (
                  <Link
                    key={s.url}
                    href={s.url}
                    className="rounded-full border border-fd-border px-2.5 py-1 text-xs text-fd-muted-foreground hover:bg-fd-accent"
                  >
                    {s.title}
                  </Link>
                ))}
              </div>
            )}
          </div>
        ))}
        {loading && <p className="text-sm text-fd-muted-foreground">Thinking...</p>}
      </div>

      <form onSubmit={handleSubmit} className="mt-4 flex shrink-0 gap-2 sm:mt-6">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask a question about CrydenSync..."
          className="flex-1 rounded-lg border border-fd-border bg-fd-card px-4 py-2.5 text-sm text-fd-foreground outline-none focus:border-fd-primary"
        />
        <button
          type="submit"
          disabled={loading}
          className="rounded-lg bg-fd-primary px-5 py-2.5 text-sm font-medium text-fd-primary-foreground hover:opacity-90 disabled:opacity-50"
        >
          Ask
        </button>
      </form>
    </main>
  );
}
