import { useNavigate } from 'react-router';
import { motion } from 'motion/react';
import { CheckCircle, Loader2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import { TopBar } from './TopBar';
import { useLanguage } from '../hooks/useLanguage';

export function LoadingPage() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedLanguage] = useLanguage();

  const steps = {
    English: [
      'Connecting to Tamil Nadu State Government Registry',
      'Fetching your Employee Data',
      'Reviewing your Sanctioned Loans'
    ],
    Tamil: [
      'தமிழ்நாடு அரசு பதிவேட்டுடன் இணைக்கப்படுகிறது',
      'உங்கள் ஊழியர் தரவை பெறுகிறது',
      'உங்கள் அனுமதிக்கப்பட்ட கடன்களை மதிப்பாய்வு செய்கிறது'
    ]
  };

  const currentSteps = steps[selectedLanguage];
  const title = selectedLanguage === 'English' ? 'Setting Up Your Account' : 'உங்கள் கணக்கை அமைக்கிறது';

  useEffect(() => {
    const timers: ReturnType<typeof setTimeout>[] = [];
    currentSteps.forEach((_, index) => {
      timers.push(setTimeout(() => setCurrentStep(index + 1), (index + 1) * 2000));
    });
    timers.push(setTimeout(() => navigate('/sanctioned-offers'), currentSteps.length * 2000 + 1000));
    return () => timers.forEach(clearTimeout);
  }, [navigate, currentSteps.length]);

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Header */}
      <TopBar showBack={false} />

      <main className="flex-1 flex items-center justify-center px-4 pb-28">
        <div className="w-full max-w-md">
          {/* Spinner */}
          <motion.div initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 0.5 }}
            className="flex justify-center mb-8">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              className="w-16 h-16 rounded-full border-4 border-[#ebecef] border-t-[#315C9D]"
            />
          </motion.div>

          {/* Title */}
          <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2 }}
            className="text-center mb-8">
            <h1 className="text-xl font-semibold text-[#111827]">{title}</h1>
          </motion.div>

          {/* Steps */}
          <div className="space-y-3">
            {currentSteps.map((step, index) => {
              const isCompleted = currentStep > index;
              const isActive = currentStep === index;
              return (
                <motion.div key={index}
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ duration: 0.5, delay: 0.3 + index * 0.1 }}
                  className={`flex items-center gap-4 p-4 rounded-lg border transition-all ${
                    isActive ? 'bg-[#315C9D]/5 border-[#315C9D]/30'
                    : isCompleted ? 'bg-[#2da94f]/5 border-[#2da94f]/30'
                    : 'bg-[#f9fafb] border-[#e5e7eb]'
                  }`}
                >
                  <div className="flex-shrink-0">
                    {isCompleted ? (
                      <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ duration: 0.4, type: "spring" }}>
                        <CheckCircle className="w-6 h-6 text-[#2da94f]" strokeWidth={2.5} />
                      </motion.div>
                    ) : isActive ? (
                      <motion.div animate={{ rotate: 360 }} transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}>
                        <Loader2 className="w-6 h-6 text-[#315C9D]" strokeWidth={2.5} />
                      </motion.div>
                    ) : (
                      <div className="w-6 h-6 rounded-full border-2 border-[#d9d9d9]" />
                    )}
                  </div>
                  <p className={`text-sm font-semibold ${
                    isActive ? 'text-[#315C9D]' : isCompleted ? 'text-[#2da94f]' : 'text-[#9e9e9e]'
                  }`}>
                    {step}
                  </p>
                </motion.div>
              );
            })}
          </div>

          {/* Progress bar */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }} className="mt-6">
            <div className="w-full h-1.5 bg-[#ebecef] rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${(currentStep / currentSteps.length) * 100}%` }}
                transition={{ duration: 0.5 }}
                className="h-full bg-[#315C9D] rounded-full"
              />
            </div>
            <p className="text-center text-[12px] text-[#666666] mt-2">
              {currentStep} {selectedLanguage === 'English' ? 'of' : '/'} {currentSteps.length} {selectedLanguage === 'English' ? 'completed' : 'முடிந்தது'}
            </p>
          </motion.div>
        </div>
      </main>
    </div>
  );
}
