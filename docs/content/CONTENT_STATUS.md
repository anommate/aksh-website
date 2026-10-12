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
| Homepage consultant section wording | Eyebrow "MEET OUR CONSULTANT"; name "Dr. Priyanka Masharkar"; role "Aesthetic Dermatologist \| Wellness & Aesthetic Consultant"; tagline and five-paragraph biography, verbatim in `src/content/consultant.ts` | **Owner-supplied wording** (11 Oct 2026), published as supplied. The role title, "background in medical practice" and "advanced training" statements are the owner's; qualifications, training and registration are **not independently verified** (see Missing clinic inputs) |
| Homepage consultant portrait | `assets/source/team/Dr.Priyanka-Masharkar-Twacha-Aesthetic.jpg`; alt "Dr. Priyanka Masharkar" | Owner-supplied photograph (11 Oct 2026); usage rights to confirm (see `docs/audit/ASSET_INVENTORY.md`) |
| "The AKSH Experience" homepage section (`#experience`, after Meet Our Consultant; `/experience` redirects there) wording | Wordmark artwork "THE AKSH EXPERIENCE" (owner-supplied, alt "The AKSH Experience"; see `docs/audit/ASSET_INVENTORY.md`) in place of a typed label; H2 "Your Wellness Journey, Simplified."; tagline; five steps (01 Book Your Consultation, 02 Personalised Consultation, 03 Your Wellness Docket, 04 Experience AKSH, 05 Continued Care & Support) with their descriptions; closing "Your journey. Your pace. Your wellbeing."; CTA "Begin Your Journey →". Verbatim in `src/content/experience.ts` | **Owner-supplied wording** (11 Oct 2026), published as supplied, including "24/7 support", "consultation reports" and the "take-home docket". Not independently verified (see Missing clinic inputs) |
| Homepage FAQ section (`#faq`, after Client Experiences; directly after The AKSH Experience in production) wording | H2 is the owner-supplied "FREQUENTLY ASKED QUESTIONS" lettering artwork (alt "Frequently Asked Questions"; see `docs/audit/ASSET_INVENTORY.md`) in place of the typed title; eyebrow "EVERYTHING YOU NEED TO KNOW". The supplied H2 "A Little Clarity, Before You Begin." and its italic introduction were removed at the owner's request (12 Oct 2026); six numbered questions (01 What services does AKSH offer? · 02 How do I know which treatment is right for me? · 03 How can I book an appointment at AKSH? · 04 Are AKSH treatments safe and non-surgical? · 05 Will I receive a personalised treatment plan? · 06 What happens after my treatment?) with their answers, bold runs kept ("Biohacking, Recovery, Body Contouring, and Advanced Skin Treatments"; "website enquiry form, WhatsApp, or a phone call"); support eyebrow "STILL HAVE QUESTIONS?", H3 "We're Here to Help.", italic support text; CTA "Book Your Consultation →" (opens the Book a Consultation development notice, like the header CTA). Verbatim in `src/content/faq.ts` | **Owner-supplied wording** (12 Oct 2026), published as supplied in every mode, including the booking channels, "convenient appointment slot", "relevant reports", the "wellness docket", safety/suitability wording and "dedicated support channels". Not independently verified; no contact details, links, availability or confirmation published (see Missing clinic inputs) |
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
| Homepage "Client Experiences" testimonials (`#client-experiences`, after The AKSH Experience) | Masthead artwork "CLIENT EXPERIENCES" (owner-supplied lettering, alt "Client Experiences"; see `docs/audit/ASSET_INVENTORY.md`) in place of a typed label; H2 "The Art of Feeling Good, Through Their Eyes." (two lines from tablet up); sample introduction "Personal journeys. A shared commitment to feeling your best." (the supplied disclosure notice was removed at the owner's request, 12 Oct 2026; the per-card badge remains the sample label); nine entries (Ananya S. … Rahul N.) with roles and quotes, verbatim in `src/content/testimonials.ts`, each with a visible "Sample" badge | Owner-supplied **fictional development samples** (12 Oct 2026); not feedback from real clients | **Labelled draft, development and preview only.** Omitted in production (APP_MODE read per request), as PRD §6/§140 and DECISIONS D-10 forbid fabricated testimonials. No ratings, counts, verified badges, review branding or portraits (initials only). The supplied "Real experiences." introduction is reserved for genuine feedback. To publish: replace every entry with real, consented, approved testimonials (with any portrait consent), then remove the sample badge and production gate |

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
| Consultation process steps (real workflow) | How It Works, Home | Generic request → contact → consultation (PRD §7.5). The owner's five-step journey is the homepage section `#experience` | Homepage wording is owner-supplied; How It Works page still needs approved steps |
| Booking channels and support operations named in The AKSH Experience (`#experience`) | Step 01 ("website, WhatsApp, or a simple phone call") and step 05 ("follow-ups and 24/7 support") | Wording shown as supplied; no phone number, WhatsApp link or support channel is published | **Unresolved.** Supply the phone number and WhatsApp channel (or remove them from the copy), and confirm the 24/7 support operation exists before launch |
| Booking channels, appointment handling and support channels named in the homepage FAQ (`#faq`) | Answer 03 ("website enquiry form, WhatsApp, or a phone call"; "help you find a convenient appointment slot"), answer 05 ("relevant reports", "wellness docket") and answer 06 ("dedicated support channels") | Wording shown as supplied; no phone number, WhatsApp link, enquiry-form destination, appointment availability or support channel is published, and the CTA opens the development notice | **Unresolved.** Same phone number and WhatsApp channel as The AKSH Experience (or remove them from the copy); the enquiry form destination (DECISIONS O-01); which support channels exist; clinical review of the answer 04 safety and suitability wording before launch |
| Doctor/practitioner names, credentials, registration, bios, portraits | About, Specialists, `/about/doctor` | Omit sections. Homepage consultant name, role wording, biography and portrait are owner-supplied (see Confirmed) | Optional (omit if absent). **Unresolved for the homepage consultant:** independent verification of qualifications and medical registration supporting the "Aesthetic Dermatologist" title and training statements; portrait usage rights |
| Clinic and treatment photography with usage rights | Hero, pillars, About, clinic experience | Labelled prototype imagery | **Blocks** hero/pillar imagery |
| Prices, durations, downtime, preparation, aftercare | Treatment detail fields | Omit fields | Optional |
| FAQ questions and reviewed answers (Visiting, Consultations, Service Areas) | FAQ, Home, category pages | Labelled draft. The homepage FAQ section uses the six owner-supplied questions (see Confirmed) | **Blocks** FAQ page; the homepage section is not blocked |
| Privacy policy, terms, booking policy, medical disclaimer | Policy pages, form consent link | Draft for owner review | **Blocks** |
| Contact-permission consent wording and version | Enquiry form (`consentVersion`) | Dev version string | **Blocks** |
| Marketing permission (yes/no) | Optional checkbox | Hidden | Needs decision |
| Patient reviews (real, consented, approved) | Homepage "Client Experiences" section (`#client-experiences`) | Fictional labelled samples in development/preview only; omitted in production (see Draft copy) | Optional (proposal). **Unresolved:** genuine consented testimonials, any client portraits with consent, and owner approval |
| Instagram account handle and display approach | Proposed "Life at AKSH" section | Hidden | Optional (proposal) |
| Journal articles (author, reviewer, dates) | Journal | Hidden collection | Optional |
| Social links | Footer, structured data | Omit | Optional |
| Analytics tool and consent policy | Measurement | Disabled | Optional |
| Logo master files and approval | Header, footer, favicon, OG image | Raster candidate | **Blocks** (see DECISIONS O-01) |
| Consultation destination and notification channel | Enquiry flow | Labelled demo adapter | **Blocks** |
| Domain and hosting | Canonical URLs, deployment | localhost | **Blocks** |
