import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router';
import { motion, useReducedMotion } from 'motion/react';
import { ArrowRight, Check } from 'lucide-react';
import { TopBar } from './TopBar';
import { StickyFooter } from './StickyFooter';
import { BottomSheet } from './BottomSheet';
import { useLanguage } from '../hooks/useLanguage';
import { tr } from '../flows/hrmsContent';
import {
  getActiveFlow,
  hasStep,
  hrmsNextRoute,
  isHrmsFlow,
  type HrmsFlowId,
} from '../flows/hrmsFlows';
import { readJourney, writeJourney } from '../flows/hrmsJourney';
import aadhaarImg from '@/assets/aadhaar.svg';

/** Five uppercase letters, four digits, one uppercase letter — `AAAAA9999A`. */
const PAN_REGEX = /^[A-Z]{5}\d{4}[A-Z]$/;

/** Milliseconds before an entered Aadhaar digit is replaced by its mask character. */
const MASK_DELAY_MS = 500;

const AADHAAR_LENGTH = 12;
const PAN_LENGTH = 10;

/**
 * `/hrms-pan-aadhaar` — optional PAN plus mandatory Aadhaar on one screen.
 *
 * Reached only by flow 4 (`hrms-nopan-ntb`), where the customer has no IOB
 * account and no PAN on the HRMS record, so both values have to be captured
 * before Aadhaar verification.
 *
 * **Non-HRMS flows redirect to `/`.** This screen has no meaning outside an
 * HRMS journey: it writes to HRMS journey state and takes its destination from
 * the HRMS registry, neither of which exists for the eight existing flows. A
 * direct URL open under a non-HRMS `activeFlow` therefore redirects to the
 * dashboard rather than rendering a dead-end form. The redirect stub renders no
 * copy, so the "exactly one `h1`" and `main`-wrapper rules apply to the real
 * screen below.
 */
export function PANAadhaarEntryPage() {
  const navigate = useNavigate();
  const flow = getActiveFlow();
  // Flows 1–3 reach their CKYC record with a PAN, so they declare no
  // `pan-aadhaar-entry` step and have no destination out of this screen. Opening
  // it directly under one of them would dead-end, so it redirects too.
  const usable = isHrmsFlow(flow) && hasStep(flow, 'pan-aadhaar-entry');

  useEffect(() => {
    if (!usable) navigate('/', { replace: true });
  }, [usable, navigate]);

  if (!usable) return null;

  return <PANAadhaarEntry flow={flow as HrmsFlowId} />;
}

