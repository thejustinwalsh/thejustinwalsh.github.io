import type { APIRoute } from "astro";
import { getCollection } from "astro:content";
import Fuse from "fuse.js";
import { buildSearchEntries } from "@/lib/search-data";
import { FUSE_KEYS, FUSE_OPTIONS } from "@/lib/search-types";
import type { SearchEntry } from "@/lib/search-types";

export const GET: APIRoute = async () => {
  const [devlog, articles, projects] = await Promise.all([
    getCollection("devlog", ({ data }) => !data.draft),
    getCollection("articles", ({ data }) => !data.draft),
    getCollection("projects"),
  ]);

  const entries: SearchEntry[] = [
    ...buildSearchEntries("devlog", devlog),
    ...buildSearchEntries("articles", articles),
    ...buildSearchEntries("projects", projects),
  ];

  const index = Fuse.createIndex(FUSE_KEYS, entries);

  return new Response(
    JSON.stringify({ entries, index: index.toJSON() }),
    { headers: { "Content-Type": "application/json" } },
  );
};
