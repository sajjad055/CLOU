import { useRef, useState } from 'react';
import type { KeyboardEvent } from 'react';
import { Navigate, useNavigate } from 'react-router';
import { motion, useReducedMotion } from 'motion/react';
import { ArrowRight, Check, Landmark, UserPlus } from 'lucide-react';
import { TopBar } from './TopBar';
import { StickyFooter } from './StickyFooter';
import { useLanguage } from '../hooks/useLanguage';
import {
  getActiveFlow,
  getHrmsFlow,
  hasStep,
  isHrmsFlow,
  type HrmsFlowId,
  type HrmsStep,
} from '../flows/hrmsFlows';
import { readJourney, writeJourney } from '../flows/hrmsJourney';
import { tr } from '../flows/hrmsContent';

/**
 * Account_Choice_Screen — `/hrms-account-choice`.
 *
 * Asks whether the customer already banks with IOB, so the journey requests
 * only the details it needs. Presented by flows 3, 4 and 5 (the flows whose
 * HRMS record carries no PAN).
 *
 * The two destinations are read from the flow's `account-choice` step, never
 * hardcoded here: `next` is the "I have an IOB account" route and `altNext` the
 * "I don't" route. Flow 4 deliberately sets both to the same route because it
 * presents no IOB_Account_Entry_Screen, and this screen neither knows nor cares
 * (Requirements 5.3, 5.4).
 */

/** The two options, in display order. Also the arrow-key traversal order. */
const OPTIONS = ['has-account', 'no-account'] as const;

type Choice = (typeof OPTIONS)[number];

/**
 * Direct entry that this screen has no journey for — a non-HRMS `activeFlow`,
 * or an HRMS flow whose step table declares no `account-choice` (flows 1 and 2,
 * per Requirement 5.9). Both cases send the visitor to the app root and leave
 * `activeFlow` untouched, matching `HRMSDetailsPage`, so whatever journey is
 * selected is still selected when they start it from there.
 *
 * The guard sits in a wrapper with no hooks of its own, so the inner component
 * always mounts with a settled flow and step and its hook order never varies.
 */
export function AccountChoicePage() {
  const flow = getActiveFlow();
  if (!isHrmsFlow(flow) || !hasStep(flow, 'account-choice')) {
    return <Navigate to="/" replace />;
  }
  return <AccountChoice flow={flow} />;
}

/** The flow's `account-choice` row. Non-null whenever `hasStep` said so. */
function accountChoiceStep(flow: HrmsFlowId): HrmsStep {
  return getHrmsFlow(flow)!.steps.find((step) => step.id === 'account-choice')!;
}

