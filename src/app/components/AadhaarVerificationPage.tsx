import { useNavigate } from 'react-router';
import { motion, useReducedMotion } from 'motion/react';
import { CheckCircle, Volume2, ChevronDown, Sun, Glasses, Eye, ScanFace, UserRound, ArrowRight, ArrowLeft, Shield, Check, Loader2, AlertCircle, RotateCcw } from 'lucide-react';
import { useState, useEffect, useMemo, useRef } from 'react';
import { TopBar } from './TopBar';
import { StickyFooter } from './StickyFooter';
import { BottomSheet } from './BottomSheet';
import { useLanguage } from '../hooks/useLanguage';
import type { AadhaarStepId } from '../flows/hrmsFlows';
import { HRMS_EMPLOYEE, cifCreate, getAadhaarSegment, getActiveFlow, isHrmsFlow } from '../flows/hrmsFlows';
import { advanceAadhaarSegment, readJourney } from '../flows/hrmsJourney';
import { tr } from '../flows/hrmsContent';
import aadhaarImg from '@/assets/aadhaar.svg';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';
import faceScanImg from '@/assets/face-scan.svg';
import faceRdImg from '@/assets/facerd.svg';
import successLottie from '@/assets/success.lottie';

// South Indian middle-aged Tamil man
import facePersonImg from '@/assets/face-person.png';
const FACE_PLACEHOLDER = facePersonImg;

/**
 * The linear step order this screen has always followed. Every non-HRMS flow
 * runs exactly this sequence, so `goNext()` reproduces the previous behaviour.
 */
const DEFAULT_SEQUENCE: AadhaarStepId[] = [
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
];

function CTAButton({ onClick, disabled, children }: { onClick?: () => void; disabled?: boolean; children: React.ReactNode }) {
  return (
    <button onClick={onClick} disabled={disabled}
      className="w-full bg-[#315C9D] text-white h-12 rounded-lg text-base font-semibold flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed transition-opacity active:scale-[0.98]">
      {children}
    </button>
  );
}

function FieldLabel({ children }: { children: React.ReactNode }) {
  return <label className="block text-[12px] font-semibold text-[#666666] uppercase tracking-wide mb-2">{children}</label>;
}

