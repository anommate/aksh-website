# AKSH — Product Requirements Document

**Product:** AKSH wellness clinic website  
**Audience:** Claude Code, developer, designer, clinic owner  
**Version:** 1.1 — personalised implementation brief  
**Date:** 7 October 2026  
**Status:** Website scope, visual direction, brand palette, and manual enquiry flow confirmed; clinic facts and production integrations remain to be supplied.

## 1. Product summary

Build a premium, responsive website for **AKSH**, a wellness clinic offering **Biohacking, Recovery, Body Contouring, and Skin Treatments**. The website must help visitors understand these four service areas, learn about the clinic's approach, and request a consultation with minimal friction.

The experience should feel calm, modern, credible, and personal. Combine the precision of a clinical practice with the warmth of a premium wellness destination. Make the four offerings understandable before introducing individual treatments or technologies.

This PRD specifies a public website and consultation acquisition flow. Clinical records, patient dashboards, and clinic management software are outside this release.

### Source and decision precedence

1. The current brief confirms the AKSH name and four service areas.
2. The existing **Aksh_Website_Sitemap_Client_Review.pptx**, current version 3, proposes a doctor-led, single-location website with online booking and a Journal. Preserve this structure where appropriate, but do not treat a draft sitemap as proof of offered treatments or final client approval.
3. The owner confirmed a clinic website with consultation booking, warm luxury editorial design, and an enquiry form with manual appointment confirmation.
4. **AKSH_Brand_Palette_and_Fonts.docx**, supplied by the owner as the brand palette, is the authoritative visual reference. Use its main Deep Teal and Warm Sand palette. The implementation selects the document's first-choice fonts: Cormorant Garamond for headings, Manrope for body/UI, and Jost for an interim wordmark. Listed alternatives remain optional, not simultaneous font requirements.
5. The implementation stack and request destination remain proposed until confirmed; do not infer these from the owner's other projects.
6. If the repository or owner supplies a more specific approved requirement, use that requirement and record the change.

## 2. Outcomes and success measures

### Primary outcomes

- Visitors can identify all four service areas and choose a relevant path.
- Visitors can understand what to expect from a consultation before contacting AKSH.
- Visitors can submit a consultation request that reaches an approved clinic system.
- Staff can maintain service content, availability information, and contact details without editing page layouts.
- The site supports organic discovery and future marketing campaigns.

### Measures

| Measure | Definition | Release requirement |
|---|---|---|
| Consultation conversion | Successfully accepted requests / website sessions | Establish baseline after launch; do not invent a target conversion rate |
| Form completion | Accepted submissions / form starts | Track only when analytics consent permits |
| Lead delivery reliability | Accepted requests retained in the clinic destination | Every successful test submission must be retrievable |
| Service discovery | Visits from homepage into service category pages | Track as general page engagement without personal or health details |
| Contact intent | Call, WhatsApp, and directions clicks | Record click intent; do not label as completed consultations |
| Content readiness | Published clinic claims supported by approved content | 100% of live service, doctor, price, and device information approved |

## 3. Users and user stories

| User | Need | User story |
|---|---|---|
| Wellness explorer | Understand unfamiliar offerings | As a first-time visitor, I can understand biohacking in plain language and see how to discuss my goals with the clinic |
| Recovery visitor | Explore recovery support | I can browse recovery information and understand the consultation process without receiving an automated diagnosis |
| Body contouring visitor | Understand options and expectations | I can learn about the clinic's confirmed options and find suitability, process, and downtime information when approved |
| Skin visitor | Find a relevant treatment pathway | I can explore skin concerns and confirmed treatments, then request a consultation |
| Returning visitor | Contact the clinic quickly | I can find the phone number, directions, hours, and booking link within one interaction |
| Clinic content owner | Keep information accurate | I can update central content entries and publish reviewed information consistently across pages |

## 4. Scope and priorities

**P0:** required for the core release. **P1:** include when clinic content/integrations are ready. **P2:** future enhancement.

