# Requirements Document

## Introduction

This feature adds a review checkpoint after successful CKYC retrieval, preserves every existing customer-flow destination through explicit routing context, and adds a shared customer/SIF summary after salary-advance activation. The feature covers the eight active CKYC/PAN journey variants, relevant direct preview routes, English and Tamil presentation, shared journey chrome, and the workspace WCAG 2.1 AA desktop baseline.

## Glossary

- **Salary_Advance_Application**: The KALANJIYAM React application in this workspace.
- **CKYC_Review_Page**: The new screen that presents fetched and verified CKYC identity data before the journey continues.
- **Verified_CKYC_Record**: CKYC data that completed the existing retrieval and verification sequence.
- **CKYC_Review_Data**: A record containing customer name, PAN, Aadhaar, parent name, and address from a Verified_CKYC_Record.
- **Journey_Variant**: One of the eight supported combinations of NTB or ETB, known or unknown CKYC number, and employee-ID requirement.
- **Known_CKYC_Flow**: A Journey_Variant in which the customer supplies a CKYC number before CKYC retrieval.
- **PAN_CKYC_Fallback_Flow**: A Journey_Variant in which PAN verification initiates CKYC retrieval because the customer does not supply a CKYC number.
- **Next_Destination**: The route that a Journey_Variant used after successful CKYC retrieval before this feature inserts CKYC_Review_Page.
- **Flow_Route_Resolver**: The application logic that associates each Journey_Variant with CKYC entry, review, and Next_Destination routes.
- **Customer_Summary**: The shared post-activation container containing customer name and SIF number.
- **SIF_Number**: The newly created, customer-level SIF identifier produced by successful salary-advance activation.
- **Loan_Account_Number**: A product-level account identifier for one activated salary advance.
- **Product_Frame**: The individual activated salary-advance container on CreditLineActivatedPage.
- **Shared_Chrome**: The existing TopBar and StickyFooter journey patterns.
- **Dev_Preview**: The in-application development navigation panel used to enter routes and Journey_Variants.

## Requirements

### Requirement 1: Review verified CKYC identity data

**User Story:** As a salary-advance applicant, I want to review verified CKYC data before continuing, so that I can confirm the identity information used by the application.

#### Acceptance Criteria

1. WHEN CKYC retrieval and verification complete successfully, THE Salary_Advance_Application SHALL navigate to CKYC_Review_Page before navigating to Next_Destination.
2. WHEN CKYC_Review_Page renders, THE CKYC_Review_Page SHALL display the customer name from CKYC_Review_Data.
3. WHEN CKYC_Review_Page renders, THE CKYC_Review_Page SHALL display the PAN from CKYC_Review_Data.
4. WHEN CKYC_Review_Page renders, THE CKYC_Review_Page SHALL display the Aadhaar from CKYC_Review_Data.
5. WHEN CKYC_Review_Page renders, THE CKYC_Review_Page SHALL display the parent name from CKYC_Review_Data.
6. WHEN CKYC_Review_Page renders, THE CKYC_Review_Page SHALL display the address from CKYC_Review_Data.
7. WHEN CKYC_Review_Page renders, THE CKYC_Review_Page SHALL display a textual verification marker.
8. WHEN CKYC_Review_Page renders, THE CKYC_Review_Page SHALL display a textual privacy marker describing the permitted use of CKYC data.
9. WHEN a customer activates the Continue CTA, THE CKYC_Review_Page SHALL navigate to the Next_Destination supplied for the current Journey_Variant.
10. IF CKYC_Review_Data or Next_Destination is absent or invalid, THEN THE CKYC_Review_Page SHALL return the customer to the CKYC entry route for the current Journey_Variant.
### Requirement 2: Preserve every CKYC and PAN journey destination

**User Story:** As a salary-advance applicant, I want the review checkpoint to preserve the selected journey, so that review completion does not redirect me into a different customer flow.

#### Acceptance Criteria

