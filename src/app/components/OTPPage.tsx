import { useNavigate } from 'react-router';
import { motion } from 'motion/react';
import { Shield, ArrowRight, Pencil, Loader2, AlertCircle, CheckCircle } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { TopBar } from './TopBar';
import { StickyFooter } from './StickyFooter';
import { useLanguage } from '../hooks/useLanguage';
import { getActiveFlow, hrmsNextRoute, hrmsProcessing } from '../flows/hrmsFlows';
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
  const activeFlow = getActiveFlow();
  const hrmsNext = hrmsNextRoute(activeFlow, 'ckyc-otp');

  /**
   * Lookups this OTP authorises, rendered as progress rows once it is verified.
   *
   * Non-empty for the flows that arrive here having already consented on the
   * landing screen: the OTP confirms those consents, so the mobile dedupe and
   * CKYC identifier retrieval run after it rather than before. Empty for the
   * flow that goes through the dedupe-outcome screen (its lookups already ran)
   * and for all eight legacy flows, which keep their existing behaviour.
   *
   * No consent declaration lives on this screen: every flow reaching it has
   * given the CKYC declaration somewhere the reason for it was on display.
   */
  const postOtpSteps = hrmsProcessing(activeFlow, 'ckyc-otp');
  const [stepIndex, setStepIndex] = useState(0);
  const [completed, setCompleted] = useState<string[]>([]);

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
      if (otp.join('').replace(/\D/g, '').length !== 6) {
        setOtpError(true);
        return;
      }
      setOtpError(false);
      setVerifying(true);
      // Flows with lookups attached to this step run them here; the progress
      // effect below owns the navigation once they finish. The rest navigate
      // straight through, as before.
      if (postOtpSteps.length === 0) {
        setTimeout(() => navigate(hrmsNext), 1200);
      }
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

  /**
   * Runs the post-OTP lookups one row at a time, then navigates. Timers are
   * cleared on unmount, so a back press mid-lookup advances nothing.
   */
  useEffect(() => {
    if (!verifying || !hrmsNext || postOtpSteps.length === 0) return;

    if (stepIndex >= postOtpSteps.length) {
      const timer = setTimeout(() => navigate(hrmsNext), 400);
      return () => clearTimeout(timer);
    }

    const current = postOtpSteps[stepIndex];
    const timer = setTimeout(() => {
      setCompleted((prev) => [...prev, current.id]);
      setStepIndex((prev) => prev + 1);
    }, current.durationMs);
    return () => clearTimeout(timer);
    // `postOtpSteps` is derived from the active flow, which cannot change while
    // this screen is mounted.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [verifying, stepIndex, hrmsNext, navigate]);

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

          {/* Lookups the confirmed OTP authorised. Each row carries an icon and
              text as well as colour, and future rows stay hidden until reached. */}
          {verifying && postOtpSteps.length > 0 && (
            <div className="space-y-3 mb-6" aria-live="polite">
              {postOtpSteps.map((step, index) => {
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
                      <CheckCircle className="w-5 h-5 text-[#2da94f] flex-shrink-0" strokeWidth={2.5} aria-hidden="true" />
                    ) : (
                      <Loader2 className="w-5 h-5 text-[#315C9D] animate-spin flex-shrink-0" strokeWidth={2.5} aria-hidden="true" />
                    )}
                    <span className={`text-sm font-medium ${isCompleted ? 'text-[#2da94f]' : 'text-[#315C9D]'}`}>
                      {selectedLanguage === 'English' ? step.labelEn : step.labelTa}
                    </span>
                  </div>
                );
              })}
            </div>
          )}

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

        <button
          onClick={handleVerify}
          disabled={hrmsNext ? verifying : !isOtpComplete || verifying}
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

    </div>
  );
}