| Priority | Feature |
|---|---|
| P0 | Homepage, four service category pages, About, How It Works, FAQ, Contact, consultation request page, request receipt, policy pages, 404 |
| P0 | Shared navigation, mobile menu, service-aware CTAs, reusable treatment template, responsive design, accessibility, SEO metadata |
| P0 | Approved request destination, validation, reliable receipt behavior, spam protection, privacy-conscious event handling |
| P0 | Central structured content, draft/published status, image fallbacks, release validation |
| P1 | Individual treatment pages populated with confirmed services; doctor profile when credentials are supplied |
| P1 | Diagnostics and Programs pages from the draft sitemap, only when offerings are confirmed |
| P1 | Journal listing and article template; enable public navigation when approved articles exist |
| P1 | Consent-managed analytics, clinic-approved CMS integration, approved media and policies |
| P2 | Provider-backed live availability, confirmed slot booking, payments, multilingual content, CRM enhancements |

### Outside this release

Patient accounts, medical records, health report uploads, symptom assessments, AI diagnosis, personalised treatment recommendations, memberships, e-commerce, and multi-location scheduling. Do not build an admin dashboard unless separately requested. Do not collect detailed medical history through the marketing site.

## 5. Information architecture

### Routes

| Route | Purpose | Availability |
|---|---|---|
| `/` | Homepage | P0 |
| `/about` | Clinic philosophy, team introduction, environment | P0 |
| `/about/doctor` | Verified doctor profile | P1, approved credentials required |
| `/how-it-works` | Consultation journey | P0 |
| `/treatments` | Four-pillar service directory | P0 |
| `/treatments/biohacking` | Biohacking category | P0 |
| `/treatments/recovery` | Recovery category | P0 |
| `/treatments/body-contouring` | Body contouring category | P0 |
| `/treatments/skin` | Skin category | P0 |
| `/treatments/[pillar]/[slug]` | Individual confirmed treatment | P1; reusable template |
| `/diagnostics`, `/diagnostics/[slug]` | Confirmed assessments | P1; reusable detail template |
| `/programs`, `/programs/[slug]` | Confirmed multi-session programs | P1; reusable detail template |
| `/concerns` | Approved concern-to-service navigation | P1 |
| `/journal`, `/journal/[slug]` | Educational editorial content | P1; reusable article template |
| `/faq` | General and service FAQs | P0 |
| `/book` | Consultation request | P0 |
| `/book/confirmation` | Request receipt, not appointment confirmation | P0; noindex |
| `/contact` | Single clinic location and contact details | P0 |
| `/privacy`, `/terms`, `/booking-policy`, `/medical-disclaimer` | Owner-reviewed policies | P0 launch content |
| Unknown URL | Helpful 404 with home and service links | P0 |

Unpublished entries return 404 in production and never appear in the sitemap. Draft collections can be previewed in development, but must not appear as empty public directories.

### Navigation

- Brand mark links to Home.
- Retain the earlier full navigation when content exists: **About / Diagnostics / Programs / Treatments / Journal**, with **Book a Consultation** as the primary button.
- Initial content-limited navigation: **About / Treatments / How It Works / Contact**, plus the booking button. Enable Diagnostics, Programs, and Journal when ready; do not display dead or empty menu items.
- Treatments opens four clear category links. Provide keyboard and touch equivalents for hover interaction.
- Footer groups: Explore, Clinic, Visit, and Policies. Include only real contact details and enabled routes.
- Mobile uses a simple accessible drawer. Keep the booking action visible. A compact bottom booking bar may be used if it does not obscure content, form fields, or cookie controls.

## 6. Content and service rules

### Four confirmed pillars

| Pillar | Website role | Content boundary |
|---|---|---|
| Biohacking | Explain the clinic's wellness optimisation offering in understandable language | Describe only confirmed modalities; no claims of age reversal, guaranteed longevity, or disease prevention |
| Recovery | Introduce recovery-focused services and consultation pathways | Do not infer injury treatment, rehabilitation credentials, or guaranteed performance gains |
| Body Contouring | Explain available body-focused aesthetic options | Do not present contouring as guaranteed weight loss or invent device names, session counts, or results |
| Skin Treatments | Explain confirmed skin services and consultation process | Do not promise permanent results, universal suitability, or zero downtime |

