# Implementation Plan: HRMS Salary Advance Flows

## Overview

Five HRMS-originated demo journeys are added to the Kalanjiyam prototype in TypeScript + React, strictly additively. The build order is bottom-up: three pure modules under `src/app/flows/` first (registry, journey state, bilingual content), then the four new screens, then route registration, then one additive edit per existing component so each edit can be regression-checked on its own, then Dev Preview, then a full walkthrough.

Automated test tooling is deliberately out of scope for this plan. Verification for every task is `pnpm build` succeeding with no type or import errors, plus a manual walkthrough in Dev Preview where the task changes something visible. There is no `tsc` script and no root `tsconfig.json` in this project, so type errors surface through the editor's TypeScript service and through `vite build` failing on unresolved imports — check both.

## Tasks

- [x] 1. Build the HRMS flow registry (`src/app/flows/hrmsFlows.ts`)
  - [x] 1.1 Create the module with flow ids and all type declarations
    - Create `src/app/flows/hrmsFlows.ts`
    - Export `HRMS_FLOW_IDS` as a 5-element `as const` tuple: `hrms-pan-etb`, `hrms-pan-ntb`, `hrms-nopan-etb`, `hrms-nopan-ntb`, `hrms-nopan-etb-nopan`
    - Export `HrmsFlowId = (typeof HRMS_FLOW_IDS)[number]`
    - Export `EXISTING_FLOW_IDS` as an 8-element `as const` tuple in the order given in design.md
    - Export `HrmsStepId` union: `hrms-fetch`, `hrms-details`, `ckyc-pan-dedupe`, `account-choice`, `account-entry`, `account-pan-lookup`, `pan-aadhaar-entry`, `aadhaar`, `ckyc-otp`, `ckyc-details`, `cif-success`, `offers`
    - Export `AadhaarStepId` union including the new HRMS-only `ckyc-retrieval` member
    - Export interfaces `ProcessingStep`, `HrmsStep` (with `route`, optional `phase`, optional `processing`, `next`, and the optional `altNext` field used by `account-choice`), `AadhaarSegment`, `CkycDetailsConfig`, `HrmsFlowDefinition`
    - No React imports, no JSX, no `navigate` — this module stays pure
    - Verify: `pnpm build` succeeds
    - _Requirements: 1.7, 3.6, 13.6, 13.8_

  - [x] 1.2 Add the fixed dummy data and the processing-step catalogue
    - Export `HRMS_EMPLOYEE` = `{ name: 'Aravind Kumar S.', mobile: '9876543210', dob: '12/03/1992', pan: 'ABCPK1234F' }`
    - Export `ACCOUNT_RECORD_PAN` = `'ABCPK1234F'`
    - Declare one `ProcessingStep` constant per row of the design's simulated-step table with both `labelEn` and `labelTa` non-empty: `hrms-fetch` (2500 ms), `ckyc-id` (1800), `pan-dedupe` (2000), `account-pan` (1800), `ckyc-verify` (2000), `account-pan-absent` (1800), `ckyc-by-aadhaar` (2000), `cif-create` (2000)
    - Keep every non-fetch duration in 1000–2500 ms and the fetch duration in 1500–4000 ms
    - Verify: `pnpm build` succeeds
    - _Requirements: 3.5, 3.7, 14.5, 14.6, 15.4_

  - [x] 1.3 Declare the five flow definitions with their step tables, Aadhaar segments and CKYC configs
    - Transcribe each per-flow step table from design.md exactly: step id, `route`, `phase`, `processing`, `next`, plus `altNext: '/hrms-pan-aadhaar'` on the `account-choice` step
    - Every flow's chain terminates at `offers` / `/sanctioned-offers` with `next: null`
    - `hrms-pan-etb`: `hrmsPanPresent: true`, `dedupe: 'etb'`, `aadhaarSegments: []`, `ckycDetails: { dedupeResult: 'etb', panSource: 'hrms', next: '/sanctioned-offers', steps: [] }`
    - `hrms-pan-ntb`: `dedupe: 'ntb'`, one `full` segment with the complete `DEFAULT_SEQUENCE` step list, `seedAadhaarFromJourney: false`, `updatingRecordsAs: 'cif'`, `exitRoute: '/success'`, `ckycDetails.panSource: 'hrms'`, `next: '/aadhaar-verification'`
    - `hrms-nopan-etb`: `hrmsPanPresent: false`, `accountRecordPan: ACCOUNT_RECORD_PAN`, `aadhaarSegments: []`, `ckycDetails: { dedupeResult: 'etb', panSource: 'account-record', next: '/sanctioned-offers', steps: [] }`
    - `hrms-nopan-ntb`: two segments — `otp-then-ckyc` (`['aadhaar-otp','ckyc-retrieval']`, seeded, `processing: [ckycByAadhaar]`, exit `/otp-verification`) and `face-only` (`['face-verification-ready','blink','scanning','verifying','verified','updating-records','success']`, seeded, `updatingRecordsAs: 'cif'`, exit `/success`); `ckycDetails.panSource: 'journey'`, `next: '/aadhaar-verification'`; no `account-entry` step anywhere
    - `hrms-nopan-etb-nopan`: `accountRecordPan: null`, one `entry-otp-ckyc` segment (`['aadhaar-input','aadhaar-otp','ckyc-retrieval']`, not seeded, `processing: [ckycByAadhaar]`, exit `/otp-verification`), `ckycDetails: { dedupeResult: 'etb', panSource: 'none', next: '/sanctioned-offers', steps: [] }`; no Face RD or `updating-records` step
    - Add `labelEn` and `descriptionEn` per the Dev Preview table (name ≤ 60 chars, description ≤ 200 chars), and `entryRoute: '/hrms-details'` on all five
    - Verify: `pnpm build` succeeds
    - _Requirements: 8.1, 8.6, 9.1, 10.1, 10.10, 11.1, 12.1, 12.10, 14.1, 14.2, 14.3, 14.4, 14.9_

  - [x] 1.4 Implement the resolver functions
    - `getActiveFlow()` reads `localStorage['activeFlow']` inside `try/catch` and returns `''` when absent or storage throws
    - `isHrmsFlow(flow): flow is HrmsFlowId` returns true only for the five ids — false for all eight existing ids, `''` and any other string
    - `getHrmsFlow`, `hrmsEntryRoute`, `hrmsNextRoute`, `hrmsProcessing`, `getAadhaarSegment`, `getCkycDetailsConfig`, `hasStep` all return `null` / `[]` / `false` for every non-HRMS input, so existing flows can never enter HRMS routing
    - `hrmsNextRoute(flow, 'ckyc-otp')` resolves to `/ckyc-customer-details` for all five flows
    - Verify: `pnpm build` succeeds
    - _Requirements: 1.1, 1.2, 1.7, 3.2, 3.6, 5.9, 8.6, 10.10, 12.10, 13.2, 13.7_

