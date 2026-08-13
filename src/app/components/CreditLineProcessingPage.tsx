import { useNavigate, useLocation } from 'react-router';
import { motion, AnimatePresence } from 'motion/react';
import { Loader2, PartyPopper, Laptop } from 'lucide-react';
import { useState, useEffect } from 'react';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';
import { TopBar } from './TopBar';
import { useLanguage } from '../hooks/useLanguage';
import successLottie from '@/assets/success.lottie';

interface CreditLine {
  id: string;
  nameEn: string;
  nameTa: string;
  amount: string;
  icon: any;
  accountPrefix: string;
}

const creditLineMap: Record<string, CreditLine> = {
  'festival': {
    id: 'festival',
    nameEn: 'Festival Advance',
    nameTa: 'பண்டிகை முன்பணம்',
    amount: '₹50,000',
    icon: PartyPopper,
    accountPrefix: 'festival'
  },
  'gadget': {
    id: 'gadget',
    nameEn: 'Gadget Purchase Advance',
    nameTa: 'கேஜெட் கொள்முதல் முன்பணம்',
    amount: '₹75,000',
    icon: Laptop,
    accountPrefix: 'gadget'
  }
};

export function CreditLineProcessingPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const selectedOfferIds = (location.state?.selectedOffers || []) as string[];
  const [selectedLanguage] = useLanguage();
  
  const [processingIndex, setProcessingIndex] = useState(0);
  const [completedOffers, setCompletedOffers] = useState<string[]>([]);

  const selectedOffers = selectedOfferIds.map(id => creditLineMap[id]).filter(Boolean);

  const content = {
    English: {
      title: 'Creating UPI Credit Lines',
      subtitle: 'Please wait while we set up your credit lines',
      creating: 'Creating credit line for',
      completed: 'Created',
      processing: 'Processing...'
    },
    Tamil: {
      title: 'UPI கடன் வரிசைகளை உருவாக்குதல்',
      subtitle: 'உங்கள் கடன் வரிசைகளை அமைக்கும் போது காத்திருக்கவும்',
      creating: 'கடன் வரிசை உருவாக்குகிறது',
      completed: 'உருவாக்கப்பட்டது',
      processing: 'செயலாக்குகிறது...'
    }
  };

  const t = content[selectedLanguage];

  useEffect(() => {
    if (selectedOffers.length === 0) {
      navigate('/sanctioned-offers');
      return;
    }

    if (processingIndex < selectedOffers.length) {
      const timer = setTimeout(() => {
        setCompletedOffers(prev => [...prev, selectedOffers[processingIndex].id]);
        setProcessingIndex(prev => prev + 1);
      }, 2500); // 2.5 seconds per credit line

      return () => clearTimeout(timer);
    } else {
      // All completed, navigate to success page
      const timer = setTimeout(() => {
        navigate('/credit-line-activated', { 
          state: { 
            activatedOfferIds: selectedOfferIds // Pass only IDs, not the full objects
          } 
        });
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, [processingIndex, selectedOffers, navigate, selectedLanguage]);

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
      <main className="flex-1 flex items-center justify-center px-6">
        <div className="max-w-lg w-full">
          {/* Title */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="text-center mb-10"
          >
            <h1 className="text-2xl font-black text-[#111827] tracking-tight mb-2">
              {t.title}
            </h1>
            <p className="text-sm text-gray-600">
              {t.subtitle}
            </p>
          </motion.div>

          {/* Credit Lines Processing List */}
          <div className="space-y-4 mb-8">
            <AnimatePresence mode="sync">
              {selectedOffers.map((offer, index) => {
                const IconComponent = offer.icon;
                const isCompleted = completedOffers.includes(offer.id);
                const isProcessing = processingIndex === index;
                const isPending = processingIndex < index;

                return (
                  <motion.div
                    key={offer.id}
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ duration: 0.4, delay: index * 0.1 }}
                    className={`p-5 rounded-2xl border transition-all ${
                      isCompleted
                        ? 'border-[#2da94f]/30 bg-[#eaf7ef]'
                        : isProcessing
                        ? 'border-[#315C9D]/30 bg-[#eef3fa] shadow-sm'
                        : 'border-gray-200 bg-white'
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      {/* Icon */}
                      <div className="flex-shrink-0 w-14 h-14 rounded-2xl bg-[#315C9D]/10 flex items-center justify-center">
                        <IconComponent className="w-7 h-7 text-[#315C9D]" strokeWidth={2} />
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-gray-600 mb-1">
                          {isCompleted ? t.completed : isProcessing ? t.creating : t.processing}
                        </p>
                        <h3 className="text-base font-bold text-gray-900 leading-tight">
                          {selectedLanguage === 'English' ? offer.nameEn : offer.nameTa}
                        </h3>
                        <p className="text-lg font-black text-[#315C9D] mt-1">
                          {offer.amount}
                        </p>
                      </div>

                      {/* Status Icon */}
                      <div className="flex-shrink-0">
                        {isCompleted ? (
                          <div className="w-11 h-11">
                            <DotLottieReact
                              src={successLottie}
                              autoplay
                              loop={false}
                              style={{ width: '100%', height: '100%' }}
                            />
                          </div>
                        ) : isProcessing ? (
                          <Loader2 className="w-8 h-8 text-[#315C9D] animate-spin" strokeWidth={2.5} />
                        ) : (
                          <div className="w-8 h-8 rounded-full border-2 border-gray-300" />
                        )}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>

          {/* Progress Bar */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="mb-4"
          >
            <div className="w-full h-2 bg-[#315C9D]/10 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-[#315C9D] to-[#315C9D]"
                initial={{ width: '0%' }}
                animate={{ width: `${(completedOffers.length / selectedOffers.length) * 100}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>
            <p className="text-center text-xs text-gray-600 mt-2">
              {completedOffers.length} / {selectedOffers.length} {selectedLanguage === 'English' ? 'completed' : 'முடிந்தது'}
            </p>
          </motion.div>
        </div>
      </main>
    </div>
  );
}