#!/usr/bin/env node

/**
 * Syncs GitHub repos to src/content/projects/ markdown files.
 * Uses the `gh` CLI for GitHub API access (works with local auth and CI).
 *
 * Env vars:
 *   DISCORD_TOKEN   - Discord bot token (optional, for invite generation)
 *   DISCORD_SERVER    - Discord server ID (optional, for invite generation)
 *   GITHUB_USERNAME     - Override GitHub username (default: auto-detected via gh)
 *   ACTIVITY_MONTHS     - Months of recent activity (default: 6)
 */

import { readdir, readFile, writeFile, appendFile, mkdir } from "node:fs/promises";
import { join, extname } from "node:path";
import { fileURLToPath } from "node:url";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { createWriteStream } from "node:fs";
import { pipeline } from "node:stream/promises";

const execFileAsync = promisify(execFile);

const __dirname = fileURLToPath(new URL(".", import.meta.url));
const PROJECTS_DIR = join(__dirname, "..", "src", "content", "projects");
const STATS_FILE = join(__dirname, "..", "src", "data", "projects", "stats.json");

const DISCORD_TOKEN = process.env.DISCORD_TOKEN;
const DISCORD_SERVER = process.env.DISCORD_SERVER;
const ACTIVITY_MONTHS = parseInt(process.env.ACTIVITY_MONTHS || "6", 10);

// ---------------------------------------------------------------------------
// gh CLI helpers
// ---------------------------------------------------------------------------

async function gh(...args) {
  const { stdout } = await execFileAsync("gh", args, {
    maxBuffer: 10 * 1024 * 1024,
  });
  return stdout.trim();
}

async function ghJson(...args) {
  return JSON.parse(await gh(...args));
}

async function getUsername() {
  if (process.env.GITHUB_USERNAME) return process.env.GITHUB_USERNAME;
  return gh("api", "user", "--jq", ".login");
}

// ---------------------------------------------------------------------------
// Discord API helper
// ---------------------------------------------------------------------------

async function createDiscordInvite(channelId) {
  if (!DISCORD_TOKEN) return null;
  const res = await fetch(
    `https://discord.com/api/v10/channels/${channelId}/invites`,
    {
      method: "POST",
      headers: {
        Authorization: `Bot ${DISCORD_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ max_age: 0, max_uses: 0, unique: false }),
    },
  );
  if (!res.ok) {
    console.warn(
      `Discord invite creation failed for channel ${channelId}: ${res.status}`,
    );
    return null;
  }
  const data = await res.json();
  return `https://discord.gg/${data.code}`;
}

async function findDiscordChannelForProject(projectName) {
  if (!DISCORD_TOKEN || !DISCORD_SERVER) return null;
  try {
    const res = await fetch(
      `https://discord.com/api/v10/guilds/${DISCORD_SERVER}/channels`,
      {
        headers: { Authorization: `Bot ${DISCORD_TOKEN}` },
      },
    );
    if (!res.ok) return null;
    const channels = await res.json();
    const normalized = projectName.toLowerCase().replace(/[^a-z0-9]/g, "-");
    const match = channels.find(
      (ch) => ch.type === 0 && ch.name.includes(normalized),
    );
    if (match) return createDiscordInvite(match.id);
  } catch (e) {
    console.warn(`Discord channel lookup failed: ${e.message}`);
  }
  return null;
}

// ---------------------------------------------------------------------------
// Hero image resolution
// ---------------------------------------------------------------------------

const HERO_DIR = join(__dirname, "..", "public", "projects");

async function ensureHeroDir() {
  await mkdir(HERO_DIR, { recursive: true });
}

async function downloadImage(url, destPath) {
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(10000) });
    if (!res.ok || !res.body) return false;
    const contentType = res.headers.get("content-type") || "";
    if (!contentType.startsWith("image/")) return false;
    const ws = createWriteStream(destPath);
    await pipeline(res.body, ws);
    return true;
  } catch {
    return false;
  }
}