- [x] 2. Build the journey-state module (`src/app/flows/hrmsJourney.ts`)
  - [x] 2.1 Create the module with the state shape and read/write/reset over `sessionStorage`
    - Create `src/app/flows/hrmsJourney.ts` exporting `HrmsJourneyState` with `flow`, `consentAccepted`, `accountChoice`, `iobAccountNumber`, `aadhaarNumber`, `pan`, `panSource`, `aadhaarSegmentIndex`
    - `readJourney(flow)` returns a fresh initialised state when the key `hrmsJourney` is absent, when `JSON.parse` throws, when storage is unavailable, or when the stored `flow` differs from the requested flow — this is the single staleness gate
    - `writeJourney(flow, patch)` shallow-merges onto the current state, persists, returns the merged state
    - `resetJourney()` removes the key, guarded by `try/catch`
    - Keep the module pure of React and routing
    - Verify: `pnpm build` succeeds
    - _Requirements: 1.9, 6.9, 7.9, 14.11_

  - [x] 2.2 Add `advanceAadhaarSegment` and `resolveDisplayPan`
    - `advanceAadhaarSegment(flow)` increments `aadhaarSegmentIndex`, persists, returns the new index — called on segment exit, not entry, so flow 4's segment B resumes at index 1
    - `resolveDisplayPan(flow)` reads the flow's `ckycDetails.panSource` and returns `HRMS_EMPLOYEE.pan` for `'hrms'`, `ACCOUNT_RECORD_PAN` for `'account-record'`, the stored journey PAN for `'journey'`, and `''` for `'none'`
    - Verify: `pnpm build` succeeds
    - _Requirements: 4.2, 4.3, 6.9, 7.9, 11.7, 12.8, 13.9, 13.10_

