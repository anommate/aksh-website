# AKSH — Source Precedence and Restructuring Decisions

**Date:** 8 October 2026. Evidence for each decision is in `INITIAL_AUDIT.md`.

## Source precedence (active)

1. **Explicit owner-approved decisions** recorded in this file or supplied later. None newer than 8 Oct 2026 were found in the workspace.
2. **Visual design:** `docs/design/AKSH_DESIGN.md`, the AKSH UI/UX Design System Specification **v2.0** (8 Oct 2026). It is supported by the AKSH moodboard `AKSH_Wellness_Brand_Moodboard(2).png`, which is **not present** in the workspace.
3. **Product behaviour:** `docs/requirements/AKSH_PRD.md` (v1.1 canonical copy).
4. **Engineering:** `docs/requirements/AKSH_Technical_Requirements.md` (v1.0 canonical copy). It governs implementation detail where the PRD is less specific.
5. **Proposals, not requirements:** the draft sitemap (summarised in the PRD), `docs/reference/proposals/Screenshot 2026-10-08 165402.png` (homepage sections), and inspiration imagery.
6. **Structural reference only:** `docs/reference/structural/Apple_Style_Reference_DESIGN.md`. It provides no AKSH branding, fonts, colours, navigation, or controls.

## Decisions

| ID | Decision | Basis | Reversible? |
|---|---|---|---|
| D-01 | `AKSH_DESIGN.md` v2.0 is the sole visual authority | Its line 9 explicitly supersedes the earlier UI/UX document and the PRD/TRD visual sections, and preserves their functional requirements. The user's audit brief confirms this | Yes |
| D-02 | The PRD and TRD remain canonical for function and engineering | v2.0 line 9: *"Their functional requirements continue to apply"* | Yes |
| D-03 | Canonical PRD/TRD copies were edited **only** in visual/brand passages; originals are preserved byte-identical in `docs/reference/originals/` | Requirement for unambiguous active docs without silently merging versions | Yes (manifest + backup) |
| D-04 | `AKSH_DESIGN.md` was moved **unchanged**, not edited | It is already current. Its mentions of "the attached DESIGN.md" and the moodboard are resolved in `docs/design/README.md` instead | Yes |
| D-05 | The root `DESIGN.md` (Apple) was renamed to `Apple_Style_Reference_DESIGN.md` and moved to `docs/reference/structural/` | Tools that auto-read a root `DESIGN.md` would otherwise load Apple branding as AKSH's design system | Yes |
| D-06 | `Logo.jpeg` is the **current logo artwork candidate**. `Aksh Logo.png` is a **superseded concept** | Pixel samples: `Logo.jpeg` background `#F9F8F4`, lettering `#000000`, dots ≈`#FF0000`, an exact v2.0 match, and its rule–dot–rule detail matches the spec's interrupted rule. `Aksh Logo.png` ≈`#123C3F`/`#B8975F`, the superseded palette. **Final approval of `Logo.jpeg` as the master is not documented**, so it is labelled a candidate | Yes |
| D-07 | No `public/` folder was created, and no asset was promoted to web use | No application exists and no asset has documented web approval. Media was not converted or cropped (`Logo.jpeg` is opaque raster; no vector/inverse exists) | Yes |
| D-08 | The application will use the **TRD `src/` layout** (`src/app`, `src/components`, `src/content`, `src/lib`, `src/styles/tokens.css`) | The PRD §10 shows root `app/`; the TRD §3 shows `src/app/`. The TRD §1 says it defines implementation detail | Yes |
| D-09 | The homepage section screenshot is **not merged** into the PRD. It is reconciled in `docs/content/HOMEPAGE_SECTIONS.md` | Unknown source and approval. It adds Patient Reviews and an Instagram Feed, which the PRD does not include (PRD §6: testimonials disabled unless supplied and approved) | Yes |
| D-10 | **Patient reviews and the Instagram feed are proposals**, gated on approved content | Not in the PRD or TRD. Never fabricate reviews, ratings, or posts | — |
| D-11 | Third-party inspiration (logos, a website screenshot, a video) lives in `assets/reference/` and is never used in production | Rights belong to other companies; it is layout and style inspiration only | Yes |
| D-12 | Source and reference media keep their original filenames | Provenance. Kebab-case renaming applies only when an approved asset is promoted to `public/` | — |
| D-13 | A `.gitignore` was created even though no repository exists | It excludes `.local-backup/` and future secrets/build output from any later `git init` | Yes |
| D-14 | No Git repository was initialised, no app scaffolded, no dependency installed | Outside this organisational task. Recommended as the first action of Milestone 1 | — |
| D-15 | Fonts: Cormorant Garamond (500/600) and Manrope (400/500/600/700), loaded via the framework's build-time font loader (self-hosted output) or authorised local files with licence notices | Spec "Typography"; TRD §5. Both families are distributed under the SIL Open Font License via Google Fonts. Confirm the licence text is retained when self-hosting manually | — |
| D-16 | Package manager: **pnpm** with `packageManager` pinned; Node pinned to a release supported by the chosen Next.js version | TRD §2 (pnpm for a new repository). Locally available: pnpm 12.8.1, Node 24.21.0. Confirm compatibility when scaffolding | — |
| D-17 | `assets/reference/` is **excluded from Git** (`.gitignore`). All eight files stay on disk unchanged. `assets/source/brand/` remains trackable | Owner instruction of 8 Oct 2026, a conservative answer to O-07 for version control only. The rights are **not resolved**: the folder holds third-party trademarks and copyright (`ASSET_INVENTORY.md`) and a video of unknown licence (O-08). Excluding the files keeps them out of a shared or public repository. It neither grants nor confirms any right to use them, and D-11 (never shipped) still applies | Yes (remove the ignore rule) |

