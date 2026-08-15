import { useEffect, useMemo, useState } from 'react';
import { Navigate, useNavigate } from 'react-router';
import { motion, useReducedMotion } from 'motion/react';
import {
  AlertCircle,
  ArrowRight,
  Calendar,
  Check,
  CheckCircle,
  CreditCard,
  Loader2,
  RotateCcw,
  ShieldCheck,
  Smartphone,
  User,
} from 'lucide-react';
import { TopBar } from './TopBar';
import { StickyFooter } from './StickyFooter';
import { useLanguage } from '../hooks/useLanguage';
import type { Language } from '../hooks/useLanguage';
import {
  HRMS_EMPLOYEE,
  getActiveFlow,
  getHrmsFlow,
  hasStep,
  hrmsNextRoute,
  hrmsProcessing,
  isHrmsFlow,
  type HrmsFlowId,
  type ProcessingStep,
} from '../flows/hrmsFlows';
import { readJourney, writeJourney } from '../flows/hrmsJourney';
import { tr } from '../flows/hrmsContent';

/**
 * HRMS_Details_Screen — entry screen for all five HRMS journeys.
 *
 * Owns three phases of the journey rather than three routes, matching the
 * convention already used by `CKYCConsentPage` and `CKYCCustomerDetailsPage`:
 *
 *   fetching   simulated HRMS employee-record fetch, auto-advances
 *   review     read-only record + one consent control gating the CTA
 *   processing simulated CKYC identifier retrieval + PAN dedupe (flows 1–2 only)
 *
 * Which phase follows `review` is decided by the registry, never by this
 * component. `hrmsNextRoute` encodes an in-component phase transition as a
 * `next` equal to this screen's own route; a different route means navigate.
 */

const ROUTE = '/hrms-details';

/** Pause between the last completed progress row and leaving the phase (≤ 500 ms). */
const PHASE_TAIL_MS = 400;

type Phase = 'fetching' | 'review' | 'processing';

/**
 * Direct entry with a non-HRMS `activeFlow` (a bookmark, a reload after
 * switching journeys in Dev Preview, or a hand-typed URL) has no journey to
 * render: the registry holds no step table, so there is no next destination and
 * no record to review. Rather than render a dead end, send the visitor to the
 * app root and leave `activeFlow` untouched, so their existing journey is still
 * selected when they start it from there.
 *
 * The guard lives in a wrapper with no hooks of its own, so the inner component
 * always mounts with a settled `HrmsFlowId` and its hook order never varies.
 */
export function HRMSDetailsPage() {
  const flow = getActiveFlow();
  if (!isHrmsFlow(flow)) return <Navigate to="/" replace />;
  return <HRMSDetails flow={flow} />;
}

/** True when the fetched record carries a name, a mobile number and a date of birth. */
function isRecordComplete(record: { name: string; mobile: string; dob: string }): boolean {
  return (
    record.name.trim().length > 0 &&
    record.mobile.trim().length > 0 &&
    record.dob.trim().length > 0
  );
}

