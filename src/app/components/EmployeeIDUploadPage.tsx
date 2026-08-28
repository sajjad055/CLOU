import { useNavigate } from 'react-router';
import { motion } from 'motion/react';
import { Camera, Upload, FileImage, CheckCircle, ArrowRight, Loader2, Shield } from 'lucide-react';
import { useState, useEffect, useMemo } from 'react';
import { TopBar } from './TopBar';
import { StickyFooter } from './StickyFooter';
import { useLanguage } from '../hooks/useLanguage';

type Step = 'upload' | 'preview' | 'verifying' | 'processing' | 'verified';

interface ProcessingStep {
  id: string;
  labelEn: string;
  labelTa: string;
  durationMs: number;
}

const baseProcessingSteps: ProcessingStep[] = [
  { id: 'verify-emp', labelEn: 'Verifying employee identity...', labelTa: 'ஊழியர் அடையாளத்தை சரிபார்க்கிறது...', durationMs: 2000 },
  { id: 'docs', labelEn: 'Matching with government records...', labelTa: 'அரசு பதிவுகளுடன் பொருத்துகிறது...', durationMs: 1800 },
];

const etbExtraSteps: ProcessingStep[] = [
  { id: 'bre', labelEn: 'Running credit eligibility check...', labelTa: 'கடன் தகுதி சோதனை நடைபெறுகிறது...', durationMs: 2200 },
  { id: 'offers', labelEn: 'Fetching your sanctioned offers...', labelTa: 'உங்கள் அனுமதிக்கப்பட்ட சலுகைகளைப் பெறுகிறது...', durationMs: 1800 },
];