These boundaries guide copywriting; they are not medical recommendations or statements about AKSH's clinical scope.

### Draft sitemap collections

The earlier sitemap lists assessments such as biological age testing, blood panels, body composition, and skin analysis, plus longevity, recovery/performance, and skin programs. Keep these as **draft candidates** until the clinic confirms availability. The current four-pillar brief takes priority over the earlier treatment grouping.

### Editorial requirements

- Use concise English and familiar words. Define biohacking rather than relying on technical language.
- Use **Body Contouring** consistently.
- Provide a clear route to consultation; do not imply a visitor can determine clinical suitability from the website.
- Never fabricate doctors, degrees, registration numbers, testimonials, affiliations, success rates, devices, prices, awards, or patient counts.
- Use only licensed imagery or clinic-supplied assets. Do not portray stock or generated people as AKSH staff or patients.
- Testimonials and before/after media remain disabled unless specifically supplied and approved for publication.
- Store content status and reviewer information. Service information needs an appropriate clinic reviewer before publication.
- Preview placeholders must be labelled as draft. Production must omit unavailable sections or fail the content readiness check.

## 7. Page requirements

### 7.1 Homepage

Build a purposeful page with these sections, in this order:

1. **Header:** brand, navigation, primary consultation CTA.
2. **Hero:** clear headline, one short explanation, primary CTA, secondary service exploration link, and one premium visual. Draft direction: “A considered approach to your wellbeing.” Supporting draft: “Explore biohacking, recovery, body contouring and skin treatments at AKSH.” Avoid unsupported outcomes.
3. **Four service pillars:** four distinct cards with a short explanation and category link. All four must remain visible or reachable without a carousel.
4. **The AKSH approach:** assessment, individual discussion, appropriate plan, and follow-up. Publish specific process steps only when confirmed.
5. **Featured offerings:** approved treatments/programs only. Omit this section if none exist.
6. **Consultation journey:** three or four simple steps explaining how to get started.
7. **Clinic and practitioner:** real environment and approved doctor details. If no doctor details are available, use the clinic philosophy without invented profiles.
8. **Journal preview:** up to three approved articles; conditional.
9. **FAQ:** four to six reviewed questions about visiting, consultations, and service selection.
10. **Final CTA and location:** invitation to request a consultation, confirmed location, and footer.

Keep the first screen focused on the clinic and service proposition. Essential text and actions must be readable even if media or animation fails.

### 7.2 Treatments directory and category pages

The directory introduces the four pillars and routes visitors into the relevant category. Category pages include:

- Breadcrumbs, clear H1, category introduction, relevant image.
- Concerns/goals associated with the category, only when approved.
- Confirmed treatment cards with concise descriptions and detail links.
- Consultation/process information and category-specific reviewed FAQs.
- Primary CTA with the category preselected in the request form.
- Related categories or articles where useful.

Category navigation and treatment filters must operate with keyboard input, show active state, and provide a meaningful empty state. Do not add treatment search for a very small catalogue.

### 7.3 Treatment detail template

Support: title, category, plain-language overview, what a consultation discusses, approved suitability information, session/process description, reviewed duration/downtime fields if supplied, preparation/aftercare if supplied, FAQs, related services, reviewer and review date, and consultation CTA.

Omit empty optional fields. Prices, timeframes, benefit claims, contraindications, and aftercare instructions must come from reviewed content rather than code-generated defaults.

### 7.4 Diagnostics and Programs templates

Diagnostics explain what the confirmed assessment involves, how to prepare when reviewed instructions exist, and how results are discussed. Programs explain their confirmed components, intended audience, consultation process, and follow-up. Do not display diagnostic interpretations, program outcomes, or session quantities without approval.

### 7.5 About and How It Works

About explains AKSH's philosophy, clinic environment, and verified team. How It Works explains request → clinic contact → consultation → agreed next steps. Extend to assessment, treatment, and follow-up only when these reflect the clinic's real workflow.

### 7.6 Journal

Provide category navigation, article cards, pagination for larger collections, and a reusable article layout with author, reviewer where relevant, publication date, update date, headings, readable body text, optional references, related articles, and consultation CTA. No auto-generated medical guidance is published without review.

