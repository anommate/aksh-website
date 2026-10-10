# AKSH — Initial Directory Audit

**Audit date:** 8 October 2026
**Workspace:** `F:\My Digital Savvy\AKSH` (Git Bash path `/f/My Digital Savvy/AKSH`)
**Shell:** Windows 11; Git Bash (MINGW64) and Windows PowerShell 5.1. Not WSL, so no mounted path translation was needed.
**Scope:** Read-only inspection before restructuring. Nothing was moved or edited before this report was written.

## 1. Summary

The directory contains requirements, a design specification, logo artwork, and visual inspiration only. **No application exists.** There is no Git repository here or in any parent directory, and no `AGENTS.md`, `CLAUDE.md`, package manifest, lockfile, configuration, environment file, test, or deployment file.

The current visual authority is `AKSH_DESIGN.md` v2.0 (8 Oct 2026). It explicitly supersedes the teal/gold visual sections of `AKSH_PRD.md` v1.1 and `AKSH_Technical_Requirements.md` v1.0, whose functional and engineering content still applies. `DESIGN.md` is an Apple style reference used only for structure.

Three source files referenced by the documents are **not present**: the moodboard, the brand palette document, and the sitemap presentation.

## 2. Environment and repository

| Check | Result | Evidence |
|---|---|---|
| Directory exists | Yes | `Test-Path -LiteralPath` returned `True` |
| Git repository | **None** | `git rev-parse --show-toplevel` failed: not a git repository (including parents). No `.git` in `F:\`, `F:\My Digital Savvy`, or `AKSH` |
| Existing application | **None** | No `package.json`, lockfile, `src/`, `app/`, `public/`, or config files |
| Agent instructions | None found | No `AGENTS.md` or `CLAUDE.md` in the workspace, its parents, or `~/.claude/` |
| Environment/secret files | None found | No `.env*`, keys, credentials, or private personal data in the 14 files |
| Toolchain available | Node 24.21.0, npm 11.19.0, pnpm 12.8.1, Git 2.45.2, Python 3.14 | Version commands. No ffmpeg, ImageMagick, or Python imaging libraries |
| Baseline checks | **Not applicable** | No executable application, scripts, or tests exist |

## 3. File inventory (before changes)

Fourteen files in three folders, 7.48 MB in total. SHA-256 hashes were recorded for every file, and **no two hashes match, so there are no exact duplicates.**

| Original path | Type | Size (bytes) | Dimensions / notes | SHA-256 (first 16) |
|---|---|---:|---|---|
| `AKSH_DESIGN.md` | Markdown, UTF-8 (no BOM), LF | 35,672 | UI/UX Design System Specification **v2.0, 8 Oct 2026** | `3edab6117db43f5a` |
| `AKSH_PRD.md` | Markdown, UTF-8 (no BOM), LF | 38,997 | PRD **v1.1, 7 Oct 2026** | `ce1fe5d60df0f407` |
| `AKSH_Technical_Requirements.md` | Markdown, UTF-8 (no BOM), LF | 46,654 | Technical requirements **v1.0, 7 Oct 2026** | `6e56bcd8b29f563d` |
| `DESIGN.md` | Markdown, UTF-8 (no BOM), LF | 22,019 | "Apple — Style Reference" (generic structural reference) | `a0de8225fb315bc2` |
| `Logo.jpeg` | JPEG | 44,969 | 1560×1200, opaque. Black "AKSH" lettering, red dots, "WELLNESS" | `992076930eb0bab0` |
| `Aksh Logo.png` | PNG RGB | 1,223,729 | 1122×1402, opaque. Teal/gold "AKSH WELLNESS CLINIC" mock-up with leaf shadows | `b810dc5b22f40fb4` |
| `Screenshot 2026-10-08 165402.png` | PNG RGBA | 65,093 | 688×620. A 15-row "Homepage section" list from an unknown source | `7442ce7b0e530c2d` |
| `Inspi/Home Page referance.png` | PNG RGBA | 560,835 | 1522×779. Third-party website hero ("superpower") | `b47900c0e7c5b938` |
| `Logo Inspi/A.jpg` | JPEG | 584,705 | 1080×1346. Third-party logo "KAÜRA" | `6aa39393ab116d31` |
| `Logo Inspi/B.jpg` | JPEG | 81,266 | 1200×1498. Third-party logo "AURA" | `0783f24357624102` |
| `Logo Inspi/C.jpg` | JPEG | 21,486 | 736×736. Third-party logo "elara" | `0a3940f5f8c20152` |
| `Logo Inspi/D.jpg` | JPEG | 35,168 | 1200×1200. Third-party logo "Aramide" | `e0374db962de8a01` |
| `Logo Inspi/Aurika – The Art of Glowing Grace.jfif` | JPEG (JFIF) | 26,034 | 736×920. Third-party logo "Aurika" | `44d9c8e320814b2a` |
| `Logo Inspi/47799-451812887.mp4` | MP4 (H.264) | 4,688,565 | 1920×1080, 20.0 s; header metadata only | `58457a4358a9e0ac` |

The full hashes appear in `RESTRUCTURE_MANIFEST.csv`.

### Formats not fully inspected

- **`47799-451812887.mp4`**: The video frames could not be viewed because no decoder (ffmpeg, OpenCV, PyAV) is installed. The container header gives 20.0 s, 1920×1080, `avc1`. The numeric filename looks like a stock-library download ID, but **the source and licence are unknown.** Its content is not described here because it has not been seen.

## 4. Document analysis and source precedence

### Version and supersession evidence

| Document | Internal version/date | Explicit statements | Status |
|---|---|---|---|
| `AKSH_DESIGN.md` | v2.0, 8 Oct 2026 | Line 9: *"This file supersedes the visual tokens and component dimensions in the earlier AKSH UI/UX document and the visual sections of the PRD/technical requirements. Their functional requirements continue to apply."* | **Canonical: visual design** |
| `AKSH_PRD.md` | v1.1, 7 Oct 2026 | §1 names `AKSH_Brand_Palette_and_Fonts.docx` (teal/gold, Jost wordmark) as the visual authority, which v2.0 superseded | **Canonical: product/functional.** §9 visual subsection, §14 logo row, and §15 prompt palette are superseded |
| `AKSH_Technical_Requirements.md` | v1.0, 7 Oct 2026 | Companion to PRD v1.1. §5 encodes teal/gold tokens, a 44px control height, a 16px card radius, and Jost | **Canonical: engineering.** §1 decision rows, §5, the §15 logo gate, and the §16 prompt palette are superseded |
| `DESIGN.md` | none | Apple product-page style reference (SF Pro, blue controls) | **Structural reference only.** v2.0 line 9 says it is not AKSH branding |

The filenames and modification times agree with the internal dates, but precedence was decided from the internal content above.

### Visual conflicts found (superseded side in *italics*)

| Topic | v2.0 design spec (current) | *PRD v1.1 / TRD v1.0 (superseded visual sections)* |
|---|---|---|
| Palette | Logo Black `#000000`, Brand Ivory `#F9F8F4`, Signal Red `#FF0000`, Warm Stone `#E4DED3`, Quiet Sage `#A7B0A1`, Soft Charcoal `#282826`, plus Muted Text `#645F57` and Control Outline `#7C776E` | *Deep Teal `#123C3F`, Warm Ivory `#F5EFE6`, Champagne Gold `#B8975F`, Sage Mist `#A8B8A6`, Soft Clay `#C98B72`, Charcoal `#1F2523`* |
| Primary CTA | Black fill, ivory label; hover charcoal | *Gold fill, charcoal label, teal outline* |
| Accent | Signal red as a restrained signal only | *Gold/clay accents; 60/25/10/5 ratio* |
| Logo/wordmark | Preserve the supplied master logo; do not reconstruct it with a font | *Interim Jost wordmark* |
| Control height | 52px min for buttons/inputs; 44px min targets | *44px (`2.75rem`)* |
| Card radius | 28px desktop/tablet, 20px mobile; no shadow | *16px (`1rem`); "restrained shadows"* |
| Fonts | Cormorant Garamond (display), Manrope (body/UI) | Same, *plus Jost* |

