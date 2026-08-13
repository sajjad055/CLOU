import { useNavigate } from 'react-router';
import { motion } from 'motion/react';
import { ChevronRight } from 'lucide-react';
import { TopBar } from './TopBar';
import { useLanguage } from '../hooks/useLanguage';
import panImg from '@/assets/pan.svg';
import aadhaarImg from '@/assets/aadhaar.svg';
import faceScanImg from '@/assets/face-scan.svg';

interface KYCOption {
  id: string;
  icon?: any;
  image?: string;
  imageClass?: string;
  iconBg: string;
  iconColor: string;
  title: string;
  titleTamil: string;
  description: string;
  descriptionTamil: string;
  route: string;
  recommended?: boolean;
}

const kycOptions: KYCOption[] = [
  {
    id: 'biometric',
    image: faceScanImg,
    imageClass: 'w-9 h-9',
    iconBg: 'bg-[#315C9D]/5',
    iconColor: 'text-[#315C9D]',
    title: 'Aadhaar Facial Biometric',
    titleTamil: 'ஆதார் முக அங்கீகாரம்',
    description: 'Scan your face using your camera',
    descriptionTamil: 'உங்கள் கேமராவைப் பயன்படுத்தி முகத்தை ஸ்கேன் செய்யவும்',
    route: '/kyc-aadhaar-biometric',
    recommended: true
  },
  {
    id: 'ckyc',
    image: panImg,
    imageClass: 'w-11 h-11',
    iconBg: 'bg-transparent',
    iconColor: 'text-[#1F5D99]',
    title: 'PAN & CKYC Verification',
    titleTamil: 'PAN & CKYC சரிபார்ப்பு',
    description: 'Enter your PAN, name, and date of birth',
    descriptionTamil: 'உங்கள் PAN, பெயர் மற்றும் பிறந்த தேதியை உள்ளிடவும்',
    route: '/kyc-ckyc-verification'
  },
  {
    id: 'aadhaar-otp',
    image: aadhaarImg,
    imageClass: 'w-[54px] h-[54px]',
    iconBg: 'bg-transparent',
    iconColor: 'text-[#D52736]',
    title: 'Aadhaar OTP Verification',
    titleTamil: 'ஆதார் OTP சரிபார்ப்பு',
    description: 'Verify using OTP sent to your Aadhaar-linked mobile',
    descriptionTamil: 'உங்கள் ஆதாருடன் இணைக்கப்பட்ட மொபைலுக்கு அனுப்பப்பட்ட OTP ஐப் பயன்படுத்தி சரிபார்க்கவும்',
    route: '/kyc-aadhaar-otp'
  }
];

export function KYCOptionsPage() {
  const navigate = useNavigate();
  const [selectedLanguage] = useLanguage();

  const content = {
    English: {
      title: "Choose Verification Method",
      subtitle: "Select how you'd like to verify your identity"
    },
    Tamil: {
      title: "சரிபார்ப்பு முறையைத் தேர்ந்தெடுக்கவும்",
      subtitle: "தொடங்க எந்த விருப்பத்தையும் தட்டவும்"
    }
  };

  const t = content[selectedLanguage];

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Header */}
      <TopBar showBack />

      <main className="flex-1 overflow-y-auto pb-28">
        <div className="max-w-lg mx-auto px-4 pt-8">
          {/* Title */}
          <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.5 }} className="text-center mb-12">
            <h1 className="text-xl font-semibold text-[#111827] mb-1">{t.title}</h1>
            <p className="text-sm text-[#6b7280]">{t.subtitle}</p>
          </motion.div>

          {/* KYC Options */}
          <div className="space-y-3">
            {kycOptions.map((option, index) => {
              const IconComponent = option.icon;
              const isRecommended = option.recommended;
              const cardInner = (
                <div className="flex items-center gap-4">
                  <div className={`flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center ${isRecommended ? 'relative bg-white/0 overflow-visible' : option.iconBg}`}>
                    {option.image ? (
                      <img
                        src={option.image}
                        alt=""
                        className={`object-contain ${isRecommended ? 'absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[64px] h-[64px]' : (option.imageClass ?? 'w-9 h-9')}`}
                      />
                    ) : (
                      IconComponent && <IconComponent className={`w-6 h-6 ${isRecommended ? 'text-white' : option.iconColor}`} strokeWidth={2} />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className={`font-semibold text-[15px] mb-0.5 ${isRecommended ? 'text-white' : 'text-[#111827]'}`}>
                      {selectedLanguage === 'English' ? option.title : option.titleTamil}
                    </h3>
                    <p className={`text-[13px] leading-snug ${isRecommended ? 'text-white/70' : 'text-[#6b7280]'}`}>
                      {selectedLanguage === 'English' ? option.description : option.descriptionTamil}
                    </p>
                  </div>
                  <ChevronRight className={`w-5 h-5 flex-shrink-0 transition-colors ${isRecommended ? 'text-white/70' : 'text-[#111827]'}`} strokeWidth={2} />
                </div>
              );
              return (
                <motion.div
                  key={option.id}
                  initial={{ y: 30, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.5, delay: index * 0.08, ease: "easeOut" }}
                  className="relative"
                >
                  {isRecommended && (
                    <div className="absolute top-0 right-3 -translate-y-1/2 z-20">
                      <div className="px-3 py-[3px] rounded-full bg-[#315C9D] text-white text-[10px] font-bold uppercase tracking-wider whitespace-nowrap border border-white/25">
                        {selectedLanguage === 'English' ? 'Recommended' : 'பரிந்துரைக்கப்பட்டது'}
                      </div>
                    </div>
                  )}
                  {isRecommended ? (
                    <div className="rec-shimmer-frame rounded-lg p-[1.5px]">
                      <motion.button
                        whileTap={{ scale: 0.99 }}
                        onClick={() => navigate(option.route)}
                        className="w-full text-left p-4 rounded-[7px] bg-gradient-to-br from-[#315C9D] to-[#1e3c68] group"
                      >
                        {cardInner}
                      </motion.button>
                    </div>
                  ) : (
                    <motion.button
                      whileTap={{ scale: 0.99 }}
                      onClick={() => navigate(option.route)}
                      className="w-full text-left p-4 rounded-lg bg-white border border-[#e5e7eb] hover:border-[#315C9D]/40 hover:shadow-sm transition-all group"
                    >
                      {cardInner}
                    </motion.button>
                  )}
                </motion.div>
              );
            })}
          </div>
        </div>
      </main>
    </div>
  );
}
