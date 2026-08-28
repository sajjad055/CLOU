/**
 * HRMS flow registry — type declarations and flow identifiers.
 *
 * This module is pure: no React imports, no JSX, no routing. Components ask it
 * `(flowId, stepId) -> route` questions and never hardcode an HRMS destination.
 */

/** The five HRMS-originated demo journeys. */
export const HRMS_FLOW_IDS = [
  'hrms-pan-etb',
  'hrms-pan-ntb',
  'hrms-nopan-etb',
  'hrms-nopan-ntb',
  'hrms-nopan-etb-nopan',
] as const;

export type HrmsFlowId = (typeof HRMS_FLOW_IDS)[number];

/**
 * The eight pre-existing journeys. Listed here only so HRMS code can assert it
 * never claims one of them; their routing stays where it is today.
 */
export const EXISTING_FLOW_IDS = [
  'ntb-no-ckyc',
  'etb-no-ckyc',
  'ntb-no-ckyc-id',
  'etb-no-ckyc-id',
  'ntb-knows-ckyc',
  'etb-knows-ckyc',
  'ntb-knows-ckyc-id',
  'etb-knows-ckyc-id',
] as const;

export type ExistingFlowId = (typeof EXISTING_FLOW_IDS)[number];

/** Journey milestones. Each one is a step whose completion asks the registry where to go. */
export type HrmsStepId =
  | 'hrms-fetch' // phase of /hrms-details
  | 'hrms-details' // review + consent phase of /hrms-details
  | 'mobile-dedupe' // processing phase of /hrms-details (all five flows)
  | 'dedupe-outcome' // /hrms-dedupe-outcome
  | 'pan-aadhaar-entry' // /hrms-pan-aadhaar
  | 'aadhaar' // /aadhaar-verification (one or more segments)
  | 'ckyc-otp' // /otp-verification
  | 'ckyc-details' // /ckyc-customer-details
  | 'cif-success' // /success
  | 'offers'; // /sanctioned-offers (terminal)

/** One simulated backend step rendered as a labelled progress row. */
export interface ProcessingStep {
  id: string;
  labelEn: string;
  labelTa: string;
  /** 1000–2500 ms, except `hrms-fetch` which sits in 1500–4000 ms. */
  durationMs: number;
}

export interface HrmsStep {
  id: HrmsStepId;
  /** Route that renders this step. */
  route: string;
  /** In-component phase name, when this step is a phase of `route` rather than its own route. */
  phase?: 'fetching' | 'review' | 'processing';
  /** Simulated backend steps this phase renders, in order. */
  processing?: ProcessingStep[];
  /** Route to navigate to when this step completes. `null` marks the terminal step. */
  next: string | null;
}

/** Internal step names of AadhaarVerificationPage, reused verbatim. */
export type AadhaarStepId =
  | 'aadhaar-input'
  | 'aadhaar-otp'
  | 'confirm-details'
  | 'face-verification-ready'
  | 'blink'
  | 'scanning'
  | 'verifying'
  | 'verified'
  | 'ckyc-consent-otp' // NEW, HRMS-only: CKYC-download consent confirmed by OTP
  | 'ckyc-retrieval' // NEW, HRMS-only
  | 'updating-records'
  | 'success';

export interface AadhaarSegment {
  id: string;
  /** Ordered subset of AadhaarVerificationPage's internal steps. Steps not listed are never rendered. */
  steps: AadhaarStepId[];
  /** Seed the Aadhaar number from journey state instead of asking for it. */
  seedAadhaarFromJourney: boolean;
  /** Relabel `updating-records` as CIF creation for this segment. */
  updatingRecordsAs?: 'records' | 'cif';
  /** Where to go when the last step of this segment finishes. */
  exitRoute: string;
  /** Processing steps rendered by the `ckyc-retrieval` step, when present. */
  processing?: ProcessingStep[];
}

export interface CkycDetailsConfig {
  /** Dedupe outcome carried by the HRMS flow. */
  dedupeResult: 'etb' | 'ntb';
  /** Where the displayed PAN comes from. `'none'` renders a blank PAN with an explanatory label. */
  panSource: 'hrms' | 'bank-record' | 'journey' | 'none';
  next: string;
}