### 7.7 FAQ and Contact

FAQ groups questions into Visiting, Consultations, and Service Areas. Contact provides verified address, hours, phone, WhatsApp if used, and directions. A map should load on demand or be a light external directions link. Contact links must not contain invented numbers or coordinates.

## 8. Consultation flow

### Default: appointment request

The owner selected an **enquiry form with manual appointment confirmation**. Implement this as the release booking flow; do not introduce live slots or online payment. The CTA can say “Book a Consultation”; the page must clearly explain: “Submit a consultation request. The clinic will contact you to confirm availability.”

The success page must say **“Your consultation request has been received.”** It must not say an appointment is confirmed or promise a response time that the clinic has not supplied.

### Form fields

| Field | Requirement |
|---|---|
| Name | Required; trim; allow ordinary international names; maximum 100 characters |
| Phone | Required; country selector; validate with a phone parsing library; avoid India-only hardcoding |
| Email | Optional; validate only if entered |
| Service interest | Required; four pillars plus “Not sure yet” |
| Specific treatment | Optional; prefilled only from an approved treatment link; editable |
| Preferred date | Optional preference, not a reserved slot; no past dates in the configured clinic timezone |
| Preferred time period | Optional; Morning / Afternoon / No preference; not live availability |
| Contact permission | Required, unchecked; authorises responding to this request; link to privacy policy |
| Marketing permission | Optional, separate, unchecked; omit if marketing follow-up is not planned |

Do not ask for symptoms, diagnoses, medication, photographs, health reports, or unrestricted medical notes. Any clinical intake belongs in the clinic's approved care system.

### Interaction states

Idle → validating → submitting → accepted receipt OR actionable failure. Disable duplicate clicks while submitting. Keep entered values on recoverable errors. Announce errors accessibly and focus the first invalid field. Show success only after durable acceptance by the approved destination.

### Server contract

Suggested internal endpoint: `POST /api/consultation-requests`.

- Validate and normalise inputs on the server independently of browser validation.
- Allowlist service/treatment identifiers; reject unknown or unpublished values.
- Store permission text/version and timestamp with the request in the approved destination.
- Use an idempotency key for retries; duplicate submissions return the original receipt.
- Return `201` with an opaque receipt ID only after durable acceptance. Return `200` for a previously accepted idempotent retry.
- Return `400` for malformed input, `422` for field errors, `429` for rate limits, and `503` for destination unavailability. Never send personal details back in error text.
- An uncertain provider timeout must be resolved by looking up the same idempotency key or retrying safely, not by creating another request.
- Notification failure after durable storage must not cause a second request. Record the notification failure in the destination and retry through its supported mechanism.
- No personal information in query strings, browser storage, analytics, application logs, or error monitoring. Keep form values in memory only.
- Confirmation URLs contain no personal data. The receipt page should not expose contact details and must not be indexed.

### Integration decision

Reuse an existing approved clinic booking/CRM system if one exists. Otherwise connect a clinic-approved destination capable of retaining requests and supporting the contract above. Isolate it behind a `ConsultationRequestAdapter`; do not silently introduce a new database or select a paid provider.

In local development, a clearly labelled demo adapter may exercise form states. It must state that requests are simulated. Production must never use simulated acceptance. If no real destination is configured, show a clear unavailable state with verified call/contact options; mark consultation integration as a launch blocker.

For P2 live scheduling, obtain availability from the provider and reserve slots atomically. Display a confirmed appointment only after provider confirmation. Slot selection, timezone conversion, cancellation rules, and payment behavior require their own approved integration specification.

## 9. Visual design and interaction

### Confirmed direction and brand reference

Premium editorial wellness: warm ivory backgrounds, deep teal sections, quiet typography, generous spacing, authentic clinic photography with warm light, and restrained movement. The owner chose warm luxury with earthy colours and editorial design. Build that direction consistently across biohacking, recovery, body contouring, and skin pages.

Use these exact colours from **AKSH_Brand_Palette_and_Fonts.docx**. Do not substitute the document's optional cool-white/copper alternative:

