import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router';
import { motion, useReducedMotion } from 'motion/react';
import { AlertCircle, ArrowRight, CheckCircle, Info, Landmark, Loader2 } from 'lucide-react';
import { TopBar } from './TopBar';
import { StickyFooter } from './StickyFooter';
import { useLanguage } from '../hooks/useLanguage';
import { tr } from '../flows/hrmsContent';
import {
  getActiveFlow,
  getHrmsFlow,
  hrmsNextRoute,
  hrmsProcessing,
  isHrmsFlow,
  type HrmsFlowId,
  type ProcessingStep,
} from '../flows/hrmsFlows';
import { readJourney, writeJourney } from '../flows/hrmsJourney';

/**
 * IOB_Account_Entry_Screen — `/hrms-account-entry`.
 *
 * Two phases:
 *   • `entry`      — one labelled numeric input, 9–18 digits, plus the continue control.
 *   • `processing` — the flow's `account-pan-lookup` progress steps, then a deterministic
 *                    outcome message, then an automatic navigation onward.
 *
 * The outcome is driven only by the flow definition's `accountRecordPan`, so the same
 * flow always produces the same screens and the same message (Requirements 14.3, 14.4):
 *   • a PAN string  (`hrms-nopan-etb`)       -> "PAN found in your account record"
 *   • `null`        (`hrms-nopan-etb-nopan`) -> "No PAN is linked to this account…"
 *
 * Both outcomes carry an icon **and** text, so the result never depends on colour alone,
 * and both auto-advance without asking for further input (Requirements 6.7, 6.8).
 */

type Phase = 'entry' | 'processing';

const MIN_DIGITS = 9;
const MAX_DIGITS = 18;

/** How long the outcome message stays on screen before the automatic navigation. */
const OUTCOME_DWELL_MS = 1200;