export interface HrmsFlowDefinition {
  id: HrmsFlowId;
  /** Dev Preview entry, 1–60 chars, unique. */
  labelEn: string;
  /** Dev Preview description, 1–200 chars, screen names in presentation order. */
  descriptionEn: string;
  entryRoute: '/hrms-details';
  hrmsPanPresent: boolean;
  /** Outcome of the mobile-number dedupe against IOB records. */
  dedupe: 'etb' | 'ntb';
  /**
   * PAN carried by the bank record the mobile dedupe matched.
   *
   *   • a string  — the matched record holds this PAN (flow 3)
   *   • `null`    — the record was matched but holds no PAN (flow 5)
   *   • `undefined` — the flow never consults a bank record for a PAN, either
   *     because HRMS already supplied one (flows 1, 2) or because the dedupe
   *     found no record at all (flow 4)
   */
  bankRecordPan?: string | null;
  steps: HrmsStep[];
  aadhaarSegments: AadhaarSegment[];
  ckycDetails: CkycDetailsConfig;
}

// ─────────────────────────────────────────────────────────────────────────────
// Fixed dummy data
// ─────────────────────────────────────────────────────────────────────────────

/** The single demo employee record every HRMS flow fetches. */
export const HRMS_EMPLOYEE = {
  name: 'Aravind Kumar S.',
  /** Government employee identifier the HRMS record is keyed on. */
  employeeId: 'TN-EMP-4471902',
  mobile: '9876543210',
  dob: '12/03/1992',
  /** Used only when the flow declares `hrmsPanPresent`. */
  pan: 'ABCPK1234F',
  address: 'No. 14, Anna Salai, Guindy, Chennai, Tamil Nadu 600032',
} as const;

/**
 * PAN held by the bank record the mobile dedupe matches. Flow 3 only; flow 5
 * matches a record that holds none.
 */
export const BANK_RECORD_PAN = 'ABCPK1234F';

// ─────────────────────────────────────────────────────────────────────────────
// Simulated processing-step catalogue
// ─────────────────────────────────────────────────────────────────────────────
//
// Every step renders a Loader2 spinner plus its label while active, and a
// CheckCircle plus text when complete, so progress is signalled by icon and
// text rather than colour alone. Durations: `hrmsFetch` sits in 1500–4000 ms,
// every other step in 1000–2500 ms.

/** HRMS employee-record fetch, rendered by the `fetching` phase of `/hrms-details`. */
export const hrmsFetch: ProcessingStep = {
  id: 'hrms-fetch',
  labelEn: 'Fetching your employee details from HRMS…',
  labelTa: 'HRMS இலிருந்து உங்கள் ஊழியர் விவரங்கள் பெறப்படுகின்றன…',
  durationMs: 2500,
};

/**
 * Mobile-number dedupe against IOB records — the first step of the `processing`
 * phase in all five flows, and what the landing screen's declaration authorises.
 *
 * This is the step that replaced the IOB account-number question: the mobile
 * number already arrived with the HRMS record, so whether the customer banks
 * with IOB (and what that record holds) is answered without asking them.
 */
export const mobileDedupe: ProcessingStep = {
  id: 'mobile-dedupe',
  labelEn: 'Checking your mobile number against bank records…',
  labelTa: 'உங்கள் மொபைல் எண் வங்கிப் பதிவுகளுடன் சரிபார்க்கப்படுகிறது…',
  durationMs: 2200,
};

/** CKYC identifier retrieval, keyed by an already-known PAN (flows 1–3). */
export const ckycId: ProcessingStep = {
  id: 'ckyc-id',
  labelEn: 'Retrieving your CKYC identifier…',
  labelTa: 'உங்கள் CKYC அடையாள எண் பெறப்படுகிறது…',
  durationMs: 1800,
};

/** PAN found on the matched bank record (flow 3). */
export const bankRecordPanFound: ProcessingStep = {
  id: 'bank-record-pan',
  labelEn: 'Retrieving the PAN from your bank record…',
  labelTa: 'உங்கள் வங்கிப் பதிவிலிருந்து PAN பெறப்படுகிறது…',
  durationMs: 1800,
};

/** No PAN on the matched bank record (flow 5). */
export const bankRecordPanAbsent: ProcessingStep = {
  id: 'bank-record-pan-absent',
  labelEn: 'Checking your bank record for a PAN…',
  labelTa: 'உங்கள் வங்கிப் பதிவில் PAN உள்ளதா எனச் சரிபார்க்கப்படுகிறது…',
  durationMs: 1800,
};

