# Requirements Document

## Introduction

The Kalanjiyam salary-advance prototype currently ships eight selectable demo journeys, each chosen from the Dev Preview panel and stored as a single string in browser local storage under the key `activeFlow`. This feature adds five new HRMS-originated journeys that begin when the customer opens the salary-advance journey, fetch employee details from an HRMS source, and then branch on two conditions: whether HRMS returned a PAN, and whether the customer is an existing bank customer.

The five new journeys are additive. All eight existing journeys, their Dev Preview entries, their screens and their routing decisions remain unchanged. The new journeys reuse existing screens (OTP entry, CKYC details review, Aadhaar plus Face RD verification, CIF creation success, sanctioned offers) and add four new screens (HRMS details review with consent, IOB account choice, IOB account number entry, and a combined optional-PAN plus mandatory-Aadhaar entry screen).

There is no backend. Every "backend" outcome in this prototype is simulated with timed processing steps and fixed dummy data, and every simulated outcome is determined solely by the selected flow.

## Glossary

- **Kalanjiyam_App**: The React single-page application in `src/app` that renders all journeys.
- **Flow_Selector**: The Dev Preview panel component (`src/app/components/DevPreview.tsx`) that lists selectable routes and journeys.
- **Active_Flow**: The single string value stored in browser local storage under the key `activeFlow` that identifies the currently selected journey.
- **Existing_Flow**: Any one of the eight Active_Flow values that exist before this feature: `ntb-no-ckyc`, `etb-no-ckyc`, `ntb-no-ckyc-id`, `etb-no-ckyc-id`, `ntb-knows-ckyc`, `etb-knows-ckyc`, `ntb-knows-ckyc-id`, `etb-knows-ckyc-id`.
- **HRMS_Flow**: Any one of the five Active_Flow values added by this feature: `hrms-pan-etb`, `hrms-pan-ntb`, `hrms-nopan-etb`, `hrms-nopan-ntb`, `hrms-nopan-etb-nopan`.
- **HRMS**: The Human Resource Management System of the employer, simulated in this prototype as a fixed dummy employee record.
- **HRMS_Details_Screen**: The new screen that displays the fetched HRMS employee record (name, mobile number, date of birth, PAN) and collects consent for PAN validation and CKYC download.
- **Account_Choice_Screen**: The new screen that asks the customer to choose between "I have an IOB account" and "I don't have an IOB account".
- **IOB_Account_Entry_Screen**: The new screen on which the customer enters an IOB account number.
- **PAN_Aadhaar_Entry_Screen**: The new screen that offers an optional PAN field and a mandatory Aadhaar number field on a single screen.
- **OTP_Screen**: The existing six-digit one-time-password entry user interface pattern already used by `OTPPage`, `CKYCConsentPage` and `AadhaarVerificationPage`.
- **CKYC_Details_Screen**: The existing customer details review screen rendered by `CKYCCustomerDetailsPage` at route `/ckyc-customer-details`.
- **Aadhaar_Verification_Screen**: The existing screen rendered by `AadhaarVerificationPage` at route `/aadhaar-verification`, covering Aadhaar number entry, Aadhaar consent, Aadhaar OTP verification, Aadhaar details confirmation and Face RD capture.
- **Face_RD**: The simulated government face-authentication step contained in Aadhaar_Verification_Screen.
- **CIF**: Customer Information File, the bank customer record created for a customer who is new to the bank.
- **CIF_Success_Screen**: The existing success confirmation user interface used to report successful CIF creation, rendered by `LoadingPage` at route `/loading` followed by `SuccessSplashPage` at route `/success`.
- **Sanctioned_Offers_Screen**: The existing screen rendered by `SanctionedOffersPage` at route `/sanctioned-offers` on which the customer selects salary advances and continues.
- **Simulated_Backend**: The timer-driven processing-step mechanism used across the prototype to represent server-side work, with fixed dummy results.
- **Dedupe_Check**: The Simulated_Backend step that determines whether the customer already exists in the bank records.
- **ETB**: Existing To Bank. The Dedupe_Check outcome indicating the customer already holds a bank relationship.
- **NTB**: New To Bank. The Dedupe_Check outcome indicating the customer holds no bank relationship.
- **Language_Selection**: The value returned by the existing `useLanguage` hook, which is either `English` or `Tamil`.
- **Focus_Indicator**: A visible keyboard focus outline rendered in the color `#315C9D` with a minimum thickness of 2 CSS pixels and a minimum offset of 2 CSS pixels.

## Requirements

### Requirement 1: Preservation of Existing Journeys

**User Story:** As a demo owner, I want the eight existing journeys to behave exactly as they do today, so that previously approved demonstrations continue to run without change.

#### Acceptance Criteria

