# AKSH — Development Plan

**Prepared:** 8 October 2026.

**Inputs:**
- PRD: `docs/requirements/AKSH_PRD.md`
- TRD: `docs/requirements/AKSH_Technical_Requirements.md`
- Design spec v2.0: `docs/design/AKSH_DESIGN.md`
- Content: `docs/content/`
- Decisions: `docs/audit/DECISIONS.md`

Section references use the abbreviations PRD/TRD/DS. "AC-xx" refers to PRD §12 acceptance criteria.

## Readiness at a glance

| Track | Status today | Can start? |
|---|---|---|
| Local development (M1–M3, the local/demo half of M4, much of M5) | Requirements and design are complete enough. No application exists yet | **Yes** |
| Production launch (M4 production half, M6) | Blocked by clinic facts, policies, logo approval, consultation destination, domain and hosting | **No.** See "Launch blockers" |

## Milestone 0: Repository setup (prerequisite, about 1 hour)

1. **Initialise Git** in `F:\My Digital Savvy\AKSH` once the owner agrees. Confirm that `.gitignore` excludes `.local-backup/`. Decide on O-07 (third-party references in version control) before the first commit.
2. **Scaffolding approach.** This directory is not empty: it has `README.md`, `CLAUDE.md`, `assets/`, and `.local-backup/`. Expect `create-next-app` to refuse to scaffold here, and do not delete project files to satisfy it. Choose one:
   - Scaffold into an empty sibling directory, then move generated files in **with collision checks**. Merge, don't overwrite, `README.md` and `.gitignore`.
   - Initialise manually with `pnpm init` and add pinned dependencies.
3. Record the stack in an architecture decision record (TRD §3), for example `docs/adr/0001-stack.md`.

## Milestone 1: Application foundation and design tokens

**References:** TRD §2 (stack/dependency policy), §3 (`src/` structure, DECISIONS D-08), §13 (configuration), §14 (scripts); PRD §10; DS "Tokens — Colors/Typography/Spacing & Shapes", "Layout", "Quick Start".

**Work**
- Next.js App Router, TypeScript strict, Tailwind CSS, and pnpm with `packageManager` pinned. Pin Node in `engines` and an `.nvmrc`/`.node-version`. Commit a single lockfile.
- Scripts: `dev`, `build`, `start`, `lint` (direct ESLint invocation, TRD §2), `typecheck`, `test`, `test:e2e`, `validate:content`, `validate:release`. Leave validation scripts unimplemented only until their milestone, and let them fail loudly rather than pass vacuously.
- `src/styles/tokens.css` from DS Quick Start, with tablet/mobile overrides, mapped into the Tailwind theme. Repeated raw hex values in components are prohibited (TRD §5).
- Fonts through `next/font`: Cormorant Garamond 500/600 and Manrope 400/500/600/700, `display: swap`, with the DS fallbacks. No runtime third-party stylesheet.
- Server-side configuration schema (Zod) with `APP_MODE` (`development` | `preview` | `production`) validated at startup. Add `.env.example` with variable names only (TRD §13).
- Root layout: `lang`, skip link, landmark shell, ivory body, base reset (DS Quick Start).
- Logo: once O-01 is approved, copy the asset into `public/brand/` (kebab-case). Until then, reference the raster candidate as a labelled development asset. Do not crop, convert, or rebuild it.

**Acceptance**
- `pnpm install --frozen-lockfile`, `lint`, `typecheck`, and `build` all pass.
- `tokens.css` contains exactly the eight DS colours and no teal/gold/clay values. Verify with a grep for `123C3F|F5EFE6|B8975F|C98B72|1F2523|A8B8A6` outside `docs/reference/`.
- No network request to a font stylesheet host at runtime (browser network panel).
- An invalid or missing `APP_MODE` fails fast. Production mode refuses the demo adapter (wired fully in M4).
- An empty page shell renders at 360/390/768/1024/1440px with no horizontal overflow.

## Milestone 2: Shared accessible components and responsive layouts

