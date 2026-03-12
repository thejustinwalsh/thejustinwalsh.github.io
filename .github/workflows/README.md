# CI/CD Workflows

## Overview

Five workflows automate testing, deployment, dependency management, and content sync for tjw.dev.

## Workflows

### CI (`ci.yml`)

Runs unit tests (Vitest) and e2e tests (Playwright) on every PR and push to `main`. The `test` job is a required status check — no PR can merge to `main` without it passing.

**Trigger:** PR to `main`, push to `main`, manual dispatch
**Secrets:** None (uses `GITHUB_TOKEN`)

### Deploy to Pages (`deploy-on-push.yml`)

Builds the Astro site and deploys to GitHub Pages. Triggered by CI completing on `main` — skips deploy if CI failed.

**Trigger:** CI workflow completes on `main`, manual dispatch
**Secrets:** None (uses `GITHUB_TOKEN`)

### Renovate (`renovate.yml`)

Runs Renovate to keep dependencies up to date. Opens PRs with grouped updates and flags security vulnerabilities. PRs must pass CI (`test` required check) before merge. Astro patches auto-merge once CI passes.

**Trigger:** Weekly (Tuesday 6am EST), push to config files, manual dispatch
**Secrets:** `RENOVATE_TOKEN` (PAT with repo + workflow scopes)

### Sync Projects (`sync-projects.yml`)

Fetches GitHub repos and generates project content files. Opens two types of PRs:
- **Stats-only PR** (stars, downloads, activity) — uses `--auto` flag, merges after CI passes
- **New projects PR** — requires CI + CODEOWNERS review before merge

**Trigger:** Weekly (Monday 9am UTC), manual dispatch
**Secrets:** `DISCORD_TOKEN`, `DISCORD_SERVER`

### Refine New Projects (`refine-projects.yml`)

Two-phase workflow triggered by the new projects PR from sync:

1. **Phase 1 (PR opened):** Copilot CLI researches each new project and rewrites descriptions, downloads hero images, validates links
2. **Phase 2 (PR approved):** Creates Discord channels for each project, commits links, then auto-merges the PR

**Trigger:** PR opened or approved on `auto/sync-projects` branch
**Secrets:** `COPILOT_PAT`, `DISCORD_TOKEN`, `DISCORD_SERVER`, `DISCORD_CATEGORY`

## Required Secrets

| Secret | Type | Scopes | Used By |
|---|---|---|---|
| `RENOVATE_TOKEN` | Fine-grained PAT | Contents R/W, PRs R/W, Workflows R/W | Renovate |
| `COPILOT_PAT` | Classic PAT | `copilot` | Refine Projects |
| `DISCORD_TOKEN` | Discord bot token | Manage Channels | Sync, Refine |
| `DISCORD_SERVER` | Discord guild ID | — | Sync, Refine |
| `DISCORD_CATEGORY` | Discord category ID | — | Refine |

## Required Repo Settings

- **Pages source:** GitHub Actions
- **Actions permissions:** Read & write, allow PR creation
- **Branch protection on `main`:**
  - Require status checks to pass: `test` (from CI workflow)
  - Require pull request before merging (enables CODEOWNERS enforcement)
  - Require review from Code Owners
- **Labels:** `automated`, `content`, `security`
- **CODEOWNERS:** `src/content/projects/` and `public/projects/` require review

## Flow

```mermaid
flowchart TD
    subgraph ci["CI — required check: test"]
        C1[Push to main / PR] --> C2[pnpm install]
        C2 --> C3[Unit tests — Vitest]
        C3 --> C4[Build site]
        C4 --> C5[Install Playwright browsers]
        C5 --> C6[E2E tests — Playwright]
        C6 --> C7{Pass?}
    end

    C7 -->|No| C8[Block PR merge + deploy]

    subgraph deploy["Deploy to Pages"]
        D1[CI passed on main] --> D2[Checkout + pnpm install]
        D2 --> D3[Astro build]
        D3 --> D4[Upload artifact]
        D4 --> D5[Deploy to GitHub Pages]
    end

    C7 -->|Yes + on main| D1

    subgraph renovate["Renovate"]
        R1[Weekly schedule] --> R2[Run Renovate]
        R2 --> R3{Updates found?}
        R3 -->|Yes| R4[Open PR]
        R4 --> R5[CI runs on PR]
        R5 -->|Pass + Astro patch| R6[Auto-merge]
        R5 -->|Pass + other| R7[Await review]
        R6 -->|Merged to main| C1
        R7 -->|Merged to main| C1
    end

    subgraph sync["Sync Projects"]
        S1[Weekly schedule] --> S2[pnpm sync]
        S2 --> S3{Changes?}
        S3 -->|Stats only| S4[Open PR — auto flag]
        S4 --> S5[CI runs on PR]
        S5 -->|Pass| S6[Auto-merge]
        S6 -->|Merged to main| C1
        S3 -->|New projects| S7[Open PR]
        S7 --> RF1
    end

    subgraph refine["Refine New Projects"]
        RF1[PR opened] --> RF2[Find new .md files]
        RF2 --> RF3[Copilot researches + rewrites]
        RF3 --> RF4[Commit refined descriptions]
        RF4 --> RF5[CI runs on PR]
        RF5 -->|Pass| RF6[Await CODEOWNERS review]
        RF6 -->|Approved| RF7[Create Discord channels]
        RF7 --> RF8[Commit Discord links]
        RF8 --> RF9[Auto-merge]
        RF9 -->|Merged to main| C1
    end

    style ci fill:#1a1a2e,stroke:#8dd894,color:#d4d4d8
    style deploy fill:#1a1a2e,stroke:#5efdf7,color:#d4d4d8
    style renovate fill:#1a1a2e,stroke:#ff5dcc,color:#d4d4d8
    style sync fill:#1a1a2e,stroke:#fdfe89,color:#d4d4d8
    style refine fill:#1a1a2e,stroke:#ab58a8,color:#d4d4d8
```
