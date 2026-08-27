import { useState } from 'react';
import { useNavigate } from 'react-router';
import { motion } from 'motion/react';
import { CheckCircle2, Info, Copy, Check, User, Hash } from 'lucide-react';
import { useLanguage } from '../hooks/useLanguage';
import { getAdvanceOffer } from '../data/advancesCatalog';
import { ImageWithFallback } from './figma/ImageWithFallback';

// UPI app logos, shared with the UPI connection screen.
import paytmImg from '../../imports/image-16.png';
import googlePayImg from '../../imports/image-17.png';
import phonePeImg from '../../imports/image-15.png';

const UPI_APPS = [
  { name: 'PhonePe', logo: phonePeImg },
  { name: 'Paytm', logo: paytmImg },
  { name: 'Google Pay', logo: googlePayImg },
];

interface StoredCreditLine {
  id: string;
  nameEn?: string;
  nameTa?: string;
  amount: string;
  accountPrefix?: string;
  accountNumber?: string;
}

function readActivated(): StoredCreditLine[] {
  try {
    const raw = localStorage.getItem('activatedCreditLines');
    if (!raw) return [];
    const arr = JSON.parse(raw);
    return Array.isArray(arr) ? (arr as StoredCreditLine[]) : [];
  } catch {
    return [];
  }
}

/**
 * The activated salary advances with usage listed — credit limit, loan account
 * number, and where each advance can be spent. Mirrors the activation success
 * screen, but embedded in the home Salary Advance tab as the "you're active"
 * view. Reads the credit lines the activation screen persisted.
 *
 * The status header and the primary "Connect to UPI apps" action are combined
 * into a single module at the top, so the main action stays above the fold.
 */
