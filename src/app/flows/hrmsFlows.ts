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
  | 'ckyc-pan-dedupe' // processing phase of /hrms-details (flows 1, 2)
  | 'account-choice' // /hrms-account-choice
  | 'account-entry' // entry phase of /hrms-account-entry
  | 'account-pan-lookup' // processing phase of /hrms-account-entry (flows 3, 5)
  | 'pan-aadhaar-entry' // /hrms-pan-aadhaar
  | 'aadhaar' // /aadhaar-verification (one or more segments)
  | 'ckyc-otp' // /otp-verification
  | 'ckyc-details' // /ckyc-customer-details
  | 'cif-success' // /success -> /loading
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
  phase?: 'fetching' | 'review' | 'processing' | 'entry';
  /** Simulated backend steps this phase renders, in order. */
  processing?: ProcessingStep[];
  /** Route to navigate to when this step completes. `null` marks the terminal step. */
  next: string | null;
  /**
   * Alternate destination for a branching step. Used by `account-choice`, where
   * `next` is the "I have an IOB account" route and `altNext` the "I don't" route.
   */
  altNext?: string;
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
  /** Dedupe banner rendered on CKYCCustomerDetailsPage. HRMS flows only. */
  dedupeResult: 'etb' | 'ntb';
  /** Where the displayed PAN comes from. `'none'` renders a blank PAN with an explanatory label. */
  panSource: 'hrms' | 'account-record' | 'journey' | 'none';
  next: string;
  /** Post-review processing. Empty for every HRMS flow — dedupe already ran earlier. */
  steps: ProcessingStep[];
}

export interface HrmsFlowDefinition {
  id: HrmsFlowId;
  /** Dev Preview entry, 1–60 chars, unique. */
  labelEn: string;
  /** Dev Preview description, 1–200 chars, screen names in presentation order. */
  descriptionEn: string;
  entryRoute: '/hrms-details';
  hrmsPanPresent: boolean;
  dedupe: 'etb' | 'ntb';
  /** PAN held by the IOB account record. `null` = none (flow 5). `undefined` = flow never looks. */
  accountRecordPan?: string | null;
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
  mobile: '9876543210',
  dob: '12/03/1992',
  /** Used only when the flow declares `hrmsPanPresent`. */
  pan: 'ABCPK1234F',
} as const;

/** PAN held by the IOB account record. Flow 3 only; flow 5's record has none. */
export const ACCOUNT_RECORD_PAN = 'ABCPK1234F';

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

/** CKYC identifier retrieval, first half of the flow 1–2 dedupe phase. */
export const ckycId: ProcessingStep = {
  id: 'ckyc-id',
  labelEn: 'Retrieving your CKYC identifier…',
  labelTa: 'உங்கள் CKYC அடையாள எண் பெறப்படுகிறது…',
  durationMs: 1800,
};

/** PAN dedupe against bank records, second half of the flow 1–2 dedupe phase. */
export const panDedupe: ProcessingStep = {
  id: 'pan-dedupe',
  labelEn: 'Checking your PAN against bank records…',
  labelTa: 'உங்கள் PAN வங்கிப் பதிவுகளுடன் சரிபார்க்கப்படுகிறது…',
  durationMs: 2000,
};

/** PAN found on the IOB account record (flow 3). */
export const accountPan: ProcessingStep = {
  id: 'account-pan',
  labelEn: 'Retrieving the PAN from your account record…',
  labelTa: 'உங்கள் கணக்குப் பதிவிலிருந்து PAN பெறப்படுகிறது…',
  durationMs: 1800,
};

/** CKYC record verification following an account-record PAN lookup (flow 3). */
export const ckycVerify: ProcessingStep = {
  id: 'ckyc-verify',
  labelEn: 'Verifying your CKYC record…',
  labelTa: 'உங்கள் CKYC பதிவு சரிபார்க்கப்படுகிறது…',
  durationMs: 2000,
};

