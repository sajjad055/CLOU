---
inclusion: always
---

# Desktop Accessibility Guidelines

This project is a mobile-first React app (the KALANJIYAM / Kalanjiyam salary-advance flow).
When the UI is adapted to **desktop / larger viewports**, it must meet **WCAG 2.1 AA**.
Apply these rules whenever you add or modify UI that renders on desktop breakpoints
(Tailwind `md:` / `lg:` / `xl:` and above), or when introducing responsive behavior.

Note: Full WCAG conformance requires manual testing with assistive technologies and
expert review. These rules cover the practical, automatable baseline — treat them as
the minimum bar, not a certificate of compliance.

## 1. Responsive layout & reflow (WCAG 1.4.10)
- Keep the existing mobile layout intact; add desktop behavior with responsive prefixes
  (`md:`, `lg:`), never by removing the mobile styles.
- Mobile screens use `max-w-lg mx-auto` containers. On desktop, content must remain
  readable and centered — do not let line lengths exceed ~75ch for body text.
- Content must reflow without horizontal scrolling at 320px width and at 400% zoom.
- Prefer fluid layouts (flex/grid with `gap`) over fixed pixel widths.

## 2. Target size & pointer input (WCAG 2.5.8)
- Interactive targets (buttons, links, icon buttons) must be at least **24x24px**;
  aim for **44x44px** for primary actions. Existing `w-12 h-12` icon buttons are fine.
- On desktop, provide visible `hover:` states for all interactive elements. Never rely
  on hover alone to convey information or reveal essential controls.

## 3. Keyboard operability (WCAG 2.1.1, 2.4.3, 2.4.7)
- Every interactive element must be reachable and operable by keyboard (Tab / Shift+Tab /
  Enter / Space / Arrow keys where relevant).
- Use semantic elements: `<button>` for actions, `<a>` for navigation. Do not attach
  click handlers to bare `<div>`/`<span>` without adding `role`, `tabIndex={0}`, and
  key handlers. Prefer refactoring the clickable `div` cards (e.g. HomePage) into
  `<button>` on desktop.
- Preserve a logical DOM order that matches the visual order so tab order is predictable.
- Provide a **visible focus indicator** with sufficient contrast. Use
  `focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#315C9D]`
  (or the ring utilities) — never `outline-none` without a replacement.
- Overlays/sheets (Terms sheet, language menu, dialogs) must trap focus while open,
  close on `Escape`, and return focus to the trigger on close.

## 4. Color & contrast (WCAG 1.4.3, 1.4.11)
- Primary color is `#315C9D`. White text on `#315C9D` and `#315C9D` text on white both
  meet AA for normal text — keep this pairing for buttons and links.
- Body/secondary text must maintain a **4.5:1** contrast ratio; large text (>=18.66px bold
  or >=24px) needs **3:1**. The muted grey `#6b7280` on white passes for normal text.
- UI component boundaries and icons that convey meaning need **3:1** against their
  background.
- Never use color as the only means of conveying information (e.g. selected offers,
  errors, success). Pair color with text, icons, or shape.

## 5. Text & typography
- Do not set text below 12px. Respect user zoom; use `rem`/relative units or Tailwind's
  scale rather than locking pixel sizes where possible.
- Hero display headings use `Fondamento` (the `HERO_FONT` constant). Keep body copy in
  the default `Manrope` for legibility.
- Support text spacing overrides (line-height, letter/word spacing) without clipping —
  avoid fixed heights on text containers.

## 6. Images, icons & media (WCAG 1.1.1)
- All meaningful `<img>` (illustrations, IOB / UPI / Kalanjiyam logos) must have a
  descriptive `alt`. Decorative images use `alt=""`.
- `lucide-react` icons that are the only content of a control need an accessible name
  via `aria-label` on the control (or visually-hidden text).
- The "How It Works" video placeholder must expose real controls with labels when wired
  up, and provide captions/transcript for any actual media.

## 7. Semantics & landmarks (WCAG 1.3.1, 4.1.2)
- Use one `<h1>` per screen and a logical heading hierarchy (`h1` -> `h2` -> `h3`);
  do not skip levels for styling.
- Use landmark elements: `<header>`, `<main>`, `<nav>`, `<footer>`. The pages already
  use `<header>` and `<main>` — keep this.
- Form fields need associated `<label>`s (or `aria-label`), and error messages must be
  programmatically linked via `aria-describedby` and announced (`role="alert"`).
- FAQ accordions must use proper `aria-expanded` / `aria-controls` on the trigger.

## 8. Motion (WCAG 2.3.3)
- The app uses `motion`/framer-motion animations. Respect `prefers-reduced-motion`:
  disable or reduce non-essential entrance/parallax animations when the user requests it.

## Implementation checklist for any desktop-facing change
- [ ] Works at 320px and at 400% zoom with no horizontal scroll
- [ ] Fully keyboard operable with a visible focus ring
- [ ] Clickable elements are semantic (`<button>`/`<a>`), not bare `<div>`
- [ ] Text/icon contrast meets AA; color is never the sole signal
- [ ] Images have `alt`; icon-only controls have `aria-label`
- [ ] Headings and landmarks are correct and in order
- [ ] Overlays trap focus, close on Escape, restore focus
- [ ] `prefers-reduced-motion` honored