export function EmployeeIDUploadPage() {
  const navigate = useNavigate();
  const [selectedLanguage] = useLanguage();
  const [step, setStep] = useState<Step>('upload');
  const [uploadMethod, setUploadMethod] = useState<'camera' | 'gallery' | null>(null);
  const [currentProcessingStep, setCurrentProcessingStep] = useState(0);

  const flow = localStorage.getItem('activeFlow') || 'ntb-no-ckyc';
  const isETBFlow = flow === 'etb-no-ckyc-id' || flow === 'etb-no-ckyc' || flow === 'etb-knows-ckyc-id';
  const processingSteps = useMemo(() => isETBFlow ? [...baseProcessingSteps, ...etbExtraSteps] : baseProcessingSteps, [isETBFlow]);
  const [completedSteps, setCompletedSteps] = useState<string[]>([]);

  const content = {
    English: {
      title: 'Upload Employee ID',
      subtitle: 'Take a photo or upload your government employee ID card for verification',
      cameraBtn: 'Take a Photo',
      cameraDesc: 'Use your phone camera to capture',
      galleryBtn: 'Upload from Gallery',
      galleryDesc: 'Select an existing photo',
      guidelines: 'Make sure the ID card is clearly visible, well-lit, and not blurred',
      previewTitle: 'Review Your Photo',
      previewSubtitle: 'Make sure all details are clearly visible',
      retakeBtn: 'Retake',
      submitBtn: 'Submit for Verification',
      verifyingTitle: 'Verifying Your ID',
      verifyingSubtitle: 'Matching your employee details...',
      verifiedTitle: 'Employee ID Verified',
      verifiedSubtitle: 'Your identity has been confirmed',
      continueBtn: 'Continue',
      secureNote: 'Your ID photo is encrypted and deleted after verification.',
    },
    Tamil: {
      title: 'ஊழியர் ID பதிவேற்றம்',
      subtitle: 'சரிபார்ப்புக்காக உங்கள் அரசு ஊழியர் ID அட்டையின் புகைப்படம் எடுக்கவும் அல்லது பதிவேற்றவும்',
      cameraBtn: 'புகைப்படம் எடு',
      cameraDesc: 'உங்கள் போன் கேமராவைப் பயன்படுத்தவும்',
      galleryBtn: 'கேலரியிலிருந்து பதிவேற்றவும்',
      galleryDesc: 'ஏற்கனவே உள்ள புகைப்படத்தைத் தேர்ந்தெடுக்கவும்',
      guidelines: 'ID அட்டை தெளிவாகவும், நல்ல வெளிச்சத்திலும், மங்கலாகவும் இல்லாமலும் இருப்பதை உறுதிப்படுத்தவும்',
      previewTitle: 'உங்கள் புகைப்படத்தை சரிபார்க்கவும்',
      previewSubtitle: 'அனைத்து விவரங்களும் தெளிவாகத் தெரிவதை உறுதிப்படுத்தவும்',
      retakeBtn: 'மீண்டும் எடு',
      submitBtn: 'சரிபார்ப்புக்கு சமர்ப்பிக்கவும்',
      verifyingTitle: 'உங்கள் ID ஐ சரிபார்க்கிறது',
      verifyingSubtitle: 'உங்கள் ஊழியர் விவரங்களைப் பொருத்துகிறது...',
      verifiedTitle: 'ஊழியர் ID சரிபார்க்கப்பட்டது',
      verifiedSubtitle: 'உங்கள் அடையாளம் உறுதிப்படுத்தப்பட்டது',
      continueBtn: 'தொடரவும்',
      secureNote: 'உங்கள் ID புகைப்படம் மறையாக்கம் செய்யப்பட்டு சரிபார்ப்புக்குப் பிறகு நீக்கப்படும்.',
    }
  };

  const t = content[selectedLanguage];

  const handleCapture = (method: 'camera' | 'gallery') => {
    setUploadMethod(method);
    // Simulate capture delay
    setTimeout(() => setStep('preview'), 800);
  };

  const handleSubmit = () => {
    setStep('verifying');
    setTimeout(() => {
      setStep('processing');
      setCurrentProcessingStep(0);
      setCompletedSteps([]);
    }, 2000);
  };

  // Processing progression
  useEffect(() => {
    if (step !== 'processing') return;
    if (currentProcessingStep >= processingSteps.length) {
      const t = setTimeout(() => navigate('/sanctioned-offers'), 800);
      return () => clearTimeout(t);
    }
    const current = processingSteps[currentProcessingStep];
    const timer = setTimeout(() => {
      setCompletedSteps(prev => [...prev, current.id]);
      setCurrentProcessingStep(prev => prev + 1);
    }, current.durationMs);
    return () => clearTimeout(timer);
  }, [step, currentProcessingStep, navigate]);

  const handleContinue = () => {
    navigate('/sanctioned-offers');
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <TopBar showBack />

      <main className="flex-1 overflow-y-auto">
        <div className="max-w-md mx-auto px-4 pt-8 pb-32">

          {/* ── Upload Step ── */}
          {step === 'upload' && (
            <div className="flex flex-col items-center">
              <motion.div initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 0.4 }} className="mb-8">
                <div className="w-12 h-12 rounded-2xl bg-[#ebecef] flex items-center justify-center">
                  <FileImage className="w-6 h-6 text-[#315C9D]" strokeWidth={2} />
                </div>
              </motion.div>

              <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.1 }} className="text-center mb-8 w-full">
                <h1 className="text-xl font-semibold text-[#111827] mb-1">{t.title}</h1>
                <p className="text-sm text-[#6b7280]">{t.subtitle}</p>
              </motion.div>

              {/* Upload Options */}
              <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2 }} className="w-full space-y-3 mb-6">
                {/* Camera option */}
                <button
                  onClick={() => handleCapture('camera')}
                  className="w-full flex items-center gap-4 p-4 bg-[#f9fafb] border border-[#e5e7eb] rounded-xl hover:border-[#315C9D]/40 hover:bg-[#315C9D]/5 transition-all text-left active:scale-[0.99]"
                >
                  <div className="w-12 h-12 rounded-xl bg-[#315C9D]/10 flex items-center justify-center flex-shrink-0">
                    <Camera className="w-6 h-6 text-[#315C9D]" strokeWidth={2} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-semibold text-[#111827]">{t.cameraBtn}</h3>
                    <p className="text-[12px] text-[#6b7280] mt-0.5">{t.cameraDesc}</p>
                  </div>
                  <ArrowRight className="w-5 h-5 text-gray-400 flex-shrink-0" strokeWidth={2} />
                </button>

                {/* Gallery option */}
                <button
                  onClick={() => handleCapture('gallery')}
                  className="w-full flex items-center gap-4 p-4 bg-[#f9fafb] border border-[#e5e7eb] rounded-xl hover:border-[#315C9D]/40 hover:bg-[#315C9D]/5 transition-all text-left active:scale-[0.99]"
                >
                  <div className="w-12 h-12 rounded-xl bg-[#315C9D]/10 flex items-center justify-center flex-shrink-0">
                    <Upload className="w-6 h-6 text-[#315C9D]" strokeWidth={2} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-semibold text-[#111827]">{t.galleryBtn}</h3>
                    <p className="text-[12px] text-[#6b7280] mt-0.5">{t.galleryDesc}</p>
                  </div>
                  <ArrowRight className="w-5 h-5 text-gray-400 flex-shrink-0" strokeWidth={2} />
                </button>
              </motion.div>

              {/* Guidelines */}
              <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.3 }}
                className="w-full bg-[#f9fafb] border border-[#e5e7eb] rounded-lg p-4 flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-[#ebecef] flex items-center justify-center flex-shrink-0">
                  <Shield className="w-4 h-4 text-[#111827]" />
                </div>
                <div>
                  <p className="text-[12px] text-[#6b7280] leading-relaxed">{t.guidelines}</p>
                  <p className="text-[11px] text-[#9ca3af] mt-1">{t.secureNote}</p>
                </div>
              </motion.div>
            </div>
          )}

          {/* ── Preview Step ── */}
          {step === 'preview' && (
            <div className="flex flex-col items-center">
              <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="text-center mb-6 w-full">
                <h1 className="text-xl font-semibold text-[#111827] mb-1">{t.previewTitle}</h1>
                <p className="text-sm text-[#6b7280]">{t.previewSubtitle}</p>
              </motion.div>

              {/* Mock ID card preview */}
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.4 }}
                className="w-full mb-2"
              >
                <div className="aspect-[1.6/1] bg-gradient-to-br from-[#f0f4f8] to-[#e8edf2] border-2 border-[#e5e7eb] rounded-2xl overflow-hidden relative">
                  {/* Subtle pattern background */}
                  <div className="absolute inset-0 opacity-[0.04] pointer-events-none" style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 0h20v20H0zM20 20h20v20H20z' fill='%23315C9D' fill-opacity='0.5'/%3E%3C/svg%3E")`,
                    backgroundRepeat: 'repeat'
                  }} />
                  <div className="absolute inset-0 p-5 flex flex-col justify-between">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-[10px] font-bold text-[#315C9D] uppercase tracking-wider">Government of Tamil Nadu</p>
                        <p className="text-[9px] text-[#6b7280] mt-0.5">Employee Identity Card</p>
                      </div>
                    </div>
                    <div className="flex items-end gap-3">
                      <div className="w-14 h-[72px] rounded-lg bg-[#315C9D]/10 flex items-center justify-center">
                        <Camera className="w-6 h-6 text-[#315C9D]/50" />
                      </div>
                      <div className="flex-1 space-y-1.5">
                        <div className="w-24 h-3 bg-[#111827]/10 rounded-sm" />
                        <div className="w-32 h-2.5 bg-[#6b7280]/10 rounded-sm" />
                        <div className="w-28 h-2.5 bg-[#6b7280]/10 rounded-sm" />
                      </div>
                    </div>
                  </div>
                  {/* Camera capture indicator */}
                  <div className="absolute top-3 right-3">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#2da94f]/10 text-[10px] font-medium text-[#2da94f]">
                      <CheckCircle className="w-3 h-3" /> Captured
                    </span>
                  </div>
                </div>
                <p className="text-[10px] text-[#9ca3af] text-center mt-2 italic">This is a dummy representation of the employee ID card</p>
              </motion.div>

              <StickyFooter>
                <div className="space-y-3">
                  <button
                    onClick={handleSubmit}
                    className="w-full h-12 rounded-lg bg-[#315C9D] text-white font-semibold text-base flex items-center justify-center gap-2 active:scale-[0.98] transition-transform"
                  >
                    {t.submitBtn}
                    <ArrowRight className="w-5 h-5" strokeWidth={2.5} />
                  </button>
                  <button
                    onClick={() => setStep('upload')}
                    className="w-full h-12 rounded-lg bg-transparent text-[#315C9D] font-semibold text-base hover:bg-[#315C9D]/5 transition-colors"
                  >
                    {t.retakeBtn}
                  </button>
                </div>
              </StickyFooter>
            </div>
          )}

          {/* ── Verifying ── */}
          {step === 'verifying' && (
            <div className="flex flex-col items-center justify-center min-h-[60vh]">
              <motion.div initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="mb-8">
                <div className="w-14 h-14 rounded-2xl bg-[#315C9D]/10 flex items-center justify-center">
                  <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}>
                    <Loader2 className="w-7 h-7 text-[#315C9D]" strokeWidth={2} />
                  </motion.div>
                </div>
              </motion.div>
              <h2 className="text-xl font-semibold text-[#111827] mb-1">{t.verifyingTitle}</h2>
              <p className="text-sm text-[#6b7280]">{t.verifyingSubtitle}</p>
            </div>
          )}

          {/* ── Processing / BRE Check ── */}
          {step === 'processing' && (
            <div className="flex flex-col items-center justify-center min-h-[65vh]">
              <motion.div initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="mb-8">
                <div className="w-14 h-14 rounded-2xl bg-[#315C9D]/10 flex items-center justify-center">
                  <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}>
                    <Loader2 className="w-7 h-7 text-[#315C9D]" strokeWidth={2} />
                  </motion.div>
                </div>
              </motion.div>

              <div className="w-full space-y-3">
                {processingSteps.map((ps, index) => {
                  const isCompleted = completedSteps.includes(ps.id);
                  const isActive = currentProcessingStep === index && !isCompleted;

                  return (
                    <motion.div
                      key={ps.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.15 }}
                      className={`flex items-center gap-3 px-4 py-3 rounded-lg border transition-all ${
                        isCompleted ? 'bg-[#2da94f]/5 border-[#2da94f]/20' :
                        isActive ? 'bg-[#315C9D]/5 border-[#315C9D]/20' :
                        'bg-[#f9fafb] border-[#e5e7eb]'
                      }`}
                    >
                      {isCompleted ? (
                        <CheckCircle className="w-5 h-5 text-[#2da94f] flex-shrink-0" strokeWidth={2.5} />
                      ) : isActive ? (
                        <Loader2 className="w-5 h-5 text-[#315C9D] animate-spin flex-shrink-0" strokeWidth={2.5} />
                      ) : (
                        <div className="w-5 h-5 rounded-full border-2 border-gray-300 flex-shrink-0" />
                      )}
                      <span className={`text-sm font-medium ${
                        isCompleted ? 'text-[#2da94f]' :
                        isActive ? 'text-[#315C9D]' :
                        'text-[#9ca3af]'
                      }`}>
                        {selectedLanguage === 'English' ? ps.labelEn : ps.labelTa}
                      </span>
                    </motion.div>
                  );
                })}
              </div>

              {/* Progress bar */}
              <div className="w-full mt-6">
                <div className="w-full h-1.5 bg-[#315C9D]/10 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-[#315C9D] rounded-full"
                    initial={{ width: '0%' }}
                    animate={{ width: `${(completedSteps.length / processingSteps.length) * 100}%` }}
                    transition={{ duration: 0.4 }}
                  />
                </div>
                <p className="text-center text-[11px] text-[#6b7280] mt-2">
                  {completedSteps.length} / {processingSteps.length} {selectedLanguage === 'English' ? 'completed' : 'முடிந்தது'}
                </p>
              </div>
            </div>
          )}

        </div>
      </main>
    </div>
  );
}
