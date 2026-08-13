import { useNavigate, useLocation } from 'react-router';
import { motion } from 'motion/react';
import { PartyPopper, Laptop, Info, Copy, Check, User, Hash } from 'lucide-react';
import { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';
import { TopBar } from './TopBar';
import { StickyFooter } from './StickyFooter';
import { useLanguage } from '../hooks/useLanguage';
import successLottie from '@/assets/success.lottie';
import festivalAdvanceImg from '@/assets/festival-vectorized.svg';
import gadgetAdvanceImg from '@/assets/gadget-vectorized.svg';

interface CreditLine {
  id: string;
  nameEn: string;
  nameTa: string;
  amount: string;
  icon: any;
  image?: string;
  imageClass?: string;
  accountPrefix: string;
  accountNumber: string;
}

const creditLineMap: Record<string, Omit<CreditLine, 'accountNumber'>> = {
  'festival': {
    id: 'festival',
    nameEn: 'Festival Advance',
    nameTa: 'பண்டிகை முன்பணம்',
    amount: '₹50,000',
    icon: PartyPopper,
    image: festivalAdvanceImg,
    imageClass: 'h-[100px] translate-y-[8px]',
    accountPrefix: 'festival'
  },
  'gadget': {
    id: 'gadget',
    nameEn: 'Gadget Purchase Advance',
    nameTa: 'கேஜெட் கொள்முதல் முன்பணம்',
    amount: '₹75,000',
    icon: Laptop,
    image: gadgetAdvanceImg,
    imageClass: 'h-[100px] translate-y-[8px]',
    accountPrefix: 'gadget'
  }
};

// Usage restrictions for each credit line type
const usageRestrictions: Record<string, Record<string, string>> = {
  English: {
    'festival': 'This credit line can be used for festival-related purchases at any merchant.',
    'gadget': 'This credit line can be used at authorized electronics, mobile, and computer stores.'
  },
  Tamil: {
    'festival': 'இந்த கடன் வரியை எந்த வணிகரிடமும் பண்டிகை தொடர்பான கொள்முதலுக்கு பயன்படுத்தலாம்.',
    'gadget': 'இந்த கடன் வரியை அங்கீகரிக்கப்பட்ட மின்னணு, மொபைல் மற்றும் கணினி கடைகளில் பயன்படுத்தலாம்.'
  }
};

const iconMap: Record<string, any> = {
  'festival': PartyPopper,
  'gadget': Laptop
};

export function CreditLineActivatedPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const activatedOfferIds = (location.state?.activatedOfferIds || []) as string[];
  const [selectedLanguage] = useLanguage();
  
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Customer name + CIF number created during this application (shared, dummy).
  const customerName = 'Aravind Kumar S.';
  const [cifNumber] = useState(() => {
    const existing = typeof window !== 'undefined' ? localStorage.getItem('cifNumber') : null;
    if (existing) return existing;
    const generated = `CIF-TN-${Math.floor(100000 + Math.random() * 900000)}`;
    if (typeof window !== 'undefined') localStorage.setItem('cifNumber', generated);
    return generated;
  });

  // Reconstruct credit line objects from IDs
  const creditLinesWithAccounts = activatedOfferIds
    .map(id => creditLineMap[id])
    .filter(Boolean)
    .map(creditLine => ({
      ...creditLine,
      accountNumber: `${creditLine.accountPrefix}${Math.floor(Math.random() * 10000000000)}`
    }));

  // Save activated credit lines to localStorage for PhonePe mock
  useEffect(() => {
    if (creditLinesWithAccounts.length > 0) {
      localStorage.setItem('activatedCreditLines', JSON.stringify(creditLinesWithAccounts));
    }
  }, [creditLinesWithAccounts]);

  const content = {
    English: {
      title: 'Congratulations!',
      subtitle: 'Your Credit Lines Are Now Active',
      description: 'Use these credit lines across any UPI apps',
      accountLabel: 'Loan Account Number',
      copyBtn: 'Copy',
      copiedBtn: 'Copied!',
      ctaBtn: 'Connect to Your UPI Apps',
      amount: 'Credit Limit',
      usageTitle: 'Where you can use this',
      customerLabel: 'Customer Name',
      cifLabel: 'CIF Number'
    },
    Tamil: {
      title: 'வாழ்த்துக்கள்!',
      subtitle: 'உங்கள் கடன் வரிசைகள் இப்போது செயலில் உள்ளன',
      description: 'இந்த கடன் வரிசைகளை எந்த UPI பயன்பாடுகளிலும் பயன்படுத்தவும்',
      accountLabel: 'கடன் கணக்கு எண்',
      copyBtn: 'நகல்',
      copiedBtn: 'நகலெடுக்கப்பட்டது!',
      ctaBtn: 'உங்கள் UPI பயன்பாடுகளுடன் இணைக்கவும்',
      amount: 'கடன் வரம்பு',
      usageTitle: 'இதை எங்கு பயன்படுத்தலாம்',
      customerLabel: 'வாடிக்கையாளர் பெயர்',
      cifLabel: 'CIF எண்'
    }
  };

  const t = content[selectedLanguage];

  // Confetti effect on mount
  useEffect(() => {
    if (activatedOfferIds.length === 0) {
      navigate('/sanctioned-offers');
      return;
    }

    // Continuous confetti streams from both sides
    const duration = 4000;
    const animationEnd = Date.now() + duration;

    const interval: any = setInterval(function() {
      const timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) {
        return clearInterval(interval);
      }

      // Left side continuous stream
      confetti({
        particleCount: 3,
        angle: 60,
        spread: 30,
        origin: { x: 0, y: 0.9 },
        colors: ['#315C9D', '#315C9D', '#2E5FA8', '#4A7BBD', '#6B9BD9', '#87CEEB'],
        startVelocity: 55,
        gravity: 0.8,
        ticks: 200,
        scalar: 1.2
      });
      
      // Right side continuous stream
      confetti({
        particleCount: 3,
        angle: 120,
        spread: 30,
        origin: { x: 1, y: 0.9 },
        colors: ['#315C9D', '#315C9D', '#2E5FA8', '#4A7BBD', '#6B9BD9', '#87CEEB'],
        startVelocity: 55,
        gravity: 0.8,
        ticks: 200,
        scalar: 1.2
      });
    }, 30); // Very frequent for continuous stream effect

    return () => clearInterval(interval);
  }, [activatedOfferIds, navigate]);

  const copyToClipboard = (accountNumber: string, offerId: string) => {
    navigator.clipboard.writeText(accountNumber);
    setCopiedId(offerId);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleConnectUPI = () => {
    // Navigate to UPI connection page
    navigate('/upi-connection');
  };

  if (activatedOfferIds.length === 0) {
    return null;
  }

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
        <div className="max-w-lg mx-auto relative px-6 pt-8 pb-32">
          {/* Success Animation */}
          <div className="flex justify-center mb-2">
            <div className="w-24 h-24">
              <DotLottieReact src={successLottie} autoplay loop={false} style={{ width: '100%', height: '100%' }} />
            </div>
          </div>

          {/* Title */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="text-center mb-8"
          >
            <h1 className="text-lg font-black text-[#111827] tracking-tight mb-6">
              {t.title}
            </h1>
            <p className="text-base font-bold text-gray-800 mb-1">
              {t.subtitle}
            </p>
            <p className="text-sm text-gray-600">
              {t.description}
            </p>
          </motion.div>

          {/* Shared customer identity — name + SIF created during this application */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.35 }}
            className="rounded-xl border border-gray-200 bg-white overflow-hidden mb-6"
          >
            <div className="flex items-start gap-3 p-4">
              <div className="w-8 h-8 rounded-full bg-[#315C9D]/10 flex items-center justify-center flex-shrink-0">
                <User className="w-4 h-4 text-[#315C9D]" strokeWidth={2} />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] font-semibold text-[#6b7280] uppercase tracking-wide mb-0.5">{t.customerLabel}</p>
                <p className="text-sm font-semibold text-[#111827] leading-snug">{customerName}</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-4 border-t border-gray-200 bg-[#f9fafb]">
              <div className="w-8 h-8 rounded-full bg-[#315C9D]/10 flex items-center justify-center flex-shrink-0">
                <Hash className="w-4 h-4 text-[#315C9D]" strokeWidth={2} />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] font-semibold text-[#6b7280] uppercase tracking-wide mb-0.5">{t.cifLabel}</p>
                <p className="text-sm font-mono font-semibold text-[#111827] leading-snug">{cifNumber}</p>
              </div>
            </div>
          </motion.div>

          {/* Activated Credit Lines */}
          <div className="space-y-6">
            {creditLinesWithAccounts.map((creditLine, index) => {
              const IconComponent = creditLine.icon;
              const isCopied = copiedId === creditLine.id;

              return (
                <motion.div
                  key={creditLine.id}
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ duration: 0.4, delay: 0.4 + (index * 0.1) }}
                  className="space-y-2"
                >
                  {/* Combined credit-limit + loan account frame — single outer stroke, zero gap */}
                  <div className="rounded-xl border border-gray-200 bg-white overflow-hidden">
                    {/* Credit limit + illustration */}
                    <div className="relative w-full h-[110px] overflow-hidden">
                      {creditLine.image ? (
                        <img
                          src={creditLine.image}
                          alt=""
                          className={`pointer-events-none select-none absolute bottom-0 right-4 w-auto object-contain object-bottom ${creditLine.imageClass ?? 'h-[100px]'}`}
                        />
                      ) : (
                        IconComponent && (
                          <div className="pointer-events-none absolute bottom-3 right-5">
                            <IconComponent className="w-14 h-14 text-[#315C9D]" strokeWidth={1.5} />
                          </div>
                        )
                      )}
                      <div className="relative z-10 h-full min-w-0 max-w-[58%] flex flex-col justify-between p-3">
                        <h3 className="text-[12px] font-semibold text-gray-900 leading-tight">
                          {selectedLanguage === 'English' ? creditLine.nameEn : creditLine.nameTa}
                        </h3>
                        <div>
                          <p className="text-[11px] text-gray-500 mb-0.5">{t.amount}</p>
                          <p className="text-xl font-black text-[#111827] leading-none">
                            {creditLine.amount}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Loan Account Number */}
                    <div className="flex items-center justify-between gap-3 px-3.5 py-2.5 bg-[#f9fafb] border-t border-gray-200">
                      <div className="min-w-0">
                        <p className="text-[10px] font-semibold text-[#6b7280] uppercase tracking-wide mb-0.5">
                          {t.accountLabel}
                        </p>
                        <p className="text-sm font-mono font-semibold text-[#111827] truncate">
                          {creditLine.accountNumber}
                        </p>
                      </div>
                      <button
                        onClick={() => copyToClipboard(creditLine.accountNumber, creditLine.id)}
                        aria-label="Copy account number"
                        className="flex-shrink-0 w-9 h-9 rounded-lg flex items-center justify-center hover:bg-gray-100 transition-colors active:scale-95"
                      >
                        {isCopied ? (
                          <Check className="w-4 h-4 text-[#2da94f]" strokeWidth={3} />
                        ) : (
                          <Copy className="w-4 h-4 text-[#6b7280]" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Usage restriction — same info component as the phone screen */}
                  <div className="bg-[#f9fafb] border border-[#e5e7eb] rounded-lg p-4 flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-[#ebecef] flex items-center justify-center flex-shrink-0">
                      <Info className="w-4 h-4 text-[#111827]" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-[#111827] mb-0.5">{t.usageTitle}</p>
                      <p className="text-[12px] text-[#6b7280] leading-relaxed">
                        {usageRestrictions[selectedLanguage][creditLine.id]}
                      </p>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </main>

      <StickyFooter>
        <motion.button
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleConnectUPI}
          className="w-full h-12 rounded-lg bg-[#315C9D] text-white font-semibold text-base flex items-center justify-center gap-2 transition-colors"
        >
          {t.ctaBtn}
        </motion.button>
      </StickyFooter>
    </div>
  );
}