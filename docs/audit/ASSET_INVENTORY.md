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
| `assets/source/brand/the-aksh-experience-artwork.png` (trimmed display copy `public/brand/the-aksh-experience-masthead.png`, 1920×261 PNG RGB, 332,356 B) | Homepage The AKSH Experience section masthead ("THE AKSH EXPERIENCE" wordmark), replacing the typed label; alt "The AKSH Experience" | PNG RGB (opaque), 1,105,181 B, SHA-256 `f1f7c908…a800ee6b59` | 2172×724 | **Owner-supplied artwork** (12 Oct 2026, received as a chat attachment and archived byte-for-byte). Ivory ground `#FCFBF7` (3 levels lighter than Brand Ivory `#F9F8F4`; kept as supplied), black lettering and stylised A, crescent, red dot `#FF0000`. Display copy is a pixel crop of the measured ink bounds (x 156–2019, y 226–430; red dot x 888–911, y 261–284) plus a 28px margin on every side, 2× sharp at up to 960px; verified pixel-identical to that region, nothing redrawn or rescaled. Shown at up to 640px wide (`--experience-masthead-width`, reduced from 960px so the whole section fits one desktop view), the container width below that. Rights owner's | Vector/SVG asset if available |
| `assets/source/brand/client-experiences-artwork.png` (trimmed display copy `public/brand/client-experiences-masthead.png`, 1625×188 PNG RGBA, 68,459 B, SHA-256 `dd80b6c4…ca13553f`) | Homepage Client Experiences section masthead ("CLIENT EXPERIENCES" lettering, `#client-experiences`), replacing the typed label; alt "Client Experiences" | PNG RGBA (transparent; no opaque pixels outside the lettering), 130,482 B, SHA-256 `51c10176…04e0596e`; carries an embedded C2PA (`caBX`) metadata chunk, kept in the archive and not in the display copy | 1672×941 | **Owner-supplied artwork** (12 Oct 2026, received as a chat attachment and archived byte-for-byte). Black lettering only, on transparency; no dot or symbol. Lettering bounds measured at alpha ≥ 2 (x 56–1624, y 403–534); 6 isolated alpha-1 noise pixels outside them were ignored for measurement. Display copy is a pixel crop of those bounds plus a 28px transparent margin on every side (x 28–1652, y 375–562), verified pixel-identical to that region; nothing redrawn, recoloured or rescaled. 2× sharp at up to 812px. Shown at up to 800px wide (`--testimonials-masthead-width`), the container width below that. Rights owner's | Vector/SVG asset if available |
| `assets/source/brand/faq-artwork.png` (trimmed display copy `public/brand/faq-masthead.png`, 1995×199 PNG RGBA, 86,372 B, SHA-256 `efdb9539…19510588`) | Homepage FAQ section heading ("FREQUENTLY ASKED QUESTIONS" lettering, `#faq`): the section's H2, replacing the typed title; alt "Frequently Asked Questions" | PNG RGBA (transparent; no opaque pixels outside the lettering), 155,829 B, SHA-256 `4de6f5ce…8c9d457` | 2048×682 | **Owner-supplied artwork** (12 Oct 2026, received as a chat attachment and archived byte-for-byte). Black lettering only, on transparency, including the two Q tails. Lettering bounds measured at alpha ≥ 1 (x 57–1995, y 283–425); no isolated noise outside them. Display copy is a pixel crop of those bounds plus a 28px transparent margin on every side (x 29–2023, y 255–453), verified pixel-identical to that region; nothing redrawn, recoloured or rescaled. 2× sharp at up to 997px. Shown at up to 960px wide (`--faq-masthead-width`), the container width below that. Rights owner's | Vector/SVG asset if available |
| `assets/reference/superseded-brand/Aksh Logo.png` | None | PNG RGB, 1,223,729 B | 1122×1402 | **Superseded** teal/gold concept (≈`#123C3F`/`#B8975F`) shown in a mock-up with leaf shadows | — |

