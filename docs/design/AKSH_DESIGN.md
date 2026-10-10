# AKSH — UI/UX Design System Specification

> A numerical design reference for typography, spacing, grids, surfaces, controls, and interaction states. Use the attached DESIGN.md as the document structure and spacing reference; use AKSH_Wellness_Brand_Moodboard(2).png as the authoritative brand source.

**Version:** 2.0 · **Date:** 8 October 2026 · **Theme:** light with defined charcoal sections.

This is a specification, not a page design, mockup, wireframe, or generated image. All dimensions are CSS pixels unless stated otherwise. Values below are proposed implementation tokens, not measurements extracted from the moodboard. Font families, brand colours, and brand character come from the supplied image.

**Precedence:** The latest moodboard replaces the earlier teal/ivory/gold visual palette for this handoff. This file supersedes the visual tokens and component dimensions in the earlier AKSH UI/UX document and the visual sections of the PRD/technical requirements. Their functional requirements continue to apply, including enquiries with manual clinic confirmation. The attached Apple DESIGN.md is a structural reference; its branding, device content, fonts, and blue controls are not AKSH requirements.

AKSH's interface is calm and editorial: an ivory canvas, black typography and controls, charcoal contrast areas, warm stone and quiet sage supporting surfaces, and signal red used sparingly. Cormorant Garamond provides display character; Manrope provides precise readable UI. Use space and proportion as the main means of hierarchy. Preserve the supplied master logo as artwork.

## Tokens — Colors

### Authoritative palette from the moodboard

| Name | Value | Token | Role |
|---|---|---|---|
| Logo Black | `#000000` | `--color-logo-black` | Supplied logo, display headings, primary controls, icons |
| Brand Ivory | `#F9F8F4` | `--color-brand-ivory` | Main canvas, light surfaces, text on black/charcoal |
| Signal Red | `#FF0000` | `--color-signal-red` | Small signal dots, short rules, restrained markers and approved logo detail |
| Warm Stone | `#E4DED3` | `--color-warm-stone` | Alternate surfaces, decorative separators, quiet panels |
| Quiet Sage | `#A7B0A1` | `--color-quiet-sage` | Limited supporting surfaces and approved decorative accents |
| Soft Charcoal | `#282826` | `--color-soft-charcoal` | Dark sections/footer, body text, primary hover state |

### Derived functional neutrals

These two tones are implementation additions for legible secondary text and interactive boundaries; they are not new colours sampled from the moodboard.

| Name | Value | Token | Role |
|---|---|---|---|
| Muted Text | `#645F57` | `--color-muted-text` | Secondary text on ivory and stone; never use opacity to mute essential copy |
| Control Outline | `#7C776E` | `--color-control-outline` | Input outlines on ivory; functional boundaries needing stronger contrast than stone |

### Semantic colour mapping

- Background/surface: ivory; alternate surface: stone; inverse surface: charcoal.
- Heading: black; body: charcoal; secondary text: muted; inverse text: ivory.
- Primary button: black fill / ivory label. Hover: charcoal fill / ivory label.
- Secondary button: transparent / charcoal label / charcoal outline. Inverse secondary: transparent / ivory label / ivory outline.
- Text links: black or charcoal, visibly underlined where mixed with body copy.
- Error: readable charcoal text with a red icon/border and explicit error wording. Do not use small red text on ivory as the only message.
- Success: charcoal text, optional sage surface, and explicit status wording.
- Disabled control: stone fill / muted label; keep the disabled state visibly different and programmatically expressed.
- Red is not the default primary-button background, link colour, or large section fill. It is a restrained signal.

### Contrast rules

| Pair | Calculated contrast | Allowed use |
|---|---|---|
| Black / ivory | 19.76:1 | Headings, controls, text |
| Charcoal / ivory | 13.90:1 | Body text, inverse content |
| Muted / ivory | 5.96:1 | Secondary normal-size text |
| Control outline / ivory | 4.19:1 | Interactive boundaries; not the secondary body-text colour |
| Charcoal / stone | 11.03:1 | Alternate-surface text |
| Charcoal / sage | 6.59:1 | Supporting-surface text |
| Red / ivory | 3.76:1 | Non-text signals with another cue; avoid normal-size text |
| Black / red | 5.25:1 | If an exceptional red control is explicitly approved, use black text |

Ratios apply to opaque supplied sRGB values. Recheck text, borders, alpha backgrounds, image overlays, hover states, and actual composited surfaces. A decorative stone hairline is not an accessible input boundary. Do not infer accessibility from brand colour names.

## Tokens — Typography