- [x] 3. Build the bilingual content module (`src/app/flows/hrmsContent.ts`)
  - [x] 3.1 Declare `HrmsStrings` and the English values
    - Create `src/app/flows/hrmsContent.ts` with an `HrmsStrings` interface covering every visible string of the four new screens: headings, body paragraphs, field labels, option labels, control labels, placeholders, helper text, consent statements, data-protection statement, outcome messages and error messages
    - Include keys for the HRMS progress-step labels and the CKYC dedupe banner text used on the shared screens
    - Fill the `English` record
    - Verify: `pnpm build` succeeds
    - _Requirements: 15.1, 15.3, 15.4_

  - [x] 3.2 Add the Tamil values, the `satisfies` guard and `tr()`
    - Fill the `Tamil` record with the same keys and export `hrmsContent` with `satisfies Record<Language, HrmsStrings>` so a missing Tamil key is a compile error
    - Implement `tr(lang, key)` returning the English value when the requested value is empty or absent, never a blank region and never a lookup key
    - Import the `Language` type from the existing language module rather than redeclaring it
    - Verify: `pnpm build` succeeds; deliberately blank one Tamil value locally and confirm `tr` falls back, then restore it
    - _Requirements: 15.1, 15.2, 15.4, 15.6_

- [x] 4. Checkpoint - flow modules compile
  - Ensure `pnpm build` succeeds with the three `src/app/flows/` modules in place and no component yet importing them. Ask the user if questions arise.

