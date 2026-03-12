import { defineCollection, z } from "astro:content";
import { glob } from "astro/loaders";

const devlog = defineCollection({
  loader: glob({ pattern: "**/*.{md,mdx}", base: "./src/content/devlog" }),
  schema: z.object({
    title: z.string(),
    description: z.string().optional(),
    date: z.coerce.date(),
    tags: z.array(z.string()).default([]),
    project: z.string().optional(),
    draft: z.boolean().default(false),
  }),
});

const projects = defineCollection({
  loader: glob({ pattern: "**/*.{md,mdx}", base: "./src/content/projects" }),
  schema: z.object({
    title: z.string(),
    description: z.string().optional(),
    tags: z.array(z.string()).default([]),
    status: z.enum(["active", "completed", "archived", "prototype"]).optional(),
    hero: z.string().optional(),
    links: z
      .object({
        repo: z.string().url().optional(),
        live: z.string().url().optional(),
        store: z.string().url().optional(),
        docs: z.string().url().optional(),
        discord: z.string().url().optional(),
      })
      .optional(),
    featured: z.boolean().default(false),
    draft: z.boolean().default(false),
  }),
});

const articles = defineCollection({
  loader: glob({ pattern: "**/*.{md,mdx}", base: "./src/content/articles" }),
  schema: z.object({
    title: z.string(),
    description: z.string().optional(),
    date: z.coerce.date(),
    tags: z.array(z.string()).default([]),
    draft: z.boolean().default(false),
  }),
});

export const collections = { devlog, projects, articles };