1. WHERE the Journey_Variant is `ntb-knows-ckyc`, WHEN the customer continues from CKYC_Review_Page, THE Flow_Route_Resolver SHALL select `/pan-prefilled` as Next_Destination.
2. WHERE the Journey_Variant is `etb-knows-ckyc`, WHEN the customer continues from CKYC_Review_Page, THE Flow_Route_Resolver SHALL select `/pan-prefilled-etb` as Next_Destination.
3. WHERE the Journey_Variant is `ntb-knows-ckyc-id`, WHEN the customer continues from CKYC_Review_Page, THE Flow_Route_Resolver SHALL select `/pan-prefilled-ntb-id` as Next_Destination.
4. WHERE the Journey_Variant is `etb-knows-ckyc-id`, WHEN the customer continues from CKYC_Review_Page, THE Flow_Route_Resolver SHALL select `/pan-prefilled-etb-id` as Next_Destination.
5. WHERE the Journey_Variant is `ntb-no-ckyc`, WHEN the customer continues from CKYC_Review_Page, THE Flow_Route_Resolver SHALL select `/aadhaar-verification` as Next_Destination.
6. WHERE the Journey_Variant is `etb-no-ckyc`, WHEN the customer continues from CKYC_Review_Page, THE Flow_Route_Resolver SHALL select `/sanctioned-offers` as Next_Destination.
7. WHERE the Journey_Variant is `ntb-no-ckyc-id`, WHEN the customer continues from CKYC_Review_Page, THE Flow_Route_Resolver SHALL select `/aadhaar-verification` as Next_Destination.
8. WHERE the Journey_Variant is `etb-no-ckyc-id`, WHEN the customer continues from CKYC_Review_Page, THE Flow_Route_Resolver SHALL select `/employee-id-upload` as Next_Destination.
9. WHEN a Known_CKYC_Flow completes CKYC retrieval, THE Flow_Route_Resolver SHALL preserve the matching prefilled-PAN variant through CKYC_Review_Page.
10. WHEN a PAN_CKYC_Fallback_Flow completes CKYC retrieval, THE Flow_Route_Resolver SHALL preserve the matching NTB or ETB and employee-ID branch through CKYC_Review_Page.
11. WHEN the direct `/ckyc-plus-id` flow completes CKYC retrieval, THE Flow_Route_Resolver SHALL select `/employee-id-upload` as Next_Destination.
12. WHEN the `/kyc-ckyc-verification` flow completes CKYC verification, THE Flow_Route_Resolver SHALL preserve `/loading` as Next_Destination through CKYC_Review_Page.
13. IF a Journey_Variant is unsupported, THEN THE Flow_Route_Resolver SHALL select the configured default Journey_Variant rather than an unrelated downstream route.

### Requirement 3: Provide bilingual shared and accessible review presentation

**User Story:** As an English-speaking or Tamil-speaking applicant, I want a consistent and accessible review screen, so that I can understand and operate the checkpoint on mobile and desktop.

#### Acceptance Criteria

1. WHILE the selected language is English, THE CKYC_Review_Page SHALL render every heading, field label, trust marker, privacy marker, and CTA in English.
2. WHILE the selected language is Tamil, THE CKYC_Review_Page SHALL render every heading, field label, trust marker, privacy marker, and CTA in Tamil.
3. WHEN the selected language changes through TopBar, THE CKYC_Review_Page SHALL update visible localized copy without changing CKYC_Review_Data or Next_Destination.
4. WHEN CKYC_Review_Page renders, THE CKYC_Review_Page SHALL use Shared_Chrome with TopBar and StickyFooter.
5. WHILE CKYC_Review_Page is displayed at widths from 320 CSS pixels through desktop breakpoints, THE CKYC_Review_Page SHALL reflow without horizontal scrolling.
6. WHILE CKYC_Review_Page is displayed at 400 percent browser zoom, THE CKYC_Review_Page SHALL reflow without horizontal scrolling.
7. WHEN a keyboard user focuses an interactive control, THE CKYC_Review_Page SHALL display a focus indicator with at least 3:1 contrast against adjacent colors.
8. WHEN CKYC_Review_Page renders, THE CKYC_Review_Page SHALL expose one level-one heading and `header`, `main`, and `footer` landmarks.
9. WHEN CKYC_Review_Page renders, THE CKYC_Review_Page SHALL provide a Continue CTA target measuring at least 44 by 44 CSS pixels.
10. WHEN desktop pointer input hovers over the Continue CTA, THE CKYC_Review_Page SHALL display a visual hover state without hiding essential information.
11. WHILE reduced motion is requested, THE CKYC_Review_Page SHALL suppress nonessential entrance animation.
12. WHEN CKYC_Review_Page renders text and meaningful icons, THE CKYC_Review_Page SHALL meet WCAG 2.1 AA text and non-text contrast thresholds.