- [x] 5. Build the four new screen components
  - [x] 5.1 Create `HRMSDetailsPage` at `src/app/components/HRMSDetailsPage.tsx`
    - Three phases via `type Phase = 'fetching' | 'review' | 'processing'`
    - `fetching`: render `hrmsProcessing(flow, 'hrms-fetch')` with a `Loader2` spinner plus label text and a `CheckCircle` plus text on completion, then auto-advance to `review`; clear the timer on unmount so a back press mid-fetch advances nothing and leaves `activeFlow` untouched
    - `review`: render name, 10-digit mobile and `DD/MM/YYYY` DOB as `<p>` text, never `<input>`; render the HRMS PAN for flows 1–2 and a blank value with the "not available in your HRMS record" label for flows 3–5; one consent checkbox unselected on first render whose text names PAN validation and CKYC download; visible data-protection statement requiring no interaction to reveal
    - Keep the CTA `disabled` with `aria-disabled` while consent is unselected and return early from the handler; enable it on selection
    - Validate the record on entering `review`; on empty name, mobile or DOB render a `role="alert"` message, keep the CTA disabled and offer a Retry control that returns to `fetching`
    - `processing`: entered only when the flow declares a `ckyc-pan-dedupe` step — render `hrmsProcessing(flow, 'ckyc-pan-dedupe')` then navigate to `hrmsNextRoute(flow, 'ckyc-pan-dedupe')`; flows 3–5 navigate straight to `hrmsNextRoute(flow, 'hrms-details')`
    - Persist `consentAccepted` through `writeJourney`; read all copy through `tr()` and `useLanguage()`
    - Apply the design's accessibility model: one `<h1>`, `<main>` wrapper, `h-12` CTA, `focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#315C9D]`, `useReducedMotion()` gating on entrance animations
    - Verify: `pnpm build` succeeds
    - _Requirements: 3.1, 3.3, 3.4, 3.5, 3.7, 3.8, 4.1, 4.2, 4.3, 4.4, 4.5, 4.6, 4.7, 4.8, 4.9, 4.10, 8.2, 9.2, 15.1, 15.5, 16.1, 16.2, 16.4, 16.6, 16.7, 16.8, 16.11, 16.13_

  - [x] 5.2 Create `AccountChoicePage` at `src/app/components/AccountChoicePage.tsx`
    - Two `<button role="radio">` options inside a `role="radiogroup"`, labelled "I have an IOB account" and "I don't have an IOB account", at most one selected
    - Mark the selected option with a `Check` icon plus the word "Selected" so state is not colour-only, visible without hover or focus
    - Persist the choice to `journey.accountChoice` on change so returning from a later screen restores the selection with the CTA enabled
    - CTA `disabled` while neither option is selected, with the handler returning early and leaving selection state untouched
    - Destinations from the `account-choice` step: `next` for `has-account`, `altNext` for `no-account` — never hardcoded in the component
    - Same accessibility model as 5.1
    - Verify: `pnpm build` succeeds
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6, 5.7, 5.8, 15.1, 15.5, 16.1, 16.2, 16.3, 16.4, 16.7, 16.8, 16.11_

  - [x] 5.3 Create `IOBAccountEntryPage` at `src/app/components/IOBAccountEntryPage.tsx`
    - Two phases via `type Phase = 'entry' | 'processing'`
    - `entry`: one labelled numeric input whose `onChange` sanitiser strips non-digits and slices to 18, retaining prior digits silently on rejection; always-visible helper text stating 9–18 digits; CTA enabled at ≥ 9 digits
    - Activating the CTA below 9 digits renders a `role="alert"` error linked by `aria-describedby`, performs no navigation and starts no retrieval
    - `processing`: render `hrmsProcessing(flow, 'account-pan-lookup')` with the input `readOnly` and the CTA disabled for the duration
    - Outcome text driven by `flow.accountRecordPan` only: flow 3 renders "PAN found in your account record" with a `CheckCircle`, writes the PAN to journey state with `panSource: 'account-record'`, and auto-advances to the step's `next`; flow 5 renders "No PAN is linked to this account. Aadhaar verification is required." with an `Info` icon, sets `panSource: 'none'`, and auto-advances to `/aadhaar-verification`
    - Persist `iobAccountNumber` so the customer is never returned for re-entry
    - Same accessibility model as 5.1
    - Verify: `pnpm build` succeeds
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 6.6, 6.7, 6.8, 6.9, 10.2, 10.3, 12.2, 14.3, 14.4, 15.1, 15.5, 16.1, 16.2, 16.5, 16.6, 16.8, 16.11_

  - [x] 5.4 Create `PANAadhaarEntryPage` at `src/app/components/PANAadhaarEntryPage.tsx`
    - PAN field: visible label with an optional marker, `maxLength=10`, uppercased on change, validated on blur against `/^[A-Z]{5}\d{4}[A-Z]$/`; an invalid non-empty value renders a `role="alert"` error naming the `AAAAA9999A` format, keeps the CTA disabled and retains the typed characters
    - Aadhaar field: visible label with a required marker, sanitiser dropping non-digits and digits past the 12th, masking reused from `AadhaarVerificationPage` (transparent input plus overlay, per-digit mask timer under 1000 ms) with previously entered digits staying masked
    - One Aadhaar consent checkbox whose text states the IOB identity-verification authorisation
    - CTA enabled only when Aadhaar length is 12 **and** consent is selected **and** PAN is empty or well-formed
    - On continue: write `aadhaarNumber`, `pan`, `panSource: pan ? 'user' : 'none'`, set `aadhaarSegmentIndex = 0`, navigate to `hrmsNextRoute(flow, 'pan-aadhaar-entry')`
    - Same accessibility model as 5.1
    - Verify: `pnpm build` succeeds
    - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5, 7.6, 7.7, 7.8, 7.9, 11.2, 15.1, 15.5, 16.1, 16.2, 16.5, 16.6, 16.8, 16.11_

