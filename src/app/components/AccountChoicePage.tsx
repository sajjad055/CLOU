import { useEffect, useRef, useState } from 'react';
import type { KeyboardEvent } from 'react';
import { Navigate, useNavigate } from 'react-router';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { AlertCircle, ArrowRight, Check, CheckCircle, Info, Landmark, Loader2 } from 'lucide-react';
import { TopBar } from './TopBar';
import { StickyFooter } from './StickyFooter';
import { BottomSheet } from './BottomSheet';
import { useLanguage } from '../hooks/useLanguage';
import {
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
import aadhaarImg from '@/assets/aadhaar.svg';

/**
 * Account_Choice_Screen — `/hrms-account-choice`.
 *
 * Asks whether the customer already banks with IOB, then collects the details
 * that answer implies **on this screen** rather than sending them onward to
 * another one. Presented by flows 3, 4 and 5 (the flows whose HRMS record
 * carries no PAN).
 *
 * The two option rows and their fields live in one bordered container:
 *   • "I have an IOB account" reveals the account-number field, and continuing
 *     runs the `account-pan-lookup` retrieval in a `processing` phase here.
 *   • "I don't have an IOB account" reveals the optional PAN plus the mandatory
 *     masked Aadhaar field.
 *
 * Either answer carries exactly one declaration, inline above the CTA, and which
 * one is shown follows the answer: the account path authorises the bank-record
 * read and the CKYC download it performs here, the other authorises Aadhaar use.
 *
 * `/hrms-account-entry` and `/hrms-pan-aadhaar` stay registered and their
 * components stay in place, so Dev Preview can still open either directly.
 */

/** The two options, in display order. Also the arrow-key traversal order. */
const OPTIONS = ['has-account', 'no-account'] as const;

type Choice = (typeof OPTIONS)[number];

type Phase = 'entry' | 'processing';

/** IOB account number bounds, ported from IOB_Account_Entry_Screen. */
const MIN_ACCOUNT_DIGITS = 9;
const MAX_ACCOUNT_DIGITS = 18;

/** Five uppercase letters, four digits, one uppercase letter — `AAAAA9999A`. */
const PAN_REGEX = /^[A-Z]{5}\d{4}[A-Z]$/;
const PAN_LENGTH = 10;

const AADHAAR_LENGTH = 12;

/** Milliseconds before an entered Aadhaar digit is replaced by its mask character. */
const MASK_DELAY_MS = 500;

/** How long the retrieval outcome stays on screen before the automatic navigation. */
const OUTCOME_DWELL_MS = 1200;

/** Matches the disclosure transition below, so the scroll measures a settled panel. */
const REVEAL_MS = 250;

/** Gap left above the selected row once it is scrolled up. */
const ROW_TOP_GAP = 12;

/**
 * Direct entry that this screen has no journey for — a non-HRMS `activeFlow`,
 * or an HRMS flow whose step table declares no `account-choice` (flows 1 and 2,
 * per Requirement 5.9). Both cases send the visitor to the app root and leave
 * `activeFlow` untouched, matching `HRMSDetailsPage`, so whatever journey is
 * selected is still selected when they start it from there.
 *
 * The guard sits in a wrapper with no hooks of its own, so the inner component
 * always mounts with a settled flow and its hook order never varies.
 */
export function AccountChoicePage() {
  const flow = getActiveFlow();
  if (!isHrmsFlow(flow) || !hasStep(flow, 'account-choice')) {
    return <Navigate to="/" replace />;
  }
  return <AccountChoice flow={flow} />;
}

function AccountChoice({ flow }: { flow: HrmsFlowId }) {
  const navigate = useNavigate();
  const [language] = useLanguage();
  const reduceMotion = useReducedMotion();

  const definition = getHrmsFlow(flow)!;

  // Everything is seeded from journey state, so returning from a later screen
  // restores the selection and whatever was typed under it (Requirement 5.8). A
  // fresh journey carries `null`, so both options start unselected (5.7).
  const [choice, setChoice] = useState<Choice | null>(
    () => readJourney(flow).accountChoice,
  );

  const [phase, setPhase] = useState<Phase>('entry');
  const optionRefs = useRef<Array<HTMLButtonElement | null>>([]);

  // Scrolling the newly revealed fields into view needs the scroll container and
  // each option's row (the button plus its disclosure panel).
  const mainRef = useRef<HTMLElement | null>(null);
  const rowRefs = useRef<Array<HTMLDivElement | null>>([]);
  /**
   * Only a selection the customer just made triggers the scroll. A selection
   * restored from journey state on mount must not move the page under them.
   */
  const userSelected = useRef(false);

  // ── "I have an IOB account" — account number ──
  const [accountNumber, setAccountNumber] = useState(
    () => readJourney(flow).iobAccountNumber,
  );
  const [showShortError, setShowShortError] = useState(false);

  // ── "I don't have an IOB account" — PAN, Aadhaar, consent ──
  const [pan, setPan] = useState(() => readJourney(flow).pan);
  const [panBlurred, setPanBlurred] = useState(false);

  // ── Consent, one declaration per path ──
  // Two separate flags rather than one shared one: what each path authorises is
  // different, so a tick given on one answer must not carry over to the other.
  const [aadhaarConsent, setAadhaarConsent] = useState(false);
  const [accountConsent, setAccountConsent] = useState(false);
  // Purely informational: the sheet only shows the full consent wording. It never
  // sets either flag and never advances the flow, so the CTA gating is untouched.
  const [showConsentSheet, setShowConsentSheet] = useState(false);

  // Aadhaar entry with per-digit masking — the same technique as
  // PAN_Aadhaar_Entry_Screen: a transparent input holds the real digits while an
  // overlay renders the masked display. Digits seeded from journey state start
  // already masked, so a restored value is never exposed.
  const [seededAadhaar] = useState(() =>
    readJourney(flow).aadhaarNumber.replace(/\D/g, '').slice(0, AADHAAR_LENGTH),
  );
  const [aadhaarDigits, setAadhaarDigits] = useState<string[]>(() => {
    const digits = seededAadhaar.split('');
    return [...digits, ...Array(AADHAAR_LENGTH - digits.length).fill('')];
  });
  const [maskedDigits, setMaskedDigits] = useState<boolean[]>(() =>
    Array.from({ length: AADHAAR_LENGTH }, (_, i) => Boolean(seededAadhaar[i])),
  );
  const maskTimers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const [inputFocused, setInputFocused] = useState(false);

  // Leaving the screen mid-entry must not leave timers writing into unmounted state.
  useEffect(() => () => maskTimers.current.forEach((t) => clearTimeout(t)), []);

  // ── Retrieval progress, used only by the "have account" path ──
  const steps: ProcessingStep[] = hrmsProcessing(flow, 'account-pan-lookup');
  const [stepIndex, setStepIndex] = useState(0);
  const [completedIds, setCompletedIds] = useState<string[]>([]);
  /** Guards the one-time journey write when the retrieval finishes. */
  const outcomeWritten = useRef(false);

  const stepsDone = phase === 'processing' && stepIndex >= steps.length;

  /**
   * `undefined` for a flow that never looks at an account record; a string when
   * the record holds a PAN; `null` when it holds none.
   */
  const accountRecordPan = definition.accountRecordPan;
  const panFound = typeof accountRecordPan === 'string' && accountRecordPan.length > 0;

  // ── Validation ───────────────────────────────────────────────────────────
  const isLongEnough = accountNumber.length >= MIN_ACCOUNT_DIGITS;

  const rawAadhaar = aadhaarDigits.join('');
  const panWellFormed = pan.length === 0 || PAN_REGEX.test(pan);
  // The error surfaces only after the field has lost focus (Requirement 7.4),
  // but the CTA is gated on validity from the first keystroke (Requirement 7.3).
  const showPanError = panBlurred && pan.length > 0 && !panWellFormed;
  const noAccountValid =
    rawAadhaar.length === AADHAAR_LENGTH && aadhaarConsent && panWellFormed;

  /**
   * Hard-disabled with nothing selected, while retrieving, on the "don't have
   * account" path until Aadhaar, consent and PAN all pass, and on the "have
   * account" path until its consent is given — the lookups this screen runs are
   * exactly what that declaration authorises, so it gates them.
   *
   * Digit count is deliberately *not* a hard gate: once consent is given the
   * control stays activatable below 9 digits so the short-input error is
   * reachable by mouse, touch and keyboard; it is marked and styled unavailable
   * instead (Requirements 6.2, 6.4).
   */
  const hardDisabled =
    phase === 'processing' ||
    choice === null ||
    (choice === 'has-account' && !accountConsent) ||
    (choice === 'no-account' && !noAccountValid);
  const looksUnavailable =
    hardDisabled || (choice === 'has-account' && !isLongEnough);

  // ── Destinations ─────────────────────────────────────────────────────────
  /**
   * Not every flow declares both steps: `hrms-nopan-etb` and
   * `hrms-nopan-etb-nopan` declare `account-pan-lookup` but no
   * `pan-aadhaar-entry`, while `hrms-nopan-ntb` declares `pan-aadhaar-entry`
   * but no `account-pan-lookup`. Now that both paths start from this one
   * screen, either answer can be given under any of those flows, so when the
   * selected path's step is not declared we take the other declared step's
   * destination rather than dead-ending the journey.
   */
  const destinationFor = (path: Choice): string | null => {
    const own = path === 'has-account' ? 'account-pan-lookup' : 'pan-aadhaar-entry';
    const other = path === 'has-account' ? 'pan-aadhaar-entry' : 'account-pan-lookup';
    return hasStep(flow, own)
      ? hrmsNextRoute(flow, own)
      : hrmsNextRoute(flow, other);
  };

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
    if (!stepsDone) return;

    if (!outcomeWritten.current) {
      outcomeWritten.current = true;
      // The account number is kept for the rest of the journey, so the customer
      // is never sent back here to re-enter it (Requirement 6.9).
      writeJourney(flow, {
        iobAccountNumber: accountNumber,
        pan: panFound ? (accountRecordPan as string) : '',
        panSource: panFound ? 'account-record' : 'none',
      });
    }

    // `destinationFor` reads only pure registry helpers keyed by `flow`, which
    // is already a dependency, so it needs no place in the list.
    const destination = destinationFor('has-account') ?? '/';
    const timer = setTimeout(() => navigate(destination), OUTCOME_DWELL_MS);
    return () => clearTimeout(timer);
  }, [stepsDone, flow, accountNumber, panFound, accountRecordPan, navigate]);

  // ── Handlers ─────────────────────────────────────────────────────────────

  /**
   * Selecting one option deselects the other by construction: a single value
   * holds the selection, so the two can never both be set (Requirements 5.1,
   * 5.2). Persisted on every change rather than on continue, so a back press
   * still restores the choice.
   */
  const select = (next: Choice) => {
    if (phase === 'processing') return;
    userSelected.current = true;
    setChoice(next);
    setShowShortError(false);
    writeJourney(flow, { accountChoice: next });
  };

  /**
   * Bring the selected option's fields into view.
   *
   * The disclosure panel expands below the option row, and the sticky footer
   * covers the bottom of the viewport, so on a short screen the newly revealed
   * fields can open straight underneath the CTA. Scrolling the row up near the
   * top of the scroll area gives the panel the whole remaining height.
   *
   * Two guards: it runs only for a selection the customer just made (not one
   * restored on mount), and it waits out the expand animation, since measuring
   * mid-animation lands short of the panel's final height.
   */
  useEffect(() => {
    if (choice === null || !userSelected.current) return;
    if (phase === 'processing') return;

    const index = OPTIONS.indexOf(choice);
    const timer = setTimeout(() => {
      const container = mainRef.current;
      const row = rowRefs.current[index];
      if (!container || !row) return;

      const offset =
        row.getBoundingClientRect().top - container.getBoundingClientRect().top;
      const target = container.scrollTop + offset - ROW_TOP_GAP;

      // Already at or above the target — nothing worth moving for.
      if (Math.abs(target - container.scrollTop) < 2) return;

      container.scrollTo({
        top: target,
        behavior: reduceMotion ? 'auto' : 'smooth',
      });
    }, reduceMotion ? 0 : REVEAL_MS);

    return () => clearTimeout(timer);
  }, [choice, phase, reduceMotion]);

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

  /**
   * Keeps only digits and only the first 18 of them. A rejected character leaves
   * the previously entered digits untouched and shows no error (Requirements
   * 6.1, 6.3).
   */
  const handleAccountChange = (raw: string) => {
    if (phase === 'processing') return;
    setAccountNumber(raw.replace(/\D/g, '').slice(0, MAX_ACCOUNT_DIGITS));
    setShowShortError(false);
  };

  const handleAadhaarChange = (value: string) => {
    // Non-digits and anything past the twelfth digit are dropped; the digits
    // already accepted survive untouched (Requirement 7.8).
    const clean = value.replace(/\D/g, '').slice(0, AADHAAR_LENGTH);
    const digits = clean.split('');
    const padded = [...digits, ...Array(AADHAAR_LENGTH - digits.length).fill('')];

    maskTimers.current.forEach((t) => clearTimeout(t));
    maskTimers.current = [];

    setAadhaarDigits(padded);

    // Each visible digit gets its own mask timer; digits already masked stay masked.
    const newMasked = [...maskedDigits];
    padded.forEach((d, i) => {
      if (d && !newMasked[i]) {
        newMasked[i] = false;
        const timer = setTimeout(() => {
          setMaskedDigits((prev) => {
            const n = [...prev];
            n[i] = true;
            return n;
          });
        }, MASK_DELAY_MS);
        maskTimers.current.push(timer);
      } else if (!d) {
        newMasked[i] = false;
      }
    });
    setMaskedDigits(newMasked);
  };

  const handleContinue = () => {
    // The CTA is rendered `disabled` in every one of these cases, so this is
    // belt-and-braces: an activation that slips through starts nothing and
    // leaves the selection untouched (Requirement 5.5).
    if (phase === 'processing' || choice === null) return;

    if (choice === 'has-account') {
      // Consent authorises the lookups, so nothing runs without it.
      if (!accountConsent) return;

      // Too short: stay put, start no retrieval, announce the error (6.4).
      if (!isLongEnough) {
        setShowShortError(true);
        return;
      }

      setShowShortError(false);
      writeJourney(flow, { iobAccountNumber: accountNumber });
      setStepIndex(0);
      setCompletedIds([]);
      outcomeWritten.current = false;
      setPhase('processing');
      return;
    }

    if (!noAccountValid) return;

    writeJourney(flow, {
      aadhaarNumber: rawAadhaar,
      pan,
      panSource: pan ? 'user' : 'none',
      // Entering Aadhaar verification from here always starts at the flow's
      // first Aadhaar segment.
      aadhaarSegmentIndex: 0,
    });

    const next = destinationFor('no-account');
    if (next) navigate(next);
  };

  // ── Animation, all disabled under prefers-reduced-motion ─────────────────
  const enter = (delay: number) =>
    reduceMotion
      ? { initial: { opacity: 1 }, animate: { opacity: 1 } }
      : { initial: { y: 20, opacity: 0 }, animate: { y: 0, opacity: 1 }, transition: { delay } };

  /** Disclosure of an option's fields. Height animates only with motion allowed. */
  const reveal = reduceMotion
    ? {
        initial: { opacity: 1 },
        animate: { opacity: 1 },
        exit: { opacity: 1 },
        transition: { duration: 0 },
      }
    : {
        initial: { height: 0, opacity: 0 },
        animate: { height: 'auto' as const, opacity: 1 },
        exit: { height: 0, opacity: 0 },
        transition: { duration: 0.25 },
      };

  const options: Array<{ value: Choice; label: string }> = [
    { value: 'has-account', label: tr(language, 'accountChoiceHasAccount') },
    { value: 'no-account', label: tr(language, 'accountChoiceNoAccount') },
  ];

  /**
   * The declaration that belongs to the selected answer, or `null` while nothing
   * is selected. Both paths ask for exactly one thing, so either way it stays
   * inline above the CTA per the consent pattern — what changes with the answer
   * is *what* is being authorised: bank-record plus CKYC access for the account
   * path, Aadhaar use for the other.
   */
  const consentDeclaration =
    choice === 'has-account'
      ? {
          checked: accountConsent,
          toggle: () => setAccountConsent((prev) => !prev),
          text: tr(language, 'accountChoiceAccountConsentText'),
          sheetTitle: tr(language, 'accountChoiceAccountConsentTitle'),
          sheetBody: tr(language, 'accountChoiceAccountConsentFull'),
        }
      : choice === 'no-account'
        ? {
            checked: aadhaarConsent,
            toggle: () => setAadhaarConsent((prev) => !prev),
            text: tr(language, 'panAadhaarConsentText'),
            sheetTitle: tr(language, 'panAadhaarConsentTitle'),
            sheetBody: tr(language, 'panAadhaarConsentFull'),
          }
        : null;

  const accountErrorId = 'iob-account-error';
  const aadhaarPlaceholder = tr(language, 'panAadhaarAadhaarPlaceholder');

  const displayChars = aadhaarDigits.map((d, i) =>
    d
      ? { char: maskedDigits[i] ? '*' : d, type: 'filled' as const }
      : { char: '*', type: 'placeholder' as const },
  );

  // Grouped as "XXXX XXXX XXXX".
  const formattedDisplay = displayChars.reduce(
    (acc, item, i) => {
      if (i > 0 && i % 4 === 0) acc.push({ char: ' ', type: 'space' as const });
      acc.push(item);
      return acc;
    },
    [] as { char: string; type: 'filled' | 'placeholder' | 'space' }[],
  );

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <TopBar showBack />

      <main ref={mainRef} className="flex-1 overflow-y-auto">
        <div className="max-w-lg mx-auto px-4 pt-8 pb-40">

          <motion.div {...enter(0.05)} className="flex justify-center mb-5">
            <img
              src={iobLogo}
              alt={tr(language, 'hrmsBankName')}
              className="h-[29px] w-auto object-contain"
            />
          </motion.div>

          <motion.div {...enter(0.1)} className="text-center mb-8">
            <h1 id="account-choice-title" className="text-xl font-semibold text-[#111827] mb-1">
              {tr(language, 'accountChoiceTitle')}
            </h1>
            <p className="text-sm text-[#6b7280] leading-relaxed">
              {tr(language, 'accountChoiceSubtitle')}
            </p>
          </motion.div>

          {/* One container holding both options and, beneath the selected one,
              its fields. Selection is signalled by the filled dot inside the
              ring — a shape change, not colour alone. */}
          <motion.div
            {...enter(0.2)}
            role="radiogroup"
            aria-labelledby="account-choice-title"
            className="border border-[#e5e7eb] rounded-xl overflow-hidden"
          >
            {options.map((option, index) => {
              const isSelected = choice === option.value;
              return (
                <div
                  key={option.value}
                  ref={(node) => {
                    rowRefs.current[index] = node;
                  }}
                  className={index > 0 ? 'border-t border-[#e5e7eb]' : ''}
                >
                  <button
                    ref={(node) => {
                      optionRefs.current[index] = node;
                    }}
                    type="button"
                    role="radio"
                    aria-checked={isSelected}
                    disabled={phase === 'processing'}
                    // Roving tabindex: the group is one Tab stop. With nothing
                    // selected the first option takes it, so the group is always
                    // reachable.
                    tabIndex={choice === null ? (index === 0 ? 0 : -1) : isSelected ? 0 : -1}
                    onClick={() => select(option.value)}
                    onKeyDown={(event) => handleKeyDown(event, index)}
                    className={`w-full text-left p-4 flex items-center gap-3 transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#315C9D] disabled:cursor-not-allowed ${
                      isSelected ? 'bg-[#2da94f]/5' : 'bg-white hover:bg-[#f9fafb]'
                    }`}
                  >
                    {/* Selected reads as a filled green tick, unselected as an
                        empty ring — a shape change, so the state never rests on
                        colour alone. */}
                    <span
                      className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
                        isSelected
                          ? 'bg-[#2da94f] border-[#2da94f]'
                          : 'bg-white border-[#c4c4c4]'
                      }`}
                      aria-hidden="true"
                    >
                      {isSelected && (
                        <Check className="w-3 h-3 text-white" strokeWidth={3.5} />
                      )}
                    </span>

                    <span className="text-sm font-semibold text-[#111827] min-w-0">
                      {option.label}
                    </span>
                  </button>

                  <AnimatePresence initial={false}>
                    {isSelected && (
                      <motion.div {...reveal} className="overflow-hidden">
                        {option.value === 'has-account' ? (
                          <div className="px-4 pt-2 pb-4">
                            <label
                              htmlFor="iob-account-number"
                              className="block text-[12px] font-semibold text-[#666666] mb-2 tracking-wide"
                            >
                              {tr(language, 'accountEntryLabel')}
                            </label>
                            <div className="flex items-center bg-white border border-[#e5e7eb] rounded-lg px-4 h-14 focus-within:border-[#254576] focus-within:ring-1 focus-within:ring-[#254576]/20 transition-all">
                              <input
                                id="iob-account-number"
                                type="text"
                                inputMode="numeric"
                                autoComplete="off"
                                value={accountNumber}
                                readOnly={phase === 'processing'}
                                onChange={(e) => handleAccountChange(e.target.value)}
                                aria-describedby={showShortError ? accountErrorId : undefined}
                                aria-invalid={showShortError}
                                placeholder={tr(language, 'accountEntryPlaceholder')}
                                className="flex-1 bg-transparent outline-none text-[16px] font-semibold tracking-[0.12em] text-[#212121] placeholder:text-[#9e9e9e] placeholder:font-normal placeholder:tracking-normal read-only:text-[#6b7280]"
                              />

                              {/* End icon. Decorative — the label already names the
                                  field — so it is hidden from assistive tech. */}
                              <Landmark
                                className="w-5 h-5 text-[#9e9e9e] flex-shrink-0 ml-3"
                                strokeWidth={2}
                                aria-hidden="true"
                              />
                            </div>

                            {showShortError && (
                              <p
                                id={accountErrorId}
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
                          </div>
                        ) : (
                          <div className="px-4 pt-2 pb-4">
                            <p className="text-[12px] text-[#6b7280] leading-relaxed mb-4">
                              {tr(language, 'accountChoiceNoAccountContext')}
                            </p>

                            {/* ── Aadhaar — required, masked. First, because it is
                                the field the verification actually runs on. Only
                                the optional field carries a marker, so the label
                                here stays plain and `required` + `aria-required`
                                carry the obligation. ── */}
                            <div className="mb-4">
                              <label
                                htmlFor="hrms-aadhaar"
                                className="block text-[12px] font-semibold text-[#666666] uppercase tracking-wide mb-2"
                              >
                                {tr(language, 'panAadhaarAadhaarLabel')}
                              </label>

                              <div className="relative">
                                <input
                                  id="hrms-aadhaar"
                                  type="text"
                                  inputMode="numeric"
                                  value={rawAadhaar}
                                  onChange={(e) => handleAadhaarChange(e.target.value)}
                                  onFocus={() => setInputFocused(true)}
                                  onBlur={() => setInputFocused(false)}
                                  maxLength={AADHAAR_LENGTH}
                                  required
                                  aria-required="true"
                                  autoComplete="off"
                                  className="w-full bg-white border border-[#e5e7eb] rounded-lg pl-4 pr-14 h-14 focus:border-[#254576] focus:ring-1 focus:ring-[#254576]/20 transition-all outline-none text-[16px] font-semibold text-transparent caret-transparent"
                                  placeholder=""
                                />

                                {/* Masked display overlay — the input itself renders
                                    transparent text. Right padding matches the input
                                    so the masked digits never run under the logo. */}
                                <div
                                  className="absolute inset-0 flex items-center pl-4 pr-14 pointer-events-none"
                                  aria-hidden="true"
                                >
                                  {!inputFocused && rawAadhaar.length === 0 ? (
                                    <span className="text-sm text-[#9e9e9e] font-normal">
                                      {aadhaarPlaceholder}
                                    </span>
                                  ) : (
                                    <span className="tracking-[0.1em] flex items-center">
                                      {formattedDisplay.map((item, i) => {
                                        const cursorIndex = formattedDisplay.findIndex(
                                          (x) => x.type === 'placeholder',
                                        );
                                        const showCursor = inputFocused && i === cursorIndex;
                                        return (
                                          <span key={i} className="relative inline-flex items-center">
                                            {showCursor && (
                                              <span className="absolute left-0 top-1/2 -translate-y-1/2 w-[1.5px] h-5 bg-[#212121] animate-pulse" />
                                            )}
                                            {item.type === 'space' ? (
                                              <span className="inline-block w-2.5" />
                                            ) : item.type === 'filled' ? (
                                              <span className="text-[14px] font-semibold text-[#111827]">
                                                {item.char}
                                              </span>
                                            ) : (
                                              <span className="text-[12px] text-[#6b7280]">*</span>
                                            )}
                                          </span>
                                        );
                                      })}
                                      {inputFocused && rawAadhaar.length === AADHAAR_LENGTH && (
                                        <span className="relative inline-flex items-center">
                                          <span className="w-[1.5px] h-5 bg-[#212121] animate-pulse" />
                                        </span>
                                      )}
                                    </span>
                                  )}
                                </div>

                                {/* End icon. Decorative — the label already names
                                    the field — so it is hidden from assistive tech. */}
                                <img
                                  src={aadhaarImg}
                                  alt=""
                                  aria-hidden="true"
                                  className="absolute right-4 top-1/2 -translate-y-1/2 h-7 w-auto object-contain pointer-events-none"
                                />
                              </div>
                            </div>

                            {/* ── PAN — optional, marked inline in the label ── */}
                            <div>
                              <label
                                htmlFor="hrms-pan"
                                className="block text-[12px] font-semibold text-[#666666] uppercase tracking-wide mb-2"
                              >
                                {tr(language, 'panAadhaarPanLabel')} (
                                {tr(language, 'panAadhaarPanOptionalMarker')})
                              </label>

                              <div
                                className={`flex items-center bg-white border rounded-lg px-4 h-14 transition-all focus-within:ring-1 ${
                                  showPanError
                                    ? 'border-[#c0392b] focus-within:border-[#c0392b] focus-within:ring-[#c0392b]/20'
                                    : 'border-[#e5e7eb] focus-within:border-[#254576] focus-within:ring-[#254576]/20'
                                }`}
                              >
                                <input
                                  id="hrms-pan"
                                  type="text"
                                  value={pan}
                                  onChange={(e) =>
                                    setPan(
                                      e.target.value
                                        .toUpperCase()
                                        .replace(/[^A-Z0-9]/g, '')
                                        .slice(0, PAN_LENGTH),
                                    )
                                  }
                                  onBlur={() => setPanBlurred(true)}
                                  maxLength={PAN_LENGTH}
                                  autoComplete="off"
                                  aria-invalid={showPanError}
                                  aria-describedby={showPanError ? 'hrms-pan-error' : undefined}
                                  placeholder={tr(language, 'panAadhaarPanPlaceholder')}
                                  className="flex-1 bg-transparent outline-none text-[16px] font-semibold tracking-[0.15em] text-[#212121] placeholder:text-[#9e9e9e] placeholder:font-normal placeholder:tracking-normal uppercase"
                                />
                              </div>

                              {showPanError && (
                                <p
                                  id="hrms-pan-error"
                                  role="alert"
                                  className="mt-2 text-[12px] font-medium text-[#c0392b] leading-relaxed"
                                >
                                  {tr(language, 'panAadhaarPanFormatError')}
                                </p>
                              )}
                            </div>
                          </div>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </motion.div>

          {/* ── Retrieval progress and outcome — "have account" path only ── */}
          {phase === 'processing' && (
            <div className="mt-6 space-y-3">
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
                    {tr(language, panFound ? 'accountEntryPanFound' : 'accountEntryPanAbsent')}
                  </span>
                </div>
              )}
            </div>
          )}

        </div>
      </main>

      <StickyFooter>
        {/* One declaration either way, so it stays inline above the CTA per the
            consent pattern, and only once an answer is selected. Its wording
            follows the answer: the account path authorises the bank-record read
            and the CKYC download this screen performs, the other path
            authorises Aadhaar use. The "Read more" link is a sibling of the
            checkbox, never a child: a button inside a button is invalid HTML and
            the inner control would be unreachable. */}
        {consentDeclaration && (
          <div className="mb-3 flex items-start gap-3">
            <button
              type="button"
              role="checkbox"
              aria-checked={consentDeclaration.checked}
              aria-labelledby="account-choice-consent-label"
              disabled={phase === 'processing'}
              onClick={consentDeclaration.toggle}
              className="flex-shrink-0 mt-0.5 p-0.5 rounded-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#315C9D] disabled:cursor-not-allowed"
            >
              <span
                className={`flex w-5 h-5 rounded-[5px] border items-center justify-center transition-colors ${
                  consentDeclaration.checked
                    ? 'bg-[#315C9D] border-[#315C9D]'
                    : 'bg-white border-[#c4c4c4]'
                }`}
              >
                {consentDeclaration.checked && (
                  <Check className="w-3.5 h-3.5 text-white" strokeWidth={3} aria-hidden="true" />
                )}
              </span>
            </button>

            <p className="text-[12px] text-[#6b7280] leading-relaxed">
              <span id="account-choice-consent-label">{consentDeclaration.text}</span>{' '}
              <button
                type="button"
                onClick={() => setShowConsentSheet(true)}
                className="text-[12px] font-semibold text-[#315C9D] underline underline-offset-2 rounded-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#315C9D]"
              >
                {tr(language, 'panAadhaarReadMore')}
              </button>
            </p>
          </div>
        )}

        <button
          type="button"
          onClick={handleContinue}
          disabled={hardDisabled}
          aria-disabled={looksUnavailable}
          className={`w-full bg-[#315C9D] text-white h-12 rounded-lg text-base font-semibold flex items-center justify-center gap-2 active:scale-[0.98] transition-all disabled:cursor-not-allowed focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#315C9D] ${
            looksUnavailable ? 'opacity-40' : ''
          }`}
        >
          {phase === 'processing' ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" strokeWidth={2.5} aria-hidden="true" />
              {language === 'English' ? 'Retrieving…' : 'பெறப்படுகிறது…'}
            </>
          ) : (
            <>
              {tr(language, 'accountChoiceContinueBtn')}
              <ArrowRight className="w-5 h-5" strokeWidth={2.5} aria-hidden="true" />
            </>
          )}
        </button>
      </StickyFooter>

      {/* Read-only consent sheet — no footer action, so closing it is the only
          exit and the checkbox above remains the single place consent is given. */}
      <BottomSheet
        open={showConsentSheet && consentDeclaration !== null}
        onClose={() => setShowConsentSheet(false)}
        title={consentDeclaration?.sheetTitle ?? ''}
      >
        <p className="text-sm text-[#6b7280] leading-relaxed whitespace-pre-line">
          {consentDeclaration?.sheetBody}
        </p>
      </BottomSheet>
    </div>
  );
}