## Edits to canonical copies

### `docs/requirements/AKSH_PRD.md` (from v1.1 original, SHA-256 `ce1fe5d6…`)

| Section | Change |
|---|---|
| Header | Added a canonical-copy notice naming the original, the changed passages, and this file |
| §1 precedence item 2 | Noted that the sitemap `.pptx` is not in the workspace; pointed to `docs/content/HOMEPAGE_SECTIONS.md` |
| §1 precedence item 4 | Replaced the brand `.docx`/teal/gold/Jost authority with the v2.0 spec; Jost superseded; logo artwork preserved |
| §9 "Confirmed direction and brand reference" | Replaced the teal/gold palette, gold CTA, 60/25/10/5 ratio, Jost wordmark, 44px controls, and "subtle radii/restrained shadows" with a v2.0 summary that defers to the spec. **Motion and Responsive behavior subsections are unchanged** |
| §14 Required owner inputs, logo row | Replaced the "Editable AKSH wordmark in Jost" default with the supplied raster artwork and the missing master formats |
| §15 handoff prompt | Replaced the teal/gold palette with v2.0 tokens; updated file paths; added the logo-preservation instruction |

### `docs/requirements/AKSH_Technical_Requirements.md` (from v1.0 original, SHA-256 `6e56bcd8…`)

| Section | Change |
|---|---|
| Header | Added the design spec as a companion and a canonical-copy notice |
| §1 | "supplied brand palette" → v2.0 palette; conflict order now includes the v2.0 spec for visual matters; three decision-register rows updated and one logo row added |
| §5 Brand implementation | Replaced the teal/gold CSS, the 60/25/10/5 guidance, the Jost row, gold-button rules, `2.75rem` controls, and the `1rem` card radius with the v2.0 core tokens, fonts, contrast, breakpoints, and 52px controls, deferring to the spec |
| §15 launch gates | Replaced "text wordmark" fallback with the supplied raster logo and the missing master formats |
| §16 prompt | v2.0 palette/fonts/buttons/logo; updated file paths |
| §17 | Added the v2.0 spec as authoritative for visuals; marked the brand `.docx` superseded and absent |

Every requirement about routes, content, forms, API, idempotency, receipts, security, privacy, SEO, analytics, testing, and launch gates is **unchanged**. Verify with `diff docs/reference/originals/<original> docs/requirements/<copy>`.

## Unresolved items (owner decisions required)

Development that does not depend on these can proceed.

| ID | Question | Blocks |
|---|---|---|
| O-01 | Is `Logo.jpeg` the approved master logo? Please supply SVG/vector, transparent PNG, an inverse (ivory-on-charcoal) variant, a mark-only/favicon version, and clear-space/minimum-size guidance | Final header/footer/favicon/social image; production launch |
| O-02 | Please supply `AKSH_Wellness_Brand_Moodboard(2).png`, which the v2.0 spec cites as its authoritative brand source | Imagery art-direction review (not token implementation) |
| O-03 | Which homepage section list is approved: the PRD §7.1 ten sections or the fifteen-section proposal? Which hero headline is preferred: "A considered approach to your wellbeing." (PRD draft) or "Wellness, Reimagined" (proposal)? | Final homepage composition (Milestone 3) |
| O-04 | What is the public display name: "AKSH", "AKSH Wellness" (current logo), or "AKSH Wellness Clinic" (superseded logo)? | Metadata, titles, structured data |
| O-05 | What is the consultation request destination (existing CRM/booking system or approved store), and what is the notification channel? | Production enquiry launch (Milestone 4/6) |
| O-06 | Which hosting platform and production domain will be used? | Deployment, canonical URLs, security headers |
| O-07 | Should `assets/reference/` (third-party imagery) be excluded if the repository will be public or shared? **Version control answered by D-17 (excluded).** Licensing of the files is still unverified | Nothing in version control. Any use of the files still needs rights confirmation |
| O-08 | What is the source, licence, and intended use of `47799-451812887.mp4`? | Any use of the video |
