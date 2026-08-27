import { useEffect } from 'react';
import { useNavigate } from 'react-router';
import { motion } from 'motion/react';
import { Loader2, ArrowRight, ShieldCheck } from 'lucide-react';
import { TopBar } from './TopBar';
import { useLanguage } from '../hooks/useLanguage';
import { kycPercent, useSalaryAdvanceState } from '../state/salaryAdvance';

/**
 * The HRMS journey screen the "continue where you left off" resume lands on.
 * The first half (identity, records) is treated as already done, so the user
 * picks up at Aadhaar verification.
 */
const RESUME_ROUTE = '/aadhaar-verification';

/** How long the interstitial shows before auto-advancing. A Continue button is
 *  always present, so the wait is never the only way forward. */
const AUTO_REDIRECT_MS = 2400;

/**
 * "Welcome back" resume interstitial, shown when the user continues a
 * partially-complete KYC from the home screen. It states how far they got and
 * then hands them to the middle of the HRMS journey (Aadhaar verification),
 * either automatically after a short beat or immediately via the button.
 */
export function KycResumePage() {
  const navigate = useNavigate();
  const [language] = useLanguage();
  const state = useSalaryAdvanceState();
  const isTa = language === 'Tamil';
  const percent = kycPercent(state);

  useEffect(() => {
    const timer = setTimeout(() => navigate(RESUME_ROUTE), AUTO_REDIRECT_MS);
    return () => clearTimeout(timer);
  }, [navigate]);

  const t = {
    title: isTa ? 'மீண்டும் வரவேற்கிறோம்' : 'Welcome back',
    body: isTa
      ? `உங்கள் KYC ${percent}% முடிந்துள்ளது. நீங்கள் நிறுத்திய இடத்திலிருந்து தொடரலாம்.`
      : `You've completed ${percent}% of your KYC. Let's continue where you left off.`,
    resuming: isTa ? 'ஆதார் சரிபார்ப்பிலிருந்து தொடர்கிறது…' : 'Resuming from Aadhaar verification…',
    cta: isTa ? 'நிறுத்திய இடத்திலிருந்து தொடரவும்' : 'Continue where you left off',
    progressLabel: isTa ? 'KYC முன்னேற்றம்' : 'KYC progress',
  };

  return (
    <div className="min-h-screen bg-white relative overflow-hidden flex flex-col">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none">
        <div className="w-full h-full" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M10 10h10v10H10zM40 40h10v10H40zM70 70h10v10H70z' fill='%23315C9D' fill-opacity='0.5'/%3E%3C/svg%3E")`,
          backgroundRepeat: 'repeat'
        }}></div>
      </div>

      <TopBar showBack />

      <main className="flex-1 flex flex-col items-center justify-center px-6">
        <motion.div
          initial={{ y: 16, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.4 }}
          className="max-w-lg mx-auto w-full text-center"
        >
          <div className="w-16 h-16 rounded-full bg-[#315C9D]/10 flex items-center justify-center mx-auto mb-5">
            <ShieldCheck className="w-8 h-8 text-[#315C9D]" strokeWidth={2} aria-hidden="true" />
          </div>

          <h1 className="text-2xl font-black text-[#111827] tracking-tight leading-tight">{t.title}</h1>
          <p className="text-sm text-gray-600 leading-relaxed mt-2 mb-6 max-w-sm mx-auto">{t.body}</p>

          {/* Progress */}
          <div className="mb-6 text-left">
            <div className="flex items-center justify-between text-[11px] font-semibold text-[#6b7280] mb-1.5">
              <span>{t.progressLabel}</span>
              <span className="text-[#315C9D]">{percent}%</span>
            </div>
            <div
              className="w-full h-2 bg-[#315C9D]/10 rounded-full overflow-hidden"
              role="progressbar"
              aria-valuenow={percent}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label={`${t.progressLabel} ${percent}%`}
            >
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${percent}%` }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
                className="h-full bg-[#315C9D] rounded-full motion-reduce:transition-none"
              />
            </div>
          </div>

          {/* Resuming indicator */}
          <div className="flex items-center justify-center gap-2 text-[12px] font-medium text-[#6b7280] mb-6" aria-live="polite">
            <Loader2 className="w-4 h-4 animate-spin motion-reduce:animate-none" strokeWidth={2.5} aria-hidden="true" />
            {t.resuming}
          </div>

          <button
            onClick={() => navigate(RESUME_ROUTE)}
            className="w-full h-12 rounded-lg bg-[#315C9D] text-white font-semibold text-base flex items-center justify-center gap-2 active:scale-[0.99] transition-transform focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#315C9D]"
          >
            {t.cta}
            <ArrowRight className="w-5 h-5" strokeWidth={2.5} aria-hidden="true" />
          </button>
        </motion.div>
      </main>
    </div>
  );
}
