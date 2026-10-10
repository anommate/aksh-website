# AKSH Website

The public website for **AKSH**, a wellness clinic offering Biohacking, Recovery, Body Contouring, and Skin Treatments. Visitors submit consultation requests; clinic staff contact them and confirm appointments manually.

## Current state (8 October 2026)

- **Requirements and design: complete enough to start local development.**
- **Application: foundation complete (Milestones 0–1).** Next.js 16.4 with design tokens, fonts, validated configuration, the layout shell, and tests. The homepage is a setup placeholder. See [`docs/adr/0001-stack.md`](docs/adr/0001-stack.md). Git is initialised with no commits yet.
- **Production: blocked** on clinic facts, policies, logo approval, the consultation destination, and hosting. See `docs/audit/DEVELOPMENT_PLAN.md`.

## Document map

| Need | Go to |
|---|---|
| What to build | [`docs/requirements/AKSH_PRD.md`](docs/requirements/AKSH_PRD.md) |
| How to build it | [`docs/requirements/AKSH_Technical_Requirements.md`](docs/requirements/AKSH_Technical_Requirements.md) |
| How it must look (v2.0, authoritative) | [`docs/design/AKSH_DESIGN.md`](docs/design/AKSH_DESIGN.md), with notes in [`docs/design/README.md`](docs/design/README.md) |
| What content is approved or missing | [`docs/content/CONTENT_STATUS.md`](docs/content/CONTENT_STATUS.md), [`docs/content/HOMEPAGE_SECTIONS.md`](docs/content/HOMEPAGE_SECTIONS.md) |
| Milestones and acceptance criteria | [`docs/audit/DEVELOPMENT_PLAN.md`](docs/audit/DEVELOPMENT_PLAN.md) |
| Decisions and open owner questions | [`docs/audit/DECISIONS.md`](docs/audit/DECISIONS.md) |
| Assets, rights, and gaps | [`docs/audit/ASSET_INVENTORY.md`](docs/audit/ASSET_INVENTORY.md) |
| Audit, move manifest, rollback | [`docs/audit/`](docs/audit/) |
| Stack and versions | [`docs/adr/0001-stack.md`](docs/adr/0001-stack.md) |
| Guidance for Claude Code | [`CLAUDE.md`](CLAUDE.md) |

## Structure

```text
AKSH/
├── CLAUDE.md                 Agent guidance (start here when coding)
├── AGENTS.md                 Next.js agent rules (maintained by `next dev`)
├── README.md
├── .gitignore
├── package.json              Scripts; pinned pnpm and Node
├── src/
│   ├── app/                  Routes, root layout, global styles
│   ├── components/layout/    Skip link and page container
│   ├── lib/config/           Validated server configuration
│   └── styles/               Design tokens and font loading
├── tests/                    Vitest unit tests and Playwright browser checks
├── docs/
│   ├── adr/                  Architecture decision records
│   ├── requirements/         Canonical PRD and technical requirements
│   ├── design/               Canonical design system v2.0 and source notes
│   ├── content/              Content status, missing inputs, homepage reconciliation
│   ├── audit/                Audits, decisions, inventory, plan, manifest, rollback
│   └── reference/            Unedited originals, structural reference, proposals
├── assets/
│   ├── source/brand/         Current AKSH logo artwork (approval pending)
│   └── reference/            Superseded concepts and third-party inspiration (never shipped)
└── .local-backup/            Pre-restructure byte snapshot (git-ignored)
```

The rest of the application layout (`src/content`, more of `src/components` and `src/lib`, and `public`) follows TRD §3 and arrives in later milestones.

## Setup

Requires Node 24 (`.nvmrc`: 24.21.0) and pnpm 12.8.1 (pinned as `packageManager` in `package.json`).

Copy `.env.example` to `.env.local` and set `APP_MODE=development`. Local development needs nothing else, and the server refuses to start without a valid `APP_MODE`.

```bash
pnpm install --frozen-lockfile
pnpm exec playwright install chromium   # once, for browser tests
pnpm dev          # http://localhost:3000
pnpm lint
pnpm typecheck
pnpm test         # unit tests
pnpm build && pnpm test:e2e             # browser checks against the production build
```

If Playwright's Chromium download fails, run the browser checks in an installed browser with `PLAYWRIGHT_CHROMIUM_CHANNEL=chrome` (or `msedge`). `pnpm validate:content` and `pnpm validate:release` fail on purpose until Milestones 3 and 6.