export function IOBAccountEntryPage() {
  const navigate = useNavigate();
  const [language] = useLanguage();
  const reduceMotion = useReducedMotion();

  const flow = getActiveFlow();
  const definition = getHrmsFlow(flow);

  const [accountNumber, setAccountNumber] = useState(() =>
    isHrmsFlow(flow) ? readJourney(flow).iobAccountNumber : '',
  );
  const [phase, setPhase] = useState<Phase>('entry');
  const [showShortError, setShowShortError] = useState(false);

  // Progress through the flow's simulated retrieval steps.
  const steps: ProcessingStep[] = hrmsProcessing(flow, 'account-pan-lookup');
  const [stepIndex, setStepIndex] = useState(0);
  const [completedIds, setCompletedIds] = useState<string[]>([]);

  /** Guards the one-time journey write when the retrieval finishes. */
  const outcomeWritten = useRef(false);

  const digitCount = accountNumber.length;
  const isLongEnough = digitCount >= MIN_DIGITS;
  const stepsDone = phase === 'processing' && stepIndex >= steps.length;

  /**
   * `undefined` for a flow that never looks at an account record; a string when the
   * record holds a PAN; `null` when it holds none.
   */
  const accountRecordPan = definition?.accountRecordPan;
  const panFound = typeof accountRecordPan === 'string' && accountRecordPan.length > 0;

  // ── Retrieval progression ────────────────────────────────────────────────
  useEffect(() => {
    if (phase !== 'processing') return;
    if (stepIndex >= steps.length) return;

    const current = steps[stepIndex];
    const timer = setTimeout(() => {
      setCompletedIds((prev) => [...prev, current.id]);
      setStepIndex((prev) => prev + 1);
    }, current.durationMs);

    // Clearing on unmount means a back press mid-retrieval advances nothing.
    return () => clearTimeout(timer);
  }, [phase, stepIndex, steps]);

  // ── Outcome, journey write, and the automatic navigation ─────────────────
  useEffect(() => {
    if (!stepsDone || !isHrmsFlow(flow)) return;

    if (!outcomeWritten.current) {
      outcomeWritten.current = true;
      // The account number is kept for the rest of the journey, so the customer is
      // never sent back here to re-enter it (Requirement 6.9).
      writeJourney(flow as HrmsFlowId, {
        iobAccountNumber: accountNumber,
        pan: panFound ? (accountRecordPan as string) : '',
        panSource: panFound ? 'account-record' : 'none',
      });
    }

    const destination = hrmsNextRoute(flow, 'account-pan-lookup') ?? '/';
    const timer = setTimeout(() => navigate(destination), OUTCOME_DWELL_MS);
    return () => clearTimeout(timer);
  }, [stepsDone, flow, accountNumber, panFound, accountRecordPan, navigate]);

  // ── Handlers ─────────────────────────────────────────────────────────────

  /**
   * Keeps only digits and only the first 18 of them. A rejected character leaves the
   * previously entered digits untouched and shows no error (Requirements 6.1, 6.3).
   */
  const handleChange = (raw: string) => {
    if (phase === 'processing') return;
    setAccountNumber(raw.replace(/\D/g, '').slice(0, MAX_DIGITS));
    setShowShortError(false);
  };

  const handleContinue = () => {
    if (phase === 'processing') return;

    // Too short: stay put, start no retrieval, announce the error (Requirement 6.4).
    if (!isLongEnough) {
      setShowShortError(true);
      return;
    }

    setShowShortError(false);
    if (isHrmsFlow(flow)) {
      writeJourney(flow as HrmsFlowId, { iobAccountNumber: accountNumber });
    }
    setStepIndex(0);
    setCompletedIds([]);
    outcomeWritten.current = false;
    setPhase('processing');
  };

  // ── Entrance animation, disabled under prefers-reduced-motion ────────────
  const rise = (delay: number) =>
    reduceMotion
      ? { initial: { opacity: 1 }, animate: { opacity: 1 } }
      : {
          initial: { y: 20, opacity: 0 },
          animate: { y: 0, opacity: 1 },
          transition: { delay },
        };

  /**
   * Direct URL open with a non-HRMS flow selected. We render a neutral state with an
   * explicit way out rather than redirecting: an automatic `navigate('/')` on mount
   * would silently discard whatever the visitor was doing and, from a Dev Preview
   * deep link, look like the route is broken. A visible message plus a control keeps
   * the choice with the person (Requirement 1.1 — no existing flow is routed into
   * HRMS behaviour).
   */
  if (!definition) {
    return (
      <div className="min-h-screen bg-white flex flex-col">
        <TopBar showBack />
        <main className="flex-1 overflow-y-auto">
          <div className="max-w-lg mx-auto px-4 pt-8 pb-32">
            <h1 className="text-xl font-semibold text-[#111827] mb-2">
              {tr(language, 'accountEntryTitle')}
            </h1>
            <p className="text-sm text-[#6b7280] mb-6">
              {language === 'English'
                ? 'This screen is part of an HRMS salary advance journey. Select an HRMS journey to continue.'
                : 'இந்தத் திரை HRMS சம்பள முன்பணப் பயணத்தின் ஒரு பகுதி. தொடர ஒரு HRMS பயணத்தைத் தேர்ந்தெடுக்கவும்.'}
            </p>
            <button
              type="button"
              onClick={() => navigate('/')}
              className="w-full bg-[#315C9D] text-white h-12 rounded-lg text-base font-semibold flex items-center justify-center gap-2 active:scale-[0.98] transition-all focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#315C9D]"
            >
              {language === 'English' ? 'Go to Home' : 'முகப்புக்குச் செல்லவும்'}
              <ArrowRight className="w-5 h-5" strokeWidth={2.5} aria-hidden="true" />
            </button>
          </div>
        </main>
      </div>
    );
  }

  const helperId = 'iob-account-helper';
  const errorId = 'iob-account-error';
  const describedBy = showShortError ? `${helperId} ${errorId}` : helperId;

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <TopBar showBack />

      <main className="flex-1 overflow-y-auto">
        <div className="max-w-lg mx-auto px-4 pt-8 pb-32">
          <motion.div
            {...(reduceMotion
              ? { initial: { opacity: 1 }, animate: { opacity: 1 } }
              : {
                  initial: { scale: 0, opacity: 0 },
                  animate: { scale: 1, opacity: 1 },
                  transition: { duration: 0.4 },
                })}
            className="flex justify-center mb-8"
          >
            <div className="w-12 h-12 rounded-2xl bg-[#ebecef] flex items-center justify-center">
              <Landmark className="w-6 h-6 text-[#315C9D]" strokeWidth={2} aria-hidden="true" />
            </div>
          </motion.div>

          <motion.div {...rise(0.1)} className="text-center mb-8">
            <h1 className="text-xl font-semibold text-[#111827] mb-1">
              {tr(language, 'accountEntryTitle')}
            </h1>
            <p className="text-sm text-[#6b7280]">{tr(language, 'accountEntrySubtitle')}</p>
          </motion.div>

          {/* ── Account number field — present in both phases, read-only while retrieving ── */}
          <motion.div {...rise(0.2)} className="mb-6">
            <label
              htmlFor="iob-account-number"
              className="block text-[12px] font-semibold text-[#666666] mb-2 tracking-wide"
            >
              {tr(language, 'accountEntryLabel')}
            </label>
            <div className="flex items-center bg-transparent border border-[#e5e7eb] rounded-lg px-4 h-14 focus-within:border-[#254576] focus-within:ring-1 focus-within:ring-[#254576]/20 transition-all">
              <input
                id="iob-account-number"
                type="text"
                inputMode="numeric"
                autoComplete="off"
                value={accountNumber}
                readOnly={phase === 'processing'}
                onChange={(e) => handleChange(e.target.value)}
                aria-describedby={describedBy}
                aria-invalid={showShortError}
                placeholder={tr(language, 'accountEntryPlaceholder')}
                className="flex-1 bg-transparent outline-none text-[16px] font-semibold tracking-[0.12em] text-[#212121] placeholder:text-[#9e9e9e] placeholder:font-normal placeholder:tracking-normal read-only:text-[#6b7280]"
              />
            </div>

            {/* Always visible, no interaction needed to reveal (Requirement 6.2). */}
            <p id={helperId} className="mt-2 text-[12px] text-[#6b7280] leading-relaxed">
              {tr(language, 'accountEntryHelperText')}
            </p>

            {showShortError && (
              <p
                id={errorId}
                role="alert"
                className="mt-2 flex items-start gap-2 text-[12px] font-semibold text-[#b42318] leading-relaxed"
              >
                <AlertCircle
                  className="w-4 h-4 flex-shrink-0 mt-[1px]"
                  strokeWidth={2.5}
                  aria-hidden="true"
                />
                {tr(language, 'accountEntryShortError')}
              </p>
            )}
          </motion.div>

          {/* ── Retrieval progress and outcome ── */}
          {phase === 'processing' && (
            <div className="space-y-3">
              {steps.map((ps, index) => {
                const isCompleted = completedIds.includes(ps.id);
                const isActive = stepIndex === index && !isCompleted;

                return (
                  <div
                    key={ps.id}
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg border transition-all ${
                      isCompleted
                        ? 'bg-[#2da94f]/5 border-[#2da94f]/20'
                        : isActive
                          ? 'bg-[#315C9D]/5 border-[#315C9D]/20'
                          : 'bg-[#f9fafb] border-[#e5e7eb]'
                    }`}
                  >
                    {isCompleted ? (
                      <CheckCircle
                        className="w-5 h-5 text-[#2da94f] flex-shrink-0"
                        strokeWidth={2.5}
                        aria-hidden="true"
                      />
                    ) : isActive ? (
                      <Loader2
                        className="w-5 h-5 text-[#315C9D] animate-spin flex-shrink-0"
                        strokeWidth={2.5}
                        aria-hidden="true"
                      />
                    ) : (
                      <div
                        className="w-5 h-5 rounded-full border-2 border-gray-300 flex-shrink-0"
                        aria-hidden="true"
                      />
                    )}
                    <span
                      className={`text-sm font-medium ${
                        isCompleted
                          ? 'text-[#2da94f]'
                          : isActive
                            ? 'text-[#315C9D]'
                            : 'text-[#9ca3af]'
                      }`}
                    >
                      {language === 'English' ? ps.labelEn : ps.labelTa}
                    </span>
                  </div>
                );
              })}

              {/* Deterministic outcome — icon plus text, never colour alone. */}
              {stepsDone && (
                <div
                  role="status"
                  className={`flex items-start gap-3 px-4 py-3 rounded-lg border ${
                    panFound
                      ? 'bg-[#2da94f]/5 border-[#2da94f]/20'
                      : 'bg-[#315C9D]/5 border-[#315C9D]/20'
                  }`}
                >
                  {panFound ? (
                    <CheckCircle
                      className="w-5 h-5 text-[#2da94f] flex-shrink-0 mt-[1px]"
                      strokeWidth={2.5}
                      aria-hidden="true"
                    />
                  ) : (
                    <Info
                      className="w-5 h-5 text-[#315C9D] flex-shrink-0 mt-[1px]"
                      strokeWidth={2.5}
                      aria-hidden="true"
                    />
                  )}
                  <span
                    className={`text-sm font-semibold leading-relaxed ${
                      panFound ? 'text-[#2da94f]' : 'text-[#315C9D]'
                    }`}
                  >
                    {tr(
                      language,
                      panFound ? 'accountEntryPanFound' : 'accountEntryPanAbsent',
                    )}
                  </span>
                </div>
              )}
            </div>
          )}
        </div>
      </main>

      <StickyFooter>
        {/*
          Hard-disabled only while retrieving (Requirement 6.6). Below 9 digits the control
          stays activatable but is marked and styled as unavailable, so the short-input
          error path is reachable by mouse, touch and keyboard (Requirements 6.2, 6.4).
        */}
        <button
          type="button"
          onClick={handleContinue}
          disabled={phase === 'processing'}
          aria-disabled={phase === 'processing' || !isLongEnough}
          className={`w-full bg-[#315C9D] text-white h-12 rounded-lg text-base font-semibold flex items-center justify-center gap-2 active:scale-[0.98] transition-all disabled:cursor-not-allowed focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#315C9D] ${
            phase === 'processing' || !isLongEnough ? 'opacity-40' : ''
          }`}
        >
          {phase === 'processing' ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" strokeWidth={2.5} aria-hidden="true" />
              {language === 'English' ? 'Retrieving…' : 'பெறப்படுகிறது…'}
            </>
          ) : (
            <>
              {tr(language, 'accountEntryContinueBtn')}
              <ArrowRight className="w-5 h-5" strokeWidth={2.5} aria-hidden="true" />
            </>
          )}
        </button>
      </StickyFooter>
    </div>
  );
}
