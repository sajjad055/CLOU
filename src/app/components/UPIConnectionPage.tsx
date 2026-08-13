import { useNavigate } from 'react-router';
import { motion, AnimatePresence } from 'motion/react';
import { useState, useEffect } from 'react';
import { Smartphone, Shield, CreditCard, Link2, CheckCircle, ChevronRight, Zap, Loader2 } from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { TopBar } from './TopBar';
import { StickyFooter } from './StickyFooter';
import { useLanguage } from '../hooks/useLanguage';

// Import UPI app logos
import paytmImg from '../../imports/image-16.png';
import googlePayImg from '../../imports/image-17.png';
import phonePeImg from '../../imports/image-15.png';

interface Step {
  id: number;
  title: string;
  titleTa: string;
  description: string;
  descriptionTa: string;
  icon: any;
}

const steps: Step[] = [
  {
    id: 1,
    title: 'Open your UPI App',
    titleTa: 'உங்கள் UPI பயன்பாட்டைத் திறக்கவும்',
    description: 'Open any UPI app like PhonePe, Google Pay, or Paytm.',
    descriptionTa: 'PhonePe, Google Pay அல்லது Paytm போன்ற UPI பயன்பாட்டைத் திறக்கவும்.',
    icon: Smartphone,
  },
  {
    id: 2,
    title: 'Navigate to Payment Settings',
    titleTa: 'பேமெண்ட் அமைப்புகளுக்குச் செல்லவும்',
    description: 'Open your profile and go to "Payment Settings".',
    descriptionTa: 'உங்கள் சுயவிவரத்தில் "பேமெண்ட் அமைப்புகள்" திறக்கவும்.',
    icon: CreditCard,
  },
  {
    id: 3,
    title: 'Select Credit Line on UPI',
    titleTa: 'UPI இல் கடன் வரியைத் தேர்ந்தெடுக்கவும்',
    description: 'Tap the "Credit Line on UPI" option.',
    descriptionTa: '"UPI இல் கடன் வரி" என்பதைத் தட்டவும்.',
    icon: CreditCard,
  },
  {
    id: 4,
    title: 'Add New Credit Line',
    titleTa: 'புதிய கடன் வரியைச் சேர்க்கவும்',
    description: 'Tap "Add New Credit Line" or the "+" button.',
    descriptionTa: '"புதிய கடன் வரி" அல்லது "+" பொத்தானைத் தட்டவும்.',
    icon: Link2,
  },
  {
    id: 5,
    title: 'Select Indian Overseas Bank',
    titleTa: 'இந்தியன் ஓவர்சீஸ் வங்கியைத் தேர்ந்தெடுக்கவும்',
    description: 'Select "Indian Overseas Bank (IOB)". Your credit lines appear automatically.',
    descriptionTa: '"இந்தியன் ஓவர்சீஸ் வங்கி (IOB)" தேர்ந்தெடுக்கவும். கடன் வரிகள் தானாகத் தோன்றும்.',
    icon: Shield,
  },
  {
    id: 6,
    title: 'Select & Create VPA',
    titleTa: 'தேர்ந்தெடுத்து VPA உருவாக்கவும்',
    description: 'Select your loan accounts and create a VPA to start paying.',
    descriptionTa: 'உங்கள் கடன் கணக்குகளைத் தேர்ந்தெடுத்து VPA உருவாக்கவும்.',
    icon: CheckCircle,
  },
  {
    id: 7,
    title: 'Scan & Pay with Loan Account',
    titleTa: 'கடன் கணக்கு மூலம் ஸ்கேன் செய்து செலுத்தவும்',
    description: 'Scan any QR code and pay, choosing the right loan account.',
    descriptionTa: 'எந்த QR குறியீட்டையும் ஸ்கேன் செய்து, சரியான கடன் கணக்கில் செலுத்தவும்.',
    icon: Zap,
  }
];

const upiApps = [
  {
    name: 'PhonePe',
    shortName: 'PPe',
    logo: phonePeImg,
  },
  {
    name: 'Paytm',
    shortName: 'PTM',
    logo: paytmImg,
  },
  {
    name: 'Google Pay',
    shortName: 'GPay',
    logo: googlePayImg,
  }
];

