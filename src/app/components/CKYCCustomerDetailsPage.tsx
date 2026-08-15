import { useNavigate } from 'react-router';
import { motion } from 'motion/react';
import { ArrowRight, ShieldCheck, Loader2, CheckCircle, Info, Lock, User, CreditCard, Fingerprint, Users, MapPin } from 'lucide-react';
import { useState, useEffect } from 'react';
import { TopBar } from './TopBar';
import { StickyFooter } from './StickyFooter';
import { useLanguage } from '../hooks/useLanguage';
import { getCkycDetailsConfig, isHrmsFlow, type CkycDetailsConfig } from '../flows/hrmsFlows';
import { resolveDisplayPan } from '../flows/hrmsJourney';
import { tr } from '../flows/hrmsContent';

/**
 * CKYC Customer Details review screen.
 *
 * Shown right after the CKYC records are fetched — BEFORE the "existing bank
 * customer" (dedupe) check runs. The user simply reviews the details pulled
 * from the CKYC portal and continues.
 *
 * Behaviour depends on the active flow:
 *  - "knows CKYC" flows (ckyc-first): CKYC is pulled up-front, so Continue goes
 *    straight to the pre-filled PAN review screen. No extra loading here.
 *  - "no CKYC number" flows (pan-first): PAN + CKYC are already done, so Continue
 *    runs the existing-customer / eligibility check and routes onward. The
 *    ETB/offer steps only appear here — never before the review.
 *
 * All values below are dummy data for the front-end prototype.
 */

// Shared dummy CKYC record (front-end prototype only)
const CKYC_DATA = {
  name: 'Aravind Kumar S.',
  pan: 'ABCPK1234F',
  aadhaar: 'XXXX XXXX 4829',
  fatherName: 'Selvam K.',
  address: '12, Gandhi Street, T. Nagar, Chennai, Tamil Nadu - 600017',
};

type Phase = 'review' | 'processing';

interface ProcessingStep {
  id: string;
  labelEn: string;
  labelTa: string;
  durationMs: number;
}

// Post-review loading + destination, keyed by active flow (pan-first flows only).
const dedupeSteps = {
  check: { id: 'dedupe', labelEn: 'Checking existing bank records...', labelTa: 'ஏற்கனவே உள்ள வங்கி பதிவுகளை சரிபார்க்கிறது...', durationMs: 2000 },
  ntbResult: { id: 'ntb', labelEn: 'New to bank — continuing verification', labelTa: 'வங்கிக்கு புதியவர் — சரிபார்ப்பு தொடர்கிறது', durationMs: 1500 },
  etbResult: { id: 'etb', labelEn: 'Existing customer found ✓', labelTa: 'ஏற்கனவே உள்ள வாடிக்கையாளர் கண்டறியப்பட்டது ✓', durationMs: 1500 },
  bre: { id: 'bre', labelEn: 'Running credit eligibility check...', labelTa: 'கடன் தகுதி சோதனை நடைபெறுகிறது...', durationMs: 2200 },
  offers: { id: 'offers', labelEn: 'Fetching your sanctioned offers...', labelTa: 'உங்கள் அனுமதிக்கப்பட்ட சலுகைகளைப் பெறுகிறது...', durationMs: 1800 },
} satisfies Record<string, ProcessingStep>;

interface FlowConfig {
  ckycFirst: boolean;
  next: string;
  steps: ProcessingStep[];
}

/**
 * Config as actually consumed by this screen. `ckycFirst` is an existing-flow
 * concern and the two HRMS-only fields (`dedupeResult`, `panSource`) are
 * `undefined` for every existing flow, so their render blocks are omitted.
 */
type ResolvedConfig = {
  ckycFirst?: boolean;
  next: string;
  steps: ProcessingStep[];
  dedupeResult?: CkycDetailsConfig['dedupeResult'];
  panSource?: CkycDetailsConfig['panSource'];
};