1. WHERE the Active_Flow value is an Existing_Flow, THE Kalanjiyam_App SHALL present the same ordered sequence of screens that the Kalanjiyam_App build immediately preceding this feature presents for that Existing_Flow, inserting no screen, removing no screen and reordering no screen.
2. WHERE the Active_Flow value is an Existing_Flow, WHEN the customer performs the same input on a given screen, THE Kalanjiyam_App SHALL navigate to the same destination that the Kalanjiyam_App build immediately preceding this feature navigates to for that screen and that input.
3. THE Flow_Selector SHALL list the eight Existing_Flow entries at positions 1 through 8 with the paths `/__flow-ntb-no-ckyc`, `/__flow-etb-no-ckyc`, `/__flow-ntb-no-ckyc-id`, `/__flow-etb-no-ckyc-id`, `/__flow-ntb-knows-ckyc`, `/__flow-etb-knows-ckyc`, `/__flow-ntb-knows-ckyc-id` and `/__flow-etb-knows-ckyc-id`, each retaining the name and description used by the Kalanjiyam_App build immediately preceding this feature.
4. THE Flow_Selector SHALL list the existing individual screen entries with the same count, the same paths, the same names, the same descriptions and the same relative ordering used by the Kalanjiyam_App build immediately preceding this feature.
5. WHEN the Kalanjiyam_App starts and no `activeFlow` value exists in browser local storage, THE Kalanjiyam_App SHALL store the value `ntb-no-ckyc` as the Active_Flow; WHEN the Kalanjiyam_App starts and the `activeFlow` value is an Existing_Flow, THE Kalanjiyam_App SHALL leave that value unchanged.
6. THE Kalanjiyam_App SHALL retain every route path and every screen component registered in `src/app/routes.tsx` by the Kalanjiyam_App build immediately preceding this feature, mapping each retained path to the same screen component.
7. WHERE the Active_Flow value is an Existing_Flow, THE Kalanjiyam_App SHALL present no HRMS_Details_Screen, no Account_Choice_Screen, no IOB_Account_Entry_Screen, no PAN_Aadhaar_Entry_Screen and no HRMS fetch step at any point in the journey.
8. WHERE the Active_Flow value is an Existing_Flow, THE Kalanjiyam_App SHALL render every screen shared with an HRMS_Flow without any HRMS-specific field, label or progress-step text.
9. WHEN the Active_Flow value changes from an HRMS_Flow to an Existing_Flow, THE Kalanjiyam_App SHALL discard every value captured during the HRMS_Flow and SHALL present no such value on any screen of the Existing_Flow.

### Requirement 2: Dev Preview Entries for the New Journeys

**User Story:** As a reviewer, I want each new journey to be individually selectable from the Dev Preview panel, so that I can demonstrate one journey at a time without editing code.

#### Acceptance Criteria

1. THE Flow_Selector SHALL list exactly five additional journey entries, one for each HRMS_Flow, with the distinct paths `/__flow-hrms-pan-etb`, `/__flow-hrms-pan-ntb`, `/__flow-hrms-nopan-etb`, `/__flow-hrms-nopan-ntb` and `/__flow-hrms-nopan-etb-nopan`, and SHALL list all five entries irrespective of the current Active_Flow value.
2. THE Flow_Selector SHALL display for each of the five additional journey entries a name of 1 to 60 characters that is unique among all Flow_Selector entry names and that states both whether HRMS returns a PAN and whether the customer is ETB or NTB, and for the entry with the path `/__flow-hrms-nopan-etb-nopan` SHALL additionally state that the IOB account record holds no PAN.
3. THE Flow_Selector SHALL display for each of the five additional journey entries a description of 1 to 200 characters that lists the screen names of that journey in the order in which the Kalanjiyam_App presents them, visible without hover and without keyboard focus.
4. WHEN a reviewer activates one of the five additional journey entries by pointer, or by pressing Enter or Space while that entry holds keyboard focus, THE Flow_Selector SHALL replace any existing Active_Flow value with the corresponding HRMS_Flow value, navigate to the route `/`, and close the Dev Preview panel, completing all three actions within 500 milliseconds of the activation.
5. THE Flow_Selector SHALL place the five additional journey entries in the order listed in criterion 1, immediately after the eight Existing_Flow entries and before the individual screen entries.
6. THE Flow_Selector SHALL make each of the five additional journey entries reachable by Tab and Shift+Tab in the same order in which the entries are displayed, and SHALL render a Focus_Indicator on the entry that holds keyboard focus.
7. IF the corresponding HRMS_Flow value cannot be stored as the Active_Flow when a reviewer activates one of the five additional journey entries, THEN THE Flow_Selector SHALL retain the previous Active_Flow value, perform no navigation, keep the Dev Preview panel open, and display an error message indicating that the journey could not be selected.

### Requirement 3: HRMS Journey Entry Point

**User Story:** As a customer, I want the salary-advance journey to start by fetching my employer records, so that I do not re-enter details my employer already holds.

#### Acceptance Criteria

1. WHERE the Active_Flow value is an HRMS_Flow, WHEN the customer activates the journey start control on the Advances on UPI landing screen at route `/advances-upi`, THE Kalanjiyam_App SHALL display the HRMS fetch step within 500 milliseconds.
2. WHERE the Active_Flow value is an Existing_Flow, WHEN the customer activates the journey start control on the Advances on UPI landing screen, THE Kalanjiyam_App SHALL navigate to the route `/phone-input`.
3. WHILE the HRMS fetch step is displayed, THE Simulated_Backend SHALL show a progress step whose visible text states that employee details are being fetched from HRMS, and SHALL indicate the step state through text or an icon in addition to color.
4. WHEN the HRMS fetch step has been displayed for its full duration, THE Kalanjiyam_App SHALL navigate to the HRMS_Details_Screen within 500 milliseconds and without requiring any customer input.
5. THE Kalanjiyam_App SHALL keep the HRMS fetch step displayed for a duration of at least 1500 milliseconds and at most 4000 milliseconds, measured from the first display of the fetch step to the start of navigation to the HRMS_Details_Screen.
6. IF the `activeFlow` value in browser local storage is absent or is not one of the eight Existing_Flow values or the five HRMS_Flow values, THEN THE Kalanjiyam_App SHALL navigate to the route `/phone-input` when the customer activates the journey start control.
7. WHERE the Active_Flow value is an HRMS_Flow, THE Simulated_Backend SHALL return the same fixed dummy employee record on every run of the HRMS fetch step and SHALL present no failure state and no retry control for that step.
8. IF the customer navigates back while the HRMS fetch step is displayed, THEN THE Kalanjiyam_App SHALL retain the Active_Flow value and SHALL NOT navigate to the HRMS_Details_Screen.

### Requirement 4: HRMS Details Review and Consent

**User Story:** As a customer, I want to review the details fetched from my employer and give explicit consent, so that I control the PAN validation and CKYC download performed on my behalf.

