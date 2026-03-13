#!/usr/bin/env node

/**
 * Scans project frontmatter for GIF hero images and converts them to:
 *   - A poster PNG (first frame) in src/assets/projects/ for Astro image optimization
 *   - An mp4 video in public/projects/ for web playback
 *   - A webm video in public/projects/ for web playback
 *
 * Updates frontmatter to set hero to the poster PNG and adds heroVideo field.
 * Removes the original GIF after conversion.
 *
 * Requires ffmpeg to be installed.
 */

import { readdir, readFile, writeFile, unlink, mkdir } from "node:fs/promises";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { execFile } from "node:child_process";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);

const __dirname = fileURLToPath(new URL(".", import.meta.url));
const PROJECTS_DIR = join(__dirname, "..", "src", "content", "projects");
const ASSETS_DIR = join(__dirname, "..", "src", "assets", "projects");
const PUBLIC_DIR = join(__dirname, "..", "public", "projects");

async function ensureDirs() {
  await mkdir(ASSETS_DIR, { recursive: true });
  await mkdir(PUBLIC_DIR, { recursive: true });
}

/**
 * Parse YAML frontmatter from a markdown file.
 * Returns { frontmatter: string, body: string, data: Record<string, string> }
 */
function parseFrontmatter(content) {
  const match = content.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/);
  if (!match) return null;
  const frontmatter = match[1];
  const body = match[2];

  // Simple key extraction — we only need hero
  const data = {};
  for (const line of frontmatter.split("\n")) {
    const kv = line.match(/^(\w+):\s*(.+)$/);
    if (kv) data[kv[1]] = kv[2].trim();
  }
  return { frontmatter, body, data };
}

/**
 * Check if a hero path points to a GIF file.
 */
function isGifHero(heroValue) {
  if (!heroValue) return false;
  return heroValue.toLowerCase().endsWith(".gif");
}

/**
 * Resolve a frontmatter hero path to an absolute filesystem path.
 * Hero paths are relative to the content file: ../../assets/projects/foo.gif
 */
function resolveHeroPath(heroValue) {
  if (heroValue.startsWith("../../assets/projects/")) {
    const filename = heroValue.replace("../../assets/projects/", "");
    return join(ASSETS_DIR, filename);
  }
  return null;
}

/**
 * Extract the slug from a hero filename (without extension).
 */
function slugFromHero(heroValue) {
  const filename = heroValue.replace("../../assets/projects/", "");
  return filename.replace(/\.\w+$/, "");
}

/**
 * Convert a GIF to poster PNG + mp4 + webm.
 */
async function convertGif(gifPath, slug) {
  const posterPath = join(ASSETS_DIR, `${slug}.png`);
  const mp4Path = join(PUBLIC_DIR, `${slug}.mp4`);
  const webmPath = join(PUBLIC_DIR, `${slug}.webm`);

  // Extract first frame as PNG poster
  await execFileAsync("ffmpeg", [
    "-y", "-i", gifPath,
    "-frames:v", "1",
    posterPath,
  ]);

  // Convert to mp4
  await execFileAsync("ffmpeg", [
    "-y", "-i", gifPath,
    "-movflags", "faststart",
    "-pix_fmt", "yuv420p",
    "-vf", "scale=trunc(iw/2)*2:trunc(ih/2)*2",
    mp4Path,
  ]);

  // Convert to webm
  await execFileAsync("ffmpeg", [
    "-y", "-i", gifPath,
    "-c:v", "libvpx-vp9",
    "-b:v", "0",
    "-crf", "30",
    "-pix_fmt", "yuv420p",
    "-vf", "scale=trunc(iw/2)*2:trunc(ih/2)*2",
    webmPath,
  ]);

  return { posterPath, mp4Path, webmPath };
}

/**
 * Update frontmatter in a markdown file:
 * - Replace hero GIF path with poster PNG path
 * - Add heroVideo field pointing to the mp4
 */
function updateFrontmatter(content, slug) {
  const gifPattern = /^(hero:\s*).*\.gif\s*$/m;
  const newHero = `$1../../assets/projects/${slug}.png`;
  let updated = content.replace(gifPattern, newHero);

  // Add heroVideo after the hero line if not already present
  if (!updated.includes("heroVideo:")) {
    updated = updated.replace(
      /^(hero:\s*.+)$/m,
      `$1\nheroVideo: /projects/${slug}.mp4`,
    );
  }

  return updated;
}

async function main() {
  await ensureDirs();

  const files = await readdir(PROJECTS_DIR);
  const mdFiles = files.filter((f) => f.endsWith(".md") || f.endsWith(".mdx"));

  let converted = 0;

  for (const file of mdFiles) {
    const filePath = join(PROJECTS_DIR, file);
    const content = await readFile(filePath, "utf-8");
    const parsed = parseFrontmatter(content);
    if (!parsed) continue;

    const heroValue = parsed.data.hero;
    if (!isGifHero(heroValue)) continue;

    const gifPath = resolveHeroPath(heroValue);
    if (!gifPath) {
      console.warn(`  warn: cannot resolve GIF path for ${file}: ${heroValue}`);
      continue;
    }

    const slug = slugFromHero(heroValue);
    console.log(`  convert: ${file} — ${slug}.gif → mp4/webm + poster`);

    try {
      await convertGif(gifPath, slug);

      // Update frontmatter
      const updated = updateFrontmatter(content, slug);
      await writeFile(filePath, updated, "utf-8");

      // Remove original GIF
      await unlink(gifPath);
      console.log(`    done: removed ${slug}.gif, created poster + video`);
      converted++;
    } catch (err) {
      console.error(`    error converting ${slug}.gif: ${err.message}`);
    }
  }

  if (converted === 0) {
    console.log("No GIF hero images found to convert.");
  } else {
    console.log(`\nConverted ${converted} GIF(s) to video.`);
  }

  return converted;
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