/** No PAN on the account record (flow 5). */
export const accountPanAbsent: ProcessingStep = {
  id: 'account-pan-absent',
  labelEn: 'Checking your account record for a PAN…',
  labelTa: 'உங்கள் கணக்குப் பதிவில் PAN உள்ளதா எனச் சரிபார்க்கப்படுகிறது…',
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
  [ckycId.id]: ckycId,
  [panDedupe.id]: panDedupe,
  [accountPan.id]: accountPan,
  [ckycVerify.id]: ckycVerify,
  [accountPanAbsent.id]: accountPanAbsent,
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

/** Flow 1 — HRMS returned a PAN, PAN dedupe finds an existing bank customer. */
const hrmsPanEtb: HrmsFlowDefinition = {
  id: 'hrms-pan-etb',
  labelEn: '▶ HRMS PAN Present, ETB',
  descriptionEn:
    'HRMS fetch → HRMS details → CKYC ID + PAN dedupe → OTP → CKYC details (ETB) → Offers',
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
    { id: 'hrms-details', route: '/hrms-details', phase: 'review', next: '/hrms-details' },
    {
      id: 'ckyc-pan-dedupe',
      route: '/hrms-details',
      phase: 'processing',
      processing: [ckycId, panDedupe],
      next: '/otp-verification',
    },
    { id: 'ckyc-otp', route: '/otp-verification', next: '/ckyc-customer-details' },
    { id: 'ckyc-details', route: '/ckyc-customer-details', next: '/sanctioned-offers' },
    { id: 'offers', route: '/sanctioned-offers', next: null },
  ],
  aadhaarSegments: [],
  ckycDetails: {
    dedupeResult: 'etb',
    panSource: 'hrms',
    next: '/sanctioned-offers',
    steps: [],
  },
};

/** Flow 2 — HRMS returned a PAN, dedupe finds no record, full Aadhaar + Face RD + CIF. */
const hrmsPanNtb: HrmsFlowDefinition = {
  id: 'hrms-pan-ntb',
  labelEn: '▶ HRMS PAN Present, NTB',
  descriptionEn:
    'HRMS fetch → HRMS details → CKYC ID + PAN dedupe → OTP → CKYC details (NTB) → Aadhaar + Face → CIF → Offers',
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
    { id: 'hrms-details', route: '/hrms-details', phase: 'review', next: '/hrms-details' },
    {
      id: 'ckyc-pan-dedupe',
      route: '/hrms-details',
      phase: 'processing',
      processing: [ckycId, panDedupe],
      next: '/otp-verification',
    },
    { id: 'ckyc-otp', route: '/otp-verification', next: '/ckyc-customer-details' },
    { id: 'ckyc-details', route: '/ckyc-customer-details', next: '/aadhaar-verification' },
    // Segment 0: `cif-create` is rendered by `updating-records`.
    {
      id: 'aadhaar',
      route: '/aadhaar-verification',
      processing: [cifCreate],
      next: '/success',
    },
    // `/success` (SuccessSplashPage) chains into `/loading` (LoadingPage); both existing.
    { id: 'cif-success', route: '/success', next: '/sanctioned-offers' },
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
        'verified',
        'updating-records',
        'success',
      ],
      seedAadhaarFromJourney: false,
      updatingRecordsAs: 'cif',
      exitRoute: '/success',
    },
  ],
  ckycDetails: {
    dedupeResult: 'ntb',
    panSource: 'hrms',
    next: '/aadhaar-verification',
    steps: [],
  },
};

/** Flow 3 — no HRMS PAN, the IOB account record holds one, dedupe finds an existing customer. */
const hrmsNopanEtb: HrmsFlowDefinition = {
  id: 'hrms-nopan-etb',
  labelEn: '▶ HRMS No PAN, ETB (account has PAN)',
  descriptionEn:
    'HRMS fetch → HRMS details → Account choice → Account number → PAN found + CKYC → OTP → CKYC details → Offers',
  entryRoute: '/hrms-details',
  hrmsPanPresent: false,
  dedupe: 'etb',
  accountRecordPan: ACCOUNT_RECORD_PAN,
  steps: [
    {
      id: 'hrms-fetch',
      route: '/hrms-details',
      phase: 'fetching',
      processing: [hrmsFetch],
      next: '/hrms-details',
    },
    // `review` renders a blank PAN row for this flow.
    { id: 'hrms-details', route: '/hrms-details', phase: 'review', next: '/hrms-account-choice' },
    {
      id: 'account-choice',
      route: '/hrms-account-choice',
      next: '/hrms-account-entry', // "I have an IOB account"
      altNext: '/hrms-pan-aadhaar', // "I don't have an IOB account"
    },
    {
      id: 'account-entry',
      route: '/hrms-account-entry',
      phase: 'entry',
      next: '/hrms-account-entry',
    },
    {
      id: 'account-pan-lookup',
      route: '/hrms-account-entry',
      phase: 'processing',
      processing: [accountPan, ckycVerify],
      next: '/otp-verification',
    },
    { id: 'ckyc-otp', route: '/otp-verification', next: '/ckyc-customer-details' },
    { id: 'ckyc-details', route: '/ckyc-customer-details', next: '/sanctioned-offers' },
    { id: 'offers', route: '/sanctioned-offers', next: null },
  ],
  aadhaarSegments: [],
  ckycDetails: {
    dedupeResult: 'etb',
    panSource: 'account-record',
    next: '/sanctioned-offers',
    steps: [],
  },
};

/**
 * Flow 4 — no HRMS PAN, no IOB account. The Aadhaar screen runs twice as two
 * disjoint segments, so no second Aadhaar OTP is ever shown. No
 * `account-entry` step appears anywhere in this flow.
 */
