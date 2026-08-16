import { useNavigate } from 'react-router';
import { motion } from 'motion/react';
import { Check, CheckCircle, Volume2, ChevronDown, Sun, Glasses, Eye, ScanFace, UserRound } from 'lucide-react';
import { useState, useEffect } from 'react';
import { TopBar } from './TopBar';
import { StickyFooter } from './StickyFooter';
import { BottomSheet } from './BottomSheet';
import { useLanguage } from '../hooks/useLanguage';
import aadhaarImg from '@/assets/aadhaar.svg';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';
import faceScanImg from '@/assets/face-scan.svg';
import faceRdImg from '@/assets/facerd.svg';
import successLottie from '@/assets/success.lottie';

const FACE_PLACEHOLDER = 'https://images.unsplash.com/photo-1712425718137-491250cfde88?fit=facearea&facepad=2&w=400&h=460&q=80';

type VerificationStep = 'aadhaar-input' | 'face-verification-ready' | 'blink' | 'scanning' | 'verifying' | 'verified' | 'confirm-details' | 'updating-records' | 'success';

function CTAButton({ onClick, disabled, children }: { onClick?: () => void; disabled?: boolean; children: React.ReactNode }) {
  return (
    <button onClick={onClick} disabled={disabled}
      className="w-full bg-[#315C9D] text-white h-12 rounded-lg text-base font-semibold flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed transition-opacity">
      {children}
    </button>
  );
}

function FieldLabel({ children }: { children: React.ReactNode }) {
  return <label className="block text-[12px] font-semibold text-[#666666] uppercase tracking-wide mb-2">{children}</label>;
}