/** CKYC retrieval keyed by Aadhaar, rendered by the `ckyc-retrieval` Aadhaar step. */
export const ckycByAadhaar: ProcessingStep = {
  id: 'ckyc-by-aadhaar',
  labelEn: 'Retrieving your CKYC record using your Aadhaar number…',
  labelTa: 'உங்கள் ஆதார் எண்ணைப் பயன்படுத்தி உங்கள் CKYC பதிவு பெறப்படுகிறது…',
  durationMs: 2000,
};

/** CIF creation, rendered by `updating-records` when `updatingRecordsAs === 'cif'`. */
export const cifCreate: ProcessingStep = {
  id: 'cif-create',
  labelEn: 'Creating your customer record (CIF)…',
  labelTa: 'உங்கள் வாடிக்கையாளர் பதிவு (CIF) உருவாக்கப்படுகிறது…',
  durationMs: 2000,
};

/** The full catalogue, keyed by step id, for lookup and iteration. */
export const HRMS_PROCESSING_STEPS: Record<string, ProcessingStep> = {
  [hrmsFetch.id]: hrmsFetch,
  [mobileDedupe.id]: mobileDedupe,
  [ckycId.id]: ckycId,
  [bankRecordPanFound.id]: bankRecordPanFound,
  [bankRecordPanAbsent.id]: bankRecordPanAbsent,
  [ckycByAadhaar.id]: ckycByAadhaar,
  [cifCreate.id]: cifCreate,
};

// ─────────────────────────────────────────────────────────────────────────────
// Flow definitions
// ─────────────────────────────────────────────────────────────────────────────
//
// Each definition transcribes the per-flow step table from the design document.
//
// `next` conventions:
//   • A route different from `route` means "navigate there when this step ends".
//   • A `next` equal to `route` marks an in-component phase transition: the
//     screen swaps phase and stays put (e.g. `fetching` -> `review`).
//   • `null` marks the terminal step. Only the `offers` step carries it, so a
//     resolver returning `null` always means "not an HRMS step".
//
// For `aadhaar` steps the authoritative destination is the matching
// `aadhaarSegments[i].exitRoute`; the step row records the same route so the
// table stays readable next to the design document.

/** Flow 1 — HRMS returned a PAN, the mobile dedupe finds an existing bank customer. */
const hrmsPanEtb: HrmsFlowDefinition = {
  id: 'hrms-pan-etb',
  labelEn: '▶ HRMS PAN Present, ETB',
  descriptionEn:
    'HRMS fetch → HRMS details + both consents → OTP → Mobile dedupe + CKYC ID → CKYC details (ETB) → Offers',
  entryRoute: '/hrms-details',
  hrmsPanPresent: true,
  dedupe: 'etb',
  steps: [
    {
      id: 'hrms-fetch',
      route: '/hrms-details',
      phase: 'fetching',
      processing: [hrmsFetch],
      next: '/hrms-details',
    },
    // The HRMS record already carries a PAN, so both the bank-record check and
    // the CKYC download can be authorised on this screen. The customer confirms
    // them with the OTP, and only then does any lookup run — so this flow asks
    // for everything up front and shows nothing but progress afterwards.
    { id: 'hrms-details', route: '/hrms-details', phase: 'review', next: '/otp-verification' },
    // Both lookups run here, after the OTP has confirmed the consents given on
    // the previous screen.
    {
      id: 'ckyc-otp',
      route: '/otp-verification',
      processing: [mobileDedupe, ckycId],
      next: '/ckyc-customer-details',
    },
    { id: 'ckyc-details', route: '/ckyc-customer-details', next: '/sanctioned-offers' },
    { id: 'offers', route: '/sanctioned-offers', next: null },
  ],
  aadhaarSegments: [],
  ckycDetails: {
    dedupeResult: 'etb',
    panSource: 'hrms',
    next: '/sanctioned-offers',
  },
};

