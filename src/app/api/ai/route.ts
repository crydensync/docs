import { NextRequest } from "next/server";
import { retrieveRelevantChunks } from "@/lib/ai/retrieve";

// This is intentionally provider-agnostic via env vars, not hardcoded
// to any one vendor — any OpenAI-compatible chat completions endpoint
// works here, which includes NVIDIA NIM endpoints, OpenAI itself,
// OpenRouter, or a self-hosted compatible server. Set these three to
// enable the feature; leaving them unset returns a clear
// "not configured yet" response instead of failing.
const API_KEY = process.env.AI_API_KEY;
const BASE_URL = process.env.AI_BASE_URL; // e.g. https://integrate.api.nvidia.com/v1
const MODEL = process.env.AI_MODEL; // e.g. an NVIDIA NIM model name

export async function POST(request: NextRequest) {
  const { question } = await request.json().catch(() => ({ question: "" }));

  if (!question || typeof question !== "string") {
    return Response.json({ error: "question is required" }, { status: 400 });
  }

  const chunks = retrieveRelevantChunks(question);

  if (!API_KEY || !BASE_URL || !MODEL) {
    return Response.json({
      answer:
        "Ask AI isn't configured yet on this deployment — set AI_API_KEY, AI_BASE_URL, and AI_MODEL " +
        "(e.g. pointed at an NVIDIA NIM endpoint) to enable it. In the meantime, here's what the docs " +
        "themselves say that seems most relevant to your question:",
      sources: chunks.map((c) => ({ title: c.title, url: c.url })),
      configured: false,
    });
  }

  const context = chunks
    .map((c) => `### ${c.title} (${c.url})\n${c.text.slice(0, 2000)}`)
    .join("\n\n---\n\n");

  const systemPrompt =
    "You are a documentation assistant for CrydenSync, an embeddable, framework-agnostic " +
    "authentication engine for Go. Answer the user's question using ONLY the documentation " +
    "excerpts provided below. If the excerpts don't contain enough information to answer " +
    "confidently, say so plainly rather than guessing. Be concise and technically precise. " +
    "When relevant, mention which doc page the information came from.\n\n" +
    context;

  // Free-tier reasoning models can be slow or get silently cut off mid-
  // response by the network stack before returning anything at all — that's
  // what surfaces as a bare `TypeError: terminated` with no HTTP status.
  // An explicit timeout turns that into one clear, actionable message
  // instead of a cryptic low-level error.
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 45_000);

  try {
    const res = await fetch(`${BASE_URL.replace(/\/$/, "")}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${API_KEY}`,
      },
      body: JSON.stringify({
        model: MODEL,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: question },
        ],
        temperature: 0.2,
        // Reasoning models (e.g. the nemotron ":free" variants) spend tokens
        // on an internal reasoning pass before writing the final answer.
        // Without an explicit ceiling here, the request falls back to the
        // provider's default max_tokens, which a long system prompt + doc
        // context can let the reasoning pass consume entirely — the call
        // still returns 200, but message.content comes back empty/null.
        // 1024 leaves room for both the reasoning trace and a real answer.
        max_tokens: 1024,
      }),
      signal: controller.signal,
    });

    if (!res.ok) {
      const errText = await res.text().catch(() => "");
      return Response.json(
        { error: `AI provider returned an error (${res.status}): ${errText.slice(0, 300)}` },
        { status: 502 }
      );
    }

    const data = await res.json();
    const message = data?.choices?.[0]?.message;
    // Some reasoning models put their output in a separate `reasoning`
    // field and leave `content` empty when the answer itself got cut off
    // (or never started) — fall back to it rather than reporting no
    // answer when the model actually said something.
    const answer =
      message?.content ||
      message?.reasoning ||
      "No answer was returned by the model.";

    return Response.json({
      answer,
      sources: chunks.map((c) => ({ title: c.title, url: c.url })),
      configured: true,
    });
  } catch (err) {
    if (err instanceof Error && err.name === "AbortError") {
      return Response.json(
        {
          error:
            "The AI provider took too long to respond (over 45s) and the request was cancelled. " +
            "This is common with free-tier models under load — try again, or switch AI_MODEL to a " +
            "faster / paid one.",
        },
        { status: 504 }
      );
    }
    return Response.json(
      { error: `Could not reach the configured AI provider: ${String(err)}` },
      { status: 502 }
    );
  } finally {
    clearTimeout(timeout);
  }
}
