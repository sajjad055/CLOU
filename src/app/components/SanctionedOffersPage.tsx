import { useNavigate } from 'react-router';
import { motion } from 'motion/react';
import { Sparkles, Check } from 'lucide-react';
import { Confetti, Laptop } from '@phosphor-icons/react';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';
import { useState, useMemo } from 'react';
import successLottie from '@/assets/success.lottie';
import festivalAdvanceImg from '@/assets/festival-vectorized.svg';
import gadgetAdvanceImg from '@/assets/gadget-vectorized.svg';
import { TopBar } from './TopBar';
import { StickyFooter } from './StickyFooter';
import { BottomSheet } from './BottomSheet';
import { useLanguage } from '../hooks/useLanguage';

interface CreditLine {
  id: string;
  nameEn: string;
  nameTa: string;
  amount: string;
  icon?: any;
  image?: string;
  imageClass?: string;
  iconBg: string;
  iconColor: string;
}

const allCreditLines: CreditLine[] = [
  {
    id: 'festival',
    nameEn: 'Festival Advance',
    nameTa: 'பண்டிகை முன்பணம்',
    amount: '₹50,000',
    icon: Confetti,
    image: festivalAdvanceImg,
    imageClass: 'h-[110px] translate-y-[8px]',
    iconBg: '#FEF3C7',
    iconColor: '#B45309'
  },
  {
    id: 'gadget',
    nameEn: 'Gadget Purchase Advance',
    nameTa: 'கேஜெட் கொள்முதல் முன்பணம்',
    amount: '₹75,000',
    icon: Laptop,
    image: gadgetAdvanceImg,
    imageClass: 'h-[110px] translate-y-[8px]',
    iconBg: '#CFFAFE',
    iconColor: '#0E7490'
  }
];

