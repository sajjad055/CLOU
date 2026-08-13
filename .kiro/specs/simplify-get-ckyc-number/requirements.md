# Requirements Document

## Introduction

This feature simplifies the "Get CKYC number" experience on the CKYC Verification page
(`src/app/components/CKYCConsentPage.tsx`). Today, users who do not know their CKYC number
see a small "Get CKYC number / Know more" helper that opens a bottom sheet
(`showCkycHelpSheet`) containing a "Give a missed call" call-to-action, the registered
mobile number, and the toll-free number.

The bottom sheet adds friction and visual weight. This change removes the bottom sheet and
its missed-call CTA entirely and replaces the helper with a single, lightweight inline
message directly on the CKYC page. The message tells the user to give a missed call from
their registered mobile number to receive their CKYC number, and displays the toll-free
number as a tap-to-call link that opens the device phone app with the number pre-filled.

The message must be available in both supported languages (English and Tamil) and must meet
the workspace desktop accessibility baseline (WCAG 2.1 AA) for the tap-to-call link.

## Glossary

- **CKYC_Page**: The CKYC Verification screen rendered by `CKYCConsentPage.tsx`, specifically the `ckyc-info` step.
- **Missed_Call_Message**: The new inline, lightweight text block on the CKYC_Page that instructs the user how to obtain their CKYC number.
- **Tollfree_Link**: The interactive element displaying the CKYC toll-free number (`CKYC_TOLLFREE`, value `1800 123 4567`) that initiates a phone call when activated.
- **CKYC_TOLLFREE**: The existing constant holding the toll-free number string used for the tap-to-call action.
- **Help_Sheet**: The existing bottom sheet controlled by the `showCkycHelpSheet` state and rendered inside the `AnimatePresence` block, including the "Give a missed call" CTA, registered mobile number, and toll-free content.
- **Selected_Language**: The active UI language from the `useLanguage` hook, either `English` or `Tamil`.
- **Registered_Mobile_Number**: The user's mobile number registered with the bank, referenced in the message text (not a dialable link).

## Requirements

### Requirement 1: Remove the missed-call bottom sheet

**User Story:** As a user on the CKYC Verification page, I want a simpler experience without an extra bottom sheet, so that I can understand how to get my CKYC number without opening additional screens.

#### Acceptance Criteria

1. WHEN the CKYC_Page is rendered, THE CKYC_Page SHALL display no DOM node, overlay, or visible element belonging to the Help_Sheet.
2. THE CKYC_Page SHALL NOT declare the `showCkycHelpSheet` state, and SHALL NOT contain the `AnimatePresence` block that conditionally renders the Help_Sheet.
3. WHEN the CKYC_Page is rendered, THE CKYC_Page SHALL display no "Give a missed call" call-to-action element.
4. WHEN the CKYC_Page is rendered, THE CKYC_Page SHALL display no "Know more" control that opens the Help_Sheet, and SHALL provide no interactive element whose activation sets `showCkycHelpSheet` to true or triggers the Help_Sheet.
5. WHERE a code symbol (state variable, event handler, or import such as `PhoneCall` or `AnimatePresence`) has zero remaining references after the Help_Sheet is removed, THE CKYC_Page SHALL exclude that unused symbol so that the module compiles with no unused-symbol warnings.
6. THE CKYC_Page SHALL preserve all pre-existing content and controls that are unrelated to the Help_Sheet, exposing the same non-Help_Sheet functionality as before the removal.

### Requirement 2: Display an inline missed-call message on the CKYC page

**User Story:** As a user who does not know my CKYC number, I want a short instruction on the CKYC page itself, so that I immediately understand I can give a missed call to get my CKYC number.

#### Acceptance Criteria

1. WHEN the CKYC_Page renders the `ckyc-info` step, THE CKYC_Page SHALL display the Missed_Call_Message inline within the `ckyc-info` step without opening a bottom sheet.
2. THE Missed_Call_Message SHALL state that the user should give a missed call from the Registered_Mobile_Number to get their CKYC number.
3. THE Missed_Call_Message SHALL limit its visible text to a maximum of 160 characters and SHALL contain only the missed-call instruction and the Tollfree_Link, with no additional descriptive content.
4. THE Missed_Call_Message SHALL display the Tollfree_Link showing the value of CKYC_TOLLFREE.
5. IF the value of CKYC_TOLLFREE is unavailable, THEN THE CKYC_Page SHALL display the Missed_Call_Message instruction text without the Tollfree_Link and SHALL NOT display an empty or placeholder link.

### Requirement 3: Tap-to-call the toll-free number

**User Story:** As a user, I want to tap the toll-free number to call it, so that I can place the missed call without manually dialing.

#### Acceptance Criteria

