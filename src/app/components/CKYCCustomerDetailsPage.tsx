import { useNavigate } from 'react-router';
import { motion } from 'motion/react';
import { ArrowRight, ShieldCheck, CheckCircle, Lock, User, CreditCard, Fingerprint, Users, MapPin } from 'lucide-react';
import { TopBar } from './TopBar';
import { StickyFooter } from './StickyFooter';
import { useLanguage } from '../hooks/useLanguage';
import { getCkycDetailsConfig, isHrmsFlow, type CkycDetailsConfig } from '../flows/hrmsFlows';
import { resolveDisplayPan } from '../flows/hrmsJourney';
import { tr } from '../flows/hrmsContent';

/**
 * CKYC Customer Details review screen.
 *
 * Shown after the CKYC records are fetched. The user simply reviews the details
 * pulled from the CKYC portal and continues.
 *
 * Continue always routes directly to the next journey screen. Backend checks
 * are intentionally not surfaced as an intermediate processing screen here.
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

interface FlowConfig {
  next: string;
}

/**
 * Config as actually consumed by this screen. `panSource` is HRMS-only and
 * `undefined` for every existing flow, so its render block is omitted for them.
 * `dedupeResult` is carried but not rendered — the outcome is represented by
 * which screens follow.
 */
type ResolvedConfig = {
  next: string;
  dedupeResult?: CkycDetailsConfig['dedupeResult'];
  panSource?: CkycDetailsConfig['panSource'];
};

const flowConfigs: Record<string, FlowConfig> = {
  'ntb-knows-ckyc': { next: '/pan-prefilled' },
  'etb-knows-ckyc': { next: '/pan-prefilled-etb' },
  'ntb-knows-ckyc-id': { next: '/pan-prefilled-ntb-id' },
  'etb-knows-ckyc-id': { next: '/pan-prefilled-etb-id' },
  'ntb-no-ckyc': { next: '/aadhaar-verification' },
  'ntb-no-ckyc-id': { next: '/aadhaar-verification' },
  'etb-no-ckyc': { next: '/sanctioned-offers' },
  'etb-no-ckyc-id': { next: '/employee-id-upload' },
};

export function CKYCCustomerDetailsPage() {
  const navigate = useNavigate();
  const [selectedLanguage] = useLanguage();

  const flow = (typeof window !== 'undefined' && localStorage.getItem('activeFlow')) || 'ntb-no-ckyc';
  // Existing keys resolve on the first lookup, so the eight existing flows
  // never reach the HRMS config at all.
  const config: ResolvedConfig =
    flowConfigs[flow] ?? getCkycDetailsConfig(flow) ?? flowConfigs['ntb-no-ckyc'];

  const content = {
    English: {
      title: 'Review details and continue',
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
      title: 'விவரங்களைச் சரிபார்த்து தொடரவும்',
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
    navigate(config.next);
  };

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

              {/* No dedupe banner. The outcome does not need announcing here —
                  the journey simply continues into Face RD and CIF creation when
                  no bank record was found, so the next screens say it by doing it. */}

              {/* Details card */}
              <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2 }}
                className="border border-[#e5e7eb] rounded-xl overflow-hidden mb-4">
                {detailRows.map((row, i) => {
                  const Icon = row.icon;
                  return (
                    <div key={row.label} className={`flex items-start gap-3 p-4 ${i !== 0 ? 'border-t border-[#e5e7eb]' : ''}`}>
                      <div className="w-8 h-8 rounded-full bg-[#ebecef] flex items-center justify-center flex-shrink-0">
                        <Icon className="w-4 h-4 text-[#111827]" strokeWidth={2} />
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

        </div>
      </main>
    </div>
  );
}
