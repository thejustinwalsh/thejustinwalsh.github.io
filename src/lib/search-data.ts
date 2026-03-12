import { extractAllKeywords } from "./keywords";
import type { SearchEntry } from "./search-types";

/**
 * Build SearchEntry[] from a raw Astro collection.
 * Shared by the per-collection chunk endpoints and the prebuilt index endpoint.
 */
export function buildSearchEntries(
  name: string,
  items: any[],
): SearchEntry[] {
  const keywords = extractAllKeywords(
    items.map((e) => ({ id: e.id, body: e.body ?? "" })),
  );

  const sorted = [...items].sort((a, b) => a.id.localeCompare(b.id));

  return sorted.map((e) => ({
    collection: name as SearchEntry["collection"],
    id: e.id,
    title: e.data.title,
    description: e.data.description ?? "",
    tags: e.data.tags,
    keywords: keywords.get(e.id) ?? "",
    href: `/${name}/${e.id}`,
    ...(e.data.date ? { date: e.data.date.toISOString() } : {}),
  }));
}
