# Consent Declaration + CTA Pattern

How to place consent / terms / declaration acceptance on a screen in this app.

The rule exists because the original screens made the user clear a full-page
consent sheet before they could make progress. Acceptance now happens on the
screen itself wherever that is reasonable, and the long legal text becomes
optional reading rather than a roadblock.

## The decision rule

Two inputs decide where declarations go: **how many** there are, and **how much
other content** the screen already carries.

| Declarations | Light screen | Heavy screen (long form, detail list, review list) |
| --- | --- | --- |
| 1 | Inline, above the CTA | **Inline, above the CTA** |
| 2 | Inline, stacked one below the other, above the CTA | Bottom sheet on continue |
| 3 or more | **Bottom sheet on continue** — never inline | Bottom sheet on continue |

Read the table as hard limits, not preferences:

- **A single declaration always goes inline with the CTA**, however heavy the
  screen. One checkbox above the button is a decision, not a form, and pushing it
  into a sheet adds a step for nothing.
- **Two declarations go inline only on a light screen.** On a heavy screen the
  pair crowds the content above it or falls off the fold, so they move to a sheet.
- **Three or more declarations never go inline**, no matter how empty the screen
  is. Stacked checkboxes above a CTA stop reading as a decision and start
  reading as a form.

### Do not ask for consent that cannot apply

Before placing a declaration at all, check that what it authorises is actually
possible at that point in the journey. A consent naming data the screen does not
have is worse than no consent: it is inaccurate.

Worked example: the HRMS details screen must not ask to authorise a CKYC download
when the HRMS record carried no PAN. CKYC cannot be fetched without a PAN or an
Aadhaar number, and neither has been captured yet, so those flows show no consent
here — it is taken later, on the screen that actually collects the identifier.
Gate the declaration on the flow, not on the screen.

### What counts as a light screen

One primary input plus supporting copy, no scrolling required at 320px. The
phone-number entry, OTP entry, Aadhaar entry, and account-number entry screens
are light.

### What counts as a heavy screen

A long form, a multi-row detail or review list, a list of selectable cards, or
anything that scrolls to reach the CTA. The CKYC details review and HRMS details
review screens are heavy.

## Inline variant

Use when the table says inline.

- Checkbox sits **above** the CTA inside `StickyFooter`.
- Declaration copy is a short summary of **at most two lines**. Do not paste the
  legal text inline.
- The full text goes behind a **"Read more"** link that opens a **read-only**
  `BottomSheet`. That sheet decides nothing: it has no accept action, it never
  navigates, and it never sets the checkbox.
- **"Read more" placement depends on the length of the short declaration:**
  - Short copy (fits one line): the link runs inline, continuing straight after
    the last word.
  - Long copy (wraps to two lines): the link drops to the **second line**,
    below the copy, rather than trailing off the end of a wrapped paragraph
    where it is easy to miss.

  In both cases it is a sibling of the checkbox, never nested inside it.
- CTA stays `disabled` until **every** inline declaration is checked. Also guard
  the handler with an early return, so a click that slips past `disabled` does
  nothing.
- With two declarations, stack them in DOM order matching visual order and gate
  the CTA on both.

### Markup shape

The checkbox button wraps **only the box**. The declaration copy lives in a
sibling `<p>` alongside the "Read more" button, so the link sits in the same text
flow and continues after the last word instead of dropping to its own line. A
button cannot be nested inside another button — that is invalid HTML and the
inner control becomes unreachable — so this split is what makes an inline link
possible at all.

The checkbox is named by the declaration text via `aria-labelledby`, so screen
readers still announce the two together. With more than one declaration, give
each label a unique id.

```tsx
<StickyFooter>
  <div className="mb-3 flex items-start gap-3">
    {/* Padding lifts the 20px box to a 24px hit area. Checked state is
        signalled by the tick icon, not colour alone. */}
    <button
      type="button"
      role="checkbox"
      aria-checked={consent}
      aria-labelledby="consent-label"
      onClick={() => setConsent(!consent)}
      className="flex-shrink-0 mt-0.5 p-0.5 rounded-md
                 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#315C9D]"
    >
      <span className={`flex w-5 h-5 rounded-[5px] border items-center justify-center transition-colors ${
        consent ? 'bg-[#315C9D] border-[#315C9D]' : 'bg-white border-[#c4c4c4]'
      }`}>
        {consent && <Check className="w-3.5 h-3.5 text-white" strokeWidth={3} aria-hidden="true" />}
      </span>
    </button>

    {/* One text flow, so "Read more" continues after the copy. */}
    <p className="text-[12px] text-[#6b7280] leading-relaxed">
      <span id="consent-label">{t.consentShort}</span>{' '}
      <button
        type="button"
        onClick={() => setShowConsentSheet(true)}
        className="text-[12px] font-semibold text-[#315C9D] underline underline-offset-2 rounded-sm
                   focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#315C9D]"
      >
        {t.readMore}
      </button>
    </p>
  </div>

  <CTAButton disabled={!inputValid || !consent} onClick={submit}>
    {t.continueBtn}
  </CTAButton>
</StickyFooter>
```

Tradeoff to accept: because the copy is no longer inside the button, tapping the
text does not toggle the checkbox — only the box does. That is the cost of
putting a link in the text flow, and it is why the box carries padding to reach a
24px target.

Reference implementations: `AadhaarVerificationPage`, `AadhaarBiometricPage`,
`SanctionedOffersPage`, `PANAadhaarEntryPage`.

## Bottom-sheet variant

Use when the table says bottom sheet — three or more declarations, or a heavy
screen.

- The CTA is gated only on the screen's own inputs, not on consent.
- Activating the CTA opens a `BottomSheet` carrying the declarations.
- Here the sheet **is** a gate: it holds the checkboxes and an accept action in
  its `footer`, and that action is what advances the flow. This is the one case
  where a sheet decides something.
- The accept action stays disabled until every declaration inside is checked.
- Closing the sheet returns the user to the screen with nothing submitted and
  their input intact.

## Always use the shared BottomSheet

Import from `./BottomSheet`. Never hand-roll a sheet — four divergent copies is
what this component replaced. It already provides:

- 80vh height cap, with the body as the only scrolling region so the header and
  close control can never be pushed off screen
- a grab handle that really drags, dismissing on a downward drag or flick
- `max-w-lg` centred, so it does not stretch edge to edge on desktop
- Escape to close, focus trapped while open, focus restored to the trigger
- body scroll lock behind the sheet
- `prefers-reduced-motion` respected

## Copy rules

- Every string needs an English and a Tamil value. Screens read them through
  `useLanguage()`, or through `tr()` for the HRMS screens.
- Short declaration: plain language, first person, two lines maximum.
- "Read more" / "மேலும் படிக்க" for the link.
- Keep the full legal wording verbatim in the sheet. Do not paraphrase it into
  the short declaration — summarise the intent and let the sheet carry the text.

## Accessibility

Follow `desktop-accessibility.md`. Specific to this pattern:

- Checkbox is a `<button role="checkbox">` with `aria-checked`, or a real
  `<input type="checkbox">` with a `<label>`.
- Checked state carries a tick icon, never colour alone.
- Touch target at least 24x24px; the CTA at least 44px tall (`h-12`).
- Visible `#315C9D` focus ring on the checkbox, the "Read more" link, and the CTA.
- "Read more" is a sibling of the checkbox, never nested inside it.
- Tab order matches visual order: declaration(s), then "Read more", then CTA.