export function ActivatedAdvancesList() {
  const navigate = useNavigate();
  const [selectedLanguage] = useLanguage();
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const isTa = selectedLanguage === 'Tamil';
  const activated = readActivated();

  const customerName = 'Aravind Kumar S.';
  let cifNumber: string | null = null;
  try {
    cifNumber = localStorage.getItem('cifNumber');
  } catch {
    cifNumber = null;
  }

  const t = {
    title: isTa ? 'உங்கள் சம்பள முன்பணம் செயலில் உள்ளது' : 'Your salary advance is active',
    subtitle: isTa ? 'இந்த முன்பணங்களை எந்த UPI பயன்பாட்டிலும் பயன்படுத்தலாம்.' : 'Use these advances across any UPI app.',
    customerLabel: isTa ? 'வாடிக்கையாளர் பெயர்' : 'Customer Name',
    cifLabel: isTa ? 'CIF எண்' : 'CIF Number',
    amount: isTa ? 'கடன் வரம்பு' : 'Credit Limit',
    accountLabel: isTa ? 'கடன் கணக்கு எண்' : 'Loan Account Number',
    usageTitle: isTa ? 'இதை எங்கு பயன்படுத்தலாம்' : 'Where you can use this',
    connectBtn: isTa ? 'UPI பயன்பாடுகளுடன் இணைக்கவும்' : 'Connect to UPI apps',
    dashboardBtn: isTa ? 'முழு டாஷ்போர்டைக் காண்க' : 'View full dashboard',
  };

  const copyToClipboard = (accountNumber: string, id: string) => {
    try {
      navigator.clipboard.writeText(accountNumber);
    } catch {
      // Clipboard unavailable — nothing to do.
    }
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="pt-2">
      {/* Status + primary action — one module, kept above the fold */}
      <section className="mb-5 rounded-2xl border border-[#2da94f]/25 bg-[#eaf7ef] p-5">
        <div className="flex items-start gap-3 mb-4">
          <div className="w-11 h-11 rounded-full bg-[#2da94f]/15 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-6 h-6 text-[#2da94f]" strokeWidth={2} aria-hidden="true" />
          </div>
          <div className="min-w-0">
            <h2 className="text-base font-black text-[#111827] leading-tight">{t.title}</h2>
            <p className="text-[12px] text-[#4b5563] leading-relaxed mt-1">{t.subtitle}</p>
          </div>
        </div>

        <button
          onClick={() => navigate('/upi-connection')}
          className="w-full h-12 rounded-lg bg-[#315C9D] text-white font-semibold text-base flex items-center justify-center gap-3 active:scale-[0.99] transition-transform focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#315C9D]"
        >
          <span className="flex items-center -space-x-2" aria-hidden="true">
            {UPI_APPS.map((app, index) => (
              <span
                key={app.name}
                className="w-6 h-6 rounded-full bg-white ring-2 ring-[#315C9D] flex items-center justify-center overflow-hidden p-0.5"
                style={{ zIndex: UPI_APPS.length - index }}
              >
                <ImageWithFallback src={app.logo} alt="" className="w-full h-full object-contain" />
              </span>
            ))}
          </span>
          {t.connectBtn}
        </button>

        <button
          onClick={() => navigate('/credit-line-dashboard')}
          className="w-full h-11 mt-2 rounded-lg bg-transparent text-[#315C9D] font-semibold text-sm hover:bg-[#315C9D]/5 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#315C9D]"
        >
          {t.dashboardBtn}
        </button>
      </section>

      {/* Customer identity — name + CIF */}
      <div className="rounded-xl border border-gray-200 bg-white overflow-hidden mb-5">
        <div className="flex items-start gap-3 p-4">
          <div className="w-8 h-8 rounded-full bg-[#315C9D]/10 flex items-center justify-center flex-shrink-0">
            <User className="w-4 h-4 text-[#315C9D]" strokeWidth={2} aria-hidden="true" />
          </div>
          <div className="min-w-0">
            <p className="text-[10px] font-semibold text-[#6b7280] uppercase tracking-wide mb-0.5">{t.customerLabel}</p>
            <p className="text-sm font-semibold text-[#111827] leading-snug">{customerName}</p>
          </div>
        </div>
        {cifNumber && (
          <div className="flex items-start gap-3 p-4 border-t border-gray-200 bg-[#f9fafb]">
            <div className="w-8 h-8 rounded-full bg-[#315C9D]/10 flex items-center justify-center flex-shrink-0">
              <Hash className="w-4 h-4 text-[#315C9D]" strokeWidth={2} aria-hidden="true" />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] font-semibold text-[#6b7280] uppercase tracking-wide mb-0.5">{t.cifLabel}</p>
              <p className="text-sm font-mono font-semibold text-[#111827] leading-snug">{cifNumber}</p>
            </div>
          </div>
        )}
      </div>

      {/* Activated advances */}
      <div className="space-y-6">
        {activated.map((line, index) => {
          const offer = getAdvanceOffer(line.id);
          const name = isTa ? line.nameTa ?? offer?.nameTa ?? '' : line.nameEn ?? offer?.nameEn ?? '';
          const image = offer?.image;
          const imageClass = offer?.imageClass ?? 'h-[100px]';
          const usage = isTa ? offer?.usageTa : offer?.usageEn;
          const accountNumber = line.accountNumber ?? `${line.accountPrefix ?? line.id}${Math.floor(Math.random() * 10000000000)}`;
          const isCopied = copiedId === line.id;

          return (
            <motion.div
              key={line.id}
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
              className="space-y-2"
            >
              <div className="rounded-xl border border-gray-200 bg-white overflow-hidden">
                {/* Credit limit + illustration */}
                <div className="relative w-full h-[110px] overflow-hidden">
                  {image && (
                    <img
                      src={image}
                      alt=""
                      className={`pointer-events-none select-none absolute bottom-0 right-4 w-auto object-contain object-bottom ${imageClass}`}
                    />
                  )}
                  <div className="relative z-10 h-full min-w-0 max-w-[58%] flex flex-col justify-between p-3">
                    <h3 className="text-[12px] font-semibold text-gray-900 leading-tight">{name}</h3>
                    <div>
                      <p className="text-[11px] text-gray-500 mb-0.5">{t.amount}</p>
                      <p className="text-xl font-black text-[#111827] leading-none">{line.amount}</p>
                    </div>
                  </div>
                </div>

                {/* Loan Account Number */}
                <div className="flex items-center justify-between gap-3 px-3.5 py-2.5 bg-[#f9fafb] border-t border-gray-200">
                  <div className="min-w-0">
                    <p className="text-[10px] font-semibold text-[#6b7280] uppercase tracking-wide mb-0.5">{t.accountLabel}</p>
                    <p className="text-sm font-mono font-semibold text-[#111827] truncate">{accountNumber}</p>
                  </div>
                  <button
                    onClick={() => copyToClipboard(accountNumber, line.id)}
                    aria-label="Copy account number"
                    className="flex-shrink-0 w-9 h-9 rounded-lg flex items-center justify-center hover:bg-gray-100 transition-colors active:scale-95 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#315C9D]"
                  >
                    {isCopied ? (
                      <Check className="w-4 h-4 text-[#2da94f]" strokeWidth={3} aria-hidden="true" />
                    ) : (
                      <Copy className="w-4 h-4 text-[#6b7280]" aria-hidden="true" />
                    )}
                  </button>
                </div>
              </div>

              {/* Usage restriction */}
              {usage && (
                <div className="bg-[#f9fafb] border border-[#e5e7eb] rounded-lg p-4 flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-[#ebecef] flex items-center justify-center flex-shrink-0">
                    <Info className="w-4 h-4 text-[#111827]" aria-hidden="true" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-[#111827] mb-0.5">{t.usageTitle}</p>
                    <p className="text-[12px] text-[#6b7280] leading-relaxed">{usage}</p>
                  </div>
                </div>
              )}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