### Cormorant Garamond · `--font-display`

- **Role:** hero/display statements, H1–H4, editorial feature headings, short quotations.
- **Weights:** 500 Medium and 600 Semibold. Default headings 600; editorial quotations 500.
- **Sizes:** 22, 24, 28, 32, 36, 40, 44, 48, 56, 64, 80px according to role and breakpoint.
- **Line height:** explicit role values in the table below; do not use a universal `line-height: 1`.
- **Tracking:** large headings `-0.01em` on desktop/tablet, `0em` on mobile. Small serif headings `0em`.
- **Fallback:** Georgia, Times New Roman, serif. Fallbacks are loading fallbacks, not a substitute design direction.
- **Restrictions:** no condensed stretch, artificial italic, synthetic bold, automatic uppercase paragraphs, or copied SF Pro tracking. Keep serif strokes legible.

### Manrope · `--font-body` / `--font-ui`

- **Role:** body, navigation, labels, inputs, buttons, helper text, metadata, tables, messages.
- **Weights:** 400 Regular for body; 500 Medium for navigation; 600 Semibold for buttons/labels; 700 Bold only for short emphasis or important labels.
- **Sizes:** 12, 14, 16, 18, 20px. Editable inputs never below 16px.
- **Tracking:** `0em` for body and controls; `0.08em` for short uppercase eyebrow labels only.
- **Fallback:** Arial, system-ui, sans-serif.
- **Numbers:** use tabular figures for numeric comparisons, aligned prices if approved, and date/time tables; retain ordinary figures in prose.
- **Restrictions:** do not import SF Pro, Inter, Poppins, or Jost as another UI family. The moodboard preserves existing logo lettering; do not reconstruct the master logo using a font.

### Type Scale

Size/leading cells are exact `font-size / line-height` values. Breakpoints are defined under Layout.

| Role | Family | Weight | Desktop | Tablet | Mobile | Tracking | Token |
|---|---|---|---|---|---|---|---|
| Hero display / H1 | Cormorant Garamond | 600 | 80 / 88px | 64 / 72px | 44 / 52px | -0.01em; mobile 0 | `--text-hero-display` |
| Page H1, internal pages | Cormorant Garamond | 600 | 64 / 72px | 56 / 64px | 40 / 48px | -0.01em; mobile 0 | `--text-page-title` |
| Section H2 | Cormorant Garamond | 600 | 56 / 64px | 44 / 52px | 36 / 44px | -0.01em; mobile 0 | `--text-section-heading` |
| Feature H3 | Cormorant Garamond | 600 | 40 / 48px | 36 / 44px | 28 / 36px | 0 | `--text-feature-heading` |
| Card H3 / small H4 | Cormorant Garamond | 600 | 28 / 36px | 28 / 36px | 24 / 32px | 0 | `--text-card-heading` |
| Editorial quote | Cormorant Garamond | 500 | 32 / 44px | 28 / 40px | 24 / 36px | 0 | `--text-quote` |
| Lead / intro | Manrope | 400 | 20 / 32px | 18 / 30px | 18 / 30px | 0 | `--text-lead` |
| Body | Manrope | 400 | 18 / 30px | 18 / 30px | 16 / 28px | 0 | `--text-body` |
| Body small / helper | Manrope | 400 | 14 / 22px | 14 / 22px | 14 / 22px | 0 | `--text-body-small` |
| Navigation | Manrope | 500 | 14 / 20px | 14 / 20px | 16 / 24px | 0 | `--text-nav` |
| Button | Manrope | 600 | 14 / 20px | 14 / 20px | 16 / 24px | 0 | `--text-button` |
| Field label | Manrope | 600 | 14 / 20px | 14 / 20px | 14 / 20px | 0 | `--text-label` |
| Input / select value | Manrope | 400 | 16 / 24px | 16 / 24px | 16 / 24px | 0 | `--text-input` |
| Eyebrow / short caption | Manrope | 600 | 12 / 18px | 12 / 18px | 12 / 18px | 0.08em if uppercase | `--text-eyebrow` |
| Footer / policy link | Manrope | 400 | 14 / 22px | 14 / 22px | 14 / 22px | 0 | `--text-footer` |

Use one meaningful H1 per page; headings preserve logical hierarchy regardless of visual size. Do not choose heading tags purely for appearance. Hero H1 max-width 12ch; internal titles 16ch; section headings 20ch; lead copy 48ch; narrative body 65ch. These are maximum line lengths, not fixed widths or forced line breaks. Allow long names and translations to wrap.