| Token | Proposed value | Use |
|---|---|---|
| Primary / Deep Teal | `#123C3F` | Navigation, footer, hero sections, strong anchors |
| Canvas / Warm Ivory | `#F5EFE6` | Main backgrounds; text on deep teal |
| Accent / Champagne Gold | `#B8975F` | Primary CTA backgrounds and fine decorative details |
| Support / Sage Mist | `#A8B8A6` | Selected cards, section backgrounds, decorative elements |
| Warm highlight / Soft Clay | `#C98B72` | Small warm highlights and restrained hover accents |
| Text / Charcoal | `#1F2523` | Body text, headings on light surfaces, gold button labels |

- Follow the brand document's approximate visual balance: 60% ivory, 25% deep teal, 10% sage, and 5% gold/clay combined. Treat this as art direction, not a rigid pixel quota. Use deep teal for navigation/footer and selected hero sections while preserving the predominantly warm light experience.
- Primary CTA: Champagne Gold background with Charcoal label. On ivory, add a Deep Teal outline where necessary for control boundary contrast. Secondary CTA: Deep Teal text/outline on ivory, or ivory text/outline on teal. Avoid low-contrast gold body text, ivory labels on gold, and teal small text on gold.
- Calculated solid-colour contrast ratios: ivory/teal 10.54:1, charcoal/ivory 13.64:1, and charcoal/gold 5.66:1. Gold/ivory is only 2.41:1; teal/gold is 4.38:1. Check rendered gradients, opacity, focus rings, disabled states, and images independently; these ratios only describe the exact opaque colours.
- Heading font: **Cormorant Garamond**, using a restrained selection of weights and a scale that keeps its fine strokes legible. Body and UI: **Manrope**. Interim logo wordmark: **Jost**, uppercase with measured tracking. Use the supplied logo asset when available instead of recreating it from typography.
- Fraunces, DM Sans, Montserrat, and the Poppins/Inter pairing are alternatives in the source document; do not load all of them or change the first-choice pairing without direction.
- Obtain font files from an authorised source, retain their licence notices, and self-host where practical. Load only the weights and subsets needed; provide sensible serif/sans fallbacks.
- Body text starts at 16px with comfortable line height. Scale headings responsively without clipping or awkward single-word wraps.
- Use a bounded desktop content width around 1200–1280px; approximately 20px mobile gutters and generous desktop gutters.
- Buttons and key form controls should aim for at least 44px height as a product usability target.
- Use subtle radii, thin borders, and restrained shadows. Avoid excessive pill cards, glowing effects, and decorative statistics.
- Real clinic images take priority. Placeholder assets should use consistent aspect ratios and be easy to replace.
- If a brand logo is missing, use a simple editable AKSH wordmark in the prototype; do not present it as an approved identity.

### Motion

Use brief fades or small vertical reveals, restrained hover feedback, and subtle image transitions. Do not delay reading until animation completes. Do not hijack scrolling, trap users in pinned sections, or require video downloads to understand the hero. Respect reduced-motion preferences and replace optional motion with a static state.

### Responsive behavior

Verify at 360, 390, 768, 1024, and 1440px widths. Stack hero and forms on small screens. Preserve the service order and clear CTAs. No horizontal overflow, clipped labels, hover-only access, or sticky elements covering focused controls.

## 10. Implementation architecture

### Repository-first rule

Before scaffolding, inspect existing files, `AGENTS.md`, package manager, framework, CMS, and build scripts. Preserve a suitable existing stack. Do not overwrite unrelated work or replace the framework merely to match this recommendation.

### New-project default

- Next.js App Router with TypeScript.
- Server-render content pages; use client components only for menus, filters, forms, and necessary interactive states.
- Use the existing styling approach if present; otherwise use Tailwind CSS with central design tokens.
- Prefer native HTML and CSS behavior over unnecessary dependencies. Use a motion library only if justified.
- Use structured TypeScript/JSON content for clinic and service data; MDX or an equivalent reviewed editorial format for Journal content.
- Follow the chosen framework's supported stable version and dependency compatibility; lock dependencies. Do not upgrade an existing project without cause.

