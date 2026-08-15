/**
 * Bilingual copy for the five HRMS salary-advance journeys.
 *
 * Every visible string of the four new screens (HRMSDetailsPage, AccountChoicePage,
 * IOBAccountEntryPage, PANAadhaarEntryPage) lives here, together with the HRMS
 * progress-step labels and the CKYC dedupe banner text rendered on the shared
 * screens, so the screens draw all copy from one source (Requirement 15.1, 15.4).
 *
 * `HrmsStrings` is declared once, so the `satisfies Record<Language, HrmsStrings>`
 * guard on `hrmsContent` turns a missing Tamil key into a compile error, and
 * `tr(lang, key)` covers the empty-value case at runtime by falling back to the
 * English value (Requirement 15.6).
 *
 * The `Language` union is imported from `../hooks/useLanguage` rather than
 * redeclared, so adding a language there forces a record to be added here.
 *
 * Tamil terminology follows the copy already used in the app: `CKYC`, `PAN`, `OTP`,
 * `CIF` and `IOB` stay in Latin script, `Aadhaar` is rendered as `ஆதார்`, and
 * Indian Overseas Bank is spelled out as `இந்தியன் ஓவர்சீஸ் வங்கி` in consent text.
 */

import type { Language } from '../hooks/useLanguage';

export interface HrmsStrings {
  // ── HRMS details screen — headings and body ──
  hrmsDetailsTitle: string;
  hrmsDetailsSubtitle: string;
  hrmsFetchingTitle: string;
  hrmsFetchingSubtitle: string;

  // ── HRMS details screen — field labels ──
  hrmsNameLabel: string;
  hrmsMobileLabel: string;
  hrmsDobLabel: string;
  hrmsPanLabel: string;
  hrmsPanUnavailableLabel: string;

  // ── HRMS details screen — consent, data protection, controls ──
  hrmsConsentText: string;
  hrmsDataProtectionText: string;
  hrmsContinueBtn: string;

  // ── HRMS details screen — record error ──
  hrmsRecordErrorMessage: string;
  hrmsRetryBtn: string;

  // ── Account choice screen ──
  accountChoiceTitle: string;
  accountChoiceSubtitle: string;
  accountChoiceHasAccount: string;
  accountChoiceNoAccount: string;
  accountChoiceSelectedMarker: string;
  accountChoiceContinueBtn: string;

  // ── IOB account entry screen ──
  accountEntryTitle: string;
  accountEntrySubtitle: string;
  accountEntryLabel: string;
  accountEntryPlaceholder: string;
  accountEntryHelperText: string;
  accountEntryShortError: string;
  accountEntryPanFound: string;
  accountEntryPanAbsent: string;
  accountEntryContinueBtn: string;

  // ── PAN + Aadhaar entry screen ──
  panAadhaarTitle: string;
  panAadhaarSubtitle: string;
  panAadhaarPanLabel: string;
  panAadhaarPanOptionalMarker: string;
  panAadhaarPanPlaceholder: string;
  panAadhaarPanFormatError: string;
  panAadhaarAadhaarLabel: string;
  panAadhaarAadhaarRequiredMarker: string;
  panAadhaarAadhaarPlaceholder: string;
  panAadhaarConsentText: string;
  panAadhaarContinueBtn: string;

  // ── HRMS progress-step labels (Simulated_Backend) ──
  stepHrmsFetch: string;
  stepCkycId: string;
  stepPanDedupe: string;
  stepAccountPan: string;
  stepCkycVerify: string;
  stepAccountPanAbsent: string;
  stepCkycByAadhaar: string;
  stepCifCreate: string;

  // ── Shared screens — CKYC dedupe banner and PAN row ──
  dedupeEtbBanner: string;
  dedupeNtbBanner: string;
  panNotAvailableLabel: string;
  panNotProvidedLabel: string;

  // ── Shared screens — OTP and Face RD messages ──
  otpShortError: string;
  faceRdCancelledMessage: string;
  faceRdTryAgainBtn: string;
}

