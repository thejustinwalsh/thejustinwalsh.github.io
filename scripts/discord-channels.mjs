#!/usr/bin/env node

/**
 * Find or create Discord channels for project files and update frontmatter.
 *
 * For each project markdown file passed as an argument:
 *   1. Reads the frontmatter to get repo URL, live URL, and existing discord link
 *   2. Searches the Discord guild for a matching channel (by name slug or topic URL)
 *   3. If no channel exists, creates one with the project name and sets the topic
 *   4. Generates a permanent invite link (max_age=0, max_uses=0)
 *   5. Updates the project frontmatter with the discord link
 *
 * Env vars:
 *   DISCORD_TOKEN  - Required. Discord bot token with channel management perms.
 *   DISCORD_SERVER   - Required. The Discord server ID.
 *   DISCORD_CATEGORY - Optional. Category to create channels under.
 */

import { readFile, writeFile } from "node:fs/promises";

const BOT_TOKEN = process.env.DISCORD_TOKEN;
const GUILD_ID = process.env.DISCORD_SERVER;
const CATEGORY_ID = process.env.DISCORD_CATEGORY || null;

if (!BOT_TOKEN || !GUILD_ID) {
  console.log("DISCORD_TOKEN and DISCORD_SERVER are required. Skipping.");
  process.exit(0);
}

const API = "https://discord.com/api/v10";
const headers = {
  Authorization: `Bot ${BOT_TOKEN}`,
  "Content-Type": "application/json",
};

// ---------------------------------------------------------------------------
// Discord API helpers
// ---------------------------------------------------------------------------

async function fetchGuildChannels() {
  const res = await fetch(`${API}/guilds/${GUILD_ID}/channels`, { headers });
  if (!res.ok) {
    console.error(`Failed to fetch guild channels: ${res.status}`);
    return [];
  }
  return res.json();
}