Logo usage rules (design spec "Global Clinic Navigation"):
- Maximum width 160 / 144 / 120px (desktop/tablet/mobile).
- Clear space at least 24px desktop and 16px mobile.
- Never redraw, recolour, crop, stretch, or rebuild it with a font.

The JPEG has ivory baked in, so it only sits correctly on `#F9F8F4` surfaces; the charcoal footer needs an approved inverse asset or an ivory panel.

## Team

| Path | Intended use | Format | Dimensions | Approval / rights | Missing alternatives |
|---|---|---|---|---|---|
| `assets/source/team/Dr.Priyanka-Masharkar-Twacha-Aesthetic.jpg` (byte-identical display copy `public/team/dr-priyanka-masharkar.jpg`) | Homepage "Meet Our Consultant" portrait | JPEG (baseline, sRGB, 4:2:0), 112,086 B | 619×856 | **Owner-supplied photograph** (11 Oct 2026). Shown unedited at its natural ratio; no retouching, recolouring or background change. Embedded EXIF Artist/Copyright read "Dr.Priyanka-Masharkar-Twacha-Aesthetic" (no GPS or camera data): **confirm AKSH's right to use it.** Not documentary clinic imagery | Higher-resolution original (at least 1240px wide) for sharp display on high-density screens |

## Animations

| Path | Intended use | Format | Dimensions | Approval / rights | Missing alternatives |
|---|---|---|---|---|---|
| `public/animations/experience/01-book-consultation.{json,svg}`, `02-personalised-consultation`, `03-wellness-docket`, `04-experience-aksh`, `05-continued-care` | Homepage The AKSH Experience (`#experience`) journey step illustrations (calendar with enquiry message; two conversation bubbles; folder revealing a document; leaf with a small radiating accent; headset with a support bubble) | Lottie JSON (Bodymovin 5.7 schema, 30fps, 186 frames: a "reveal" marker (frames 0–66, 2.2s) played once, then a "loop" marker (66–186, 4s) of small idle pulses repeated while in view; one shape layer, no images or expressions) plus a static SVG of the settled frame, where the loop starts and ends | 160×160, transparent background | **Original artwork authored for AKSH** (11 Oct 2026); no third-party assets, so no licence or attribution applies. Source: `scripts/generate-experience-animations.mjs` regenerates both formats from one definition. Palette: Soft Charcoal strokes, Warm Stone fills, Signal Red accents, Brand Ivory occluding fills. Played with `lottie-web` 5.13.0 (MIT, bundled and served from this site; SVG renderer, `lottie_light` build) | — |

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
| Practitioner portraits | Specialists, `/about/doctor` | Omit the section. Homepage consultant portrait supplied (see Team); usage rights and a higher-resolution original still needed |
| Pillar imagery (4:3) for four pillars | Pillar cards and category heroes | Labelled prototype imagery |
| Testimonial portraits | Homepage "Client Experiences" cards | **None used.** No stock portrait sources were supplied, so no images were downloaded or linked; each card shows decorative initials (aria-hidden). Any future portrait must be a consented client photo or a licensed stock image labelled as a placeholder, served locally from `public/` and recorded here with its source and licence (TRD §6). The 21st.dev demo's remote portraits were not used |
| Journal imagery (16:9) | Journal | Collection hidden |
| Moodboard `AKSH_Wellness_Brand_Moodboard(2).png` | Imagery art direction (design spec "Imagery") | Use the spec's written imagery guidance |
| Icon set | Navigation, accordions, alerts, form controls | Choose one open-licence icon library in Milestone 2 and record it |

## Promotion rule

When an asset is approved for the website, copy it (do not move it) into `public/` with a kebab-case name, for example `public/brand/aksh-logo.svg`. Record its source path, approval reference, and licence here. Keep originals in `assets/source/`.