const hrmsNopanNtb: HrmsFlowDefinition = {
  id: 'hrms-nopan-ntb',
  labelEn: '▶ HRMS No PAN, NTB (no IOB account)',
  descriptionEn:
    'HRMS fetch → HRMS details → Account choice → PAN + Aadhaar → Aadhaar OTP → CKYC by Aadhaar → OTP → CKYC details → Face → CIF → Offers',
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
    // `review` renders a blank PAN row for this flow.
    { id: 'hrms-details', route: '/hrms-details', phase: 'review', next: '/hrms-account-choice' },
    // This flow presents no IOB_Account_Entry_Screen, so both answers lead to
    // the PAN + Aadhaar entry screen.
    {
      id: 'account-choice',
      route: '/hrms-account-choice',
      next: '/hrms-pan-aadhaar',
      altNext: '/hrms-pan-aadhaar', // "I don't have an IOB account"
    },
    { id: 'pan-aadhaar-entry', route: '/hrms-pan-aadhaar', next: '/aadhaar-verification' },
    // Segment 0 — Aadhaar OTP then CKYC retrieval by Aadhaar.
    {
      id: 'aadhaar',
      route: '/aadhaar-verification',
      processing: [ckycByAadhaar],
      next: '/otp-verification',
    },
    { id: 'ckyc-otp', route: '/otp-verification', next: '/ckyc-customer-details' },
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
      steps: ['aadhaar-otp', 'ckyc-retrieval'],
      seedAadhaarFromJourney: true,
      processing: [ckycByAadhaar],
      exitRoute: '/otp-verification',
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
    steps: [],
  },
};

/**
 * Flow 5 — no HRMS PAN and the IOB account record holds none either, so the
 * journey falls back to Aadhaar. No Face RD and no CIF creation.
 */
const hrmsNopanEtbNopan: HrmsFlowDefinition = {
  id: 'hrms-nopan-etb-nopan',
  labelEn: '▶ HRMS No PAN, ETB, account holds no PAN',
  descriptionEn:
    'HRMS fetch → HRMS details → Account choice → Account number → No PAN found → Aadhaar + OTP → CKYC by Aadhaar → OTP → CKYC details → Offers',
  entryRoute: '/hrms-details',
  hrmsPanPresent: false,
  dedupe: 'etb',
  accountRecordPan: null,
  steps: [
    {
      id: 'hrms-fetch',
      route: '/hrms-details',
      phase: 'fetching',
      processing: [hrmsFetch],
      next: '/hrms-details',
    },
    // `review` renders a blank PAN row for this flow.
    { id: 'hrms-details', route: '/hrms-details', phase: 'review', next: '/hrms-account-choice' },
    {
      id: 'account-choice',
      route: '/hrms-account-choice',
      next: '/hrms-account-entry', // "I have an IOB account"
      altNext: '/hrms-pan-aadhaar', // "I don't have an IOB account"
    },
    {
      id: 'account-entry',
      route: '/hrms-account-entry',
      phase: 'entry',
      next: '/hrms-account-entry',
    },
    {
      id: 'account-pan-lookup',
      route: '/hrms-account-entry',
      phase: 'processing',
      processing: [accountPanAbsent],
      next: '/aadhaar-verification',
    },
    // Segment 0 — Aadhaar entry, Aadhaar OTP, then CKYC retrieval by Aadhaar.
    {
      id: 'aadhaar',
      route: '/aadhaar-verification',
      processing: [ckycByAadhaar],
      next: '/otp-verification',
    },
    { id: 'ckyc-otp', route: '/otp-verification', next: '/ckyc-customer-details' },
    { id: 'ckyc-details', route: '/ckyc-customer-details', next: '/sanctioned-offers' },
    { id: 'offers', route: '/sanctioned-offers', next: null },
  ],
  aadhaarSegments: [
    {
      id: 'entry-otp-ckyc',
      steps: ['aadhaar-input', 'aadhaar-otp', 'ckyc-retrieval'],
      seedAadhaarFromJourney: false,
      processing: [ckycByAadhaar],
      exitRoute: '/otp-verification',
    },
  ],
  ckycDetails: {
    dedupeResult: 'etb',
    panSource: 'none',
    next: '/sanctioned-offers',
    steps: [],
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
 * Useful both for negative assertions ("flow 4 presents no `account-entry`")
 * and for disambiguating a `null` from `hrmsNextRoute`: a `null` with
 * `hasStep === true` is the terminal `offers` step; a `null` with
 * `hasStep === false` means the flow does not own this step.
 */
export function hasStep(flow: string, step: HrmsStepId): boolean {
  return findStep(flow, step) !== null;
}
