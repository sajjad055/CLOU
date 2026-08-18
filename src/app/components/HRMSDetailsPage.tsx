import { useEffect, useMemo, useState } from 'react';
import { Navigate, useNavigate } from 'react-router';
import { motion, useReducedMotion } from 'motion/react';
import {
  AlertCircle,
  ArrowRight,
  Check,
  CheckCircle,
  Loader2,
  RotateCcw,
  ShieldCheck,
  Zap,
} from 'lucide-react';
import { TopBar } from './TopBar';
import { StickyFooter } from './StickyFooter';
import { SalaryAdvanceInfoSections } from './SalaryAdvanceInfoSections';
import { BottomSheet } from './BottomSheet';
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
import iobLogo from '@/assets/iob.svg';
import upiLogo from '@/assets/upi.svg';

/**
 * HRMS_Details_Screen — entry screen for all five HRMS journeys.
 *
 * Owns three phases of the journey rather than three routes, matching the
 * convention already used by `CKYCConsentPage` and `CKYCCustomerDetailsPage`:
 *
 *   fetching   simulated HRMS employee-record fetch, auto-advances
 *   review     greeting + read-only record + explainer sections, with the
 *              bank-record consent declaration inline above the CTA
 *   processing mobile-number dedupe against IOB records, plus whatever the
 *              matched record implies (a PAN lookup and CKYC identifier
 *              retrieval when one is held). Runs in all five flows.
 *
 * The mobile dedupe is why this screen carries a declaration at all, and why it
 * carries the same one in every flow: the mobile number arrived with the HRMS
 * record, so whether the customer banks with IOB — and what that record holds —
 * is answered here without asking them for an account number. That answer is
 * what routes the rest of the journey.
 *
 * `consent-declaration-pattern.md` puts a single declaration inline with the CTA
 * however heavy the screen, so the checkbox sits in the `StickyFooter` above the
 * button, with the formal wording behind "Read more".
 *
 * The CKYC-download consent is deliberately not taken here. It is taken where
 * the identifier it is keyed on is known, immediately before the OTP confirming
 * it: on `/otp-verification` for the flows pulling CKYC by PAN, and on the
 * Aadhaar details step for those pulling it by Aadhaar.
 *
 * Which phase follows `review` is decided by the registry, never by this
 * component. `hrmsNextRoute` encodes an in-component phase transition as a
 * `next` equal to this screen's own route; a different route means navigate.
 */

const ROUTE = '/hrms-details';

/** Pause between the last completed progress row and leaving the phase (≤ 500 ms). */
const PHASE_TAIL_MS = 400;

