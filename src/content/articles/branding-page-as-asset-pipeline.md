---
title: The Branding Page as an Asset Pipeline
description: Why a dev-only HTML page is a better source of truth for brand assets than any design tool.
date: 2026-03-13
tags: [branding, tooling, workflow]
draft: true
---

<!-- WRITING PROMPT — target 800-1500 words
You've used this pattern across multiple repos and it keeps proving itself: a hidden, dev-only page that renders every brand asset at exact export dimensions using the same CSS, fonts, and tokens the site already uses. No design file drifts. No "which Figma has the latest OG image?" The code is the source of truth.

The audience is frontend devs and indie hackers who maintain their own brand assets and are tired of the design-tool-first workflow breaking down. The "so what?" is that this eliminates an entire class of asset staleness bugs and makes Figma a downstream consumer rather than the canonical source.
-->

## Introduction

<!-- PROMPT: Open with the problem — brand assets (OG images, favicons, social cards) go stale because they live in a design tool that's disconnected from the codebase. Every time you update a color or font, the assets lag behind. -->

## The Pattern: A Dev-Only Branding Page

<!-- PROMPT: Describe the core idea — a page in your repo (e.g., /branding) that renders each asset at its exact export dimensions. It uses the same CSS, fonts, and design tokens as the live site. It redirects to home in production. Walk through the asset array pattern: id, label, dimensions, type. Show how the export dialog uses <dialog> + top layer for unclipped 1:1 rendering. -->

## Why Code-First Beats Design-First

<!-- PROMPT: Make the case — design files drift, tokens get copy-pasted instead of shared, fonts render differently. When the branding page IS the site's CSS, updates propagate automatically. Compare to maintaining a Figma file that nobody remembers to update. -->

## Figma as a Downstream Consumer

<!-- PROMPT: This is the new twist — using Figma MCP to capture the branding page into an editable Figma file. Now Figma is downstream of the code, not upstream. Useful for: outlining text to vector paths, handing assets to collaborators, generating SVGs from outlined type. Walk through the capture flow. -->

## The Favicon Case Study

<!-- PROMPT: Concrete example — the favicon started as a CSS-rendered 32x32 div with JetBrains Mono "tjw" and a tri-color underline. Captured to Figma, text outlined, exported as clean SVG with vector paths. No font dependency in the final SVG. Mention the lowercase switch — small type looks better lowercase at favicon scale. -->

## Edges and Limitations

<!-- PROMPT: Be honest about where this breaks down — font rendering differences between browser and Figma, the manual outline step for text-to-paths, capture fidelity for complex layouts, no automated SVG export from Figma MCP yet. When you'd still want a design-tool-first workflow. -->

## Conclusion

<!-- PROMPT: This is a steal-this-pattern post. Summarize: branding page as source of truth, design tools as optional downstream, and the workflow for getting pixel-perfect exports. -->

## References

- Astro content collections: https://docs.astro.build/en/guides/content-collections/
- Figma MCP: https://www.figma.com/developers/mcp
- `src/pages/branding.astro` in this repo
- Figma file from this session: https://www.figma.com/design/jtABlchMXWIokysE9Dhglm
