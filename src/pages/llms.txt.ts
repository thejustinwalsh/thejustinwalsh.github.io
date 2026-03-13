import type { APIRoute } from "astro";
import { getCollection } from "astro:content";
import { getProjectOrder } from "@/lib/project-stats";

export const GET: APIRoute = async () => {
  const projects = (await getCollection("projects", ({ data }) => !data.draft))
    .sort((a, b) => {
      if (a.data.featured !== b.data.featured) return a.data.featured ? -1 : 1;
      return getProjectOrder(b.id) - getProjectOrder(a.id);
    });

  const devlog = (await getCollection("devlog", ({ data }) => !data.draft))
    .sort((a, b) => b.data.date.valueOf() - a.data.date.valueOf())
    .slice(0, 20);

  const articles = (await getCollection("articles", ({ data }) => !data.draft))
    .sort((a, b) => b.data.date.valueOf() - a.data.date.valueOf());

  const lines: string[] = [];

  // Header
  lines.push("# tjw.dev");
  lines.push("");
  lines.push("> Devlog and portfolio of Justin Walsh — game dev, creative tech, and interactive experiences. Building tools for real-time graphics and audio on the web.");
  lines.push("");

  // Projects
  lines.push("## Projects");
  lines.push("");
  for (const project of projects) {
    const { title, description, links, status } = project.data;
    const url = `https://tjw.dev/projects/${project.id}`;
    const statusNote = status === "archived" ? " (archived)" : "";
    const desc = description || "";
    lines.push(`- [${title}](${url})${statusNote}: ${desc}`);
    if (links?.repo) lines.push(`  - Source: ${links.repo}`);
    if (links?.live) lines.push(`  - Live: ${links.live}`);
    if (links?.docs) lines.push(`  - Docs: ${links.docs}`);
  }
  lines.push("");

  // Devlog
  if (devlog.length > 0) {
    lines.push("## Recent Devlog");
    lines.push("");
    for (const post of devlog) {
      const date = post.data.date.toISOString().split("T")[0];
      const url = `https://tjw.dev/devlog/${post.id}`;
      lines.push(`- [${post.data.title}](${url}) (${date})`);
    }
    lines.push("");
  }

  // Articles
  if (articles.length > 0) {
    lines.push("## Articles");
    lines.push("");
    for (const article of articles) {
      const date = article.data.date.toISOString().split("T")[0];
      const url = `https://tjw.dev/articles/${article.id}`;
      const desc = article.data.description ? `: ${article.data.description}` : "";
      lines.push(`- [${article.data.title}](${url}) (${date})${desc}`);
    }
    lines.push("");
  }

  // Contact / links
  lines.push("## Links");
  lines.push("");
  lines.push("- GitHub: https://github.com/thejustinwalsh");
  lines.push("- X/Twitter: https://x.com/thejustinwalsh");
  lines.push("");

  return new Response(lines.join("\n"), {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
};