/** Same display treatment LandingPage gives its hero heading. */
const HERO_FONT = "'Manrope', sans-serif";

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
  const [ckycConsentAccepted, setCkycConsentAccepted] = useState(
    () => readJourney(flow).ckycConsentAccepted,
  );

  // Read-only: the sheet shows the full wording and nothing else. It never sets
  // consent and never advances the flow, so the CTA gating is untouched.
  // `null` when closed, otherwise which declaration's wording is showing.
  const [readMoreFor, setReadMoreFor] = useState<'bank' | 'ckyc' | null>(null);

  /**
   * The gating sheet, used only by the flows taking two declarations here.
   *
   * `consent-declaration-pattern.md` sends two declarations on a heavy screen to
   * a sheet on continue, and this screen is heavy — the whole explainer set sits
   * above the CTA. So for those flows the sheet holds both checkboxes and the
   * action that advances; the single-declaration flows keep theirs inline.
   */
  const [showGateSheet, setShowGateSheet] = useState(false);

  const fetchSteps = useMemo(() => hrmsProcessing(flow, 'hrms-fetch'), [flow]);
  const dedupeSteps = useMemo(() => hrmsProcessing(flow, 'mobile-dedupe'), [flow]);
  const NO_STEPS = useMemo<ProcessingStep[]>(() => [], []);
  // Stable per phase, so toggling consent never restarts a progress timer.
  const runningSteps =
    phase === 'fetching' ? fetchSteps : phase === 'processing' ? dedupeSteps : NO_STEPS;

  // The record is fixed dummy data, so this is always true in the prototype.
  // Validated on entering `review` regardless, so the missing-record path of
  // Requirement 4.10 exists structurally rather than by assumption.
  const recordComplete = isRecordComplete(HRMS_EMPLOYEE);
  const recordError = phase === 'review' && !recordComplete;

  /**
   * The record as displayed. The PAN row is listed unconditionally with an empty
   * value on the flows whose HRMS record carries none — the row renders the
   * "not available" label instead, so the field is always accounted for.
   *
   * `mono` marks the values worth setting in a monospaced tabular face: fixed-format
   * identifiers and dates, where consistent digit width aids scanning. Name and
   * address are prose and stay in the body face.
   */
  const recordRows: Array<Array<{ label: string; value: string; mono?: boolean }>> = [
    [{ label: tr(language, 'hrmsNameLabel'), value: HRMS_EMPLOYEE.name }],
    [
      {
        label: tr(language, 'hrmsEmployeeIdLabel'),
        value: HRMS_EMPLOYEE.employeeId,
        mono: true,
      },
    ],
    // Mobile and date of birth share a row: both are fixed-format, so the two
    // columns hold a predictable width even at 320px.
    [
      { label: tr(language, 'hrmsMobileLabel'), value: HRMS_EMPLOYEE.mobile, mono: true },
      { label: tr(language, 'hrmsDobLabel'), value: HRMS_EMPLOYEE.dob, mono: true },
    ],
    [
      {
        label: tr(language, 'hrmsPanLabel'),
        value: definition.hrmsPanPresent ? HRMS_EMPLOYEE.pan : '',
        mono: true,
      },
    ],
    [{ label: tr(language, 'hrmsAddressLabel'), value: HRMS_EMPLOYEE.address }],
  ];

  /**
   * Every flow asks for the same one thing here: permission to check IOB's
   * records against the mobile number the HRMS record supplied. That dedupe is
   * what the next phase runs, and its outcome is what decides the rest of the
   * journey, so the declaration belongs on this screen in all five flows.
   *
   * A flow whose HRMS record already carried a PAN can authorise the CKYC
   * download here as well, because the identifier that pull would be keyed on is
   * already in hand. Those flows take both declarations on this screen and
   * confirm them with the OTP that follows, so nothing is looked up until the
   * customer has both consented and confirmed.
   *
   * The flows without a PAN take their CKYC declaration later, on whichever
   * screen their identifier becomes known — asking here would be asking for
   * consent that cannot apply.
   */
  const takesCkycConsent = definition.hrmsPanPresent;

  /** Two declarations go to a sheet on a heavy screen; one stays inline. */
  const gatedBySheet = takesCkycConsent;

  const allConsentsGiven = consentAccepted && (!takesCkycConsent || ckycConsentAccepted);
  const canContinue = recordComplete && (gatedBySheet || allConsentsGiven);

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

        // The dedupe has finished, so whatever the matched bank record holds is
        // now known. A record carrying a PAN is recorded on the journey here —
        // this is the only place that PAN enters the journey, and it is what
        // later screens read instead of asking the customer for it.
        if (typeof definition.bankRecordPan === 'string' && definition.bankRecordPan) {
          writeJourney(flow, {
            pan: definition.bankRecordPan,
            panSource: 'bank-record',
          });
        }

        const next = hrmsNextRoute(flow, 'mobile-dedupe');
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
  }, [phase, stepIndex, runningSteps, flow, definition.bankRecordPan, navigate]);

  /** Persisted on every toggle, so returning to this screen restores the choice. */
  const handleToggleConsent = () => {
    const next = !consentAccepted;
    setConsentAccepted(next);
    writeJourney(flow, { consentAccepted: next });
  };

  const handleToggleCkycConsent = () => {
    const next = !ckycConsentAccepted;
    setCkycConsentAccepted(next);
    writeJourney(flow, { ckycConsentAccepted: next });
  };

  const handleRetry = () => {
    setStepIndex(0);
    setCompleted([]);
    setPhase('fetching');
  };

  const handleContinue = () => {
    // Rendered `disabled` until the gate opens; guarded here too, so an
    // activation that slips through submits nothing (Requirements 4.5, 4.10).
    if (!canContinue) return;

    // Sheet-gated flows: the CTA opens the declarations rather than advancing.
    // `proceed` below is what advances, and only once both are ticked.
    if (gatedBySheet && !allConsentsGiven) {
      setShowGateSheet(true);
      return;
    }

    proceed();
  };

  /** The actual advance, shared by the inline path and the sheet's accept action. */
  const proceed = () => {
    if (!recordComplete || !allConsentsGiven) return;
    setShowGateSheet(false);

    const next = hrmsNextRoute(flow, 'hrms-details');
    if (!next) return;

    if (next === ROUTE) {
      // Registry encoding: same route means stay put and swap phase. Every flow
      // declares the dedupe, so this is the path all five take from `review`.
      if (hasStep(flow, 'mobile-dedupe')) {
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

          {/* ── Review: greeting, read-only record, explainer sections ── */}
          {phase === 'review' && (
            <div className="flex flex-col">
              {/* The page lead. A greeting line naming the employee, then the h1
                  naming what the journey delivers — the same display treatment
                  LandingPage gives its hero. Two inline spans in one paragraph, so
                  greeting and name share a baseline. */}
              <motion.div {...enter(0.1)} className="mb-6">
                <p className="text-[#111827] mb-1">
                  <span className="text-[16px] font-normal">
                    {tr(language, 'hrmsGreeting')}
                  </span>{' '}
                  <span className="text-[18px] font-semibold">{HRMS_EMPLOYEE.name}</span>
                </p>
                <h1
                  style={{ fontFamily: HERO_FONT }}
                  className="text-3xl font-extrabold text-[#111827] tracking-tight leading-tight"
                >
                  {tr(language, 'hrmsGreetingLead')}
                </h1>
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

              {/* Fetched record: name, employee ID, date of birth, PAN, address.
                  Every value is text, never an input, so it cannot be changed by
                  typing, pasting or selection. The PAN row is always present — it
                  is part of what the record is expected to hold — and carries
                  either the value or a visible "not available" label depending on
                  the flow, so its absence reads as a stated fact rather than as a
                  missing row. */}
              <motion.div
                {...enter(0.2)}
                className="bg-[#f9fafb] border border-[#e5e7eb] rounded-xl overflow-hidden mb-4 divide-y divide-[#e5e7eb]"
              >
                {recordRows.map((row) => (
                  <div
                    key={row.map((field) => field.label).join('|')}
                    className={`p-4 ${row.length > 1 ? 'grid grid-cols-2 gap-3' : ''}`}
                  >
                    {row.map((field) => (
                      <div key={field.label} className="min-w-0">
                        <p className="text-[11px] font-semibold text-[#666666] uppercase tracking-wide mb-0.5">
                          {field.label}
                        </p>
                        {field.value ? (
                          <p
                            className={`text-sm font-semibold text-[#212121] leading-snug ${
                              field.mono ? 'font-mono tracking-wide tabular-nums' : ''
                            }`}
                          >
                            {field.value}
                          </p>
                        ) : (
                          <p className="text-sm text-[#6b7280] leading-snug">
                            {tr(language, 'hrmsPanUnavailableLabel')}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                ))}
              </motion.div>

              {/* Banking partner and trust badges, carried over from LandingPage
                  (without its phone-UPI hero image). */}
              <motion.div {...enter(0.4)} className="text-center mt-5">
                <p className="text-[10px] font-normal text-[#9e9e9e] tracking-wider mb-3">
                  {tr(language, 'hrmsBankingPartnerLabel')}
                </p>
                <div className="flex items-center justify-center gap-4">
                  <img src={iobLogo} alt={tr(language, 'hrmsBankName')} className="h-[29px] w-auto object-contain" />
                  <div className="w-px h-6 bg-[#e5e7eb]"></div>
                  <img src={upiLogo} alt="UPI" className="h-[22px] w-auto object-contain" />
                </div>
              </motion.div>

              <motion.div {...enter(0.5)} className="flex justify-center gap-6 mt-4">
                <div className="flex items-center gap-2">
                  <Zap className="w-4 h-4 text-[#6b7280]" strokeWidth={2.5} aria-hidden="true" />
                  <span className="text-[12px] font-semibold text-[#6b7280]">
                    {tr(language, 'hrmsBadgeInstant')}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-[#6b7280]" strokeWidth={2.5} aria-hidden="true" />
                  <span className="text-[12px] font-semibold text-[#6b7280]">
                    {tr(language, 'hrmsBadgeSecure')}
                  </span>
                </div>
              </motion.div>

              {/* Shared explainer sections — same six sections LandingPage shows */}
              <SalaryAdvanceInfoSections />

              {/* Declarations. One flow-dependent difference: a flow taking a
                  single declaration shows it inline above the CTA, while a flow
                  taking two moves both into the gating sheet the CTA opens —
                  two stacked checkboxes plus a button would crowd an already
                  heavy screen, which is the case the pattern's heavy-screen row
                  covers. */}
              <StickyFooter>
                {!gatedBySheet && (
                  <div className="mb-3">
                    <ConsentRow
                      id="hrms-consent"
                      checked={consentAccepted}
                      onToggle={handleToggleConsent}
                      text={tr(language, 'hrmsConsentText')}
                      readMoreLabel={tr(language, 'panAadhaarReadMore')}
                      onReadMore={() => setReadMoreFor('bank')}
                    />
                  </div>
                )}

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

      {/* Gating sheet — the two-declaration flows only. Unlike the read-only
          sheet below, this one decides something: it holds both checkboxes and
          the action that advances the journey. Closing it submits nothing and
          leaves both selections as they were. */}
      <BottomSheet
        open={showGateSheet}
        onClose={() => setShowGateSheet(false)}
        title={tr(language, 'hrmsGateSheetTitle')}
        footer={
          <button
            type="button"
            onClick={proceed}
            disabled={!allConsentsGiven}
            className="w-full bg-[#315C9D] text-white h-12 rounded-lg text-base font-semibold flex items-center justify-center gap-2 active:scale-[0.98] transition-all disabled:opacity-40 disabled:cursor-not-allowed focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#315C9D]"
          >
            {tr(language, 'hrmsGateSheetAcceptBtn')}
            <ArrowRight className="w-5 h-5" strokeWidth={2.5} aria-hidden="true" />
          </button>
        }
      >
        <p className="text-sm text-[#6b7280] leading-relaxed mb-5">
          {tr(language, 'hrmsGateSheetIntro')}
        </p>

        <div className="space-y-4">
          <ConsentRow
            id="hrms-gate-consent-bank"
            checked={consentAccepted}
            onToggle={handleToggleConsent}
            text={tr(language, 'hrmsConsentText')}
            readMoreLabel={tr(language, 'panAadhaarReadMore')}
            onReadMore={() => setReadMoreFor('bank')}
          />
          <ConsentRow
            id="hrms-gate-consent-ckyc"
            checked={ckycConsentAccepted}
            onToggle={handleToggleCkycConsent}
            text={tr(language, 'ckycPanConsentText')}
            readMoreLabel={tr(language, 'panAadhaarReadMore')}
            onReadMore={() => setReadMoreFor('ckyc')}
          />
        </div>
      </BottomSheet>

      {/* Read-only wording for whichever declaration's "Read more" was used. No
          footer action, so closing it is the only exit and the checkboxes stay
          the single place consent is given. */}
      <BottomSheet
        open={readMoreFor !== null}
        onClose={() => setReadMoreFor(null)}
        title={tr(
          language,
          readMoreFor === 'ckyc' ? 'ckycPanConsentTitle' : 'hrmsConsentTitle',
        )}
      >
        <p className="text-sm text-[#6b7280] leading-relaxed whitespace-pre-line">
          {tr(language, readMoreFor === 'ckyc' ? 'ckycPanConsentFull' : 'hrmsConsentFull')}
        </p>
      </BottomSheet>
    </div>
  );
}

/**
 * One declaration: a checkbox, its copy, and a "Read more" link.
 *
 * Shared by the inline placement and the gating sheet so the two can never drift
 * apart. The button wraps only the box — "Read more" is a sibling of it, never a
 * child, because a button inside a button is invalid HTML and the inner control
 * becomes unreachable. The copy names the checkbox via `aria-labelledby`, so a
 * screen reader still announces the two together.
 */
function ConsentRow({
  id,
  checked,
  onToggle,
  text,
  readMoreLabel,
  onReadMore,
}: {
  id: string;
  checked: boolean;
  onToggle: () => void;
  text: string;
  readMoreLabel: string;
  onReadMore: () => void;
}) {
  const labelId = `${id}-label`;
  return (
    <div className="flex items-start gap-3">
      {/* Padding lifts the 20px box to a 24px hit area. Checked state is
          signalled by the tick icon, not colour alone. */}
      <button
        type="button"
        role="checkbox"
        aria-checked={checked}
        aria-labelledby={labelId}
        onClick={onToggle}
        className="flex-shrink-0 mt-0.5 p-0.5 rounded-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#315C9D]"
      >
        <span
          className={`flex w-5 h-5 rounded-[5px] border items-center justify-center transition-colors ${
            checked ? 'bg-[#315C9D] border-[#315C9D]' : 'bg-white border-[#c4c4c4]'
          }`}
        >
          {checked && (
            <Check className="w-3.5 h-3.5 text-white" strokeWidth={3} aria-hidden="true" />
          )}
        </span>
      </button>

      <p className="text-[12px] text-[#6b7280] leading-relaxed">
        <span id={labelId}>{text}</span>{' '}
        <button
          type="button"
          onClick={onReadMore}
          className="text-[12px] font-semibold text-[#315C9D] underline underline-offset-2 rounded-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#315C9D]"
        >
          {readMoreLabel}
        </button>
      </p>
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
