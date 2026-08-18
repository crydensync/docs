import { source } from "@/lib/source";
import { NextRequest } from "next/server";

// The default fumadocs-core createFromSource() advanced search indexer
// crashes at build time in this project's dependency combination
// (fumadocs-core 15.8.5 / fumadocs-mdx 11.10.1) — it expects each
// page's structuredData.headings to be populated in a shape our pages
// don't produce, and throws inside its own internal formatter rather
// than in application code. Rather than chase a third-party library
// internals bug, this is a simple, self-written page-level search:
// title/description matching only, no in-page heading search. Good
// enough for a docs set this size; worth revisiting for finer-grained
// search once the upstream shape mismatch is understood or a newer
// fumadocs-core version fixes it.
export async function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams.get("query")?.toLowerCase().trim();
  if (!query) return Response.json([]);

  const pages = source.getPages();
  const results = pages
    .map((page) => {
      const title = page.data.title ?? "";
      const description = page.data.description ?? "";
      const haystack = `${title} ${description}`.toLowerCase();
      if (!haystack.includes(query)) return null;
      return {
        id: page.url,
        url: page.url,
        type: "page" as const,
        content: title,
      };
    })
    .filter((r): r is NonNullable<typeof r> => r !== null);

  return Response.json(results);
}
