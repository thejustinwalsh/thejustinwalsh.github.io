export interface SearchEntry {
  collection: "devlog" | "articles" | "projects";
  id: string;
  title: string;
  description: string;
  tags: string[];
  keywords: string;
  href: string;
  date?: string;
}

export type SearchScope = "global" | "devlog" | "articles" | "projects";

export type SearchStatus =
  | "idle"
  | "loading"
  | "cached"
  | "revalidating"
  | "ready"
  | "updated"
  | "error";

export interface SearchManifest {
  version: string;
  chunks: Record<string, { hash: string; entries: number }>;
}

export const COLLECTIONS = ["devlog", "articles", "projects"] as const;

export const FUSE_KEYS: { name: keyof SearchEntry; weight: number }[] = [
  { name: "title", weight: 4 },
  { name: "tags", weight: 3 },
  { name: "description", weight: 2 },
  { name: "keywords", weight: 0.8 },
];

export const FUSE_OPTIONS = {
  keys: FUSE_KEYS,
  threshold: 0.35,
  includeScore: true,
  minMatchCharLength: 2,
} as const;