#### Acceptance Criteria

1. THE HRMS_Details_Screen SHALL display the fetched employee name, a 10-digit mobile number and a date of birth in two-digit day, two-digit month and four-digit year order, and SHALL render each of these three values as non-editable text that the customer cannot change through typing, pasting or selection.
2. WHERE the Active_Flow value is `hrms-pan-etb` or `hrms-pan-ntb`, THE HRMS_Details_Screen SHALL display a non-editable PAN value of exactly 10 characters in the format of five uppercase letters followed by four digits followed by one uppercase letter.
3. WHERE the Active_Flow value is `hrms-nopan-etb`, `hrms-nopan-ntb` or `hrms-nopan-etb-nopan`, THE HRMS_Details_Screen SHALL display the PAN field with an empty value and a visible text label stating that the PAN is not available in the HRMS record.
4. WHEN the HRMS_Details_Screen is first displayed, THE HRMS_Details_Screen SHALL display a single consent control in the unselected state whose text states that the customer authorises Indian Overseas Bank to validate the PAN and to download the CKYC record.
5. WHILE the consent control is unselected, THE HRMS_Details_Screen SHALL keep the continue control disabled and SHALL perform no navigation when the continue control is activated.
6. WHERE the Active_Flow value is `hrms-pan-etb` or `hrms-pan-ntb`, WHEN the consent control is selected and the customer activates the continue control, THE Kalanjiyam_App SHALL navigate to the CKYC identifier retrieval and PAN Dedupe_Check step.
7. THE HRMS_Details_Screen SHALL display a data-protection statement declaring that the fetched details are used only for this credit application, without requiring any customer interaction to reveal it.
8. WHERE the Active_Flow value is `hrms-nopan-etb`, `hrms-nopan-ntb` or `hrms-nopan-etb-nopan`, WHEN the consent control is selected and the customer activates the continue control, THE Kalanjiyam_App SHALL navigate to the Account_Choice_Screen.
9. WHEN the customer selects the consent control, THE HRMS_Details_Screen SHALL enable the continue control within 500 milliseconds.
10. IF the fetched HRMS employee record has an empty employee name, an empty mobile number or an empty date of birth, THEN THE HRMS_Details_Screen SHALL display an error message indicating that the employee details could not be retrieved from HRMS, keep the continue control disabled, and offer a control that repeats the HRMS fetch step.

### Requirement 5: IOB Account Choice Screen

**User Story:** As a customer whose PAN is missing from the employer record, I want to state whether I hold an IOB account, so that the journey asks me only for the details it needs.

#### Acceptance Criteria

1. THE Account_Choice_Screen SHALL display exactly two options, labelled "I have an IOB account" and "I don't have an IOB account", of which at most one is selected at any time.
2. WHEN the customer selects one option while the other option is selected, THE Account_Choice_Screen SHALL deselect the other option and reflect the new selection within 300 milliseconds.
3. WHERE the Active_Flow value is `hrms-nopan-etb`, `hrms-nopan-ntb` or `hrms-nopan-etb-nopan`, WHEN the customer selects "I have an IOB account" and activates the continue control, THE Kalanjiyam_App SHALL navigate to the IOB_Account_Entry_Screen.
4. WHERE the Active_Flow value is `hrms-nopan-etb`, `hrms-nopan-ntb` or `hrms-nopan-etb-nopan`, WHEN the customer selects "I don't have an IOB account" and activates the continue control, THE Kalanjiyam_App SHALL navigate to the PAN_Aadhaar_Entry_Screen.
5. WHILE neither option is selected, THE Account_Choice_Screen SHALL keep the continue control disabled such that pointer activation and keyboard activation of that control cause no navigation and no change to the selection state.
6. THE Account_Choice_Screen SHALL mark the selected option with a text marker or an icon marker, in addition to any color change, and SHALL keep that marker visible without hover and without keyboard focus.
7. WHEN the Account_Choice_Screen is displayed for the first time in a journey, THE Account_Choice_Screen SHALL display both options unselected and the continue control disabled.
8. WHEN the customer returns to the Account_Choice_Screen from a later screen of the same journey, THE Account_Choice_Screen SHALL display the option that was selected before leaving the screen as selected and SHALL keep the continue control enabled.
9. WHERE the Active_Flow value is not `hrms-nopan-etb`, `hrms-nopan-ntb` or `hrms-nopan-etb-nopan`, THE Kalanjiyam_App SHALL present no Account_Choice_Screen at any point in the journey.

### Requirement 6: IOB Account Number Entry

**User Story:** As an existing IOB customer, I want to enter my account number, so that the bank can retrieve the PAN it already holds for me.

#### Acceptance Criteria

1. THE IOB_Account_Entry_Screen SHALL display one labelled numeric input field for the IOB account number that accepts a maximum of 18 digits and ignores every additional digit entered after the 18th digit.
2. WHILE the entered IOB account number contains fewer than 9 digits, THE IOB_Account_Entry_Screen SHALL keep the continue control disabled and display helper text stating that the account number must contain 9 to 18 digits.
3. IF the customer enters a non-digit character in the IOB account number field, THEN THE IOB_Account_Entry_Screen SHALL reject that character, retain the previously entered digits unchanged, and keep the customer on the IOB_Account_Entry_Screen.
4. IF the customer activates the continue control while the entered IOB account number contains fewer than 9 digits, THEN THE Kalanjiyam_App SHALL remain on the IOB_Account_Entry_Screen, start no account record retrieval step, and display an error message stating that the account number must contain 9 to 18 digits.
5. WHEN the customer activates the continue control with an IOB account number of 9 to 18 digits, THE Simulated_Backend SHALL show a labelled progress step stating that the account record is being retrieved for a duration between 1000 milliseconds and 2500 milliseconds.
6. WHILE the account record retrieval step is displayed, THE IOB_Account_Entry_Screen SHALL keep the continue control disabled and SHALL accept no change to the entered IOB account number.
7. WHERE the Active_Flow value is `hrms-nopan-etb`, WHEN the account record retrieval step completes, THE Kalanjiyam_App SHALL display a visible text message stating that a PAN was found in the account record and SHALL then navigate to the CKYC verification step of the `hrms-nopan-etb` journey without requiring any further customer input.
8. WHERE the Active_Flow value is `hrms-nopan-etb-nopan`, WHEN the account record retrieval step completes, THE Kalanjiyam_App SHALL display a visible text message stating that no PAN is present in the account record and that Aadhaar verification is required, and SHALL then navigate to the Aadhaar number entry step of the `hrms-nopan-etb-nopan` journey.
9. WHEN the account record retrieval step completes, THE Kalanjiyam_App SHALL retain the entered IOB account number for the remainder of the journey and SHALL not return the customer to the IOB_Account_Entry_Screen for re-entry.

