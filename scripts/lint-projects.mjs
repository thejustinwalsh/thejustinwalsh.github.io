#!/usr/bin/env node
// Validates project markdown frontmatter against the content schema.
// Usage: node scripts/lint-projects.mjs [file...]
// If no files given, validates all files in src/content/projects/.

import { readFileSync, readdirSync } from "node:fs";
import { join, resolve } from "node:path";
import { load } from "js-yaml";
import { z } from "zod";

const projectSchema = z.object({
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
});

const projectsDir = resolve("src/content/projects");

const files =
  process.argv.length > 2
    ? process.argv.slice(2)
    : readdirSync(projectsDir)
        .filter((f) => f.endsWith(".md") || f.endsWith(".mdx"))
        .map((f) => join(projectsDir, f));

let errors = 0;

for (const file of files) {
  const content = readFileSync(file, "utf-8");
  const match = content.match(/^---\n([\s\S]*?)\n---/);

  if (!match) {
    console.error(`${file}: no frontmatter found`);
    errors++;
    continue;
  }

  let parsed;
  try {
    parsed = load(match[1]);
  } catch (e) {
    console.error(`${file}: invalid YAML — ${e.message}`);
    errors++;
    continue;
  }

  const result = projectSchema.safeParse(parsed);
  if (!result.success) {
    for (const issue of result.error.issues) {
      console.error(`${file}: ${issue.path.join(".")} — ${issue.message}`);
    }
    errors++;
  }
}

if (errors > 0) {
  console.error(`\n${errors} file(s) with errors`);
  process.exit(1);
} else {
  console.log(`${files.length} file(s) OK`);
}
