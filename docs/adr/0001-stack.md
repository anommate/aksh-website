# ADR 0001 — Application stack

**Date:** 8 October 2026. **Status:** Accepted for framework, runtime, tooling, and content source. Destination and deployment are open (see below).

TRD §3 asks for a short record covering the framework/runtime, content source, approved destination, and deployment platform. Each part is filled in when it becomes known.

## Decision

| Area | Choice | Pinning |
|---|---|---|
| Framework | Next.js App Router, React (TRD §2) | `next` 16.4.0, `react`/`react-dom` 19.3.0, exact |
| Runtime | Node.js 24 LTS | `engines.node` `24.x`; `.nvmrc` `24.21.0` |
| Package manager | pnpm, one committed lockfile | `packageManager` `pnpm@12.8.1`; `pnpm-lock.yaml` |
| Language | TypeScript, `strict: true` | 5.9.3 (lockfile) |
| Styling | Tailwind CSS v4 through `@tailwindcss/turbopack`, plus CSS custom-property tokens (Milestone 1) | 4.3.3 (lockfile) |
| Lint | ESLint 9 flat config with `eslint-config-next`, run directly as `eslint` (TRD §2) | 9.39.5 (lockfile) |
| Layout | TRD `src/` layout, `@/*` → `src/*` (DECISIONS D-08) | — |
| Content source | Repository content, validated TypeScript/JSON (TRD §2). A CMS is added only through a content adapter if staff editing is required, and that needs an owner decision | — |
| Validation | Zod, for environment settings now and for content and form input later | `zod` 4.6.5, exact |
| Unit tests | Vitest, Node environment (`vitest.config.mts`) | `^5.0.3` (5.0.3 in lockfile) |
| Browser tests | Playwright against the production build, Chromium project only until Milestone 5 | `@playwright/test` 1.63.0, exact, so browser builds match. 1.64.0 was one day old and was skipped |
| Fonts | `next/font/google`, self-hosted at build time: Cormorant Garamond 500/600, Manrope 400/500/600/700, latin preloaded, `display: swap` | `src/styles/fonts.ts` |

## How it was scaffolded

`create-next-app` 16.4.0 ran in an empty sibling directory, because this one is not empty (DEVELOPMENT_PLAN Milestone 0). Generated files were then moved in with collision checks:

- `.gitignore` was merged into the existing one, which keeps `.local-backup/` and the secret patterns.
- `README.md` and `CLAUDE.md` were kept. The template README (npm, Geist, Vercel) does not apply.
- The template's demo page, Geist fonts, and starter images were not brought in. `src/app/page.tsx` is a placeholder until Milestone 1.

Changes from the template:

- `typecheck` script: `next typegen && tsc --noEmit`. Route types such as `LayoutProps` are generated, so `tsc` alone fails on a clean checkout.
- `@types/node` `^24` to match the runtime.
- `src/app/globals.css` uses `@import "tailwindcss" source("../")`. Tailwind then scans only `src/`, not `docs/` or `assets/`. Without it, class-like words in the requirements leaked about 20 unused utilities into the CSS bundle.
- `pnpm-workspace.yaml` `allowBuilds` blocks install scripts for `sharp` and `unrs-resolver`. Both use prebuilt platform binaries. `sharp` 0.35.5 was verified to load.

## Milestone 1 & Step 4 decisions

- **Tokens.** `src/styles/tokens.css` is the only place design values live. Tokens whose names sit in a Tailwind namespace are declared in `@theme static`, so one declaration is both the CSS variable and its utility (`bg-brand-ivory`, `text-body`, `p-24`, `rounded-card`, `tablet:`). `--*: initial` removes Tailwind's default theme: no stock palette (it includes teal and amber), fonts, spacing, radii, shadows, or breakpoints. Responsive overrides change variables only, inside media queries built from the breakpoint tokens with `theme()`.
- **Name collisions.** The specification's semantic colour aliases `--text-primary`, `--text-heading`, `--text-secondary`, and `--text-inverse` would be read by Tailwind as font sizes, and `--container-*` would shadow its max-width keywords. They stay plain custom properties with the specification's names, used through `var()`.
- **Spacing utilities are pixels.** `--spacing-N` is N px, so `p-24` is 24px and only scale values exist (`p-5` generates nothing). `--spacing-0: 0px` is declared for zero-offset alignments. The 15px and 13px button insets are the specification's border-adjusted exceptions. Explicit `@utility` declarations in `src/app/globals.css` provide `inset-0`, `top-0`, `bottom-0`, `left-0`, and `right-0` to guarantee absolute positioning behavior under `--*: initial`.
- **Container.** The `aksh-container` utility follows the specification: `min(1280px, 100% − 2 × gutter)`. Tailwind's own `container` is disabled (`@source not inline("container")`) because its breakpoint widths contradict it.
- **Focus.** `:focus-visible` draws a 2px outline at a 2px offset. The specification's box-shadow focus tokens are defined with the same geometry, but outlines are used because shadows disappear in forced-colours mode.
- **Configuration.** `src/lib/config/schema.ts` validates settings with Zod. `server.ts` (`server-only`) is the accessor, and `public.ts` is the only browser-safe projection. No setting uses `NEXT_PUBLIC_`. `src/instrumentation.ts` validates at server start and exits on invalid settings: without that, Next.js logs the error but keeps answering every request with a 500. `next build` never calls `register()`, and the same build may run as preview or production, so `APP_MODE` is checked at start, not at build.
- **Build memory & Turbopack configuration.** In `next.config.ts`, `--max-old-space-size=4096` is configured in `NODE_OPTIONS` to prevent V8 heap exhaustion on Windows during concurrent Turbopack compilation and TypeScript type checking. Turbopack CSS loaders are registered for `@tailwindcss/turbopack`. `cacheComponents: true` and `partialPrefetching: true` remain active and unchanged.
- **Placeholder scripts.** `validate:content` (Milestone 3) and `validate:release` (Milestone 6) exit 1 with a message until they are implemented.
- **Browser channel.** `PLAYWRIGHT_CHROMIUM_CHANNEL=chrome` (or `msedge`) runs the browser tests in an installed browser. On the development machine Playwright's own Chromium download times out (8 October 2026) although the same URL downloads with `curl`, so the checks ran in installed Google Chrome. CI should use the pinned Chromium.

## Consequences and follow-ups

- `next.config.ts` keeps the template's `cacheComponents: true` and `partialPrefetching: true`. TRD §4 forbids relying on undocumented cache defaults. Before Milestone 3 ships public routes, check the caching rules for the confirmation page, the enquiry API, and draft preview against `node_modules/next/dist/docs/`.
- `next dev` creates and maintains the managed block in `AGENTS.md`. Commit that file as generated. Removing it only brings it back.
- Next.js 16.4 is newer than most model training data. Read the bundled docs in `node_modules/next/dist/docs/` before writing framework code (see `AGENTS.md`).

## Open parts of this record

| Part | Status | Tracked in |
|---|---|---|
| Approved consultation destination and notification channel | Not decided | DECISIONS O-05 |
| Hosting platform and production domain | Not decided. The enquiry API needs a server runtime, so a static-only export is ruled out (TRD §4) | DECISIONS O-06 |