### Requirement 7: Combined Optional PAN and Mandatory Aadhaar Entry

**User Story:** As a customer with no IOB account, I want to enter my Aadhaar number and optionally my PAN on one screen, so that I complete identity capture in a single step.

#### Acceptance Criteria

1. THE PAN_Aadhaar_Entry_Screen SHALL display one PAN input field with a visible label and a visible optional marker that accepts at most 10 characters, and one Aadhaar input field with a visible label and a visible required marker that accepts at most 12 digits.
2. WHILE the Aadhaar field contains fewer than 12 digits, THE PAN_Aadhaar_Entry_Screen SHALL keep the continue control disabled.
3. WHILE the Aadhaar field contains exactly 12 digits, the Aadhaar consent statement is accepted, and the PAN field is either empty or contains a value matching five uppercase letters followed by four digits followed by one uppercase letter, THE PAN_Aadhaar_Entry_Screen SHALL enable the continue control.
4. IF the PAN field contains a non-empty value that does not match five uppercase letters followed by four digits followed by one uppercase letter, THEN THE PAN_Aadhaar_Entry_Screen SHALL display an error message identifying the required PAN format within 500 milliseconds of the PAN field losing focus, keep the continue control disabled, and retain the entered PAN characters.
5. WHEN the customer enters a digit in the Aadhaar field, THE PAN_Aadhaar_Entry_Screen SHALL replace that digit with a mask character within 1000 milliseconds of entry and SHALL keep every previously entered digit masked.
6. THE PAN_Aadhaar_Entry_Screen SHALL display an Aadhaar consent statement together with a single acceptance control whose text states that the customer authorises Indian Overseas Bank to use the Aadhaar number for identity verification.
7. WHILE the Aadhaar consent acceptance control is unselected, THE PAN_Aadhaar_Entry_Screen SHALL keep the continue control disabled.
8. IF the customer enters a non-digit character in the Aadhaar field or a digit beyond the twelfth digit, THEN THE PAN_Aadhaar_Entry_Screen SHALL reject that input and retain the previously entered digits.
9. WHEN the customer activates the enabled continue control, THE Kalanjiyam_App SHALL navigate to the Aadhaar OTP verification step and SHALL retain the entered Aadhaar number and any entered PAN value for the subsequent steps of the Active_Flow.

### Requirement 8: Flow 1 — HRMS PAN Present and Customer is ETB

**User Story:** As a reviewer, I want a journey in which the employer record holds a PAN and the customer already banks with IOB, so that I can demonstrate the shortest HRMS path to offers.

#### Acceptance Criteria

1. WHERE the Active_Flow value is `hrms-pan-etb`, WHEN the customer activates the journey start control on the Advances on UPI landing screen at route `/advances-upi`, THE Kalanjiyam_App SHALL present exactly the following screens in this order and no other screens: HRMS fetch step, HRMS_Details_Screen, CKYC identifier retrieval and PAN Dedupe_Check step, OTP_Screen, CKYC_Details_Screen, and Sanctioned_Offers_Screen.
2. WHILE the CKYC identifier retrieval and PAN Dedupe_Check step is displayed, THE Simulated_Backend SHALL show two labelled progress steps, the first stating that the CKYC identifier is being retrieved and the second stating that PAN dedupe with the bank is in progress, each displayed for a duration between 1000 milliseconds and 2500 milliseconds, and SHALL indicate the state of each step through text or an icon in addition to color.
3. WHEN the customer submits a value of exactly six digits on the OTP_Screen, THE Kalanjiyam_App SHALL navigate to the CKYC_Details_Screen within 500 milliseconds, accepting every six-digit value without comparing the entered digits to any reference value.
4. THE CKYC_Details_Screen SHALL display a Dedupe_Check result of ETB as visible text stating that an existing bank customer record was found, marked by text or an icon in addition to color, and visible without hover, without keyboard focus and without any further customer interaction.
5. WHEN the customer activates the continue control on the CKYC_Details_Screen, THE Kalanjiyam_App SHALL navigate to the Sanctioned_Offers_Screen within 500 milliseconds.
6. THE Kalanjiyam_App SHALL present no Account_Choice_Screen, no IOB_Account_Entry_Screen, no PAN_Aadhaar_Entry_Screen, no Aadhaar_Verification_Screen, no Face_RD capture and no CIF creation step in the `hrms-pan-etb` journey, and SHALL treat the Sanctioned_Offers_Screen as the terminal screen of that journey, from which the existing offer selection and activation screens continue unchanged.
7. WHEN the CKYC identifier retrieval and PAN Dedupe_Check step has been displayed for its full duration, THE Kalanjiyam_App SHALL navigate to the OTP_Screen within 500 milliseconds and without requiring any customer input.
8. IF the customer activates the submit control on the OTP_Screen while the entered value contains fewer than six digits, THEN THE Kalanjiyam_App SHALL remain on the OTP_Screen, retain the already entered digits unchanged, and display an error message indicating that a six-digit one-time password is required.
9. THE CKYC_Details_Screen SHALL display the 10-character PAN value taken from the HRMS employee record as non-editable text that the customer cannot change through typing, pasting or selection.