The static content default provides a maintainable developer-managed first release. If staff require browser-based editing, connect the approved CMS before launch. Do not build an imitation CMS or assume WordPress, Supabase, Firebase, or a new external database is already authorised for AKSH.

### Suggested structure

```text
app/                  Routes, layouts, metadata, API handlers
components/ui/        Buttons, inputs, dialogs, typography
components/layout/    Header, footer, mobile navigation
components/sections/  Hero, pillar grid, process, FAQs, contact CTA
components/templates/ Treatment, diagnostic, program, article
content/              Clinic settings and reviewed content entries
lib/content/          Content queries, schemas, publication guards
lib/booking/          Validation and consultation destination adapter
lib/analytics/        Consent-gated event interface
public/               Licensed images, fonts, brand assets
tests/                Focused integration and end-to-end checks
```

Reuse one template per content type. Never duplicate entire pages for each treatment.

### Content models

| Model | Essential fields |
|---|---|
| ClinicSettings | Name, logo, site URL, verified phone/email/WhatsApp, address, timezone, hours, directions link, social links, booking mode |
| ServicePillar | ID, slug, name, summary, reviewed introduction, image, related treatment IDs, FAQs, status, SEO fields |
| Treatment | ID, pillar ID, slug, name, overview, optional reviewed process/suitability/duration/downtime/price, FAQs, media, reviewer, review date, status, SEO fields |
| Diagnostic | ID, slug, name, reviewed purpose/process/preparation, related programs, FAQs, status, SEO fields |
| Program | ID, slug, name, reviewed overview/components/process, related treatment IDs, FAQs, status, SEO fields |
| Doctor | Name, verified qualifications/registration, approved bio, real portrait, publication status |
| JournalArticle | Slug, title, excerpt, category, body, author, reviewer when relevant, dates, image, references, status, SEO fields |
| Policy | Slug, title, approved body, version, effective date, approval status |

Request records belong in the approved destination and contain only the validated contact/preference fields, receipt ID, idempotency key, status, permission records, timestamp, and sanitised attribution where approved. Public content APIs must never expose requests.

## 11. SEO, analytics, and quality requirements

### SEO

- Unique title, description, canonical URL, Open Graph information, and one meaningful H1 on each indexable page.
- Render essential content without requiring client JavaScript.
- Sitemap contains only public, published, canonical URLs. Robots configuration excludes private/preview environments appropriately.
- Draft pages, request receipts, and preview environments use noindex; private data is protected by access controls, not robots rules.
- Use verified clinic information for appropriate structured data. Do not invent ratings or put draft credentials into schema.
- Include breadcrumbs and useful internal links. Use image alt text appropriate to the image; decorative images have empty alt text.
- Include city/local keywords only once the clinic location is confirmed; do not assume Nagpur from other projects.
- Return real 404 responses for nonexistent content. Redirect only intentionally changed URLs.

### Analytics

Provide an optional consent-gated analytics interface; do not enable tracking without configuration. Suggested events: `consultation_cta_click`, `consultation_form_start`, `consultation_request_success`, `consultation_request_error`, `phone_click`, `whatsapp_click`, and `directions_click`.

Use allowlisted general properties such as CTA position and error category. Never send names, phone numbers, emails, request IDs, form values, selected treatments/concerns, or health information. Do not load advertising pixels on the request form or receipt page. Review permitted page-path tracking before enabling analytics on health-related content.

### Accessibility

Target WCAG 2.2 AA. Use semantic landmarks, skip navigation, logical headings, visible focus, accessible names, sufficient text/control contrast, keyboard-operated menus/accordions, labelled fields, screen-reader error announcements, and correct modal focus behavior. The 44px control target above is a chosen product target, not a claim that every WCAG AA control requires that size. Automated checks must be supplemented by keyboard and form-state review.

### Performance budgets

These are project targets to validate, not guarantees:

