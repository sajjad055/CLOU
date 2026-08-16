import { useId, useState } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { CheckCircle2, ChevronDown, Play } from 'lucide-react';
import { useLanguage } from '../hooks/useLanguage';
import festivalAdvanceImg from '@/assets/festival-vectorized.svg';
import gadgetAdvanceImg from '@/assets/gadget-vectorized.svg';

/**
 * The marketing/explainer sections of the salary-advance journey, extracted from
 * `LandingPage` so more than one screen can carry them.
 *
 * Renders exactly six sections, in this order: use cases, how it works (video),
 * what is this, how to avail, FAQs, support. Nothing else — no hero, no
 * illustration, no CTA, no page wrapper, no `TopBar`. The caller owns the page
 * shell and decides what sits above and below.
 *
 * Headings start at `h3` (as they did inline in `LandingPage`), so the host
 * screen keeps ownership of the single `h1`.
 *
 * Copy for these sections lives here rather than in the host screen, so both
 * `LandingPage` and `HRMSDetailsPage` read the same words from one place.
 */

const HERO_FONT = "'Manrope', sans-serif";

export function SalaryAdvanceInfoSections() {
  const [selectedLanguage] = useLanguage();
  const reduceMotion = useReducedMotion();
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  // Unique per mount, so two instances on one page never collide on panel ids.
  const faqIdBase = useId();

  const content = {
    English: {
      howItWorks: "How It Works",
      videoTitle: "Watch: Salary Advances on UPI",
      videoDuration: "2:30 minutes",
      useCasesTitle: "What Can You Use It For?",
      useCasesSubtitle: "Put your sanctioned advance to work for the moments that matter",
      useCases: [
        { image: festivalAdvanceImg, title: "Festivals & Celebrations", description: "Cover festival expenses — gifts, pujas, and family gatherings — without dipping into savings." },
        { image: gadgetAdvanceImg, title: "Gadgets & Electronics", description: "Buy a new phone, laptop, or household appliance with your salary advance." }
      ],
      whatIsThis: "What is This?",
      whatIsThisText: "This is the same salary advance that you availed from the State Government, now completely digitized and offering the convenience of UPI. Get instant access to your sanctioned advances through your favorite UPI apps.",
      howToAvail: "How to Avail?",
      steps: [
        "Enter your phone number",
        "Verify with OTP",
        "See the pre-sanctioned offers",
        "Choose one or all sanctioned offers",
        "Activate your credit line on UPI",
        "Connect credit line to UPI apps (PhonePe, Google Pay, Paytm, etc.)",
        "Scan any QR and pay using the UPI app"
      ],
      asSimple: "As simple as it gets!",
      faqs: "Frequently Asked Questions",
      faqList: [
        { question: "Do I have to pay back this money to IOB bank?", answer: "No, you don't pay back to IOB bank. The State Government of Tamil Nadu will deduct the amount directly from your salary after the grace period." },
        { question: "Is this credit line sponsored by State Government of Tamil Nadu?", answer: "Yes, this credit line is fully sponsored by the State Government of Tamil Nadu." },
        { question: "Can I use this money anywhere?", answer: "It depends on your sanctioned offer. If you're given a vehicle credit line, you can only use it to buy vehicles." },
        { question: "How will my money get deducted?", answer: "As soon as you avail this offer, after the grace period, the State Government will start deducting this money from your salary directly." },
        { question: "Can I use this on any UPI apps?", answer: "Yes, you can use this credit line on any UPI-enabled apps like PhonePe, Google Pay, Paytm, etc." },
        { question: "Will I get rewards on this transaction?", answer: "From time to time, IOB bank and NPCI will be launching offers on credit lines that can be leveraged for rewards." },
        { question: "What if I don't use this advance - will it lapse?", answer: "Yes, each offer comes with a validity period. If you don't use it within that time, the sanctioned offer will lapse." },
        { question: "Is there customer support available?", answer: "Yes, you can call the IOB customer support for any queries or assistance." }
      ],
      needHelp: "Need Help?",
      contactSupport: "Contact IOB Customer Support for any queries or assistance",
      contactSupportBtn: "Contact Support"
    },
    Tamil: {
      howItWorks: "இது எவ்வாறு செயல்படுகிறது",
      videoTitle: "பார்க்கவும்: யூபிஐயில் சம்பள முன்பணங்கள்",
      videoDuration: "2:30 நிமிடங்கள்",
      useCasesTitle: "எதற்கு பயன்படுத்தலாம்?",
      useCasesSubtitle: "உங்களுக்கு முக்கியமான தருணங்களுக்கு உங்கள் அனுமதிக்கப்பட்ட முன்பணத்தைப் பயன்படுத்துங்கள்",
      useCases: [
        { image: festivalAdvanceImg, title: "பண்டிகைகள் & கொண்டாட்டங்கள்", description: "பரிசுகள், பூஜைகள் மற்றும் குடும்ப கூட்டங்கள் போன்ற பண்டிகைச் செலவுகளை சேமிப்பைத் தொடாமல் சமாளியுங்கள்." },
        { image: gadgetAdvanceImg, title: "கேஜெட்கள் & மின்னணுவியல்", description: "உங்கள் சம்பள முன்பணத்துடன் புதிய போன், லேப்டாப் அல்லது வீட்டு உபகரணம் வாங்கலாம்." }
      ],
      whatIsThis: "இது என்ன?",
      whatIsThisText: "இது நீங்கள் மாநில அரசிடமிருந்து பெற்ற அதே சம்பள முன்பணம், இப்போது முழுமையாக டிஜிட்டல் மயமாக்கப்பட்டு யூபிஐ வசதியை வழங்குகிறது.",
      howToAvail: "எப்படி பயன்படுத்துவது?",
      steps: [
        "உங்கள் மொபைல் எண்ணை உள்ளிடவும்",
        "ஓடிபி மூலம் சரிபார்க்கவும்",
        "முன்-அனுமதிக்கப்பட்ட சலுகைகளைப் பார்க்கவும்",
        "ஒன்று அல்லது அனைத்து அனுமதிக்கப்பட்ட சலுகைகளையும் தேர்வு செய்யவும்",
        "யூபிஐயில் உங்கள் கடன் வரிசையை செயல்படுத்தவும்"
      ],
      asSimple: "மிகவும் எளிமையானது!",
      faqs: "அடிக்கடி கேட்கப்படும் கேள்விகள்",
      faqList: [
        { question: "நான் இந்த பணத்தை ஐஓபி வங்கிக்கு திருப்பி செலுத்த வேண்டுமா?", answer: "இல்லை, நீங்கள் ஐஓபி வங்கிக்கு திருப்பி செலுத்த வேண்டாம்." },
        { question: "இந்த கடன் வரிசை தமிழ்நாடு மாநில அரசால் வழங்கப்படுகிறதா?", answer: "ஆம், இந்த கடன் வரிசை தமிழ்நாடு மாநில அரசால் முழுமையாக வழங்கப்படுகிறது." }
      ],
      needHelp: "உதவி தேவையா?",
      contactSupport: "ஏதேனும் கேள்விகள் அல்லது உதவிக்கு ஐஓபி வாடிக்கையாளர் ஆதரவைத் தொடர்பு கொள்ளவும்",
      contactSupportBtn: "ஆதரவைத் தொடர்பு கொள்ளவும்"
    }
  };

  const t = content[selectedLanguage];

  /** Entrance animation, disabled outright when the user asks for reduced motion. */
  const enter = (delay: number) =>
    reduceMotion
      ? { initial: { opacity: 1 }, animate: { opacity: 1 } }
      : { initial: { y: 30, opacity: 0 }, animate: { y: 0, opacity: 1 }, transition: { delay } };

  return (
    <>
      {/* Divider */}
      <div className="w-full h-px bg-[#e5e7eb] my-8"></div>

      {/* Use cases */}
      <motion.section {...enter(0.85)} className="mb-10">
        <h3 style={{ fontFamily: HERO_FONT }} className="text-2xl font-bold text-[#111827] mb-1 tracking-tight leading-tight">{t.useCasesTitle}</h3>
        <p className="text-[#6b7280] text-sm leading-relaxed mb-5">{t.useCasesSubtitle}</p>
        <div className="grid grid-cols-1 gap-4">
          {t.useCases.map((useCase, index) => (
            <div key={index} className="bg-[#f9fafb] border border-[#e5e7eb] rounded-lg overflow-hidden flex flex-col">
              <div className="w-full h-40 bg-[#FDF6EC] flex items-center justify-center overflow-hidden p-4">
                <img src={useCase.image} alt={useCase.title} className="max-w-full max-h-full object-contain" />
              </div>
              <div className="p-4">
                <h4 style={{ fontFamily: HERO_FONT }} className="text-lg font-bold text-[#111827] mb-1 tracking-tight">{useCase.title}</h4>
                <p className="text-sm text-[#6b7280] leading-relaxed">{useCase.description}</p>
              </div>
            </div>
          ))}
        </div>
      </motion.section>

      {/* Divider */}
      <div className="w-full h-px bg-[#e5e7eb] my-8"></div>

      {/* Video */}
      <motion.section {...enter(0.9)} className="mb-10">
        <h3 className="text-lg font-semibold text-[#111827] mb-4">{t.howItWorks}</h3>
        <div className="bg-[#f9fafb] border border-[#e5e7eb] rounded-lg overflow-hidden">
          <div className="relative aspect-video bg-[#111827] flex items-center justify-center group cursor-pointer">
            <div className="w-16 h-16 rounded-full bg-white/95 flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg">
              <Play className="w-8 h-8 text-[#111827] ml-1" fill="#111827" />
            </div>
            <div className="absolute bottom-3 left-3 text-white">
              <p className="text-sm font-semibold">{t.videoTitle}</p>
              <p className="text-[12px] opacity-70">{t.videoDuration}</p>
            </div>
          </div>
        </div>
      </motion.section>

      {/* What is this */}
      <motion.section {...enter(1.1)} className="mb-10">
        <h3 className="text-lg font-semibold text-[#111827] mb-3">{t.whatIsThis}</h3>
        <div className="bg-[#f9fafb] border border-[#e5e7eb] rounded-lg p-5">
          <p className="text-sm text-[#6b7280] leading-relaxed">{t.whatIsThisText}</p>
        </div>
      </motion.section>

      {/* How to avail */}
      <motion.section {...enter(1.3)} className="mb-10">
        <h3 className="text-lg font-semibold text-[#111827] mb-4">{t.howToAvail}</h3>
        <div className="space-y-3">
          {t.steps.map((step, index) => (
            <div key={index} className="bg-[#f9fafb] border border-[#e5e7eb] rounded-lg p-4 flex items-start gap-3">
              <div className="flex-shrink-0 w-7 h-7 rounded-full bg-[#111827] flex items-center justify-center">
                <span className="text-[12px] font-bold text-white">{index + 1}</span>
              </div>
              <div className="flex-1 pt-0.5">
                <p className="text-sm text-[#6b7280] leading-relaxed">{step}</p>
              </div>
              <CheckCircle2 className="w-5 h-5 text-[#2da94f] flex-shrink-0 mt-0.5" strokeWidth={2} />
            </div>
          ))}
        </div>
        <p className="text-base font-semibold text-[#315C9D] text-center mt-5">{t.asSimple}</p>
      </motion.section>

      {/* FAQs */}
      <motion.section {...enter(1.5)} className="mb-10">
        <h3 className="text-lg font-semibold text-[#111827] mb-4">{t.faqs}</h3>
        <div className="space-y-2">
          {t.faqList.map((faq, index) => {
            const isOpen = openFaq === index;
            const panelId = `${faqIdBase}-faq-panel-${index}`;
            return (
              <div key={index} className="bg-[#f9fafb] border border-[#e5e7eb] rounded-lg overflow-hidden">
                <button type="button" onClick={() => setOpenFaq(isOpen ? null : index)}
                  aria-expanded={isOpen}
                  aria-controls={panelId}
                  className="w-full px-5 py-4 flex items-start justify-between gap-4 text-left focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#315C9D]">
                  <span className="text-sm font-semibold text-[#111827] flex-1 leading-snug">{faq.question}</span>
                  <ChevronDown className={`w-5 h-5 text-[#6b7280] flex-shrink-0 transition-transform mt-0.5 ${isOpen ? 'rotate-180' : ''}`} />
                </button>
                {isOpen && (
                  <div id={panelId} className="px-5 pb-4">
                    <p className="text-sm text-[#6b7280] leading-relaxed border-t border-[#e5e7eb] pt-3">{faq.answer}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </motion.section>

      {/* Support */}
      <motion.section {...enter(1.7)} className="mb-10">
        <div className="bg-[#111827] rounded-lg p-6 text-white text-center">
          <h3 className="text-base font-semibold mb-2">{t.needHelp}</h3>
          <p className="text-sm opacity-80 mb-5 leading-relaxed">{t.contactSupport}</p>
          <button type="button" className="bg-white text-[#111827] px-6 py-2.5 rounded-lg font-semibold text-sm hover:bg-[#f9fafb] transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white">
            {t.contactSupportBtn}
          </button>
        </div>
      </motion.section>
    </>
  );
}
