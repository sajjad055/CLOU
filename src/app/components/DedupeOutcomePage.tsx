import { useEffect, useRef, useState } from 'react';
import { Navigate, useNavigate } from 'react-router';
import { motion, useReducedMotion } from 'motion/react';
import { ArrowRight, Check, CheckCircle, Loader2, Smartphone } from 'lucide-react';
import { TopBar } from './TopBar';
import { StickyFooter } from './StickyFooter';
import { BottomSheet } from './BottomSheet';
import { useLanguage } from '../hooks/useLanguage';
import {
  HRMS_EMPLOYEE,
  getActiveFlow,
  hasStep,
  hrmsNextRoute,
  hrmsProcessing,
  isHrmsFlow,
  type HrmsFlowId,
  type ProcessingStep,
} from '../flows/hrmsFlows';
import { tr } from '../flows/hrmsContent';
import iobLogo from '@/assets/iob.svg';

/**
 * Dedupe_Outcome_Screen — `/hrms-dedupe-outcome`.
 *
 * Sits between the mobile dedupe and the confirming OTP, on the flow whose
 * landing card had to report that no PAN was available in the HRMS record. The
 * dedupe then finds one on the customer's bank record, which changes what the
 * rest of the journey asks of them — so that outcome is stated plainly here
 * rather than scrolling past inside a progress row.
 *
 * It is also where the CKYC-download declaration is taken. On the shared OTP
 * screen that declaration sits above a keypad with nothing explaining why it is
 * being asked; here the reason is the screen. Consent therefore gates the CKYC
 * identifier retrieval, which runs in a `processing` phase on this screen once
 * the customer continues — so nothing is pulled before it is authorised.
 *
 * Layout is carried over from the account-choice screen this flow used to show:
 * the centred IOB logo, the bordered container with divided rows, and the
 * declaration inline above the CTA.
 */

const ROUTE = '/hrms-dedupe-outcome';

/** Pause between the last completed progress row and leaving the screen. */
const PHASE_TAIL_MS = 400;

type Phase = 'review' | 'processing';

/**
 * Direct entry that this screen has no journey for — a non-HRMS `activeFlow`, or
 * an HRMS flow that declares no `dedupe-outcome`. Both send the visitor to the
 * app root with `activeFlow` untouched, matching the other HRMS screens.
 *
 * The guard sits in a wrapper with no hooks of its own, so the inner component
 * always mounts with a settled flow and its hook order never varies.
 */
export function DedupeOutcomePage() {
  const flow = getActiveFlow();
  if (!isHrmsFlow(flow) || !hasStep(flow, 'dedupe-outcome')) {
    return <Navigate to="/" replace />;
  }
  return <DedupeOutcome flow={flow} />;
}

