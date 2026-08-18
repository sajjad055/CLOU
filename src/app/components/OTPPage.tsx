import { useNavigate } from 'react-router';
import { motion } from 'motion/react';
import { Shield, ArrowRight, Pencil, Loader2, AlertCircle, Check } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { TopBar } from './TopBar';
import { StickyFooter } from './StickyFooter';
import { BottomSheet } from './BottomSheet';
import { useLanguage } from '../hooks/useLanguage';
import { getActiveFlow, hrmsNextRoute } from '../flows/hrmsFlows';
import { tr } from '../flows/hrmsContent';

export function OTPPage() {
  const navigate = useNavigate();
  const [otp, setOtp] = useState(['1', '2', '3', '4', '5', '6']);
  const [selectedLanguage] = useLanguage();
  const [timer, setTimer] = useState(30);
  const [canResend, setCanResend] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [otpError, setOtpError] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  /**
   * `/ckyc-customer-details` for the five HRMS flows, `null` for the eight
   * existing flows and for any unrecognised value — so existing flows never
   * take the HRMS branch below.
   */
  const hrmsNext = hrmsNextRoute(getActiveFlow(), 'ckyc-otp');

  /**
   * CKYC-download consent, HRMS flows only.
   *
   * These flows reach this screen with a PAN already in hand — from HRMS, or
   * from the bank record the mobile dedupe matched — and this OTP is what
   * confirms the download. So the declaration belongs here, immediately above
   * it: consent, then the OTP that confirms the consent.
   *
   * Both the declaration and the sheet are gated on `hrmsNext`, so nothing about
   * this screen changes for the eight legacy flows.
   */
  const [ckycConsent, setCkycConsent] = useState(false);
  // Read-only: shows the full wording, sets no consent, advances nothing.
  const [showConsentSheet, setShowConsentSheet] = useState(false);

  useEffect(() => { inputRefs.current[0]?.focus(); }, []);

  useEffect(() => {
    if (timer > 0) {
      const interval = setInterval(() => setTimer((p) => p - 1), 1000);
      return () => clearInterval(interval);
    } else {
      setCanResend(true);
    }
  }, [timer]);

  const content = {
    English: {
      title: "Verify OTP",
      subtitle: "Enter the 6-digit code sent to",
      phoneNumber: "+91 9876543210",
      verifyBtn: "Verify",
      resendBtn: "Resend OTP",
      resendTimer: "Resend in"
    },
    Tamil: {
      title: "OTP ஐ சரிபார்க்கவும்",
      subtitle: "அனுப்பப்பட்ட 6-இலக்க குறியீட்டை உள்ளிடவும்",
      phoneNumber: "+91 9876543210",
      verifyBtn: "சரிபார்",
      resendBtn: "மீண்டும் அனுப்பு",
      resendTimer: "மீண்டும்"
    }
  };

  const t = content[selectedLanguage];

  const handleOtpChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);
    if (value && index < 5) inputRefs.current[index + 1]?.focus();
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) inputRefs.current[index - 1]?.focus();
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    const newOtp = [...otp];
    pasted.split('').forEach((char, i) => { if (i < 6) newOtp[i] = char; });
    setOtp(newOtp);
    inputRefs.current[Math.min(pasted.length, 5)]?.focus();
  };

  const handleVerify = () => {
    // HRMS branch, checked first. Accepts any six-digit value.
    if (hrmsNext) {
      if (verifying) return;
      // The CTA is rendered disabled without consent; guarded here too, so an
      // activation that slips through downloads nothing.
      if (!ckycConsent) return;
      if (otp.join('').replace(/\D/g, '').length !== 6) {
        setOtpError(true);
        return;
      }
      setOtpError(false);
      setVerifying(true);
      setTimeout(() => navigate(hrmsNext), 1200);
      return;
    }

    // ── existing behaviour, unchanged ──
    if (otp.join('') === '123456' && !verifying) {
      setVerifying(true);
      setTimeout(() => navigate('/ckyc-consent'), 1200);
    }
  };

  const handleResend = () => {
    if (canResend) { setTimer(30); setCanResend(false); setOtp(['', '', '', '', '', '']); inputRefs.current[0]?.focus(); }
  };

  const isOtpComplete = otp.every((d) => d !== '');

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Header */}
      <TopBar showBack />

      <main className="flex-1 overflow-y-auto pb-28">
        <div className="max-w-lg mx-auto px-4 pt-8">
          {/* Icon */}
          <motion.div initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 0.4 }}
            className="flex justify-center mb-8">
            <div className="w-12 h-12 rounded-2xl bg-[#ebecef] flex items-center justify-center">
              <Shield className="w-6 h-6 text-[#315C9D]" strokeWidth={2} />
            </div>
          </motion.div>

          {/* Title */}
          <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.1 }} className="text-center mb-8">
            {/* On the HRMS flows this OTP is what authorises the CKYC download,
                so it is named for that. The legacy flows keep their own wording,
                including the edit-number affordance that belongs to a number the
                customer typed — the HRMS number came from the employee record,
                so there is nothing to edit here. */}
            {hrmsNext ? (
              <>
                <h1 className="text-xl font-semibold text-[#111827] mb-1">
                  {tr(selectedLanguage, 'ckycOtpTitle')}
                </h1>
                <p className="text-sm text-[#6b7280]">
                  {tr(selectedLanguage, 'ckycOtpSubtitle').replace('{mobile}', t.phoneNumber)}
                </p>
              </>
            ) : (
              <>
                <h1 className="text-xl font-semibold text-[#111827] mb-1">{t.title}</h1>
                <p className="text-sm text-[#6b7280]">
                  {t.subtitle}{' '}
                  <span className="inline-flex items-center gap-1 align-middle">
                    <span className="font-semibold text-[#111827]">{t.phoneNumber}</span>
                    <button type="button" onClick={() => navigate(-1)} aria-label="Edit number" className="text-[#315C9D] hover:opacity-80 transition-opacity">
                      <Pencil className="w-5 h-5" strokeWidth={2} />
                    </button>
                  </span>
                </p>
              </>
            )}
          </motion.div>

          {/* OTP Inputs */}
          <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2 }} className="mb-6">
            <div className="flex items-center gap-2 mb-4">
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
                    onPaste={handlePaste}
                    aria-label={`OTP digit ${index + 1}`}
                    aria-describedby={hrmsNext && otpError ? 'otp-error' : undefined}
                    aria-invalid={hrmsNext && otpError ? true : undefined}
                    className="w-full h-14 text-center text-xl font-bold bg-transparent border border-[#e5e7eb] rounded-lg focus:border-[#254576] focus:ring-1 focus:ring-[#254576]/20 focus:outline-none transition-all text-[#212121]"
                  />
                </div>
              ))}
            </div>

            {hrmsNext && otpError && (
              <p id="otp-error" role="alert" className="flex items-start gap-1.5 text-sm text-[#b42318] mb-4">
                <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" strokeWidth={2} aria-hidden="true" />
                <span>{tr(selectedLanguage, 'otpShortError')}</span>
              </p>
            )}

            <div className="flex items-center justify-center text-sm">
              {canResend ? (
                <button onClick={handleResend} className="text-[#315C9D] font-semibold">{t.resendBtn}</button>
              ) : (
                <span className="text-[#666666]">{t.resendTimer} {timer}s</span>
              )}
            </div>
          </motion.div>

          {/* Security card */}
          <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.4 }}
            className="bg-[#f9fafb] border border-[#e5e7eb] rounded-lg p-4 flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-[#ebecef] flex items-center justify-center flex-shrink-0">
              <Shield className="w-4 h-4 text-[#111827]" />
            </div>
            <div>
              <p className="text-sm font-semibold text-[#111827] mb-0.5">
                {selectedLanguage === 'English' ? 'Secure Verification' : 'பாதுகாப்பான சரிபார்ப்பு'}
              </p>
              <p className="text-[12px] text-[#6b7280] leading-relaxed">
                {selectedLanguage === 'English'
                  ? 'Your OTP is encrypted and valid for 10 minutes. Never share it with anyone.'
                  : 'உங்கள் OTP குறியாக்கம் செய்யப்பட்டுள்ளது மற்றும் 10 நிமிடங்களுக்கு செல்லுபடியாகும்.'}
              </p>
            </div>
          </motion.div>
        </div>
      </main>

      <StickyFooter>
        {/* One declaration, so it stays inline above the CTA per the consent
            pattern. The "Read more" link is a sibling of the checkbox, never a
            child: a button inside a button is invalid HTML and the inner control
            would be unreachable. */}
        {hrmsNext && (
          <div className="mb-3 flex items-start gap-3">
            <button
              type="button"
              role="checkbox"
              aria-checked={ckycConsent}
              aria-labelledby="ckyc-pan-consent-label"
              onClick={() => setCkycConsent(!ckycConsent)}
              className="flex-shrink-0 mt-0.5 p-0.5 rounded-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#315C9D]"
            >
              <span
                className={`flex w-5 h-5 rounded-[5px] border items-center justify-center transition-colors ${
                  ckycConsent ? 'bg-[#315C9D] border-[#315C9D]' : 'bg-white border-[#c4c4c4]'
                }`}
              >
                {ckycConsent && (
                  <Check className="w-3.5 h-3.5 text-white" strokeWidth={3} aria-hidden="true" />
                )}
              </span>
            </button>

            <p className="text-[12px] text-[#6b7280] leading-relaxed">
              <span id="ckyc-pan-consent-label">
                {tr(selectedLanguage, 'ckycPanConsentText')}
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
        )}

        <button
          onClick={handleVerify}
          disabled={hrmsNext ? verifying || !ckycConsent : !isOtpComplete || verifying}
          className="w-full bg-[#315C9D] text-white h-12 rounded-lg text-base font-semibold flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed transition-opacity"
        >
          {verifying ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" strokeWidth={2.5} />
              {selectedLanguage === 'English' ? 'Verifying OTP...' : 'OTP சரிபார்க்கிறது...'}
            </>
          ) : (
            <>
              {t.verifyBtn}
              {isOtpComplete && <ArrowRight className="w-5 h-5" strokeWidth={2.5} />}
            </>
          )}
        </button>
      </StickyFooter>

      {/* Read-only consent wording. No footer action, so closing it is the only
          exit and the checkbox stays the single place consent is given. */}
      <BottomSheet
        open={showConsentSheet}
        onClose={() => setShowConsentSheet(false)}
        title={tr(selectedLanguage, 'ckycPanConsentTitle')}
      >
        <p className="text-sm text-[#6b7280] leading-relaxed whitespace-pre-line">
          {tr(selectedLanguage, 'ckycPanConsentFull')}
        </p>
      </BottomSheet>
    </div>
  );
}
