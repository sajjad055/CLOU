import { useEffect } from 'react';
import { useNavigate } from 'react-router';
import { motion } from 'motion/react';
import { ArrowRight } from 'lucide-react';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';
import successLottie from '@/assets/success.lottie';
import { TopBar } from './TopBar';
import { StickyFooter } from './StickyFooter';
import { useLanguage } from '../hooks/useLanguage';
import { markKycComplete } from '../state/salaryAdvance';

/**
 * End of the KYC/application half of the journey: the eligibility and offer
 * checks have already run upstream and the application is successful. Every flow
 * now lands here (the route the flow tables still call `/sanctioned-offers`).
 *
 * Picking and activating the actual advances happens in the second half, on the
 * home Salary Advance tab — so this screen marks KYC complete and its CTA hands
 * the user there.
 */
export function ApplicationSuccessPage() {
  const navigate = useNavigate();
  const [selectedLanguage] = useLanguage();

  // The application is through: KYC is complete from the home screen's view.
  useEffect(() => {
    markKycComplete();
  }, []);

  const content = {
    English: {
      title: 'Your salary advance application is successful',
      subtitle: 'Your KYC verification is complete.',
      cta: 'Go to home',
    },
    Tamil: {
      title: 'உங்கள் சம்பள முன்பண விண்ணப்பம் வெற்றிகரமானது',
      subtitle: 'உங்கள் KYC சரிபார்ப்பு முடிந்தது.',
      cta: 'முகப்புக்குச் செல்லவும்',
    },
  };

  const t = content[selectedLanguage];

  return (
    <div className="min-h-screen bg-white relative overflow-hidden flex flex-col">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none">
        <div className="w-full h-full" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M10 10h10v10H10zM40 40h10v10H40zM70 70h10v10H70z' fill='%23315C9D' fill-opacity='0.5'/%3E%3C/svg%3E")`,
          backgroundRepeat: 'repeat'
        }}></div>
      </div>

      <TopBar showBack={false} />

      <main className="flex-1 overflow-y-auto flex flex-col justify-center">
        <div className="max-w-lg mx-auto w-full relative px-6 pt-8 pb-32">
          {/* Success animation */}
          <div className="flex justify-center mb-2">
            <div className="w-24 h-24">
              <DotLottieReact src={successLottie} autoplay loop={false} style={{ width: '100%', height: '100%' }} />
            </div>
          </div>

          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-center"
          >
            <h1 className="text-xl font-black text-[#111827] tracking-tight leading-snug">{t.title}</h1>
            <p className="text-sm text-gray-600 leading-relaxed mt-2 max-w-sm mx-auto">{t.subtitle}</p>
          </motion.div>
        </div>
      </main>

      <StickyFooter>
        <button
          type="button"
          onClick={() => navigate('/')}
          className="w-full h-12 rounded-lg bg-[#315C9D] text-white font-semibold text-base flex items-center justify-center gap-2 active:scale-[0.99] transition-transform focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#315C9D]"
        >
          {t.cta}
          <ArrowRight className="w-5 h-5" strokeWidth={2.5} aria-hidden="true" />
        </button>
      </StickyFooter>
    </div>
  );
}
