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

  const childDirs = new Set(
    allDocs
      .filter((d) => d.slug.length > urlPrefix.length + 1)
      .map((d) => d.slug.slice(0, urlPrefix.length + 1).join("/"))
      .filter((dir) => dir !== dirPath)
  );

  // Used only for the catch-all step below (pages not explicitly listed in
  // meta.json). Must exclude folder index pages: e.g. api/index.mdx has its
  // trailing "index" stripped, leaving slug ["api"] — the same length a
  // genuine top-level page would have, and the same path as the "api"
  // folder itself. Without excluding it here, every folder's overview page
  // gets appended a second time as a stray sibling after its own folder.
  const directChildDocs = allDocs.filter((d) => {
    const parentDir = d.slug.slice(0, -1).join("/");
    const selfPath = d.slug.join("/");
    return (
      parentDir === dirPath &&
      d.slug.length === urlPrefix.length + 1 &&
      !childDirs.has(selfPath)
    );
  });

  const nodes: any[] = [];
  const seen = new Set<string>();

  const pushDocNode = (name: string) => {
    // "index" pages live one slug segment shallower than everything else in
    // this folder (content/docs/api/index.mdx has slug ["api"], not
    // ["api","index"]), so directChildDocs — which requires
    // slug.length === urlPrefix.length + 1 — can never contain them. Look
    // these up directly against allDocs instead, using the exact slug each
    // case implies, so folder overview pages actually make it into the tree.
    const targetSlug = name === "index" ? urlPrefix : [...urlPrefix, name];
    const d = allDocs.find((d) => d.slug.join("/") === targetSlug.join("/"));
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
    // A name in meta.json's "pages" list is either a folder or a page, never
    // both — but calling both push functions for every name isn't actually
    // safe to do unconditionally: an entry like "api" is meant to reference
    // the api/ folder, yet api/index.mdx's own (index-stripped) slug is
    // ["api"], the same slug pushDocNode would look for if "api" were a page
    // name. Calling both meant the folder's overview page got inserted a
    // second time as a sibling right after its own folder. Decide which one
    // "name" refers to before pushing, so each entry adds exactly one node.
    const folderDir = dirPath ? `${dirPath}/${name}` : name;
    if (childDirs.has(folderDir)) {
      pushFolderNode(name);
    } else {
      pushDocNode(name);
    }
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