/** Flow 2 — HRMS returned a PAN, the mobile dedupe finds no record, full Aadhaar + Face RD + CIF. */
const hrmsPanNtb: HrmsFlowDefinition = {
  id: 'hrms-pan-ntb',
  labelEn: '▶ HRMS PAN Present, NTB',
  descriptionEn:
    'HRMS fetch → HRMS details + both consents → OTP → Mobile dedupe + CKYC ID → CKYC details (NTB) → Aadhaar + Face → CIF → Offers',
  entryRoute: '/hrms-details',
  hrmsPanPresent: true,
  dedupe: 'ntb',
  steps: [
    {
      id: 'hrms-fetch',
      route: '/hrms-details',
      phase: 'fetching',
      processing: [hrmsFetch],
      next: '/hrms-details',
    },
    // Same shape as flow 1: PAN in hand, so both consents are taken here and
    // confirmed by the OTP before either lookup runs. What differs is only what
    // the dedupe finds — no record — and therefore what follows the review.
    { id: 'hrms-details', route: '/hrms-details', phase: 'review', next: '/otp-verification' },
    {
      id: 'ckyc-otp',
      route: '/otp-verification',
      processing: [mobileDedupe, ckycId],
      next: '/ckyc-customer-details',
    },
    { id: 'ckyc-details', route: '/ckyc-customer-details', next: '/aadhaar-verification' },
    // Segment 0: `cif-create` is rendered by `updating-records`.
    {
      id: 'aadhaar',
      route: '/aadhaar-verification',
      processing: [cifCreate],
      next: '/sanctioned-offers',
    },
    { id: 'offers', route: '/sanctioned-offers', next: null },
  ],
  aadhaarSegments: [
    {
      id: 'full',
      steps: [
        'aadhaar-input',
        'aadhaar-otp',
        'confirm-details',
        'face-verification-ready',
        'blink',
        'scanning',
        'verifying',
        'updating-records',
      ],
      seedAadhaarFromJourney: false,
      updatingRecordsAs: 'cif',
      exitRoute: '/sanctioned-offers',
    },
  ],
  ckycDetails: {
    dedupeResult: 'ntb',
    panSource: 'hrms',
    next: '/aadhaar-verification',
  },
};

/**
 * Flow 3 — no HRMS PAN, but the mobile dedupe matches a bank record that holds
 * one. The PAN lookup and CKYC identifier retrieval run in the same processing
 * phase as the dedupe, so nothing is asked of the customer between the landing
 * screen and the confirming OTP.
 */
const hrmsNopanEtb: HrmsFlowDefinition = {
  id: 'hrms-nopan-etb',
  labelEn: '▶ HRMS No PAN, ETB (bank record has PAN)',
  descriptionEn:
    'HRMS fetch → HRMS details → Mobile dedupe + PAN from bank record → Dedupe outcome + CKYC consent → OTP → CKYC details (ETB) → Offers',
  entryRoute: '/hrms-details',
  hrmsPanPresent: false,
  dedupe: 'etb',
  bankRecordPan: BANK_RECORD_PAN,
  steps: [
    {
      id: 'hrms-fetch',
      route: '/hrms-details',
      phase: 'fetching',
      processing: [hrmsFetch],
      next: '/hrms-details',
    },
    // `review` renders the "not available" PAN label for this flow.
    { id: 'hrms-details', route: '/hrms-details', phase: 'review', next: '/hrms-details' },
    // The CKYC identifier retrieval that used to sit here has moved behind the
    // outcome screen's consent: this flow's landing card said no PAN was
    // available, so the dedupe finding one is news worth stating before
    // anything is done with it.
    {
      id: 'mobile-dedupe',
      route: '/hrms-details',
      phase: 'processing',
      processing: [mobileDedupe, bankRecordPanFound],
      next: '/hrms-dedupe-outcome',
    },
    {
      id: 'dedupe-outcome',
      route: '/hrms-dedupe-outcome',
      processing: [ckycId],
      next: '/otp-verification',
    },
    { id: 'ckyc-otp', route: '/otp-verification', next: '/ckyc-customer-details' },
    { id: 'ckyc-details', route: '/ckyc-customer-details', next: '/sanctioned-offers' },
    { id: 'offers', route: '/sanctioned-offers', next: null },
  ],
  aadhaarSegments: [],
  ckycDetails: {
    dedupeResult: 'etb',
    panSource: 'bank-record',
    next: '/sanctioned-offers',
  },
};

/**
 * Flow 4 — no HRMS PAN, and the mobile dedupe finds no bank record at all. With
 * no PAN available from either source the journey falls back to Aadhaar, and
 * being new to the bank it also needs Face RD and a CIF. So the Aadhaar screen
 * runs twice as two disjoint segments, and no second Aadhaar OTP is ever shown.
 */
