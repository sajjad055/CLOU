import { useNavigate } from 'react-router';
import { motion } from 'motion/react';
import { ArrowRight, Zap, ShieldCheck } from 'lucide-react';
import { TopBar } from './TopBar';
import { SalaryAdvanceInfoSections } from './SalaryAdvanceInfoSections';
import { useLanguage } from '../hooks/useLanguage';
import { getActiveFlow, hrmsEntryRoute } from '../flows/hrmsFlows';
import salaryAdvanceImg from '@/assets/phone-upi-hero.png';
import iobLogo from '@/assets/iob.svg';
import upiLogo from '@/assets/upi.svg';

const HERO_FONT = "'Manrope', sans-serif";

export function LandingPage() {
  const navigate = useNavigate();
  const [selectedLanguage] = useLanguage();

  // Hero copy only. The six explainer sections below the hero own their own
  // bilingual copy inside `SalaryAdvanceInfoSections`.
  const content = {
    English: {
      title: "Salary Advances Now On UPI",
      subtitle: "Your salary advances, credited instantly to any UPI app.\nSpend on what matters — no paperwork, no waiting.",
      cta: "Get Started",
      bank: "Indian Overseas Bank",
      bankingPartner: "Powered by",
      badges: { instant: "Get credit instantly", secure: "Safe and Secure" }
    },
    Tamil: {
      title: "யூபிஐ மூலம் சம்பள முன்பணம்",
      subtitle: "உங்கள் சம்பள முன்பணங்கள், எந்த UPI பயன்பாட்டிலும் உடனடியாக வரவு.\nகாகிதப்பணி இல்லை, காத்திருப்பு இல்லை.",
      cta: "இப்போது தொடங்குங்கள்",
      bank: "இந்தியன் ஓவர்சீஸ் வங்கி",
      bankingPartner: "வழங்குபவர்",
      badges: { instant: "உடனடி கடன்", secure: "பாதுகாப்பானது" }
    }
  };

  const t = content[selectedLanguage];

  return (
    <div className="min-h-screen bg-white flex flex-col pb-24">
      {/* Header */}
      <TopBar showBack showGovtLogo />

      <main className="max-w-lg mx-auto w-full px-4">
        {/* Hero */}
        <div className="flex flex-col items-center pt-10 pb-6">
          <motion.div initial={{ y: 30, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.6, delay: 0.1 }} className="text-center mb-8">
            <h1 style={{ fontFamily: HERO_FONT }} className="text-3xl font-extrabold text-[#111827] mb-1 leading-tight tracking-tight">{t.title}</h1>
            <p className="text-[#6b7280] text-sm leading-relaxed whitespace-pre-line">{t.subtitle}</p>
          </motion.div>

          {/* Hero image */}
          <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 0.5, delay: 0.3 }} className="-mt-6 mb-8 w-full">
            <img src={salaryAdvanceImg} alt={t.title} className="w-full max-w-[256px] mx-auto h-auto object-contain scale-[1.2] py-7" />
          </motion.div>

          {/* Banking Partner */}
          <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.5 }} className="text-center -mt-6 mb-8">
            <p className="text-[10px] font-normal text-[#9e9e9e] tracking-wider mb-3">{t.bankingPartner}</p>
            <div className="flex items-center justify-center gap-4">
              <img src={iobLogo} alt={t.bank} className="h-[29px] w-auto object-contain" />
              <div className="w-px h-6 bg-[#e5e7eb]"></div>
              <img src={upiLogo} alt="UPI" className="h-[22px] w-auto object-contain" />
            </div>
          </motion.div>

          {/* CTA */}
          <motion.button
            initial={{ y: 30, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.7 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate(hrmsEntryRoute(getActiveFlow()) ?? '/phone-input')}
            className="w-full bg-[#315C9D] text-white h-12 rounded-lg text-base font-semibold flex items-center justify-center gap-2"
          >
            {t.cta}
            <ArrowRight className="w-5 h-5" strokeWidth={2.5} />
          </motion.button>

          {/* Badges */}
          <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.9 }} className="flex gap-6 mt-3">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-[#6b7280]" strokeWidth={2.5} />
              <span className="text-[12px] font-semibold text-[#6b7280]">{t.badges.instant}</span>
            </div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-[#6b7280]" strokeWidth={2.5} />
              <span className="text-[12px] font-semibold text-[#6b7280]">{t.badges.secure}</span>
            </div>
          </motion.div>
        </div>

        {/* Use cases, how it works, what is this, how to avail, FAQs, support */}
        <SalaryAdvanceInfoSections />
      </main>
    </div>
  );
}