**References:** DS "Components" (Navigation, Primary/Secondary buttons, Text link, Signal dot, Cards, Editorial block, Form controls, Checkbox/Radio, Accordion, Tabs/Chips, Alert, Dropdown, Dialog/Drawer, Tooltip, Breadcrumb, Footer/Mobile CTA bar), "Do's and Don'ts", "Elevation", "Layout"; PRD §5 Navigation, §9 Motion/Responsive, §11 Accessibility; TRD §12 Accessibility.

**Work**
- `src/components/ui`: Button (primary black/ivory, secondary, inverse), TextLink, Input, Select, Checkbox, Radio, Alert, Accordion, Dialog, Drawer, SignalDot/InterruptedRule.
- `src/components/layout`: Header (80/64px, logo limits, nav, booking CTA), MobileDrawer, Footer (charcoal, four groups), optional MobileBookingBar, Container/Grid/SectionStack with one owner per spacing relationship.
- Navigation generated from enabled routes only (PRD §5).
- Every state in the DS implementation checklist: hover, focus, active/selected, disabled, loading, invalid, failure, uncertain receipt, accepted, unavailable, explicit preview.
- A development-only component gallery route (noindex, excluded in production) is optional, for reviewing states.

**Acceptance**
- AC-04: menus work with mouse, touch, keyboard, and Escape. The drawer contains focus and returns it on close.
- AC-15/AC-16: no overflow or clipped labels at the target widths; 200% zoom and narrow reflow work; reduced motion is respected; focus is visible and not obscured by sticky UI.
- Buttons and inputs are at least 52px tall; targets are at least 44px; inputs use 16px text; cards have a 28/20px radius and no shadow; red is never a default fill (DS).
- Automated accessibility scan (e.g. axe via Playwright) has no serious or critical issues, plus a manual keyboard pass.

## Milestone 3: Approved core pages and four service pillars

**References:** PRD §5 routes, §6 content rules, §7.1–7.7, §10 content models; TRD §4 rendering/routing, §6 schemas/publication; `docs/content/CONTENT_STATUS.md`, `docs/content/HOMEPAGE_SECTIONS.md`.

**Work**
- `src/content/` with validated schemas and a `ContentRepository` exposing published-only queries. Draft access is separate (TRD §6).
- P0 routes: `/`, `/about`, `/how-it-works`, `/treatments`, `/treatments/[pillar]` (four enum slugs), `/faq`, `/contact`, `/book` shell, policy routes, `not-found`.
- Shared templates for treatment/diagnostic/program/article detail. These are routable only for published entries; everything else returns 404.
- Homepage in PRD §7.1 order. Proposal-only sections (Goals, Why Choose AKSH, Patient Reviews, Instagram) are content-gated and render nothing without approved content (DECISIONS D-09/D-10).
- Draft copy appears only in development/preview with a visible "Draft" label.
- Context-aware CTAs pass the pillar or treatment through in-memory state only (TRD §7).

**Acceptance**
- AC-01: all four exact pillar names and routes appear on the homepage and directory.
- AC-02: no unapproved treatment, price, staff identity, review, or outcome claim in a production build.
- AC-03: adding one approved treatment entry creates its card and detail page without template changes.
- AC-13: draft and unpublished content is absent from navigation and sitemap and returns HTTP 404 in production.
- AC-14: unique metadata and canonical URLs; one H1 per page.
- `validate:content` checks IDs/slugs, relationships, approval metadata, image dimensions/rights, and pillar mapping.

## Milestone 4: Consultation form and clinic-approved durable request destination

**References:** PRD §8; TRD §7 (fields/state), §8 (API), §9 (destination/idempotency/notifications), §10 (receipt and modes), §11 (security/privacy); DS "Consultation Form", "Checkbox and Radio", "Feedback / Alert".

