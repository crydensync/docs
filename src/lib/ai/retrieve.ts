import fs from "node:fs";
import path from "node:path";

const DOCS_DIR = path.join(process.cwd(), "content", "docs");

interface DocChunk {
  title: string;
  url: string;
  text: string;
}

/**
 * Walks content/docs, reading raw MDX files directly off disk rather
 * than through the compiled MDX pipeline — the compiled `body` export
 * is a React component tree, not practical to search as text. Since
 * this docs set is modest in size (~13k words total), re-reading files
 * per-request is simple and fast enough; a larger corpus would want
 * this cached or precomputed at build time instead.
 */
function loadAllChunks(): DocChunk[] {
  const chunks: DocChunk[] = [];

  function walk(dir: string, slugParts: string[]) {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      if (entry.name === "meta.json") continue;
      const fullPath = path.join(dir, entry.name);

      if (entry.isDirectory()) {
        walk(fullPath, [...slugParts, entry.name]);
        continue;
      }
      if (!entry.name.endsWith(".mdx")) continue;

      const raw = fs.readFileSync(fullPath, "utf-8");
      const frontmatterMatch = raw.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
      const body = frontmatterMatch ? frontmatterMatch[2] : raw;
      const titleMatch = raw.match(/title:\s*"([^"]+)"/);
      const title = titleMatch ? titleMatch[1] : entry.name;

      const nameSlug = entry.name === "index.mdx" ? [] : [entry.name.replace(/\.mdx$/, "")];
      const url = "/docs/" + [...slugParts, ...nameSlug].join("/");

      chunks.push({ title, url: url === "/docs/" ? "/docs" : url, text: body });
    }
  }

  walk(DOCS_DIR, []);
  return chunks;
}

// Common English words plus terms that appear in nearly every doc
// (the product name, generic connector words) are excluded from
// scoring — otherwise a query like "how do I use the CLI?" lets
// "the"/"how"/"use" (which appear dozens of times in every long page)
// drown out the one word that actually matters ("cli"), causing
// completely unrelated pages to outrank the actually relevant one
// purely because they're longer and contain more common words.
const STOPWORDS = new Set([
  "the", "a", "an", "is", "are", "was", "were", "be", "been", "being",
  "how", "what", "why", "when", "where", "who", "which", "does", "do",
  "did", "can", "could", "will", "would", "should", "and", "or", "but",
  "of", "to", "in", "on", "for", "with", "at", "by", "from", "up",
  "about", "into", "over", "after", "use", "using", "used", "get",
  "this", "that", "these", "those", "it", "its", "as", "not",
  "crydensync", // appears in nearly every doc's title/description
]);

function score(chunk: DocChunk, queryWords: string[]): number {
  const haystack = (chunk.title + " " + chunk.text).toLowerCase();
  let total = 0;
  for (const word of queryWords) {
    if (word.length < 3 || STOPWORDS.has(word)) continue;
    const titleHits = (chunk.title.toLowerCase().match(new RegExp(word, "g")) || []).length;
    const bodyHitsRaw = (haystack.match(new RegExp(word, "g")) || []).length;
    // Cap each word's body-hit contribution — a word repeated 40 times
    // in one long, otherwise-unrelated page shouldn't outweigh a word
    // appearing 3 times in the one page that's actually about it.
    const bodyHits = Math.min(bodyHitsRaw, 5);
    total += titleHits * 5 + bodyHits;
  }
  return total;
}

export function retrieveRelevantChunks(question: string, topN = 4): DocChunk[] {
  const words = question
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter(Boolean);

  const chunks = loadAllChunks();
  const scored = chunks
    .map((c) => ({ chunk: c, score: score(c, words) }))
    .filter((s) => s.score > 0)
    .sort((a, b) => b.score - a.score);

  return scored.slice(0, topN).map((s) => s.chunk);
}
