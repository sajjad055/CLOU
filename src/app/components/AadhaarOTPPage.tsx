import { useNavigate } from 'react-router';
import { motion, AnimatePresence } from 'motion/react';
import { Shield, CheckCircle, Smartphone, Volume2, ChevronDown, Pencil } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { TopBar } from './TopBar';
import { StickyFooter } from './StickyFooter';
import { useLanguage } from '../hooks/useLanguage';

type VerificationStep = 'aadhaar-input' | 'otp-verification' | 'verifying' | 'verified' | 'confirm-details' | 'updating-records' | 'success';

/* ─── shared CTA button ──────────────────────────────────────────────────── */
function CTAButton({ onClick, disabled, children }: { onClick?: () => void; disabled?: boolean; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="w-full bg-[#315C9D] text-white h-12 rounded-lg text-base font-semibold flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed transition-opacity"
    >
      {children}
    </button>
  );
}

/* ─── shared field label ─────────────────────────────────────────────────── */
function FieldLabel({ children }: { children: React.ReactNode }) {
  return <label className="block text-[12px] font-semibold text-[#666666] uppercase tracking-wide mb-2">{children}</label>;
}

/* ─── shared input ───────────────────────────────────────────────────────── */
function TextInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={`w-full bg-transparent border border-[#e5e7eb] rounded-lg px-4 h-14 focus:border-[#254576] focus:ring-1 focus:ring-[#254576]/20 transition-all outline-none text-sm font-semibold text-[#212121] placeholder:text-[#9e9e9e] ${props.className ?? ''}`}
    />
  );
}