- Mobile production Lighthouse scores of 90+ for Performance, Accessibility, Best Practices, and SEO on representative public pages. Record test device/profile and repeat obvious outliers.
- Target LCP ≤2.5s, INP ≤200ms, and CLS ≤0.1 for real-user monitoring when sufficient data exists. Prelaunch lab checks cannot prove field performance.
- Optimise images, include intrinsic dimensions, use responsive sources, lazy-load below-fold media, and avoid heavy embeds on initial load.
- Preload only genuinely critical assets. Avoid loading motion libraries or trackers across every route unnecessarily.

### Security and operational behavior

- Secrets remain server-side and never enter the browser bundle or committed files.
- Rate-limit requests using a production-capable shared mechanism or the destination provider; an in-memory counter alone is insufficient across instances.
- Use input length limits, origin checks, bot protection, and appropriate CSRF controls for the chosen architecture.
- Sanitise CMS/editorial HTML and links. Escape untrusted values.
- Set appropriate security headers compatible with required assets/integrations.
- Keep contact data out of logs and monitoring. Use operational error codes for diagnosis.
- Document where requests are retained, staff access, deletion process, and the owner-approved retention period. Do not invent a legal retention requirement or claim automatic regulatory compliance.

## 12. Acceptance criteria

| ID | Requirement | Acceptance check |
|---|---|---|
| AC-01 | Four clear pillars | Homepage and directory show all four exact category names with working routes |
| AC-02 | Accurate content | No unapproved individual treatment, price, staff identity, or outcome claim is publicly visible |
| AC-03 | Reusable content | Adding one approved treatment entry creates its card and detail page without duplicating template code |
| AC-04 | Functional navigation | Desktop/mobile menus work with mouse, touch, keyboard, and Escape where appropriate |
| AC-05 | Context-aware CTA | Category/treatment links preselect valid form interest; visitors can change it |
| AC-06 | Form validation | Invalid fields block submission; server rejects invalid data independently; errors are accessible |
| AC-07 | Reliable receipt | A valid request reaches the configured destination before the receipt appears |
| AC-08 | Honest failure | Provider failure/unconfigured production integration never displays simulated success; inputs survive recoverable errors |
| AC-09 | Duplicate protection | Double-clicks and retries with the same idempotency key create one retained request |
| AC-10 | Request terminology | Date/time preferences are not labelled as confirmed appointments or available slots |
| AC-11 | Data minimisation | No contact or health-related form data appears in URLs, analytics, logs, browser storage, or public APIs |
| AC-12 | Contact accuracy | Call, WhatsApp, and directions links use verified owner-supplied details |
| AC-13 | Publication guards | Draft/unpublished content is absent from navigation and sitemap and returns 404 in production |
| AC-14 | SEO correctness | Public pages have unique metadata and canonical URLs; receipts/previews are noindex |
| AC-15 | Responsive design | Target widths have no overflow, clipped labels, obstructed fields, or broken layouts |
| AC-16 | Accessibility | Keyboard flow, focus behavior, labels, contrast, error announcements, and reduced motion pass review |
| AC-17 | Quality gates | Type checking, linting, production build, focused integration tests, and browser checks pass |
| AC-18 | Launch readiness | Approved content/policies/assets and a real request destination are configured; unresolved blockers are documented |

## 13. Verification plan

- Run the repository's required type checks, linting, and production build.
- Test successful submission, invalid input, rate limiting, destination outage, uncertain timeout, and idempotent retry. Confirm a real test request is retained and staff can retrieve it in the approved destination.
- Test navigation → category → approved detail → request, including prefilled and edited service interest.
- Verify draft routes, sitemap exclusion, metadata, noindex receipts, and 404 behavior.
- Manually review representative pages and form states at the specified widths, with keyboard navigation and reduced motion.
- Inspect browser requests and monitoring output to confirm personal data is absent from tracking and logs.
- Use a clearly isolated test destination and synthetic contact data for testing; do not create fake patient records in a live clinical system.

## 14. Delivery phases and launch inputs

### Phase 1 — Foundation

Inspect the repository. Establish the supplied brand tokens and selected fonts, content models, publication guards, header/footer, and all P0 routes. Populate only confirmed brand/category information. Deliver a coherent runnable preview.

### Phase 2 — Service experience

Finish homepage and four category pages, reusable detail templates, About, process, FAQs, and Contact. Prepare conditional Diagnostics, Programs, and Journal collections without falsely publishing them.