- [x] 6. Register the new routes
  - [x] 6.1 Append the four HRMS routes to `src/app/routes.tsx`
    - Add `/hrms-details` → `HRMSDetailsPage`, `/hrms-account-choice` → `AccountChoicePage`, `/hrms-account-entry` → `IOBAccountEntryPage`, `/hrms-pan-aadhaar` → `PANAadhaarEntryPage` to the `children` array after `credit-line-dashboard`
    - Change no existing path and no existing path-to-component mapping
    - Verify: `pnpm build` succeeds; in Dev Preview set `activeFlow` to each HRMS id and open the four paths directly to confirm each renders
    - _Requirements: 1.6, 13.6_

- [x] 7. Checkpoint - new screens render in isolation
  - Ensure `pnpm build` succeeds and each of the four new routes renders and navigates onward correctly when reached by direct URL. Ask the user if questions arise.

- [x] 8. Apply the additive edits to existing components
  - [x] 8.1 Add the HRMS entry-point branch to `LandingPage`
    - Change the Get Started CTA to `navigate(hrmsEntryRoute(getActiveFlow()) ?? '/phone-input')`
    - Leave every other control on the screen unchanged
    - Verify: `pnpm build` succeeds; in Dev Preview confirm an existing flow still lands on `/phone-input` and an HRMS flow lands on `/hrms-details`
    - _Requirements: 3.1, 3.2, 3.6_

  - [x] 8.2 Add the HRMS branch to `OTPPage`
    - Compute `const hrmsNext = hrmsNextRoute(getActiveFlow(), 'ckyc-otp')` and branch on it **first** in `handleVerify`
    - In the HRMS branch accept any six-digit value without comparing to `'123456'`, show a `role="alert"` error and retain the entered digits when fewer than six digits are present, then navigate to `hrmsNext`
    - Render the CTA enabled in HRMS flows so the sub-six-digit path is reachable; leave the `disabled` prop, the `'123456'` comparison and the `/ckyc-consent` destination byte-for-byte unchanged for existing flows
    - Verify: `pnpm build` succeeds; walk an existing flow through OTP and confirm `'123456'`-only behaviour is intact
    - _Requirements: 1.2, 8.3, 8.8, 9.3, 9.4, 10.4, 10.8, 11.5, 11.6, 12.6, 12.7, 13.2, 16.6_

  - [x] 8.3 Add the HRMS config fallback, dedupe banner and PAN source to `CKYCCustomerDetailsPage`
    - Resolve config as `flowConfigs[flow] ?? getCkycDetailsConfig(flow) ?? flowConfigs['ntb-no-ckyc']` so existing keys hit the first lookup
    - Render the dedupe banner only when `config.dedupeResult` is present: "Existing bank customer record found" with a `CheckCircle` for `'etb'`, "No existing bank customer record found. Aadhaar verification is required." with an `Info` icon for `'ntb'`, visible without hover, focus or any interaction
    - Source the PAN row from `resolveDisplayPan(flow)` for HRMS flows, rendering an empty value with a "No PAN available" / "No PAN provided" label when the resolved value is empty; keep the value non-editable text
    - Let `config.next` continue to drive `handleContinue`; HRMS configs supply an empty `steps` array so no processing phase runs
    - Verify: `pnpm build` succeeds; confirm the eight existing flows render this screen with no banner and no HRMS text
    - _Requirements: 1.8, 8.4, 8.9, 9.5, 9.6, 10.5, 10.6, 10.9, 11.7, 11.8, 12.8, 12.9, 13.1, 13.7_

  - [x] 8.4 Refactor `AadhaarVerificationPage` to a data-driven step sequence
    - Extract `DEFAULT_SEQUENCE` as the current linear order: `aadhaar-input`, `aadhaar-otp`, `confirm-details`, `face-verification-ready`, `blink`, `scanning`, `verifying`, `verified`, `updating-records`, `success`
    - Add `goNext()` that advances one position in the active sequence and calls `exitSegment()` when exhausted; replace every forward `setStep('<literal>')` with `goNext()`
    - Keep backward jumps literal: the `blink` and `scanning` back buttons keep `setStep('face-verification-ready')` and "Not Me" keeps `navigate(-1)`
    - `exitSegment()` retains the existing destination map unchanged — `/employee-id-upload` for `ntb-no-ckyc-id` and `ntb-knows-ckyc-id`, `/loading` otherwise
    - This step is behaviour-preserving: no HRMS code yet
    - Verify: `pnpm build` succeeds; walk `ntb-no-ckyc`, `ntb-no-ckyc-id` and `etb-no-ckyc` through the full Aadhaar screen in Dev Preview and confirm the step order and both destinations are unchanged
    - _Requirements: 1.1, 1.2, 13.8_

  - [x] 8.5 Add the HRMS segment mechanism to `AadhaarVerificationPage`
    - Select the segment with `getAadhaarSegment(flow, readJourney(flow).aadhaarSegmentIndex)` and use `segment?.steps ?? DEFAULT_SEQUENCE` as the active sequence, so `segment` is `null` and the sequence is the default for all eight existing flows
    - On exit with a segment present, call `advanceAadhaarSegment(flow)` then `navigate(segment.exitRoute)`
    - Add the HRMS-only internal step `ckyc-retrieval` rendering `segment.processing` with icon-plus-text state, then `goNext()`; it appears in no default sequence
    - When `segment.seedAadhaarFromJourney` is true, initialise `aadhaarDigits` from `journey.aadhaarNumber` and derive the masked display on the OTP and confirm screens from it, so no re-entry is requested
    - When `segment.updatingRecordsAs === 'cif'`, swap the `updating-records` heading to the CIF creation copy and use the `cif-create` processing step
    - In HRMS segments, the `blink` / `scanning` cancel path renders a `role="alert"` "face authentication was not completed" message plus a Try again control, retains the seeded Aadhaar and confirmed details, and does not call `goNext()`
    - Verify: `pnpm build` succeeds; confirm flow 4 segment 0 opens on `aadhaar-otp` with the Aadhaar pre-seeded, segment 1 opens on `face-verification-ready` with no second OTP, and flow 5 renders no Face RD step
    - _Requirements: 9.7, 9.8, 9.9, 11.3, 11.4, 11.9, 11.10, 12.3, 12.4, 12.5, 13.3, 13.8, 13.9, 13.10, 16.6_