export function AadhaarBiometricPage() {
  const navigate = useNavigate();
  const [selectedLanguage] = useLanguage();
  const [step, setStep] = useState<VerificationStep>('aadhaar-input');
  const [aadhaarNumber, setAadhaarNumber] = useState('1234 5678 9012');
  const [progress, setProgress] = useState(0);
  const [consent, setConsent] = useState(false);
  const [blinkDetected, setBlinkDetected] = useState(false);
  const [showConsentSheet, setShowConsentSheet] = useState(false);
  const [volume, setVolume] = useState(50);
  const [showModalLanguageMenu, setShowModalLanguageMenu] = useState(false);
  const [modalLanguage, setModalLanguage] = useState('English');

  useEffect(() => {
    if (step === 'blink') {
      const t = setTimeout(() => { setBlinkDetected(true); setTimeout(() => { setStep('scanning'); setProgress(0); }, 500); }, 2000);
      return () => clearTimeout(t);
    }
  }, [step]);

  useEffect(() => {
    if (step === 'scanning') {
      const id = setInterval(() => {
        setProgress((p) => { if (p >= 100) { clearInterval(id); setTimeout(() => setStep('verifying'), 500); return 100; } return p + 2; });
      }, 50);
      return () => clearInterval(id);
    }
  }, [step]);

  useEffect(() => {
    if (step === 'verifying') { const t = setTimeout(() => setStep('verified'), 2000); return () => clearTimeout(t); }
  }, [step]);
  useEffect(() => {
    if (step === 'verified') { const t = setTimeout(() => setStep('confirm-details'), 1500); return () => clearTimeout(t); }
  }, [step]);
  useEffect(() => {
    if (step === 'updating-records') { const t = setTimeout(() => setStep('success'), 2000); return () => clearTimeout(t); }
  }, [step]);
  useEffect(() => {
    if (step === 'success') { const t = setTimeout(() => navigate('/loading'), 1500); return () => clearTimeout(t); }
  }, [step, navigate]);

  const content = {
    English: {
      aadhaarTitle: "Aadhaar Facial Biometric",
      aadhaarSubtitle: "Enter your Aadhaar number to begin",
      aadhaarNumberLabel: "Aadhaar Number",
      consentTextFull: "I agree and authorize Indian Overseas Bank to fetch my name, date of birth and photograph from UIDAI, limited to authenticating myself with Aadhaar based authentication system for identity verification in adherence to performing e-kyc.\n\nI understand that Indian Overseas Bank will authenticate my identity through the Aadhaar authentication system for personal loans and/or for other purposes, or as authorised under the Aadhaar Act, 2016.\n\nI understand that Indian Overseas Bank shall ensure security and confidentiality of my personal identity data and prohibit its use other than for submission to the Central Identities Data Repository (CIDR) for authentication.\n\nI hereby authorize Indian Overseas Bank to verify and authenticate using the Aadhaar number provided. I further authorize Indian Overseas Bank to retain my Aadhaar details for authenticated consent or retention of details for any purpose or duration to comply with Aadhaar Act, 2016 and the applicable law.",
      consentShort: "I authorise Indian Overseas Bank to verify my identity using Aadhaar e-KYC.",
      readMore: "Read more",
      modalConsentTitle: "Aadhaar Consent",
      startBtn: "Verify",
      faceVerificationReadyTitle: "Proceed to Face Verification",
      faceVerificationReadySubtitle: "Please ensure you are in a well-lit area",
      instruction1: "Position yourself in a room with good lighting",
      instruction2: "Remove glasses or any face coverings",
      instruction3: "Look directly at the camera",
      instruction4: "Keep your face within the frame",
      proceedBtn: "Proceed",
      blinkTitle: "Please Blink to Capture",
      scanningTitle: "Scanning Your Face",
      scanningSubtitle: "Hold still, matching with Aadhaar database...",
      verifyingTitle: "Verifying Your Identity",
      verifyingSubtitle: "Please wait while we verify your details...",
      verifiedTitle: "Aadhaar Verified",
      confirmTitle: "Confirm Your Details",
      updatingRecordsTitle: "Updating Records",
      updatingRecordsSubtitle: "Please wait while we update your information...",
      confirmSubtitle: "Please verify that these are your details",
      nameLabel: "Name",
      dobLabel: "Date of Birth",
      addressLabel: "Address",
      aadhaarLabel: "Aadhaar Number",
      confirmBtn: "Yes, This is Me",
      notMeBtn: "Not Me"
    },
    Tamil: {
      aadhaarTitle: "ஆதார் முக உயிரியல் அங்கீகாரம்",
      aadhaarSubtitle: "தொடங்க உங்கள் ஆதார் எண்ணை உள்ளிடவும்",
      aadhaarNumberLabel: "ஆதார் எண்",
      consentTextFull: "e-kyc ஐ செய்வதில் இணங்கி அடையாள சரிபார்ப்புக்காக UIDAI இலிருந்து எனது பெயர், பிறந்த தேதி மற்றும் புகைப்படத்தைப் பெற இந்தியன் ஓவர்சீஸ் வங்கிக்கு நான் ஒப்புக்கொள்கிறேன்.",
      consentShort: "ஆதார் e-KYC மூலம் எனது அடையாளத்தைச் சரிபார்க்க இந்தியன் ஓவர்சீஸ் வங்கிக்கு நான் அனுமதி அளிக்கிறேன்.",
      readMore: "மேலும் படிக்க",
      modalConsentTitle: "ஆதார் சம்மதம்",
      startBtn: "சரிபார்",
      faceVerificationReadyTitle: "முக சரிபார்ப்புக்கு தொடரவும்",
      faceVerificationReadySubtitle: "நல்ல வெளிச்சம் உள்ள இடத்தில் இருப்பதை உறுதிப்படுத்தவும்",
      instruction1: "நல்ல வெளிச்சம் உள்ள அறையில் உங்களை நிலைநிறுத்தவும்",
      instruction2: "கண்ணாடி அல்லது முக மூடியை அகற்றவும்",
      instruction3: "கேமராவை நேரடியாகப் பாருங்கள்",
      instruction4: "உங்கள் முகத்தை சட்டத்திற்குள் வைக்கவும்",
      proceedBtn: "தொடரவும்",
      blinkTitle: "படம் எடுக்க கண் சிமிட்டவும்",
      scanningTitle: "உங்கள் முகத்தை ஸ்கேன் செய்கிறது",
      scanningSubtitle: "அசையாமல் இருங்கள், ஆதார் தரவுத்தளத்துடன் பொருத்துகிறது...",
      verifyingTitle: "உங்கள் அடையாளத்தை சரிபார்க்கிறது",
      verifyingSubtitle: "உங்கள் விவரங்களை சரிபார்க்கும்போது காத்திருக்கவும்...",
      verifiedTitle: "ஆதார் சரிபார்க்கப்பட்டது",
      confirmTitle: "உங்கள் விவரங்களை உறுதிப்படுத்தவும்",
      updatingRecordsTitle: "பதிவுகள் புதுப்பிக்கப்படுகின்றன",
      updatingRecordsSubtitle: "உங்கள் தகவல்களை புதுப்பிக்கும்போது காத்திருக்கவும்...",
      confirmSubtitle: "இவை உங்கள் விவரங்கள் என்பதை சரிபார்க்கவும்",
      nameLabel: "பெயர்",
      dobLabel: "பிறந்த தேதி",
      addressLabel: "முகவரி",
      aadhaarLabel: "ஆதார் எண்",
      confirmBtn: "ஆம், இது நான்தான்",
      notMeBtn: "நான் அல்ல"
    }
  };

  const t = content[selectedLanguage];

  const formatAadhaar = (v: string) => {
    const c = v.replace(/\s/g, '');
    return c.match(/.{1,4}/g)?.join(' ') ?? c;
  };

  const languages = ['English', 'Tamil', 'Hindi', 'Kannada', 'Telugu', 'Malayalam', 'Bengali', 'Marathi'];

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Header */}
      <TopBar showBack />

      <main className="flex-1 overflow-y-auto bg-white">
        <div className="max-w-md mx-auto px-4 pt-8 pb-32">

          {/* ── Aadhaar Input ── */}
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
                <FieldLabel>{t.aadhaarNumberLabel}</FieldLabel>
                <input
                  type="text"
                  value={aadhaarNumber}
                  onChange={(e) => setAadhaarNumber(formatAadhaar(e.target.value.replace(/\D/g, '').slice(0, 12)))}
                  className="w-full bg-transparent border border-[#e5e7eb] rounded-lg px-4 h-14 focus:border-[#254576] focus:ring-1 focus:ring-[#254576]/20 transition-all outline-none text-sm font-semibold text-[#212121] placeholder:text-[#9e9e9e]"
                  placeholder="1234 5678 9012"
                />
              </motion.div>

              <StickyFooter>
                {/* Consent is taken inline here — the sheet is only for reading the full text. */}
                <div className="mb-4 flex items-start gap-3">
                  <button
                    type="button"
                    role="checkbox"
                    aria-checked={consent}
                    aria-labelledby="aadhaar-consent-label"
                    onClick={() => setConsent(!consent)}
                    className="flex-shrink-0 mt-0.5 p-0.5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#315C9D] rounded-md"
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
                      className="text-[12px] text-[#315C9D] font-semibold underline underline-offset-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#315C9D] rounded-sm"
                    >
                      {t.readMore}
                    </button>
                  </p>
                </div>

                <CTAButton
                  disabled={aadhaarNumber.replace(/\s/g, '').length !== 12 || !consent}
                  onClick={() => { setStep('face-verification-ready'); setBlinkDetected(false); }}
                >
                  {t.startBtn}
                </CTAButton>
              </StickyFooter>
            </div>
          )}

          {/* ── Face Ready ── */}
          {step === 'face-verification-ready' && (
            <div className="flex flex-col items-center">
              <motion.div initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 0.4 }} className="mb-8">
                <img src={faceScanImg} alt="Face scan" className="w-[93px] h-[93px] object-contain" />
              </motion.div>

              <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.1 }} className="text-center mb-8 w-full">
                <h1 className="text-xl font-semibold text-[#111827] mb-1">{t.faceVerificationReadyTitle}</h1>
                <p className="text-sm text-[#6b7280]">{t.faceVerificationReadySubtitle}</p>
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

              <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.3 }}
                className="w-full mb-6 bg-[#f9fafb] border border-[#e5e7eb] rounded-lg p-4 flex items-start gap-3">
                <img src={faceRdImg} alt="FaceRD" className="w-8 h-8 object-contain flex-shrink-0" />
                <div>
                  <p className="text-sm font-semibold text-[#111827] mb-0.5">
                    {selectedLanguage === 'English' ? 'Official FaceRD App Required' : 'அதிகாரப்பூர்வ FaceRD பயன்பாடு தேவை'}
                  </p>
                  <p className="text-[12px] text-[#6b7280] leading-relaxed">
                    {selectedLanguage === 'English'
                      ? 'When you proceed, please download and install the official FaceRD government app to securely complete this verification.'
                      : 'நீங்கள் தொடரும்போது, இந்த சரிபார்ப்பைப் பாதுகாப்பாக முடிக்க அதிகாரப்பூர்வ FaceRD அரசு பயன்பாட்டைப் பதிவிறக்கி நிறுவவும்.'}
                  </p>
                </div>
              </motion.div>

              <StickyFooter>
                <CTAButton onClick={() => setStep('blink')}>{t.proceedBtn}</CTAButton>
              </StickyFooter>
            </div>
          )}

          {/* ── Blink / Live positioning check ── */}
          {step === 'blink' && (
            <div className="-mx-4">
              <div className="relative overflow-hidden rounded-3xl bg-[#0B1220] px-6 pt-8 pb-9 min-h-[70vh] flex flex-col items-center justify-center">
                {/* ambient glow */}
                <div aria-hidden="true" className="absolute -top-16 left-1/2 -translate-x-1/2 w-64 h-64 rounded-full bg-[#315C9D]/25 blur-3xl pointer-events-none"></div>

                <motion.h2 initial={{ y: -12, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
                  className="relative text-lg font-semibold text-white text-center mb-1">
                  {selectedLanguage === 'English' ? 'Position Your Face' : 'உங்கள் முகத்தை சரியாக வைக்கவும்'}
                </motion.h2>
                <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}
                  className="relative text-sm text-white/60 text-center mb-8">
                  {selectedLanguage === 'English' ? 'Place your face correctly inside the frame' : 'உங்கள் முகத்தை சட்டத்திற்குள் சரியாக வைக்கவும்'}
                </motion.p>

                <div className="relative w-60 aspect-[3/4]">
                  {/* dashed guide frame */}
                  <div className="absolute inset-0 rounded-[46%/50%] border-2 border-dashed border-white/40"></div>
                  {/* face preview — mirrored like a phone's front camera (sways gently to prompt repositioning) */}
                  <div className="absolute inset-[8px] rounded-[46%/50%] overflow-hidden bg-[#0f1830] flex items-center justify-center scale-x-[-1]">
                    <UserRound className="w-28 h-28 text-white/20" strokeWidth={1.5} />
                    <motion.img
                      src={FACE_PLACEHOLDER}
                      alt="Face preview"
                      className="absolute inset-0 w-full h-full object-cover"
                      animate={{ x: [-7, 6, -4, 5, -7], y: [5, -5, 3, -3, 5] }}
                      transition={{ duration: 3.6, repeat: Infinity, ease: 'easeInOut' }}
                      onError={(e) => { e.currentTarget.style.display = 'none'; }}
                    />
                  </div>
                  {blinkDetected && (
                    <motion.div initial={{ scale: 0.6, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                      className="absolute inset-[8px] rounded-[46%/50%] bg-[#22c55e]/25 flex items-center justify-center">
                      <CheckCircle className="w-20 h-20 text-[#22c55e]" strokeWidth={2} />
                    </motion.div>
                  )}
                </div>

                <p className="relative text-[12px] text-white/50 mt-8 text-center">
                  {selectedLanguage === 'English' ? 'Hold still, detecting your face…' : 'அசையாமல் இருங்கள், முகம் கண்டறியப்படுகிறது…'}
                </p>
              </div>
            </div>
          )}

          {/* ── Scanning ── */}
          {step === 'scanning' && (
            <div className="-mx-4">
              <div className="relative overflow-hidden rounded-3xl bg-[#0B1220] px-6 pt-8 pb-9 min-h-[70vh] flex flex-col items-center justify-center">
                <div aria-hidden="true" className="absolute -top-16 left-1/2 -translate-x-1/2 w-64 h-64 rounded-full bg-[#22c55e]/15 blur-3xl pointer-events-none"></div>

                <motion.h2 initial={{ y: -12, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
                  className="relative text-lg font-semibold text-white text-center mb-1">{t.scanningTitle}</motion.h2>
                <p className="relative text-sm text-white/60 text-center mb-8">{t.scanningSubtitle}</p>

                <div className="relative w-60 aspect-[3/4]">
                  {/* face preview — mirrored like a phone's front camera */}
                  <div className="absolute inset-[8px] rounded-[46%/50%] overflow-hidden bg-[#0f1830] flex items-center justify-center scale-x-[-1]">
                    <UserRound className="w-28 h-28 text-white/20" strokeWidth={1.5} />
                    <img
                      src={FACE_PLACEHOLDER}
                      alt="Face"
                      className="absolute inset-0 w-full h-full object-cover"
                      onError={(e) => { e.currentTarget.style.display = 'none'; }}
                    />
                    {/* moving scan beam */}
                    <motion.div
                      animate={{ y: ['-130%', '130%'] }}
                      transition={{ duration: 1.8, repeat: Infinity, ease: 'linear' }}
                      className="absolute left-0 right-0 h-12 bg-gradient-to-b from-transparent via-[#22c55e]/50 to-transparent"
                    />
                  </div>

                  {/* oval progress stroke — trims clockwise around the frame from top-center */}
                  <svg className="absolute inset-0 w-full h-full" viewBox="0 0 240 320" fill="none">
                    <path d="M120 10 A110 150 0 1 1 120 310 A110 150 0 1 1 120 10 Z" stroke="#1e2b47" strokeWidth="3" />
                    <path
                      d="M120 10 A110 150 0 1 1 120 310 A110 150 0 1 1 120 10 Z"
                      stroke="#22c55e"
                      strokeWidth="4"
                      strokeLinecap="round"
                      pathLength={100}
                      strokeDasharray="100"
                      strokeDashoffset={100 - progress}
                      style={{ filter: 'drop-shadow(0 0 6px rgba(34,197,94,0.85))', transition: 'stroke-dashoffset 0.1s linear' }}
                    />
                  </svg>
                </div>

                <motion.p
                  animate={{ opacity: [0.5, 1, 0.5] }}
                  transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
                  className="relative text-sm font-medium text-[#22c55e] mt-8 text-center"
                >
                  {selectedLanguage === 'English' ? 'Scanning your face…' : 'உங்கள் முகத்தை ஸ்கேன் செய்கிறது…'}
                </motion.p>
              </div>
            </div>
          )}

          {/* ── Verifying ── */}
          {step === 'verifying' && (
            <div className="flex flex-col items-center justify-center min-h-[60vh]">
              <motion.div initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 0.4 }} className="mb-8">
                <div className="w-12 h-12 rounded-2xl bg-[#ebecef] flex items-center justify-center">
                  <motion.div animate={{ scale: [1, 1.12, 1], opacity: [0.7, 1, 0.7] }} transition={{ duration: 1.4, repeat: Infinity, ease: "easeInOut" }}>
                    <ScanFace className="w-6 h-6 text-[#315C9D]" strokeWidth={2} />
                  </motion.div>
                </div>
              </motion.div>
              <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.1 }} className="text-center">
                <h2 className="text-xl font-semibold text-[#111827] mb-1">{t.verifyingTitle}</h2>
                <p className="text-sm text-[#6b7280]">{t.verifyingSubtitle}</p>
              </motion.div>
            </div>
          )}

          {/* ── Verified ── */}
          {step === 'verified' && (
            <div className="flex flex-col items-center justify-center min-h-[60vh]">
              <div className="w-32 h-32 flex items-center justify-center">
                <DotLottieReact src={successLottie} autoplay loop={false} style={{ width: '100%', height: '100%' }} />
              </div>
              <motion.p initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.3 }}
                className="text-xl font-semibold text-[#111827] mt-6">{t.verifiedTitle}</motion.p>
            </div>
          )}

          {/* ── Confirm Details ── */}
          {step === 'confirm-details' && (
            <div className="flex flex-col items-center">
              <motion.div initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: "spring", duration: 0.5 }} className="mb-8">
                <div className="w-12 h-12 rounded-2xl bg-[#ebecef] flex items-center justify-center">
                  <CheckCircle className="w-6 h-6 text-[#315C9D]" strokeWidth={2} />
                </div>
              </motion.div>

              <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.1 }} className="text-center mb-6 w-full">
                <h1 className="text-xl font-semibold text-[#111827] mb-1">{t.confirmTitle}</h1>
                <p className="text-sm text-[#6b7280]">{t.confirmSubtitle}</p>
              </motion.div>

              <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2 }} className="w-full mb-6">
                <div className="rounded-xl p-[2px] bg-gradient-to-b from-[#FF9933] via-[#e0e0e0] to-[#138808]">
                  <div className="relative overflow-hidden bg-white rounded-[10px] p-5 space-y-4">
                    {/* Aadhaar emblem */}
                    <img src={aadhaarImg} alt="Aadhaar" className="absolute top-3 right-3 w-12 h-12 object-contain opacity-90 pointer-events-none" />
                    {[
                      { label: t.nameLabel, value: 'Rajesh Kumar' },
                      { label: t.dobLabel, value: '15/05/1990' },
                      { label: t.addressLabel, value: 'No. 45, Gandhi Street, Vadapalani, Chennai, Tamil Nadu - 600026' },
                      { label: t.aadhaarLabel, value: 'XXXX XXXX 9012' }
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
                <div className="space-y-3">
                  <CTAButton onClick={() => setStep('updating-records')}>{t.confirmBtn}</CTAButton>
                  {/* Tertiary: no stroke, no fill. Brand-coloured text carries the
                      affordance, so it reads as secondary to the CTA above without
                      competing with it. */}
                  <button
                    type="button"
                    onClick={() => navigate('/kyc-options')}
                    className="w-full h-12 rounded-lg text-base font-semibold text-[#315C9D] hover:bg-[#315C9D]/5 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#315C9D]"
                  >
                    {t.notMeBtn}
                  </button>
                </div>
              </StickyFooter>
            </div>
          )}

          {/* ── Updating Records ── */}
          {step === 'updating-records' && (
            <div className="flex flex-col items-center justify-center min-h-[60vh]">
              <motion.div initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 0.4 }} className="mb-8">
                <div className="w-12 h-12 rounded-2xl bg-[#ebecef] flex items-center justify-center">
                  <motion.div animate={{ rotate: 360 }} transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}>
                    <CheckCircle className="w-6 h-6 text-[#315C9D]" strokeWidth={2} />
                  </motion.div>
                </div>
              </motion.div>
              <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.1 }} className="text-center">
                <h2 className="text-xl font-semibold text-[#111827] mb-1">{t.updatingRecordsTitle}</h2>
                <p className="text-sm text-[#6b7280]">{t.updatingRecordsSubtitle}</p>
              </motion.div>
            </div>
          )}

          {/* ── Success ── */}
          {step === 'success' && (
            <div className="flex flex-col items-center justify-center min-h-[60vh]">
              <motion.div initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                transition={{ type: "spring", duration: 0.5, bounce: 0.4 }}>
                <div className="w-32 h-32 rounded-2xl bg-[#2da94f]/10 flex items-center justify-center">
                  <CheckCircle className="w-16 h-16 text-[#2da94f]" strokeWidth={2} />
                </div>
              </motion.div>
            </div>
          )}
        </div>
      </main>

      {/* ── Consent Sheet — read-only. Consent itself is given by the inline checkbox. ── */}
      <BottomSheet
        open={showConsentSheet}
        onClose={() => setShowConsentSheet(false)}
        title={t.modalConsentTitle}
        closeLabel={selectedLanguage === 'English' ? 'Close' : 'மூடு'}
        toolbar={
          <>
            <div className="px-5 py-3 border-b border-[#e5e7eb]">
              <div className="relative">
                <button type="button" onClick={() => setShowModalLanguageMenu(!showModalLanguageMenu)}
                  aria-expanded={showModalLanguageMenu}
                  className="w-full bg-transparent border border-[#e5e7eb] rounded-lg px-3 h-11 flex items-center justify-between text-sm font-semibold text-[#212121] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#315C9D]">
                  <span>{modalLanguage}</span>
                  <ChevronDown className={`w-4 h-4 text-[#666666] transition-transform ${showModalLanguageMenu ? 'rotate-180' : ''}`} aria-hidden="true" />
                </button>
                {showModalLanguageMenu && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-lg shadow-lg border border-[#e5e7eb] py-1 z-50 max-h-[200px] overflow-y-auto">
                    {languages.map((lang) => (
                      <button type="button" key={lang} onClick={() => { setModalLanguage(lang); setShowModalLanguageMenu(false); }}
                        className={`w-full text-left px-4 py-2 text-sm hover:bg-[#f9fafb] ${modalLanguage === lang ? 'text-[#315C9D] font-semibold' : 'text-[#111827]'}`}>
                        {lang}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="px-5 py-3">
              <div className="flex items-center gap-3">
                <Volume2 className="w-5 h-5 text-[#315C9D] flex-shrink-0" aria-hidden="true" />
                <input type="range" min="0" max="100" value={volume} onChange={(e) => setVolume(parseInt(e.target.value))}
                  aria-label={selectedLanguage === 'English' ? 'Volume' : 'ஒலி அளவு'}
                  className="flex-1 h-1.5 rounded-lg accent-[#111827] cursor-pointer" />
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
    </div>
  );
}