### Phase 3 — Consultation integration

Implement request validation and adapters, connect the approved destination, handle real success/failure/idempotency, and verify staff retrieval. If credentials are unavailable, complete the labelled local demo and list the integration as unresolved.

### Phase 4 — Release readiness

Replace draft assets/copy, publish approved content, configure metadata/contact details/policies, and complete quality checks. Provide deployment instructions and the concrete remaining blockers. Do not claim production readiness while critical inputs remain missing.

### Required owner inputs

| Input | Why needed | Safe development default |
|---|---|---|
| Logo asset | Final visual identity; colours already supplied | Editable AKSH wordmark in Jost using approved palette |
| Clinic address, timezone, hours, contact details | Contact and scheduling preferences | Labelled preview placeholders; no fake live links |
| Confirmed service/treatment catalogue | Accurate public pages | Four confirmed pillars; all individual examples draft |
| Doctor/team details | Verified practitioner profiles | Omit profile/credentials sections |
| Photography and asset rights | Authentic brand presentation | Clearly labelled prototype imagery |
| Enquiry storage destination, notification channel, and credentials | Manual-confirmation workflow and reliable lead delivery | Labelled development demo; launch blocked |
| CMS/editor workflow | Ongoing editing | Structured repository content |
| Price/duration/downtime information | Optional service detail fields | Omit fields |
| Policy copy and consent wording | Public notices and data handling | Draft for owner review; launch blocked until approved |
| Analytics configuration and permitted tracking | Measurement | Analytics disabled |

Continue all development that does not depend on missing inputs. Ask only focused questions when a decision blocks the next concrete step.

## 15. Claude Code handoff prompt

Copy this prompt into Claude Code alongside this PRD:

```text
Implement the AKSH wellness clinic website from AKSH_PRD.md.

First inspect the repository, AGENTS.md, framework, package manager, existing
content, and integrations. Preserve a suitable existing stack and unrelated
work. If this is a new project, follow the PRD's new-project defaults.

Build a premium, responsive website around four exact service pillars:
Biohacking, Recovery, Body Contouring, and Skin Treatments. Follow the PRD's
route structure, supplied brand tokens, reusable templates, publication
guards, accessibility requirements, and acceptance criteria. Use Deep Teal
#123C3F, Warm Ivory #F5EFE6, Champagne Gold #B8975F, Sage Mist #A8B8A6,
Soft Clay #C98B72, and Charcoal #1F2523. Use Cormorant Garamond headings
and Manrope body/UI text. Follow a warm luxury editorial direction.

Treat missing clinic facts as missing. Do not invent doctors, treatments,
prices, devices, credentials, testimonials, results, or contact details.
Keep draft placeholders visible only in a clearly labelled preview.

The owner selected an enquiry form with manual clinic confirmation. Implement
consultation requests with server-side validation and an isolated destination
adapter. Do not add live availability or payment to this release.
A production success receipt requires durable acceptance
by a real approved destination. Never simulate a confirmed appointment. Keep
personal data out of URLs, browser storage, logs, and analytics.

Work through the delivery phases. Complete all work that can proceed without
missing credentials or clinic content. Do not stop after planning. Ask focused
questions only for actual blockers, and document unresolved launch inputs.

Run appropriate type checks, linting, build, integration tests, and browser
checks. Deliver working code, setup instructions, content editing guidance,
environment variable names without secrets, test results, and a list of
remaining launch blockers. Do not deploy until instructed.
```

## 16. Developer reference material

Framework and accessibility references supporting the implementation approach:

- [Next.js App Router](https://nextjs.org/docs/app)
- [Next.js Server and Client Components](https://nextjs.org/docs/app/getting-started/server-and-client-components)
- [Next.js metadata and Open Graph images](https://nextjs.org/docs/app/getting-started/metadata-and-og-images)
- [WCAG 2.2](https://www.w3.org/TR/WCAG22/)
- [W3C understanding minimum target size](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum)

Clinic policies, medical copy, and regulatory decisions require owner-provided or appropriately reviewed material; this document does not establish clinical efficacy or legal compliance.