- [x] 9. Wire the Dev Preview panel
  - [x] 9.1 Replace the flow-entry branch chain with a lookup table in `DevPreview`
    - Add `FLOW_ENTRY_PATHS` mapping every existing `/__flow-*` path to its flow id, including the legacy `ckyc-only` and `combined` keys, spread with `HRMS_FLOW_IDS.map(id => ['/__flow-' + id, id])`
    - On a matched path: write `activeFlow` inside `try/catch`, call `resetJourney()`, `navigate('/')`, close the panel
    - On a storage failure: set a `role="alert"` error, keep the panel open, perform no navigation, leave the previous `activeFlow` in place
    - Leave the existing per-screen state-seeding branches unchanged
    - Verify: `pnpm build` succeeds; confirm all eight existing flow entries still select correctly
    - _Requirements: 1.3, 1.4, 1.9, 2.4, 2.7, 14.11_

  - [x] 9.2 Append the five HRMS journey entries to the Dev Preview route list
    - Insert the five entries in `HRMS_FLOW_IDS` order immediately after `/__flow-etb-knows-ckyc-id` and before the `/` Dashboard entry, so they occupy positions 9–13
    - Use the names and descriptions from the design's Dev Preview table: name 1–60 chars and unique, description 1–200 chars listing the screen names in presentation order, rendered without hover or focus
    - Add `focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#315C9D]` to the entry `motion.button` so keyboard focus is visible, and confirm Tab / Shift+Tab order matches display order and Enter / Space activate
    - Change no existing entry name, description, path or position
    - Verify: `pnpm build` succeeds; open Dev Preview and confirm 13 journey entries in the expected order
    - _Requirements: 1.3, 1.4, 2.1, 2.2, 2.3, 2.5, 2.6_

