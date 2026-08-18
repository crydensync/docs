"use client";

import { useState } from "react";
import Link from "next/link";

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
    <main className="mx-auto flex min-h-screen max-w-2xl flex-col px-6 py-10">
      <div className="mb-6">
        <Link href="/" className="text-xs text-fd-muted-foreground hover:text-fd-foreground">
          ← Back home
        </Link>
        <h1 className="mt-2 text-2xl font-bold text-fd-foreground">✨ Ask AI about CrydenSync</h1>
        <p className="mt-1 text-sm text-fd-muted-foreground">
          Answers are grounded in the actual documentation — ask about the engine, the API, the
          CLI, the SDK, or why something was designed a certain way.
        </p>
      </div>

      <div className="flex-1 space-y-4 overflow-y-auto">
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
            <div className="whitespace-pre-wrap text-fd-foreground">{m.content}</div>
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

      <form onSubmit={handleSubmit} className="mt-6 flex gap-2">
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
