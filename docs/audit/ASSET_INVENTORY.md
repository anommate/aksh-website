# AKSH — Asset Inventory

**Updated:** 8 October 2026. Dimensions come from file headers. Approval status records only what the documents state; none is inferred.

**Status key**
- **Candidate:** consistent with current requirements, but approval is not documented.
- **Reference:** for direction only; never shipped.
- **Superseded:** retained for history.
- **Unknown:** provenance or rights unverified.

## Brand

| Path | Intended use | Format | Dimensions | Approval / rights | Missing alternatives |
|---|---|---|---|---|---|
| `assets/source/brand/aksh-wellness-logo.jpeg` (promoted to `public/brand/aksh-wellness-logo.jpeg`) | Primary AKSH Wellness logo (navbar header, mobile drawer) | JPEG, opaque, 27,334 B | 1024×787 | **Owner-supplied artwork.** Background `#F9F8F4`, lettering `#000000`, dots `#FF0000`, subtext WELLNESS. Rights owner's. Proportional responsive wrapper display | SVG/vector master; transparent PNG; inverse (ivory) variant for charcoal surfaces |
| `assets/source/brand/Logo.jpeg` | Retained previous candidate logo | JPEG, opaque, 44,969 B | 1560×1200 | **Candidate.** Retained in source/brand. Background `#F9F8F4`, lettering `#000000`, dots ≈`#FF0000` | — |
| `assets/source/brand/about-us-artwork.png` (promoted to `public/brand/about-us-artwork.png`) | Homepage About Us section masthead artwork | PNG RGBA, 702,114 B | 1024×576 | **Owner-supplied artwork.** Background `#F9F8F4`/`#FBFBF6`, lettering `#000000`, dot `#FF0000`. Rights owner's. Non-destructive display crop in CSS layout | Vector/SVG asset if available |
| `assets/source/brand/our-services-artwork.png` (trimmed display copy `public/brand/our-services-masthead.png`, 920×405) | Homepage Services section masthead ("OUR SERVICES") | PNG RGBA (fully opaque), 1,601,899 B | 1942×809 | **Owner-supplied artwork** (11 Oct 2026). Ivory textured ground, black lettering and rules, red dot. Display copy is a pixel crop of the measured artwork bounds (x 536–1407, y 233–589) plus a 24px margin; nothing redrawn or rescaled. Rights owner's. Not a service image | Vector/SVG asset if available |
| `assets/reference/superseded-brand/Aksh Logo.png` | None | PNG RGB, 1,223,729 B | 1122×1402 | **Superseded** teal/gold concept (≈`#123C3F`/`#B8975F`) shown in a mock-up with leaf shadows | — |

Logo usage rules (design spec "Global Clinic Navigation"):
- Maximum width 160 / 144 / 120px (desktop/tablet/mobile).
- Clear space at least 24px desktop and 16px mobile.
- Never redraw, recolour, crop, stretch, or rebuild it with a font.

The JPEG has ivory baked in, so it only sits correctly on `#F9F8F4` surfaces; the charcoal footer needs an approved inverse asset or an ivory panel.

## Fonts

| Family | Weights needed | Supplied? | Source plan | Licence |
|---|---|---|---|---|
| Cormorant Garamond | 500, 600 | **No files supplied** | Framework build-time font loader (self-hosted output) or authorised local WOFF2 files | SIL Open Font License (Google Fonts distribution). Retain the licence text if self-hosting files |
| Manrope | 400, 500, 600, 700 | **No files supplied** | As above | SIL Open Font License (Google Fonts distribution) |

The logo's lettering is artwork, not a font. Do not identify or load it.

## Prototype and development imagery

