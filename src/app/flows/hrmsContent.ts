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
  /** Screen-reader heading for the processing phase, which shows no visible title. */
  hrmsDetailsTitle: string;
  hrmsFetchingTitle: string;
  hrmsFetchingSubtitle: string;
  /** Greeting word, rendered ahead of the fetched employee name. */
  hrmsGreeting: string;
  /** Lead line below the greeting, naming what the journey delivers. */
  hrmsGreetingLead: string;

  // ── HRMS details screen — field labels ──
  hrmsMobileLabel: string;
  hrmsDobLabel: string;
  hrmsPanLabel: string;
  hrmsPanUnavailableLabel: string;

  // ── HRMS details screen — consent and controls ──
  /**
   * Consent wording, shown only on the flows whose HRMS record carried a PAN.
   * The `hrms-nopan-*` flows have captured neither a PAN nor an Aadhaar number at
   * this point, so there is nothing a CKYC download could be authorised against
   * and they show no consent here.
   */
  hrmsConsentText: string;
  hrmsContinueBtn: string;

  // ── HRMS details screen — record error ──
  hrmsRecordErrorMessage: string;
  hrmsRetryBtn: string;

  // ── HRMS details screen — banking partner row and trust badges ──
  hrmsBankingPartnerLabel: string;
  /** Alt text for the IOB logo. */
  hrmsBankName: string;
  hrmsBadgeInstant: string;
  hrmsBadgeSecure: string;

  // ── Account choice screen ──
  accountChoiceTitle: string;
  accountChoiceSubtitle: string;
  accountChoiceHasAccount: string;
  accountChoiceNoAccount: string;
  /**
   * Context line shown above the PAN and Aadhaar fields once "I don't have an
   * IOB account" is selected, naming what the verification will run on.
   */
  accountChoiceNoAccountContext: string;
  accountChoiceSelectedMarker: string;
  accountChoiceContinueBtn: string;

  /**
   * Declaration shown inline above the CTA while "I have an IOB account" is
   * selected. The account number is what makes both lookups possible, so the
   * bank-record read and the CKYC download are authorised together here, in
   * place of the Aadhaar declaration the other option shows.
   */
  accountChoiceAccountConsentText: string;
  accountChoiceAccountConsentTitle: string;
  /** Full bank-record and CKYC wording, paragraph-separated by `\n\n`. */
  accountChoiceAccountConsentFull: string;

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
  hrmsFetchingTitle: 'Fetching Your Employee Details',
  hrmsFetchingSubtitle: 'This takes a few seconds. Please stay on this screen.',
  hrmsGreeting: 'Hello',
  hrmsGreetingLead: 'Get salary advances on your UPI',

  // ── HRMS details screen — field labels ──
  hrmsMobileLabel: 'Mobile Number',
  hrmsDobLabel: 'Date of Birth',
  hrmsPanLabel: 'PAN',
  hrmsPanUnavailableLabel: 'Not available in your HRMS record',

  // ── HRMS details screen — consent and controls ──
  hrmsConsentText:
    'I authorise Indian Overseas Bank to validate my PAN and to download my CKYC record for this credit application.',
  hrmsContinueBtn: 'Continue',

  // ── HRMS details screen — record error ──
  hrmsRecordErrorMessage:
    'We could not retrieve your employee details from HRMS. Please try again.',
  hrmsRetryBtn: 'Retry',

  // ── HRMS details screen — banking partner row and trust badges ──
  hrmsBankingPartnerLabel: 'Powered by',
  hrmsBankName: 'Indian Overseas Bank',
  hrmsBadgeInstant: 'Get credit instantly',
  hrmsBadgeSecure: 'Safe and Secure',

  // ── Account choice screen ──
  accountChoiceTitle: 'Do You Have an IOB Account?',
  accountChoiceSubtitle:
    'We need this to verify your identity and complete your credit application.',
  accountChoiceHasAccount: 'I have an IOB account',
  accountChoiceNoAccount: "I don't have an IOB account",
  accountChoiceNoAccountContext:
    'We will continue your verification with your Aadhaar and PAN.',
  accountChoiceSelectedMarker: 'Selected',
  accountChoiceContinueBtn: 'Continue',
  accountChoiceAccountConsentText:
    'I authorise Indian Overseas Bank to check my bank records and to download my CKYC record for verification.',
  accountChoiceAccountConsentTitle: 'Bank Record and CKYC Consent',
  accountChoiceAccountConsentFull:
    'I authorise Indian Overseas Bank to access and verify the account records held against the account number I have provided, including the name, date of birth, address and PAN recorded against it.\n\nI authorise Indian Overseas Bank to retrieve my Central KYC (CKYC) record from the Central KYC Registry using the identifiers held against my account, and to use the retrieved details for identity verification in this credit application.\n\nI understand that Indian Overseas Bank will keep my personal identity data secure and confidential, and will not use it for any purpose other than verifying my identity and assessing this application.\n\nI confirm that the account number I have provided belongs to me and that I am authorised to permit these checks against it.',

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
  hrmsFetchingTitle: 'உங்கள் ஊழியர் விவரங்கள் பெறப்படுகின்றன',
  hrmsFetchingSubtitle: 'இதற்கு சில வினாடிகள் ஆகும். இந்தத் திரையிலேயே இருக்கவும்.',
  hrmsGreeting: 'வணக்கம்',
  hrmsGreetingLead: 'உங்கள் UPI யில் சம்பள முன்பணம் பெறுங்கள்',

  // ── HRMS details screen — field labels ──
  hrmsMobileLabel: 'மொபைல் எண்',
  hrmsDobLabel: 'பிறந்த தேதி',
  hrmsPanLabel: 'PAN',
  hrmsPanUnavailableLabel: 'உங்கள் HRMS பதிவில் கிடைக்கவில்லை',

  // ── HRMS details screen — consent and controls ──
  hrmsConsentText:
    'இந்தக் கடன் விண்ணப்பத்திற்காக எனது PAN ஐ சரிபார்க்கவும், எனது CKYC பதிவைப் பெறவும் இந்தியன் ஓவர்சீஸ் வங்கிக்கு நான் அனுமதி அளிக்கிறேன்.',
  hrmsContinueBtn: 'தொடரவும்',

  // ── HRMS details screen — record error ──
  hrmsRecordErrorMessage:
    'HRMS இலிருந்து உங்கள் ஊழியர் விவரங்களைப் பெற முடியவில்லை. மீண்டும் முயற்சிக்கவும்.',
  hrmsRetryBtn: 'மீண்டும் முயற்சிக்கவும்',

  // ── HRMS details screen — banking partner row and trust badges ──
  hrmsBankingPartnerLabel: 'வழங்குபவர்',
  hrmsBankName: 'இந்தியன் ஓவர்சீஸ் வங்கி',
  hrmsBadgeInstant: 'உடனடி கடன்',
  hrmsBadgeSecure: 'பாதுகாப்பானது',

  // ── Account choice screen ──
  accountChoiceTitle: 'உங்களுக்கு IOB கணக்கு உள்ளதா?',
  accountChoiceSubtitle:
    'உங்கள் அடையாளத்தைச் சரிபார்த்து உங்கள் கடன் விண்ணப்பத்தை முடிக்க இது தேவை.',
  accountChoiceHasAccount: 'எனக்கு IOB கணக்கு உள்ளது',
  accountChoiceNoAccount: 'எனக்கு IOB கணக்கு இல்லை',
  accountChoiceNoAccountContext:
    'உங்கள் ஆதார் மற்றும் PAN மூலம் உங்கள் சரிபார்ப்பைத் தொடர்வோம்.',
  accountChoiceSelectedMarker: 'தேர்ந்தெடுக்கப்பட்டது',
  accountChoiceContinueBtn: 'தொடரவும்',
  accountChoiceAccountConsentText:
    'எனது வங்கிப் பதிவுகளைச் சரிபார்க்கவும், சரிபார்ப்புக்காக எனது CKYC பதிவைப் பெறவும் இந்தியன் ஓவர்சீஸ் வங்கிக்கு நான் அனுமதி அளிக்கிறேன்.',
  accountChoiceAccountConsentTitle: 'வங்கிப் பதிவு மற்றும் CKYC சம்மதம்',
  accountChoiceAccountConsentFull:
    'நான் அளித்த கணக்கு எண்ணுக்கு எதிராக உள்ள கணக்குப் பதிவுகளை — அதில் பதிவு செய்யப்பட்ட பெயர், பிறந்த தேதி, முகவரி மற்றும் PAN உள்பட — அணுகி சரிபார்க்க இந்தியன் ஓவர்சீஸ் வங்கிக்கு நான் அனுமதி அளிக்கிறேன்.\n\nஎனது கணக்கில் உள்ள அடையாளங்களைப் பயன்படுத்தி மைய KYC (CKYC) பதிவேட்டிலிருந்து எனது CKYC பதிவைப் பெறவும், பெறப்பட்ட விவரங்களை இந்தக் கடன் விண்ணப்பத்தில் அடையாள சரிபார்ப்புக்குப் பயன்படுத்தவும் நான் அனுமதி அளிக்கிறேன்.',

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
