# AKSH — Homepage Section Reconciliation

Two sources describe the homepage. Neither overrides the other until the owner decides (DECISIONS O-03).

- **Requirement:** PRD §7.1, ten sections in a fixed order (`docs/requirements/AKSH_PRD.md`).
- **Proposal:** `docs/reference/proposals/Screenshot 2026-10-08 165402.png`. This is a 15-row list of unknown origin and approval; rows 10 and 12 are shown in bold in the screenshot. It is transcribed below.

## Mapping

| # | Proposal heading (verbatim) | PRD §7.1 equivalent | Content dependency | Build status |
|---|---|---|---|---|
| — | *(header not listed)* | 1 Header | Logo, enabled routes | Required |
| 01 | Hero — Wellness, Reimagined | 2 Hero | Approved headline (O-03), licensed hero image | Required |
| 02 | Introduction — The AKSH Philosophy | 4 The AKSH approach / 7 clinic philosophy | Approved philosophy copy | Required; copy pending |
| 03 | Explore Our Treatments | 3 Four service pillars | Four pillar summaries | Required; all four visible without a carousel |
| 04 | Wellness Begins with Your Goals | *(none in §7.1)*; relates to P1 `/concerns` | Approved concern-to-service mapping | **Proposal.** Hidden until approved |
| 05 | Why Choose AKSH | *(none)* | Approved, verifiable differentiators only | **Proposal.** High risk of unsupported claims |
| 06 | Featured Treatments | 5 Featured offerings | Approved treatments/programs | Conditional; omit if none |
| 07 | Your Personalised Wellness Journey | 6 Consultation journey | Real process steps | Required. Review the word "Personalised": personalised treatment recommendations are out of scope (PRD §4) |
| 08 | Meet Our Specialists | 7 Clinic and practitioner | Verified practitioner details and real portraits | Conditional; omit without verified data |
| 09 | Inside AKSH — Clinic Experience | 7 Clinic and practitioner (environment) | Real clinic photography | Conditional |
| 10 | **Voices of AKSH — Patient Reviews** | *(none)*; PRD §6 disables testimonials unless approved | Real, consented, approved reviews with source | **Proposal.** Disabled by default; never fabricated. No ratings in structured data unless verified |
| 11 | The AKSH Journal | 8 Journal preview | Approved articles | Conditional (up to three) |
| 12 | **Life at AKSH — Instagram Feed** | *(none)* | Confirmed account, approved posts, embed method | **Proposal.** Avoid third-party embeds on initial load (TRD §12); requires CSP and consent review; no placeholder posts |
| 13 | Frequently Asked Questions | 9 FAQ | Four to six reviewed questions | Required; copy pending |
| 14 | Begin Your Wellness Journey — Book Consultation | 10 Final CTA and location | Confirmed location | Required |
| 15 | Footer | 10 footer | Real contact details, enabled routes | Required |

## Implementation guidance

- Build the PRD sections first (Milestone 3). Implement proposal-only sections (04, 05, 10, 12) as content-gated components that render nothing unless approved content exists. No empty shells are shown in production.
- Section headings in the proposal are draft copy, not approved wording.

## Current build order

Hero → About AKSH (`#about-aksh`) → Our Services (`#services`) → Meet Our Consultant (`#meet-our-consultant`) → The AKSH Experience (`#experience`) → Client Experiences (`#client-experiences`, fictional labelled samples in development/preview only; omitted in production; row 10 above) → FAQ (`#faq`, owner-supplied, every mode; directly after The AKSH Experience in production). The AKSH Experience is the owner-supplied version of row 07 (PRD §7.1 item 6); header "Our Experience" links to it, and the former `/experience` route redirects there (307).