Self-host authorised font files or use the application's supported font loader. Load only required weights, use `font-display: swap`, and define sensible fallbacks. Do not fetch remote font stylesheets at runtime. Do not claim the logo font is Cormorant Garamond; its lettering remains supplied artwork.

### Typography spacing

| Relationship | Desktop | Tablet | Mobile |
|---|---|---|---|
| Eyebrow → heading | 12px | 12px | 8px |
| Hero/page title → lead | 24px | 24px | 20px |
| Section heading → introduction | 20px | 20px | 16px |
| Section introduction → content grid | 40px | 32px | 28px |
| Card heading → description | 12px | 12px | 12px |
| Paragraph → next paragraph | 20px | 20px | 16px |
| Body → action row | 28px | 24px | 24px |
| Article H2: previous text → heading | 48px | 40px | 32px |
| Article H2 → first paragraph | 16px | 16px | 12px |
| Article list item → next item | 8px | 8px | 8px |
| Caption → associated media edge | 12px | 12px | 8px |

Reset browser heading/paragraph margins before applying these gaps. Use parent `gap` or a single block margin; do not apply both to the same relationship.

## Tokens — Spacing & Shapes

**Base unit:** 4px. **Density:** comfortable. The reference's 90px section gap is a deliberate exception to the base scale.

### Spacing Scale

| Name | Value | Token |
|---|---|---|
| Micro | 4px | `--spacing-4` |
| Compact | 8px | `--spacing-8` |
| Small | 12px | `--spacing-12` |
| Standard | 16px | `--spacing-16` |
| Related elements | 20px | `--spacing-20` |
| Comfortable | 24px | `--spacing-24` |
| Card/reference inset | 28px | `--spacing-28` |
| Group separation | 32px | `--spacing-32` |
| Content introduction | 40px | `--spacing-40` |
| Large separation | 48px | `--spacing-48` |
| Control base | 52px | `--spacing-52` |
| Mobile chapter gap | 56px | `--spacing-56` |
| Large inset | 64px | `--spacing-64` |
| Tablet chapter gap | 72px | `--spacing-72` |
| Extended | 80px | `--spacing-80` |
| Reference chapter gap | 90px | `--spacing-90` |
| Major breathing space | 96px | `--spacing-96` |
| Maximum intentional gap | 128px | `--spacing-128` |

### Border Radius

| Element | Desktop / tablet | Mobile | Token |
|---|---|---|---|
| Feature/media card | 28px | 20px | `--radius-card` |
| Contained image | 28px | 20px | `--radius-image` |
| Compact utility panel | 16px | 12px | `--radius-panel` |
| Inputs/selects | 12px | 12px | `--radius-input` |
| Filled/outlined buttons | 9999px | 9999px | `--radius-button` |
| Text-link focus boundary | 4px | 4px | `--radius-link` |
| Filter chips | 9999px | 9999px | `--radius-chip` |
| Checkbox | 4px | 4px | `--radius-checkbox` |
| Radio / signal dot | 50% | 50% | `--radius-circle` |
| Full-width navigation/footer | 0px | 0px | `--radius-navigation` |
| Dropdown / dialog | 16px | 12px | `--radius-overlay` |
| Status text / decorative rule | 0px | 0px | `--radius-status` |

The supplied reference's 28px media corners and pill buttons are retained. Its 980px search-field radius is not applied to consultation fields. Soft arch framing is an optional imagery treatment from the moodboard, not a default radius for every card.

### Borders and shadows

- Decorative divider: 1px stone on ivory; do not use it as the only interactive boundary.
- Input boundary: 1px control-outline on ivory. Hover: 1px charcoal. Focus: 2px outline plus 2px offset without shifting layout.
- Selected state: 2px black boundary; reserve space or use an inset treatment so dimensions stay constant.
- Inverse outlines: ivory. Error boundary: 1px red plus explicit readable error text.
- Cards/editorial surfaces: no cast shadow. Modal/dropdown separation uses surface contrast, 1px outline, and backdrop where appropriate.
- Focus tokens: `--focus-ring-light: 0 0 0 2px #F9F8F4, 0 0 0 4px #000000`; inverse reverses the colours. These are focus outlines, not elevation shadows.
- Do not use blur/glow or red drop shadows as decoration.

## Components

### Global Clinic Navigation

**Role:** primary routes and consultation entry. Desktop height 80px; tablet/mobile 64px. Horizontal content aligns to the global container. Desktop link gap 28px; right action gap 16px; logo/action separation at least 32px. Use ivory surface, black logo, charcoal links, and a 1px stone lower divider. Keep label/control targets at least 44px tall even when the text is 14px.