export function AadhaarVerificationPage() {
  const navigate = useNavigate();
  const [selectedLanguage] = useLanguage();

  // ── HRMS segment selection ────────────────────────────────────────────────
  // `hrmsFlow` is null for all eight existing flows, so `segment` is null, the
  // active sequence is DEFAULT_SEQUENCE and every HRMS branch below is dead.
  const hrmsFlow = useMemo(() => {
    const active = getActiveFlow();
    return isHrmsFlow(active) ? active : null;
  }, []);
  const journey = useMemo(() => (hrmsFlow ? readJourney(hrmsFlow) : null), [hrmsFlow]);
  const segment = useMemo(
    () => (hrmsFlow && journey ? getAadhaarSegment(hrmsFlow, journey.aadhaarSegmentIndex) : null),
    [hrmsFlow, journey],
  );

  const sequence = segment?.steps ?? DEFAULT_SEQUENCE;
  /** HRMS segments only: `updating-records` is relabelled as CIF creation. */
  const updatingAsCif = segment?.updatingRecordsAs === 'cif';
  /**
   * HRMS segments that go on to download a CKYC record with this Aadhaar. Only
   * those segments declare `ckyc-consent-otp`, so this is false for every one of
   * the eight existing flows (whose `segment` is null and whose sequence is
   * DEFAULT_SEQUENCE) and for the segments that never touch CKYC. Every branch
   * added for the CKYC consent hangs off this flag.
   */
  const needsCkycConsent = segment?.steps.includes('ckyc-consent-otp') ?? false;
  const [step, setStep] = useState<AadhaarStepId>(sequence[0]);
  const reduceMotion = useReducedMotion();

  /** Leave this screen once the active sequence is exhausted. */
  const exitSegment = () => {
    if (segment && hrmsFlow) {
      advanceAadhaarSegment(hrmsFlow);
      navigate(segment.exitRoute);
      return;
    }
    const flow = localStorage.getItem('activeFlow') || 'ntb-no-ckyc';
    const dest = (flow === 'ntb-no-ckyc-id' || flow === 'ntb-knows-ckyc-id') ? '/employee-id-upload' : '/loading';
    navigate(dest);
  };

  /** Advance one position in the active sequence; exit when there is no next step. */
  const goNext = () => {
    const nextStep = sequence[sequence.indexOf(step) + 1];
    if (nextStep) { setStep(nextStep); return; }
    exitSegment();
  };

  /**
   * Backward jump out of the face scan. In HRMS segments this is the cancel
   * path: it flags the incomplete authentication so the ready screen can
   * explain it, and never advances the sequence.
   */
  const cancelFaceScan = () => {
    if (segment) { setFaceCancelled(true); setBlinkDetected(false); setProgress(0); }
    setStep('face-verification-ready');
  };

  // Aadhaar input with masking.
  // HRMS segments that declare `seedAadhaarFromJourney` start with the number
  // the customer already gave, masked, so no re-entry is ever requested.
  const seededAadhaar = segment?.seedAadhaarFromJourney
    ? (journey?.aadhaarNumber ?? '').replace(/\D/g, '').slice(0, 12)
    : '';
  const [aadhaarDigits, setAadhaarDigits] = useState<string[]>(() => {
    const digits = seededAadhaar.split('');
    return [...digits, ...Array(12 - digits.length).fill('')];
  });
  const [maskedDigits, setMaskedDigits] = useState<boolean[]>(() =>
    Array.from({ length: 12 }, (_, i) => i < seededAadhaar.length),
  );
  const maskTimers = useRef<NodeJS.Timeout[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const [inputFocused, setInputFocused] = useState(false);

  // OTP
  const [otp, setOtp] = useState(['1', '2', '3', '4', '5', '6']);
  const [resendTimer, setResendTimer] = useState(30);

  // CKYC-download OTP — deliberately separate state from the Aadhaar OTP above,
  // so the two codes, their resend timers and their verifying flags never share
  // a value. Used only by the `ckyc-consent-otp` step.
  const [ckycOtp, setCkycOtp] = useState(['1', '2', '3', '4', '5', '6']);
  const [ckycResendTimer, setCkycResendTimer] = useState(30);
  const [ckycOtpVerifying, setCkycOtpVerifying] = useState(false);
  /** CKYC-download consent, taken inline on the `confirm-details` step. */
  const [ckycConsent, setCkycConsent] = useState(false);
  const [showCkycConsentSheet, setShowCkycConsentSheet] = useState(false);

  // Face scan
  const [progress, setProgress] = useState(0);
  const [blinkDetected, setBlinkDetected] = useState(false);
  /** HRMS segments only: the customer left the scan before it completed. */
  const [faceCancelled, setFaceCancelled] = useState(false);

  // HRMS-only `ckyc-retrieval` progress rows
  const retrievalSteps = segment?.processing ?? [];
  const [retrievalIndex, setRetrievalIndex] = useState(0);
  const [retrievalDone, setRetrievalDone] = useState<string[]>([]);

  // Consent
  const [showConsentSheet, setShowConsentSheet] = useState(false);
  const [consent, setConsent] = useState(false);
  const [volume, setVolume] = useState(50);
  const [showModalLanguageMenu, setShowModalLanguageMenu] = useState(false);
  const [modalLanguage, setModalLanguage] = useState('English');


  // Masking logic: after 1 second, mask each entered digit
  const handleAadhaarChange = (value: string) => {
    const clean = value.replace(/\D/g, '').slice(0, 12);
    const digits = clean.split('');
    const padded = [...digits, ...Array(12 - digits.length).fill('')];

    // Clear old mask timers for changed positions
    maskTimers.current.forEach(t => clearTimeout(t));
    maskTimers.current = [];

    setAadhaarDigits(padded);

    // Set new mask timers — mask each new digit after 1s
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
        }, 500);
        maskTimers.current.push(timer);
      } else if (!d) {
        newMasked[i] = false;
      }
    });
    setMaskedDigits(newMasked);
  };

  // Build per-character display: each slot shows the digit (briefly), masked star, or placeholder star
  const displayChars = aadhaarDigits.map((d, i) => {
    if (d) {
      // Digit entered — show number or masked star
      return { char: maskedDigits[i] ? '*' : d, type: 'filled' as const };
    }
    return { char: '*', type: 'placeholder' as const };
  });

  // Format into "XXXX XXXX XXXX" with spaces
  const formattedDisplay = displayChars.reduce((acc, item, i) => {
    if (i > 0 && i % 4 === 0) acc.push({ char: ' ', type: 'space' as const });
    acc.push(item);
    return acc;
  }, [] as { char: string; type: 'filled' | 'placeholder' | 'space' }[]);

  const rawAadhaar = aadhaarDigits.join('');

  // OTP verification loading
  const [otpVerifying, setOtpVerifying] = useState(false);

  // OTP resend timer
  useEffect(() => {
    if (step !== 'aadhaar-otp') return;
    if (resendTimer <= 0) return;
    const t = setInterval(() => setResendTimer(p => p - 1), 1000);
    return () => clearInterval(t);
  }, [step, resendTimer]);

  // CKYC-download OTP resend timer, on its own countdown.
  useEffect(() => {
    if (step !== 'ckyc-consent-otp') return;
    if (ckycResendTimer <= 0) return;
    const t = setInterval(() => setCkycResendTimer(p => p - 1), 1000);
    return () => clearInterval(t);
  }, [step, ckycResendTimer]);

  // Face scan progression
  useEffect(() => {
    if (step === 'blink') {
      const t = setTimeout(() => { setBlinkDetected(true); setTimeout(() => { goNext(); setProgress(0); }, 600); }, 2500);
      return () => clearTimeout(t);
    }
  }, [step]);

  useEffect(() => {
    if (step === 'scanning') {
      const id = setInterval(() => {
        setProgress(p => { if (p >= 100) { clearInterval(id); setTimeout(() => goNext(), 500); return 100; } return p + 1.5; });
      }, 60);
      return () => clearInterval(id);
    }
  }, [step]);

  useEffect(() => {
    if (step === 'verifying') { const t = setTimeout(() => goNext(), 2000); return () => clearTimeout(t); }
  }, [step]);
  useEffect(() => {
    if (step === 'verified') { const t = setTimeout(() => goNext(), 1500); return () => clearTimeout(t); }
  }, [step]);
  useEffect(() => {
    if (step === 'updating-records') { const t = setTimeout(() => goNext(), updatingAsCif ? cifCreate.durationMs : 2000); return () => clearTimeout(t); }
  }, [step]);

  // HRMS-only: walk `segment.processing` one row at a time, then advance.
  useEffect(() => {
    if (step !== 'ckyc-retrieval') return;
    const current = retrievalSteps[retrievalIndex];
    if (!current) { const t = setTimeout(() => goNext(), 400); return () => clearTimeout(t); }
    const t = setTimeout(() => {
      setRetrievalDone(prev => [...prev, current.id]);
      setRetrievalIndex(prev => prev + 1);
    }, current.durationMs);
    return () => clearTimeout(t);
  }, [step, retrievalIndex]);
  useEffect(() => {
    if (step === 'success') {
      const t = setTimeout(() => goNext(), 1500);
      return () => clearTimeout(t);
    }
  }, [step, navigate]);

  const content = {
    English: {
      aadhaarTitle: 'Enter Aadhaar Number',
      aadhaarSubtitle: 'Your 12-digit Aadhaar number for identity verification',
      aadhaarLabel: 'Aadhaar Number',
      continueBtn: 'Continue',
      otpTitle: 'Verify Aadhaar OTP',
      otpSubtitle: 'Enter the 6-digit OTP sent to your Aadhaar-linked mobile',
      verifyBtn: 'Verify OTP',
      resendText: 'Resend in',
      resendBtn: 'Resend OTP',
      privacyTitle: 'Your Data is Secure',
      privacyBody: 'Your Aadhaar is encrypted and used only for identity verification.',
      consentTextFull: "I agree and authorize Indian Overseas Bank to fetch my name, date of birth and photograph from UIDAI, limited to authenticating myself with Aadhaar based authentication system for identity verification in adherence to performing e-KYC.\n\nI understand that Indian Overseas Bank will authenticate my identity through the Aadhaar authentication system for personal loans and/or for other purposes, or as authorised under the Aadhaar Act, 2016.\n\nI understand that Indian Overseas Bank shall ensure security and confidentiality of my personal identity data and prohibit its use other than for submission to the Central Identities Data Repository (CIDR) for authentication.\n\nI hereby authorize Indian Overseas Bank to verify and authenticate using the Aadhaar number provided.",
      /** The inline declaration next to the CTA. Kept to two lines; the full
       *  text lives behind Read more, which is now purely informational. */
      consentShort: 'I authorise Indian Overseas Bank to verify my identity using Aadhaar e-KYC.',
      readMore: 'Read more',
      modalConsentTitle: 'Aadhaar Consent',
      faceReadyTitle: 'Proceed to Face Verification',
      faceReadySubtitle: 'Your face will be matched against your Aadhaar photo',
      instruction1: 'Position yourself in a room with good lighting',
      instruction2: 'Remove glasses or any face coverings',
      instruction3: 'Look directly at the camera',
      instruction4: 'Keep your face within the frame',
      proceedBtn: 'Start Face Scan',
      faceRdTitle: 'Official FaceRD App Required',
      faceRdBody: 'When you proceed, the FaceRD government app will securely complete this verification.',
      blinkTitle: 'Position Your Face',
      blinkSubtitle: 'Place your face correctly inside the frame',
      blinkHint: 'Hold still, detecting your face…',
      scanningTitle: 'Scanning Your Face',
      scanningSubtitle: 'Hold still, matching with Aadhaar database…',
      scanningHint: 'Scanning your face…',
      verifyingTitle: 'Verifying Your Identity',
      verifyingSubtitle: 'Please wait while we verify your details…',
      verifiedTitle: 'Aadhaar and face scan matched',
      confirmTitle: 'Confirm Your Details',
      confirmSubtitle: 'Please verify that these are your details',
      nameLabel: 'Name',
      dobLabel: 'Date of Birth',
      addressLabel: 'Address',
      aadhaarNumLabel: 'Aadhaar Number',
      updatingTitle: 'Updating Records',
      updatingSubtitle: 'Please wait while we update your information…',
    },
    Tamil: {
      aadhaarTitle: 'ஆதார் எண்ணை உள்ளிடவும்',
      aadhaarSubtitle: 'அடையாள சரிபார்ப்புக்கு உங்கள் 12 இலக்க ஆதார் எண்',
      aadhaarLabel: 'ஆதார் எண்',
      continueBtn: 'தொடரவும்',
      otpTitle: 'ஆதார் OTP சரிபார்க்கவும்',
      otpSubtitle: 'உங்கள் ஆதாருடன் இணைக்கப்பட்ட மொபைலுக்கு அனுப்பப்பட்ட 6 இலக்க OTP ஐ உள்ளிடவும்',
      verifyBtn: 'OTP சரிபார்',
      resendText: 'மீண்டும் அனுப்ப',
      resendBtn: 'OTP மீண்டும் அனுப்பு',
      privacyTitle: 'உங்கள் தரவு பாதுகாப்பானது',
      privacyBody: 'உங்கள் ஆதார் மறையாக்கம் செய்யப்பட்டது மற்றும் அடையாள சரிபார்ப்புக்கு மட்டுமே பயன்படுத்தப்படும்.',
      consentTextFull: "e-KYC ஐ செய்வதில் இணங்கி அடையாள சரிபார்ப்புக்காக UIDAI இலிருந்து எனது பெயர், பிறந்த தேதி மற்றும் புகைப்படத்தைப் பெற இந்தியன் ஓவர்சீஸ் வங்கிக்கு நான் ஒப்புக்கொள்கிறேன்.",
      consentShort: 'ஆதார் e-KYC மூலம் எனது அடையாளத்தைச் சரிபார்க்க இந்தியன் ஓவர்சீஸ் வங்கிக்கு நான் அனுமதி அளிக்கிறேன்.',
      readMore: 'மேலும் படிக்க',
      modalConsentTitle: 'ஆதார் சம்மதம்',
      faceReadyTitle: 'முக சரிபார்ப்புக்கு தொடரவும்',
      faceReadySubtitle: 'உங்கள் முகம் உங்கள் ஆதார் புகைப்படத்துடன் பொருத்தப்படும்',
      instruction1: 'நல்ல வெளிச்சம் உள்ள அறையில் உங்களை நிலைநிறுத்தவும்',
      instruction2: 'கண்ணாடி அல்லது முக மூடியை அகற்றவும்',
      instruction3: 'கேமராவை நேரடியாகப் பாருங்கள்',
      instruction4: 'உங்கள் முகத்தை சட்டத்திற்குள் வைக்கவும்',
      proceedBtn: 'முக ஸ்கேன் தொடங்கு',
      faceRdTitle: 'அதிகாரப்பூர்வ FaceRD பயன்பாடு தேவை',
      faceRdBody: 'நீங்கள் தொடரும்போது, FaceRD அரசு பயன்பாடு இந்த சரிபார்ப்பைப் பாதுகாப்பாக முடிக்கும்.',
      blinkTitle: 'உங்கள் முகத்தை சரியாக வைக்கவும்',
      blinkSubtitle: 'உங்கள் முகத்தை சட்டத்திற்குள் சரியாக வைக்கவும்',
      blinkHint: 'அசையாமல் இருங்கள், முகம் கண்டறியப்படுகிறது…',
      scanningTitle: 'உங்கள் முகத்தை ஸ்கேன் செய்கிறது',
      scanningSubtitle: 'அசையாமல் இருங்கள், ஆதார் தரவுத்தளத்துடன் பொருத்துகிறது…',
      scanningHint: 'உங்கள் முகத்தை ஸ்கேன் செய்கிறது…',
      verifyingTitle: 'உங்கள் அடையாளத்தை சரிபார்க்கிறது',
      verifyingSubtitle: 'உங்கள் விவரங்களை சரிபார்க்கும்போது காத்திருக்கவும்…',
      verifiedTitle: 'ஆதார் மற்றும் முக ஸ்கேன் பொருத்தம்',
      confirmTitle: 'உங்கள் விவரங்களை உறுதிப்படுத்தவும்',
      confirmSubtitle: 'இவை உங்கள் விவரங்கள் என்பதை சரிபார்க்கவும்',
      nameLabel: 'பெயர்',
      dobLabel: 'பிறந்த தேதி',
      addressLabel: 'முகவரி',
      aadhaarNumLabel: 'ஆதார் எண்',
      updatingTitle: 'பதிவுகள் புதுப்பிக்கப்படுகின்றன',
      updatingSubtitle: 'உங்கள் தகவல்களை புதுப்பிக்கும்போது காத்திருக்கவும்…',
    }
  };

  const t = content[selectedLanguage];
  const languages = ['English', 'Tamil', 'Hindi', 'Kannada', 'Telugu', 'Malayalam', 'Bengali', 'Marathi'];


  const isFaceScanStep = step === 'blink' || step === 'scanning';

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {!isFaceScanStep && <TopBar showBack />}

      <main className="flex-1 overflow-y-auto bg-white">
        <div className="max-w-md mx-auto px-4 pt-8 pb-32">

          {/* ── Step 1: Aadhaar Number Input with masking ── */}
          {step === 'aadhaar-input' && (
            <div className="flex flex-col items-center">
              <motion.div initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 0.4 }} className="mb-8">
                <img src={aadhaarImg} alt="Aadhaar" className="w-[62px] h-auto object-contain" />
              </motion.div>

              <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.1 }} className="text-center mb-8 w-full">
                <h1 className="text-xl font-semibold text-[#111827] mb-1">{t.aadhaarTitle}</h1>
                <p className="text-sm text-[#6b7280]">{t.aadhaarSubtitle}</p>
              </motion.div>

              <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2 }} className="w-full mb-6">
                <FieldLabel>{t.aadhaarLabel}</FieldLabel>
                <div className="relative">
                  <input
                    ref={inputRef}
                    type="text"
                    inputMode="numeric"
                    value={rawAadhaar}
                    onChange={(e) => handleAadhaarChange(e.target.value)}
                    onFocus={() => setInputFocused(true)}
                    onBlur={() => setInputFocused(false)}
                    className="w-full bg-transparent border border-[#e5e7eb] rounded-lg px-4 h-14 focus:border-[#254576] focus:ring-1 focus:ring-[#254576]/20 transition-all outline-none text-[16px] font-semibold text-transparent caret-transparent"
                    placeholder=""
                    maxLength={12}
                    autoComplete="off"
                  />
                  {/* Display overlay — always shows full 12-char template with cursor */}
                  <div
                    className="absolute inset-0 flex items-center px-4 pointer-events-none"
                    aria-hidden="true"
                  >
                    {!inputFocused && rawAadhaar.length === 0 ? (
                      <span className="text-sm text-[#9e9e9e] font-normal">Enter Aadhaar number</span>
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
                      {inputFocused && rawAadhaar.length === 12 && (
                        <span className="relative inline-flex items-center">
                          <span className="w-[1.5px] h-5 bg-[#212121] animate-pulse" />
                        </span>
                      )}
                    </span>
                    )}
                  </div>
                </div>
              </motion.div>

              {/* Privacy */}
              <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.4 }}
                className="bg-[#f9fafb] border border-[#e5e7eb] rounded-lg p-4 flex items-start gap-3 w-full">
                <div className="w-8 h-8 rounded-full bg-[#ebecef] flex items-center justify-center flex-shrink-0">
                  <Shield className="w-4 h-4 text-[#111827]" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-[#111827] mb-0.5">{t.privacyTitle}</p>
                  <p className="text-[12px] text-[#6b7280] leading-relaxed">{t.privacyBody}</p>
                </div>
              </motion.div>

              <StickyFooter>
                {/* Consent is taken here, inline, rather than in a sheet the
                    customer has to clear to make progress. The button wraps only
                    the box so "Read more" can live in the text flow — a button
                    inside a button is invalid HTML. */}
                <div className="mb-3 flex items-start gap-3">
                  <button
                    type="button"
                    role="checkbox"
                    aria-checked={consent}
                    aria-labelledby="aadhaar-consent-label"
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
                    <span id="aadhaar-consent-label">{t.consentShort}</span>{' '}
                    <button
                      type="button"
                      onClick={() => setShowConsentSheet(true)}
                      className="text-[12px] font-semibold text-[#315C9D] underline underline-offset-2 rounded-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#315C9D]"
                    >
                      {t.readMore}
                    </button>
                  </p>
                </div>

                <CTAButton
                  disabled={rawAadhaar.length !== 12 || !consent}
                  onClick={() => { if (rawAadhaar.length === 12 && consent) goNext(); }}
                >
                  {t.continueBtn}
                  <ArrowRight className="w-5 h-5" strokeWidth={2.5} />
                </CTAButton>
              </StickyFooter>
            </div>
          )}

          {/* ── Step 2: Aadhaar OTP ── */}
          {step === 'aadhaar-otp' && (
            <div className="flex flex-col items-center">
              <motion.div initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 0.4 }} className="mb-8">
                <div className="w-12 h-12 rounded-2xl bg-[#ebecef] flex items-center justify-center">
                  <Shield className="w-6 h-6 text-[#315C9D]" strokeWidth={2} />
                </div>
              </motion.div>

              <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.1 }} className="text-center mb-8 w-full">
                <h1 className="text-xl font-semibold text-[#111827] mb-1">{t.otpTitle}</h1>
                <p className="text-sm text-[#6b7280]">{t.otpSubtitle}</p>
              </motion.div>

              <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2 }} className="w-full mb-6">
                <div className="flex items-center gap-2 mb-4">
                  {otp.map((digit, index) => (
                    <div key={index} className="flex-1">
                      <input
                        type="text"
                        inputMode="numeric"
                        maxLength={1}
                        value={digit}
                        onChange={(e) => {
                          const v = e.target.value.replace(/\D/g, '').slice(0, 1);
                          const newOtp = [...otp];
                          newOtp[index] = v;
                          setOtp(newOtp);
                          if (v && index < 5) {
                            const next = e.target.parentElement?.nextElementSibling?.querySelector('input');
                            next?.focus();
                          }
                        }}
                        className="w-full h-14 text-center text-xl font-bold bg-transparent border border-[#e5e7eb] rounded-lg focus:border-[#254576] focus:ring-1 focus:ring-[#254576]/20 focus:outline-none transition-all text-[#212121]"
                      />
                    </div>
                  ))}
                </div>
                <div className="flex items-center justify-center text-sm">
                  {resendTimer > 0 ? (
                    <span className="text-[#666666]">{t.resendText} {resendTimer}s</span>
                  ) : (
                    <button onClick={() => setResendTimer(30)} className="text-[#315C9D] font-semibold">{t.resendBtn}</button>
                  )}
                </div>
              </motion.div>

              <StickyFooter>
                <CTAButton
                  disabled={otp.join('').length !== 6 || otpVerifying}
                  onClick={() => {
                    if (otp.join('').length === 6 && !otpVerifying) {
                      setOtpVerifying(true);
                      setTimeout(() => { setOtpVerifying(false); goNext(); }, 1200);
                    }
                  }}
                >
                  {otpVerifying ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" strokeWidth={2.5} />
                      {selectedLanguage === 'English' ? 'Verifying OTP...' : 'OTP சரிபார்க்கிறது...'}
                    </>
                  ) : (
                    <>
                      {t.verifyBtn}
                      <ArrowRight className="w-5 h-5" strokeWidth={2.5} />
                    </>
                  )}
                </CTAButton>
              </StickyFooter>
            </div>
          )}

          {/* ── Step 3: Face Verification Ready ── */}
          {step === 'face-verification-ready' && (
            <div className="flex flex-col items-center">
              <motion.div initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 0.4 }} className="mb-8">
                <img src={faceScanImg} alt="Face scan" className="w-[93px] h-[93px] object-contain" />
              </motion.div>

              <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.1 }} className="text-center mb-8 w-full">
                <h1 className="text-xl font-semibold text-[#111827] mb-1">{t.faceReadyTitle}</h1>
                <p className="text-sm text-[#6b7280]">{t.faceReadySubtitle}</p>
              </motion.div>

              <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2 }} className="w-full mb-6">
                <div className="border border-[#e5e7eb] rounded-lg px-[14px] py-5 space-y-4">
                  {[t.instruction1, t.instruction2, t.instruction3, t.instruction4].map((instr, i) => {
                    const InstrIcon = [Sun, Glasses, Eye, ScanFace][i];
                    return (
                      <div key={i} className="flex items-start gap-3">
                        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-[#315C9D]/10 flex items-center justify-center mt-0.5">
                          <InstrIcon className="w-4 h-4 text-[#315C9D]" strokeWidth={2} />
                        </div>
                        <p className="text-sm text-[#6b7280] leading-relaxed flex-1 pt-1">{instr}</p>
                      </div>
                    );
                  })}
                </div>
              </motion.div>

              {/* HRMS segments only: the scan was left before it completed. The
                  seeded Aadhaar and confirmed details are retained and the
                  sequence does not advance until Try again is used. */}
              {segment && faceCancelled && (
                <div
                  role="alert"
                  className="w-full mb-6 rounded-lg border border-[#b3261e]/30 bg-[#b3261e]/5 p-4"
                >
                  <div className="flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-[#b3261e] flex-shrink-0 mt-0.5" strokeWidth={2.5} aria-hidden="true" />
                    <p className="text-sm text-[#b3261e] leading-relaxed flex-1">
                      {tr(selectedLanguage, 'faceRdCancelledMessage')}
                    </p>
                  </div>
                  <button
                    onClick={() => { setFaceCancelled(false); setBlinkDetected(false); setProgress(0); goNext(); }}
                    className="mt-3 inline-flex items-center gap-2 h-12 px-4 rounded-lg border border-[#315C9D] text-[#315C9D] text-base font-semibold hover:bg-[#315C9D]/5 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#315C9D]"
                  >
                    <RotateCcw className="w-5 h-5" strokeWidth={2.5} aria-hidden="true" />
                    {tr(selectedLanguage, 'faceRdTryAgainBtn')}
                  </button>
                </div>
              )}

              <StickyFooter>
                <CTAButton onClick={() => { setBlinkDetected(false); setFaceCancelled(false); goNext(); }}>{t.proceedBtn}</CTAButton>
              </StickyFooter>
            </div>
          )}

          {/* ── Step 4a: Blink / Face Position (Dark — camera experience) ── */}
          {step === 'blink' && (
            <div className="-mx-4 -mt-8">
              <div className="relative overflow-hidden bg-[#0f1218] min-h-[100vh] flex flex-col items-center justify-center px-6 py-10">
                {/* Back button */}
                <button
                  onClick={cancelFaceScan}
                  aria-label="Go back"
                  className="absolute top-4 left-4 z-10 w-10 h-10 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 transition-colors"
                >
                  <ArrowLeft className="w-5 h-5 text-white" />
                </button>
                <div aria-hidden="true" className="absolute -top-20 left-1/2 -translate-x-1/2 w-72 h-72 rounded-full bg-[#315C9D]/15 blur-[80px] pointer-events-none" />

                <motion.h2 initial={{ y: -12, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
                  className="relative text-lg font-semibold text-white text-center mb-1">{t.blinkTitle}</motion.h2>
                <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}
                  className="relative text-sm text-white/50 text-center mb-10">{t.blinkSubtitle}</motion.p>

                <div className="relative w-72 aspect-[3/4]">
                  <div className="absolute inset-0 rounded-[46%/50%] border-2 border-dashed border-white/30" />
                  <div className="absolute inset-[6px] rounded-[46%/50%] overflow-hidden bg-[#1a1f2e] flex items-center justify-center scale-x-[-1]">
                    <UserRound className="w-28 h-28 text-white/10" strokeWidth={1.5} />
                    <motion.img
                      src={FACE_PLACEHOLDER}
                      alt=""
                      className="absolute inset-0 w-full h-full object-cover"
                      animate={{ x: [-5, 4, -3, 4, -5], y: [4, -4, 2, -2, 4] }}
                      transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                      onError={(e) => { e.currentTarget.style.display = 'none'; }}
                    />
                  </div>
                  {blinkDetected && (
                    <motion.div initial={{ scale: 0.6, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                      className="absolute inset-[6px] rounded-[46%/50%] bg-[#22c55e]/20 flex items-center justify-center">
                      <CheckCircle className="w-16 h-16 text-[#22c55e]" strokeWidth={2} />
                    </motion.div>
                  )}
                </div>

                <motion.p animate={{ opacity: [0.4, 1, 0.4] }} transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                  className="relative text-[13px] text-white/50 mt-10 text-center">{t.blinkHint}</motion.p>
              </div>
            </div>
          )}

          {/* ── Step 4b: Scanning (Dark) ── */}
          {step === 'scanning' && (
            <div className="-mx-4 -mt-8">
              <div className="relative overflow-hidden bg-[#0f1218] min-h-[100vh] flex flex-col items-center justify-center px-6 py-10">
                {/* Back button */}
                <button
                  onClick={cancelFaceScan}
                  aria-label="Go back"
                  className="absolute top-4 left-4 z-10 w-10 h-10 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 transition-colors"
                >
                  <ArrowLeft className="w-5 h-5 text-white" />
                </button>
                <div aria-hidden="true" className="absolute -top-20 left-1/2 -translate-x-1/2 w-72 h-72 rounded-full bg-[#22c55e]/10 blur-[80px] pointer-events-none" />

                <motion.h2 initial={{ y: -12, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
                  className="relative text-lg font-semibold text-white text-center mb-1">{t.scanningTitle}</motion.h2>
                <p className="relative text-sm text-white/50 text-center mb-10">{t.scanningSubtitle}</p>

                <div className="relative w-72 aspect-[3/4]">
                  <div className="absolute inset-[6px] rounded-[46%/50%] overflow-hidden bg-[#1a1f2e] flex items-center justify-center scale-x-[-1]">
                    <UserRound className="w-28 h-28 text-white/10" strokeWidth={1.5} />
                    <img src={FACE_PLACEHOLDER} alt="" className="absolute inset-0 w-full h-full object-cover"
                      onError={(e) => { e.currentTarget.style.display = 'none'; }} />
                    <motion.div animate={{ y: ['-130%', '130%'] }} transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                      className="absolute left-0 right-0 h-10 bg-gradient-to-b from-transparent via-[#22c55e]/40 to-transparent" />
                  </div>
                  <svg className="absolute inset-0 w-full h-full" viewBox="0 0 288 384" fill="none">
                    <ellipse cx="144" cy="192" rx="128" ry="172" stroke="#1e2b3a" strokeWidth="3" />
                    <ellipse cx="144" cy="192" rx="128" ry="172"
                      stroke="#22c55e" strokeWidth="4" strokeLinecap="round"
                      pathLength={100} strokeDasharray="100" strokeDashoffset={100 - progress}
                      style={{ filter: 'drop-shadow(0 0 8px rgba(34,197,94,0.7))', transition: 'stroke-dashoffset 0.08s linear' }} />
                  </svg>
                </div>

                <motion.p animate={{ opacity: [0.5, 1, 0.5] }} transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
                  className="relative text-sm font-medium text-[#22c55e] mt-10 text-center">{t.scanningHint}</motion.p>
              </div>
            </div>
          )}

          {/* ── Verifying ── */}
          {step === 'verifying' && (
            <div className="flex flex-col items-center justify-center min-h-[60vh]">
              <motion.div initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="mb-8">
                <div className="w-12 h-12 rounded-2xl bg-[#ebecef] flex items-center justify-center">
                  <motion.div animate={{ scale: [1, 1.12, 1], opacity: [0.7, 1, 0.7] }} transition={{ duration: 1.4, repeat: Infinity, ease: 'easeInOut' }}>
                    <ScanFace className="w-6 h-6 text-[#315C9D]" strokeWidth={2} />
                  </motion.div>
                </div>
              </motion.div>
              <h2 className="text-xl font-semibold text-[#111827] mb-1">{t.verifyingTitle}</h2>
              <p className="text-sm text-[#6b7280]">{t.verifyingSubtitle}</p>
            </div>
          )}

          {/* ── Verified ── */}
          {step === 'verified' && (
            <div className="flex flex-col items-center justify-center min-h-[60vh]">
              <div className="w-28 h-28">
                <DotLottieReact src={successLottie} autoplay loop={false} style={{ width: '100%', height: '100%' }} />
              </div>
              <motion.p initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.3 }}
                className="text-xl font-semibold text-[#111827] mt-6">{t.verifiedTitle}</motion.p>
            </div>
          )}

          {/* ── Confirm Details ── */}
          {step === 'confirm-details' && (
            <div className="flex flex-col items-center">
              <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.1 }} className="text-center mb-6 w-full">
                <h1 className="text-xl font-semibold text-[#111827] mb-1">{t.confirmTitle}</h1>
                <p className="text-sm text-[#6b7280]">{t.confirmSubtitle}</p>
              </motion.div>

              <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2 }} className="w-full mb-6">
                <div className="rounded-xl p-[2px] bg-gradient-to-b from-[#FF9933] via-[#f0f0f0] to-[#138808]">
                  <div className="relative overflow-hidden bg-white rounded-[10px] p-5 space-y-4">
                    <img src={aadhaarImg} alt="" className="absolute top-3 right-3 w-12 h-12 object-contain opacity-90 pointer-events-none" />
                    {[
                      { label: t.nameLabel, value: 'Aravind Kumar S.' },
                      { label: t.dobLabel, value: '12/03/1992' },
                      { label: t.addressLabel, value: 'No. 45, Gandhi Street, Vadapalani, Chennai, Tamil Nadu - 600026' },
                      { label: t.aadhaarNumLabel, value: `XXXX XXXX ${rawAadhaar.slice(-4) || '0000'}` }
                    ].map((row, i) => (
                      <div key={i} className={i > 0 ? 'border-t border-[#e5e7eb] pt-4' : ''}>
                        <p className="text-[12px] font-semibold text-[#666666] uppercase tracking-wide mb-1">{row.label}</p>
                        <p className="text-sm font-semibold text-[#212121]">{row.value}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>

              <StickyFooter>
                {/* CKYC-download consent, taken here because this is the screen
                    that has the verified Aadhaar the download will run on. Only
                    the segments that go on to `ckyc-retrieval` ask for it; every
                    other flow renders nothing here and keeps the CTA ungated.
                    Single declaration, so it sits inline: the button wraps only
                    the box, and "Read more" is a sibling in the text flow. */}
                {needsCkycConsent && (
                  <div className="mb-3 flex items-start gap-3">
                    <button
                      type="button"
                      role="checkbox"
                      aria-checked={ckycConsent}
                      aria-labelledby="ckyc-download-consent-label"
                      onClick={() => setCkycConsent(!ckycConsent)}
                      className="flex-shrink-0 mt-0.5 p-0.5 rounded-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#315C9D]"
                    >
                      <span
                        className={`flex w-5 h-5 rounded-[5px] border items-center justify-center transition-colors ${
                          ckycConsent ? 'bg-[#315C9D] border-[#315C9D]' : 'bg-white border-[#c4c4c4]'
                        }`}
                      >
                        {ckycConsent && <Check className="w-3.5 h-3.5 text-white" strokeWidth={3} aria-hidden="true" />}
                      </span>
                    </button>

                    <p className="text-[12px] text-[#6b7280] leading-relaxed">
                      <span id="ckyc-download-consent-label">{tr(selectedLanguage, 'ckycDownloadConsentText')}</span>{' '}
                      <button
                        type="button"
                        onClick={() => setShowCkycConsentSheet(true)}
                        className="text-[12px] font-semibold text-[#315C9D] underline underline-offset-2 rounded-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#315C9D]"
                      >
                        {tr(selectedLanguage, 'panAadhaarReadMore')}
                      </button>
                    </p>
                  </div>
                )}

                <CTAButton
                  disabled={needsCkycConsent && !ckycConsent}
                  onClick={() => {
                    // Guard as well as disable, so a click that slips past
                    // `disabled` cannot start the CKYC download unconsented.
                    if (needsCkycConsent && !ckycConsent) return;
                    goNext();
                  }}
                >
                  {t.continueBtn}
                  <ArrowRight className="w-5 h-5" strokeWidth={2.5} aria-hidden="true" />
                </CTAButton>
              </StickyFooter>
            </div>
          )}

          {/* ── Updating Records ── */}
          {step === 'updating-records' && (
            <div className="flex flex-col items-center justify-center min-h-[60vh]">
              <motion.div initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="mb-8">
                <div className="w-12 h-12 rounded-2xl bg-[#ebecef] flex items-center justify-center">
                  <motion.div animate={{ rotate: 360 }} transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}>
                    <CheckCircle className="w-6 h-6 text-[#315C9D]" strokeWidth={2} />
                  </motion.div>
                </div>
              </motion.div>
              <h2 className="text-xl font-semibold text-[#111827] mb-1">
                {updatingAsCif ? tr(selectedLanguage, 'stepCifCreate') : t.updatingTitle}
              </h2>
              {updatingAsCif ? (
                <div className="flex items-center gap-3 mt-2 px-4 py-3 rounded-lg border border-[#315C9D]/20 bg-[#315C9D]/5">
                  <Loader2 className="w-5 h-5 text-[#315C9D] animate-spin flex-shrink-0" strokeWidth={2.5} aria-hidden="true" />
                  <span className="text-sm font-medium text-[#315C9D]">
                    {selectedLanguage === 'English' ? cifCreate.labelEn : cifCreate.labelTa}
                  </span>
                </div>
              ) : (
                <p className="text-sm text-[#6b7280]">{t.updatingSubtitle}</p>
              )}
            </div>
          )}

          {/* ── CKYC Download OTP (HRMS segments that fetch CKYC only) ──
              Same shape as the Aadhaar OTP step above, on its own state, and
              headed so it reads as authorising the download rather than
              re-verifying the Aadhaar. Any six digits pass: no backend. */}
          {step === 'ckyc-consent-otp' && (
            <div className="flex flex-col items-center">
              <motion.div
                initial={reduceMotion ? false : { scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: reduceMotion ? 0 : 0.4 }}
                className="mb-8"
              >
                <div className="w-12 h-12 rounded-2xl bg-[#ebecef] flex items-center justify-center">
                  <Shield className="w-6 h-6 text-[#315C9D]" strokeWidth={2} aria-hidden="true" />
                </div>
              </motion.div>

              <motion.div
                initial={reduceMotion ? false : { y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: reduceMotion ? 0 : 0.1 }}
                className="text-center mb-8 w-full"
              >
                <h1 className="text-xl font-semibold text-[#111827] mb-1">{tr(selectedLanguage, 'ckycOtpTitle')}</h1>
                {/* The number is substituted rather than concatenated, because
                    Tamil puts it ahead of the verb while English puts it last. */}
                <p className="text-sm text-[#6b7280]">
                  {tr(selectedLanguage, 'ckycOtpSubtitle').replace(
                    '{mobile}',
                    `+91 ${HRMS_EMPLOYEE.mobile}`,
                  )}
                </p>
              </motion.div>

              <motion.div
                initial={reduceMotion ? false : { y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: reduceMotion ? 0 : 0.2 }}
                className="w-full mb-6"
              >
                <div className="flex items-center gap-2 mb-4">
                  {ckycOtp.map((digit, index) => (
                    <div key={index} className="flex-1">
                      <input
                        type="text"
                        inputMode="numeric"
                        maxLength={1}
                        value={digit}
                        aria-label={
                          selectedLanguage === 'English'
                            ? `CKYC OTP digit ${index + 1} of 6`
                            : `CKYC OTP இலக்கம் ${index + 1} / 6`
                        }
                        onChange={(e) => {
                          const v = e.target.value.replace(/\D/g, '').slice(0, 1);
                          const newOtp = [...ckycOtp];
                          newOtp[index] = v;
                          setCkycOtp(newOtp);
                          if (v && index < 5) {
                            const next = e.target.parentElement?.nextElementSibling?.querySelector('input');
                            next?.focus();
                          }
                        }}
                        className="w-full h-14 text-center text-xl font-bold bg-transparent border border-[#e5e7eb] rounded-lg focus:border-[#254576] focus:ring-1 focus:ring-[#254576]/20 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#315C9D] transition-all text-[#212121]"
                      />
                    </div>
                  ))}
                </div>
                <div className="flex items-center justify-center text-sm">
                  {ckycResendTimer > 0 ? (
                    <span className="text-[#666666]">{t.resendText} {ckycResendTimer}s</span>
                  ) : (
                    <button
                      onClick={() => setCkycResendTimer(30)}
                      className="text-[#315C9D] font-semibold rounded-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#315C9D]"
                    >
                      {t.resendBtn}
                    </button>
                  )}
                </div>
              </motion.div>

              <StickyFooter>
                <CTAButton
                  disabled={ckycOtp.join('').length !== 6 || ckycOtpVerifying}
                  onClick={() => {
                    if (ckycOtp.join('').length === 6 && !ckycOtpVerifying) {
                      setCkycOtpVerifying(true);
                      setTimeout(() => { setCkycOtpVerifying(false); goNext(); }, 1200);
                    }
                  }}
                >
                  {ckycOtpVerifying ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" strokeWidth={2.5} aria-hidden="true" />
                      {selectedLanguage === 'English' ? 'Verifying OTP...' : 'OTP சரிபார்க்கிறது...'}
                    </>
                  ) : (
                    <>
                      {t.verifyBtn}
                      <ArrowRight className="w-5 h-5" strokeWidth={2.5} aria-hidden="true" />
                    </>
                  )}
                </CTAButton>
              </StickyFooter>
            </div>
          )}

          {/* ── CKYC Retrieval (HRMS segments only) ── */}
          {step === 'ckyc-retrieval' && (
            <div className="flex flex-col items-center justify-center min-h-[60vh]">
              <div className="w-14 h-14 rounded-2xl bg-[#315C9D]/10 flex items-center justify-center mb-6">
                <Loader2 className="w-7 h-7 text-[#315C9D] animate-spin" strokeWidth={2} aria-hidden="true" />
              </div>
              <h2 className="text-xl font-semibold text-[#111827] mb-6 text-center">
                {tr(selectedLanguage, 'stepCkycByAadhaar')}
              </h2>
              <div className="w-full space-y-3" aria-live="polite">
                {retrievalSteps.map((row, index) => {
                  const isCompleted = retrievalDone.includes(row.id);
                  const isActive = retrievalIndex === index && !isCompleted;
                  if (!isCompleted && !isActive) return null;
                  return (
                    <div
                      key={row.id}
                      className={`flex items-center gap-3 px-4 py-3 rounded-lg border ${
                        isCompleted ? 'bg-[#2da94f]/5 border-[#2da94f]/20' : 'bg-[#315C9D]/5 border-[#315C9D]/20'
                      }`}
                    >
                      {isCompleted ? (
                        <CheckCircle className="w-5 h-5 text-[#2da94f] flex-shrink-0" strokeWidth={2.5} aria-hidden="true" />
                      ) : (
                        <Loader2 className="w-5 h-5 text-[#315C9D] animate-spin flex-shrink-0" strokeWidth={2.5} aria-hidden="true" />
                      )}
                      <span className={`text-sm font-medium ${isCompleted ? 'text-[#2da94f]' : 'text-[#315C9D]'}`}>
                        {selectedLanguage === 'English' ? row.labelEn : row.labelTa}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ── Success ── */}
          {step === 'success' && (
            <div className="flex flex-col items-center justify-center min-h-[60vh]">
              <div className="w-28 h-28">
                <DotLottieReact src={successLottie} autoplay loop={false} style={{ width: '100%', height: '100%' }} />
              </div>
            </div>
          )}

        </div>
      </main>

      {/* ── Consent text, read-only ──────────────────────────────────────────
          Opened from Read more. Consent itself is given by the checkbox in the
          footer, so this sheet decides nothing and never advances the step. */}
      <BottomSheet
        open={showConsentSheet}
        onClose={() => { setShowModalLanguageMenu(false); setShowConsentSheet(false); }}
        title={t.modalConsentTitle}
        closeLabel={selectedLanguage === 'English' ? 'Close' : 'மூடு'}
        toolbar={
          <>
            <div className="px-5 py-3">
              <div className="relative">
                <button
                  type="button"
                  aria-expanded={showModalLanguageMenu}
                  onClick={() => setShowModalLanguageMenu(!showModalLanguageMenu)}
                  className="w-full bg-transparent border border-[#e5e7eb] rounded-lg px-3 h-11 flex items-center justify-between text-sm font-semibold text-[#212121] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#315C9D]"
                >
                  <span>{modalLanguage}</span>
                  <ChevronDown className={`w-4 h-4 text-[#666666] transition-transform ${showModalLanguageMenu ? 'rotate-180' : ''}`} aria-hidden="true" />
                </button>
                {showModalLanguageMenu && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-lg shadow-lg border border-[#e5e7eb] py-1 z-50 max-h-[200px] overflow-y-auto">
                    {languages.map((lang) => (
                      <button key={lang} type="button" onClick={() => { setModalLanguage(lang); setShowModalLanguageMenu(false); }}
                        className={`w-full text-left px-4 py-2 text-sm hover:bg-[#f9fafb] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#315C9D] ${modalLanguage === lang ? 'text-[#315C9D] font-semibold' : 'text-[#111827]'}`}>
                        {lang}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="px-5 pb-3">
              <div className="flex items-center gap-3">
                <Volume2 className="w-5 h-5 text-[#315C9D] flex-shrink-0" aria-hidden="true" />
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={volume}
                  onChange={(e) => setVolume(parseInt(e.target.value))}
                  aria-label={selectedLanguage === 'English' ? 'Volume' : 'ஒலி அளவு'}
                  className="flex-1 h-1.5 rounded-lg accent-[#111827] cursor-pointer"
                />
                <span className="text-[12px] text-[#666666] font-medium min-w-[32px]">{volume}%</span>
              </div>
            </div>
          </>
        }
      >
        <p className="text-sm text-[#6b7280] leading-relaxed whitespace-pre-line">
          {modalLanguage === 'Tamil' ? content.Tamil.consentTextFull : content.English.consentTextFull}
        </p>
      </BottomSheet>

      {/* ── CKYC download consent text, read-only ────────────────────────────
          Opened from the Read more beside the CKYC checkbox on `confirm-details`.
          Like the sheet above it decides nothing: no accept action, and it never
          sets the checkbox or advances the step. */}
      <BottomSheet
        open={showCkycConsentSheet}
        onClose={() => setShowCkycConsentSheet(false)}
        title={tr(selectedLanguage, 'ckycDownloadConsentTitle')}
        closeLabel={selectedLanguage === 'English' ? 'Close' : 'மூடு'}
      >
        <p className="text-sm text-[#6b7280] leading-relaxed whitespace-pre-line">
          {tr(selectedLanguage, 'ckycDownloadConsentFull')}
        </p>
      </BottomSheet>
    </div>
  );
}