### Requirement 9: Flow 2 — HRMS PAN Present and Customer is NTB

**User Story:** As a reviewer, I want a journey in which the employer record holds a PAN but the customer is new to the bank, so that I can demonstrate full Aadhaar-based onboarding after a failed dedupe.

#### Acceptance Criteria

1. WHERE the Active_Flow value is `hrms-pan-ntb`, WHEN the customer activates the journey start control on the Advances on UPI landing screen at route `/advances-upi`, THE Kalanjiyam_App SHALL present the following screens in this order and present no other screen between them: HRMS fetch step, HRMS_Details_Screen, CKYC identifier retrieval and PAN Dedupe_Check step, OTP_Screen, CKYC_Details_Screen, Aadhaar_Verification_Screen, CIF_Success_Screen, and Sanctioned_Offers_Screen.
2. WHILE the CKYC identifier retrieval and PAN Dedupe_Check step is displayed, THE Simulated_Backend SHALL show labelled progress steps for CKYC identifier retrieval and for PAN dedupe with the bank, each displayed for a duration between 1000 milliseconds and 2500 milliseconds, and SHALL indicate each step state through text or an icon in addition to color.
3. WHEN the customer submits a six-digit value on the OTP_Screen, THE Kalanjiyam_App SHALL navigate to the CKYC_Details_Screen within 500 milliseconds.
4. IF the customer activates the submit control on the OTP_Screen while the entered value contains fewer than six digits, THEN THE Kalanjiyam_App SHALL remain on the OTP_Screen, perform no navigation, retain the entered digits, and display an error message stating that a six-digit one-time password is required.
5. THE CKYC_Details_Screen SHALL display a Dedupe_Check result of NTB as visible text stating that no existing bank customer record was found and that Aadhaar verification is required, SHALL convey that result through text or an icon in addition to color, and SHALL display that result without requiring hover, keyboard focus or any other customer interaction to reveal it.
6. WHEN the customer activates the continue control on the CKYC_Details_Screen, THE Kalanjiyam_App SHALL navigate to the Aadhaar_Verification_Screen within 500 milliseconds and SHALL retain the PAN value displayed on the HRMS_Details_Screen for the remainder of the journey.
7. THE Aadhaar_Verification_Screen SHALL present Aadhaar number entry with a consent acceptance control, Aadhaar OTP verification, Aadhaar details confirmation and Face_RD capture in that order, SHALL require exactly 12 digits in the Aadhaar number field and the consent acceptance control in the selected state before enabling the continue control of the Aadhaar number entry step, and SHALL require exactly six digits before enabling the submit control of the Aadhaar OTP step.
8. WHEN Face_RD capture completes, THE Simulated_Backend SHALL show a labelled progress step whose visible text states that the CIF is being created for a duration between 1000 milliseconds and 2500 milliseconds, and SHALL then display the CIF_Success_Screen without requiring any customer input.
9. IF Face_RD capture does not complete because the customer cancels it or exits it, THEN THE Kalanjiyam_App SHALL remain on the Aadhaar_Verification_Screen, start no CIF creation step, retain the entered Aadhaar number and the confirmed Aadhaar details, display an error message indicating that face authentication was not completed, and offer a control that repeats Face_RD capture.
10. WHEN the CIF_Success_Screen has been displayed for at least 1500 milliseconds and at most 4000 milliseconds, THE Kalanjiyam_App SHALL navigate to the Sanctioned_Offers_Screen within 500 milliseconds and without requiring any customer input.
11. THE Kalanjiyam_App SHALL treat the Sanctioned_Offers_Screen as the terminal screen of the `hrms-pan-ntb` journey, from which the existing offer selection and activation screens continue unchanged, and SHALL present no further Aadhaar_Verification_Screen step and no further CIF creation step after the Sanctioned_Offers_Screen is reached.

### Requirement 10: Flow 3 — HRMS PAN Absent and Customer is ETB

**User Story:** As a reviewer, I want a journey in which the employer record holds no PAN but the customer has an IOB account that does, so that I can demonstrate PAN recovery from the account record.

#### Acceptance Criteria

1. WHERE the Active_Flow value is `hrms-nopan-etb`, WHEN the customer starts the journey and selects "I have an IOB account" on the Account_Choice_Screen, THE Kalanjiyam_App SHALL present the following screens in this order and present no other screen between them: HRMS fetch step, HRMS_Details_Screen with an empty PAN value, Account_Choice_Screen, IOB_Account_Entry_Screen, PAN retrieval and CKYC verification step, OTP_Screen, CKYC_Details_Screen, and Sanctioned_Offers_Screen.
2. WHILE the PAN retrieval and CKYC verification step is displayed, THE Simulated_Backend SHALL show two labelled progress steps, the first stating that the PAN is being retrieved from the account record and the second stating that CKYC verification is in progress, each displayed for a duration between 1000 milliseconds and 2500 milliseconds, SHALL indicate each step state through text or an icon in addition to color, and SHALL present no failure state and no retry control for either step.
3. WHEN the PAN retrieval and CKYC verification step has been displayed for its full duration, THE Kalanjiyam_App SHALL navigate to the OTP_Screen within 500 milliseconds and without requiring any customer input.
4. WHEN the customer submits a value of exactly six digits on the OTP_Screen, THE Kalanjiyam_App SHALL navigate to the CKYC_Details_Screen within 500 milliseconds, accepting every six-digit value without comparing the entered digits to any reference value.
5. THE CKYC_Details_Screen SHALL display the 10-character PAN value reported by the PAN retrieval step as non-editable text that the customer cannot change through typing, pasting or selection.
6. WHEN the customer activates the continue control on the CKYC_Details_Screen, THE Kalanjiyam_App SHALL navigate to the Sanctioned_Offers_Screen within 500 milliseconds.
7. THE Kalanjiyam_App SHALL treat the Sanctioned_Offers_Screen as the terminal screen of the `hrms-nopan-etb` journey, from which the existing offer selection and activation screens continue unchanged.
8. IF the customer activates the submit control on the OTP_Screen while the entered value contains fewer than six digits, THEN THE Kalanjiyam_App SHALL remain on the OTP_Screen, retain the entered digits unchanged, perform no navigation, and display an error message stating that a six-digit one-time password is required.
9. THE CKYC_Details_Screen SHALL display a Dedupe_Check result of ETB as visible text stating that an existing bank customer record was found, conveyed through text or an icon in addition to color.
10. WHERE the Active_Flow value is `hrms-nopan-etb`, THE Kalanjiyam_App SHALL present no PAN_Aadhaar_Entry_Screen, no Aadhaar_Verification_Screen, no Face_RD capture and no CIF creation step at any point in the journey.

