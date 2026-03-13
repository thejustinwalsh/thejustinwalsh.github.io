# tjw.dev

Personal devlog and portfolio site for [Justin Walsh](https://tjw.dev).

[![CI](https://github.com/thejustinwalsh/thejustinwalsh.github.io/actions/workflows/ci.yml/badge.svg)](https://github.com/thejustinwalsh/thejustinwalsh.github.io/actions/workflows/ci.yml)
[![Deploy](https://github.com/thejustinwalsh/thejustinwalsh.github.io/actions/workflows/deploy-on-push.yml/badge.svg)](https://github.com/thejustinwalsh/thejustinwalsh.github.io/actions/workflows/deploy-on-push.yml)
[![Sync Projects](https://github.com/thejustinwalsh/thejustinwalsh.github.io/actions/workflows/sync-projects.yml/badge.svg)](https://github.com/thejustinwalsh/thejustinwalsh.github.io/actions/workflows/sync-projects.yml)
[![Discord](https://img.shields.io/discord/913787528300077097?label=Discord&logo=discord&logoColor=white)](https://discord.gg/6nGuzvQcpB)

Built with **Astro**, **Obsidian-first markdown**, **Tailwind CSS v4**, and **React**.

## Getting Started

```bash
pnpm install
pnpm dev          # Start dev server at localhost:4321
pnpm build        # Production build to dist/
pnpm preview      # Preview production build locally
```

### Requirements

- Node.js 22+
- pnpm 10+
- `ffmpeg` (for GIF-to-video hero conversion)

## Writing Content with Obsidian

All content lives in `src/content/` and is authored as standard markdown. The directory is configured as an **Obsidian vault** — open it directly in Obsidian to write and organize content with a live preview.

### Vault Setup

1. Open Obsidian and choose **Open folder as vault**
2. Select the `src/content/` directory
3. Obsidian settings are committed in `src/content/.obsidian/` (gitignored from the build, shared across clones)

### Content Collections

| Directory               | Purpose                                                               |
| ----------------------- | --------------------------------------------------------------------- |
| `src/content/devlog/`   | Blog-style devlog entries with date, tags, and optional project links |
| `src/content/projects/` | Project showcase pages (auto-synced from GitHub — see below)          |
| `src/content/articles/` | Long-form articles and guides                                         |

### Obsidian Features That Work

- **Wikilinks** — `[[page-name]]` links resolve across collections via `remark-wiki-link`
- **Callouts** — Obsidian-style `> [!tip]` callouts render with `@r4ai/remark-callout`
- **Mermaid diagrams** — fenced `mermaid` code blocks render as SVG via `rehype-mermaid`
- **Public images** — images in `public/` are resolved by a custom remark plugin

### Content Flow

```
┌─────────────┐     ┌──────────────┐     ┌─────────────┐     ┌──────────┐
│  Obsidian   │────▶│  git commit  │────▶│  CI (test)  │────▶│  Deploy  │
│  (author)   │     │  & push      │     │  unit + e2e │     │  Pages   │
└─────────────┘     └──────────────┘     └─────────────┘     └──────────┘
```

Write in Obsidian → commit to `main` → CI runs unit + e2e tests → deploy to GitHub Pages at [tjw.dev](https://tjw.dev).

## Project Sync Pipeline

Projects are automatically discovered from GitHub and synced to `src/content/projects/`. This is a multi-phase automated pipeline:

### Phase 1: Discovery (`sync-projects.yml`)

Runs **weekly on Monday at 9am UTC** (or manually via `workflow_dispatch`).

1. `pnpm sync` fetches all public, non-fork repos for the configured GitHub user via the GraphQL API
2. Each repo is scored using a weighted algorithm (stars, npm downloads, activity freshness, releases, homepage presence)
3. New repos that pass the signal threshold get a generated markdown file with frontmatter
4. Hero images are resolved from: GitHub social preview → website og:image → README images
5. GIF heroes are converted to optimized video with `pnpm convert:gifs`
6. Stats (stars, downloads, activity, order) are written to `src/data/projects/stats.json`

**Two PRs are created:**

- **Stats PR** — auto-merged (stats-only changes outside CODEOWNERS)
- **New Projects PR** — requires review (triggers Phase 2)

### Phase 2: Refinement (`refine-projects.yml`)

Triggered automatically when a new projects PR is opened:

1. GitHub Copilot CLI researches each new project (README, `llms.txt`, `CLAUDE.md`, docs, releases)
2. Rewrites descriptions as polished portfolio-style content
3. Validates and replaces dead links
4. Finds higher-quality hero images
5. Runs `pnpm lint:projects` to validate frontmatter

### Phase 3: Finalization (on PR approval)

When you approve the PR:

1. Discord channels are created/found for each new project
2. Discord invite links are added to project frontmatter
3. PR is auto-merged via squash

### Running Sync Locally

```bash
# Requires gh CLI authenticated
export GITHUB_USERNAME=thejustinwalsh
pnpm sync

# Optional: Discord integration
export DISCORD_TOKEN=your-bot-token
export DISCORD_SERVER=your-server-id
pnpm sync
```

## Testing

```bash
pnpm test           # Run all tests (unit + e2e)
pnpm test:unit      # Vitest unit tests
pnpm test:unit:watch # Vitest in watch mode
pnpm test:e2e       # Playwright e2e tests (requires build first)
pnpm test:e2e:ui    # Playwright interactive UI mode
```

## Scripts

| Command              | Description                                |
| -------------------- | ------------------------------------------ |
| `pnpm sync`          | Sync GitHub repos to project content files |
| `pnpm convert:gifs`  | Convert GIF hero images to optimized video |
| `pnpm lint:projects` | Validate project frontmatter YAML          |

## Tech Stack

- **[Astro](https://astro.build)** — static site generator with content collections
- **[Tailwind CSS v4](https://tailwindcss.com)** — utility-first styling
- **[React](https://react.dev)** — interactive islands via `@astrojs/react`
- **[Catalyst UI Kit](https://tailwindui.com/templates/catalyst)** — component foundation (vendored, gitignored)
- **[Vitest](https://vitest.dev)** + **[Playwright](https://playwright.dev)** — unit and e2e testing
- **[Renovate](https://docs.renovatebot.com)** — automated dependency updates (weekly, Tuesdays)

## License

This is a personal site. Code is provided as-is for reference.
