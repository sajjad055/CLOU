import { useNavigate } from 'react-router';
import { motion } from 'motion/react';
import { ShieldCheck, ArrowRight, FileCheck, Loader2, CheckCircle, Lock, Check, PhoneCall } from 'lucide-react';
import { useState, useEffect } from 'react';
import { TopBar } from './TopBar';
import { StickyFooter } from './StickyFooter';
import { useLanguage } from '../hooks/useLanguage';

type Step = 'ckyc-info' | 'consent-otp' | 'processing';

interface ProcessingStep {
  id: string;
  labelEn: string;
  labelTa: string;
  durationMs: number;
}

const processingSteps: ProcessingStep[] = [
  { id: 'pull', labelEn: 'Pulling your details from CKYC records...', labelTa: 'CKYC பதிவுகளிலிருந்து உங்கள் விவரங்களை இழுக்கிறது...', durationMs: 2000 },
  { id: 'docs', labelEn: 'Verifying your documents...', labelTa: 'உங்கள் ஆவணங்களை சரிபார்க்கிறது...', durationMs: 1800 },
];

export function CKYCConsentPage() {
  const navigate = useNavigate();
  const [selectedLanguage] = useLanguage();
  const [step, setStep] = useState<Step>('ckyc-info');

  // CKYC option selection
  const flow = localStorage.getItem('activeFlow') || 'ntb-no-ckyc';
  const knowsDefault = flow === 'ntb-knows-ckyc' || flow === 'etb-knows-ckyc' || flow === 'ntb-knows-ckyc-id' || flow === 'etb-knows-ckyc-id' || flow === 'ckyc-only' || flow === 'combined';
  const [ckycOption, setCkycOption] = useState<'know' | 'dont-know'>(knowsDefault ? 'know' : 'dont-know');
  const [ckycInput, setCkycInput] = useState('');

  // OTP state
  const [otp, setOtp] = useState(['1', '2', '3', '4', '5', '6']);
  const [resendTimer, setResendTimer] = useState(30);
  const [otpVerifying, setOtpVerifying] = useState(false);
  const [consentChecked, setConsentChecked] = useState(false);

  // Processing state
  const [currentProcessingStep, setCurrentProcessingStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<string[]>([]);

  // Toll-free number for the "Get CKYC number" missed-call instruction.
  const CKYC_TOLLFREE = '1800 123 4567';

  // Pre-filled CKYC data
  const ckycId = ckycInput || 'CKYC-TN-2024-0047829';

  const content = {
    English: {
      title: 'CKYC Verification',
      subtitle: "We'll fetch and verify your details from the CKYC records",
      ckycLabel: 'CKYC Number',
      knowOption: 'I know my CKYC number',
      dontKnowOption: "I don't know my CKYC number",
      dontKnowDesc: "That's okay — you can continue and we'll verify using your PAN and other details.",
      ckycPlaceholder: 'Enter your CKYC number',
      infoBody: 'With your consent, we will securely pull your identity documents and employment details from the government database to check your credit eligibility.',
      secureNote: 'Your data is protected under the Data Protection Act and used only for this verification.',
      consentCheckbox: 'I consent to Indian Overseas Bank retrieving my KYC records from CKYC records for verification and processing my application.',
      consentBtn: 'Confirm with OTP',
      otpTitle: 'Enter the OTP',
      otpSubtitle: 'Enter the 6-digit OTP sent to your registered mobile',
      verifyBtn: 'Verify OTP',
      verifyingBtn: 'Verifying...',
      resendText: 'Resend in',
      resendBtn: 'Resend OTP',
    },
    Tamil: {
      title: 'CKYC சரிபார்ப்பு',
      subtitle: 'CKYC பதிவுகளிலிருந்து உங்கள் விவரங்களைப் பெற்று சரிபார்ப்போம்',
      ckycLabel: 'CKYC எண்',
      knowOption: 'எனது CKYC எண் எனக்கு தெரியும்',
      dontKnowOption: 'எனது CKYC எண் எனக்கு தெரியாது',
      dontKnowDesc: 'பரவாயில்லை — தொடரவும், உங்கள் PAN மற்றும் பிற விவரங்களைப் பயன்படுத்தி சரிபார்ப்போம்.',
      ckycPlaceholder: 'உங்கள் CKYC எண்ணை உள்ளிடவும்',
      consentCheckbox: 'சரிபார்ப்பு மற்றும் எனது விண்ணப்பத்தை செயலாக்க CKYC பதிவுகளிலிருந்து எனது KYC பதிவுகளை இந்தியன் ஓவர்சீஸ் வங்கி பெற நான் சம்மதிக்கிறேன்.',
      consentBtn: 'OTP மூலம் உறுதிப்படுத்தவும்',
      otpTitle: 'OTP ஐ உள்ளிடவும்',
      otpSubtitle: 'உங்கள் பதிவு செய்யப்பட்ட மொபைலுக்கு அனுப்பப்பட்ட 6 இலக்க OTP ஐ உள்ளிடவும்',
      verifyBtn: 'OTP சரிபார்',
      verifyingBtn: 'சரிபார்க்கிறது...',
      resendText: 'மீண்டும் அனுப்ப',
      resendBtn: 'OTP மீண்டும் அனுப்பு',
    }
  };

  const t = content[selectedLanguage];

  // OTP resend timer
  useEffect(() => {
    if (step !== 'consent-otp') return;
    if (resendTimer <= 0) return;
    const id = setInterval(() => setResendTimer(p => p - 1), 1000);
    return () => clearInterval(id);
  }, [step, resendTimer]);

  // Processing progression
  useEffect(() => {
    if (step !== 'processing') return;
    if (currentProcessingStep >= processingSteps.length) {
      // CKYC records fetched — show the customer details review before continuing.
      const t = setTimeout(() => navigate('/ckyc-customer-details'), 800);
      return () => clearTimeout(t);
    }
    const current = processingSteps[currentProcessingStep];
    const timer = setTimeout(() => {
      setCompletedSteps(prev => [...prev, current.id]);
      setCurrentProcessingStep(prev => prev + 1);
    }, current.durationMs);
    return () => clearTimeout(timer);
  }, [step, currentProcessingStep, navigate]);

  const handleConsentOtp = () => {
    if (otp.join('').length === 6 && !otpVerifying) {
      setOtpVerifying(true);
      setTimeout(() => {
        setOtpVerifying(false);
        setStep('processing');
      }, 1200);
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <TopBar showBack />

      <main className="flex-1 overflow-y-auto">
        <div className="max-w-md mx-auto px-4 pt-8 pb-32">

          {/* ── CKYC Info ── */}
          {step === 'ckyc-info' && (
            <div className="flex flex-col items-center">
              <motion.div initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 0.4 }} className="mb-8">
                <div className="w-12 h-12 rounded-2xl bg-[#ebecef] flex items-center justify-center">
                  <FileCheck className="w-6 h-6 text-[#315C9D]" strokeWidth={2} />
                </div>
              </motion.div>

              <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.1 }} className="text-center mb-8 w-full">
                <h1 className="text-xl font-semibold text-[#111827] mb-1">{t.title}</h1>
                <p className="text-sm text-[#6b7280]">{t.subtitle}</p>
              </motion.div>

              {/* Radio options */}
              <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2 }} className="w-full mb-6 space-y-3">
                {/* Option 1: I know my CKYC number */}
                <button
                  type="button"
                  onClick={() => setCkycOption('know')}
                  className={`w-full text-left border rounded-xl p-4 transition-all ${
                    ckycOption === 'know' ? 'border-[#2da94f] bg-[#2da94f]/5' : 'border-[#e5e7eb] bg-[#f9fafb]'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {/* Filled green tick when selected, empty ring when not — a
                        shape change, so state never rests on colour alone. */}
                    <span className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
                      ckycOption === 'know' ? 'bg-[#2da94f] border-[#2da94f]' : 'bg-white border-[#c4c4c4]'
                    }`} aria-hidden="true">
                      {ckycOption === 'know' && <Check className="w-3 h-3 text-white" strokeWidth={3.5} />}
                    </span>
                    <span className="text-sm font-semibold text-[#111827]">{t.knowOption}</span>
                  </div>
                  {ckycOption === 'know' && (
                    <div className="mt-3 ml-8">
                      <input
                        type="text"
                        value={ckycInput}
                        onChange={(e) => setCkycInput(e.target.value.toUpperCase())}
                        placeholder={t.ckycPlaceholder}
                        className="w-full bg-white border border-[#e5e7eb] rounded-lg px-4 h-12 text-[16px] font-semibold text-[#212121] placeholder:text-[#9e9e9e] placeholder:font-normal focus:border-[#254576] focus:ring-1 focus:ring-[#254576]/20 outline-none transition-all"
                      />
                    </div>
                  )}
                </button>

                {/* Option 2: I don't know my CKYC number */}
                <button
                  type="button"
                  onClick={() => setCkycOption('dont-know')}
                  className={`w-full text-left border rounded-xl p-4 transition-all ${
                    ckycOption === 'dont-know' ? 'border-[#2da94f] bg-[#2da94f]/5' : 'border-[#e5e7eb] bg-[#f9fafb]'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
                      ckycOption === 'dont-know' ? 'bg-[#2da94f] border-[#2da94f]' : 'bg-white border-[#c4c4c4]'
                    }`} aria-hidden="true">
                      {ckycOption === 'dont-know' && <Check className="w-3 h-3 text-white" strokeWidth={3.5} />}
                    </span>
                    <span className="text-sm font-semibold text-[#111827]">{t.dontKnowOption}</span>
                  </div>
                  {ckycOption === 'dont-know' && (
                    <p className="mt-2 ml-8 text-[12px] text-[#6b7280] leading-relaxed">{t.dontKnowDesc}</p>
                  )}
                </button>
              </motion.div>

              {/* Get CKYC number — heading + description + tap-to-call */}
              <div className="w-full mb-5 text-center">
                <p className="text-[12px] font-semibold text-[#374151]">
                  {selectedLanguage === 'English' ? 'Get CKYC number' : 'CKYC எண்ணைப் பெறுங்கள்'}
                </p>
                <p className="text-[10px] font-normal text-[#6b7280] leading-relaxed">
                  {selectedLanguage === 'English'
                    ? 'Give a missed call from your registered mobile number to get CKYC number.'
                    : 'உங்கள் CKYC எண்ணைப் பெற, உங்கள் பதிவு செய்யப்பட்ட மொபைல் எண்ணிலிருந்து ஒரு மிஸ்டு கால் கொடுங்கள்.'}
                </p>
                {CKYC_TOLLFREE && (
                  <a
                    href={`tel:${CKYC_TOLLFREE.replace(/\s/g, '')}`}
                    aria-label={
                      selectedLanguage === 'English'
                        ? `Call the toll-free number ${CKYC_TOLLFREE}`
                        : `கட்டணமில்லா எண் ${CKYC_TOLLFREE} ஐ அழைக்கவும்`
                    }
                    className="mt-0.5 inline-flex items-center justify-center gap-1.5 min-h-[44px] text-[13px] font-semibold text-[#315C9D] underline underline-offset-2 rounded-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#315C9D]"
                  >
                    <PhoneCall className="w-4 h-4" strokeWidth={2.5} aria-hidden="true" />
                    {CKYC_TOLLFREE}
                  </a>
                )}
              </div>

              {/* Security note — only when user knows CKYC */}
              {ckycOption === 'know' && (
              <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.3 }}
                className="w-full mb-4 bg-[#f9fafb] border border-[#e5e7eb] rounded-xl p-4 flex items-start gap-3">
                <div className="w-9 h-9 rounded-full bg-[#315C9D]/10 flex items-center justify-center flex-shrink-0">
                  <ShieldCheck className="w-5 h-5 text-[#315C9D]" strokeWidth={2} />
                </div>
                <div>
                  <p className="text-[12px] text-[#6b7280] leading-relaxed">
                    {selectedLanguage === 'English'
                      ? 'Your CKYC records are accessed only with your consent and used solely for verification purposes.'
                      : 'உங்கள் CKYC பதிவுகள் உங்கள் சம்மதத்துடன் மட்டுமே அணுகப்படும் மற்றும் சரிபார்ப்பு நோக்கங்களுக்கு மட்டுமே பயன்படுத்தப்படும்.'}
                  </p>
                </div>
              </motion.div>
              )}

              <StickyFooter>
                {/* Consent checkbox — only when user knows CKYC */}
                {ckycOption === 'know' && (
                <button
                  type="button"
                  role="checkbox"
                  aria-checked={consentChecked}
                  onClick={() => setConsentChecked(!consentChecked)}
                  className="w-full flex items-start gap-3 mb-4 text-left focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#315C9D] rounded-md"
                >
                  <span
                    className={`mt-0.5 flex-shrink-0 w-5 h-5 rounded-[5px] border flex items-center justify-center transition-colors ${
                      consentChecked ? 'bg-[#315C9D] border-[#315C9D]' : 'bg-white border-[#c4c4c4]'
                    }`}
                  >
                    {consentChecked && <Check className="w-3.5 h-3.5 text-white" strokeWidth={3} />}
                  </span>
                  <span className="text-[12px] text-[#6b7280] leading-relaxed">{t.consentCheckbox}</span>
                </button>
                )}

                <button
                  onClick={() => {
                    if (ckycOption === 'dont-know') {
                      const flow = localStorage.getItem('activeFlow') || 'ntb-no-ckyc';
                      const panRoutes: Record<string, string> = {
                        'ntb-no-ckyc': '/pan-verification',
                        'etb-no-ckyc': '/pan-verification-etb',
                        'ntb-no-ckyc-id': '/pan-verification-ntb-id',
                        'etb-no-ckyc-id': '/pan-verification-etb-id',
                      };
                      navigate(panRoutes[flow] || '/pan-verification');
                    } else {
                      setResendTimer(30);
                      setStep('consent-otp');
                    }
                  }}
                  disabled={ckycOption === 'know' && (!consentChecked || ckycInput.length < 4)}
                  className="w-full bg-[#315C9D] text-white h-12 rounded-lg text-base font-semibold flex items-center justify-center gap-2 active:scale-[0.98] transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {ckycOption === 'dont-know'
                    ? (selectedLanguage === 'English' ? 'Continue to Verify PAN' : 'PAN சரிபார்க்க தொடரவும்')
                    : t.consentBtn}
                  <ArrowRight className="w-5 h-5" strokeWidth={2.5} />
                </button>
              </StickyFooter>
            </div>
          )}

          {/* ── Consent OTP ── */}
          {step === 'consent-otp' && (
            <div className="flex flex-col items-center">
              <motion.div initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 0.4 }} className="mb-8">
                <div className="w-12 h-12 rounded-2xl bg-[#ebecef] flex items-center justify-center">
                  <ShieldCheck className="w-6 h-6 text-[#315C9D]" strokeWidth={2} />
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
                            (next as HTMLInputElement)?.focus();
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
                <button
                  onClick={handleConsentOtp}
                  disabled={otp.join('').length !== 6 || otpVerifying}
                  className="w-full bg-[#315C9D] text-white h-12 rounded-lg text-base font-semibold flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed transition-opacity active:scale-[0.98]"
                >
                  {otpVerifying ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" strokeWidth={2.5} />
                      {t.verifyingBtn}
                    </>
                  ) : (
                    <>
                      {t.verifyBtn}
                      <ArrowRight className="w-5 h-5" strokeWidth={2.5} />
                    </>
                  )}
                </button>
              </StickyFooter>
            </div>
          )}

          {/* ── Processing / BRE Check ── */}
          {step === 'processing' && (
            <div className="flex flex-col items-center justify-center min-h-[65vh]">
              <motion.div initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="mb-8">
                <div className="w-14 h-14 rounded-2xl bg-[#315C9D]/10 flex items-center justify-center">
                  <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}>
                    <Loader2 className="w-7 h-7 text-[#315C9D]" strokeWidth={2} />
                  </motion.div>
                </div>
              </motion.div>

              <div className="w-full space-y-3">
                {processingSteps.map((ps, index) => {
                  const isCompleted = completedSteps.includes(ps.id);
                  const isActive = currentProcessingStep === index && !isCompleted;
                  const isPending = index > currentProcessingStep;

                  return (
                    <motion.div
                      key={ps.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.15 }}
                      className={`flex items-center gap-3 px-4 py-3 rounded-lg border transition-all ${
                        isCompleted ? 'bg-[#2da94f]/5 border-[#2da94f]/20' :
                        isActive ? 'bg-[#315C9D]/5 border-[#315C9D]/20' :
                        'bg-[#f9fafb] border-[#e5e7eb]'
                      }`}
                    >
                      {isCompleted ? (
                        <CheckCircle className="w-5 h-5 text-[#2da94f] flex-shrink-0" strokeWidth={2.5} />
                      ) : isActive ? (
                        <Loader2 className="w-5 h-5 text-[#315C9D] animate-spin flex-shrink-0" strokeWidth={2.5} />
                      ) : (
                        <div className="w-5 h-5 rounded-full border-2 border-gray-300 flex-shrink-0" />
                      )}
                      <span className={`text-sm font-medium ${
                        isCompleted ? 'text-[#2da94f]' :
                        isActive ? 'text-[#315C9D]' :
                        'text-[#9ca3af]'
                      }`}>
                        {selectedLanguage === 'English' ? ps.labelEn : ps.labelTa}
                      </span>
                    </motion.div>
                  );
                })}
              </div>

              {/* Progress bar */}
              <div className="w-full mt-6">
                <div className="w-full h-1.5 bg-[#315C9D]/10 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-[#315C9D] rounded-full"
                    initial={{ width: '0%' }}
                    animate={{ width: `${(completedSteps.length / processingSteps.length) * 100}%` }}
                    transition={{ duration: 0.4 }}
                  />
                </div>
                <p className="text-center text-[11px] text-[#6b7280] mt-2">
                  {completedSteps.length} / {processingSteps.length} {selectedLanguage === 'English' ? 'completed' : 'முடிந்தது'}
                </p>
              </div>
            </div>
          )}

        </div>
      </main>

    </div>
  );
}