### Requirement 11: Flow 4 — HRMS PAN Absent and Customer is NTB

**User Story:** As a reviewer, I want a journey in which the employer record holds no PAN and the customer holds no IOB account, so that I can demonstrate Aadhaar-led onboarding with an optional PAN.

#### Acceptance Criteria

1. WHERE the Active_Flow value is `hrms-nopan-ntb`, WHEN the customer starts the journey and selects "I don't have an IOB account" on the Account_Choice_Screen, THE Kalanjiyam_App SHALL present the following screens in this order: HRMS fetch step, HRMS_Details_Screen with an empty PAN value, Account_Choice_Screen, PAN_Aadhaar_Entry_Screen, Aadhaar OTP verification, CKYC retrieval by Aadhaar step, OTP_Screen for the CKYC one-time password, CKYC_Details_Screen, Face_RD capture, CIF_Success_Screen, and Sanctioned_Offers_Screen, and SHALL present no IOB_Account_Entry_Screen at any point in that journey.
2. WHEN the customer activates the continue control on the PAN_Aadhaar_Entry_Screen with a 12-digit Aadhaar number and the Aadhaar consent acceptance control selected, THE Kalanjiyam_App SHALL display the Aadhaar OTP verification step within 500 milliseconds and SHALL start no CKYC retrieval by Aadhaar step until a six-digit Aadhaar one-time password has been submitted.
3. WHILE the CKYC retrieval by Aadhaar step is displayed, THE Simulated_Backend SHALL show a progress step whose visible text states that the CKYC record is being retrieved using the Aadhaar number, SHALL keep that step displayed for a duration between 1000 milliseconds and 2500 milliseconds, and SHALL indicate the step state through text or an icon in addition to color.
4. WHEN the CKYC retrieval by Aadhaar step has been displayed for its full duration, THE Kalanjiyam_App SHALL navigate to the OTP_Screen for the CKYC one-time password within 500 milliseconds and without requiring any customer input.
5. WHEN the customer submits a six-digit value on the OTP_Screen for the CKYC one-time password, THE Kalanjiyam_App SHALL navigate to the CKYC_Details_Screen within 500 milliseconds.
6. IF the customer activates the submit control on the OTP_Screen for the CKYC one-time password while fewer than six digits are entered, THEN THE Kalanjiyam_App SHALL remain on the OTP_Screen, retain the entered digits unchanged, display an error message stating that a six-digit one-time password is required, and perform no navigation to the CKYC_Details_Screen.
7. WHERE the Active_Flow value is `hrms-nopan-ntb`, THE CKYC_Details_Screen SHALL display a Dedupe_Check result of failure stating that no existing bank customer record was found, SHALL display the PAN value entered on the PAN_Aadhaar_Entry_Screen when that value is non-empty, and SHALL display the PAN field with an empty value and a visible text label stating that no PAN was provided when that value is empty.
8. WHEN the customer activates the continue control on the CKYC_Details_Screen, THE Kalanjiyam_App SHALL navigate to Face_RD capture within 500 milliseconds.
9. WHEN Face_RD capture completes, THE Simulated_Backend SHALL show a progress step whose visible text states that the CIF is being created for a duration between 1000 milliseconds and 2500 milliseconds and SHALL then display the CIF_Success_Screen.
10. WHERE the Active_Flow value is `hrms-nopan-ntb`, THE Simulated_Backend SHALL return a Dedupe_Check result of NTB, a successful CKYC retrieval by Aadhaar and a successful CIF creation on every run, and SHALL present no failure state and no retry control for the CKYC retrieval by Aadhaar step, the Face_RD capture step or the CIF creation step.
11. WHEN the CIF_Success_Screen has been displayed for a duration of at least 1500 milliseconds and at most 4000 milliseconds, THE Kalanjiyam_App SHALL navigate to the Sanctioned_Offers_Screen within 500 milliseconds and without requiring any customer input.
12. THE Kalanjiyam_App SHALL treat the Sanctioned_Offers_Screen as the terminal screen of the `hrms-nopan-ntb` journey, from which the existing offer selection and activation screens continue unchanged, and SHALL present no further HRMS-specific screen in that journey.

### Requirement 12: Flow 5 — HRMS PAN Absent and Account Record Holds No PAN

**User Story:** As a reviewer, I want a journey in which neither the employer record nor the IOB account record holds a PAN, so that I can demonstrate the Aadhaar fallback for an existing customer.

#### Acceptance Criteria