async function createChannel(name, topic) {
  const body = {
    name,
    type: 0, // GUILD_TEXT
    topic,
  };
  if (CATEGORY_ID) {
    body.parent_id = CATEGORY_ID;
  }
  const res = await fetch(`${API}/guilds/${GUILD_ID}/channels`, {
    method: "POST",
    headers,
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const err = await res.text();
    console.error(`Failed to create channel "${name}": ${res.status} ${err}`);
    return null;
  }
  return res.json();
}

async function createInvite(channelId) {
  const res = await fetch(`${API}/channels/${channelId}/invites`, {
    method: "POST",
    headers,
    body: JSON.stringify({ max_age: 0, max_uses: 0, unique: false }),
  });
  if (!res.ok) {
    console.error(`Failed to create invite for channel ${channelId}: ${res.status}`);
    return null;
  }
  const data = await res.json();
  return `https://discord.gg/${data.code}`;
}

// ---------------------------------------------------------------------------
// Channel matching
// ---------------------------------------------------------------------------

function findMatchingChannel(channels, slug, repoUrl, liveUrl) {
  const normalized = slug.toLowerCase();

  for (const ch of channels) {
    if (ch.type !== 0) continue; // text channels only

    // Match by channel name
    if (ch.name === normalized || ch.name.includes(normalized)) {
      return ch;
    }

    // Match by topic containing the repo or live URL
    if (ch.topic) {
      const topic = ch.topic.toLowerCase();
      if (repoUrl && topic.includes(repoUrl.toLowerCase())) return ch;
      if (liveUrl && topic.includes(liveUrl.toLowerCase())) return ch;
    }
  }

  return null;
}

// ---------------------------------------------------------------------------
// Frontmatter parsing
// ---------------------------------------------------------------------------

function parseFrontmatter(content) {
  const match = content.match(/^---\n([\s\S]*?)\n---/);
  if (!match) return { fm: "", body: content, raw: "" };
  return {
    raw: match[0],
    fm: match[1],
    body: content.slice(match[0].length),
  };
}

function getFmValue(fm, key) {
  const match = fm.match(new RegExp(`^\\s*${key}:\\s*(.+)$`, "m"));
  return match ? match[1].trim() : null;
}

function getNestedFmValue(fm, parent, key) {
  // Match indented key under a parent block
  const blockMatch = fm.match(new RegExp(`^${parent}:\\s*\\n((?:\\s+.+\\n?)*)`, "m"));
  if (!blockMatch) return null;
  const block = blockMatch[1];
  const valMatch = block.match(new RegExp(`^\\s+${key}:\\s*(.+)$`, "m"));
  return valMatch ? valMatch[1].trim() : null;
}

function setNestedFmValue(fm, parent, key, value) {
  // Check if the parent block and key exist
  const blockMatch = fm.match(new RegExp(`(^${parent}:\\s*\\n)((?:\\s+.+\\n?)*)`, "m"));
  if (!blockMatch) {
    // No links block at all — add one
    return fm + `\nlinks:\n  ${key}: ${value}\n`;
  }

  const blockStart = blockMatch.index + blockMatch[1].length;
  const block = blockMatch[2];
  const keyRegex = new RegExp(`^(\\s+${key}:)\\s*.+$`, "m");
  const keyMatch = block.match(keyRegex);

  if (keyMatch) {
    // Replace existing value
    const replaced = block.replace(keyRegex, `$1 ${value}`);
    return fm.slice(0, blockStart) + replaced + fm.slice(blockStart + block.length);
  } else {
    // Append key to the block
    const inserted = block + `  ${key}: ${value}\n`;
    return fm.slice(0, blockStart) + inserted + fm.slice(blockStart + block.length);
  }
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  const files = process.argv.slice(2);
  if (files.length === 0) {
    console.log("Usage: discord-channels.mjs <file1.md> [file2.md] ...");
    process.exit(0);
  }

  console.log(`Processing ${files.length} project file(s)...`);
  const channels = await fetchGuildChannels();
  if (channels.length === 0) {
    console.error("No channels found or failed to fetch. Exiting.");
    process.exit(1);
  }

  for (const filePath of files) {
    const content = await readFile(filePath, "utf-8");
    const { fm, body } = parseFrontmatter(content);
    if (!fm) {
      console.log(`  skip: ${filePath} (no frontmatter)`);
      continue;
    }

    // Skip draft projects
    const draft = getFmValue(fm, "draft");
    if (draft === "true") {
      console.log(`  skip: ${filePath} (draft)`);
      continue;
    }

    const repoUrl = getNestedFmValue(fm, "links", "repo");
    const liveUrl = getNestedFmValue(fm, "links", "live");
    const existingDiscord = getNestedFmValue(fm, "links", "discord");

    // Derive slug from filename
    const slug = filePath.split("/").pop().replace(/\.mdx?$/, "");
    const title = getFmValue(fm, "title")?.replace(/^["']|["']$/g, "") || slug;

    console.log(`  ${slug}:`);

    // Check if existing discord link is still valid
    if (existingDiscord) {
      try {
        const res = await fetch(existingDiscord, {
          method: "HEAD",
          redirect: "follow",
          signal: AbortSignal.timeout(5000),
        });
        if (res.ok) {
          console.log(`    existing discord link valid: ${existingDiscord}`);
          continue;
        }
      } catch {
        // invalid — will re-create
      }
      console.log(`    existing discord link dead, finding replacement...`);
    }

    // Find matching channel
    let channel = findMatchingChannel(channels, slug, repoUrl, liveUrl);

    if (channel) {
      console.log(`    found channel: #${channel.name}`);
    } else {
      // Create the channel
      const channelName = slug.slice(0, 100); // Discord 100 char limit
      const topic = [repoUrl, liveUrl].filter(Boolean).join(" | ");
      console.log(`    creating channel: #${channelName}`);
      channel = await createChannel(channelName, topic);
      if (!channel) {
        console.log(`    failed to create channel, skipping`);
        continue;
      }
      // Add to local list so subsequent projects can find it
      channels.push(channel);
    }

    // Create permanent invite
    const inviteUrl = await createInvite(channel.id);
    if (!inviteUrl) {
      console.log(`    failed to create invite, skipping`);
      continue;
    }
    console.log(`    invite: ${inviteUrl}`);

    // Update frontmatter
    const updatedFm = setNestedFmValue(fm, "links", "discord", inviteUrl);
    const updatedContent = `---\n${updatedFm}\n---${body}`;
    await writeFile(filePath, updatedContent, "utf-8");
    console.log(`    updated frontmatter`);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
