/**
 * Salary-advance / KYC home-screen state — read/write over `localStorage`,
 * exposed to React through a `useSyncExternalStore` hook.
 *
 * This is the single source of truth the redesigned HomePage reads to decide
 * which of its four states each tab shows:
 *
 *   • KYC not started   — `completedSteps === 0`
 *   • KYC in progress   — `0 < completedSteps < KYC_STEPS.length`
 *   • KYC complete       — `completedSteps === KYC_STEPS.length`, advance not yet taken
 *   • Advance activated  — `advanceActivated === true`
 *
 * The module is deliberately UI-free: no React imports beyond the hook, no
 * routing. Screens push transitions into it (`markKycComplete` on the offers
 * screen, `markAdvanceActivated` on the activation screen) and read it back on
 * the home screen, so no screen needs to know about any other.
 *
 * Storage choice: `localStorage`, so a demo's progress survives a reload — the
 * home screen is where someone returns between steps. Dev Preview resets it when
 * a fresh flow is selected.
 */

import { useSyncExternalStore } from 'react';

const STORAGE_KEY = 'salaryAdvanceState';
const EVENT_NAME = 'salaryadvancechange';

export type KycStatus = 'not-started' | 'in-progress' | 'complete';

export interface KycStep {
  id: string;
  labelEn: string;
  labelTa: string;
  descEn: string;
  descTa: string;
}

/**
 * The high-level verification milestones shown as a checklist on the "Complete
 * KYC" tab. These are a deliberately generic reading of the underlying journeys
 * (which differ per flow — ETB customers skip Aadhaar/Face, etc.); the home
 * screen speaks in milestones, not in the exact per-flow screen sequence.
 */
export const KYC_STEPS: KycStep[] = [
  {
    id: 'identity',
    labelEn: 'Identity verification',
    labelTa: 'அடையாள சரிபார்ப்பு',
    descEn: 'Confirm your details',
    descTa: 'உங்கள் விவரங்களை உறுதிப்படுத்தவும்',
  },
  {
    id: 'aadhaar',
    labelEn: 'Aadhaar verification',
    labelTa: 'ஆதார் சரிபார்ப்பு',
    descEn: 'Verify your Aadhaar with an OTP',
    descTa: 'OTP மூலம் உங்கள் ஆதாரைச் சரிபார்க்கவும்',
  },
  {
    id: 'face',
    labelEn: 'Face verification',
    labelTa: 'முக சரிபார்ப்பு',
    descEn: 'A quick liveness check',
    descTa: 'விரைவான உயிர்ப்பு சோதனை',
  },
  {
    id: 'ckyc',
    labelEn: 'CKYC & eligibility',
    labelTa: 'CKYC மற்றும் தகுதி',
    descEn: 'Records check and credit eligibility',
    descTa: 'பதிவுச் சரிபார்ப்பு மற்றும் கடன் தகுதி',
  },
];

export const KYC_TOTAL_STEPS = KYC_STEPS.length;

export interface SalaryAdvanceState {
  /** 0..KYC_TOTAL_STEPS. */
  completedSteps: number;
  advanceActivated: boolean;
  /** Whether the activated advances have been linked to a UPI app. */
  upiConnected: boolean;
}

const DEFAULT_STATE: SalaryAdvanceState = {
  completedSteps: 0,
  advanceActivated: false,
  upiConnected: false,
};

function clampSteps(n: unknown): number {
  const num = typeof n === 'number' ? n : Number(n);
  if (!Number.isFinite(num)) return 0;
  return Math.max(0, Math.min(KYC_TOTAL_STEPS, Math.floor(num)));
}

function parse(raw: string | null): SalaryAdvanceState {
  if (raw === null) return DEFAULT_STATE;
  try {
    const parsed = JSON.parse(raw) as Record<string, unknown>;
    return {
      completedSteps: clampSteps(parsed.completedSteps),
      advanceActivated: Boolean(parsed.advanceActivated),
      upiConnected: Boolean(parsed.upiConnected),
    };
  } catch {
    return DEFAULT_STATE;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Cached snapshot
// ─────────────────────────────────────────────────────────────────────────────
//
// useSyncExternalStore requires getSnapshot to return a stable reference while
// the underlying value is unchanged — a fresh object every call loops forever.
// We memoise on the raw storage string: same string, same object.

let cachedRaw: string | null = null;
let cachedState: SalaryAdvanceState = DEFAULT_STATE;

function getSnapshot(): SalaryAdvanceState {
  let raw: string | null;
  try {
    raw = localStorage.getItem(STORAGE_KEY);
  } catch {
    return DEFAULT_STATE;
  }
  if (raw === cachedRaw) return cachedState;
  cachedRaw = raw;
  cachedState = parse(raw);
  return cachedState;
}

function write(next: SalaryAdvanceState): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    // Storage unavailable — keep going; subscribers still get the event so the
    // in-session UI updates, it just won't survive a reload.
  }
  try {
    window.dispatchEvent(new Event(EVENT_NAME));
  } catch {
    // No window (non-browser context) — nothing to notify.
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Mutations
// ─────────────────────────────────────────────────────────────────────────────

/** Set the number of completed KYC milestones (clamped to 0..total). */
export function setCompletedSteps(n: number): void {
  write({ ...getSnapshot(), completedSteps: clampSteps(n) });
}

/** Mark all KYC milestones done. Called when the journey reaches the offers screen. */
export function markKycComplete(): void {
  const cur = getSnapshot();
  if (cur.completedSteps >= KYC_TOTAL_STEPS) return;
  write({ ...cur, completedSteps: KYC_TOTAL_STEPS });
}

/** Mark the salary advance activated. Implies KYC is complete. */
export function markAdvanceActivated(): void {
  write({ ...getSnapshot(), completedSteps: KYC_TOTAL_STEPS, advanceActivated: true });
}

/** Mark the activated advances as linked to a UPI app. */
export function markUpiConnected(): void {
  write({ ...getSnapshot(), upiConnected: true });
}

/** Clear all home-screen state back to a first-time visitor. */
export function resetSalaryAdvance(): void {
  write(DEFAULT_STATE);
}

// ─────────────────────────────────────────────────────────────────────────────
// Derived reads
// ─────────────────────────────────────────────────────────────────────────────

export function kycStatusOf(state: SalaryAdvanceState): KycStatus {
  if (state.completedSteps <= 0) return 'not-started';
  if (state.completedSteps >= KYC_TOTAL_STEPS) return 'complete';
  return 'in-progress';
}

/** 0..100, rounded. */
export function kycPercent(state: SalaryAdvanceState): number {
  return Math.round((clampSteps(state.completedSteps) / KYC_TOTAL_STEPS) * 100);
}

// ─────────────────────────────────────────────────────────────────────────────
// Hook
// ─────────────────────────────────────────────────────────────────────────────

function subscribe(callback: () => void): () => void {
  window.addEventListener(EVENT_NAME, callback);
  window.addEventListener('storage', callback);
  return () => {
    window.removeEventListener(EVENT_NAME, callback);
    window.removeEventListener('storage', callback);
  };
}

/**
 * Shared salary-advance state. Re-renders the caller whenever the state changes
 * anywhere in the app (another tab, Dev Preview, or a flow screen calling a
 * mutation).
 */
export function useSalaryAdvanceState(): SalaryAdvanceState {
  return useSyncExternalStore(subscribe, getSnapshot, () => DEFAULT_STATE);
}