Logo maximum width 160px desktop, 144px tablet, 120px mobile; height automatic with original aspect ratio. Clear space at least 24px desktop and 16px mobile or the supplied logo guideline, whichever is larger. Do not redraw, recolour, crop, stretch, or infer a new logo from the moodboard. On dark backgrounds use an approved inverse asset or retain the logo on an ivory surface.

Mobile menu button: 44 × 44px, 20px icon. Desktop nav becomes a drawer when links no longer fit; do not shrink links to force them in. Sticky header must preserve anchor offsets and never obstruct zoomed/focused content.

### Primary Consultation Button

Black background, ivory label, pill radius. Standard minimum height 52px; padding 15px 24px desktop/tablet and 13px 24px mobile; 1px border included in border-box sizing; icon 16px with 8px gap. A 20px desktop line plus two 15px insets plus two 1px borders totals 52px. A 24px mobile line plus two 13px insets plus borders also totals 52px. These border-adjusted insets are intentional exceptions to the spacing scale. Wrapped labels increase height. Width follows content; do not impose a fixed width for all labels. On mobile, form submit and major CTA may fill available width.

Hover charcoal; pressed black with stronger focus/outline cue; loading preserves width and uses “Sending your request…”. Disabled stone/muted and non-interactive. Primary label: “Book a Consultation”; actual submit label: “Send Consultation Request”. Do not make signal red the default fill.

### Secondary Explore Button

Same sizing as primary, transparent fill, 1px charcoal outline, charcoal label. Inverse version uses ivory outline/label. Action row gap 12px; allow wrap; stacked mobile actions have 12px gap. Maintain a 52px minimum height including borders through border-box sizing.

### Text Link

Manrope 14–16px / 22–24px, weight 500 or 600. Body links underlined with 3px underline offset. Arrow 16px, gap 8px. Hover strengthens underline; focus has visible outline. Inline prose links retain reading order; standalone navigation links have an effective 44px target through padding.

### Signal Dot and Interrupted Rule

Decorative red dot: 6px default, 8px maximum. Short red rule: 32px wide × 2px high. Interrupted rule: charcoal 1px line, red 6px dot, 8px clear gap each side of dot. Decorative spacing to adjacent text: 12px. Mark purely decorative elements as hidden from assistive technology. Do not recreate or alter the logo's own dot geometry.

### Service / Treatment / Article Card

Radius 28px desktop/tablet, 20px mobile; no cast shadow. Content padding 28px desktop, 24px tablet, 20px mobile. Card content stack gap 20px, with heading-to-description 12px and description-to-link 20px. Image ratio 4:3 for services/treatments, 16:9 for articles; image-to-content separation 24/20/20px. Media may be full-bleed with clipped outer corners; text retains inset.

Use ivory against stone, or a fine stone outline on ivory. No fixed text height, hard truncation of treatment names, or competing nested click targets. Grid gaps 24/24/16px. Align card actions using flexible layout without forcing equal text heights. Category metadata uses 12/18px Manrope, heading uses card-heading token, description uses body-small or body according to available space.

### Editorial Feature Block

Text/media gap 64px desktop, 40px tablet, 28px mobile. Desktop uses the global grid; text maximum 560px; prose maximum 65ch. Eyebrow-to-heading 12px; heading-to-body 20px; body-to-action 28px. Image radius follows image token. Mobile stacks content in reading order, not a reversed layout that places the CTA before its explanation. No extra boxed chrome.

### Consultation Form

Form/panel padding 32px desktop, 28px tablet, 20px mobile; form row gap 24px; two-column gap 20px; mobile single column. Labels-to-fields 8px; field-to-helper/error 8px; last field-to-permission group 24px; checkbox rows 12px; permissions-to-submit 24px; submit-to-status 16px.

Inputs/selects: minimum height 52px; padding 12px 16px; input text 16/24px; 1px functional outline; radius 12px. Reserve 44px end space for select disclosure/clear button. Icon 20px, text/icon gap 12px. With border-box sizing, padding and border fit within the minimum; fields grow if content requires it. Labels remain above fields; placeholder text is not a label.

Required fields: name, phone, service interest, contact permission. Email/date/time preferences are optional; no medical notes or uploads. Contact permission unchecked by default; any marketing permission separate and optional. Preferred date is a preference, not a booked slot. Success appears only after durable acceptance according to the technical requirements.

### Checkbox and Radio

Visible control 20 × 20px, 1px functional outline; label gap 12px; combined target at least 44px tall. Checkbox radius 4px, radio circular. Checked fill black with ivory indicator. Label 14/22px, weight 400; required permission remains readable. Align control with the first label line and allow long labels to wrap. Do not shrink controls when labels grow.