const flowConfigs: Record<string, FlowConfig> = {
  // ── Knows CKYC (ckyc-first): review then PAN review, no dedupe loading here ──
  'ntb-knows-ckyc': { ckycFirst: true, next: '/pan-prefilled', steps: [] },
  'etb-knows-ckyc': { ckycFirst: true, next: '/pan-prefilled-etb', steps: [] },
  'ntb-knows-ckyc-id': { ckycFirst: true, next: '/pan-prefilled-ntb-id', steps: [] },
  'etb-knows-ckyc-id': { ckycFirst: true, next: '/pan-prefilled-etb-id', steps: [] },

  // ── No CKYC number (pan-first): run existing-customer check after review ──
  'ntb-no-ckyc': { ckycFirst: false, next: '/aadhaar-verification', steps: [dedupeSteps.check, dedupeSteps.ntbResult] },
  'ntb-no-ckyc-id': { ckycFirst: false, next: '/aadhaar-verification', steps: [dedupeSteps.check, dedupeSteps.ntbResult] },
  'etb-no-ckyc': { ckycFirst: false, next: '/sanctioned-offers', steps: [dedupeSteps.check, dedupeSteps.etbResult, dedupeSteps.bre, dedupeSteps.offers] },
  'etb-no-ckyc-id': { ckycFirst: false, next: '/employee-id-upload', steps: [dedupeSteps.check, dedupeSteps.etbResult] },
};

