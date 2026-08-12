# Design — UI/UX decisions

## Design language

A calm, clinical aesthetic appropriate for a healthcare product:

- **Brand colour:** Agnos **royal blue** (`--color-brand-*`) used for primary
  actions and accents, matching the Agnos Health brand.
- **Neutrals:** slate-based surfaces with semantic tokens (`canvas`, `surface`,
  `surface-2`, `border`, `ink`, `muted`) that flip between light and dark.
- **Type:** Geist (via `next/font`) for a clean, legible UI at small sizes.
- **Depth:** subtle borders + soft shadows on hover, rounded-2xl cards. No heavy
  drop-shadows or gradients except the brand hero accent.

Every colour is defined as a CSS variable so **light and dark mode** share one
set of component classes. The theme is applied by a blocking script before paint
to avoid a flash of the wrong theme, and can be toggled manually.

## Status as colour language

Status is the most important information on the staff side, so it's encoded
consistently everywhere (badge, avatar, card accent):

| Status | Colour | Meaning |
| --- | --- | --- |
| Typing… | amber (pulsing) | field focused + activity in the last 6s |
| Active | emerald | activity in the last 25s |
| Idle | slate | no activity for 25s+ ("inactive") |
| Submitted | blue | form submitted |
| Offline | grey | presence lost (detail view) |

## Responsiveness

Mobile-first; breakpoints via Tailwind's `sm:` (640px).

### Patient form
- **Mobile:** single-column fields, comfortable 44px+ touch targets, `inputMode`
  hints (e.g. `tel`), a completion progress bar, and a **sticky submit button**
  so it's always reachable.
- **Desktop:** fields flow into a two-column grid within each section; wide
  fields (Address) span both columns.

### Staff dashboard
- **Mobile:** stat tiles stay in a compact 3-up row; session cards are full-width
  rows; filters and search stack vertically.
- **Desktop:** roomy max-width layout; the same cards get more breathing space;
  filters and search sit side by side.

### Staff detail
- **Mobile:** patient header stacks; fields render one per row.
- **Desktop:** header lays out horizontally with meta stats in a 4-up row; fields
  render two-up, mirroring the patient's own layout so staff and patient "see the
  same form."

## Micro-interactions

- **Field flash** — when a value changes on the staff side it briefly flashes,
  drawing the eye to what just changed.
- **Focus highlight** — the field the patient is editing is ringed in amber with
  a "typing" tag.
- **Pulsing dot** on the "Typing…" badge and connection pill signals liveness.
- All motion respects `prefers-reduced-motion`.
