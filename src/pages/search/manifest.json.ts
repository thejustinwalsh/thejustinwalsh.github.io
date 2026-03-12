import type { APIRoute } from "astro";
import { getCollection } from "astro:content";
import { createHash } from "node:crypto";

function hashEntries(entries: { id: string; body?: string }[]): string {
  const sorted = [...entries].sort((a, b) => a.id.localeCompare(b.id));
  const content = sorted.map((e) => `${e.id}:${e.body ?? ""}`).join("\n");
  return createHash("sha256").update(content).digest("hex").slice(0, 12);
}

export const GET: APIRoute = async () => {
  const [devlog, articles, projects] = await Promise.all([
    getCollection("devlog", ({ data }) => !data.draft),
    getCollection("articles", ({ data }) => !data.draft),
    getCollection("projects"),
  ]);

  const chunks: Record<string, { hash: string; entries: number }> = {
    devlog: { hash: hashEntries(devlog), entries: devlog.length },
    articles: { hash: hashEntries(articles), entries: articles.length },
    projects: { hash: hashEntries(projects), entries: projects.length },
  };

  const version = createHash("sha256")
    .update(Object.values(chunks).map((c) => c.hash).join(":"))
    .digest("hex")
    .slice(0, 12);

  return new Response(JSON.stringify({ version, chunks }), {
    headers: { "Content-Type": "application/json" },
  });
};