**There are no functional conflicts.** The PRD, TRD, and design spec agree on consultation semantics, required form fields, receipt wording, data minimisation, and the out-of-scope list.

### Engineering inconsistency (non-visual)

The PRD §10 suggested structure puts `app/` at the repository root. The TRD §3 uses `src/app/`. The TRD defines implementation detail (TRD §1), so **`src/` governs**. This is recorded in `DECISIONS.md`. Neither document was changed on this point.

### Embedded prompts

PRD §15 and TRD §16 contain Claude Code prompts. They were treated as project data and **not executed**. Both prompts include superseded palette instructions.

## 5. Missing referenced files and broken references

| Referenced name | Referenced in | Found? | Impact |
|---|---|---|---|
| `AKSH_Wellness_Brand_Moodboard(2).png` | `AKSH_DESIGN.md` line 3 ("authoritative brand source") | **No.** Not in the workspace, `Downloads`, `Desktop`, or `Documents` (depth 3, name search only) | The design spec is self-sufficient for tokens. Imagery art direction cannot be checked against the moodboard |
| "earlier AKSH UI/UX document" | `AKSH_DESIGN.md` line 9 | No | Superseded; no impact |
| `AKSH_Brand_Palette_and_Fonts.docx` | PRD §1, §9; TRD §5, §17 | **No** | Superseded for visuals; no impact on implementation |
| `Aksh_Website_Sitemap_Client_Review.pptx` (v3) | PRD §1 | **No** | The PRD already summarises its relevant content as draft candidates |
| `AGENTS.md` | PRD §10, §15; TRD §2, §16 | No | Only an instruction to inspect it if present |
| `DESIGN.md` ("attached") | `AKSH_DESIGN.md` lines 3, 9 | Yes | Will be relocated; the canonical design notes will record its new path |

No Markdown hyperlinks to local files exist, so nothing is currently broken.

## 6. Naming, collision, and path risks

