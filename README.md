# crydensync-web

The documentation site for [CrydenSync](https://github.com/crydensync/cryden) — built with
[Next.js 15](https://nextjs.org) and [Fumadocs](https://fumadocs.dev).

This repo is the **docs site only**. The auth engine itself, the CLI (`csax`), the HTTP API, and
the SDKs each live in their own repos under the `crydensync` org.

Live site: https://crydensync-docs.vercel.app

## Getting started

```bash
npm install
npm run dev
```

Open http://localhost:3000. The dev server hot-reloads on changes to both `src/` and
`content/docs/`.

To test a production build locally (closer to what actually deploys):

```bash
npm run build
npm run start
```

## Environment variables

Copy `.env.example` to `.env` and fill in as needed:

| Variable       | Required? | Purpose                                                                 |
| -------------- | --------- | ------------------------------------------------------------------------ |
| `AI_API_KEY`   | Optional  | Enables the `/ai` "Ask AI" page.                                        |
| `AI_BASE_URL`  | Optional  | Base URL of an OpenAI-compatible `/chat/completions` endpoint (NVIDIA NIM, OpenRouter, OpenAI, etc.) — **no** trailing `/chat/completions`, the app appends that itself. |
| `AI_MODEL`     | Optional  | Model name/ID to call at that endpoint.                                 |

The site works fine with none of these set — `/ai` just shows a "not configured yet" message and
falls back to keyword-matched doc links instead of a generated answer.

## Editing the docs

All doc content lives in `content/docs/**/*.mdx`. Each folder has a `meta.json` controlling
sidebar title and page order, e.g.:

```json
{ "title": "HTTP API", "pages": ["index", "endpoints", "authentication", "errors", "rate-limiting"] }
```

- `"index"` in a `pages` list refers to that folder's own `index.mdx` (its overview page) — it does
  **not** need its own subfolder.
- Every `.mdx` file needs frontmatter with `title` and `description` — `description` also becomes
  that page's meta description tag, so keep it a complete sentence rather than an arbitrary
  substring.
- Adding a new top-level section = new folder + `meta.json`, then add the folder's name to the
  root `content/docs/meta.json`'s `pages` array.

## Known footguns

- **`src/lib/source.ts` is a hand-rolled workaround**, not standard Fumadocs usage. The installed
  versions of `fumadocs-core`'s `loader()` and `fumadocs-mdx`'s `createMDXSource()` disagree on
  the shape of `.files`, and the standard `loader(docs.toFumadocsSource())` call throws at runtime.
  This file builds `getPage`/`getPages`/`pageTree` directly from `docs.docs` / `docs.meta` instead.
  If you touch this file, read its inline comments first — it has non-obvious handling for how
  index pages' slugs differ in length from every other page's.
- **The "Ask AI" retrieval scorer** (`src/lib/ai/retrieve.ts`) excludes common English stopwords
  from keyword scoring so specific terms aren't drowned out by "the"/"how"/"use". Don't add the
  product name ("crydensync") back to that stopword list — doing so previously caused broad
  questions like "What is CrydenSync?" to retrieve zero doc chunks.
- **Free/low-tier AI models can be slow or return an empty answer.** `src/app/api/ai/route.ts`
  sets an explicit `max_tokens` (reasoning models can otherwise exhaust the token budget on
  internal reasoning and return nothing) and a 45s timeout with a clear error message. If you
  switch `AI_MODEL` to something else, these may need retuning.

## Deploying

Auto-deploys on push via Vercel — no `vercel.json` needed, Next.js is auto-detected. Set the
`AI_*` environment variables in the Vercel project settings if you want Ask AI live; a redeploy is
required after changing them (env var changes don't apply to an already-running deployment).