### Accordion / FAQ Row

Full-width trigger, minimum height 64px; padding 20px 0; title Manrope 16/24px weight 600; trailing 20px disclosure icon with 16px clear separation. 1px stone divider. Answer inset top 0, bottom 24px; prose max 65ch; answer paragraph gap 16px. Keyboard activation, visible focus, expanded state, and content association are mandatory. No hover-only answers.

### Tabs / Filter Chips / Pagination

Only include controls when useful content exists. Tabs minimum 44px tall; padding 12px 16px; gap 8px; active state black text plus 2px indicator. Chips minimum 44px tall, padding 10px 16px, pill radius, 8px row/column gap. Pagination controls 44 × 44px minimum with 8px gap. Use ordinary links for page navigation; use correct tab semantics only for actual tab panels. Wrap controls at narrow widths rather than forcing horizontal scrolling.

### Feedback / Alert

Padding 16px 20px; icon 20px; icon-to-text 12px; title-to-message 4px; message-to-action 12px. Radius 12px; no cast shadow. Body message 14/22px or 16/24px. Charcoal/ivory or charcoal/stone text pairing; optional red error cue, sage success surface. Loading, invalid fields, uncertain receipt, unavailable form, and accepted request each have an explicit message. Preserve recoverable form input.

### Dropdown / Popover

Width follows content, maximum 320px; viewport gutter at least 16px. Panel padding 12px; option minimum height 44px; option padding 12px 16px; group gap 8px; radius 16/12px. Ivory/charcoal with 1px functional outline. Position 8px from trigger. Reposition within viewport; close on Escape and outside interaction as appropriate; restore focus. Do not make options tiny to fit.

### Dialog / Mobile Drawer

Dialog max-width 560px; padding 32/28/24px; internal gap 24px; title-to-body 16px; actions gap 12px. Close button 44 × 44px with 20px icon. Mobile dialog width `calc(100% - 32px)`. Backdrop `rgba(0,0,0,0.40)`; appropriate focus containment and return.

Drawer uses viewport width and dynamic viewport height, with safe-area padding, minimum 20px horizontal inset, and a 64px header. Route rows at least 52px tall, groups separated by 24px, booking action separated by 32px. Scroll the drawer if necessary; never trap inaccessible content below a fixed footer.

### Tooltip

Only for nonessential supplemental information. Manrope 12/18px, ivory on charcoal, padding 8px 12px, radius 8px, max-width 240px, trigger separation 8px. Support focus/touch when applicable; never hide necessary instructions in a tooltip.

### Breadcrumb / Metadata / Lists

Breadcrumb text 14/22px; inter-item gap 8px; 12px separator; wrap at narrow widths. Breadcrumb-to-H1 gap 24/20/16px. Metadata rows gap 12px and wrap; lists use 24px marker inset and 8px item gap. Inline icon size 16px, icon/text gap 8px. Decorative icons do not replace labels.

### Footer / Mobile CTA Bar

Footer padding 64px 0 desktop, 48px tablet, 40px mobile; four-column grid when it fits, 32px column gap; mobile groups stack with 28px gap. Group title-to-links 16px; link-row gap 12px; utility/policy row separated by 32px and a 1px contrasting divider. Ivory text on charcoal; red only as a fine decorative detail.

Optional mobile booking bar: 76px minimum plus bottom safe-area inset, 12px vertical and 20px horizontal padding, 52px button. Reserve its full space in the page. Hide on Book/receipt pages and while a drawer or blocking consent UI is open. Do not add a floating WhatsApp control unless the channel is confirmed.

## Do's and Don'ts

### Do

- Use the exact latest moodboard palette and two typography families.
- Use 4px-based spacing, with the reference's 90px chapter gap explicitly tokenised.
- Use role-based heading sizes, leading, tracking, and line-length caps.
- Preserve the 20px related-element rhythm and 28px desktop media/card radius from the structural reference.
- Keep cards flat and use whitespace, material colour, and fine rules for hierarchy.
- Use black/ivory primary controls and red as a small signal.
- Keep forms readable, labelled, and dimensionally stable across errors/loading.
- Preserve logo artwork and distinguish conceptual imagery from actual clinic assets.

### Don't

- Do not use the old teal/gold palette or copy the source document's blue controls.
- Do not load SF Pro or reproduce its negative body tracking in Manrope.
- Do not use red for small body text on ivory, a full-page background, or every CTA.
- Do not use 12px inputs, 44px-high entire desktop navigation, or tiny touch controls merely because the reference includes compact store navigation.
- Do not impose fixed card/paragraph heights or fixed mobile heading line breaks.
- Do not stack margin plus gap for the same spacing relationship.
- Do not add gradients, heavy drop shadows, glow, excessive arches, or scroll trapping.
- Do not display an enquiry receipt as a confirmed appointment.

