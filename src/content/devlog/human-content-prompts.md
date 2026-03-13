---
title: Human Content Prompts
description: Slash commands that generate writing prompts from session context.
date: 2026-03-13
tags:
  - tooling
  - workflow
  - meta
  - agentic
  - skills
project: thejustinwalsh-github-io
draft: false
---

<!-- WRITING PROMPT — target 150-300 words
You added two custom Claude Code skills to your user account: /devlog and /article. Both analyze the current session's work and generate markdown drafts with correct frontmatter, writing prompts, and structure — dropped directly into the right content directory. The interesting bit is the content-type guardrail: /devlog checks if a topic is too broad and suggests /article instead (and vice versa), using AskUserQuestion to confirm before proceeding. Word targets enforce the distinction — 150-300 for devlog, 800-1500 for articles. Write this as a quick "here's what I rigged up and why" post.
-->

## Agents Prompting Humans

I want to write and share more of what I do, and I live in VS Code, Obsidian, and an agent TUI. While the dopamine drips from the AI pair programming session with infinite possibility, when is there time to write anything down?

My thesis is that reducing friction in the writing process using the data we have already collected in a coding session has the potential to turn anyone into an author.

So today I added a `/devlog` and `/article` command into my Claude user settings that reviews the work we have done via the agent session we are already in along with the recent git history. And if I don't write more, at least I have a snapshot of what I thought was important enough to share.

## What Changed

Created two Claude Code slash commands (`~/.claude/commands/devlog.md` and `article.md`) that generate content drafts from session context. Each command gathers conversation history and recent git activity, presents topic options, checks whether the topic fits devlog or article scope, and writes a properly frontmattered markdown file to the correct content directory of our developer website, and references the project that was being worked on.

## Notes

<!-- Bullet points: raw context, links, commands, file paths from the session -->

- Commands live in `~/.claude/commands/` (user-level, not project-level)
- `/devlog` targets `src/content/devlog/`, `/article` targets `src/content/articles/`
- Both use `AskUserQuestion` tool to confirm topic selection and content-type fit
- Word targets: devlog 150-300, article 800-1500
- Content-type crosscheck: each skill flags if the topic belongs in the other format
- Always sets `draft: true` — these are writing prompts, not published posts