function DedupeOutcome({ flow }: { flow: HrmsFlowId }) {
  const navigate = useNavigate();
  const [language] = useLanguage();
  const reduceMotion = useReducedMotion();

  const [phase, setPhase] = useState<Phase>('review');
  const [consent, setConsent] = useState(false);
  // Read-only: shows the full wording, sets no consent, advances nothing.
  const [showConsentSheet, setShowConsentSheet] = useState(false);

  const steps: ProcessingStep[] = hrmsProcessing(flow, 'dedupe-outcome');
  const [stepIndex, setStepIndex] = useState(0);
  const [completed, setCompleted] = useState<string[]>([]);
  const stepsRef = useRef(steps);
  stepsRef.current = steps;

  // ── Retrieval progression, then the automatic navigation ──
  useEffect(() => {
    if (phase !== 'processing') return;
    const list = stepsRef.current;

    if (stepIndex >= list.length) {
      const timer = setTimeout(() => {
        const next = hrmsNextRoute(flow, 'dedupe-outcome');
        if (next && next !== ROUTE) navigate(next);
      }, PHASE_TAIL_MS);
      return () => clearTimeout(timer);
    }

    const current = list[stepIndex];
    const timer = setTimeout(() => {
      setCompleted((prev) => [...prev, current.id]);
      setStepIndex((prev) => prev + 1);
    }, current.durationMs);

    // Cleared on unmount, so a back press mid-retrieval advances nothing.
    return () => clearTimeout(timer);
  }, [phase, stepIndex, flow, navigate]);

  const handleContinue = () => {
    // Rendered `disabled` without consent; guarded here too, so an activation
    // that slips through retrieves nothing.
    if (phase === 'processing' || !consent) return;
    setStepIndex(0);
    setCompleted([]);
    setPhase('processing');
  };

  const enter = (delay: number) =>
    reduceMotion
      ? { initial: { opacity: 1 }, animate: { opacity: 1 } }
      : { initial: { y: 20, opacity: 0 }, animate: { y: 0, opacity: 1 }, transition: { delay } };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <TopBar showBack />

      <main className="flex-1 overflow-y-auto">
        <div className="max-w-lg mx-auto px-4 pt-8 pb-40">

          <motion.div {...enter(0.05)} className="flex justify-center mb-5">
            <img
              src={iobLogo}
              alt={tr(language, 'hrmsBankName')}
              className="h-[29px] w-auto object-contain"
            />
          </motion.div>

          {/* The outcome, carried by an icon and text rather than colour alone. */}
          <motion.div {...enter(0.1)} className="flex justify-center mb-4">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-[#2da94f]/10 pl-2 pr-3 py-1">
              <CheckCircle
                className="w-4 h-4 text-[#2da94f] flex-shrink-0"
                strokeWidth={2.5}
                aria-hidden="true"
              />
              <span className="text-[12px] font-semibold text-[#1e7a37]">
                {tr(language, 'dedupeOutcomeBadge')}
              </span>
            </span>
          </motion.div>

          <motion.div {...enter(0.15)} className="text-center mb-6">
            <h1 className="text-xl font-semibold text-[#111827] mb-1">
              {tr(language, 'dedupeOutcomeTitle')}
            </h1>
            <p className="text-sm text-[#6b7280] leading-relaxed">
              {tr(language, 'dedupeOutcomeSubtitle')}
            </p>
          </motion.div>

          {/* How the match was made, and what is still outstanding. Same bordered
              container with divided rows the account-choice screen used. */}
          <motion.div
            {...enter(0.2)}
            className="border border-[#e5e7eb] rounded-xl overflow-hidden divide-y divide-[#e5e7eb] mb-4"
          >
            <div className="p-4 flex items-center gap-3">
              <span className="w-9 h-9 rounded-full bg-[#ebecef] flex items-center justify-center flex-shrink-0">
                <Smartphone className="w-4 h-4 text-[#111827]" strokeWidth={2} aria-hidden="true" />
              </span>
              <div className="min-w-0">
                <p className="text-[12px] text-[#6b7280] leading-snug">
                  {tr(language, 'dedupeOutcomeMatchedLabel')}
                </p>
                <p className="text-sm font-semibold text-[#212121] leading-snug font-mono tabular-nums">
                  {HRMS_EMPLOYEE.mobile}
                </p>
              </div>
            </div>

            <div className="p-4">
              <p className="text-[11px] font-semibold text-[#666666] uppercase tracking-wide mb-0.5">
                {tr(language, 'dedupeOutcomeRemainingLabel')}
              </p>
              <p className="text-sm text-[#212121] leading-relaxed">
                {tr(language, 'dedupeOutcomeRemainingDetail')}
              </p>
            </div>
          </motion.div>

          {/* ── Retrieval progress, once consent is given and the CTA is used ── */}
          {phase === 'processing' && (
            <div className="space-y-3" aria-live="polite">
              {steps.map((step, index) => {
                const isCompleted = completed.includes(step.id);
                const isActive = stepIndex === index && !isCompleted;
                if (!isCompleted && !isActive) return null;

                return (
                  <div
                    key={step.id}
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg border ${
                      isCompleted
                        ? 'bg-[#2da94f]/5 border-[#2da94f]/20'
                        : 'bg-[#315C9D]/5 border-[#315C9D]/20'
                    }`}
                  >
                    {isCompleted ? (
                      <CheckCircle
                        className="w-5 h-5 text-[#2da94f] flex-shrink-0"
                        strokeWidth={2.5}
                        aria-hidden="true"
                      />
                    ) : (
                      <Loader2
                        className="w-5 h-5 text-[#315C9D] animate-spin flex-shrink-0"
                        strokeWidth={2.5}
                        aria-hidden="true"
                      />
                    )}
                    <span
                      className={`text-sm font-medium ${
                        isCompleted ? 'text-[#2da94f]' : 'text-[#315C9D]'
                      }`}
                    >
                      {language === 'English' ? step.labelEn : step.labelTa}
                    </span>
                  </div>
                );
              })}
            </div>
          )}

        </div>
      </main>

      <StickyFooter>
        {/* One declaration, so it stays inline above the CTA per the consent
            pattern. "Read more" is a sibling of the checkbox, never a child: a
            button inside a button is invalid HTML and the inner control would be
            unreachable. */}
        <div className="mb-3 flex items-start gap-3">
          <button
            type="button"
            role="checkbox"
            aria-checked={consent}
            aria-labelledby="dedupe-ckyc-consent-label"
            disabled={phase === 'processing'}
            onClick={() => setConsent(!consent)}
            className="flex-shrink-0 mt-0.5 p-0.5 rounded-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#315C9D] disabled:cursor-not-allowed"
          >
            <span
              className={`flex w-5 h-5 rounded-[5px] border items-center justify-center transition-colors ${
                consent ? 'bg-[#315C9D] border-[#315C9D]' : 'bg-white border-[#c4c4c4]'
              }`}
            >
              {consent && (
                <Check className="w-3.5 h-3.5 text-white" strokeWidth={3} aria-hidden="true" />
              )}
            </span>
          </button>

          <p className="text-[12px] text-[#6b7280] leading-relaxed">
            <span id="dedupe-ckyc-consent-label">{tr(language, 'ckycPanConsentText')}</span>{' '}
            <button
              type="button"
              onClick={() => setShowConsentSheet(true)}
              className="text-[12px] font-semibold text-[#315C9D] underline underline-offset-2 rounded-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#315C9D]"
            >
              {tr(language, 'panAadhaarReadMore')}
            </button>
          </p>
        </div>

        <button
          type="button"
          onClick={handleContinue}
          disabled={phase === 'processing' || !consent}
          className="w-full bg-[#315C9D] text-white h-12 rounded-lg text-base font-semibold flex items-center justify-center gap-2 active:scale-[0.98] transition-all disabled:opacity-40 disabled:cursor-not-allowed focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#315C9D]"
        >
          {phase === 'processing' ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" strokeWidth={2.5} aria-hidden="true" />
              {tr(language, 'dedupeOutcomeRetrieving')}
            </>
          ) : (
            <>
              {tr(language, 'dedupeOutcomeContinueBtn')}
              <ArrowRight className="w-5 h-5" strokeWidth={2.5} aria-hidden="true" />
            </>
          )}
        </button>
      </StickyFooter>

      {/* Read-only consent wording. No footer action, so closing it is the only
          exit and the checkbox stays the single place consent is given. */}
      <BottomSheet
        open={showConsentSheet}
        onClose={() => setShowConsentSheet(false)}
        title={tr(language, 'ckycPanConsentTitle')}
      >
        <p className="text-sm text-[#6b7280] leading-relaxed whitespace-pre-line">
          {tr(language, 'ckycPanConsentFull')}
        </p>
      </BottomSheet>
    </div>
  );
}
