---
title: "tjw.dev"
description: "Justin Walsh's personal devlog and portfolio — a dark, fast, Astro-powered site for game dev writing, creative tech projects, and interactive experiments."
tags: [typescript]
status: active
draft: false
links:
  repo: https://github.com/thejustinwalsh/thejustinwalsh.github.io
  live: https://tjw.dev/
  discord: https://discord.gg/wPeUSfhkzf
---

This site is itself a project worth talking about. tjw.dev is a personal devlog and portfolio built with Astro, Tailwind CSS v4, and React islands — a stack chosen for its speed, flexibility, and zero-compromise static output. Content lives in Obsidian-first markdown files, making it easy to write and publish without leaving the tools already in daily use.

The design is deliberate and opinionated. Dark-only, with a palette drawn from the Chasm color set: near-black backgrounds, neon cyan and hot pink accents, and JetBrains Mono carrying the brand throughout navigation, headings, and code. The aesthetic bridges synthwave density and terminal utility — no gradient blobs, no glassmorphism, no AI-generated filler. Every element earns its place.

Under the hood, the site layers Obsidian callout syntax support, a full content collection for devlog posts and project pages, and a Catalyst UI Kit component foundation adapted to the custom design tokens. Deployed to GitHub Pages via pnpm, it stays fast and cheap to run while remaining easy to evolve. The source is public and serves as a reference for anyone building a similar Astro-based devlog.