const hrmsNopanNtb: HrmsFlowDefinition = {
  id: 'hrms-nopan-ntb',
  labelEn: '▶ HRMS No PAN, NTB (no bank record)',
  descriptionEn:
    'HRMS fetch → HRMS details → Mobile dedupe (no match) → PAN + Aadhaar → Aadhaar OTP → Aadhaar details + CKYC consent → CKYC OTP → CKYC by Aadhaar → CKYC details → Face → CIF → Offers',
  entryRoute: '/hrms-details',
  hrmsPanPresent: false,
  dedupe: 'ntb',
  steps: [
    {
      id: 'hrms-fetch',
      route: '/hrms-details',
      phase: 'fetching',
      processing: [hrmsFetch],
      next: '/hrms-details',
    },
    // `review` renders the "not available" PAN label for this flow.
    { id: 'hrms-details', route: '/hrms-details', phase: 'review', next: '/hrms-details' },
    // The dedupe finds nothing, so there is no PAN to pull a CKYC record with
    // and the journey continues on Aadhaar.
    {
      id: 'mobile-dedupe',
      route: '/hrms-details',
      phase: 'processing',
      processing: [mobileDedupe],
      next: '/hrms-pan-aadhaar',
    },
    { id: 'pan-aadhaar-entry', route: '/hrms-pan-aadhaar', next: '/aadhaar-verification' },
    // Segment 0 — Aadhaar OTP, Aadhaar details, CKYC consent + OTP, then CKYC
    // retrieval by Aadhaar. The confirming OTP is taken inside the segment.
    {
      id: 'aadhaar',
      route: '/aadhaar-verification',
      processing: [ckycByAadhaar],
      next: '/ckyc-customer-details',
    },
    // No `ckyc-otp` step: this flow pulls its CKYC record by Aadhaar and takes
    // both the declaration and the confirming OTP inside the Aadhaar segment, so
    // it never visits the shared OTP screen. Declaring the step would make that
    // screen offer a PAN-keyed CKYC consent this flow cannot act on.
    { id: 'ckyc-details', route: '/ckyc-customer-details', next: '/aadhaar-verification' },
    // Segment 1 — Face RD then CIF creation.
    {
      id: 'aadhaar',
      route: '/aadhaar-verification',
      processing: [cifCreate],
      next: '/success',
    },
    { id: 'cif-success', route: '/success', next: '/sanctioned-offers' },
    { id: 'offers', route: '/sanctioned-offers', next: null },
  ],
  aadhaarSegments: [
    {
      id: 'otp-then-ckyc',
      // The Aadhaar is verified by OTP, its details are shown, and the CKYC
      // download is consented to and confirmed by a second OTP on that details
      // screen — so the record is only pulled after the customer authorised it.
      steps: ['aadhaar-otp', 'confirm-details', 'ckyc-consent-otp', 'ckyc-retrieval'],
      seedAadhaarFromJourney: true,
      processing: [ckycByAadhaar],
      // The confirming OTP now happens inside the segment, so the separate hop
      // to the shared OTP screen is no longer needed.
      exitRoute: '/ckyc-customer-details',
    },
    {
      id: 'face-only',
      steps: [
        'face-verification-ready',
        'blink',
        'scanning',
        'verifying',
        'verified',
        'updating-records',
        'success',
      ],
      seedAadhaarFromJourney: true,
      updatingRecordsAs: 'cif',
      exitRoute: '/success',
    },
  ],
  ckycDetails: {
    dedupeResult: 'ntb',
    panSource: 'journey',
    next: '/aadhaar-verification',
  },
};

/**
 * Flow 5 — no HRMS PAN, and although the mobile dedupe matches a bank record
 * that record holds no PAN either, so the journey falls back to Aadhaar. Being
 * an existing customer it needs no Face RD and no CIF creation.
 */