1. WHEN the Active_Flow value is `hrms-nopan-etb-nopan` and the customer starts the journey, THE Kalanjiyam_App SHALL present the following screens in this order: HRMS fetch step, HRMS_Details_Screen with a blank PAN, Account_Choice_Screen, IOB_Account_Entry_Screen, PAN lookup step reporting no PAN, Aadhaar number entry, Aadhaar OTP verification, CKYC retrieval by Aadhaar step, OTP_Screen for the CKYC one-time password, CKYC_Details_Screen, and Sanctioned_Offers_Screen.
2. WHEN the PAN lookup step completes, THE Kalanjiyam_App SHALL display a visible text message stating that no PAN is linked to the account and that Aadhaar verification is required, SHALL indicate that outcome through text or an icon in addition to color, and SHALL navigate to the Aadhaar number entry step within 500 milliseconds without requiring any customer input.
3. WHILE the Aadhaar number entry step contains fewer than 12 digits or the Aadhaar consent control is unselected, THE Kalanjiyam_App SHALL keep the continue control disabled such that pointer activation and keyboard activation of that control cause no navigation.
4. IF the customer enters a non-digit character in the Aadhaar number field or a digit beyond the twelfth digit, THEN THE Kalanjiyam_App SHALL reject that input, retain the previously entered digits unchanged, and remain on the Aadhaar number entry step.
5. WHILE the CKYC retrieval by Aadhaar step is displayed, THE Simulated_Backend SHALL show a labelled progress step stating that the CKYC record is being retrieved using the Aadhaar number for a duration between 1000 milliseconds and 2500 milliseconds, SHALL return the same fixed dummy CKYC record on every run, and SHALL present no failure state and no retry control for that step.
6. WHEN the customer submits a six-digit value on the OTP_Screen for the CKYC one-time password, THE Kalanjiyam_App SHALL navigate to the CKYC_Details_Screen within 500 milliseconds.
7. IF the customer activates the submit control on the OTP_Screen for the CKYC one-time password while the entered value contains fewer than six digits, THEN THE Kalanjiyam_App SHALL remain on the OTP_Screen, retain the entered digits, perform no navigation, and display an error message stating that a six-digit one-time password is required.
8. THE CKYC_Details_Screen SHALL display an empty PAN value with a visible text label stating that no PAN is available, and SHALL display a Dedupe_Check result of success stating that an existing bank customer record was found.
9. WHEN the customer activates the continue control on the CKYC_Details_Screen, THE Kalanjiyam_App SHALL navigate to the Sanctioned_Offers_Screen.
10. WHERE the Active_Flow value is `hrms-nopan-etb-nopan`, THE Kalanjiyam_App SHALL present no Face_RD step and no CIF creation step at any point in the journey.
11. THE Kalanjiyam_App SHALL treat the Sanctioned_Offers_Screen as the terminal screen of the `hrms-nopan-etb-nopan` journey, from which the existing offer selection and activation screens continue unchanged.

### Requirement 13: Screen Reuse

**User Story:** As a maintainer, I want the new journeys to reuse existing screens, so that a change to a shared screen applies to every journey that uses it.

#### Acceptance Criteria

1. THE Kalanjiyam_App SHALL render the CKYC details review step of every HRMS_Flow using the existing `CKYCCustomerDetailsPage` component.
2. THE Kalanjiyam_App SHALL render every one-time-password step of every HRMS_Flow using the existing `OTPPage` component or the existing one-time-password step of the existing `CKYCConsentPage` or `AadhaarVerificationPage` component, and SHALL introduce no additional one-time-password component.
3. WHERE the Active_Flow value is `hrms-pan-ntb`, `hrms-nopan-ntb` or `hrms-nopan-etb-nopan`, THE Kalanjiyam_App SHALL render the Aadhaar entry, Aadhaar consent, Aadhaar OTP, Aadhaar details confirmation and Face_RD steps of that journey using the existing `AadhaarVerificationPage` component, excluding the Aadhaar entry that the `hrms-nopan-ntb` journey collects on the PAN_Aadhaar_Entry_Screen.
4. THE Kalanjiyam_App SHALL render the sanctioned offers step of every HRMS_Flow using the existing `SanctionedOffersPage` component.
5. WHERE the Active_Flow value is `hrms-pan-ntb` or `hrms-nopan-ntb`, THE Kalanjiyam_App SHALL render the CIF creation success step using the existing `LoadingPage` and `SuccessSplashPage` components.
6. THE Kalanjiyam_App SHALL add exactly four new screen components, one each for the HRMS_Details_Screen, the Account_Choice_Screen, the IOB_Account_Entry_Screen and the PAN_Aadhaar_Entry_Screen.
7. WHERE a reused screen requires HRMS_Flow-specific text, labels or destinations, THE Kalanjiyam_App SHALL supply that variation through configuration keyed by the Active_Flow value inside the existing component, and SHALL create no duplicate, copy or variant of that component.
8. THE Kalanjiyam_App SHALL configure the `AadhaarVerificationPage` component for each Aadhaar-bearing HRMS_Flow with an ordered subset of its internal steps and a destination to navigate to when that subset ends, and SHALL render none of the steps omitted from that subset.
9. WHERE the Active_Flow value is `hrms-nopan-ntb`, THE Kalanjiyam_App SHALL run the `AadhaarVerificationPage` component as exactly two segments, the first containing the Aadhaar OTP step seeded with the Aadhaar number captured on the PAN_Aadhaar_Entry_Screen and ending at the CKYC retrieval by Aadhaar step, and the second containing the Face_RD step only and ending at the CIF creation step.
10. WHEN the Kalanjiyam_App resumes the `AadhaarVerificationPage` component for a later segment of the same journey, THE Kalanjiyam_App SHALL retain the Aadhaar number captured earlier, SHALL request no re-entry of the Aadhaar number, SHALL present no second Aadhaar OTP step, and SHALL display the first step of that segment within 500 milliseconds.

### Requirement 14: Deterministic Simulated Outcomes

**User Story:** As a reviewer, I want each journey to produce the same simulated backend results every time, so that a demonstration is repeatable.