export function CKYCCustomerDetailsPage() {
  const navigate = useNavigate();
  const [selectedLanguage] = useLanguage();
  const [phase, setPhase] = useState<Phase>('review');

  const flow = (typeof window !== 'undefined' && localStorage.getItem('activeFlow')) || 'ntb-no-ckyc';
  // Existing keys resolve on the first lookup, so the eight existing flows
  // never reach the HRMS config at all.
  const config: ResolvedConfig =
    flowConfigs[flow] ?? getCkycDetailsConfig(flow) ?? flowConfigs['ntb-no-ckyc'];

  // Processing state (pan-first flows only)
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<string[]>([]);

  const content = {
    English: {
      title: 'Review Your Details',
      subtitle: 'We fetched these details from your CKYC records. Please review and continue.',
      nameLabel: 'Name',
      panLabel: 'PAN',
      aadhaarLabel: 'Aadhaar',
      fatherLabel: "Father's Name",
      addressLabel: 'Address',
      trustTitle: 'Your details are safe',
      trustBody: 'These details are used only for this credit application and are not shared or used for anything else.',
      encNote: 'Securely fetched from CKYC and encrypted.',
      continueBtn: 'Continue',
    },
    Tamil: {
      title: 'உங்கள் விவரங்களை சரிபார்க்கவும்',
      subtitle: 'உங்கள் CKYC பதிவுகளிலிருந்து இந்த விவரங்களைப் பெற்றோம். சரிபார்த்து தொடரவும்.',
      nameLabel: 'பெயர்',
      panLabel: 'PAN',
      aadhaarLabel: 'ஆதார்',
      fatherLabel: 'தந்தையின் பெயர்',
      addressLabel: 'முகவரி',
      trustTitle: 'உங்கள் விவரங்கள் பாதுகாப்பானவை',
      trustBody: 'இந்த விவரங்கள் இந்த கடன் விண்ணப்பத்திற்கு மட்டுமே பயன்படுத்தப்படுகின்றன, வேறு எதற்கும் பகிரப்படவோ பயன்படுத்தப்படவோ இல்லை.',
      encNote: 'CKYC இலிருந்து பாதுகாப்பாகப் பெறப்பட்டு குறியாக்கம் செய்யப்பட்டது.',
      continueBtn: 'தொடரவும்',
    },
  };

  const t = content[selectedLanguage];

  const handleContinue = () => {
    if (config.ckycFirst || config.steps.length === 0) {
      navigate(config.next);
      return;
    }
    setCurrentStep(0);
    setCompletedSteps([]);
    setPhase('processing');
  };

  // Processing progression (pan-first flows)
  useEffect(() => {
    if (phase !== 'processing') return;
    if (currentStep >= config.steps.length) {
      const timer = setTimeout(() => navigate(config.next), 800);
      return () => clearTimeout(timer);
    }
    const current = config.steps[currentStep];
    const timer = setTimeout(() => {
      setCompletedSteps(prev => [...prev, current.id]);
      setCurrentStep(prev => prev + 1);
    }, current.durationMs);
    return () => clearTimeout(timer);
  }, [phase, currentStep, config, navigate]);

  // ── PAN row source (HRMS flows only) ──
  // `null` for the eight existing flows, so the CKYC record PAN renders as today.
  const hrmsPan = isHrmsFlow(flow) ? resolveDisplayPan(flow) : null;
  const panValue = hrmsPan === null ? CKYC_DATA.pan : hrmsPan;
  const panNote =
    hrmsPan === '' && config.panSource === 'none'
      ? tr(selectedLanguage, 'panNotAvailableLabel')
      : hrmsPan === '' && config.panSource === 'journey'
        ? tr(selectedLanguage, 'panNotProvidedLabel')
        : undefined;

  const detailRows: Array<{
    icon: typeof User;
    label: string;
    value: string;
    mono?: boolean;
    note?: string;
  }> = [
    { icon: User, label: t.nameLabel, value: CKYC_DATA.name },
    { icon: CreditCard, label: t.panLabel, value: panValue, mono: true, note: panNote },
    { icon: Fingerprint, label: t.aadhaarLabel, value: CKYC_DATA.aadhaar, mono: true },
    { icon: Users, label: t.fatherLabel, value: CKYC_DATA.fatherName },
    { icon: MapPin, label: t.addressLabel, value: CKYC_DATA.address },
  ];

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <TopBar showBack />

      <main className="flex-1 overflow-y-auto">
        <div className="max-w-lg mx-auto px-4 pt-8 pb-32">

          {/* ── Review ── */}
          {phase === 'review' && (
            <div className="flex flex-col">
              <motion.div initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 0.4 }} className="flex justify-center mb-6">
                <div className="w-12 h-12 rounded-2xl bg-[#ebecef] flex items-center justify-center">
                  <CheckCircle className="w-6 h-6 text-[#315C9D]" strokeWidth={2} />
                </div>
              </motion.div>

              <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.1 }} className="text-center mb-6">
                <h1 className="text-xl font-semibold text-[#111827] mb-1">{t.title}</h1>
                <p className="text-sm text-[#6b7280] leading-relaxed">{t.subtitle}</p>
              </motion.div>

              {/* ── Dedupe banner (HRMS flows only) ──
                  `config.dedupeResult` is undefined for the eight existing flows,
                  so this block is omitted entirely for them. Icon + text, always
                  visible: no hover, focus or other interaction required. */}
              {config.dedupeResult && (
                <div
                  className={`rounded-xl border p-4 flex items-start gap-3 mb-4 ${
                    config.dedupeResult === 'etb'
                      ? 'bg-[#2da94f]/5 border-[#2da94f]/25'
                      : 'bg-[#eef3fa] border-[#315C9D]/20'
                  }`}
                >
                  {config.dedupeResult === 'etb' ? (
                    <CheckCircle className="w-5 h-5 text-[#15803d] flex-shrink-0 mt-0.5" strokeWidth={2.5} aria-hidden="true" />
                  ) : (
                    <Info className="w-5 h-5 text-[#315C9D] flex-shrink-0 mt-0.5" strokeWidth={2.5} aria-hidden="true" />
                  )}
                  <p className="text-sm font-medium text-[#111827] leading-relaxed">
                    {config.dedupeResult === 'etb'
                      ? tr(selectedLanguage, 'dedupeEtbBanner')
                      : tr(selectedLanguage, 'dedupeNtbBanner')}
                  </p>
                </div>
              )}

              {/* Details card */}
              <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2 }}
                className="bg-[#f9fafb] border border-[#e5e7eb] rounded-xl overflow-hidden mb-4">
                {detailRows.map((row, i) => {
                  const Icon = row.icon;
                  return (
                    <div key={row.label} className={`flex items-start gap-3 p-4 ${i !== 0 ? 'border-t border-[#e5e7eb]' : ''}`}>
                      <div className="w-8 h-8 rounded-full bg-[#315C9D]/10 flex items-center justify-center flex-shrink-0">
                        <Icon className="w-4 h-4 text-[#315C9D]" strokeWidth={2} />
                      </div>
                      <div className="min-w-0">
                        <p className="text-[11px] font-semibold text-[#666666] uppercase tracking-wide mb-0.5">{row.label}</p>
                        {row.value !== '' && (
                          <p className={`text-sm font-semibold text-[#212121] leading-snug ${row.mono ? 'font-mono tracking-wide' : ''}`}>{row.value}</p>
                        )}
                        {/* HRMS-only: explanatory label when the resolved value is empty */}
                        {row.note && (
                          <p className="text-sm font-medium text-[#6b7280] leading-snug">{row.note}</p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </motion.div>

              {/* Trust marker */}
              <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.3 }}
                className="bg-[#eef3fa] border border-[#315C9D]/15 rounded-xl p-4 flex items-start gap-3 mb-3">
                <div className="w-9 h-9 rounded-full bg-[#315C9D]/10 flex items-center justify-center flex-shrink-0">
                  <ShieldCheck className="w-5 h-5 text-[#315C9D]" strokeWidth={2} />
                </div>
                <div>
                  <p className="text-sm font-semibold text-[#111827] mb-0.5">{t.trustTitle}</p>
                  <p className="text-[12px] text-[#6b7280] leading-relaxed">{t.trustBody}</p>
                </div>
              </motion.div>

              {/* Encryption note */}
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.35 }}
                className="flex items-center justify-center gap-1.5 text-[#9ca3af]">
                <Lock className="w-3.5 h-3.5" strokeWidth={2} />
                <span className="text-[11px]">{t.encNote}</span>
              </motion.div>

              <StickyFooter>
                <button
                  onClick={handleContinue}
                  className="w-full bg-[#315C9D] text-white h-12 rounded-lg text-base font-semibold flex items-center justify-center gap-2 active:scale-[0.98] transition-transform"
                >
                  {t.continueBtn}
                  <ArrowRight className="w-5 h-5" strokeWidth={2.5} />
                </button>
              </StickyFooter>
            </div>
          )}

          {/* ── Processing (existing-customer check) ── */}
          {phase === 'processing' && (
            <div className="flex flex-col items-center justify-center min-h-[65vh]">
              <motion.div initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="mb-8">
                <div className="w-14 h-14 rounded-2xl bg-[#315C9D]/10 flex items-center justify-center">
                  <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}>
                    <Loader2 className="w-7 h-7 text-[#315C9D]" strokeWidth={2} />
                  </motion.div>
                </div>
              </motion.div>

              <div className="w-full space-y-3">
                {config.steps.map((ps, index) => {
                  const isCompleted = completedSteps.includes(ps.id);
                  const isActive = currentStep === index && !isCompleted;
                  // Progressive reveal — never show future (unknown) steps up front
                  if (!isCompleted && !isActive) return null;
                  return (
                    <motion.div
                      key={ps.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3 }}
                      className={`flex items-center gap-3 px-4 py-3 rounded-lg border transition-all ${
                        isCompleted ? 'bg-[#2da94f]/5 border-[#2da94f]/20' :
                        isActive ? 'bg-[#315C9D]/5 border-[#315C9D]/20' :
                        'bg-[#f9fafb] border-[#e5e7eb]'
                      }`}
                    >
                      {isCompleted ? (
                        <CheckCircle className="w-5 h-5 text-[#2da94f] flex-shrink-0" strokeWidth={2.5} />
                      ) : (
                        <Loader2 className="w-5 h-5 text-[#315C9D] animate-spin flex-shrink-0" strokeWidth={2.5} />
                      )}
                      <span className={`text-sm font-medium ${isCompleted ? 'text-[#2da94f]' : 'text-[#315C9D]'}`}>
                        {selectedLanguage === 'English' ? ps.labelEn : ps.labelTa}
                      </span>
                    </motion.div>
                  );
                })}
              </div>

              <div className="w-full mt-6">
                <div className="w-full h-1.5 bg-[#315C9D]/10 rounded-full overflow-hidden">
                  <motion.div className="h-full bg-[#315C9D] rounded-full" initial={{ width: '0%' }}
                    animate={{ width: `${(completedSteps.length / Math.max(config.steps.length, 1)) * 100}%` }} transition={{ duration: 0.4 }} />
                </div>
              </div>
            </div>
          )}

        </div>
      </main>
    </div>
  );
}
