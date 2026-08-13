# Design Brief — Fintech Mobile App (Credit Card Onboarding)

Derived from the DCB Payless Card onboarding flow. Use this as a reference to recreate the same visual language, component patterns, and interaction style in a different project.

---

## Visual Identity

- **Aesthetic:** Clean, trustworthy, minimal fintech. White-dominant with controlled use of color.
- **Tone:** Professional but approachable. Data-forward with illustrative warmth.
- **Key trait:** Every screen has one clear action. Nothing competes with the primary CTA.

---

## Canvas & Layout

| Property | Value |
|---|---|
| Frame size | 360 × 800px (Android standard) |
| Content width | 328px |
| Horizontal margin | 16px each side |
| Vertical rhythm | 24px base spacing unit |
| Layout mode | Vertical auto-layout throughout |

---

## Color Palette

| Role | Hex | Usage |
|---|---|---|
| Background | `#ffffff` | Screen backgrounds |
| Surface/Muted | `#f9fafb` | Header containers, secondary surfaces |
| Input fill | `#ebecef` | Text field backgrounds |
| Divider | `#e5e7eb` | Separators, borders |
| Light gray | `#d9d9d9` | Inactive elements, borders |
| Primary text | `#111827` | Headings, values, strong labels |
| Dark text | `#212121` | Subheadings, form values |
| Navy brand | `#1e3868` | Status bar text, brand accents |
| Deep navy | `#233266` | Brand icon fills |
| Purple accent | `#5f259f` | Progress rings, tabs, highlights |
| Medium gray | `#666666` | Step labels, secondary info |
| Secondary text | `#6b7280` | Supporting labels, captions |
| Muted gray | `#9e9e9e` | Inactive labels, placeholders |
| Blue link | `#037eab` | Inline links, "Know why?", CTAs |
| Blue icon | `#297aec` | Google-branded elements |
| Teal | `#54c1f0` | Partner icon fills |
| Success green | `#2da94f` | Confirmed states, badges |
| Success bg | `#f0fdf4` | Success surface |
| Positive | `#31d124` | Percentage gains |
| Error/Alert | `#ea4335` | Error states, progress alerts |
| Warning | `#fdbd00` | Caution states |
| Overlay/Scrim | `#000000` at 70% | Modal overlays on image backgrounds |
| Lavender | `#d8d1e6` | Decorative paths, soft accents |

---

## Typography

### Primary Font: Manrope
Used for all primary UI text — headings, body, labels, CTAs.

| Role | Size | Weight | Color |
|---|---|---|---|
| Hero number / display | 50–56px | Bold | `#111827` |
| Section heading | 20–24px | SemiBold | `#111827` |
| Subheading / value | 18–20px | SemiBold | `#212121` |
| Body / description | 14–16px | Regular | `#6b7280` |
| Form value | 14px | SemiBold | `#212121` |
| Label / caption | 12px | Regular | `#666666` |
| Small / helper | 10px | Regular / SemiBold | `#666666` |
| Step indicator | 12px | SemiBold | `#666666` |
| CTA text | 16px | SemiBold | `#ffffff` |

> Manrope SemiBold is the workhorse weight — use it for all interactive labels, values, and CTAs. Reserve Regular for supporting text and captions.

---

## Icons

> **Rule: Always use HUGE icons.**
>
> Icons must feel substantial and easy to tap. Never use small decorative icons. All interactive icons sit inside a large touch target container.

| Context | Icon glyph size | Container/touch target |
|---|---|---|
| Header navigation (back, close) | 24 × 24px | 48 × 48px frame |
| Header actions (support, headset) | 24 × 24px | 48 × 48px frame |
| Feature / illustrative icons | 64 × 64px | 80 × 80px frame |
| Payment method icons | 48 × 48px | — |
| List item leading icons | 40 × 40px | — |
| Circular icon containers (benefit rows) | 32 × 32px | 44 × 44px with bg |

- **Style:** Outlined / Material Icons or equivalent open-source set.
- **Color:** Match text hierarchy — `#111827` for primary, `#6b7280` for secondary.
- **Named component:** "Actionable Icons - Big" — always prefer this over inline raw icons.
- When in doubt, go larger. A 64px icon is almost always better than a 48px icon in mobile fintech.

---

## Component Patterns

### Header
- Height: 48px, full 360px width
- Background: transparent or `#f9fafb`
- Left: Back arrow icon (`arrow-back`, 24px glyph in 48×48 container)
- Right: 2 icons stacked horizontally — headset/support + close (X), each in 48×48 containers
- Status bar text (time, signal): `#1e3868`, Manrope Regular 14px

### Progress Indicator
- Circular ring badge, top-right of screen below header
- Shows step as percentage (10%, 25%, 55%) or "Step X/Y" text
- Accent color: `#5f259f` purple or brand equivalent
- Small SemiBold label: `#666666`, 12px

### Screen Title
- Immediately below header area
- Font: Manrope SemiBold, 20px, `#111827`
- Left-aligned

### Illustration Zone
- Centered in the upper-middle of screen
- Large illustrative image or icon (never small)
- Used for: payment methods, verification documents, empty states
- White background; can include branded card mockup or doc imagery

### Form Fields
- Width: 328px, height: 56–58px
- Corner radius: 8px
- Background fill: `#ebecef`
- Border: 1px `#e5e7eb` (inactive), red/error on failure
- Layout: Label above (12px `#666666`) → value (14px SemiBold `#212121`)
- Trailing: optional icon (calendar, chevron) at 24px

### Horizontal Chip Selector (Amount / Option Picker)
- Row of pill/chip buttons, horizontally scrollable
- Inactive: `#f9fafb` fill, `#e5e7eb` border
- Active: Dark fill (`#111827`) with white text
- Font: SemiBold 14px
- Border radius: full-pill or 8px

### List Items
- Width: 328px, height: 60–68px
- Leading: icon or brand logo
- Trailing: right chevron (24px)
- Border radius: 0px for lists inside containers, 12px for standalone card-style items
- Separator: 1px `#e5e7eb` divider

### Consent / Checkbox Row
- Positioned above bottom CTA
- Checkbox: 16×16px, active fill `#5f259f`
- Text: 10px Regular `#666666`, inline blue links `#037eab`

### Primary CTA Button
- Width: 328px, height: 48px
- Corner radius: 8px
- Background: `#111827`
- Text: Manrope SemiBold 16px, `#ffffff`
- Container: 360px wide × 88px tall
- Always bottom-anchored — one per screen

### Modal / Bottom Sheet
- Background: `#ffffff`
- Corner radius: 12px top corners
- Overlay scrim: `#000000` at 70% opacity

---

## Layout Patterns (Reusable Screen Templates)

### Pattern A — Full Form Screen