const hrmsNopanEtbNopan: HrmsFlowDefinition = {
  id: 'hrms-nopan-etb-nopan',
  labelEn: '▶ HRMS No PAN, ETB, bank record holds no PAN',
  descriptionEn:
    'HRMS fetch → HRMS details → Mobile dedupe (no PAN on record) → PAN + Aadhaar → Aadhaar OTP → Aadhaar details + CKYC consent → CKYC OTP → CKYC by Aadhaar → CKYC details (ETB) → Offers',
  entryRoute: '/hrms-details',
  hrmsPanPresent: false,
  dedupe: 'etb',
  bankRecordPan: null,
  steps: [
    {
      id: 'hrms-fetch',
      route: '/hrms-details',
      phase: 'fetching',
      processing: [hrmsFetch],
      next: '/hrms-details',
    },
    // `review` renders the "not available" PAN label for this flow.
    { id: 'hrms-details', route: '/hrms-details', phase: 'review', next: '/hrms-details' },
    // The record is matched but carries no PAN, so there is still nothing to
    // pull a CKYC record with and the journey continues on Aadhaar.
    {
      id: 'mobile-dedupe',
      route: '/hrms-details',
      phase: 'processing',
      processing: [mobileDedupe, bankRecordPanAbsent],
      next: '/hrms-pan-aadhaar',
    },
    { id: 'pan-aadhaar-entry', route: '/hrms-pan-aadhaar', next: '/aadhaar-verification' },
    // Segment 0 — Aadhaar OTP, Aadhaar details, CKYC consent + OTP, then CKYC
    // retrieval by Aadhaar. Identical to flow 4's first segment now that the
    // Aadhaar number is captured on `/hrms-pan-aadhaar` rather than in-segment.
    {
      id: 'aadhaar',
      route: '/aadhaar-verification',
      processing: [ckycByAadhaar],
      next: '/ckyc-customer-details',
    },
    // No `ckyc-otp` step, for the same reason as flow 4: the CKYC record is
    // pulled by Aadhaar and consented to inside the Aadhaar segment.
    { id: 'ckyc-details', route: '/ckyc-customer-details', next: '/sanctioned-offers' },
    { id: 'offers', route: '/sanctioned-offers', next: null },
  ],
  aadhaarSegments: [
    {
      id: 'otp-then-ckyc',
      // Verify the Aadhaar by OTP, show the details, take CKYC-download consent
      // there and confirm it by OTP, and only then pull the record. The Aadhaar
      // number itself arrives from `/hrms-pan-aadhaar`.
      steps: ['aadhaar-otp', 'confirm-details', 'ckyc-consent-otp', 'ckyc-retrieval'],
      seedAadhaarFromJourney: true,
      processing: [ckycByAadhaar],
      // The confirming OTP now happens inside the segment, so the separate hop
      // to the shared OTP screen is no longer needed.
      exitRoute: '/ckyc-customer-details',
    },
  ],
  ckycDetails: {
    dedupeResult: 'etb',
    panSource: 'none',
    next: '/sanctioned-offers',
  },
};

/** The five HRMS flow definitions, keyed by flow id. */
export const HRMS_FLOWS: Record<HrmsFlowId, HrmsFlowDefinition> = {
  'hrms-pan-etb': hrmsPanEtb,
  'hrms-pan-ntb': hrmsPanNtb,
  'hrms-nopan-etb': hrmsNopanEtb,
  'hrms-nopan-ntb': hrmsNopanNtb,
  'hrms-nopan-etb-nopan': hrmsNopanEtbNopan,
};
// ─────────────────────────────────────────────────────────────────────────────
// Resolvers
// ─────────────────────────────────────────────────────────────────────────────
//
// Every resolver is total over `string`: a non-HRMS flow id — including all
// eight `EXISTING_FLOW_IDS`, `''` and any unrecognised value — yields the
// neutral answer (`null`, `[]` or `false`). That is the structural guarantee the
// design rests on: an existing flow can never be routed into HRMS behaviour,
// because a caller that branches on a resolver result simply never takes the
// HRMS branch (Requirements 1.1, 1.2, 1.7).

const HRMS_FLOW_ID_SET: ReadonlySet<string> = new Set<string>(HRMS_FLOW_IDS);

/**
 * Reads `localStorage['activeFlow']`.
 *
 * Returns `''` when the key is absent or storage is unavailable (private mode,
 * disabled storage, quota errors). `''` is not an HRMS flow, so a storage
 * failure degrades to "existing behaviour" rather than throwing.
 */
export function getActiveFlow(): string {
  try {
    return localStorage.getItem('activeFlow') ?? '';
  } catch {
    return '';
  }
}

/**
 * True only for the five HRMS ids. False for every one of the eight existing
 * flow ids, for `''`, and for any other string.
 */
