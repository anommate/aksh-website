# AKSH — Content Status and Missing Clinic Inputs

**Updated:** 11 October 2026. **Rule:** publish only owner-approved facts. Anything not listed as confirmed is missing and must be omitted in production or shown as a labelled draft in local/preview builds only (PRD §6, §14).

## Confirmed (usable now)

| Item | Value | Source |
|---|---|---|
| Brand name | **AKSH** (public display form still open: see DECISIONS O-04) | PRD §1 |
| Service pillars (exact names, in order) | Biohacking · Recovery · Body Contouring · Skin Treatments | PRD §1, §6 |
| Pillar route slugs | `biohacking`, `recovery`, `body-contouring`, `skin` | TRD §4 |
| Booking model | Enquiry form; clinic staff contact the visitor and confirm appointments manually. No live slots or payments | PRD §8; TRD §1 |
| Single clinic location | Yes (address not supplied) | PRD §1, §7.7 |
| Visual direction | Warm luxury, editorial; design spec v2.0 | Owner; `docs/design/AKSH_DESIGN.md` |
| Homepage Services wording | Eyebrow "DISCOVER WELLNESS AT AKSH"; H2 "Thoughtfully Designed Around You."; introduction paragraph, verbatim in `src/content/services.ts` | Owner-supplied Services brief (11 Oct 2026) |
| Homepage Services masthead | "OUR SERVICES" lettering artwork (`assets/source/brand/our-services-artwork.png`); accessible name "Our Services" | Owner-supplied artwork (11 Oct 2026). A heading graphic only: it does not fill any service-image gap |
| Homepage service categories (in order) | 01 Biohacking · 02 Recovery · 03 Body Contouring · 04 Skin, each with its tagline, description and "Explore …" CTA, verbatim in `src/content/services.ts`. The homepage card label is "Skin"; the pillar name elsewhere remains "Skin Treatments" | Owner-supplied Services brief (11 Oct 2026) |
| Treatment names (homepage display) | **Biohacking:** Cryo Chamber — Whole-Body Cryotherapy; Aerion Oxy Pod — Oxygen & Hydrogen Therapy. **Recovery:** Gamma Wavelength Therapy — Mind & Body Massager; Recliner Chair Relaxation — Comfort & Relaxation; Sound Healing Room — Immersive Sound Relaxation; Salt Sauna — Heat & Relaxation Experience. **Body Contouring:** EMSculpt Neo — Muscle Building & Fat Reduction; Cryolipolysis — Fat Freezing; RF Skin Tightening — Radiofrequency Skin Tightening. **Skin:** Red Light Therapy — Skin Rejuvenation; Q-Switch Laser — Pigmentation & Skin Brightening; Diode Laser Hair Removal — Long-Term Hair Reduction | Owner-supplied Services brief (11 Oct 2026). Clinical review still open (see Missing clinic inputs) |

## Fixed interface wording (from requirements)

These strings are specified, so use them verbatim.

| Context | Text | Source |
|---|---|---|
| Primary CTA label | Book a Consultation | Design spec "Primary Consultation Button"; PRD §5 |
| Form submit label | Send Consultation Request | Design spec |
| Loading label | Sending your request… | Design spec |
| Booking page explanation | Submit a consultation request. The clinic will contact you to confirm availability. | PRD §8 |
| Success/receipt message | Your consultation request has been received. | PRD §8; TRD §8 |
| Service interest options | Biohacking · Recovery · Body Contouring · Skin Treatments · Not sure yet | PRD §8 |
| Time preference options | Morning · Afternoon · No preference | PRD §8 |

Never say or imply that an appointment is confirmed, and never promise a response time unless the owner supplies one.

## Draft copy (needs owner approval before publication)

| Location | Draft | Source | Status |
|---|---|---|---|
| Home hero headline | "A considered approach to your wellbeing." | PRD §7.1 | Draft |
| Home hero headline (alternative) | "Wellness, Reimagined" | Homepage proposal screenshot | Draft. Owner to choose (O-03) |
| Home hero support | "Explore biohacking, recovery, body contouring and skin treatments at AKSH." | PRD §7.1 | Draft |
| Homepage section headings | See `HOMEPAGE_SECTIONS.md` | Proposal screenshot | Proposal |

