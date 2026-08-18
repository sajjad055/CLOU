/**
 * HRMS journey state — read/write/reset over `sessionStorage`.
 *
 * This module is pure: no React, no routing. It holds the values an HRMS
 * journey captures as the customer moves through it (consent, Aadhaar, PAN) so
 * later screens can read them back.
 *
 * Storage split, deliberately:
 *   • `activeFlow` stays in **localStorage** — the selected demo journey should
 *     survive a browser restart.
 *   • journey state lives in **sessionStorage** — a fresh tab starts a fresh
 *     journey, and nothing captured in one demo leaks into the next session.
 */

import {
  BANK_RECORD_PAN,
  HRMS_EMPLOYEE,
  HRMS_FLOWS,
  type HrmsFlowId,
} from './hrmsFlows';

const KEY = 'hrmsJourney'; // sessionStorage

export interface HrmsJourneyState {
  /** The flow this state belongs to. A mismatch with the requested flow forces a reset. */
  flow: HrmsFlowId;
  /** Bank-record check consent, given on the landing screen to authorise the dedupe. */
  consentAccepted: boolean;
  /** 12 digits, unmasked, captured on PAN_Aadhaar_Entry_Screen or AadhaarVerificationPage. */
  aadhaarNumber: string;
  /** '' when no PAN is available. */
  pan: string;
  panSource: 'hrms' | 'bank-record' | 'user' | 'none';
  /** Index into the flow's `aadhaarSegments`. */
  aadhaarSegmentIndex: number;
}

const PAN_SOURCES: ReadonlyArray<HrmsJourneyState['panSource']> = [
  'hrms',
  'bank-record',
  'user',
  'none',
];

/**
 * A fresh state seeded from the flow definition.
 *
 * A flow that declares `hrmsPanPresent` starts with the HRMS employee's PAN
 * already in hand, so `pan` and `panSource` reflect that. Every other flow
 * starts with no PAN and discovers one later (from the bank record the mobile
 * dedupe matches, or from the customer typing it on PAN_Aadhaar_Entry_Screen).
 */
function freshState(flow: HrmsFlowId): HrmsJourneyState {
  const hrmsPanPresent = HRMS_FLOWS[flow].hrmsPanPresent;
  return {
    flow,
    consentAccepted: false,
    aadhaarNumber: '',
    pan: hrmsPanPresent ? HRMS_EMPLOYEE.pan : '',
    panSource: hrmsPanPresent ? 'hrms' : 'none',
    aadhaarSegmentIndex: 0,
  };
}

/**
 * Validates a value parsed out of storage. Storage content is untrusted — it
 * can be edited by hand, left behind by an older build, or corrupted — so every
 * field is type-checked and a single bad field rejects the whole object.
 */
function isJourneyState(value: unknown, flow: HrmsFlowId): value is HrmsJourneyState {
  if (typeof value !== 'object' || value === null) return false;
  const state = value as Record<string, unknown>;

  return (
    // Staleness gate: state written under a different flow is discarded.
    state.flow === flow &&
    typeof state.consentAccepted === 'boolean' &&
    typeof state.aadhaarNumber === 'string' &&
    typeof state.pan === 'string' &&
    PAN_SOURCES.includes(state.panSource as HrmsJourneyState['panSource']) &&
    typeof state.aadhaarSegmentIndex === 'number' &&
    Number.isInteger(state.aadhaarSegmentIndex) &&
    state.aadhaarSegmentIndex >= 0
  );
}

/**
 * The current journey state for `flow`.
 *
 * Returns a fresh state seeded from the flow definition when the key is absent,
 * when parsing fails, when storage is unavailable (private mode, disabled
 * storage), when the stored shape is invalid, or when the stored `flow` differs
 * from `flow`.
 *
 * That last case makes this the single staleness gate: switching journeys
 * silently discards everything captured under the previous one, so no caller
 * needs to know about flow switching (Requirements 1.9, 14.11).
 */
export function readJourney(flow: HrmsFlowId): HrmsJourneyState {
  let raw: string | null = null;
  try {
    raw = sessionStorage.getItem(KEY);
  } catch {
    return freshState(flow);
  }
  if (raw === null) return freshState(flow);

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return freshState(flow);
  }

  return isJourneyState(parsed, flow) ? parsed : freshState(flow);
}