| Path | Intended use | Format | Dimensions | Status / prompt | Launch dependency |
|---|---|---|---|---|---|
| `assets/source/prototype/hero-architecture-prototype.jpg` (promoted for dev to `public/images/hero-architecture-prototype.jpg`) | Hero section architectural visual (Step 4) | JPEG | 1024×1024 | **Prototype.** Generated locally for development composition. Prompt: *"Editorial architectural still life of a minimalist luxury wellness sanctuary alcove with warm textured lime wash plaster walls in soft ivory, an elegant rounded arch niche with warm backlighting, a dark smooth spherical sculpture on a charcoal plinth, soft organic botanical leaf shadows cast across the stucco wall, serene aesthetic, high end quiet luxury interior."* | **Not approved.** Production requires authentic clinic/architectural photography. The visual "Prototype imagery" badge is a development disclosure and does not constitute approval |

## Proposal and reference documents (images)

| Path | Intended use | Format | Dimensions | Status |
|---|---|---|---|---|
| `docs/reference/proposals/Screenshot 2026-10-08 165402.png` | Homepage IA proposal; transcribed in `docs/content/HOMEPAGE_SECTIONS.md` | PNG RGBA | 688×620 | **Reference.** Source and approval unknown |

## Inspiration (third-party; never production)

| Path | What it shows | Format | Dimensions | Rights |
|---|---|---|---|---|
| `assets/reference/inspiration/web/Home Page referance.png` | Hero layout of another company's health website, including a model photo, pricing, and claims | PNG RGBA | 1522×779 | **Reference.** Third-party copyright, including the photograph |
| `assets/reference/inspiration/logo/A.jpg` | "KAÜRA" jewellery logo | JPEG | 1080×1346 | **Reference.** Third-party trademark |
| `assets/reference/inspiration/logo/B.jpg` | "AURA" logo | JPEG | 1200×1498 | **Reference.** Third-party trademark |
| `assets/reference/inspiration/logo/C.jpg` | "elara" logo | JPEG | 736×736 | **Reference.** Third-party trademark |
| `assets/reference/inspiration/logo/D.jpg` | "Aramide Couture" logo | JPEG | 1200×1200 | **Reference.** Third-party trademark |
| `assets/reference/inspiration/logo/Aurika – The Art of Glowing Grace.jfif` | "Aurika" logo | JPEG (JFIF) | 736×920 | **Reference.** Third-party trademark. The filename has a non-ASCII en dash |
| `assets/reference/inspiration/logo/47799-451812887.mp4` | **Not viewed** (no decoder available) | MP4 H.264, 4.69 MB | 1920×1080, 20.0 s | **Unknown.** The numeric name suggests a stock download; licence unverified (O-08) |

## Duplicates

**None.** All 14 original files have distinct SHA-256 hashes (`RESTRUCTURE_MANIFEST.csv`). The only intentional copies are:
- `.local-backup/restructure-2026-10-08/original-root/*`: byte snapshot, git-ignored.
- `docs/requirements/*.md`: edited canonical copies of `docs/reference/originals/*.md`.

## Gaps for development and launch

| Gap | Required by | Development fallback |
|---|---|---|
| Logo SVG/transparent/inverse/mark | Header on non-ivory surfaces, footer, favicon, app icons, OG image | Raster candidate on ivory only; footer logo on an ivory panel or omitted |
| Favicon and app icons | Every page | Leave the framework default until the mark is approved. Do not crop the JPEG |
| Open Graph/social share image | PRD §11 SEO | Omit `og:image` until approved |
| Clinic photography (environment, treatment rooms) | Hero, About, clinic-experience section | Clearly labelled prototype imagery (`source: 'prototype'`, TRD §6) |
| Practitioner portraits | Specialists, `/about/doctor` | Omit the section |
| Pillar imagery (4:3) for four pillars | Pillar cards and category heroes | Labelled prototype imagery |
| Journal imagery (16:9) | Journal | Collection hidden |
| Moodboard `AKSH_Wellness_Brand_Moodboard(2).png` | Imagery art direction (design spec "Imagery") | Use the spec's written imagery guidance |
| Icon set | Navigation, accordions, alerts, form controls | Choose one open-licence icon library in Milestone 2 and record it |

## Promotion rule

When an asset is approved for the website, copy it (do not move it) into `public/` with a kebab-case name, for example `public/brand/aksh-logo.svg`. Record its source path, approval reference, and licence here. Keep originals in `assets/source/`.