const English: HrmsStrings = {
  // ── HRMS details screen — headings and body ──
  hrmsDetailsTitle: 'Confirm Your Employee Details',
  hrmsDetailsSubtitle:
    "These details were fetched from your employer's HRMS record. Review them and give your consent to continue.",
  hrmsFetchingTitle: 'Fetching Your Employee Details',
  hrmsFetchingSubtitle: 'This takes a few seconds. Please stay on this screen.',

  // ── HRMS details screen — field labels ──
  hrmsNameLabel: 'Name',
  hrmsMobileLabel: 'Mobile Number',
  hrmsDobLabel: 'Date of Birth',
  hrmsPanLabel: 'PAN',
  hrmsPanUnavailableLabel: 'Not available in your HRMS record',

  // ── HRMS details screen — consent, data protection, controls ──
  hrmsConsentText:
    'I authorise Indian Overseas Bank to validate my PAN and to download my CKYC record for this credit application.',
  hrmsDataProtectionText:
    'The details fetched from your employer are used only for this credit application and are not shared for any other purpose.',
  hrmsContinueBtn: 'Continue',

  // ── HRMS details screen — record error ──
  hrmsRecordErrorMessage:
    'We could not retrieve your employee details from HRMS. Please try again.',
  hrmsRetryBtn: 'Retry',

  // ── Account choice screen ──
  accountChoiceTitle: 'Do You Have an IOB Account?',
  accountChoiceSubtitle:
    'Tell us whether you already bank with Indian Overseas Bank so we ask only for the details we need.',
  accountChoiceHasAccount: 'I have an IOB account',
  accountChoiceNoAccount: "I don't have an IOB account",
  accountChoiceSelectedMarker: 'Selected',
  accountChoiceContinueBtn: 'Continue',

  // ── IOB account entry screen ──
  accountEntryTitle: 'Enter Your IOB Account Number',
  accountEntrySubtitle:
    'We use your account number to retrieve the PAN already held in your account record.',
  accountEntryLabel: 'IOB Account Number',
  accountEntryPlaceholder: 'Enter your account number',
  accountEntryHelperText: 'Your account number must contain 9 to 18 digits.',
  accountEntryShortError: 'Your account number must contain 9 to 18 digits.',
  accountEntryPanFound: 'PAN found in your account record',
  accountEntryPanAbsent:
    'No PAN is linked to this account. Aadhaar verification is required.',
  accountEntryContinueBtn: 'Continue',

  // ── PAN + Aadhaar entry screen ──
  panAadhaarTitle: 'Enter Your PAN and Aadhaar',
  panAadhaarSubtitle:
    'Your Aadhaar number is required for identity verification. Adding your PAN is optional.',
  panAadhaarPanLabel: 'PAN',
  panAadhaarPanOptionalMarker: 'Optional',
  panAadhaarPanPlaceholder: 'AAAAA9999A',
  panAadhaarPanFormatError:
    'Enter a valid PAN in the format AAAAA9999A — five letters, four digits and one letter.',
  panAadhaarAadhaarLabel: 'Aadhaar Number',
  panAadhaarAadhaarRequiredMarker: 'Required',
  panAadhaarAadhaarPlaceholder: 'Enter your 12-digit Aadhaar number',
  panAadhaarConsentText:
    'I authorise Indian Overseas Bank to use my Aadhaar number for identity verification.',
  panAadhaarContinueBtn: 'Continue',

  // ── HRMS progress-step labels (Simulated_Backend) ──
  stepHrmsFetch: 'Fetching your employee details from HRMS…',
  stepCkycId: 'Retrieving your CKYC identifier…',
  stepPanDedupe: 'Checking your PAN against bank records…',
  stepAccountPan: 'Retrieving the PAN from your account record…',
  stepCkycVerify: 'Verifying your CKYC record…',
  stepAccountPanAbsent: 'Checking your account record for a PAN…',
  stepCkycByAadhaar: 'Retrieving your CKYC record using your Aadhaar number…',
  stepCifCreate: 'Creating your customer record (CIF)…',

  // ── Shared screens — CKYC dedupe banner and PAN row ──
  dedupeEtbBanner: 'Existing bank customer record found',
  dedupeNtbBanner:
    'No existing bank customer record found. Aadhaar verification is required.',
  panNotAvailableLabel: 'No PAN available',
  panNotProvidedLabel: 'No PAN provided',

  // ── Shared screens — OTP and Face RD messages ──
  otpShortError: 'Enter the 6-digit one-time password to continue.',
  faceRdCancelledMessage:
    'Face authentication was not completed. Please try again to continue.',
  faceRdTryAgainBtn: 'Try again',
};