/**
 * Shallow-merges `patch` onto the current state, persists it and returns the
 * merged state.
 *
 * `flow` is forced onto the result after the merge, so state can never be
 * written under a mismatched id — not even if a caller passes `flow` inside the
 * patch. A storage write failure is swallowed: the caller still receives the
 * merged state and the journey continues, just without persistence.
 */
export function writeJourney(
  flow: HrmsFlowId,
  patch: Partial<HrmsJourneyState>,
): HrmsJourneyState {
  const merged: HrmsJourneyState = { ...readJourney(flow), ...patch, flow };
  try {
    sessionStorage.setItem(KEY, JSON.stringify(merged));
  } catch {
    // Storage unavailable or over quota — keep going with the in-memory value.
  }
  return merged;
}

/** Removes the stored state. Called by DevPreview on every flow-entry activation. */
export function resetJourney(): void {
  try {
    sessionStorage.removeItem(KEY);
  } catch {
    // Nothing to do: storage is unavailable, so there is no state to remove.
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Aadhaar segment progression
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Increments `aadhaarSegmentIndex`, persists it and returns the new index.
 *
 * Called on segment **exit**, never on entry. That ordering is what makes flow
 * 4 work: `AadhaarVerificationPage` is entered twice, and each entry reads the
 * index that the previous exit left behind.
 *
 *   • First entry  — index 0, so segment A (`otp-then-ckyc`) runs. On exit this
 *     bumps the index to 1 and navigates to the segment's `exitRoute`.
 *   • Second entry — index 1, so segment B (`face-only`) runs, skipping the
 *     Aadhaar OTP the customer already cleared.
 *
 * Advancing on entry instead would replay segment A on the second visit, or
 * skip it on the first. Flows with a single segment (2 and 5) advance past the
 * end on exit; `getAadhaarSegment` returns `null` for an out-of-range index, so
 * an unexpected third entry degrades to the default sequence rather than
 * throwing (Requirements 13.9, 13.10).
 */
export function advanceAadhaarSegment(flow: HrmsFlowId): number {
  const next = readJourney(flow).aadhaarSegmentIndex + 1;
  writeJourney(flow, { aadhaarSegmentIndex: next });
  return next;
}

// ─────────────────────────────────────────────────────────────────────────────
// PAN display resolution
// ─────────────────────────────────────────────────────────────────────────────

/** Five uppercase letters, four digits, one uppercase letter. */
const PAN_PATTERN = /^[A-Z]{5}\d{4}[A-Z]$/;

/**
 * The PAN string to display on `CKYCCustomerDetailsPage`, per the flow's
 * declared `ckycDetails.panSource`:
 *
 *   • `'hrms'`        -> `HRMS_EMPLOYEE.pan` (flows 1, 2)
 *   • `'bank-record'` -> `BANK_RECORD_PAN`   (flow 3)
 *   • `'journey'`     -> the PAN the customer typed, or `''` when the optional
 *                        field was left blank (flow 4)
 *   • `'none'`        -> `''`                (flow 5)
 *
 * The result is always either empty or a well-formed PAN (Property 21). The
 * `'journey'` value comes from storage, which is untrusted, so a malformed
 * stored value is treated as absent rather than rendered — the screen then
 * shows the "PAN not provided" label, which is the honest reading of a value
 * that is not a PAN.
 */
export function resolveDisplayPan(flow: HrmsFlowId): string {
  const pan = (() => {
    switch (HRMS_FLOWS[flow].ckycDetails.panSource) {
      case 'hrms':
        return HRMS_EMPLOYEE.pan as string;
      case 'bank-record':
        return BANK_RECORD_PAN;
      case 'journey':
        return readJourney(flow).pan;
      case 'none':
        return '';
    }
  })();

  return PAN_PATTERN.test(pan) ? pan : '';
}

/**
 * Whether the PAN row should render the "PAN not available" / "PAN not
 * provided" label instead of a value — true exactly when
 * `resolveDisplayPan(flow)` is empty.
 *
 * Exposed as its own function so the screen never re-derives the condition
 * (and never drifts from it) with its own emptiness check.
 */
export function shouldShowPanUnavailableLabel(flow: HrmsFlowId): boolean {
  return resolveDisplayPan(flow) === '';
}