### Requirement 4: Present customer-level SIF identity after activation

**User Story:** As an applicant with activated salary advances, I want to see the customer name and new SIF number separately from product accounts, so that I can distinguish customer identity from each loan account.

#### Acceptance Criteria

1. WHEN salary-advance activation completes, THE CreditLineActivatedPage SHALL display one Customer_Summary before the collection of Product_Frames.
2. WHEN Customer_Summary renders, THE Customer_Summary SHALL display the activated customer name.
3. WHEN Customer_Summary renders, THE Customer_Summary SHALL display the newly created SIF_Number.
4. WHILE CreditLineActivatedPage remains mounted, THE Customer_Summary SHALL retain the same customer name and SIF_Number across component re-renders.
5. FOR ALL Product_Frames, THE CreditLineActivatedPage SHALL display each Loan_Account_Number inside the corresponding Product_Frame.
6. WHEN multiple salary advances are activated, THE CreditLineActivatedPage SHALL display one Customer_Summary and one Product_Frame per activated salary advance.
7. WHEN CreditLineActivatedPage renders in English, THE Customer_Summary SHALL render customer and SIF labels in English.
8. WHEN CreditLineActivatedPage renders in Tamil, THE Customer_Summary SHALL render customer and SIF labels in Tamil.
9. IF activation route state lacks activated salary advances, THEN THE CreditLineActivatedPage SHALL return the customer to `/sanctioned-offers`.
10. THE SanctionedOffersPage SHALL present offer eligibility and selection without presenting a newly created SIF_Number.
### Requirement 5: Expose routes and validate complete flows

**User Story:** As a developer, I want routing and preview coverage for every affected journey, so that implementation can be verified before release.

#### Acceptance Criteria

1. WHEN the application router is created, THE Salary_Advance_Application SHALL register a route for CKYC_Review_Page.
2. WHEN Dev_Preview renders, THE Dev_Preview SHALL provide a direct entry for CKYC_Review_Page with representative CKYC_Review_Data and Next_Destination.
3. WHEN Dev_Preview renders Journey_Variants, THE Dev_Preview SHALL provide entries for all eight supported Journey_Variants.
4. WHEN each Known_CKYC_Flow is checked through Dev_Preview, THE Salary_Advance_Application SHALL traverse CKYC consent, CKYC retrieval, CKYC_Review_Page, and the matching prefilled-PAN Next_Destination.
5. WHEN each PAN_CKYC_Fallback_Flow is checked through Dev_Preview, THE Salary_Advance_Application SHALL traverse PAN verification, CKYC retrieval, CKYC_Review_Page, and the matching Next_Destination.
6. WHEN the activated-screen direct preview is selected, THE Dev_Preview SHALL supply representative activated product identifiers, customer name, and SIF_Number.
7. WHEN `pnpm build` executes after implementation, THE Salary_Advance_Application SHALL complete the production build with exit status zero.
8. WHEN route and Dev_Preview flow checks execute, THE Salary_Advance_Application SHALL preserve the destination matrix defined by Requirement 2.