const Tamil: HrmsStrings = {
  // ── HRMS details screen — headings and body ──
  hrmsDetailsTitle: 'உங்கள் ஊழியர் விவரங்களை உறுதிப்படுத்தவும்',
  hrmsDetailsSubtitle:
    'இந்த விவரங்கள் உங்கள் நிறுவனத்தின் HRMS பதிவிலிருந்து பெறப்பட்டன. அவற்றைச் சரிபார்த்து, தொடர உங்கள் சம்மதத்தை அளிக்கவும்.',
  hrmsFetchingTitle: 'உங்கள் ஊழியர் விவரங்கள் பெறப்படுகின்றன',
  hrmsFetchingSubtitle: 'இதற்கு சில வினாடிகள் ஆகும். இந்தத் திரையிலேயே இருக்கவும்.',

  // ── HRMS details screen — field labels ──
  hrmsNameLabel: 'பெயர்',
  hrmsMobileLabel: 'மொபைல் எண்',
  hrmsDobLabel: 'பிறந்த தேதி',
  hrmsPanLabel: 'PAN',
  hrmsPanUnavailableLabel: 'உங்கள் HRMS பதிவில் கிடைக்கவில்லை',

  // ── HRMS details screen — consent, data protection, controls ──
  hrmsConsentText:
    'இந்தக் கடன் விண்ணப்பத்திற்காக எனது PAN ஐ சரிபார்க்கவும், எனது CKYC பதிவைப் பெறவும் இந்தியன் ஓவர்சீஸ் வங்கிக்கு நான் அனுமதி அளிக்கிறேன்.',
  hrmsDataProtectionText:
    'உங்கள் நிறுவனத்திலிருந்து பெறப்பட்ட விவரங்கள் இந்தக் கடன் விண்ணப்பத்திற்கு மட்டுமே பயன்படுத்தப்படும், வேறு எந்த நோக்கத்திற்கும் பங்கிடப்படாது.',
  hrmsContinueBtn: 'தொடரவும்',

  // ── HRMS details screen — record error ──
  hrmsRecordErrorMessage:
    'HRMS இலிருந்து உங்கள் ஊழியர் விவரங்களைப் பெற முடியவில்லை. மீண்டும் முயற்சிக்கவும்.',
  hrmsRetryBtn: 'மீண்டும் முயற்சிக்கவும்',

  // ── Account choice screen ──
  accountChoiceTitle: 'உங்களுக்கு IOB கணக்கு உள்ளதா?',
  accountChoiceSubtitle:
    'நீங்கள் ஏற்கனவே இந்தியன் ஓவர்சீஸ் வங்கியில் கணக்கு வைத்திருக்கிறீர்களா என்பதைத் தெரிவிக்கவும். அதற்கேற்ப தேவையான விவரங்களை மட்டுமே கேட்போம்.',
  accountChoiceHasAccount: 'எனக்கு IOB கணக்கு உள்ளது',
  accountChoiceNoAccount: 'எனக்கு IOB கணக்கு இல்லை',
  accountChoiceSelectedMarker: 'தேர்ந்தெடுக்கப்பட்டது',
  accountChoiceContinueBtn: 'தொடரவும்',

  // ── IOB account entry screen ──
  accountEntryTitle: 'உங்கள் IOB கணக்கு எண்ணை உள்ளிடவும்',
  accountEntrySubtitle:
    'உங்கள் கணக்குப் பதிவில் ஏற்கனவே உள்ள PAN ஐப் பெற உங்கள் கணக்கு எண்ணைப் பயன்படுத்துகிறோம்.',
  accountEntryLabel: 'IOB கணக்கு எண்',
  accountEntryPlaceholder: 'உங்கள் கணக்கு எண்ணை உள்ளிடவும்',
  accountEntryHelperText: 'உங்கள் கணக்கு எண் 9 முதல் 18 இலக்கங்கள் கொண்டிருக்க வேண்டும்.',
  accountEntryShortError: 'உங்கள் கணக்கு எண் 9 முதல் 18 இலக்கங்கள் கொண்டிருக்க வேண்டும்.',
  accountEntryPanFound: 'உங்கள் கணக்குப் பதிவில் PAN கண்டறியப்பட்டது',
  accountEntryPanAbsent:
    'இந்தக் கணக்குடன் எந்த PAN உம் இணைக்கப்படவில்லை. ஆதார் சரிபார்ப்பு தேவை.',
  accountEntryContinueBtn: 'தொடரவும்',

  // ── PAN + Aadhaar entry screen ──
  panAadhaarTitle: 'உங்கள் PAN மற்றும் ஆதார் எண்ணை உள்ளிடவும்',
  panAadhaarSubtitle:
    'அடையாள சரிபார்ப்புக்கு உங்கள் ஆதார் எண் தேவை. PAN ஐ வழங்குவது விருப்பத்திற்குரியது.',
  panAadhaarPanLabel: 'PAN',
  panAadhaarPanOptionalMarker: 'விருப்பத்திற்குரியது',
  panAadhaarPanPlaceholder: 'AAAAA9999A',
  panAadhaarPanFormatError:
    'AAAAA9999A வடிவத்தில் சரியான PAN ஐ உள்ளிடவும் — ஐந்து எழுத்துகள், நான்கு இலக்கங்கள், ஒரு எழுத்து.',
  panAadhaarAadhaarLabel: 'ஆதார் எண்',
  panAadhaarAadhaarRequiredMarker: 'கட்டாயம்',
  panAadhaarAadhaarPlaceholder: 'உங்கள் 12 இலக்க ஆதார் எண்ணை உள்ளிடவும்',
  panAadhaarConsentText:
    'அடையாள சரிபார்ப்புக்கு எனது ஆதார் எண்ணைப் பயன்படுத்த இந்தியன் ஓவர்சீஸ் வங்கிக்கு நான் அனுமதி அளிக்கிறேன்.',
  panAadhaarContinueBtn: 'தொடரவும்',

  // ── HRMS progress-step labels (Simulated_Backend) ──
  stepHrmsFetch: 'HRMS இலிருந்து உங்கள் ஊழியர் விவரங்கள் பெறப்படுகின்றன…',
  stepCkycId: 'உங்கள் CKYC அடையாள எண் பெறப்படுகிறது…',
  stepPanDedupe: 'உங்கள் PAN வங்கிப் பதிவுகளுடன் சரிபார்க்கப்படுகிறது…',
  stepAccountPan: 'உங்கள் கணக்குப் பதிவிலிருந்து PAN பெறப்படுகிறது…',
  stepCkycVerify: 'உங்கள் CKYC பதிவு சரிபார்க்கப்படுகிறது…',
  stepAccountPanAbsent: 'உங்கள் கணக்குப் பதிவில் PAN உள்ளதா எனச் சரிபார்க்கப்படுகிறது…',
  stepCkycByAadhaar: 'உங்கள் ஆதார் எண்ணைப் பயன்படுத்தி உங்கள் CKYC பதிவு பெறப்படுகிறது…',
  stepCifCreate: 'உங்கள் வாடிக்கையாளர் பதிவு (CIF) உருவாக்கப்படுகிறது…',

  // ── Shared screens — CKYC dedupe banner and PAN row ──
  dedupeEtbBanner: 'ஏற்கனவே உள்ள வங்கி வாடிக்கையாளர் பதிவு கண்டறியப்பட்டது',
  dedupeNtbBanner:
    'ஏற்கனவே உள்ள வங்கி வாடிக்கையாளர் பதிவு கண்டறியப்படவில்லை. ஆதார் சரிபார்ப்பு தேவை.',
  panNotAvailableLabel: 'PAN கிடைக்கவில்லை',
  panNotProvidedLabel: 'PAN வழங்கப்படவில்லை',

  // ── Shared screens — OTP and Face RD messages ──
  otpShortError: 'தொடர 6 இலக்க OTP ஐ உள்ளிடவும்.',
  faceRdCancelledMessage: 'முக அங்கீகாரம் முடிக்கப்படவில்லை. தொடர மீண்டும் முயற்சிக்கவும்.',
  faceRdTryAgainBtn: 'மீண்டும் முயற்சிக்கவும்',
};

/**
 * One record per `Language` member. The `satisfies` clause — not a type annotation —
 * keeps the literal key set inferred while still forcing exhaustiveness, so dropping
 * a Tamil key or adding a language without a record fails the build (Requirement 15.1).
 */
export const hrmsContent = {
  English,
  Tamil,
} satisfies Record<Language, HrmsStrings>;

/**
 * Read one string in the requested language.
 *
 * Falls back to the English value whenever the requested value is absent or blank,
 * so a screen never renders an empty region and never renders the lookup key
 * (Requirement 15.6). The `English` record is exhaustive by construction, so the
 * fallback always yields visible copy.
 */
export function tr(lang: Language, key: keyof HrmsStrings): string {
  const requested = hrmsContent[lang]?.[key];
  if (typeof requested === 'string' && requested.trim().length > 0) {
    return requested;
  }
  return English[key];
}