function imageExtFromUrl(url) {
  const pathname = new URL(url).pathname;
  const ext = extname(pathname).toLowerCase();
  if ([".png", ".jpg", ".jpeg", ".webp", ".svg", ".gif"].includes(ext)) return ext;
  return ".png";
}

function isCustomOgImage(url) {
  if (!url) return false;
  // GitHub's auto-generated OG images come from opengraph.githubassets.com
  return !url.includes("opengraph.githubassets.com");
}

async function findReadmeImage(owner, repoName) {
  try {
    const readme = await gh(
      "api",
      `repos/${owner}/${repoName}/readme`,
      "--jq",
      ".content",
    );
    if (!readme) return null;
    const decoded = Buffer.from(readme, "base64").toString("utf-8");
    // Match markdown images: ![alt](url) or HTML <img src="url">
    const mdMatch = decoded.match(/!\[[^\]]*\]\(([^)]+)\)/);
    if (mdMatch) return resolveImageUrl(mdMatch[1], owner, repoName);
    const htmlMatch = decoded.match(/<img[^>]+src=["']([^"']+)["']/i);
    if (htmlMatch) return resolveImageUrl(htmlMatch[1], owner, repoName);
  } catch {
    // no readme or parse error
  }
  return null;
}

function resolveImageUrl(url, owner, repo) {
  if (url.startsWith("http://") || url.startsWith("https://")) return url;
  // Relative path — resolve to raw.githubusercontent.com
  const clean = url.replace(/^\.\//, "");
  return `https://raw.githubusercontent.com/${owner}/${repo}/HEAD/${clean}`;
}

async function findWebsiteOgImage(homepageUrl) {
  if (!homepageUrl) return null;
  try {
    const res = await fetch(homepageUrl, {
      headers: { "User-Agent": "tjw-sync-projects/1.0" },
      signal: AbortSignal.timeout(5000),
    });
    if (!res.ok) return null;
    const html = await res.text();
    // Look for og:image meta tag
    const match = html.match(
      /<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i,
    ) || html.match(
      /<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:image["']/i,
    );
    if (match) {
      const imgUrl = match[1];
      // Resolve relative URLs against the homepage
      if (imgUrl.startsWith("http")) return imgUrl;
      return new URL(imgUrl, homepageUrl).href;
    }
  } catch {
    // timeout or fetch error
  }
  return null;
}

async function resolveHeroImage(repo, slug) {
  // Priority 1: Custom GitHub social preview
  if (isCustomOgImage(repo.openGraphImageUrl)) {
    const ext = imageExtFromUrl(repo.openGraphImageUrl);
    const dest = join(HERO_DIR, `${slug}${ext}`);
    if (await downloadImage(repo.openGraphImageUrl, dest)) {
      return `/projects/${slug}${ext}`;
    }
  }

  // Priority 2: OG image from project website
  if (repo.homepageUrl) {
    const ogUrl = await findWebsiteOgImage(repo.homepageUrl);
    if (ogUrl) {
      const ext = imageExtFromUrl(ogUrl);
      const dest = join(HERO_DIR, `${slug}${ext}`);
      if (await downloadImage(ogUrl, dest)) {
        return `/projects/${slug}${ext}`;
      }
    }
  }

  // Priority 3: First image in README
  const owner = repo.owner.login;
  const readmeImg = await findReadmeImage(owner, repo.name);
  if (readmeImg) {
    const ext = imageExtFromUrl(readmeImg);
    const dest = join(HERO_DIR, `${slug}${ext}`);
    if (await downloadImage(readmeImg, dest)) {
      return `/projects/${slug}${ext}`;
    }
  }

  return null;
}

// ---------------------------------------------------------------------------
// Heuristic: is the repo worth adding?
// ---------------------------------------------------------------------------

// ---------------------------------------------------------------------------
// npm helpers
// ---------------------------------------------------------------------------

/** Returns the npm package name if the repo has a published (non-private) package, else null. */
async function getNpmPackageName(repo) {
  try {
    const text = repo.packageJson?.text;
    if (!text) return null;
    const decoded = JSON.parse(text);
    if (decoded.private) return null;
    const npmRes = await fetch(
      `https://registry.npmjs.org/${encodeURIComponent(decoded.name)}`,
    );
    return npmRes.ok ? decoded.name : null;
  } catch {
    // no package.json or parse error
  }
  return null;
}

/** Fetch weekly npm downloads for a package. Returns 0 on failure. */
async function getNpmWeeklyDownloads(packageName) {
  if (!packageName) return 0;
  try {
    const res = await fetch(
      `https://api.npmjs.org/downloads/point/last-week/${encodeURIComponent(packageName)}`,
      { signal: AbortSignal.timeout(5000) },
    );
    if (!res.ok) return 0;
    const data = await res.json();
    return data.downloads || 0;
  } catch {
    return 0;
  }
}

// ---------------------------------------------------------------------------
// GitHub release helpers
// ---------------------------------------------------------------------------

/** Returns the number of releases from GraphQL data. */
function getReleaseCount(repo) {
  return repo.releases?.totalCount || 0;
}

/** Returns ISO date string of the most recent release from GraphQL data, or null. */
function getLatestReleaseDate(repo) {
  return repo.releases?.nodes?.[0]?.publishedAt || null;
}

function isRecentlyActive(repo) {
  const cutoff = new Date();
  cutoff.setMonth(cutoff.getMonth() - ACTIVITY_MONTHS);
  return new Date(repo.pushedAt) > cutoff;
}

// ---------------------------------------------------------------------------
// Scoring: weighted ranking for project ordering
// ---------------------------------------------------------------------------

const SCORE_WEIGHTS = {
  stars: 1,               // 1 point per star
  npmDownloads: 0.01,     // 1 point per 100 weekly downloads
  activityMax: 20,        // max bonus for activity, decays linearly over ACTIVITY_MONTHS
  hasReleases: 10,        // bonus for having any releases
  recentRelease: 25,      // bonus if latest release within ACTIVITY_MONTHS (decays)
  hasHomepage: 5,         // bonus for having a website URL
  hasDescription: 3,      // bonus for having a description
};

/** Returns a 0–1 freshness factor: 1.0 = just now, 0.0 = ACTIVITY_MONTHS ago or older. */
function freshness(isoDate) {
  if (!isoDate) return 0;
  const now = Date.now();
  const then = new Date(isoDate).getTime();
  const windowMs = ACTIVITY_MONTHS * 30 * 24 * 60 * 60 * 1000;
  const age = now - then;
  if (age <= 0) return 1;
  if (age >= windowMs) return 0;
  return 1 - age / windowMs;
}

/**
 * Compute a numeric score for ranking. Higher = more prominent.
 * Returns { score, signals } where signals is a debug-friendly summary.
 */
function computeScore(repo, { npmDownloads, releaseCount, latestReleaseDate }) {
  let score = 0;
  const signals = [];

  // Stars
  const starPoints = repo.stargazerCount * SCORE_WEIGHTS.stars;
  score += starPoints;
  if (repo.stargazerCount > 0) signals.push(`stars=${repo.stargazerCount}`);

  // npm weekly downloads
  const dlPoints = npmDownloads * SCORE_WEIGHTS.npmDownloads;
  score += dlPoints;
  if (npmDownloads > 0) signals.push(`npm=${npmDownloads}/wk`);

  // Activity freshness (linear decay over ACTIVITY_MONTHS)
  const actFresh = freshness(repo.pushedAt);
  if (actFresh > 0) {
    const actPoints = actFresh * SCORE_WEIGHTS.activityMax;
    score += actPoints;
    signals.push(`activity=${(actFresh * 100).toFixed(0)}%`);
  }

  // Releases
  if (releaseCount > 0) {
    score += SCORE_WEIGHTS.hasReleases;
    signals.push(`releases=${releaseCount}`);
  }

  // Recent release freshness
  if (latestReleaseDate) {
    const relFresh = freshness(latestReleaseDate);
    if (relFresh > 0) {
      score += relFresh * SCORE_WEIGHTS.recentRelease;
      signals.push(`release-fresh=${(relFresh * 100).toFixed(0)}%`);
    }
  }

  // Homepage / website URL
  if (repo.homepageUrl) {
    score += SCORE_WEIGHTS.hasHomepage;
    signals.push("homepage");
  }

  // Description
  if (repo.description) {
    score += SCORE_WEIGHTS.hasDescription;
    signals.push("desc");
  }

  return { score, signals };
}

/**
 * Gather all scoring signals for a repo (npm, releases, etc).
 * Returns { npmPackageName, npmDownloads, releaseCount, latestReleaseDate, score, signals }.
 */
async function gatherRepoSignals(repo) {
  const releaseCount = getReleaseCount(repo);
  const latestReleaseDate = getLatestReleaseDate(repo);
  const npmPackageName = await getNpmPackageName(repo);
  const npmDownloads = await getNpmWeeklyDownloads(npmPackageName);

  const { score, signals } = computeScore(repo, {
    npmDownloads,
    releaseCount,
    latestReleaseDate,
  });

  return { npmPackageName, npmDownloads, releaseCount, latestReleaseDate, score, signals };
}

/** A repo is worth adding if it has any meaningful signal at all. */
function isWorthAdding(repo, repoSignals) {
  if (repo.stargazerCount > 0) return true;
  if (isRecentlyActive(repo)) return true;
  if (repoSignals.releaseCount > 0) return true;
  if (repoSignals.npmPackageName) return true;
  if (repo.homepageUrl) return true;
  return false;
}

// ---------------------------------------------------------------------------
// Fetch repos via gh CLI
// ---------------------------------------------------------------------------

async function fetchUserRepos(username) {
  const repos = await ghJson(
    "api",
    "graphql",
    "-f",
    `query=query {
      user(login: "${username}") {
        repositories(first: 100, ownerAffiliations: OWNER, isFork: false, privacy: PUBLIC, orderBy: {field: STARGAZERS, direction: DESC}) {
          nodes {
            name
            owner { login }
            url
            homepageUrl
            description
            stargazerCount
            pushedAt
            isArchived
            primaryLanguage { name }
            openGraphImageUrl
            repositoryTopics(first: 20) { nodes { topic { name } } }
            releases(first: 1, orderBy: {field: CREATED_AT, direction: DESC}) {
              totalCount
              nodes { publishedAt }
            }
            packageJson: object(expression: "HEAD:package.json") {
              ... on Blob { text }
            }
          }
        }
      }
    }`,
    "--jq",
    ".data.user.repositories.nodes",
  );
  return repos;
}

async function fetchOrgRepos(username) {
  const orgsRaw = await gh(
    "api",
    `users/${username}/orgs`,
    "--jq",
    ".[].login",
  );
  const orgNames = orgsRaw.split("\n").filter(Boolean);

  const orgRepos = [];
  for (const orgName of orgNames) {
    try {
      const repos = await ghJson(
        "api",
        "graphql",
        "-f",
        `query=query {
          organization(login: "${orgName}") {
            repositories(first: 10, isFork: false, privacy: PUBLIC, orderBy: {field: STARGAZERS, direction: DESC}) {
              nodes {
                name
                owner { login }
                url
                homepageUrl
                description
                stargazerCount
                pushedAt
                isArchived
                primaryLanguage { name }
                openGraphImageUrl
                repositoryTopics(first: 20) { nodes { topic { name } } }
                releases(first: 1, orderBy: {field: CREATED_AT, direction: DESC}) {
                  totalCount
                  nodes { publishedAt }
                }
                packageJson: object(expression: "HEAD:package.json") {
                  ... on Blob { text }
                }
              }
            }
          }
        }`,
        "--jq",
        ".data.organization.repositories.nodes",
      );
      if (repos.length > 0) {
        const top = repos[0];
        top._org = orgName;
        orgRepos.push(top);
      }
    } catch (e) {
      console.warn(`  warn: could not fetch repos for org ${orgName}: ${e.message}`);
    }
  }

  return orgRepos;
}

// ---------------------------------------------------------------------------
// Existing projects
// ---------------------------------------------------------------------------

async function getExistingProjects() {
  const existing = new Map();
  try {
    const files = await readdir(PROJECTS_DIR);
    for (const file of files) {
      if (!file.endsWith(".md") && !file.endsWith(".mdx")) continue;
      const slug = file.replace(/\.mdx?$/, "");
      const content = await readFile(join(PROJECTS_DIR, file), "utf-8");
      existing.set(slug, content);
    }
  } catch {
    // projects dir might not exist yet
  }
  return existing;
}

function repoToSlug(repo) {
  const name = repo._org
    ? `${repo._org}-${repo.name}`
    : repo.name;
  return name.toLowerCase().replace(/[^a-z0-9-]/g, "-");
}

function existingProjectMatchesRepo(existing, repo) {
  const repoUrl = repo.url.toLowerCase();
  for (const [slug, content] of existing) {
    if (content.toLowerCase().includes(repoUrl)) return slug;
  }
  return null;
}

// ---------------------------------------------------------------------------
// Stats JSON — lives outside CODEOWNERS path for auto-commit
// ---------------------------------------------------------------------------

async function readStats() {
  try {
    return JSON.parse(await readFile(STATS_FILE, "utf-8"));
  } catch {
    return {};
  }
}

async function writeStats(stats) {
  await mkdir(join(__dirname, "..", "src", "data", "projects"), { recursive: true });
  await writeFile(STATS_FILE, JSON.stringify(stats, null, 2) + "\n");
}

function updateStats(stats, slug, repoSignals, repo) {
  const prev = stats[slug];
  const entry = {
    order: Math.round(repoSignals?.score || 0),
    stars: repo.stargazerCount || 0,
    npmDownloads: repoSignals?.npmDownloads || 0,
    lastActivity: repo.pushedAt ? repo.pushedAt.split("T")[0] : new Date().toISOString().split("T")[0],
  };
  const changed = !prev || Object.keys(entry).some((k) => prev[k] !== entry[k]);
  stats[slug] = entry;
  return changed;
}

// ---------------------------------------------------------------------------
// Generate project markdown
// ---------------------------------------------------------------------------

function inferTags(repo) {
  const tags = [];
  if (repo.primaryLanguage?.name) tags.push(repo.primaryLanguage.name.toLowerCase());
  const topics = repo.repositoryTopics?.nodes?.map((n) => n.topic.name) || [];
  tags.push(...topics.slice(0, 8));
  return [...new Set(tags)].slice(0, 10);
}

function inferStatus(repo) {
  if (repo.isArchived) return "archived";
  if (isRecentlyActive(repo)) return "active";
  return "completed";
}

async function generateProjectMarkdown(repo, slug, existingProjects, repoSignals) {
  const tags = inferTags(repo);
  const status = inferStatus(repo);

  const links = [];
  links.push(`  repo: ${repo.url}`);
  if (repo.homepageUrl) {
    const liveUrl = /^https?:\/\//.test(repo.homepageUrl)
      ? repo.homepageUrl
      : `https://${repo.homepageUrl}`;
    links.push(`  live: ${liveUrl}`);
  }

  const [discordUrl, heroPath] = await Promise.all([
    findDiscordChannelForProject(repo.name),
    resolveHeroImage(repo, slug),
  ]);
  if (discordUrl) {
    links.push(`  discord: ${discordUrl}`);
  }

  const title = repo.name
    .replace(/[-_]/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());

  const description = repo.description || `${title} - a GitHub project.`;
  const orgNote = repo._org
    ? `\nMaintained by the [${repo._org}](https://github.com/${repo._org}) organization.`
    : "";

  const lastActivity = repo.pushedAt ? repo.pushedAt.split("T")[0] : null;

  // Escape YAML strings: wrap in quotes and escape internal quotes/backslashes
  const yamlStr = (s) => `"${s.replace(/\\/g, "\\\\").replace(/"/g, '\\"')}"`;

  // Always set a hero — use downloaded image or the generic placeholder
  const hero = heroPath || "/placeholder-project.svg";

  return `---
title: ${yamlStr(title)}
description: ${yamlStr(description)}
tags: [${tags.join(", ")}]
status: ${status}
hero: ${hero}
links:
${links.join("\n")}
---

${description}${orgNote}
`;
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  const username = await getUsername();
  console.log(`Syncing projects for ${username}...`);
  await ensureHeroDir();

  const [userRepos, orgRepos, existingProjects, stats] = await Promise.all([
    fetchUserRepos(username),
    fetchOrgRepos(username),
    getExistingProjects(),
    readStats(),
  ]);

  const allRepos = [...userRepos, ...orgRepos];
  console.log(
    `Found ${userRepos.length} user repos, ${orgRepos.length} org repos (${allRepos.length} total, non-fork)`,
  );

  const newProjects = [];
  let statsUpdated = 0;

  for (const repo of allRepos) {
    const slug = repoToSlug(repo);
    const existingSlug = existingProjects.has(slug)
      ? slug
      : existingProjectMatchesRepo(existingProjects, repo);

    if (existingSlug) {
      // Update stats in JSON (not in the markdown file)
      const repoSignals = await gatherRepoSignals(repo);
      const changed = updateStats(stats, existingSlug, repoSignals, repo);
      if (changed) {
        console.log(
          `  stats: ${repo.owner.login}/${repo.name} (score=${Math.round(repoSignals.score)} [${repoSignals.signals.join(", ")}])`,
        );
        statsUpdated++;
      } else {
        console.log(`  skip: ${repo.owner.login}/${repo.name} (up to date)`);
      }
      continue;
    }

    const repoSignals = await gatherRepoSignals(repo);

    if (!isWorthAdding(repo, repoSignals)) {
      console.log(
        `  skip: ${repo.owner.login}/${repo.name} (no signals)`,
      );
      continue;
    }

    console.log(
      `  add:  ${repo.owner.login}/${repo.name} (score=${Math.round(repoSignals.score)} [${repoSignals.signals.join(", ")}])`,
    );
    const markdown = await generateProjectMarkdown(repo, slug, existingProjects, repoSignals);
    if (!markdown || !markdown.includes("title:")) {
      console.warn(`  warn: skipping ${slug} — generated markdown is invalid`);
      continue;
    }
    const filePath = join(PROJECTS_DIR, `${slug}.md`);
    await writeFile(filePath, markdown, "utf-8");
    newProjects.push(slug);

    // Also write stats for the new project
    updateStats(stats, slug, repoSignals, repo);
    existingProjects.set(slug, markdown);
  }

  // Always write the stats file
  await writeStats(stats);

  if (newProjects.length === 0 && statsUpdated === 0) {
    console.log("\nNo changes.");
  } else {
    if (newProjects.length > 0) {
      console.log(`\nAdded ${newProjects.length} new project(s):`);
      for (const slug of newProjects) {
        console.log(`  - src/content/projects/${slug}.md`);
      }
    }
    if (statsUpdated > 0) {
      console.log(`\nUpdated stats for ${statsUpdated} project(s) in project-stats.json`);
    }
  }

  if (process.env.GITHUB_OUTPUT) {
    await appendFile(
      process.env.GITHUB_OUTPUT,
      `new_projects=${newProjects.length}\n`,
    );
    await appendFile(
      process.env.GITHUB_OUTPUT,
      `project_list=${newProjects.join(",")}\n`,
    );
  }

  return newProjects.length;
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