function PANAadhaarEntry({ flow }: { flow: HrmsFlowId }) {
  const navigate = useNavigate();
  const [selectedLanguage] = useLanguage();
  const reduceMotion = useReducedMotion();

  // Fields are seeded from journey state so returning to this screen from a
  // later step restores what was already entered (Requirement 7.9). The Aadhaar
  // consent selection is deliberately not persisted: the journey state shape
  // has no field for it, and a consent statement is re-affirmed on each visit.
  // Only a PAN the customer typed themselves is restored. The journey's `pan`
  // slot also carries record-derived values (HRMS, account lookup), and those
  // must never appear pre-filled in an optional field.
  const [pan, setPan] = useState(() => {
    const journey = readJourney(flow);
    return journey.panSource === 'user' ? journey.pan : '';
  });
  const [panBlurred, setPanBlurred] = useState(false);
  const [consent, setConsent] = useState(false);
  // Purely informational: the sheet only shows the full consent wording. It never
  // sets `consent` and never advances the flow, so the CTA gating is untouched.
  const [showConsentSheet, setShowConsentSheet] = useState(false);

  // ── Aadhaar entry with per-digit masking ──
  // Same technique as AadhaarVerificationPage: a transparent input holds the
  // real digits while an overlay renders the masked display. Digits seeded from
  // journey state start already masked, so a restored value is never exposed.
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
  useEffect(() => () => maskTimers.current.forEach(t => clearTimeout(t)), []);

  const handleAadhaarChange = (value: string) => {
    // Non-digits and anything past the twelfth digit are dropped; the digits
    // already accepted survive untouched (Requirement 7.8).
    const clean = value.replace(/\D/g, '').slice(0, AADHAAR_LENGTH);
    const digits = clean.split('');
    const padded = [...digits, ...Array(AADHAAR_LENGTH - digits.length).fill('')];

    maskTimers.current.forEach(t => clearTimeout(t));
    maskTimers.current = [];

    setAadhaarDigits(padded);

    // Each visible digit gets its own mask timer; digits already masked stay masked.
    const newMasked = [...maskedDigits];
    padded.forEach((d, i) => {
      if (d && !newMasked[i]) {
        newMasked[i] = false;
        const timer = setTimeout(() => {
          setMaskedDigits(prev => {
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

  const displayChars = aadhaarDigits.map((d, i) =>
    d
      ? { char: maskedDigits[i] ? '*' : d, type: 'filled' as const }
      : { char: '*', type: 'placeholder' as const },
  );

  // Grouped as "XXXX XXXX XXXX".
  const formattedDisplay = displayChars.reduce((acc, item, i) => {
    if (i > 0 && i % 4 === 0) acc.push({ char: ' ', type: 'space' as const });
    acc.push(item);
    return acc;
  }, [] as { char: string; type: 'filled' | 'placeholder' | 'space' }[]);

  const rawAadhaar = aadhaarDigits.join('');

  // ── Validation and CTA gating ──
  const panWellFormed = pan.length === 0 || PAN_REGEX.test(pan);
  // The error surfaces only after the field has lost focus (Requirement 7.4),
  // but the CTA is gated on validity from the first keystroke (Requirement 7.3).
  const showPanError = panBlurred && pan.length > 0 && !panWellFormed;
  const canContinue = rawAadhaar.length === AADHAAR_LENGTH && consent && panWellFormed;

  const handleContinue = () => {
    if (!canContinue) return;

    writeJourney(flow, {
      aadhaarNumber: rawAadhaar,
      pan,
      panSource: pan ? 'user' : 'none',
      // Entering Aadhaar verification from here always starts at the flow's
      // first Aadhaar segment.
      aadhaarSegmentIndex: 0,
    });

    // Destination comes from the registry, never from a literal here. It is
    // null only for a flow that does not declare this step, which no HRMS flow
    // routes to; in that case there is nowhere to go, so nothing happens.
    const next = hrmsNextRoute(flow, 'pan-aadhaar-entry');
    if (next) navigate(next);
  };

  const fadeIn = (delay: number) =>
    reduceMotion
      ? {}
      : {
          initial: { y: 20, opacity: 0 },
          animate: { y: 0, opacity: 1 },
          transition: { delay },
        };

  const placeholder = tr(selectedLanguage, 'panAadhaarAadhaarPlaceholder');

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <TopBar showBack />

      <main className="flex-1 overflow-y-auto pb-40">
        <div className="max-w-lg mx-auto px-4 pt-8">

          <motion.div
            {...(reduceMotion ? {} : { initial: { scale: 0, opacity: 0 }, animate: { scale: 1, opacity: 1 }, transition: { duration: 0.4 } })}
            className="flex justify-center mb-8"
          >
            <img src={aadhaarImg} alt="" aria-hidden="true" className="w-[62px] h-auto object-contain" />
          </motion.div>

          <motion.div {...fadeIn(0.1)} className="text-center mb-8">
            <h1 className="text-xl font-semibold text-[#111827] mb-1">
              {tr(selectedLanguage, 'panAadhaarTitle')}
            </h1>
            <p className="text-sm text-[#6b7280]">
              {tr(selectedLanguage, 'panAadhaarSubtitle')}
            </p>
          </motion.div>

          {/* ── PAN — optional ── */}
          <motion.div {...fadeIn(0.2)} className="mb-6">
            <div className="flex items-baseline justify-between mb-2 gap-2">
              <label
                htmlFor="hrms-pan"
                className="block text-[12px] font-semibold text-[#666666] uppercase tracking-wide"
              >
                {tr(selectedLanguage, 'panAadhaarPanLabel')}
              </label>
              <span className="text-[11px] font-medium text-[#6b7280]">
                {tr(selectedLanguage, 'panAadhaarPanOptionalMarker')}
              </span>
            </div>

            <div
              className={`flex items-center bg-transparent border rounded-lg px-4 h-14 transition-all focus-within:ring-1 ${
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
                  setPan(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, PAN_LENGTH))
                }
                onBlur={() => setPanBlurred(true)}
                maxLength={PAN_LENGTH}
                autoComplete="off"
                aria-invalid={showPanError}
                aria-describedby={showPanError ? 'hrms-pan-error' : undefined}
                placeholder={tr(selectedLanguage, 'panAadhaarPanPlaceholder')}
                className="flex-1 bg-transparent outline-none text-[16px] font-semibold tracking-[0.15em] text-[#212121] placeholder:text-[#9e9e9e] placeholder:font-normal placeholder:tracking-normal uppercase"
              />
            </div>

            {showPanError && (
              <p
                id="hrms-pan-error"
                role="alert"
                className="mt-2 text-[12px] font-medium text-[#c0392b] leading-relaxed"
              >
                {tr(selectedLanguage, 'panAadhaarPanFormatError')}
              </p>
            )}
          </motion.div>

          {/* ── Aadhaar — required, masked ── */}
          <motion.div {...fadeIn(0.3)} className="mb-6">
            <div className="flex items-baseline justify-between mb-2 gap-2">
              <label
                htmlFor="hrms-aadhaar"
                className="block text-[12px] font-semibold text-[#666666] uppercase tracking-wide"
              >
                {tr(selectedLanguage, 'panAadhaarAadhaarLabel')}
              </label>
              <span className="text-[11px] font-medium text-[#315C9D]">
                {tr(selectedLanguage, 'panAadhaarAadhaarRequiredMarker')}
              </span>
            </div>

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
                autoComplete="off"
                className="w-full bg-transparent border border-[#e5e7eb] rounded-lg px-4 h-14 focus:border-[#254576] focus:ring-1 focus:ring-[#254576]/20 transition-all outline-none text-[16px] font-semibold text-transparent caret-transparent"
                placeholder=""
              />

              {/* Masked display overlay — the input itself renders transparent text. */}
              <div className="absolute inset-0 flex items-center px-4 pointer-events-none" aria-hidden="true">
                {!inputFocused && rawAadhaar.length === 0 ? (
                  <span className="text-sm text-[#9e9e9e] font-normal">{placeholder}</span>
                ) : (
                  <span className="tracking-[0.1em] flex items-center">
                    {formattedDisplay.map((item, i) => {
                      const cursorIndex = formattedDisplay.findIndex(x => x.type === 'placeholder');
                      const showCursor = inputFocused && i === cursorIndex;
                      return (
                        <span key={i} className="relative inline-flex items-center">
                          {showCursor && (
                            <span className="absolute left-0 top-1/2 -translate-y-1/2 w-[1.5px] h-5 bg-[#212121] animate-pulse" />
                          )}
                          {item.type === 'space' ? (
                            <span className="inline-block w-2.5" />
                          ) : item.type === 'filled' ? (
                            <span className="text-[14px] font-semibold text-[#111827]">{item.char}</span>
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
            </div>
          </motion.div>

        </div>
      </main>

      <StickyFooter>
        {/* Aadhaar consent — the short declaration stays inline above the CTA; the
            full UIDAI wording lives behind "Read more". The link is a sibling of
            the checkbox, never a child of it: a button inside a button is invalid
            HTML and the inner control would be unreachable. */}
        <div className="mb-3 flex items-start gap-3">
          {/* The button wraps only the box, so "Read more" can sit in the text
              flow beside the copy. Selection is signalled by the tick icon,
              not colour alone. */}
          <button
            type="button"
            role="checkbox"
            aria-checked={consent}
            aria-labelledby="pan-aadhaar-consent-label"
            onClick={() => setConsent(!consent)}
            className="flex-shrink-0 mt-0.5 p-0.5 rounded-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#315C9D]"
          >
            <span
              className={`flex w-5 h-5 rounded-[5px] border items-center justify-center transition-colors ${
                consent ? 'bg-[#315C9D] border-[#315C9D]' : 'bg-white border-[#c4c4c4]'
              }`}
            >
              {consent && <Check className="w-3.5 h-3.5 text-white" strokeWidth={3} aria-hidden="true" />}
            </span>
          </button>

          <p className="text-[12px] text-[#6b7280] leading-relaxed">
            <span id="pan-aadhaar-consent-label">
              {tr(selectedLanguage, 'panAadhaarConsentText')}
            </span>{' '}
            <button
              type="button"
              onClick={() => setShowConsentSheet(true)}
              className="text-[12px] font-semibold text-[#315C9D] underline underline-offset-2 rounded-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#315C9D]"
            >
              {tr(selectedLanguage, 'panAadhaarReadMore')}
            </button>
          </p>
        </div>

        <button
          type="button"
          onClick={handleContinue}
          disabled={!canContinue}
          aria-disabled={!canContinue}
          className="w-full bg-[#315C9D] text-white h-12 rounded-lg text-base font-semibold flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed transition-opacity active:scale-[0.98] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#315C9D]"
        >
          {tr(selectedLanguage, 'panAadhaarContinueBtn')}
          <ArrowRight className="w-5 h-5" strokeWidth={2.5} aria-hidden="true" />
        </button>
      </StickyFooter>

      {/* Read-only consent sheet — no footer action, so closing it is the only exit
          and the checkbox above remains the single place consent is given. */}
      <BottomSheet
        open={showConsentSheet}
        onClose={() => setShowConsentSheet(false)}
        title={tr(selectedLanguage, 'panAadhaarConsentTitle')}
      >
        <p className="text-sm text-[#6b7280] leading-relaxed whitespace-pre-line">
          {tr(selectedLanguage, 'panAadhaarConsentFull')}
        </p>
      </BottomSheet>
    </div>
  );
}
