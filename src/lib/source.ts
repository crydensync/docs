import { docs } from "@/.source";

// fumadocs-core's loader() and this version of fumadocs-mdx's
// createMDXSource() disagree on whether `.files` is a plain array or
// a function returning one — calling docs.toFumadocsSource() and
// passing it into loader() throws ("files.map is not a function")
// due to that contract mismatch between the two packages' installed
// versions. docs.docs and docs.meta themselves are confirmed-working
// plain arrays, so this bypasses the broken bridge and builds exactly
// what this app needs (getPage, getPages, a simple pageTree for the
// sidebar) directly from them.

type DocEntry = (typeof docs.docs)[number];
type MetaEntry = (typeof docs.meta)[number];

function slugFromPath(path: string): string[] {
  const noExt = path.replace(/\.mdx$/, "");
  const parts = noExt.split("/");
  if (parts[parts.length - 1] === "index") parts.pop();
  return parts;
}

function urlFromSlug(slug: string[]): string {
  return slug.length === 0 ? "/docs" : `/docs/${slug.join("/")}`;
}

const allDocs = docs.docs.map((doc: DocEntry) => {
  const slug = slugFromPath(doc._file.path);
  return { doc, slug, url: urlFromSlug(slug) };
});

function findMeta(dirPath: string): MetaEntry | undefined {
  return docs.meta.find((m: MetaEntry) => {
    const metaDir = m._file.path.replace(/\/?meta\.json$/, "");
    return metaDir === dirPath;
  });
}

function buildTree(dirPath: string, urlPrefix: string[]): any[] {
  const meta = findMeta(dirPath);
  const order: string[] = meta?.pages ?? [];

  const directChildDocs = allDocs.filter((d) => {
    const parentDir = d.slug.slice(0, -1).join("/");
    return parentDir === dirPath && d.slug.length === urlPrefix.length + 1;
  });

  const childDirs = new Set(
    allDocs
      .filter((d) => d.slug.length > urlPrefix.length + 1)
      .map((d) => d.slug.slice(0, urlPrefix.length + 1).join("/"))
      .filter((dir) => dir !== dirPath)
  );

  const nodes: any[] = [];
  const seen = new Set<string>();

  const pushDocNode = (name: string) => {
    const d = directChildDocs.find((d) => d.slug[d.slug.length - 1] === name || (d.slug.length === urlPrefix.length && name === "index"));
    if (d && !seen.has(d.url)) {
      seen.add(d.url);
      nodes.push({ type: "page", name: d.doc.title, url: d.url });
    }
  };

  const pushFolderNode = (name: string) => {
    const folderDir = dirPath ? `${dirPath}/${name}` : name;
    if (!childDirs.has(folderDir)) return;
    const folderMeta = findMeta(folderDir);
    const children = buildTree(folderDir, [...urlPrefix, name]);
    nodes.push({
      type: "folder",
      name: folderMeta?.title ?? name,
      children,
    });
  };

  for (const name of order) {
    pushFolderNode(name);
    pushDocNode(name);
  }

  // catch anything not explicitly ordered in meta.json's "pages" list
  for (const d of directChildDocs) {
    if (!seen.has(d.url)) {
      seen.add(d.url);
      nodes.push({ type: "page", name: d.doc.title, url: d.url });
    }
  }

  return nodes;
}

export const source = {
  getPage(slug?: string[]): { url: string; data: DocEntry } | undefined {
    const target = urlFromSlug(slug ?? []);
    const found = allDocs.find((d) => d.url === target);
    return found ? { url: found.url, data: found.doc } : undefined;
  },
  getPages(): { url: string; data: DocEntry }[] {
    return allDocs.map((d) => ({ url: d.url, data: d.doc }));
  },
  generateParams(): { slug?: string[] }[] {
    return allDocs.map((d) => ({ slug: d.slug.length ? d.slug : undefined }));
  },
  get pageTree() {
    return {
      name: "CrydenSync",
      children: buildTree("", []),
    };
  },
};
