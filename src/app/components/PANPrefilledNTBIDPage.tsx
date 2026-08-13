import { useNavigate } from 'react-router';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowRight, Shield, Loader2, Check, CheckCircle } from 'lucide-react';
import { useState, useEffect } from 'react';
import { TopBar } from './TopBar';
import { StickyFooter } from './StickyFooter';
import { useLanguage } from '../hooks/useLanguage';
import panSvg from '@/assets/pan.svg';

const PAN_REGEX = /^[A-Z]{5}[0-9]{4}[A-Z]$/;

type Step = 'pan-input' | 'verifying-pan' | 'pan-confirmed' | 'consent-otp' | 'processing';

interface ProcessingStep {
  id: string;
  labelEn: string;
  labelTa: string;
  durationMs: number;
}

const processingSteps: ProcessingStep[] = [
  { id: 'verify-pan', labelEn: 'Verifying PAN with NSDL...', labelTa: 'NSDL உடன் PAN சரிபார்க்கிறது...', durationMs: 1800 },
];

export function PANPrefilledNTBIDPage() {
  const navigate = useNavigate();
  const [pan, setPan] = useState('ABCDE1234F');
  const [step, setStep] = useState<Step>('pan-input');
  const [consent, setConsent] = useState(false);
  const [ckycConsent, setCkycConsent] = useState(false);
  const [showSheet, setShowSheet] = useState(false);
  const [selectedLanguage] = useLanguage();

  // Consent OTP state
  const [consentOtp, setConsentOtp] = useState(['', '', '', '', '', '']);
  const [otpResendTimer, setOtpResendTimer] = useState(30);
  const [otpVerifying, setOtpVerifying] = useState(false);

  // Processing state
  const [currentProcessingStep, setCurrentProcessingStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<string[]>([]);

  const content = {
    English: {
      title: 'Verify Your PAN',
      subtitle: "We'll verify your PAN with the income tax database",
      panLabel: 'PAN number',
      continueBtn: 'Verify PAN',
      verifyingBtn: 'Verifying...',
      privacyTitle: 'Your Data is Safe',
      privacyBody: 'Your PAN is used only for identity verification and is securely encrypted.',
      consentText: 'I hereby authorise Indian Overseas Bank to fetch my PAN details from NSDL.',
      sheetTitle: 'Your PAN Details',
      nameLabel: 'Name',
      dobLabel: 'Date of Birth',
      panLabel2: 'PAN Number',
      ckycNote: 'Once you confirm with OTP, we will securely check your CKYC records. This is completely safe and used only for verification.',
      ckycConsent: 'I consent to Indian Overseas Bank retrieving my KYC details from CKYC records for verification.',
      confirmBtn: 'Continue',
      notMeBtn: 'This is not my PAN',
    },
    Tamil: {
      title: 'உங்கள் PAN ஐ சரிபார்க்கவும்',
      subtitle: 'உங்கள் PAN ஐ வருமான வரி தரவுத்தளத்துடன் சரிபார்ப்போம்',
      panLabel: 'PAN எண்',
      continueBtn: 'PAN சரிபார்க்கவும்',
      verifyingBtn: 'சரிபார்க்கிறது...',
      privacyTitle: 'உங்கள் தரவு பாதுகாப்பானது',
      privacyBody: 'உங்கள் PAN அடையாள சரிபார்ப்புக்கு மட்டுமே பயன்படுத்தப்படும்.',
      consentText: 'NSDL இலிருந்து எனது PAN விவரங்களைப் பெற இந்தியன் ஓவர்சீஸ் வங்கிக்கு நான் இதன்மூலம் அங்கீகரிக்கிறேன்.',
      sheetTitle: 'உங்கள் PAN விவரங்கள்',
      nameLabel: 'பெயர்',
      dobLabel: 'பிறந்த தேதி',
      panLabel2: 'PAN எண்',
      ckycNote: 'OTP மூலம் உறுதிப்படுத்தியவுடன், உங்கள் CKYC பதிவுகளை பாதுகாப்பாக சரிபார்ப்போம். இது முற்றிலும் பாதுகாப்பானது, சரிபார்ப்புக்கு மட்டுமே பயன்படுத்தப்படும்.',
      ckycConsent: 'சரிபார்ப்புக்காக CKYC இலிருந்து எனது KYC பதிவுகளை இந்தியன் ஓவர்சீஸ் வங்கி பெற நான் சம்மதிக்கிறேன்.',
      confirmBtn: 'தொடரவும்',
      notMeBtn: 'இது எனது PAN அல்ல',
    }
  };

  const t = content[selectedLanguage];
  const isValid = PAN_REGEX.test(pan);
  const canProceed = isValid && consent;

  const handleVerify = () => {
    if (!canProceed || step !== 'pan-input') return;
    setStep('verifying-pan');
    setTimeout(() => {
      setStep('pan-confirmed');
      setShowSheet(true);
    }, 1400);
  };

  const handleConfirm = () => {
    setShowSheet(false);
    navigate('/aadhaar-verification');
  };

  const handleOtpVerify = () => {
    if (consentOtp.join('').length === 6 && !otpVerifying) {
      setOtpVerifying(true);
      setTimeout(() => {
        setOtpVerifying(false);
        setStep('processing');
        setCurrentProcessingStep(0);
        setCompletedSteps([]);
      }, 1200);
    }
  };

  // OTP resend timer
  useEffect(() => {
    if (step !== 'consent-otp') return;
    if (otpResendTimer <= 0) return;
    const id = setInterval(() => setOtpResendTimer(p => p - 1), 1000);
    return () => clearInterval(id);
  }, [step, otpResendTimer]);

  // Processing progression
  useEffect(() => {
    if (step !== 'processing') return;
    if (currentProcessingStep >= processingSteps.length) {
      const timer = setTimeout(() => navigate('/aadhaar-verification'), 800);
      return () => clearTimeout(timer);
    }
    const current = processingSteps[currentProcessingStep];
    const timer = setTimeout(() => {
      setCompletedSteps(prev => [...prev, current.id]);
      setCurrentProcessingStep(prev => prev + 1);
    }, current.durationMs);
    return () => clearTimeout(timer);
  }, [step, currentProcessingStep, navigate]);

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <TopBar showBack />

      <main className="flex-1 overflow-y-auto pb-28">
        <div className="max-w-lg mx-auto px-4 pt-8">

          {/* ── PAN Input ── */}
          {step === 'pan-input' && (
            <>
              <motion.div initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 0.4 }} className="flex justify-center mb-8">
                <img src={panSvg} alt="PAN card" className="w-20 h-auto object-contain" />
              </motion.div>

              <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.1 }} className="text-center mb-8">
                <h1 className="text-xl font-semibold text-[#111827] mb-1">{t.title}</h1>
                <p className="text-sm text-[#6b7280]">{t.subtitle}</p>
              </motion.div>

              <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2 }} className="mb-6">
                <label className="block text-[12px] font-semibold text-[#666666] mb-2 tracking-wide">{t.panLabel}</label>
                <div className="flex items-center bg-transparent border border-[#e5e7eb] rounded-lg px-4 h-14 focus-within:border-[#254576] focus-within:ring-1 focus-within:ring-[#254576]/20 transition-all">
                  <input
                    type="text"
                    value={pan}
                    onChange={(e) => setPan(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 10))}
                    className="flex-1 bg-transparent outline-none text-[16px] font-semibold tracking-[0.15em] text-[#212121] placeholder:text-[#9e9e9e] placeholder:font-normal placeholder:tracking-normal placeholder:normal-case uppercase"
                    placeholder="Enter PAN number"
                    maxLength={10}
                  />
                </div>
              </motion.div>

              <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.4 }}
                className="bg-[#f9fafb] border border-[#e5e7eb] rounded-lg p-4 flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-[#ebecef] flex items-center justify-center flex-shrink-0">
                  <Shield className="w-4 h-4 text-[#111827]" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-[#111827] mb-0.5">{t.privacyTitle}</p>
                  <p className="text-[12px] text-[#6b7280] leading-relaxed">{t.privacyBody}</p>
                </div>
              </motion.div>
            </>
          )}

          {/* ── Verifying PAN ── */}
          {step === 'verifying-pan' && (
            <div className="flex flex-col items-center justify-center min-h-[60vh]">
              <motion.div initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="mb-8">
                <div className="w-14 h-14 rounded-2xl bg-[#315C9D]/10 flex items-center justify-center">
                  <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}>
                    <Loader2 className="w-7 h-7 text-[#315C9D]" strokeWidth={2} />
                  </motion.div>
                </div>
              </motion.div>
              <h2 className="text-xl font-semibold text-[#111827] mb-1">{t.verifyingBtn}</h2>
              <p className="text-sm text-[#6b7280]">{selectedLanguage === 'English' ? 'Checking with NSDL database...' : 'NSDL தரவுத்தளத்துடன் சரிபார்க்கிறது...'}</p>
            </div>
          )}

          {/* ── Consent OTP ── */}
          {step === 'consent-otp' && (
            <div className="flex flex-col items-center">
              <motion.div initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 0.4 }} className="mb-8">
                <div className="w-12 h-12 rounded-2xl bg-[#ebecef] flex items-center justify-center">
                  <Shield className="w-6 h-6 text-[#315C9D]" strokeWidth={2} />
                </div>
              </motion.div>

              <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.1 }} className="text-center mb-8 w-full">
                <h1 className="text-xl font-semibold text-[#111827] mb-1">{selectedLanguage === 'English' ? 'Enter the OTP' : 'OTP ஐ உள்ளிடவும்'}</h1>
                <p className="text-sm text-[#6b7280]">{selectedLanguage === 'English' ? 'Enter the 6-digit OTP sent to your registered mobile' : 'உங்கள் பதிவு செய்யப்பட்ட மொபைலுக்கு அனுப்பப்பட்ட 6 இலக்க OTP ஐ உள்ளிடவும்'}</p>
              </motion.div>

              <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2 }} className="w-full mb-6">
                <div className="flex items-center gap-2 mb-4">
                  {consentOtp.map((digit, index) => (
                    <div key={index} className="flex-1">
                      <input
                        type="text"
                        inputMode="numeric"
                        maxLength={1}
                        value={digit}
                        onChange={(e) => {
                          const v = e.target.value.replace(/\D/g, '').slice(0, 1);
                          const newOtp = [...consentOtp];
                          newOtp[index] = v;
                          setConsentOtp(newOtp);
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
                  {otpResendTimer > 0 ? (
                    <span className="text-[#666666]">{selectedLanguage === 'English' ? 'Resend in' : 'மீண்டும் அனுப்ப'} {otpResendTimer}s</span>
                  ) : (
                    <button onClick={() => setOtpResendTimer(30)} className="text-[#315C9D] font-semibold">{selectedLanguage === 'English' ? 'Resend OTP' : 'OTP மீண்டும் அனுப்பு'}</button>
                  )}
                </div>
              </motion.div>

              <StickyFooter>
                <button
                  onClick={handleOtpVerify}
                  disabled={consentOtp.join('').length !== 6 || otpVerifying}
                  className="w-full bg-[#315C9D] text-white h-12 rounded-lg text-base font-semibold flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed transition-opacity active:scale-[0.98]"
                >
                  {otpVerifying ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" strokeWidth={2.5} />
                      {selectedLanguage === 'English' ? 'Verifying...' : 'சரிபார்க்கிறது...'}
                    </>
                  ) : (
                    <>
                      {selectedLanguage === 'English' ? 'Verify OTP' : 'OTP சரிபார்'}
                      <ArrowRight className="w-5 h-5" strokeWidth={2.5} />
                    </>
                  )}
                </button>
              </StickyFooter>
            </div>
          )}

          {/* ── Processing (Dedupe + CKYC) ── */}
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
                        isCompleted ? 'text-[#2da94f]' : isActive ? 'text-[#315C9D]' : 'text-[#9ca3af]'
                      }`}>
                        {selectedLanguage === 'English' ? ps.labelEn : ps.labelTa}
                      </span>
                    </motion.div>
                  );
                })}
              </div>

              <div className="w-full mt-6">
                <div className="w-full h-1.5 bg-[#315C9D]/10 rounded-full overflow-hidden">
                  <motion.div className="h-full bg-[#315C9D] rounded-full" initial={{ width: '0%' }}
                    animate={{ width: `${(completedSteps.length / processingSteps.length) * 100}%` }} transition={{ duration: 0.4 }} />
                </div>
              </div>
            </div>
          )}

        </div>
      </main>

      {/* CTA for PAN input step */}
      {step === 'pan-input' && (
        <StickyFooter>
          <button
            type="button"
            role="checkbox"
            aria-checked={consent}
            onClick={() => setConsent(!consent)}
            className="w-full flex items-start gap-3 mb-3 text-left rounded-md"
          >
            <span className={`mt-0.5 flex-shrink-0 w-5 h-5 rounded-[5px] border flex items-center justify-center transition-colors ${
              consent ? 'bg-[#315C9D] border-[#315C9D]' : 'bg-white border-[#c4c4c4]'
            }`}>
              {consent && <Check className="w-3.5 h-3.5 text-white" strokeWidth={3} />}
            </span>
            <span className="text-[12px] text-[#6b7280] leading-relaxed">{t.consentText}</span>
          </button>

          <button
            onClick={handleVerify}
            disabled={!canProceed}
            className="w-full bg-[#315C9D] text-white h-12 rounded-lg text-base font-semibold flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed transition-opacity active:scale-[0.98]"
          >
            {t.continueBtn}
            <ArrowRight className="w-5 h-5" strokeWidth={2.5} />
          </button>
        </StickyFooter>
      )}

      {/* ── PAN Details Bottom Sheet ── */}
      <AnimatePresence>
        {showSheet && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.7 }} exit={{ opacity: 0 }}
              onClick={() => { setShowSheet(false); setStep('pan-input'); }}
              className="fixed inset-0 bg-black z-[100]" />

            <motion.div initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="fixed bottom-0 left-0 right-0 bg-white rounded-t-2xl shadow-2xl z-[101] max-h-[85vh] overflow-hidden flex flex-col">

              <div className="flex justify-center pt-3 pb-2">
                <div className="w-10 h-1 bg-[#d9d9d9] rounded-full" />
              </div>

              <div className="px-6 py-3 border-b border-[#e5e7eb]">
                <h2 className="text-base font-semibold text-[#111827]">{t.sheetTitle}</h2>
              </div>

              <div className="flex-1 overflow-y-auto px-6 py-5">
                {/* PAN Details */}
                <div className="bg-[#f9fafb] border border-[#e5e7eb] rounded-xl p-4 space-y-3">
                  <div>
                    <p className="text-[11px] font-semibold text-[#666666] uppercase tracking-wide mb-0.5">{t.nameLabel}</p>
                    <p className="text-sm font-semibold text-[#212121]">Aravind Kumar S.</p>
                  </div>
                  <div className="border-t border-[#e5e7eb] pt-3">
                    <p className="text-[11px] font-semibold text-[#666666] uppercase tracking-wide mb-0.5">{t.dobLabel}</p>
                    <p className="text-sm font-semibold text-[#212121]">12/03/1992</p>
                  </div>
                  <div className="border-t border-[#e5e7eb] pt-3">
                    <p className="text-[11px] font-semibold text-[#666666] uppercase tracking-wide mb-0.5">{t.panLabel2}</p>
                    <p className="text-sm font-semibold text-[#212121] tracking-wider">{pan}</p>
                  </div>
                </div>
              </div>

              {/* Sheet CTAs */}
              <div className="px-6 py-5 border-t border-[#e5e7eb] space-y-3">
                <button
                  onClick={handleConfirm}
                  className="w-full bg-[#315C9D] text-white h-12 rounded-lg text-base font-semibold flex items-center justify-center gap-2 active:scale-[0.98] transition-transform"
                >
                  {t.confirmBtn}
                  <ArrowRight className="w-5 h-5" strokeWidth={2.5} />
                </button>
                <button
                  onClick={() => { setShowSheet(false); setStep('pan-input'); }}
                  className="w-full bg-transparent text-[#315C9D] h-12 rounded-lg text-base font-semibold hover:bg-[#315C9D]/5 transition-colors"
                >
                  {t.notMeBtn}
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
