/**
 * Bilingual copy for the five HRMS salary-advance journeys.
 *
 * Every visible string of the HRMS-specific screens (HRMSDetailsPage,
 * PANAadhaarEntryPage) lives here, together with the HRMS-only copy rendered on
 * the shared screens — the CKYC declarations, the confirming-OTP headings and
 * the PAN row labels — so the screens draw all copy from one source
 * (Requirement 15.1, 15.4).
 *
 * Progress-step labels are *not* here: they live on each `ProcessingStep` in the
 * flow registry, in both languages, so a step and its label cannot drift apart.
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
  /** Screen-reader heading for the processing phase, which shows no visible title. */
  hrmsDetailsTitle: string;
  hrmsFetchingTitle: string;
  hrmsFetchingSubtitle: string;
  /** Greeting word, rendered ahead of the fetched employee name. */
  hrmsGreeting: string;
  /** Lead line below the greeting, naming what the journey delivers. */
  hrmsGreetingLead: string;

  // ── HRMS details screen — field labels ──
  hrmsNameLabel: string;
  hrmsEmployeeIdLabel: string;
  hrmsMobileLabel: string;
  hrmsDobLabel: string;
  hrmsPanLabel: string;
  hrmsAddressLabel: string;
  hrmsPanUnavailableLabel: string;

  // ── HRMS details screen — consent and controls ──
  /**
   * Bank-record check declaration, shown inline above the CTA in all five flows.
   * It authorises the mobile-number dedupe the next phase runs — the check that
   * replaced asking the customer for an IOB account number. One line; the formal
   * wording sits behind `panAadhaarReadMore`.
   */
  hrmsConsentText: string;
  hrmsConsentTitle: string;
  /** Full bank-record wording, paragraph-separated by `\n\n`. */
  hrmsConsentFull: string;
  hrmsContinueBtn: string;

  /**
   * The gating sheet the CTA opens on the flows taking two declarations here —
   * a PAN in hand means the CKYC download can be authorised at the same time,
   * and two checkboxes above the button would crowd an already heavy screen.
   */
  hrmsGateSheetTitle: string;
  hrmsGateSheetAcceptBtn: string;

  // ── HRMS details screen — record error ──
  hrmsRecordErrorMessage: string;
  hrmsRetryBtn: string;

  // ── HRMS details screen — banking partner row and trust badges ──
  hrmsBankingPartnerLabel: string;
  /** Alt text for the IOB logo. */
  hrmsBankName: string;
  hrmsBadgeInstant: string;
  hrmsBadgeSecure: string;

  // ── Dedupe outcome screen ──
  /**
   * States what the mobile dedupe found, on the flow whose landing card had to
   * say no PAN was available. Finding one changes what happens next, so it is
   * stated plainly rather than left to scroll past in a progress row — and the
   * CKYC declaration is taken here, where the reason for it is on screen.
   */
  dedupeOutcomeBadge: string;
  dedupeOutcomeTitle: string;
  dedupeOutcomeSubtitle: string;
  /** Names how the match was made, so the check is not opaque. */
  dedupeOutcomeMatchedLabel: string;
  /** The one thing still outstanding, listed under the heading. */
  dedupeOutcomeRemainingLabel: string;
  dedupeOutcomeRemainingDetail: string;
  dedupeOutcomeContinueBtn: string;
  /** Progress label while the CKYC identifier is retrieved after consent. */
  dedupeOutcomeRetrieving: string;

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
  /** Opens the read-only Aadhaar consent sheet from beside the consent checkbox. */
  panAadhaarReadMore: string;
  panAadhaarConsentTitle: string;
  /** Full UIDAI consent wording, paragraph-separated by `\n\n`. */
  panAadhaarConsentFull: string;
  panAadhaarContinueBtn: string;

  // ── CKYC download consent + confirming OTP (Aadhaar segments that fetch CKYC) ──
  /**
   * Inline declaration shown on the Aadhaar `confirm-details` step, but only in
   * the segments that go on to download a CKYC record with that Aadhaar number.
   * Two lines maximum; the formal wording lives in `ckycDownloadConsentFull`
   * behind the shared `panAadhaarReadMore` link.
   */
  ckycDownloadConsentText: string;
  /** Full CKYC-download wording for the read-only sheet, paragraphs split by `\n\n`. */
  ckycDownloadConsentFull: string;
  ckycDownloadConsentTitle: string;
  /** Heading of the OTP step that authorises the CKYC download. */
  ckycOtpTitle: string;
  ckycOtpSubtitle: string;
  /** CTA on `confirm-details` when the next step is the CKYC-download OTP. */
  ckycConfirmBtn: string;

  // ── CKYC download consent, PAN-keyed (the shared OTP screen) ──
  /**
   * Inline declaration shown on `/otp-verification` for the HRMS flows that pull
   * their CKYC record with a PAN already in hand, immediately above the OTP that
   * confirms it. Never shown for the eight legacy flows.
   */
  ckycPanConsentText: string;
  ckycPanConsentTitle: string;
  /** Full PAN-keyed CKYC wording, paragraph-separated by `\n\n`. */
  ckycPanConsentFull: string;

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
  hrmsFetchingTitle: 'Fetching Your Employee Details',
  hrmsFetchingSubtitle: 'This takes a few seconds. Please stay on this screen.',
  hrmsGreeting: 'Hello',
  hrmsGreetingLead: 'Get salary advances on your UPI',

  // ── HRMS details screen — field labels ──
  hrmsNameLabel: 'Name',
  hrmsEmployeeIdLabel: 'Employee ID',
  hrmsMobileLabel: 'Mobile Number',
  hrmsDobLabel: 'Date of Birth',
  hrmsPanLabel: 'PAN',
  hrmsAddressLabel: 'Address',
  hrmsPanUnavailableLabel: 'Not available in your HRMS record',

  // ── HRMS details screen — consent and controls ──
  hrmsConsentText:
    'I authorise Indian Overseas Bank to check my bank records using my mobile number.',
  hrmsConsentTitle: 'Bank Record Check Consent',
  hrmsConsentFull:
    'I authorise Indian Overseas Bank to use the mobile number shown in my employee record to search its own customer records and determine whether I am an existing customer of the bank.\n\nI authorise the bank to read the details held against any record it matches, including the name, date of birth, address and PAN recorded there, and to use those details to progress this credit application.\n\nI understand that the outcome of this check determines what the bank asks of me next, and that where the matched record already holds the details required, I will not be asked to provide them again.\n\nI understand that Indian Overseas Bank will keep this data secure and confidential and will not use it for any purpose other than verifying my identity and assessing this application.',
  hrmsContinueBtn: 'Continue',
  hrmsGateSheetTitle: 'Accept declarations',
  hrmsGateSheetAcceptBtn: 'Agree and continue',

  // ── HRMS details screen — record error ──
  hrmsRecordErrorMessage:
    'We could not retrieve your employee details from HRMS. Please try again.',
  hrmsRetryBtn: 'Retry',

  // ── HRMS details screen — banking partner row and trust badges ──
  hrmsBankingPartnerLabel: 'Powered by',
  hrmsBankName: 'Indian Overseas Bank',
  hrmsBadgeInstant: 'Get credit instantly',
  hrmsBadgeSecure: 'Safe and Secure',

  // ── Dedupe outcome screen ──
  dedupeOutcomeBadge: 'Existing IOB customer',
  dedupeOutcomeTitle: "You're already an IOB customer",
  dedupeOutcomeSubtitle:
    'We found your details in your bank record. Nothing more to enter.',
  dedupeOutcomeMatchedLabel: 'Matched using your registered mobile number',
  dedupeOutcomeRemainingLabel: 'One step left',
  dedupeOutcomeRemainingDetail:
    'We need to check your CKYC record to finish verifying your identity.',
  dedupeOutcomeContinueBtn: 'Continue',
  dedupeOutcomeRetrieving: 'Retrieving your CKYC identifier…',

  // ── PAN + Aadhaar entry screen ──
  panAadhaarTitle: 'Verify your identity',
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
  panAadhaarReadMore: 'Read more',
  panAadhaarConsentTitle: 'Aadhaar Consent',
  panAadhaarConsentFull:
    "I agree and authorize Indian Overseas Bank to fetch my name, date of birth and photograph from UIDAI, limited to authenticating myself with Aadhaar based authentication system for identity verification in adherence to performing e-KYC.\n\nI understand that Indian Overseas Bank will authenticate my identity through the Aadhaar authentication system for personal loans and/or for other purposes, or as authorised under the Aadhaar Act, 2016.\n\nI understand that Indian Overseas Bank shall ensure security and confidentiality of my personal identity data and prohibit its use other than for submission to the Central Identities Data Repository (CIDR) for authentication.\n\nI hereby authorize Indian Overseas Bank to verify and authenticate using the Aadhaar number provided.",
  panAadhaarContinueBtn: 'Continue',

  // ── CKYC download consent + confirming OTP ──
  ckycDownloadConsentText:
    'I authorise Indian Overseas Bank to check and download my CKYC records for verification.',
  ckycDownloadConsentFull:
    'I authorise Indian Overseas Bank to fetch my Know Your Customer (KYC) record from the Central KYC Registry (CKYCR) using the Aadhaar number I have provided and verified in this application.\n\nI understand that the record retrieved will be used only to process this credit application — to establish my identity, to check my details against the bank\u2019s records and to complete the KYC requirements for it — and for no other purpose.\n\nI understand that Indian Overseas Bank shall keep the retrieved data secure and confidential, shall not share it except as required by law or by the regulator, and shall retain it only for as long as the applicable regulations require.\n\nI confirm that this authorisation is given voluntarily and that the Aadhaar number used for this retrieval is my own.',
  ckycDownloadConsentTitle: 'CKYC Download Consent',
  ckycOtpTitle: 'Confirm CKYC Download',
  /** `{mobile}` is replaced with the customer's number at render time. */
  ckycOtpSubtitle: 'Enter the 6-digit OTP sent to {mobile}',
  ckycConfirmBtn: 'Confirm with OTP',

  // ── CKYC download consent, PAN-keyed (the shared OTP screen) ──
  ckycPanConsentText:
    'I authorise Indian Overseas Bank to download my CKYC record for verification.',
  ckycPanConsentTitle: 'CKYC Download Consent',
  ckycPanConsentFull:
    'I authorise Indian Overseas Bank to retrieve my Know Your Customer (KYC) record from the Central KYC Registry (CKYCR) using my PAN, and to use the retrieved details to establish my identity for this credit application.\n\nI understand that the record retrieved may include my name, date of birth, address, photograph and the identity documents registered against my CKYC identifier.\n\nI understand that Indian Overseas Bank shall keep the retrieved data secure and confidential, shall not share it except as required by law or by the regulator, and shall retain it only for as long as the applicable regulations require.\n\nI confirm that this authorisation is given voluntarily and that the PAN used for this retrieval is my own.',

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
  hrmsFetchingTitle: 'உங்கள் ஊழியர் விவரங்கள் பெறப்படுகின்றன',
  hrmsFetchingSubtitle: 'இதற்கு சில வினாடிகள் ஆகும். இந்தத் திரையிலேயே இருக்கவும்.',
  hrmsGreeting: 'வணக்கம்',
  hrmsGreetingLead: 'உங்கள் UPI யில் சம்பள முன்பணம் பெறுங்கள்',

  // ── HRMS details screen — field labels ──
  hrmsNameLabel: 'பெயர்',
  hrmsEmployeeIdLabel: 'ஊழியர் அடையாள எண்',
  hrmsMobileLabel: 'மொபைல் எண்',
  hrmsDobLabel: 'பிறந்த தேதி',
  hrmsPanLabel: 'PAN',
  hrmsAddressLabel: 'முகவரி',
  hrmsPanUnavailableLabel: 'உங்கள் HRMS பதிவில் கிடைக்கவில்லை',

  // ── HRMS details screen — consent and controls ──
  hrmsConsentText:
    'எனது மொபைல் எண்ணைப் பயன்படுத்தி எனது வங்கிப் பதிவுகளைச் சரிபார்க்க இந்தியன் ஓவர்சீஸ் வங்கிக்கு நான் அனுமதி அளிக்கிறேன்.',
  hrmsConsentTitle: 'வங்கிப் பதிவு சரிபார்ப்பு சம்மதம்',
  hrmsConsentFull:
    'எனது ஊழியர் பதிவில் காட்டப்பட்டுள்ள மொபைல் எண்ணைப் பயன்படுத்தி, நான் வங்கியின் ஏற்கனவே உள்ள வாடிக்கையாளரா என்பதைத் தீர்மானிக்க இந்தியன் ஓவர்சீஸ் வங்கி தனது வாடிக்கையாளர் பதிவுகளில் தேட நான் அனுமதி அளிக்கிறேன்.\n\nபொருந்தும் பதிவில் உள்ள விவரங்களை — பெயர், பிறந்த தேதி, முகவரி மற்றும் PAN உள்பட — படித்து, இந்தக் கடன் விண்ணப்பத்தை முன்னெடுக்கப் பயன்படுத்த வங்கிக்கு நான் அனுமதி அளிக்கிறேன்.\n\nஇந்தச் சரிபார்ப்பின் முடிவு அடுத்து வங்கி என்னிடம் என்ன கேட்கும் என்பதைத் தீர்மானிக்கிறது என்பதையும், பொருந்திய பதிவில் தேவையான விவரங்கள் ஏற்கனவே இருந்தால் அவற்றை மீண்டும் வழங்கக் கேட்கப்படமாட்டேன் என்பதையும் நான் புரிந்துகொள்கிறேன்.',
  hrmsContinueBtn: 'தொடரவும்',
  hrmsGateSheetTitle: 'அறிவிப்புகளை ஏற்கவும்',
  hrmsGateSheetAcceptBtn: 'ஒப்புக்கொண்டு தொடரவும்',

  // ── HRMS details screen — record error ──
  hrmsRecordErrorMessage:
    'HRMS இலிருந்து உங்கள் ஊழியர் விவரங்களைப் பெற முடியவில்லை. மீண்டும் முயற்சிக்கவும்.',
  hrmsRetryBtn: 'மீண்டும் முயற்சிக்கவும்',

  // ── HRMS details screen — banking partner row and trust badges ──
  hrmsBankingPartnerLabel: 'வழங்குபவர்',
  hrmsBankName: 'இந்தியன் ஓவர்சீஸ் வங்கி',
  hrmsBadgeInstant: 'உடனடி கடன்',
  hrmsBadgeSecure: 'பாதுகாப்பானது',

  // ── Dedupe outcome screen ──
  dedupeOutcomeBadge: 'ஏற்கனவே உள்ள IOB வாடிக்கையாளர்',
  dedupeOutcomeTitle: 'நீங்கள் ஏற்கனவே IOB வாடிக்கையாளர்',
  dedupeOutcomeSubtitle:
    'உங்கள் விவரங்களை வங்கிப் பதிவில் கண்டோம். மேலும் எதுவும் உள்ளிடத் தேவையில்லை.',
  dedupeOutcomeMatchedLabel: 'உங்கள் பதிவு செய்யப்பட்ட மொபைல் எண் மூலம் பொருந்தியது',
  dedupeOutcomeRemainingLabel: 'ஒரு படி மட்டுமே',
  dedupeOutcomeRemainingDetail:
    'உங்கள் அடையாளச் சரிபார்ப்பை முடிக்க உங்கள் CKYC பதிவைச் சரிபார்க்க வேண்டும்.',
  dedupeOutcomeContinueBtn: 'தொடரவும்',
  dedupeOutcomeRetrieving: 'உங்கள் CKYC அடையாள எண் பெறப்படுகிறது…',

  // ── PAN + Aadhaar entry screen ──
  panAadhaarTitle: 'உங்கள் அடையாளத்தைச் சரிபார்க்கவும்',
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
  panAadhaarReadMore: 'மேலும் படிக்க',
  panAadhaarConsentTitle: 'ஆதார் சம்மதம்',
  panAadhaarConsentFull:
    'e-KYC ஐ செய்வதில் இணங்கி அடையாள சரிபார்ப்புக்காக UIDAI இலிருந்து எனது பெயர், பிறந்த தேதி மற்றும் புகைப்படத்தைப் பெற இந்தியன் ஓவர்சீஸ் வங்கிக்கு நான் ஒப்புக்கொள்கிறேன்.',
  panAadhaarContinueBtn: 'தொடரவும்',

  // ── CKYC download consent + confirming OTP ──
  ckycDownloadConsentText:
    'சரிபார்ப்புக்காக எனது CKYC பதிவுகளைச் சரிபார்த்து பெற இந்தியன் ஓவர்சீஸ் வங்கிக்கு நான் அனுமதி அளிக்கிறேன்.',
  ckycDownloadConsentFull:
    'இந்த விண்ணப்பத்தில் நான் வழங்கி சரிபார்க்கப்பட்ட ஆதார் எண்ணைப் பயன்படுத்தி, மைய KYC பதிவேட்டிலிருந்து (CKYCR) எனது KYC பதிவைப் பெற இந்தியன் ஓவர்சீஸ் வங்கிக்கு நான் அனுமதி அளிக்கிறேன்.\n\nபெறப்படும் பதிவு இந்தக் கடன் விண்ணப்பத்தை மட்டுமே செயலாக்கப் பயன்படும் — எனது அடையாளத்தை உறுதிப்படுத்த, எனது விவரங்களை வங்கியின் பதிவுகளுடன் சரிபார்க்க, மற்றும் அதற்குத் தேவையான KYC நடைமுறைகளை முடிக்க — வேறு எந்த நோக்கத்திற்கும் பயன்படாது என்பதை நான் புரிந்துகொள்கிறேன்.\n\nபெறப்பட்ட தரவை இந்தியன் ஓவர்சீஸ் வங்கி பாதுகாப்பாகவும் ரகசியமாகவும் வைத்திருக்கும், சட்டம் அல்லது ஒழுங்குமுறை அமைப்பு கோரும் தவிர வேறு யாருடனும் பங்கிடாது, மற்றும் பொருந்தும் விதிமுறைகள் கோரும் காலம் வரை மட்டுமே வைத்திருக்கும் என்பதை நான் புரிந்துகொள்கிறேன்.\n\nஇந்த அனுமதியை நான் விருப்பத்துடன் அளிக்கிறேன், மேலும் இதற்குப் பயன்படுத்தப்படும் ஆதார் எண் என்னுடையது என்பதை உறுதிப்படுத்துகிறேன்.',
  ckycDownloadConsentTitle: 'CKYC பதிவு பெறுவதற்கான சம்மதம்',
  ckycOtpTitle: 'CKYC பதிவு பெறுதலை உறுதிப்படுத்தவும்',
  ckycOtpSubtitle: '{mobile} க்கு அனுப்பப்பட்ட 6 இலக்க OTP ஐ உள்ளிடவும்',
  ckycConfirmBtn: 'OTP மூலம் உறுதிப்படுத்தவும்',

  // ── CKYC download consent, PAN-keyed (the shared OTP screen) ──
  ckycPanConsentText:
    'சரிபார்ப்புக்காக எனது CKYC பதிவைப் பெற இந்தியன் ஓவர்சீஸ் வங்கிக்கு நான் அனுமதி அளிக்கிறேன்.',
  ckycPanConsentTitle: 'CKYC பதிவிறக்க சம்மதம்',
  ckycPanConsentFull:
    'எனது PAN ஐப் பயன்படுத்தி மைய KYC பதிவேட்டிலிருந்து (CKYCR) எனது KYC பதிவைப் பெறவும், பெறப்பட்ட விவரங்களை இந்தக் கடன் விண்ணப்பத்தில் எனது அடையாளத்தை நிறுவப் பயன்படுத்தவும் இந்தியன் ஓவர்சீஸ் வங்கிக்கு நான் அனுமதி அளிக்கிறேன்.\n\nபெறப்படும் பதிவில் எனது பெயர், பிறந்த தேதி, முகவரி, புகைப்படம் மற்றும் எனது CKYC அடையாளத்தில் பதிவு செய்யப்பட்ட ஆவணங்கள் இருக்கக்கூடும் என்பதை நான் புரிந்துகொள்கிறேன்.\n\nபெறப்பட்ட தரவை இந்தியன் ஓவர்சீஸ் வங்கி பாதுகாப்பாகவும் ரகசியமாகவும் வைத்திருக்கும் என்பதை நான் புரிந்துகொள்கிறேன்.',

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