function AccountChoice({ flow }: { flow: HrmsFlowId }) {
  const navigate = useNavigate();
  const [language] = useLanguage();
  const reduceMotion = useReducedMotion();

  const step = accountChoiceStep(flow);

  // Seeded from journey state, so returning from a later screen restores the
  // previous selection with the CTA already enabled (Requirement 5.8). A fresh
  // journey carries `null`, so both options start unselected (Requirement 5.7).
  const [choice, setChoice] = useState<Choice | null>(
    () => readJourney(flow).accountChoice,
  );

  const optionRefs = useRef<Array<HTMLButtonElement | null>>([]);

  const canContinue = choice !== null;

  /**
   * Selecting one option deselects the other by construction: a single value
   * holds the selection, so the two can never both be set (Requirements 5.1,
   * 5.2). Persisted on every change rather than on continue, so a back press
   * still restores the choice.
   */
  const select = (next: Choice) => {
    setChoice(next);
    writeJourney(flow, { accountChoice: next });
  };

  /**
   * Arrow keys move through the group and select as they go, which is the
   * expected behaviour for a radio group. Tab reaches the group once (roving
   * tabindex below) rather than stopping on each option.
   */
  const handleKeyDown = (event: KeyboardEvent<HTMLButtonElement>, index: number) => {
    const forward = event.key === 'ArrowDown' || event.key === 'ArrowRight';
    const backward = event.key === 'ArrowUp' || event.key === 'ArrowLeft';
    if (!forward && !backward) return;

    event.preventDefault();
    const nextIndex = (index + (forward ? 1 : -1) + OPTIONS.length) % OPTIONS.length;
    select(OPTIONS[nextIndex]);
    optionRefs.current[nextIndex]?.focus();
  };

  const handleContinue = () => {
    // The CTA is rendered `disabled`, so this is belt-and-braces: an activation
    // that slips through navigates nowhere and leaves the selection untouched
    // (Requirement 5.5).
    if (!canContinue) return;

    const destination = choice === 'has-account' ? step.next : (step.altNext ?? step.next);
    if (!destination) return;

    navigate(destination);
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

  const options: Array<{ value: Choice; label: string; icon: typeof Landmark }> = [
    { value: 'has-account', label: tr(language, 'accountChoiceHasAccount'), icon: Landmark },
    { value: 'no-account', label: tr(language, 'accountChoiceNoAccount'), icon: UserPlus },
  ];

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <TopBar showBack />

      <main className="flex-1 overflow-y-auto">
        <div className="max-w-lg mx-auto px-4 pt-8 pb-32">

          <motion.div {...pop()} className="flex justify-center mb-6">
            <div className="w-12 h-12 rounded-2xl bg-[#ebecef] flex items-center justify-center">
              <Landmark className="w-6 h-6 text-[#315C9D]" strokeWidth={2} aria-hidden="true" />
            </div>
          </motion.div>

          <motion.div {...enter(0.1)} className="text-center mb-8">
            <h1 id="account-choice-title" className="text-xl font-semibold text-[#111827] mb-1">
              {tr(language, 'accountChoiceTitle')}
            </h1>
            <p className="text-sm text-[#6b7280] leading-relaxed">
              {tr(language, 'accountChoiceSubtitle')}
            </p>
          </motion.div>

          <motion.div
            {...enter(0.2)}
            role="radiogroup"
            aria-labelledby="account-choice-title"
            className="space-y-3"
          >
            {options.map((option, index) => {
              const isSelected = choice === option.value;
              const Icon = option.icon;
              return (
                <button
                  key={option.value}
                  ref={(node) => {
                    optionRefs.current[index] = node;
                  }}
                  type="button"
                  role="radio"
                  aria-checked={isSelected}
                  // Roving tabindex: the group is one Tab stop. With nothing
                  // selected the first option takes it, so the group is always
                  // reachable.
                  tabIndex={choice === null ? (index === 0 ? 0 : -1) : isSelected ? 0 : -1}
                  onClick={() => select(option.value)}
                  onKeyDown={(event) => handleKeyDown(event, index)}
                  className={`w-full text-left border rounded-xl p-4 transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#315C9D] ${
                    isSelected
                      ? 'border-[#315C9D] bg-[#315C9D]/5'
                      : 'border-[#e5e7eb] bg-[#f9fafb] hover:border-[#c4c4c4]'
                  }`}
                >
                  <span className="flex items-center gap-3">
                    <span
                      className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                        isSelected ? 'border-[#315C9D]' : 'border-[#c4c4c4]'
                      }`}
                      aria-hidden="true"
                    >
                      {isSelected && <span className="w-2.5 h-2.5 rounded-full bg-[#315C9D]" />}
                    </span>

                    <Icon
                      className={`w-5 h-5 flex-shrink-0 ${isSelected ? 'text-[#315C9D]' : 'text-[#6b7280]'}`}
                      strokeWidth={2}
                      aria-hidden="true"
                    />

                    <span className="text-sm font-semibold text-[#111827] min-w-0">
                      {option.label}
                    </span>
                  </span>

                  {/* Non-colour signal for the selected state: a check mark plus
                      the word "Selected", visible without hover and without
                      focus (Requirement 5.6). */}
                  {isSelected && (
                    <span className="mt-2 ml-8 inline-flex items-center gap-1.5 text-[12px] font-semibold text-[#315C9D]">
                      <Check className="w-4 h-4" strokeWidth={3} aria-hidden="true" />
                      {tr(language, 'accountChoiceSelectedMarker')}
                    </span>
                  )}
                </button>
              );
            })}
          </motion.div>

          <StickyFooter>
            <button
              type="button"
              onClick={handleContinue}
              disabled={!canContinue}
              aria-disabled={!canContinue}
              className="w-full bg-[#315C9D] text-white h-12 rounded-lg text-base font-semibold flex items-center justify-center gap-2 active:scale-[0.98] transition-all disabled:opacity-40 disabled:cursor-not-allowed focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#315C9D]"
            >
              {tr(language, 'accountChoiceContinueBtn')}
              <ArrowRight className="w-5 h-5" strokeWidth={2.5} aria-hidden="true" />
            </button>
          </StickyFooter>

        </div>
      </main>
    </div>
  );
}
