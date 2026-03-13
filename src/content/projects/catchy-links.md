---
title: "Catchy Links"
description: "A self-hosted link shortener that generates collision-free, human-friendly slugs backed by Upstash Redis on Vercel."
tags: [typescript, nextjs, vercel, upstash, redis, url-shortener]
status: completed
links:
  repo: https://github.com/thejustinwalsh/catchy-links
  live: https://catchy-links.vercel.app
  discord: https://discord.gg/RUGMPjy9UM

---

Catchy Links is a self-hosted URL shortener built for developers who want memorable, shareable links without depending on a third-party service mining their data. It was born from a concrete problem: sharing enormously long lz-string–encoded URLs from a TypeScript playground into Discord felt terrible, so the solution was to build something better from scratch.

Instead of sequential IDs or random hashes, Catchy Links generates slugs from a seeded pool of friendly-word combinations. Each slug maps to a deterministic, reversible 32-bit integer range — meaning no collisions until more than 4.2 billion links have been created, and every link can be decoded back to its source. The system locks slug generation to your own domain by default, keeping the service genuinely self-contained. Rate limiting protects against cost-spike abuse on serverless infrastructure.

The stack is lean and deployment-ready: Next.js handles routing and the API, Upstash provides a serverless Redis backend, and the whole thing deploys to Vercel in a few commands. Optional Sentry integration covers error monitoring. The result is a link shortener that respects ownership — your domain, your data, your rules — while being simple enough to fork and adapt for any project that needs readable, stable short URLs.