export function SanctionedOffersPage() {
  const navigate = useNavigate();
  const [selectedLanguage] = useLanguage();
  const [selectedOffers, setSelectedOffers] = useState<string[]>([]);
  const [showTermsSheet, setShowTermsSheet] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  // Calculate validity date (2 months from today)
  const getValidityDate = () => {
    const today = new Date();
    const validUntil = new Date(today.setMonth(today.getMonth() + 2));
    const day = validUntil.getDate();
    const month = validUntil.toLocaleString('en-US', { month: 'short' });
    const year = validUntil.getFullYear();
    return `${day} ${month} ${year}`;
  };

  const validityDate = getValidityDate();

  // Fixed set of offers — ALWAYS only these two, in this order (Four Wheeler + Education).
  const availableOffers = useMemo(() => {
    const allowedIds = ['festival', 'gadget'];
    return allowedIds
      .map((id) => allCreditLines.find((o) => o.id === id))
      .filter((o): o is CreditLine => Boolean(o));
  }, []);

  const content = {
    English: {
      title: 'You are eligible for the below salary advances',
      subtitle: 'Select all the salary advances you need',
      selectAll: 'Select All',
      deselectAll: 'Deselect All',
      activateBtn: 'Activate Selected',
      selectBtn: 'Select Offers to Activate',
      selectedCount: 'selected',
      totalCredit: 'Total Credit Available',
      validUntil: `Valid until 31st May 2026`,
      termsDeclaration: 'I agree to the terms and conditions for activating my selected credit lines.',
      readMore: 'Read more'
    },
    Tamil: {
      title: 'நீங்கள் கீழே உள்ள சம்பள முன்பணங்களுக்கு தகுதியுடையவர்',
      subtitle: 'உங்களுக்குத் தேவையான சம்பள முன்பணங்களைத் தேர்ந்தெடுக்கவும்',
      selectAll: 'அனைத்தையும் தேர்ந்தெடு',
      deselectAll: 'அனைத்தையும் நீக்கு',
      activateBtn: 'செயல்படுத்து',
      selectBtn: 'தேர்ந்தெடு',
      selectedCount: 'தேர்ந்தெடுக்கப்பட்டது',
      totalCredit: 'மொத்த கடன் கிடைக்கும்',
      validUntil: `31 மே 2026 வரை செல்லுபடியாகும்`,
      termsDeclaration: 'எனது தேர்ந்தெடுக்கப்பட்ட கடன் வரிசைகளை செயல்படுத்துவதற்கான விதிமுறைகள் மற்றும் நிபந்தனைகளை நான் ஏற்கிறேன்.',
      readMore: 'மேலும் படிக்க'
    }
  };

  const t = content[selectedLanguage];

  const toggleOffer = (offerId: string) => {
    setSelectedOffers(prev => 
      prev.includes(offerId) 
        ? prev.filter(id => id !== offerId)
        : [...prev, offerId]
    );
  };

  const selectAll = () => {
    setSelectedOffers(availableOffers.map(offer => offer.id));
  };

  const deselectAll = () => {
    setSelectedOffers([]);
  };

  const canActivate = selectedOffers.length > 0 && agreedToTerms;

  const handleActivate = () => {
    if (!canActivate) return;
    // Navigate to processing page with only the IDs (not the full objects with React components)
    navigate('/credit-line-processing', {
      state: {
        selectedOffers: selectedOffers // Only pass the IDs array
      }
    });
  };

  const calculateTotalCredit = () => {
    return availableOffers
      .filter(offer => selectedOffers.includes(offer.id))
      .reduce((sum, offer) => {
        const amount = parseInt(offer.amount.replace(/[₹,]/g, ''));
        return sum + amount;
      }, 0);
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

      {/* Header */}
      <TopBar showBack={false} />

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-lg mx-auto relative px-6 pt-6 pb-44">
          {/* Title Section */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="text-center mb-5"
          >
            <div className="flex justify-center mb-2">
              <div className="w-16 h-16">
                <DotLottieReact src={successLottie} autoplay loop={false} style={{ width: '100%', height: '100%' }} />
              </div>
            </div>
            <h1 className="text-xl font-black text-[#111827] tracking-tight leading-tight">
              {t.title}
            </h1>
          </motion.div>

          {/* Decorative instruction heading */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="flex items-center justify-center gap-2 mb-5"
          >
            <span className="w-5 h-px bg-gradient-to-l from-[#315C9D]/40 to-transparent flex-shrink-0"></span>
            <Sparkles className="w-3.5 h-3.5 text-[#315C9D] flex-shrink-0" fill="#315C9D" />
            <p className="text-[12px] font-semibold text-[#6b7280] text-center max-w-[240px] leading-snug">
              {t.subtitle}
            </p>
            <Sparkles className="w-3.5 h-3.5 text-[#315C9D] flex-shrink-0" fill="#315C9D" />
            <span className="w-5 h-px bg-gradient-to-r from-[#315C9D]/40 to-transparent flex-shrink-0"></span>
          </motion.div>

          {/* Credit Lines List */}
          <div className="space-y-3 mb-6">
            {availableOffers.map((offer, index) => {
              const isSelected = selectedOffers.includes(offer.id);
              const IconComponent = offer.icon;
              
              return (
                <motion.button
                  key={offer.id}
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ duration: 0.4, delay: 0.2 + (index * 0.05) }}
                  onClick={() => toggleOffer(offer.id)}
                  className={`relative w-full h-[110px] rounded-xl border overflow-hidden transition-all text-left ${
                    isSelected
                      ? 'border-[#315C9D] bg-white shadow-md'
                      : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm'
                  }`}
                >
                  {/* Illustration — absolutely positioned, touching the bottom of the card */}
                  {offer.image ? (
                    <img
                      src={offer.image}
                      alt=""
                      className={`pointer-events-none select-none absolute bottom-0 right-4 w-auto object-contain object-bottom ${offer.imageClass ?? 'h-[100px]'}`}
                    />
                  ) : (
                    IconComponent && (
                      <div className="pointer-events-none absolute bottom-3 right-5">
                        <IconComponent size={64} weight="duotone" color={offer.iconColor} />
                      </div>
                    )
                  )}

                  {/* Left content */}
                  <div className="relative z-10 h-full min-w-0 max-w-[58%] flex flex-col justify-between p-3">
                    <h3 className="text-[12px] font-semibold text-gray-900 leading-tight pr-6">
                      {selectedLanguage === 'English' ? offer.nameEn : offer.nameTa}
                    </h3>
                    <div>
                      <p className="text-xl font-black text-[#111827] leading-none mb-1">
                        {offer.amount}
                      </p>
                      <p className="text-xs text-gray-500">
                        {t.validUntil}
                      </p>
                    </div>
                  </div>

                  {/* Checkbox — top-right corner (Material style) */}
                  <div className="absolute top-3 right-3 z-20">
                    {isSelected ? (
                      <motion.div
                        initial={{ scale: 0.6, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ type: "spring", stiffness: 400, damping: 20 }}
                        className="w-5 h-5 rounded-[5px] bg-[#315C9D] flex items-center justify-center shadow-sm"
                      >
                        <Check className="w-3.5 h-3.5 text-white" strokeWidth={3} />
                      </motion.div>
                    ) : (
                      <div className="w-5 h-5 rounded-[5px] border-2 border-gray-300 bg-white/80"></div>
                    )}
                  </div>
                </motion.button>
              );
            })}
          </div>

          {/* Total Credit Summary */}
          {selectedOffers.length > 0 && (
            null
          )}

        </div>
      </main>

      <StickyFooter>
        {/* Terms taken inline, with the full text behind "Read more". The button
            wraps only the box so the link can run in the same text flow. */}
        <div className="flex items-start gap-3 mb-3">
          <button
            type="button"
            role="checkbox"
            aria-checked={agreedToTerms}
            aria-labelledby="offers-terms-label"
            onClick={() => setAgreedToTerms(!agreedToTerms)}
            className="flex-shrink-0 mt-0.5 p-0.5 rounded-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#315C9D]"
          >
            <span
              className={`flex w-5 h-5 rounded-[5px] border items-center justify-center transition-colors ${
                agreedToTerms ? 'bg-[#315C9D] border-[#315C9D]' : 'bg-white border-[#c4c4c4]'
              }`}
            >
              {agreedToTerms && <Check className="w-3.5 h-3.5 text-white" strokeWidth={3} aria-hidden="true" />}
            </span>
          </button>

          <p className="text-[12px] text-[#6b7280] leading-relaxed">
            <span id="offers-terms-label">{t.termsDeclaration}</span>{' '}
            <button
              type="button"
              onClick={() => setShowTermsSheet(true)}
              className="text-[12px] font-semibold text-[#315C9D] underline underline-offset-2 rounded-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#315C9D]"
            >
              {t.readMore}
            </button>
          </p>
        </div>

        <motion.button
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: canActivate ? 1 : 0.4 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          whileTap={{ scale: canActivate ? 0.98 : 1 }}
          onClick={handleActivate}
          disabled={!canActivate}
          className="w-full h-12 rounded-lg bg-[#315C9D] text-white font-semibold text-base flex items-center justify-center gap-2 disabled:cursor-not-allowed transition-opacity"
        >
          {selectedOffers.length > 0 ? t.activateBtn : t.selectBtn}
        </motion.button>
      </StickyFooter>

      {/* Terms sheet — read-only. Acceptance is taken by the checkbox above. */}
      <BottomSheet
        open={showTermsSheet}
        onClose={() => setShowTermsSheet(false)}
        title="Terms & Conditions"
        closeLabel={selectedLanguage === 'English' ? 'Close' : 'மூடு'}
        footer={
          <button
            type="button"
            onClick={() => setShowTermsSheet(false)}
            className="w-full h-12 rounded-lg bg-[#315C9D] text-white font-semibold text-base flex items-center justify-center active:scale-[0.98] transition-transform focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#315C9D]"
          >
            {selectedLanguage === 'English' ? 'Close' : 'மூடு'}
          </button>
        }
      >
        <p className="text-sm text-gray-700 leading-relaxed">
          I consent and authorize <span className="font-bold text-[#315C9D]">Indian Overseas Bank (IOB)</span> to create and manage the selected credit line(s) on behalf of the <span className="font-bold text-[#315C9D]">Government of Tamil Nadu</span>.
        </p>
      </BottomSheet>
    </div>
  );
}