export function AadhaarOTPPage() {
  const navigate = useNavigate();
  const [selectedLanguage] = useLanguage();
  const [step, setStep] = useState<VerificationStep>('aadhaar-input');
  const [aadhaarNumber, setAadhaarNumber] = useState('1234 5678 9012');
  const [otp, setOtp] = useState(['1', '2', '3', '4', '5', '6']);
  const [timer, setTimer] = useState(30);
  const [canResend, setCanResend] = useState(false);
  const [showConsentSheet, setShowConsentSheet] = useState(false);
  const [volume, setVolume] = useState(50);
  const [showModalLanguageMenu, setShowModalLanguageMenu] = useState(false);
  const [modalLanguage, setModalLanguage] = useState('English');
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (step === 'otp-verification' && timer > 0) {
      const id = setInterval(() => setTimer((p) => p - 1), 1000);
      return () => clearInterval(id);
    } else if (timer === 0) setCanResend(true);
  }, [step, timer]);

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
      aadhaarTitle: "Aadhaar OTP Verification",
      aadhaarSubtitle: "Enter your Aadhaar number to begin",
      aadhaarLabel: "Aadhaar Number",
      consentTextFull: "I agree and authorize Indian Overseas Bank to fetch my name, date of birth and photograph from UIDAI, limited to authenticating myself with Aadhaar based authentication system for identity verification in adherence to performing e-kyc.\n\nI understand that Indian Overseas Bank will authenticate my identity through the Aadhaar authentication system for personal loans and/or for other purposes, or as authorised under the Aadhaar Act, 2016.\n\nI understand that Indian Overseas Bank shall ensure security and confidentiality of my personal identity data and prohibit its use other than for submission to the Central Identities Data Repository (CIDR) for authentication.\n\nI hereby authorize Indian Overseas Bank to verify and authenticate using the Aadhaar number provided. I further authorize Indian Overseas Bank to retain my Aadhaar details for authenticated consent or retention of details for any purpose or duration to comply with Aadhaar Act, 2016 and the applicable law.\n\nThis is a Min KYC process which has account limits as per RBI guidelines. You can upgrade to Full KYC anytime.",
      modalConsentTitle: "Aadhaar Consent",
      agreeAndContinue: "Accept & Continue",
      startBtn: "Verify",
      otpTitle: "Verify Aadhaar OTP",
      otpSubtitle: "Enter the 6-digit OTP sent to your Aadhaar-linked mobile",
      verifyOtpBtn: "Verify",
      resendBtn: "Resend",
      resendTimer: "Resend in",
      verifyingTitle: "Verifying Aadhaar",
      verifyingSubtitle: "Please wait while we verify your OTP...",
      verifiedTitle: "Aadhaar Verified",
      confirmTitle: "Confirm Your Details",
      confirmSubtitle: "Please verify that these are your details",
      nameLabel: "Name",
      dobLabel: "Date of Birth",
      addressLabel: "Address",
      aadhaarNumberLabel: "Aadhaar Number",
      confirmBtn: "Yes, This is Me",
      notMeBtn: "Not Me",
      updatingRecordsTitle: "Updating Records",
      updatingRecordsSubtitle: "Please wait while we update your information..."
    },
    Tamil: {
      aadhaarTitle: "ஆதார் OTP சரிபார்ப்பு",
      aadhaarSubtitle: "தொடங்க உங்கள் ஆதார் எண்ணை உள்ளிடவும்",
      aadhaarLabel: "ஆதார் எண்",
      consentTextFull: "e-kyc ஐ செய்வதில் இணங்கி அடையாள சரிபார்ப்புக்காக ஆதார் அடிப்படையிலான அங்கீகார அமைப்புடன் என்னை அங்கீகரிக்க மட்டுப்படுத்தப்பட்ட UIDAI இலிருந்து எனது பெயர், பிறந்த தேதி மற்றும் புகைப்படத்தைப் பெற இந்தியன் ஓவர்சீஸ் வங்கிக்கு நான் ஒப்புக்கொள்கிறேன்.\n\nRBI வழிகாட்டுதல்களின்படி கணக்கு வரம்புகளைக் கொண்ட குறைந்த KYC செயல்முறை.",
      modalConsentTitle: "ஆதார் சம்மதம்",
      agreeAndContinue: "ஏற்று தொடரவும்",
      startBtn: "சரிபார்",
      otpTitle: "ஆதார் OTP ஐ சரிபார்",
      otpSubtitle: "உங்கள் ஆதாருடன் இணைக்கப்பட்ட மொபைலுக்கு அனுப்பப்பட்ட 6-இலக்க OTP ஐ உள்ளிடவும்",
      verifyOtpBtn: "சரிபார்",
      resendBtn: "மீண்டும் அனுப்பு",
      resendTimer: "மீண்டும்",
      verifyingTitle: "ஆதார் சரிபார்க்கப்படுகிறது",
      verifyingSubtitle: "உங்கள் OTP ஐ சரிபார்க்கும்போது காத்திருக்கவும்...",
      verifiedTitle: "ஆதார் சரிபார்க்கப்பட்டது",
      confirmTitle: "உங்கள் விவரங்களை உறுதிப்படுத்தவும்",
      confirmSubtitle: "இவை உங்கள் விவரங்கள் என்பதை சரிபார்க்கவும்",
      nameLabel: "பெயர்",
      dobLabel: "பிறந்த தேதி",
      addressLabel: "முகவரி",
      aadhaarNumberLabel: "ஆதார் எண்",
      confirmBtn: "ஆம், இது நான்தான்",
      notMeBtn: "நான் அல்ல",
      updatingRecordsTitle: "பதிவுகள் புதுப்பிக்கப்படுகின்றன",
      updatingRecordsSubtitle: "உங்கள் தகவல்களை புதுப்பிக்கும்போது காத்திருக்கவும்..."
    }
  };

  const t = content[selectedLanguage];

  const formatAadhaar = (v: string) => {
    const c = v.replace(/\s/g, '');
    return c.match(/.{1,4}/g)?.join(' ') ?? c;
  };

  const handleOtpChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    const n = [...otp]; n[index] = value.slice(-1); setOtp(n);
    if (value && index < 5) inputRefs.current[index + 1]?.focus();
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) inputRefs.current[index - 1]?.focus();
  };

  const isOtpComplete = otp.every((d) => d !== '');

  const languages = ['English', 'Tamil', 'Hindi', 'Kannada', 'Telugu', 'Malayalam', 'Bengali', 'Marathi'];

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <TopBar showBack />

      <main className="flex-1 overflow-y-auto bg-white">
        <div className="max-w-md mx-auto px-4 pt-8 pb-32">

          {/* ── Aadhaar Input ── */}
          {step === 'aadhaar-input' && (
            <div className="flex flex-col items-center">
              <motion.div initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 0.4 }} className="mb-8">
                <div className="w-12 h-12 rounded-2xl bg-[#ebecef] flex items-center justify-center">
                  <Smartphone className="w-6 h-6 text-[#315C9D]" strokeWidth={2} />
                </div>
              </motion.div>

              <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.1 }} className="text-center mb-8 w-full">
                <h1 className="text-xl font-semibold text-[#111827] mb-1">{t.aadhaarTitle}</h1>
                <p className="text-sm text-[#6b7280]">{t.aadhaarSubtitle}</p>
              </motion.div>

              <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2 }} className="w-full mb-6">
                <FieldLabel>{t.aadhaarLabel}</FieldLabel>
                <TextInput
                  type="text"
                  value={aadhaarNumber}
                  onChange={(e) => setAadhaarNumber(formatAadhaar(e.target.value.replace(/\D/g, '').slice(0, 12)))}
                  placeholder="1234 5678 9012"
                />
              </motion.div>

              <StickyFooter>
                <CTAButton
                  disabled={aadhaarNumber.replace(/\s/g, '').length !== 12}
                  onClick={() => { if (aadhaarNumber.replace(/\s/g, '').length === 12) setShowConsentSheet(true); }}
                >
                  {t.startBtn}
                </CTAButton>
              </StickyFooter>
            </div>
          )}

          {/* ── OTP Verification ── */}
          {step === 'otp-verification' && (
            <div className="flex flex-col items-center">
              <motion.div initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="mb-8">
                <div className="w-12 h-12 rounded-2xl bg-[#ebecef] flex items-center justify-center">
                  <Shield className="w-6 h-6 text-[#315C9D]" strokeWidth={2} />
                </div>
              </motion.div>

              <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="text-center mb-8 w-full">
                <h1 className="text-xl font-semibold text-[#111827] mb-1">{t.otpTitle}</h1>
                <p className="text-sm text-[#6b7280]">
                  {t.otpSubtitle}{' '}
                  <span className="inline-flex items-center gap-1 align-middle">
                    <span className="font-semibold text-[#111827]">{`XXXX XXXX ${aadhaarNumber.replace(/\s/g, '').slice(-4)}`}</span>
                    <button type="button" onClick={() => setStep('aadhaar-input')} aria-label="Edit Aadhaar number" className="text-[#315C9D] hover:opacity-80 transition-opacity">
                      <Pencil className="w-5 h-5" strokeWidth={2} />
                    </button>
                  </span>
                </p>
              </motion.div>

              <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="w-full mb-6">
                <div className="flex items-center gap-2 mb-6">
                  {otp.map((digit, index) => (
                    <div key={index} className="flex-1">
                      <input
                        ref={(el) => (inputRefs.current[index] = el)}
                        type="text"
                        inputMode="numeric"
                        maxLength={1}
                        value={digit}
                        onChange={(e) => handleOtpChange(index, e.target.value)}
                        onKeyDown={(e) => handleKeyDown(index, e)}
                        className="w-full h-14 text-center text-xl font-bold bg-transparent border border-[#e5e7eb] rounded-lg focus:border-[#254576] focus:ring-1 focus:ring-[#254576]/20 focus:outline-none transition-all text-[#212121]"
                      />
                    </div>
                  ))}
                </div>

                <div className="flex items-center justify-center mt-5 text-sm">
                  {canResend ? (
                    <button onClick={() => { setTimer(30); setCanResend(false); setOtp(['', '', '', '', '', '']); inputRefs.current[0]?.focus(); }}
                      className="text-[#315C9D] font-semibold">{t.resendBtn}</button>
                  ) : (
                    <span className="text-[#666666]">{t.resendTimer} {timer}s</span>
                  )}
                </div>
              </motion.div>

              <StickyFooter>
                <CTAButton disabled={!isOtpComplete} onClick={() => { if (isOtpComplete) setStep('verifying'); }}>
                  {t.verifyOtpBtn}
                </CTAButton>
              </StickyFooter>
            </div>
          )}

          {/* ── Verifying ── */}
          {step === 'verifying' && (
            <div className="flex flex-col items-center justify-center min-h-[60vh]">
              <motion.div initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 0.4 }} className="mb-8">
                <div className="w-12 h-12 rounded-2xl bg-[#ebecef] flex items-center justify-center">
                  <motion.div animate={{ rotate: 360 }} transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}>
                    <Smartphone className="w-6 h-6 text-[#315C9D]" strokeWidth={2} />
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
              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 200, damping: 15 }}>
                <div className="w-32 h-32 rounded-2xl bg-[#2da94f]/10 flex items-center justify-center">
                  <CheckCircle className="w-16 h-16 text-[#2da94f]" strokeWidth={2} />
                </div>
              </motion.div>
              <motion.p initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.3 }}
                className="text-xl font-semibold text-[#2da94f] mt-6">{t.verifiedTitle}</motion.p>
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
                <div className="bg-[#f9fafb] border border-[#e5e7eb] rounded-lg p-5 space-y-4">
                  {[
                    { label: t.nameLabel, value: 'Rajesh Kumar' },
                    { label: t.dobLabel, value: '15/05/1990' },
                    { label: t.addressLabel, value: 'No. 45, Gandhi Street, Vadapalani, Chennai, Tamil Nadu - 600026' },
                    { label: t.aadhaarNumberLabel, value: 'XXXX XXXX 9012' }
                  ].map((row, i) => (
                    <div key={i} className={i > 0 ? 'border-t border-[#e5e7eb] pt-4' : ''}>
                      <p className="text-[12px] font-semibold text-[#666666] uppercase tracking-wide mb-1">{row.label}</p>
                      <p className="text-sm font-semibold text-[#212121]">{row.value}</p>
                    </div>
                  ))}
                </div>
              </motion.div>

              <StickyFooter>
                <div className="space-y-3">
                  <CTAButton onClick={() => setStep('updating-records')}>{t.confirmBtn}</CTAButton>
                  <button onClick={() => navigate('/kyc-options')}
                    className="w-full bg-white border border-[#e5e7eb] text-[#111827] h-12 rounded-lg text-base font-semibold hover:bg-[#f9fafb] transition-colors">
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
              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 200, damping: 15 }}>
                <div className="w-32 h-32 rounded-2xl bg-[#2da94f]/10 flex items-center justify-center">
                  <CheckCircle className="w-16 h-16 text-[#2da94f]" strokeWidth={2} />
                </div>
              </motion.div>
            </div>
          )}
        </div>
      </main>

      {/* ── Consent Sheet ── */}
      <AnimatePresence>
        {showConsentSheet && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.7 }} exit={{ opacity: 0 }}
              onClick={() => setShowConsentSheet(false)}
              className="fixed inset-0 bg-black z-[100]" />

            <motion.div initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="fixed bottom-0 left-0 right-0 bg-white rounded-t-xl shadow-2xl z-[101] max-h-[85vh] overflow-hidden flex flex-col">

              <div className="flex justify-center pt-3 pb-2">
                <div className="w-10 h-1 bg-[#d9d9d9] rounded-full" />
              </div>

              <div className="px-6 py-3 border-b border-[#e5e7eb]">
                <h2 className="text-base font-semibold text-[#111827]">{t.modalConsentTitle}</h2>
              </div>

              {/* Language selector */}
              <div className="px-5 py-3 border-b border-[#e5e7eb]">
                <div className="relative">
                  <button onClick={() => setShowModalLanguageMenu(!showModalLanguageMenu)}
                    className="w-full bg-transparent border border-[#e5e7eb] rounded-lg px-3 h-11 flex items-center justify-between text-sm font-semibold text-[#212121]">
                    <span>{modalLanguage}</span>
                    <ChevronDown className={`w-4 h-4 text-[#666666] transition-transform ${showModalLanguageMenu ? 'rotate-180' : ''}`} />
                  </button>
                  {showModalLanguageMenu && (
                    <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-lg shadow-lg border border-[#e5e7eb] py-1 z-50 max-h-[200px] overflow-y-auto">
                      {languages.map((lang) => (
                        <button key={lang} onClick={() => { setModalLanguage(lang); setShowModalLanguageMenu(false); }}
                          className={`w-full text-left px-4 py-2 text-sm hover:bg-[#f9fafb] transition-colors ${modalLanguage === lang ? 'text-[#315C9D] font-semibold' : 'text-[#111827]'}`}>
                          {lang}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Audio */}
              <div className="px-5 py-3 border-b border-[#e5e7eb]">
                <div className="flex items-center gap-3">
                  <Volume2 className="w-5 h-5 text-[#315C9D] flex-shrink-0" />
                  <input type="range" min="0" max="100" value={volume} onChange={(e) => setVolume(parseInt(e.target.value))}
                    className="flex-1 h-1.5 rounded-lg accent-[#111827] cursor-pointer" />
                  <span className="text-[12px] text-[#666666] font-medium min-w-[32px]">{volume}%</span>
                </div>
              </div>

              {/* Consent text */}
              <div className="flex-1 overflow-y-auto px-6 py-5">
                <p className="text-sm text-[#6b7280] leading-relaxed whitespace-pre-line">
                  {modalLanguage === 'Tamil' ? content.Tamil.consentTextFull : content.English.consentTextFull}
                </p>
              </div>

              <div className="px-6 py-5 border-t border-[#e5e7eb]">
                <CTAButton onClick={() => { setShowConsentSheet(false); setStep('otp-verification'); setTimer(30); setCanResend(false); }}>
                  {modalLanguage === 'Tamil' ? content.Tamil.agreeAndContinue : content.English.agreeAndContinue}
                </CTAButton>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