1. WHEN the user activates the Tollfree_Link by tapping it (pointer/touch) or by focusing it and pressing Enter, THE CKYC_Page SHALL open the device's default phone application with the dialable digits of CKYC_TOLLFREE pre-filled in the dialer field.
2. THE Tollfree_Link SHALL use a `tel:` URI whose number is derived from CKYC_TOLLFREE with all whitespace characters removed, so that the resulting value contains only dialable digits (e.g., CKYC_TOLLFREE `1800 123 4567` yields `tel:18001234567`).
3. THE Tollfree_Link SHALL be implemented as a semantic anchor (`<a>`) element that is reachable and operable via keyboard (Tab to focus, Enter to activate).
4. THE Tollfree_Link SHALL expose an accessible name that conveys the call action (text label and/or `aria-label`), SHALL present an interactive target of at least 44x44 CSS pixels, and SHALL display a visible focus indicator with a contrast ratio of at least 3:1 against its background when focused.

### Requirement 4: Bilingual message content

**User Story:** As a user who reads English or Tamil, I want the missed-call message in my selected language, so that I can understand the instruction.

#### Acceptance Criteria

1. WHILE Selected_Language is `English`, THE CKYC_Page SHALL display all translatable text of the Missed_Call_Message in English, excluding acronyms and numerals.
2. WHILE Selected_Language is `Tamil`, THE CKYC_Page SHALL display all translatable text of the Missed_Call_Message in Tamil script, excluding acronyms and numerals.
3. THE CKYC_Page SHALL display the value of CKYC_TOLLFREE with identical digits, grouping, and spacing using Western Arabic numerals in both languages.
4. IF Selected_Language is undefined or unsupported, THEN THE CKYC_Page SHALL display the Missed_Call_Message in English.
5. WHEN Selected_Language changes, THE CKYC_Page SHALL update the Missed_Call_Message to the newly selected language within 1 second, with no residual text from the prior language.

### Requirement 5: Accessibility of the tap-to-call link (WCAG 2.1 AA)

**User Story:** As a user relying on a keyboard, screen reader, or larger viewport, I want the toll-free link to be accessible, so that I can perceive and operate it.

#### Acceptance Criteria

1. THE Tollfree_Link SHALL expose an accessible name that identifies it as the toll-free number to call and includes the toll-free number digits.
2. THE Tollfree_Link SHALL be reachable via Tab and Shift+Tab in a DOM order matching its visual order, and SHALL be operable by pressing the Enter key.
3. WHEN the Tollfree_Link receives keyboard focus, THE CKYC_Page SHALL display a visible focus indicator rendered as an outline of at least 2 pixels width with at least 2 pixels offset using the color `#315C9D`, and the indicator SHALL maintain a contrast ratio of at least 3:1 against its adjacent background.
4. WHILE the Tollfree_Link is rendered, THE Tollfree_Link SHALL present a pointer target of at least 24x24 CSS pixels.
5. THE Tollfree_Link SHALL convey its interactivity through a persistent text cue in addition to color, such that the interactive nature is identifiable when color information is unavailable.
6. THE Missed_Call_Message text SHALL maintain a contrast ratio of at least 4.5:1 against its background.
7. IF the user has enabled the reduced-motion preference, THEN THE CKYC_Page SHALL render the Tollfree_Link and its focus indicator without non-essential motion or animation.

### Requirement 6: Preserve existing CKYC page behavior

**User Story:** As a user progressing through CKYC verification, I want the rest of the CKYC page to keep working, so that removing the bottom sheet does not break my flow.

#### Acceptance Criteria

1. THE CKYC_Page SHALL present the "I know my CKYC number" and "I don't know my CKYC number" options as mutually exclusive selections, with exactly one selected at any time and the default selection determined by the active flow.
2. WHILE the "I know my CKYC number" option is selected, THE CKYC_Page SHALL keep the continue action disabled until the user both enters a CKYC number of at least 4 characters and checks the consent checkbox, and SHALL enable the continue action once both conditions are met.
3. WHEN the user confirms with the "I know my CKYC number" option selected, THE CKYC_Page SHALL advance to the consent-OTP step and start a 30-second resend countdown.
4. WHILE on the consent-OTP step, THE CKYC_Page SHALL keep the verify action disabled until exactly 6 OTP digits are entered, and SHALL display a "Resend OTP" action only after the 30-second countdown reaches zero.
5. WHEN the OTP is successfully verified, THE CKYC_Page SHALL display the processing step showing sequential progress through each processing item and, upon completion of all items, SHALL navigate to the CKYC customer details review.
6. WHEN the user selects "I don't know my CKYC number" and continues, THE CKYC_Page SHALL navigate to the PAN verification route mapped to the active flow, and SHALL fall back to the default PAN verification route when the active flow has no mapped route.