## Surfaces

| Level | Name | Value | Purpose |
|---|---|---|---|
| 0 | Brand Ivory | `#F9F8F4` | Main canvas, readable fields, editorial content |
| 1 | Warm Stone | `#E4DED3` | Alternate bands, supporting surfaces |
| 2 | Quiet Sage | `#A7B0A1` | Limited supporting content, not the universal card fill |
| 3 | Soft Charcoal | `#282826` | Footer/inverse sections, contrast areas |
| Control | Logo Black | `#000000` | Compact primary actions and supplied logo |

Red remains a signal rather than a surface level. Avoid nested surface layers that make the site look like a dashboard.

## Elevation

Default elevation is zero. Separate surfaces with colour, whitespace, 1px boundaries, and 28px media corners. Overlays use an explicit backdrop or outline rather than ambient drop shadows. Use visible focus rings only on interaction, not as permanent decorative card shadows.

## Imagery

Use the moodboard for atmosphere: warm natural light, truthful skin texture, tactile stone, ivory materials, restrained sage details, and human warmth. Do not present its concept clinic/photos as documentary AKSH assets. Use approved/licensed imagery and real clinic/practitioner material where supplied. No generated staff identities or unsupported before/after claims.

Media ratios: service/treatment 4:3; article 16:9; portrait 3:4; wide environment 3:2. Hero ratio follows available image context rather than a compulsory crop. Set intrinsic dimensions and focal points. Image-to-caption gap 12px desktop, 8px mobile. Optional arch masks apply to selected portrait media only, never to the master logo or every component.

## Layout

### Breakpoints and grid

| Range | Definition | Columns | Container gutter | Grid gap |
|---|---|---|---|---|
| Mobile | Below 768px | 4 | 20px; 16px at 320–359px | 16px |
| Tablet | 768–1023px | 8 | 32px | 24px |
| Desktop | 1024px and above | 12 | 48px minimum | 24px |

Maximum inner content width: **1280px**. Container width: `min(1280px, calc(100% - 2 * gutter))`. At 1440px this gives 80px actual side margins. Use content fit to collapse navigation earlier if required; do not infer all desktop menus fit at 1024px.

### Macro spacing

| Relationship | Desktop | Tablet | Mobile |
|---|---|---|---|
| Gap between section wrappers | 90px | 72px | 56px |
| Optional full-width band internal padding, per side | 64px | 48px | 32px |
| Main page top/bottom inset, excluding header | 64px | 48px | 32px |
| Text/media column separation | 64px | 40px | 28px |
| Card internal padding | 28px | 24px | 20px |
| Related-element default gap | 20px | 20px | 16px |
| Card grid gap | 24px | 24px | 16px |
| Form row gap | 24px | 24px | 24px |

**Spacing definition:** the section gap is measured between the outer boxes of consecutive section wrappers. Band padding is inside a wrapper. Do not apply an additional 90px margin plus a 90px parent gap. Use one layout owner for each relationship. Card padding is an inset, not an external grid gap.

No fixed viewport-height hero, forced horizontal carousels, fixed text height, or cropped overflow for essential content. Four service pillars stay accessible in normal flow. Multi-column layouts become single-column when content no longer fits. Support 200% zoom and narrow reflow without hiding actions.

## Agent Prompt Guide

Implement this as AKSH's design system, not a copy of the reference brand's website. Keep the reference document's clarity of token definitions, spacious rhythm, flat surfaces, and numerical component descriptions. Use the latest AKSH palette, Cormorant Garamond display typography, and Manrope body/UI typography.

Map all values to tokens and shared components. Apply the role tables and responsive overrides before inventing component-specific sizes. Do not reconstruct logo lettering, reuse product-store navigation/purchase content, or add a mockup to this deliverable. Keep the existing functional PRD and request-based booking rules.

### Implementation checklist

- Exact six palette values and two font families present; only the documented functional neutrals added.
- Every text role specifies size, leading, weight, tracking, and responsive behavior.
- All spacing relationships have one owner; no duplicate margin/gap.
- Container math, target heights, padding, borders, and breakpoints remain consistent.
- Required states: hover, focus, active/selected, disabled, loading, invalid, failure, uncertain receipt, accepted request, unavailable, and explicit preview.
- Cards do not clip long titles; controls and feedback grow with text.
- Native labels, keyboard operation, readable contrast, visible focus, reduced motion, and unobstructed touch targets verified.
- No false treatment claims, practitioner identity, prices, or contact details added.
- Latest visual specification takes precedence over superseded teal/gold documents.

