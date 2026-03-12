import { defineConfig } from "astro/config";
import mdx from "@astrojs/mdx";
import react from "@astrojs/react";
import sitemap from "@astrojs/sitemap";
import tailwindcss from "@tailwindcss/vite";
import remarkWikiLink from "remark-wiki-link";
import remarkCallout from "@r4ai/remark-callout";
import remarkPublicImages from "./src/lib/remark-public-images.ts";

export default defineConfig({
  site: "https://tjw.dev",
  integrations: [
    mdx(),
    react(),
    sitemap(),
  ],
  vite: {
    plugins: [tailwindcss()],
  },
  markdown: {
    remarkPlugins: [
      [remarkWikiLink, {
        pathFormat: "obsidian-short",
        wikiLinkResolver: (name) => {
          const slug = name
            .trim()
            .toLowerCase()
            .replace(/\s+/g, "-");
          return [slug];
        },
        hrefTemplate: (permalink) => {
          const collections = ["projects", "articles", "devlog"];
          for (const col of collections) {
            if (permalink.startsWith(`${col}/`)) return `/${permalink}`;
          }
          return `/devlog/${permalink}`;
        },
      }],
      remarkCallout,
      remarkPublicImages,
    ],
    shikiConfig: {
      themes: {
        light: "github-light",
        dark: "github-dark",
      },
    },
  },
});