#### Acceptance Criteria

1. WHERE the Active_Flow value is `hrms-pan-etb`, THE Simulated_Backend SHALL return a Dedupe_Check result of ETB on every run.
2. WHERE the Active_Flow value is `hrms-pan-ntb`, THE Simulated_Backend SHALL return a Dedupe_Check result of NTB on every run.
3. WHERE the Active_Flow value is `hrms-nopan-etb`, THE Simulated_Backend SHALL return a PAN value from the account record on every run.
4. WHERE the Active_Flow value is `hrms-nopan-etb-nopan`, THE Simulated_Backend SHALL return an absent PAN from the account record on every run.
5. THE Simulated_Backend SHALL derive every simulated outcome in the HRMS_Flows from the Active_Flow value and from no other input.
6. THE Simulated_Backend SHALL display each labelled progress step other than the HRMS fetch step for a duration between 1000 milliseconds and 2500 milliseconds, and SHALL display the HRMS fetch step for a duration between 1500 milliseconds and 4000 milliseconds.
7. THE Kalanjiyam_App SHALL issue no network request to any external service during any HRMS_Flow.
8. WHEN a customer repeats an HRMS_Flow from the Flow_Selector for at least 5 consecutive runs, THE Kalanjiyam_App SHALL present the same screen sequence and the same simulated results on every one of those runs.
9. WHERE the Active_Flow value is `hrms-nopan-ntb`, THE Simulated_Backend SHALL return a Dedupe_Check result of NTB, a successful CKYC retrieval by Aadhaar and a successful CIF creation on every run.
10. WHILE the device has no network connectivity, THE Kalanjiyam_App SHALL complete every HRMS_Flow from the journey start control to the Sanctioned_Offers_Screen without displaying a connectivity error.
11. WHEN a reviewer selects an HRMS_Flow from the Flow_Selector, THE Kalanjiyam_App SHALL discard every value captured during any previous run and SHALL start the journey from the journey start control.

### Requirement 15: Bilingual Content

**User Story:** As a Tamil-speaking customer, I want every new screen in my chosen language, so that I can complete the journey without switching languages.

#### Acceptance Criteria

1. THE HRMS_Details_Screen, the Account_Choice_Screen, the IOB_Account_Entry_Screen and the PAN_Aadhaar_Entry_Screen SHALL each provide one non-empty English value and one non-empty Tamil value for every visible text string, including every heading, body paragraph, field label, option label, control label, placeholder text, helper text, consent statement and error message.
2. WHILE the Language_Selection value is `Tamil`, THE Kalanjiyam_App SHALL render the Tamil text of the HRMS_Details_Screen, the Account_Choice_Screen, the IOB_Account_Entry_Screen and the PAN_Aadhaar_Entry_Screen, displaying no English text other than digits, the PAN value, the Aadhaar value, the account number and the term "IOB", and SHALL display that text without clipping or truncation at a viewport width of 320 CSS pixels.
3. WHILE the Language_Selection value is `English`, THE Kalanjiyam_App SHALL render the English text of the HRMS_Details_Screen, the Account_Choice_Screen, the IOB_Account_Entry_Screen and the PAN_Aadhaar_Entry_Screen, displaying no Tamil text.
4. THE Simulated_Backend SHALL provide one non-empty English value and one non-empty Tamil value for every labelled progress step added by the HRMS_Flows, and SHALL render the value matching the Language_Selection value for the full duration of that step.
5. THE Kalanjiyam_App SHALL read the Language_Selection value through the existing `useLanguage` hook on the HRMS_Details_Screen, the Account_Choice_Screen, the IOB_Account_Entry_Screen, the PAN_Aadhaar_Entry_Screen and every HRMS progress step, and SHALL retain that value across navigation within an HRMS_Flow.
6. IF a Tamil value is missing for a visible text string on a new screen, THEN THE Kalanjiyam_App SHALL render the English value for that string and SHALL display neither a blank region nor a lookup key.
7. WHEN the Language_Selection value changes while a new screen is displayed, THE Kalanjiyam_App SHALL re-render that screen in the newly selected language within 500 milliseconds, SHALL retain every entered value, every option selection and every consent selection, and SHALL perform no navigation.

### Requirement 16: Accessibility of New Screens

**User Story:** As a customer using a keyboard or a screen reader, I want the new screens to be operable and announced correctly, so that I can complete the journey independently.

#### Acceptance Criteria

1. THE new screens SHALL implement every action control as a `button` element and every navigation control as an `a` element.
2. THE new screens SHALL render a Focus_Indicator on every interactive element when that element receives keyboard focus.
3. THE new screens SHALL render every interactive target with a width of at least 24 CSS pixels and a height of at least 24 CSS pixels.
4. THE new screens SHALL render every primary action control with a height of at least 44 CSS pixels.
5. THE new screens SHALL associate every form input with a visible `label` element or an `aria-label` attribute.
6. WHEN a validation error is displayed for an input on a new screen, THE new screen SHALL link the error message to that input through the `aria-describedby` attribute and announce the message through an element with `role="alert"`.
7. THE new screens SHALL render exactly one `h1` element and SHALL order any further headings as `h2` then `h3` without skipping a level.
8. THE new screens SHALL wrap primary content in a `main` element.
9. THE new screens SHALL provide a descriptive `alt` attribute for every meaningful image and an empty `alt` attribute for every decorative image.
10. THE new screens SHALL provide an `aria-label` attribute on every control whose only content is an icon.
11. THE new screens SHALL convey selected state, error state and success state through text or an icon in addition to color.
12. THE new screens SHALL reflow without horizontal scrolling at a viewport width of 320 CSS pixels and at 400 percent zoom.
13. WHERE the operating system reports a reduced-motion preference, THE new screens SHALL omit non-essential entrance animations.