function HRMSDetails({ flow }: { flow: HrmsFlowId }) {
  const navigate = useNavigate();
  const [language] = useLanguage();
  const reduceMotion = useReducedMotion();

  const definition = getHrmsFlow(flow)!;

  const [phase, setPhase] = useState<Phase>('fetching');
  const [stepIndex, setStepIndex] = useState(0);
  const [completed, setCompleted] = useState<string[]>([]);

  // Seeded from journey state so returning to this screen restores the choice.
  // A fresh journey carries `false`, so the control is unselected on first
  // display (Requirement 4.4).
  const [consentAccepted, setConsentAccepted] = useState(
    () => readJourney(flow).consentAccepted,
  );

  const fetchSteps = useMemo(() => hrmsProcessing(flow, 'hrms-fetch'), [flow]);
  const dedupeSteps = useMemo(() => hrmsProcessing(flow, 'ckyc-pan-dedupe'), [flow]);
  const NO_STEPS = useMemo<ProcessingStep[]>(() => [], []);
  // Stable per phase, so toggling consent never restarts a progress timer.
  const runningSteps =
    phase === 'fetching' ? fetchSteps : phase === 'processing' ? dedupeSteps : NO_STEPS;

  // The record is fixed dummy data, so this is always true in the prototype.
  // Validated on entering `review` regardless, so the missing-record path of
  // Requirement 4.10 exists structurally rather than by assumption.
  const recordComplete = isRecordComplete(HRMS_EMPLOYEE);
  const recordError = phase === 'review' && !recordComplete;

  const panAvailable = definition.hrmsPanPresent;
  const canContinue = consentAccepted && recordComplete;

  /**
   * Drives whichever phase is currently simulating backend work: one timer per
   * progress row, then one short tail before leaving the phase.
   *
   * Both timers are cleared on unmount, so a back press mid-fetch advances
   * nothing — the phase is never persisted and `activeFlow` is never written
   * here, so the journey is exactly where it was (Requirement 3.8).
   */
  useEffect(() => {
    if (runningSteps.length === 0) return;

    if (stepIndex >= runningSteps.length) {
      const timer = setTimeout(() => {
        if (phase === 'fetching') {
          // `next` equals this route: an in-component transition to `review`.
          setPhase('review');
          return;
        }
        const next = hrmsNextRoute(flow, 'ckyc-pan-dedupe');
        if (next && next !== ROUTE) navigate(next);
      }, PHASE_TAIL_MS);
      return () => clearTimeout(timer);
    }

    const current = runningSteps[stepIndex];
    const timer = setTimeout(() => {
      setCompleted((prev) => [...prev, current.id]);
      setStepIndex((prev) => prev + 1);
    }, current.durationMs);
    return () => clearTimeout(timer);
  }, [phase, stepIndex, runningSteps, flow, navigate]);

  const handleToggleConsent = () => {
    const next = !consentAccepted;
    setConsentAccepted(next);
    writeJourney(flow, { consentAccepted: next });
  };

  const handleRetry = () => {
    setStepIndex(0);
    setCompleted([]);
    setPhase('fetching');
  };

  const handleContinue = () => {
    // The CTA is rendered `disabled`, so this is belt-and-braces: an activation
    // that slips through performs no navigation (Requirements 4.5, 4.10).
    if (!canContinue) return;

    const next = hrmsNextRoute(flow, 'hrms-details');
    if (!next) return;

    if (next === ROUTE) {
      // Registry encoding: same route means stay put and swap phase. Only the
      // flows declaring a dedupe step have a phase to swap to.
      if (hasStep(flow, 'ckyc-pan-dedupe')) {
        setStepIndex(0);
        setCompleted([]);
        setPhase('processing');
      }
      return;
    }

    navigate(next);
  };

  const enter = (delay: number) =>
    reduceMotion
      ? { initial: { opacity: 1 }, animate: { opacity: 1 } }
      : { initial: { y: 20, opacity: 0 }, animate: { y: 0, opacity: 1 }, transition: { delay } };

  const pop = () =>
    reduceMotion
      ? { initial: { opacity: 1 }, animate: { opacity: 1 } }
      : {
          initial: { scale: 0, opacity: 0 },
          animate: { scale: 1, opacity: 1 },
          transition: { duration: 0.4 },
        };

  const detailRows: Array<{ icon: typeof User; label: string; value: string; mono?: boolean }> = [
    { icon: User, label: tr(language, 'hrmsNameLabel'), value: HRMS_EMPLOYEE.name },
    { icon: Smartphone, label: tr(language, 'hrmsMobileLabel'), value: HRMS_EMPLOYEE.mobile, mono: true },
    { icon: Calendar, label: tr(language, 'hrmsDobLabel'), value: HRMS_EMPLOYEE.dob, mono: true },
  ];

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <TopBar showBack />

      <main className="flex-1 overflow-y-auto">
        <div className="max-w-lg mx-auto px-4 pt-8 pb-32">

          {/* ── Fetching: simulated HRMS employee-record fetch ── */}
          {phase === 'fetching' && (
            <div className="flex flex-col items-center">
              <motion.div {...pop()} className="mb-6">
                <div className="w-14 h-14 rounded-2xl bg-[#315C9D]/10 flex items-center justify-center">
                  <Loader2 className="w-7 h-7 text-[#315C9D] animate-spin" strokeWidth={2} aria-hidden="true" />
                </div>
              </motion.div>

              <motion.div {...enter(0.1)} className="text-center mb-8">
                <h1 className="text-xl font-semibold text-[#111827] mb-1">
                  {tr(language, 'hrmsFetchingTitle')}
                </h1>
                <p className="text-sm text-[#6b7280] leading-relaxed">
                  {tr(language, 'hrmsFetchingSubtitle')}
                </p>
              </motion.div>

              <ProcessingRows
                steps={fetchSteps}
                stepIndex={stepIndex}
                completed={completed}
                language={language}
                reduceMotion={!!reduceMotion}
              />
            </div>
          )}

          {/* ── Review: read-only record + consent ── */}
          {phase === 'review' && (
            <div className="flex flex-col">
              <motion.div {...pop()} className="flex justify-center mb-6">
                <div className="w-12 h-12 rounded-2xl bg-[#ebecef] flex items-center justify-center">
                  <CheckCircle className="w-6 h-6 text-[#315C9D]" strokeWidth={2} aria-hidden="true" />
                </div>
              </motion.div>

              <motion.div {...enter(0.1)} className="text-center mb-6">
                <h1 className="text-xl font-semibold text-[#111827] mb-1">
                  {tr(language, 'hrmsDetailsTitle')}
                </h1>
                <p className="text-sm text-[#6b7280] leading-relaxed">
                  {tr(language, 'hrmsDetailsSubtitle')}
                </p>
              </motion.div>

              {/* Record could not be retrieved — Requirement 4.10 */}
              {recordError && (
                <div
                  id="hrms-record-error"
                  role="alert"
                  className="mb-4 bg-[#fef2f2] border border-[#dc2626]/25 rounded-xl p-4 flex items-start gap-3"
                >
                  <AlertCircle className="w-5 h-5 text-[#dc2626] flex-shrink-0 mt-0.5" strokeWidth={2.5} aria-hidden="true" />
                  <div className="min-w-0">
                    <p className="text-sm text-[#991b1b] leading-relaxed mb-3">
                      {tr(language, 'hrmsRecordErrorMessage')}
                    </p>
                    <button
                      type="button"
                      onClick={handleRetry}
                      className="inline-flex items-center gap-1.5 min-h-[44px] px-4 rounded-lg border border-[#dc2626]/40 text-sm font-semibold text-[#991b1b] bg-white active:scale-[0.98] transition-transform focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#315C9D]"
                    >
                      <RotateCcw className="w-4 h-4" strokeWidth={2.5} aria-hidden="true" />
                      {tr(language, 'hrmsRetryBtn')}
                    </button>
                  </div>
                </div>
              )}

              {/* Fetched record. Every value is text, never an input, so it
                  cannot be changed by typing, pasting or selection. */}
              <motion.div
                {...enter(0.2)}
                className="bg-[#f9fafb] border border-[#e5e7eb] rounded-xl overflow-hidden mb-4"
              >
                {detailRows.map((row, i) => {
                  const Icon = row.icon;
                  return (
                    <div
                      key={row.label}
                      className={`flex items-start gap-3 p-4 ${i !== 0 ? 'border-t border-[#e5e7eb]' : ''}`}
                    >
                      <div className="w-8 h-8 rounded-full bg-[#315C9D]/10 flex items-center justify-center flex-shrink-0">
                        <Icon className="w-4 h-4 text-[#315C9D]" strokeWidth={2} aria-hidden="true" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-[11px] font-semibold text-[#666666] uppercase tracking-wide mb-0.5">
                          {row.label}
                        </p>
                        <p
                          className={`text-sm font-semibold text-[#212121] leading-snug ${row.mono ? 'font-mono tracking-wide' : ''}`}
                        >
                          {row.value}
                        </p>
                      </div>
                    </div>
                  );
                })}

                {/* PAN row. Flows 1–2 show the HRMS PAN; flows 3–5 show an empty
                    value with a visible "not available" label. */}
                <div className="flex items-start gap-3 p-4 border-t border-[#e5e7eb]">
                  <div className="w-8 h-8 rounded-full bg-[#315C9D]/10 flex items-center justify-center flex-shrink-0">
                    <CreditCard className="w-4 h-4 text-[#315C9D]" strokeWidth={2} aria-hidden="true" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[11px] font-semibold text-[#666666] uppercase tracking-wide mb-0.5">
                      {tr(language, 'hrmsPanLabel')}
                    </p>
                    {panAvailable ? (
                      <p className="text-sm font-semibold text-[#212121] leading-snug font-mono tracking-wide">
                        {HRMS_EMPLOYEE.pan}
                      </p>
                    ) : (
                      <p className="text-sm text-[#6b7280] leading-snug">
                        {tr(language, 'hrmsPanUnavailableLabel')}
                      </p>
                    )}
                  </div>
                </div>
              </motion.div>

              {/* Data-protection statement — always visible, no interaction to reveal */}
              <motion.div
                {...enter(0.3)}
                className="bg-[#eef3fa] border border-[#315C9D]/15 rounded-xl p-4 flex items-start gap-3 mb-3"
              >
                <div className="w-9 h-9 rounded-full bg-[#315C9D]/10 flex items-center justify-center flex-shrink-0">
                  <ShieldCheck className="w-5 h-5 text-[#315C9D]" strokeWidth={2} aria-hidden="true" />
                </div>
                <p className="text-[12px] text-[#6b7280] leading-relaxed">
                  {tr(language, 'hrmsDataProtectionText')}
                </p>
              </motion.div>

              <StickyFooter>
                {/* Single consent control, naming PAN validation and the CKYC download */}
                <button
                  type="button"
                  role="checkbox"
                  aria-checked={consentAccepted}
                  onClick={handleToggleConsent}
                  className="w-full flex items-start gap-3 mb-4 text-left rounded-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#315C9D]"
                >
                  <span
                    className={`mt-0.5 flex-shrink-0 w-5 h-5 rounded-[5px] border flex items-center justify-center transition-colors ${
                      consentAccepted ? 'bg-[#315C9D] border-[#315C9D]' : 'bg-white border-[#c4c4c4]'
                    }`}
                  >
                    {consentAccepted && <Check className="w-3.5 h-3.5 text-white" strokeWidth={3} aria-hidden="true" />}
                  </span>
                  <span className="text-[12px] text-[#6b7280] leading-relaxed">
                    {tr(language, 'hrmsConsentText')}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={handleContinue}
                  disabled={!canContinue}
                  aria-disabled={!canContinue}
                  aria-describedby={recordError ? 'hrms-record-error' : undefined}
                  className="w-full bg-[#315C9D] text-white h-12 rounded-lg text-base font-semibold flex items-center justify-center gap-2 active:scale-[0.98] transition-all disabled:opacity-40 disabled:cursor-not-allowed focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#315C9D]"
                >
                  {tr(language, 'hrmsContinueBtn')}
                  <ArrowRight className="w-5 h-5" strokeWidth={2.5} aria-hidden="true" />
                </button>
              </StickyFooter>
            </div>
          )}

          {/* ── Processing: CKYC identifier retrieval + PAN dedupe (flows 1–2) ── */}
          {phase === 'processing' && (
            <div className="flex flex-col items-center justify-center min-h-[65vh]">
              <motion.div {...pop()} className="mb-8">
                <div className="w-14 h-14 rounded-2xl bg-[#315C9D]/10 flex items-center justify-center">
                  <Loader2 className="w-7 h-7 text-[#315C9D] animate-spin" strokeWidth={2} aria-hidden="true" />
                </div>
              </motion.div>

              {/* The phase has no visible heading in the house pattern, so the
                  screen keeps exactly one h1 by naming the phase for assistive
                  technology from the same registry label the rows render. */}
              <h1 className="sr-only">
                {dedupeSteps.length > 0
                  ? language === 'English'
                    ? dedupeSteps[0].labelEn
                    : dedupeSteps[0].labelTa
                  : tr(language, 'hrmsDetailsTitle')}
              </h1>

              <ProcessingRows
                steps={dedupeSteps}
                stepIndex={stepIndex}
                completed={completed}
                language={language}
                reduceMotion={!!reduceMotion}
              />
            </div>
          )}

        </div>
      </main>
    </div>
  );
}

/**
 * Progress rows for a simulated phase. Each row signals its state with an icon
 * and text as well as colour: a spinner plus label while active, a check mark
 * plus label once complete.
 */
function ProcessingRows({
  steps,
  stepIndex,
  completed,
  language,
  reduceMotion,
}: {
  steps: ProcessingStep[];
  stepIndex: number;
  completed: string[];
  language: Language;
  reduceMotion: boolean;
}) {
  return (
    <div className="w-full">
      <div className="w-full space-y-3" aria-live="polite">
        {steps.map((step, index) => {
          const isCompleted = completed.includes(step.id);
          const isActive = stepIndex === index && !isCompleted;
          // Progressive reveal — future steps are not announced up front.
          if (!isCompleted && !isActive) return null;

          return (
            <motion.div
              key={step.id}
              initial={reduceMotion ? { opacity: 1 } : { opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={reduceMotion ? { duration: 0 } : { duration: 0.3 }}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg border transition-all ${
                isCompleted ? 'bg-[#2da94f]/5 border-[#2da94f]/20' : 'bg-[#315C9D]/5 border-[#315C9D]/20'
              }`}
            >
              {isCompleted ? (
                <CheckCircle className="w-5 h-5 text-[#2da94f] flex-shrink-0" strokeWidth={2.5} aria-hidden="true" />
              ) : (
                <Loader2 className="w-5 h-5 text-[#315C9D] animate-spin flex-shrink-0" strokeWidth={2.5} aria-hidden="true" />
              )}
              <span className={`text-sm font-medium ${isCompleted ? 'text-[#2da94f]' : 'text-[#315C9D]'}`}>
                {language === 'English' ? step.labelEn : step.labelTa}
              </span>
            </motion.div>
          );
        })}
      </div>

      <div className="w-full mt-6">
        <div className="w-full h-1.5 bg-[#315C9D]/10 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-[#315C9D] rounded-full"
            initial={reduceMotion ? false : { width: '0%' }}
            animate={{ width: `${(completed.length / Math.max(steps.length, 1)) * 100}%` }}
            transition={reduceMotion ? { duration: 0 } : { duration: 0.4 }}
          />
        </div>
      </div>
    </div>
  );
}
