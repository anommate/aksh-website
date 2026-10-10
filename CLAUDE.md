# AKSH — Project Guidance for Claude Code

AKSH is a wellness clinic website with four service pillars: **Biohacking, Recovery, Body Contouring, Skin Treatments**. It is a responsive public site with a consultation **enquiry** flow. Milestones 0 and 1 are complete: scaffold, design tokens, fonts, validated configuration, layout shell, and test tooling. The homepage is still a setup placeholder. Milestone 2 (shared components) is next.

## Canonical documents (read before changing code)

| Topic | File |
|---|---|
| Product behaviour, routes, content rules, acceptance criteria | `docs/requirements/AKSH_PRD.md` |
| Engineering, API, security, testing, launch gates | `docs/requirements/AKSH_Technical_Requirements.md` |
| **All visual decisions** (tokens, type, spacing, components, states) | `docs/design/AKSH_DESIGN.md` (v2.0) |
| Content status and missing clinic inputs | `docs/content/CONTENT_STATUS.md`, `docs/content/HOMEPAGE_SECTIONS.md` |
| Decisions, open questions, milestones, assets | `docs/audit/DECISIONS.md`, `docs/audit/DEVELOPMENT_PLAN.md`, `docs/audit/ASSET_INVENTORY.md` |
| Stack, versions, and scaffold changes | `docs/adr/0001-stack.md` |

Do not use `docs/reference/**` or `assets/reference/**` as requirements. They hold originals, superseded versions, proposals, and third-party inspiration.

## Branding precedence

- The design spec v2.0 supersedes every teal/gold instruction.
- Palette: `#000000` Logo Black, `#F9F8F4` Brand Ivory, `#FF0000` Signal Red, `#E4DED3` Warm Stone, `#A7B0A1` Quiet Sage, `#282826` Soft Charcoal. Functional neutrals: `#645F57` Muted Text, `#7C776E` Control Outline. No other brand colours.
- Primary buttons are black fill with an ivory label (hover charcoal). Red is a small, restrained signal only.
- Fonts: Cormorant Garamond (display, 500/600) and Manrope (body/UI, 400–700). Do not load Jost, SF Pro, Inter, or Poppins.
- Preserve the supplied logo artwork (`assets/source/brand/Logo.jpeg`, approval pending). Never redraw it or rebuild it with a font.

## Consultation semantics

- A successful submission means the request was **durably accepted** by an approved destination. It does **not** mean an appointment is booked. The receipt text is "Your consultation request has been received."
- No live slots, payments, patient accounts, medical fields, or uploads.
- Request data never goes in URLs, browser storage, analytics, or ordinary logs. Secrets stay server-side.
- Demo mode is allowed only in `development`/`preview`, must say no request was sent, and is refused in `production`.

## Stack

Next.js 16.4 App Router, React 19.3, TypeScript strict, Tailwind CSS v4 with CSS custom-property tokens, pnpm 12.8.1 (pinned `packageManager`), Node 24, `src/` layout per TRD §3, Zod 4, Vitest 5, Playwright 1.63. Details and Milestone 1 decisions are in `docs/adr/0001-stack.md`.

- **Design values live only in `src/styles/tokens.css`.** Use token utilities (`bg-brand-ivory`, `text-section-heading` with `font-display`, `rounded-card`, `tablet:`/`desktop:`) or `var(--token)`. Spacing utilities are pixels on the 4px scale: `p-24` is 24px. Never put raw hex values or one-off sizes in components.
- **Configuration:** server code reads settings through `src/lib/config/server.ts`. Client Components receive only `getPublicConfig()` output as props. Never add `NEXT_PUBLIC_` settings.

Next.js 16.4 differs from older releases. Read the bundled guide in `node_modules/next/dist/docs/` before writing framework code (see `AGENTS.md`, which `next dev` maintains).

## Commands

Local setup: copy `.env.example` to `.env.local` and set `APP_MODE=development`. The server refuses to start without a valid `APP_MODE`.

| Command | Notes |
|---|---|
| `pnpm dev` / `pnpm build` / `pnpm start` | Next.js |
| `pnpm lint` | Direct ESLint |
| `pnpm typecheck` | `next typegen && tsc --noEmit` |
| `pnpm test` | Vitest unit tests (`tests/unit`) |
| `pnpm test:e2e` | Playwright against the production build: run `pnpm build` first. Where Playwright's Chromium cannot be downloaded, set `PLAYWRIGHT_CHROMIUM_CHANNEL=chrome` |
| `pnpm validate:content` / `pnpm validate:release` | Fail on purpose until Milestones 3 and 6 |

## Content rules

- Never invent clinic addresses, contact details, practitioner names or credentials, prices, treatments, devices, clinical benefits, reviews, ratings, policies, or Instagram content.
- Unapproved content is omitted in production and shown only as labelled drafts in development/preview.
- Patient reviews and an Instagram feed are **proposals**: build them content-gated or not at all.

## Unresolved production integrations

Consultation destination and notification channel, rate-limit store, hosting/domain, CMS (repository content by default), analytics (off by default), and policy/consent wording. See `docs/audit/DECISIONS.md` O-01 to O-08.

## Working rules

- Keep `.local-backup/` untouched; it is the pre-restructure snapshot, and `docs/audit/ROLLBACK.md` explains its use.
- Copy approved assets into `public/` with kebab-case names. Do not move originals out of `assets/source/`.
- Do not commit, push, or deploy unless asked.
