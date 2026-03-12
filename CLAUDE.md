# CLAUDE.md

## Project Overview

Personal devlog and portfolio site for Justin Walsh at **tjw.dev**. Built with Astro, Obsidian-first markdown content, Tailwind CSS v4, and React (for interactive Catalyst-based components). Deployed to GitHub Pages via pnpm.

## Design Context

### Users

Developers, gamedev peers, and potential collaborators visiting to read devlog posts, explore projects, and understand Justin's work. They arrive from GitHub, X/Twitter, or Discord links. They expect fast, no-nonsense content — not a marketing site.

### Brand Personality

**Technical. Bold. Constrained.**

The site should feel like a well-crafted tool — not a template. It evokes the confidence of someone who builds synthesizers and GPU renderers for fun. No fluff, no decorative filler. Every element earns its place.

### Aesthetic Direction

**Dark-only.** Near-black backgrounds (#0C0C0E range) with vibrant neon accents drawn from the Chasm palette. The visual language bridges three-flatland's synthwave neon and zzfx-studio's terminal density.

**References:**
- three-flatland docs site — retro neon palette, dithered gradients, pixel-art accents, deep navy/purple backgrounds
- zzfx-studio — monospaced everything, channel-colored accents, information-dense tracker UI, amber/orange brand accent
- Chasm palette (lospec) — 22-color neon palette with dark purple core and intense cyan/pink/yellow highlights

**Anti-references:**
- Generic white SaaS landing pages
- Overly rounded, pastel, "friendly" design systems
- Sites with excessive whitespace and no information density
- AI-generated aesthetic (gradient blobs, glassmorphism, generic illustrations)

### Theme & Color System

**Dark mode only.** No light mode.

**Palette foundation — Chasm (22 colors):**

| Role | Color | Hex |
|---|---|---|
| Background | Near-black | `#0C0C0E` |
| Surface | Dark gray | `#141418` |
| Surface elevated | Charcoal | `#1C1C22` |
| Border subtle | Dark border | `#222228` |
| Text primary | Light gray | `#D4D4D8` |
| Text secondary | Medium gray | `#78787E` |
| Text dim | Faded | `#44444A` |
| Accent primary | Neon cyan | `#5efdf7` |
| Accent secondary | Hot pink | `#ff5dcc` |
| Accent warm | Neon yellow | `#fdfe89` |
| Accent muted | Orchid purple | `#ab58a8` |
| Success | Mint green | `#8dd894` |
| Warning | Peach | `#f3a787` |
| Error | Hot pink | `#ff5dcc` |
| Info | Cornflower blue | `#5fa1e7` |

**Callout colors** (for Obsidian callouts) should use the semantic accent colors above, not arbitrary Tailwind defaults.

**Constraint:** Use only Chasm palette colors + the neutral gray scale for surfaces/text. Do not introduce new hues. If a new color is needed, it must come from the Chasm 22 or be justified.

### Typography

**Paired system:**
- **Headings, labels, nav, UI chrome:** JetBrains Mono — monospaced, uppercase for labels, bold weights for heroes
- **Body prose (devlog articles, descriptions):** Space Grotesk or Inter — clean geometric sans, optimized for reading
- **Code blocks:** JetBrains Mono

**Constraints:**
- Maximum 2 font families loaded
- Headings may go bold/black weight for hero impact
- Labels and navigation use small caps or uppercase with letter-spacing
- No decorative or script fonts. No pixel fonts for body text.
- Readability is non-negotiable — contrast and size must meet WCAG AA

### Layout & Spacing

**Hybrid density:** Terminal-dense navigation and chrome, generous breathing room for prose content.

- Navigation, project cards, metadata, tags: tight spacing (4px–12px gaps)
- Devlog article body: comfortable reading measure (~65ch max-width), relaxed line-height (1.6–1.75)
- Page margins: compact on chrome, generous on content areas
- No excessive whitespace — every gap should feel intentional, not lazy

### Component Strategy

Components are sourced from **Catalyst UI Kit** (Tailwind UI, vendor/catalyst-ui-kit/). Workflow:
1. Copy the component from `vendor/catalyst-ui-kit/typescript/` to `src/components/ui/`
2. Adapt to our design tokens (colors, typography, spacing)
3. Strip any unnecessary complexity
4. Use as React islands in Astro via `client:load` or `client:visible`

**Do not** commit or reference vendor/ directly — it is gitignored.

### Design Principles

1. **Constraint breeds craft.** Work within the Chasm palette and 2-font system. Expand only when the constraint genuinely fails.
2. **Density where it serves, space where it reads.** Chrome is tight. Prose breathes. Never waste space, never crowd content.
3. **Color is signal, not decoration.** Every accent color should communicate something — status, category, interaction state. No color for color's sake.
4. **Monospace is the voice.** JetBrains Mono carries the brand. It appears in nav, headings, labels, and code. The sans-serif is the quiet workhorse for long reads.
5. **Earn every element.** No decorative filler, no stock illustrations, no placeholder vibes. If it doesn't inform or enable, remove it.

### Accessibility

- **Target:** WCAG AA (4.5:1 body text, 3:1 large text/UI)
- Neon accents on dark backgrounds must be validated for contrast — some Chasm neons may need slight adjustment for text use vs. decorative use
- Support `prefers-reduced-motion`
- Keyboard navigation must work for all interactive components
- Semantic HTML throughout — proper heading hierarchy, landmarks, ARIA where needed
