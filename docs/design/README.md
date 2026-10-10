# AKSH Design — Source and Precedence Notes

**Canonical design system:** [`AKSH_DESIGN.md`](AKSH_DESIGN.md), the AKSH UI/UX Design System Specification **v2.0**, 8 October 2026.

This file is kept byte-identical to the version supplied (SHA-256 `3edab611…`). It is authoritative for every visual token, type role, spacing value, component dimension, and interaction state. Where the PRD or TRD summarises visual rules, the specification wins.

## Resolving references inside the specification

| The specification mentions | Where it is now |
|---|---|
| "the attached DESIGN.md" (structural reference) | [`../reference/structural/Apple_Style_Reference_DESIGN.md`](../reference/structural/Apple_Style_Reference_DESIGN.md). Renamed so tools do not mistake it for AKSH branding. Use it for structure only: no Apple colours, SF Pro, blue controls, or store navigation |
| `AKSH_Wellness_Brand_Moodboard(2).png` ("authoritative brand source") | **Not supplied in this workspace.** The specification's tokens are complete without it. Imagery direction cannot be checked until it is added. When it arrives, place it at `assets/source/brand/` and record it in `docs/audit/ASSET_INVENTORY.md` |
| "the earlier AKSH UI/UX document" | Not supplied. It is superseded, so no action is needed |
| "the supplied master logo" | Candidate: [`../../assets/source/brand/Logo.jpeg`](../../assets/source/brand/Logo.jpeg) (1560×1200 JPEG on ivory). Approval and vector/inverse variants are pending (see `docs/audit/DECISIONS.md` O-01) |

## Superseded visual sources (do not implement)

- Teal/gold palette (`#123C3F`, `#F5EFE6`, `#B8975F`, `#A8B8A6`, `#C98B72`, `#1F2523`), gold CTAs, and the 60/25/10/5 colour ratio. These came from `AKSH_Brand_Palette_and_Fonts.docx` (not present) and are preserved for history in `../reference/originals/`.
- The interim Jost wordmark.
- The teal/gold logo concept at `../../assets/reference/superseded-brand/Aksh Logo.png`.

## Implementation pointers

- Token source for code: the specification's **Quick Start** custom properties plus its tablet/mobile overrides. Put them in `src/styles/tokens.css` and map them into Tailwind (Milestone 1, `docs/audit/DEVELOPMENT_PLAN.md`).
- Required states checklist: specification § "Implementation checklist".
