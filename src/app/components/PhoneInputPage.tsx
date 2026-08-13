import { useNavigate } from 'react-router';
import { motion } from 'motion/react';
import { Phone, ArrowRight, Shield } from 'lucide-react';
import { useState } from 'react';
import { TopBar } from './TopBar';
import { StickyFooter } from './StickyFooter';
import { useLanguage } from '../hooks/useLanguage';

export function PhoneInputPage() {
  const navigate = useNavigate();
  const [phoneNumber, setPhoneNumber] = useState('9876543210');
  const [selectedLanguage] = useLanguage();

  const content = {
    English: {
      title: "Enter Mobile Number",
      subtitle: "We'll send you an OTP for verification",
      phoneLabel: "Mobile Number",
      continueBtn: "Continue",
      terms: "By continuing, you agree to our Terms & Conditions"
    },
    Tamil: {
      title: "மொபைல் எண்ணை உள்ளிடவும்",
      subtitle: "சரிபார்ப்புக்காக OTP அனுப்புவோம்",
      phoneLabel: "மொபைல் எண்",
      continueBtn: "தொடரவும்",
      terms: "தொடர்வதன் மூலம், எங்கள் விதிமுறைகளை ஒப்புக்கொள்கிறீர்கள்"
    }
  };

  const t = content[selectedLanguage];

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Header */}
      <TopBar showBack />

      <main className="flex-1 overflow-y-auto pb-28">
        <div className="max-w-lg mx-auto px-4 pt-8">
          {/* Icon */}
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.4 }}
            className="flex justify-center mb-8"
          >
            <div className="w-12 h-12 rounded-2xl bg-[#ebecef] flex items-center justify-center">
              <Phone className="w-6 h-6 text-[#315C9D]" strokeWidth={2} />
            </div>
          </motion.div>

          {/* Title */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="text-center mb-8"
          >
            <h1 className="text-xl font-semibold text-[#111827] mb-1">{t.title}</h1>
            <p className="text-sm text-[#6b7280]">{t.subtitle}</p>
          </motion.div>

          {/* Form */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="mb-6"
          >
            <label className="block text-[12px] font-semibold text-[#666666] mb-2 uppercase tracking-wide">
              {t.phoneLabel}
            </label>
            <div className="flex items-center gap-3 bg-transparent border border-[#e5e7eb] rounded-lg px-4 h-14 focus-within:border-[#254576] focus-within:ring-1 focus-within:ring-[#254576]/20 transition-all">
              <span className="text-sm font-semibold text-[#212121]">+91</span>
              <div className="w-px h-5 bg-[#d9d9d9]"></div>
              <input
                type="tel"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, '').slice(0, 10))}
                className="flex-1 bg-transparent outline-none text-sm font-semibold text-[#212121] placeholder:text-[#9e9e9e]"
                placeholder="9876543210"
                maxLength={10}
              />
            </div>
          </motion.div>

          {/* Privacy card */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="bg-[#f9fafb] border border-[#e5e7eb] rounded-lg p-4 flex items-start gap-3"
          >
            <div className="w-8 h-8 rounded-full bg-[#ebecef] flex items-center justify-center flex-shrink-0">
              <Shield className="w-4 h-4 text-[#111827]" />
            </div>
            <div>
              <p className="text-sm font-semibold text-[#111827] mb-0.5">
                {selectedLanguage === 'English' ? 'Your Privacy Matters' : 'உங்கள் தனியுரிமை முக்கியம்'}
              </p>
              <p className="text-[12px] text-[#6b7280] leading-relaxed">
                {selectedLanguage === 'English'
                  ? 'Your mobile number is secure and will only be used for verification purposes.'
                  : 'உங்கள் மொபைல் எண் பாதுகாப்பானது மற்றும் சரிபார்ப்பு நோக்கங்களுக்கு மட்டுமே பயன்படுத்தப்படும்.'}
              </p>
            </div>
          </motion.div>

        </div>
      </main>

      <StickyFooter>
        <motion.button
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          whileTap={{ scale: phoneNumber.length === 10 ? 0.98 : 1 }}
          onClick={() => navigate('/otp-verification')}
          disabled={phoneNumber.length !== 10}
          className="w-full bg-[#315C9D] text-white h-12 rounded-lg text-base font-semibold flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed transition-opacity"
        >
          {t.continueBtn}
          <ArrowRight className="w-5 h-5" strokeWidth={2.5} />
        </motion.button>
        <p className="text-[10px] text-[#666666] text-center leading-relaxed mt-3">{t.terms}</p>
      </StickyFooter>
    </div>
  );
}