export function isHrmsFlow(flow: string): flow is HrmsFlowId {
  return HRMS_FLOW_ID_SET.has(flow);
}

/** The flow definition, or `null` for every non-HRMS flow. */
export function getHrmsFlow(flow: string): HrmsFlowDefinition | null {
  return isHrmsFlow(flow) ? HRMS_FLOWS[flow] : null;
}

/**
 * Entry route for a journey-start control (LandingPage's Get Started), or
 * `null` when the caller must keep its own destination. Callers read this as
 * `navigate(hrmsEntryRoute(getActiveFlow()) ?? '/phone-input')`.
 */
export function hrmsEntryRoute(flow: string): string | null {
  return getHrmsFlow(flow)?.entryRoute ?? null;
}

/**
 * The first step row matching `step`.
 *
 * Flow 4 declares two rows with id `'aadhaar'` — one per Aadhaar segment — so
 * this returns the first. That is deliberate: for Aadhaar navigation the
 * authoritative destination is the matching
 * `aadhaarSegments[journey.aadhaarSegmentIndex].exitRoute`, not the step row.
 * The rows exist so the table reads alongside the design document, and
 * `hrmsProcessing(flow, 'aadhaar')` likewise resolves to the first row.
 */
function findStep(flow: string, step: HrmsStepId): HrmsStep | null {
  const definition = getHrmsFlow(flow);
  if (!definition) return null;
  return definition.steps.find((candidate) => candidate.id === step) ?? null;
}

/**
 * Destination after `from` completes.
 *
 * Three distinct results, and callers must tell them apart:
 *
 * 1. A route different from the step's own `route` — navigate there.
 * 2. A route equal to the step's own `route` — an in-component phase
 *    transition. The screen swaps phase and stays put (`fetching` -> `review`,
 *    `entry` -> `processing`). A caller detects this by comparing the returned
 *    string against its own route.
 * 3. `null` — either the terminal `offers` step, or `flow` is not an HRMS flow
 *    / declares no such step. `offers` is the only step in any of the five
 *    flows carrying `next: null`, so a caller that is not sitting on
 *    `/sanctioned-offers` can read `null` as "not an HRMS flow, keep existing
 *    behaviour". Use `hasStep(flow, from)` to disambiguate explicitly.
 */
export function hrmsNextRoute(flow: string, from: HrmsStepId): string | null {
  return findStep(flow, from)?.next ?? null;
}

/**
 * The simulated backend steps `from` renders, in order. `[]` when the flow is
 * not an HRMS flow, declares no such step, or declares the step with no
 * processing rows — so a caller can always map over the result.
 */
export function hrmsProcessing(flow: string, from: HrmsStepId): ProcessingStep[] {
  return findStep(flow, from)?.processing ?? [];
}

/**
 * The Aadhaar segment at `index`, or `null` when the flow has no segments
 * (flows 1 and 3, and every existing flow) or `index` is past the end.
 *
 * `AadhaarVerificationPage` treats `null` as "run `DEFAULT_SEQUENCE` and keep
 * the existing exit map", which is exactly the behaviour of the eight existing
 * flows. A segment's `exitRoute` is authoritative for Aadhaar navigation.
 */
export function getAadhaarSegment(flow: string, index: number): AadhaarSegment | null {
  const segments = getHrmsFlow(flow)?.aadhaarSegments;
  if (!segments || !Number.isInteger(index) || index < 0 || index >= segments.length) {
    return null;
  }
  return segments[index];
}

/**
 * HRMS config for `CKYCCustomerDetailsPage`, or `null` for every non-HRMS flow
 * so the page falls through to its existing `flowConfigs` lookup.
 */
export function getCkycDetailsConfig(flow: string): CkycDetailsConfig | null {
  return getHrmsFlow(flow)?.ckycDetails ?? null;
}

/**
 * Whether `flow` declares `step` at all. `false` for every non-HRMS flow.
 *
 * Useful both for negative assertions ("flows 1–3 present no
 * `pan-aadhaar-entry`") and for disambiguating a `null` from `hrmsNextRoute`: a
 * `null` with
 * `hasStep === true` is the terminal `offers` step; a `null` with
 * `hasStep === false` means the flow does not own this step.
 */
export function hasStep(flow: string, step: HrmsStepId): boolean {
  return findStep(flow, step) !== null;
}