**Local/demo half (can proceed now)**
- Form fields exactly per PRD §8 and TRD §7. Phone parsed to E.164 with a maintained library and no India-only default (TRD §7). There are no medical fields.
- State machine `idle → validating → submitting → succeeded | failed | acceptance-unknown`. Errors are announced and focus moves to the first invalid field.
- `POST /api/consultation-requests` with a strict schema, the TRD §8 status codes, `no-store`, and no echoing of values.
- `ConsultationDestination` interface and a **demo adapter** used only in `development`/`preview`. It shows a visible notice that no request was sent. The demo receipt uses a distinct cookie/audience (TRD §10).
- Production with no configured adapter shows the unavailable state and returns 503 `BOOKING_UNCONFIGURED`, never a simulated success.
- Signed short-lived receipt cookie; `/book/confirmation` is server-verified, noindex, and `private, no-store`.

**Production half (blocked: O-05)**
- Owner-approved destination adapter with durable retention, atomic idempotency, and staff retrieval.
- Durable notification path with retries.
- Distributed rate limiting, origin checks, and an optional bot challenge.
- Approved consent wording and version.

**Acceptance**
- AC-05 through AC-11.
- The TRD §14 Validation/API/Idempotency/Receipt/Privacy test cases pass against the demo adapter, and against a synthetic test destination once one is approved.
- Request details never appear in URLs, browser storage, analytics, or ordinary logs (verified in the browser network panel and server logs).
- **This milestone is not production-ready until a real approved destination accepts and retains a synthetic test request that staff can retrieve.**

## Milestone 5: Content, SEO, accessibility, and performance validation

**References:** PRD §11, §13; TRD §12, §14 (tests and CI sequence).

**Work and acceptance**
- Replace drafts with approved content as it arrives (`CONTENT_STATUS.md`). Unapproved sections stay hidden.
- Metadata helper, `sitemap.ts` and `robots.ts` built from the published queries, noindex for receipts and previews, safe JSON-LD only from verified data (no ratings unless verified reviews exist).
- Playwright: Chromium for core journeys (home → pillar → detail → request, prefill/edit, mobile menu, error/retry), plus Firefox/WebKit smoke tests.
- Accessibility: automated scan plus manual keyboard, zoom, and reduced-motion review (AC-16).
- Performance: mobile Lighthouse 90+ in four categories on representative routes (median of three; record the tool version). Hero image at most 250 KiB on mobile. No autoplay hero video or initial map iframe (TRD §12).
- AC-17: lint, typecheck, content validation, tests, and build all pass in CI order (TRD §14).

## Milestone 6: Production configuration and launch-readiness review

**References:** TRD §13 (environment), §15 (deployment and launch gates); PRD §14 required inputs; AC-18.

**Work**
- Owner-selected host with a server runtime.
- Production environment variables and secrets injected server-side.
- Security headers/CSP tested against fonts, images, and the form; HSTS only after the domain is verified.
- Protected preview with isolated test integrations first.
- `validate:release` for `APP_MODE=production` fails while any launch gate is open.
- Release report listing the checks run, checks pending on credentials, and the remaining blockers.

**Acceptance (all TRD §15 launch gates)**
- Approved clinic details, policies, consent notice, assets, and service copy.
- Verified domain, contact links, timezone, metadata, and sitemap.
- Real destination with tested retrieval; tested notification failure and retry.
- Production secrets, rate limiting, origin protection, receipt signing, and no demo adapter.
- Required checks passing; owner-defined retention and access process.

## Launch blockers (owner inputs)

1. Consultation destination, notification channel, and credentials (O-05).
2. Policy pages and consent wording/version.
3. Clinic name form, address, phone/email/WhatsApp, hours, timezone (O-04).
4. Approved pillar copy, FAQ answers, and process steps.
5. Logo approval and master formats (O-01); favicon and OG image.
6. Licensed or real clinic photography for the hero and pillars.
7. Domain and hosting selection (O-06).

Optional, and hidden until supplied: individual treatments, practitioner profiles, prices, Journal, Diagnostics/Programs, patient reviews, Instagram feed, analytics.