- Filenames with spaces: `Aksh Logo.png`, `Home Page referance.png`, `Screenshot 2026-10-08 165402.png`, `Logo Inspi/`, `Aurika – The Art of Glowing Grace.jfif`.
- A non-ASCII en dash (U+2013) appears in the Aurika filename, which is a portability risk for some tools and URLs.
- Inconsistent casing: `AKSH_*.md` vs `Aksh Logo.png`. There are no case-only collisions (no two names differ only by case).
- Inconsistent extensions: `.jpeg`, `.jpg`, `.jfif`.
- Spelling: "referance" (reference), "Inspi" (abbreviation).
- **Tooling risk:** the root `DESIGN.md` is an Apple style guide. Tools that auto-read a root `DESIGN.md` could treat Apple branding as AKSH's design system.
- No file is web-facing yet, so none of these names currently breaks a URL.

## 7. Asset classification

| Asset | Classification | Rationale |
|---|---|---|
| `Logo.jpeg` | **Current logo artwork; production candidate pending approval and master formats** | Pixel samples: background `#F9F8F4`, lettering `#000000`, dots ≈`#FF0000` (JPEG artefacts give `#FE0A0A`/`#F4130F`), matching v2.0 exactly. Its rule–dot–rule divider matches the spec's "interrupted rule". It is a raster JPEG with ivory baked in: there is no vector, transparent, or inverse variant |
| `Aksh Logo.png` | **Superseded logo concept** (reference only) | Samples: lettering ≈`#133F43` (teal `#123C3F`), star ≈`#BC9358` (gold `#B8975F`). Matches the superseded palette. It is a styled mock-up with leaf shadows, not master artwork |
| `Screenshot 2026-10-08 165402.png` | **Information-architecture proposal** (reference) | A 15-section homepage list including "Patient Reviews" and "Instagram Feed". Its source and approval are unknown |
| `Inspi/Home Page referance.png` | **Third-party website reference** | A screenshot of another company's site. It contains a third-party photograph, pricing, and claims. Layout inspiration only |
| `Logo Inspi/*.jpg`, `.jfif` | **Third-party logo inspiration** | Other brands' logos (KAÜRA, AURA, elara, Aramide, Aurika). Never for production |
| `Logo Inspi/47799-451812887.mp4` | **Unknown reference media** | Grouped by the owner with logo inspiration. Content and licence are unverified |

There are no fonts, photography of the clinic or staff, icons, favicons, or social images.

## 8. Confidentiality

No secrets, credentials, environment files, patient data, or personal contact details were found. The documents contain no clinic address, phone number, or staff names. Third-party inspiration images are copyrighted by others: they are not confidential, but they must stay out of public web assets.

## 9. Proposed organisation

This is a requirements-only project, so the plan organises the resources and documents the future application layout without scaffolding it.

| Original | Proposed destination | Operation | Reason |
|---|---|---|---|
| `AKSH_DESIGN.md` | `docs/design/AKSH_DESIGN.md` | Move (bytes unchanged) | Current canonical spec; no edits required |
| `AKSH_PRD.md` | `docs/reference/originals/AKSH_PRD_v1.1_original.md` | Move (bytes unchanged) | Preserve the unedited original |
| (copy of above) | `docs/requirements/AKSH_PRD.md` | Copy + edit | Canonical copy with visual sections aligned to v2.0 |
| `AKSH_Technical_Requirements.md` | `docs/reference/originals/AKSH_Technical_Requirements_v1.0_original.md` | Move (bytes unchanged) | Preserve the unedited original |
| (copy of above) | `docs/requirements/AKSH_Technical_Requirements.md` | Copy + edit | Canonical copy with visual sections aligned to v2.0 |
| `DESIGN.md` | `docs/reference/structural/Apple_Style_Reference_DESIGN.md` | Move + rename | Remove the root `DESIGN.md` tooling risk; label it as non-AKSH |
| `Logo.jpeg` | `assets/source/brand/Logo.jpeg` | Move | Current logo source artwork |
| `Aksh Logo.png` | `assets/reference/superseded-brand/Aksh Logo.png` | Move | Superseded concept, kept for history |
| `Screenshot 2026-10-08 165402.png` | `docs/reference/proposals/Screenshot 2026-10-08 165402.png` | Move | IA proposal; transcribed into `docs/content/` |
| `Inspi/Home Page referance.png` | `assets/reference/inspiration/web/Home Page referance.png` | Move | Third-party layout reference |
| `Logo Inspi/*` (6 files) | `assets/reference/inspiration/logo/` | Move | Third-party logo and media inspiration |

Additional work:

- New files: `README.md`, `CLAUDE.md`, `.gitignore`, `docs/design/README.md`, `docs/content/*`, and `docs/audit/*`.
- A pre-change byte snapshot of all 14 originals in `.local-backup/restructure-2026-10-08/`, which is git-ignored.
- **Not created:** `public/` (no approved web asset or application yet), the application scaffold, `node_modules`, and a Git repository.

Source and reference files keep their original names for provenance. Kebab-case naming applies when assets are promoted to `public/` during development.