## Quick Start

### CSS Custom Properties

This is a reusable token/scaffolding example, not a complete website design. Load the authorised font assets separately. Media-query values match the specification tables.

```css
:root {
  /* Brand — exact values from the latest moodboard */
  --color-logo-black: #000000;
  --color-brand-ivory: #F9F8F4;
  --color-signal-red: #FF0000;
  --color-warm-stone: #E4DED3;
  --color-quiet-sage: #A7B0A1;
  --color-soft-charcoal: #282826;
  /* Derived functional neutrals */
  --color-muted-text: #645F57;
  --color-control-outline: #7C776E;
  /* Semantic aliases */
  --surface-page: var(--color-brand-ivory);
  --surface-alt: var(--color-warm-stone);
  --surface-inverse: var(--color-soft-charcoal);
  --text-primary: var(--color-soft-charcoal);
  --text-heading: var(--color-logo-black);
  --text-secondary: var(--color-muted-text);
  --text-inverse: var(--color-brand-ivory);
  --action-primary: var(--color-logo-black);
  --action-primary-hover: var(--color-soft-charcoal);
  --action-primary-text: var(--color-brand-ivory);

  --font-display: 'Cormorant Garamond', Georgia, 'Times New Roman', serif;
  --font-body: 'Manrope', Arial, system-ui, sans-serif;
  --font-ui: var(--font-body);
  --weight-regular: 400;
  --weight-medium: 500;
  --weight-semibold: 600;
  --weight-bold: 700;

  /* Desktop typography; role weights/tracking follow the tables */
  --text-hero-display: 80px; --leading-hero-display: 88px;
  --text-page-title: 64px; --leading-page-title: 72px;
  --text-section-heading: 56px; --leading-section-heading: 64px;
  --text-feature-heading: 40px; --leading-feature-heading: 48px;
  --text-card-heading: 28px; --leading-card-heading: 36px;
  --text-quote: 32px; --leading-quote: 44px;
  --text-lead: 20px; --leading-lead: 32px;
  --text-body: 18px; --leading-body: 30px;
  --text-body-small: 14px; --leading-body-small: 22px;
  --text-nav: 14px; --leading-nav: 20px;
  --text-button: 14px; --leading-button: 20px;
  --text-label: 14px; --leading-label: 20px;
  --text-input: 16px; --leading-input: 24px;
  --text-eyebrow: 12px; --leading-eyebrow: 18px;
  --text-footer: 14px; --leading-footer: 22px;
  --tracking-display: -0.01em;
  --tracking-body: 0em;
  --tracking-eyebrow: 0.08em;

  --spacing-unit: 4px;
  --spacing-4: 4px; --spacing-8: 8px; --spacing-12: 12px;
  --spacing-16: 16px; --spacing-20: 20px; --spacing-24: 24px;
  --spacing-28: 28px; --spacing-32: 32px; --spacing-40: 40px;
  --spacing-48: 48px; --spacing-52: 52px; --spacing-56: 56px;
  --spacing-64: 64px; --spacing-72: 72px; --spacing-80: 80px;
  --spacing-90: 90px; --spacing-96: 96px; --spacing-128: 128px;

  --container-max: 1280px;
  --container-gutter: 48px;
  --grid-gap: 24px;
  --section-gap: 90px;
  --section-band-inset: 64px;
  --page-inset: 64px;
  --card-padding: 28px;
  --element-gap: 20px;
  --media-column-gap: 64px;
  --header-height: 80px;
  --control-min-height: 52px;
  --button-padding-block: 15px;
  --target-min-size: 44px;

  --radius-card: 28px;
  --radius-image: 28px;
  --radius-panel: 16px;
  --radius-input: 12px;
  --radius-button: 9999px;
  --radius-link: 4px;
  --radius-chip: 9999px;
  --radius-checkbox: 4px;
  --radius-circle: 50%;
  --radius-navigation: 0px;
  --radius-overlay: 16px;
  --radius-status: 0px;
  --border-width: 1px;
  --shadow-card: none;
  --focus-ring-light: 0 0 0 2px #F9F8F4, 0 0 0 4px #000000;
  --focus-ring-inverse: 0 0 0 2px #000000, 0 0 0 4px #F9F8F4;
  --duration-fast: 150ms;
  --duration-standard: 200ms;
  --ease-standard: cubic-bezier(0.2, 0, 0, 1);
}

@media (min-width: 768px) and (max-width: 1023px) {
  :root {
    --text-hero-display: 64px; --leading-hero-display: 72px;
    --text-page-title: 56px; --leading-page-title: 64px;
    --text-section-heading: 44px; --leading-section-heading: 52px;
    --text-feature-heading: 36px; --leading-feature-heading: 44px;
    --text-quote: 28px; --leading-quote: 40px;
    --text-lead: 18px; --leading-lead: 30px;
    --container-gutter: 32px;
    --section-gap: 72px; --section-band-inset: 48px;
    --page-inset: 48px; --card-padding: 24px;
    --media-column-gap: 40px; --header-height: 64px;
  }
}

@media (max-width: 767px) {
  :root {
    --text-hero-display: 44px; --leading-hero-display: 52px;
    --text-page-title: 40px; --leading-page-title: 48px;
    --text-section-heading: 36px; --leading-section-heading: 44px;
    --text-feature-heading: 28px; --leading-feature-heading: 36px;
    --text-card-heading: 24px; --leading-card-heading: 32px;
    --text-quote: 24px; --leading-quote: 36px;
    --text-lead: 18px; --leading-lead: 30px;
    --text-body: 16px; --leading-body: 28px;
    --text-nav: 16px; --leading-nav: 24px;
    --text-button: 16px; --leading-button: 24px;
    --button-padding-block: 13px;
    --tracking-display: 0em;
    --container-gutter: 20px; --grid-gap: 16px;
    --section-gap: 56px; --section-band-inset: 32px;
    --page-inset: 32px; --card-padding: 20px; --element-gap: 16px;
    --media-column-gap: 28px; --header-height: 64px;
    --radius-card: 20px; --radius-image: 20px;
    --radius-panel: 12px; --radius-overlay: 12px;
  }
}

@media (max-width: 359px) {
  :root { --container-gutter: 16px; }
}

*, *::before, *::after { box-sizing: border-box; }
body {
  margin: 0;
  background: var(--surface-page);
  color: var(--text-primary);
  font-family: var(--font-body);
  font-size: var(--text-body);
  line-height: var(--leading-body);
}
h1, h2, h3, h4, p { margin: 0; }
button, input, select, textarea { font: inherit; }
.aksh-container {
  width: calc(100% - 2 * var(--container-gutter));
  max-width: var(--container-max);
  margin-inline: auto;
}
.aksh-section-stack { display: grid; gap: var(--section-gap); }
.aksh-section-band { padding-block: var(--section-band-inset); }
.aksh-card {
  padding: var(--card-padding);
  border-radius: var(--radius-card);
  box-shadow: var(--shadow-card);
}
.aksh-display {
  font-family: var(--font-display);
  font-size: var(--text-hero-display);
  line-height: var(--leading-hero-display);
  font-weight: var(--weight-semibold);
  letter-spacing: var(--tracking-display);
  max-width: 12ch;
}
.aksh-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  min-height: var(--control-min-height);
  padding: var(--button-padding-block) 24px;
  border: 1px solid transparent;
  border-radius: var(--radius-button);
  font-family: var(--font-ui);
  font-size: var(--text-button);
  line-height: var(--leading-button);
  font-weight: var(--weight-semibold);
  text-align: center;
  white-space: normal;
}
.aksh-button-primary {
  background: var(--action-primary);
  color: var(--action-primary-text);
}
.aksh-button-primary:hover:not(:disabled) {
  background: var(--action-primary-hover);
}
.aksh-button:disabled {
  background: var(--color-warm-stone);
  color: var(--color-muted-text);
}
.aksh-input {
  width: 100%;
  min-height: var(--control-min-height);
  padding: 12px 16px;
  border: 1px solid var(--color-control-outline);
  border-radius: var(--radius-input);
  background: var(--surface-page);
  color: var(--text-primary);
  font-family: var(--font-ui);
  font-size: var(--text-input);
  line-height: var(--leading-input);
}
.aksh-focus-light:focus-visible { box-shadow: var(--focus-ring-light); }
.aksh-focus-inverse:focus-visible { box-shadow: var(--focus-ring-inverse); }
/* Do not remove native outlines without a tested replacement. */
@media (prefers-reduced-motion: reduce) {
  .aksh-motion { animation: none; transition: none; }
}
```

The snippets establish tokens and representative primitives only. Implement accessible markup, actual font loading, validation, menu/dialog behavior, remaining component states, and the exact content gaps from their tables separately. Keep all dimensions in shared tokens rather than repeating arbitrary numbers throughout pages.