- [ ] 10. Final integration and verification
  - [ ] 10.1 Walk the five HRMS flows end to end in Dev Preview and fix any defect found
    - For each flow, select it from Dev Preview, start from Get Started on `/advances-upi`, and confirm the screen sequence matches that flow's step table exactly with no extra and no missing screen
    - Confirm the per-flow exclusions: no Account Choice / Account Entry / PAN+Aadhaar / Aadhaar / Face RD / CIF screen in flow 1; no PAN+Aadhaar, Aadhaar, Face RD or CIF in flow 3; no Account Entry in flow 4; no Face RD or CIF in flow 5
    - Confirm each flow terminates at `/sanctioned-offers` and that offer selection and activation continue unchanged from there
    - Repeat one flow five consecutive times and confirm identical screens and identical simulated outcomes
    - Switch the language mid-screen on each new screen and confirm the copy re-renders in Tamil with entered values, option selections and consent selections retained and no navigation
    - Check reflow at 320 px width and 400 % zoom on the four new screens
    - _Requirements: 8.1, 9.1, 10.1, 11.1, 12.1, 14.8, 14.10, 15.2, 15.7, 16.12_

  - [ ] 10.2 Spot-check the eight existing flows for non-regression and fix any deviation
    - Walk `ntb-no-ckyc`, `etb-no-ckyc`, `ntb-no-ckyc-id`, `etb-no-ckyc-id`, `ntb-knows-ckyc`, `etb-knows-ckyc`, `ntb-knows-ckyc-id` and `etb-knows-ckyc-id` through their full sequences against the expected-sequence table in design.md
    - Confirm no HRMS screen, HRMS field, dedupe banner or HRMS progress label appears anywhere in these flows
    - Confirm the default `activeFlow` is still `ntb-no-ckyc` when the key is absent, and that switching from an HRMS flow to an existing flow shows no value captured during the HRMS run
    - Confirm `pnpm build` succeeds on the complete change set
    - _Requirements: 1.1, 1.2, 1.5, 1.6, 1.7, 1.8, 1.9_

## Notes

- No task installs test tooling and no task writes automated tests: the user has scoped automated tests out of this plan. Verification is `pnpm build` succeeding plus the manual Dev Preview checks named in each task. Because there is no root `tsconfig.json` or `tsc` script, watch the editor's TypeScript diagnostics alongside the build.
- No sub-task is marked optional (`*`) for the same reason — every task in this plan is core implementation.
- Tasks 8.1 through 8.5 are deliberately one-component-per-task so a regression in any existing flow can be traced to a single edit.
- Task 8.4 is behaviour-preserving by design and must be verified against existing flows before 8.5 adds HRMS behaviour on top of it.
- Every route string, type name, function name, step id and duration comes from design.md; if an implementation detail seems to need changing, update design.md rather than diverging silently.

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["1.1", "3.1"] },
    { "id": 1, "tasks": ["1.2", "3.2"] },
    { "id": 2, "tasks": ["1.3"] },
    { "id": 3, "tasks": ["1.4"] },
    { "id": 4, "tasks": ["2.1"] },
    { "id": 5, "tasks": ["2.2"] },
    { "id": 6, "tasks": ["5.1", "5.2", "5.3", "5.4"] },
    { "id": 7, "tasks": ["6.1", "8.1", "8.2", "8.3", "8.4", "9.1"] },
    { "id": 8, "tasks": ["8.5", "9.2"] },
    { "id": 9, "tasks": ["10.1", "10.2"] }
  ]
}
```