## Draft candidate offerings (not confirmed)

The earlier sitemap lists these. They stay unpublished until the clinic confirms each one (PRD §6):

- **Assessments/diagnostics:** biological age testing, blood panels, body composition, skin analysis.
- **Programs:** longevity, recovery/performance, skin.

The owner has confirmed the twelve homepage treatment names and descriptors listed under Confirmed. No other treatment, device, or modality is confirmed, and no treatment detail (overview, suitability, process, duration, downtime, aftercare, price) has been supplied for any of them.

## Missing clinic inputs

"Local dev" means a safe development default exists (PRD §14). "Launch" means the item blocks production.

| Input | Needed for | Local dev | Launch |
|---|---|---|---|
| Public display name and legal entity name | Titles, metadata, footer, structured data, policies | Use "AKSH" | **Blocks** |
| Clinic address, map/directions link | Contact page, footer, local SEO | Omit / labelled placeholder | **Blocks** |
| Phone, email, WhatsApp (if used) | Contact links, unavailable-form fallback | Omit; no fake numbers | **Blocks** |
| Opening hours and IANA timezone | Contact, date validation | Placeholder timezone in dev config only | **Blocks** |
| Treatment catalogue per pillar | Category/detail pages | Pillar pages with general copy only; homepage treatment names are confirmed | Pillar copy blocks; individual treatment detail optional |
| Approved pillar introductions and summaries | Category pages | Labelled draft | **Blocks** category pages. Homepage summaries are confirmed (owner Services brief) |
| Clinical review of homepage treatment names, descriptors and category descriptions | Home Services section, later category pages | Owner-supplied wording shown as supplied | **Unresolved.** Needs clinical/claims review before launch (PRD pillar rules); no reviewer or review date recorded |
| Service category imagery (four 4:3 images: Biohacking, Recovery, Body Contouring, Skin) | Home Services cards, category heroes | Labelled "Development placeholder" panels in every mode | **Unresolved.** No approved or licensed images supplied; the "OUR SERVICES" masthead artwork does not fill these gaps |
| Clinic philosophy / "The AKSH approach" copy | Home, About | Owner-supplied copy and masthead artwork implemented | Confirmed for Home About section |
| Consultation process steps (real workflow) | How It Works, Home | Generic request → contact → consultation (PRD §7.5) | Needs approval |
| Doctor/practitioner names, credentials, registration, bios, portraits | About, Specialists, `/about/doctor` | Omit sections | Optional (omit if absent) |
| Clinic and treatment photography with usage rights | Hero, pillars, About, clinic experience | Labelled prototype imagery | **Blocks** hero/pillar imagery |
| Prices, durations, downtime, preparation, aftercare | Treatment detail fields | Omit fields | Optional |
| FAQ questions and reviewed answers (Visiting, Consultations, Service Areas) | FAQ, Home, category pages | Labelled draft | **Blocks** FAQ page |
| Privacy policy, terms, booking policy, medical disclaimer | Policy pages, form consent link | Draft for owner review | **Blocks** |
| Contact-permission consent wording and version | Enquiry form (`consentVersion`) | Dev version string | **Blocks** |
| Marketing permission (yes/no) | Optional checkbox | Hidden | Needs decision |
| Patient reviews (real, consented, approved) | Proposed "Voices of AKSH" section | Hidden | Optional (proposal) |
| Instagram account handle and display approach | Proposed "Life at AKSH" section | Hidden | Optional (proposal) |
| Journal articles (author, reviewer, dates) | Journal | Hidden collection | Optional |
| Social links | Footer, structured data | Omit | Optional |
| Analytics tool and consent policy | Measurement | Disabled | Optional |
| Logo master files and approval | Header, footer, favicon, OG image | Raster candidate | **Blocks** (see DECISIONS O-01) |
| Consultation destination and notification channel | Enquiry flow | Labelled demo adapter | **Blocks** |
| Domain and hosting | Canonical URLs, deployment | localhost | **Blocks** |