export function UPIConnectionPage() {
  const navigate = useNavigate();
  const [selectedLanguage] = useLanguage();

  const content = {
    English: {
      title: 'Connect to UPI apps and start spending',
      subtitle: 'Follow these simple visual steps to link your credit lines',
      stepsHeading: 'Follow these steps to connect to your UPI',
      linkOpenBtn: 'Open UPI Apps',
      sheetTitle: 'Open with',
      worksWithAll: 'Works with all major UPI apps',
      stepLabel: 'Step',
      of: 'of',
      nextBtn: 'Next Step',
      prevBtn: 'Previous',
      doneBtn: 'Go to Home',
      swipeHint: 'Swipe to navigate',
      openAppLabel: 'Quick Links - Open in:',
      openPhonePe: 'Open PhonePe',
      openGooglePay: 'Open Google Pay',
      openPaytm: 'Open Paytm'
    },
    Tamil: {
      title: 'UPI பயன்பாடுகளுடன் இணைத்து செலவிடத் தொடங்குங்கள்',
      subtitle: 'உங்கள் கடன் வரிகளை இணைக்க இந்த எளிய காட்சி படிகளைப் பின்பற்றவும்',
      stepsHeading: 'உங்கள் UPI உடன் இணைக்க இந்த படிகளைப் பின்பற்றவும்',
      linkOpenBtn: 'UPI பயன்பாடுகளைத் திறக்கவும்',
      sheetTitle: 'இதன் மூலம் திறக்கவும்',
      worksWithAll: 'அனைத்து முக்கிய UPI பயன்பாடுகளுடன் செயல்படும்',
      stepLabel: 'படி',
      of: 'இல்',
      nextBtn: 'அடுத்த படி',
      prevBtn: 'முந்தைய',
      doneBtn: 'முகப்புக்குச் செல்லவும்',
      swipeHint: 'வழிசெலுத்த ஸ்வைப் செய்யவும்',
      openAppLabel: 'விரைவு இணைப்புகள் - இதில் திறக்கவும்:',
      openPhonePe: 'PhonePe திறக்கவும்',
      openGooglePay: 'Google Pay திறக்கவும்',
      openPaytm: 'Paytm திறக்கவும்'
    }
  };

  const t = content[selectedLanguage];

  // Intro sequence: header sits centered on load, then rises and steps reveal
  const [phase, setPhase] = useState<'intro' | 'done'>('intro');

  useEffect(() => {
    const timer = setTimeout(() => setPhase('done'), 1000);
    return () => clearTimeout(timer);
  }, []);

  // App chooser bottom sheet
  const [showSheet, setShowSheet] = useState(false);
  const [launching, setLaunching] = useState(false);

  useEffect(() => {
    if (!showSheet) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setShowSheet(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [showSheet]);

  const handleDone = () => {
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-white relative overflow-hidden flex flex-col pb-24">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none">
        <div className="w-full h-full" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M10 10h10v10H10zM40 40h10v10H40zM70 70h10v10H70z' fill='%23315C9D' fill-opacity='0.5'/%3E%3C/svg%3E")`,
          backgroundRepeat: 'repeat'
        }}></div>
      </div>

      {/* Header */}
      <TopBar showBack />

      {/* Main Content */}
      <main className={`flex-1 overflow-y-auto flex flex-col ${phase === 'intro' ? 'justify-center' : ''}`}>
        <div className="max-w-lg mx-auto w-full relative px-6 pt-6 pb-32">
          {/* Header cluster — centered on load, rises when steps reveal */}
          <motion.div layout transition={{ duration: 0.6, ease: 'easeInOut' }}>
          {/* UPI Apps Logos */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="mb-3"
          >
            <div className="flex justify-center items-center -space-x-2">
              {upiApps.map((app, index) => (
                <motion.div
                  key={app.name}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2 + index * 0.1, type: 'spring', stiffness: 200 }}
                  className="w-[35px] h-[35px] rounded-full bg-white shadow-md ring-2 ring-white flex items-center justify-center overflow-hidden p-1"
                  style={{ zIndex: upiApps.length - index }}
                >
                  <ImageWithFallback 
                    src={app.logo} 
                    alt={app.name}
                    className="w-full h-full object-contain"
                  />
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Title Section */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="text-center mb-6"
          >
            <h1 className="text-xl font-black text-[#111827] tracking-tight">
              {t.title}
            </h1>
          </motion.div>
          </motion.div>

          {phase === 'done' && (
          <>
          {/* Steps Heading */}
          <div className="flex items-center justify-center gap-2 mb-5">
            <span aria-hidden="true" className="w-5 h-px bg-gradient-to-l from-gray-300 to-transparent flex-shrink-0" />
            <p className="text-[12px] font-semibold text-[#6b7280] text-center">
              {t.stepsHeading}
            </p>
            <span aria-hidden="true" className="w-5 h-px bg-gradient-to-r from-gray-300 to-transparent flex-shrink-0" />
          </div>

          {/* Vertical Progressive Stepper */}
          <div className="mb-6 bg-white rounded-2xl border border-gray-200 p-5">
            {steps.map((step, index) => {
              const isLast = index === steps.length - 1;
              return (
                <motion.div
                  key={step.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.35, delay: 0.35 + index * 0.12 }}
                  className="relative flex gap-4 pb-6 last:pb-0"
                >
                  {/* Connector line */}
                  {!isLast && (
                    <span
                      aria-hidden="true"
                      className="absolute left-4 top-8 bottom-0 w-px bg-gray-200"
                    />
                  )}

                  {/* Step number */}
                  <div className="relative z-10 flex-shrink-0 w-8 h-8 rounded-full bg-[#2da94f] text-white flex items-center justify-center text-sm font-bold">
                    {step.id}
                  </div>

                  {/* Step content */}
                  <div className="flex-1 min-w-0 pt-1">
                    <h3 className="text-sm font-bold text-[#111827] leading-snug mb-1">
                      {selectedLanguage === 'English' ? step.title : step.titleTa}
                    </h3>
                    <p className="text-[12px] text-gray-600 leading-relaxed">
                      {selectedLanguage === 'English' ? step.description : step.descriptionTa}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </div>

          </>
          )}
        </div>
      </main>

      {phase === 'done' && (
        <StickyFooter>
          {/* Primary CTA — opens app chooser */}
          <motion.button
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.15 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setShowSheet(true)}
            className="w-full h-12 rounded-lg bg-[#315C9D] text-white font-semibold text-base flex items-center justify-center gap-3 transition-colors"
          >
            <span className="flex items-center -space-x-2">
              {upiApps.map((app, index) => (
                <span
                  key={app.name}
                  className="w-6 h-6 rounded-full bg-white ring-2 ring-[#315C9D] flex items-center justify-center overflow-hidden p-0.5"
                  style={{ zIndex: upiApps.length - index }}
                >
                  <ImageWithFallback src={app.logo} alt="" className="w-full h-full object-contain" />
                </span>
              ))}
            </span>
            {t.linkOpenBtn}
          </motion.button>

          {/* Secondary CTA — go home */}
          <motion.button
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.25 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleDone}
            className="w-full h-12 rounded-lg bg-transparent text-[#315C9D] font-semibold text-base flex items-center justify-center gap-2 mt-2 hover:bg-[#315C9D]/5 transition-colors"
          >
            {t.doneBtn}
          </motion.button>
        </StickyFooter>
      )}

      {/* App chooser bottom sheet */}
      <AnimatePresence>
        {showSheet && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowSheet(false)}
              className="fixed inset-0 bg-black/40 z-[60]"
            />
            <motion.div
              role="dialog"
              aria-modal="true"
              aria-label={t.sheetTitle}
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="fixed left-0 right-0 bottom-0 z-[70] bg-white rounded-t-2xl px-5 pt-3 pb-8 max-w-lg mx-auto"
            >
              <div className="w-10 h-1 rounded-full bg-gray-300 mx-auto mb-4" />
              <p className="text-sm font-bold text-[#111827] mb-4">{t.sheetTitle}</p>
              <div className="space-y-2">
                {/* PhonePe */}
                <button
                  onClick={() => {
                    setShowSheet(false);
                    setLaunching(true);
                    setTimeout(() => navigate('/phonepe-app-mock'), 1200);
                  }}
                  className="w-full flex items-center gap-3 p-3 rounded-xl border border-gray-200 hover:bg-gray-50 transition-colors active:scale-[0.99]"
                >
                  <div className="w-11 h-11 rounded-xl bg-white border border-gray-100 flex items-center justify-center p-1.5 flex-shrink-0">
                    <ImageWithFallback src={phonePeImg} alt="PhonePe" className="w-full h-full object-contain" />
                  </div>
                  <span className="flex-1 text-left text-sm font-semibold text-[#111827]">PhonePe</span>
                  <ChevronRight className="w-5 h-5 text-gray-400" />
                </button>

                {/* Paytm */}
                <a
                  href="paytmmp://"
                  onClick={() => setShowSheet(false)}
                  className="w-full flex items-center gap-3 p-3 rounded-xl border border-gray-200 hover:bg-gray-50 transition-colors active:scale-[0.99]"
                >
                  <div className="w-11 h-11 rounded-xl bg-white border border-gray-100 flex items-center justify-center p-1.5 flex-shrink-0">
                    <ImageWithFallback src={paytmImg} alt="Paytm" className="w-full h-full object-contain" />
                  </div>
                  <span className="flex-1 text-left text-sm font-semibold text-[#111827]">Paytm</span>
                  <ChevronRight className="w-5 h-5 text-gray-400" />
                </a>

                {/* Google Pay */}
                <a
                  href="gpay://"
                  onClick={() => setShowSheet(false)}
                  className="w-full flex items-center gap-3 p-3 rounded-xl border border-gray-200 hover:bg-gray-50 transition-colors active:scale-[0.99]"
                >
                  <div className="w-11 h-11 rounded-xl bg-white border border-gray-100 flex items-center justify-center p-1.5 flex-shrink-0">
                    <ImageWithFallback src={googlePayImg} alt="Google Pay" className="w-full h-full object-contain" />
                  </div>
                  <span className="flex-1 text-left text-sm font-semibold text-[#111827]">Google Pay</span>
                  <ChevronRight className="w-5 h-5 text-gray-400" />
                </a>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* App-switch splash — mimics opening the PhonePe app */}
      <AnimatePresence>
        {launching && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-0 z-[100] bg-[#5f259f] flex flex-col items-center justify-center"
          >
            <motion.div
              initial={{ scale: 0.6, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 200, damping: 18 }}
              className="w-20 h-20 rounded-3xl bg-white flex items-center justify-center p-3 shadow-2xl"
            >
              <ImageWithFallback src={phonePeImg} alt="PhonePe" className="w-full h-full object-contain" />
            </motion.div>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.25 }}
              className="mt-6 flex items-center gap-2 text-white/90"
            >
              <Loader2 className="w-4 h-4 animate-spin" strokeWidth={2.5} />
              <span className="text-sm font-medium">Opening PhonePe…</span>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}