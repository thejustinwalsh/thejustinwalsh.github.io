import type { APIRoute, GetStaticPaths } from "astro";
import { getCollection } from "astro:content";
import { buildSearchEntries } from "@/lib/search-data";

const COLLECTIONS = ["devlog", "articles", "projects"] as const;
type CollectionName = (typeof COLLECTIONS)[number];

export const getStaticPaths: GetStaticPaths = () =>
  COLLECTIONS.map((c) => ({ params: { collection: c } }));

export const GET: APIRoute = async ({ params }) => {
  const name = params.collection as CollectionName;

  const filter =
    name === "projects"
      ? undefined
      : ({ data }: { data: { draft: boolean } }) => !data.draft;

  const items = await getCollection(name, filter as any);
  const entries = buildSearchEntries(name, items);

  return new Response(JSON.stringify(entries), {
    headers: { "Content-Type": "application/json" },
  });
};
