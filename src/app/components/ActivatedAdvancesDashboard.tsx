import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router';
import { motion } from 'motion/react';
import {
  CheckCircle2,
  Wallet,
  ShieldCheck,
  Landmark,
  TrendingUp,
  Calendar,
  MapPin,
  CreditCard,
  ChevronDown,
  ChevronUp,
  Info,
  Car,
  Bike,
  GraduationCap,
  PartyPopper,
  Heart,
  Laptop,
  ShoppingBag,
} from 'lucide-react';
import { useLanguage } from '../hooks/useLanguage';
import { getAdvanceOffer } from '../data/advancesCatalog';
import { useSalaryAdvanceState } from '../state/salaryAdvance';
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

interface Transaction {
  id: string;
  merchant: string;
  amount: string;
  date: string;
  time: string;
  location: string;
}

interface CreditLine {
  id: string;
  productName: string;
  displayAccountNumber: string;
  totalLimit: string;
  availableLimit: string;
  usedAmount: string;
  upiId: string;
  usageEn?: string;
  usageTa?: string;
  transactions: Transaction[];
}

const FESTIVAL_TX: Transaction[] = [
  { id: '1', merchant: 'Saravana Stores', amount: '₹3,200', date: 'Apr 1, 2026', time: '11:30 AM', location: 'T Nagar, Chennai' },
  { id: '2', merchant: 'Pothys Silk House', amount: '₹5,800', date: 'Mar 31, 2026', time: '3:45 PM', location: 'Pondy Bazaar, Chennai' },
  { id: '3', merchant: 'Chennai Silks', amount: '₹4,500', date: 'Mar 30, 2026', time: '2:15 PM', location: 'Ranganathan Street, Chennai' },
];

const GADGET_TX: Transaction[] = [
  { id: '1', merchant: 'HP Laptop Store', amount: '₹35,000', date: 'Mar 30, 2026', time: '1:30 PM', location: 'Velachery, Chennai' },
  { id: '2', merchant: 'Reliance Digital', amount: '₹8,900', date: 'Mar 28, 2026', time: '5:00 PM', location: 'Velachery, Chennai' },
];

function txFor(productName: string): Transaction[] {
  const n = productName.toLowerCase();
  if (n.includes('festival')) return FESTIVAL_TX;
  if (n.includes('gadget') || n.includes('electronic')) return GADGET_TX;
  return FESTIVAL_TX;
}

function getProductIcon(name: string) {
  const n = name.toLowerCase();
  if (n.includes('four') || n.includes('vehicle') || n.includes('car')) return Car;
  if (n.includes('two') || n.includes('bike')) return Bike;
  if (n.includes('education')) return GraduationCap;
  if (n.includes('festival')) return PartyPopper;
  if (n.includes('marriage') || n.includes('wedding')) return Heart;
  if (n.includes('gadget') || n.includes('electronic') || n.includes('computer')) return Laptop;
  if (n.includes('handloom') || n.includes('textile')) return ShoppingBag;
  return CreditCard;
}

/**
 * Read activated credit lines from storage. Spending and transactions only
 * exist once the advances are linked to a UPI app — until then everything is
 * unspent (used = 0, full limit available, no transactions).
 */
function getCreditLines(connected: boolean): CreditLine[] {
  try {
    const raw = localStorage.getItem('activatedCreditLines');
    if (!raw) return [];
    const offers = JSON.parse(raw) as Array<{ id: string; nameEn: string; nameTa?: string; amount: string; accountPrefix?: string }>;
    if (!Array.isArray(offers)) return [];

    return offers.map((offer, index) => {
      const totalLimitNum = parseInt(String(offer.amount).replace(/[^0-9]/g, ''), 10) || 0;
      const usedAmountNum = connected ? Math.floor(totalLimitNum * (index === 0 ? 0.28 : 0.15)) : 0;
      const availableLimitNum = totalLimitNum - usedAmountNum;
      const prefix = offer.accountPrefix ?? offer.id;
      const catalog = getAdvanceOffer(offer.id);
      return {
        id: offer.id,
        productName: offer.nameEn,
        displayAccountNumber: `${prefix.substring(0, 4).toUpperCase()}${Math.floor(1000 + Math.random() * 9000)}`,
        totalLimit: `₹${totalLimitNum.toLocaleString('en-IN')}`,
        availableLimit: `₹${availableLimitNum.toLocaleString('en-IN')}`,
        usedAmount: `₹${usedAmountNum.toLocaleString('en-IN')}`,
        upiId: `${prefix.toLowerCase()}${Math.floor(100 + Math.random() * 900)}@ybl`,
        usageEn: catalog?.usageEn,
        usageTa: catalog?.usageTa,
        transactions: connected ? txFor(offer.nameEn) : [],
      };
    });
  } catch {
    return [];
  }
}

/**
 * The single activated-advances view — a dashboard shown both on the home Salary
 * Advance tab (once activated) and on "My Credits". It merges what used to be a
 * separate summary + full dashboard into one place, so each advance appears
 * exactly once, and folds the "Connect to UPI apps" module inline, shown only
 * while UPI isn't linked yet.
 */
export function ActivatedAdvancesDashboard() {
  const navigate = useNavigate();
  const [selectedLanguage] = useLanguage();
  const { upiConnected } = useSalaryAdvanceState();
  const [expandedCard, setExpandedCard] = useState<string | null>(null);
  const creditLines = useMemo(() => getCreditLines(upiConnected), [upiConnected]);

  const isTa = selectedLanguage === 'Tamil';

  const t = {
    title: isTa ? 'உங்கள் சம்பள முன்பணம் செயலில் உள்ளது' : 'Your salary advance is active',
    subtitle: isTa ? 'இந்த முன்பணங்களை எந்த UPI பயன்பாட்டிலும் பயன்படுத்தலாம்.' : 'Use these advances across any UPI app.',
    connectTitle: isTa ? 'UPI பயன்பாடுகளுடன் இணைக்கவும்' : 'Connect to UPI apps',
    connectBody: isTa ? 'செலவழிக்கத் தொடங்க உங்கள் முன்பணங்களை இணைக்கவும்.' : 'Link your advances to a UPI app to start spending.',
    connectBtn: isTa ? 'UPI பயன்பாடுகளுடன் இணைக்கவும்' : 'Connect to UPI apps',
    connectedChip: isTa ? 'UPI உடன் இணைக்கப்பட்டது' : 'Connected to UPI',
    totalAvailable: isTa ? 'செலவழிக்கக் கிடைக்கும் மொத்தம்' : 'Total available to spend',
    totalLimit: isTa ? 'மொத்த வரம்பு' : 'Total limit',
    spent: isTa ? 'இதுவரை செலவழித்தது' : 'Spent so far',
    repayTitle: isTa ? 'திருப்பிச் செலுத்துதல் கவனிக்கப்படுகிறது' : 'Repayment is taken care of',
    repayBody: isTa
      ? 'தமிழ்நாடு அரசால் உங்கள் சம்பளத்திலிருந்து தானாகக் கழிக்கப்படும் — கைமுறையாக எதுவும் செலுத்த வேண்டாம்.'
      : 'Instalments are auto-deducted from your salary by the Government of Tamil Nadu — nothing to pay manually.',
    yourAdvances: isTa ? 'உங்கள் முன்பணங்கள்' : 'Your advances',
    available: isTa ? 'கிடைக்கும்' : 'Available',
    autoRepaid: isTa ? 'உங்கள் சம்பளத்திலிருந்து தானாக திருப்பிச் செலுத்தப்படும்' : 'Auto-repaid from your salary',
    recentTx: isTa ? 'சமீபத்திய பரிவர்த்தனைகள்' : 'Recent transactions',
    usageTitle: isTa ? 'இதை எங்கு பயன்படுத்தலாம்' : 'Where you can use this',
  };

  const totalAvailable = creditLines.reduce((s, l) => s + (parseInt(l.availableLimit.replace(/[^0-9]/g, ''), 10) || 0), 0);
  const totalLimit = creditLines.reduce((s, l) => s + (parseInt(l.totalLimit.replace(/[^0-9]/g, ''), 10) || 0), 0);
  const totalUsed = creditLines.reduce((s, l) => s + (parseInt(l.usedAmount.replace(/[^0-9]/g, ''), 10) || 0), 0);

  return (
    <div className="pt-2">
      {/* Status header */}
      <div className="flex items-start gap-3 mb-5">
        <div className="w-11 h-11 rounded-full bg-[#2da94f]/15 flex items-center justify-center shrink-0">
          <CheckCircle2 className="w-6 h-6 text-[#2da94f]" strokeWidth={2} aria-hidden="true" />
        </div>
        <div className="min-w-0">
          <h2 className="text-base font-black text-[#111827] leading-tight">{t.title}</h2>
          <p className="text-[12px] text-[#6b7280] leading-relaxed mt-1">{t.subtitle}</p>
        </div>
      </div>

      {/* Connect to UPI — only while not yet linked */}
      {!upiConnected ? (
        <section className="mb-5 rounded-2xl border border-[#315C9D]/15 bg-white p-5 shadow-[0_1px_6px_rgba(0,0,0,0.04)]">
          <div className="flex items-center gap-2 mb-3">
            <span className="flex items-center -space-x-2" aria-hidden="true">
              {UPI_APPS.map((app, index) => (
                <span
                  key={app.name}
                  className="w-7 h-7 rounded-full bg-white ring-2 ring-white shadow-sm flex items-center justify-center overflow-hidden p-0.5"
                  style={{ zIndex: UPI_APPS.length - index }}
                >
                  <ImageWithFallback src={app.logo} alt="" className="w-full h-full object-contain" />
                </span>
              ))}
            </span>
            <h3 className="text-sm font-bold text-[#111827]">{t.connectTitle}</h3>
          </div>
          <p className="text-[12px] text-[#6b7280] leading-relaxed mb-4">{t.connectBody}</p>
          <button
            onClick={() => navigate('/upi-connection')}
            className="w-full h-12 rounded-lg bg-[#315C9D] text-white font-semibold text-base flex items-center justify-center gap-2 active:scale-[0.99] transition-transform focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#315C9D]"
          >
            {t.connectBtn}
          </button>
        </section>
      ) : (
        <div className="mb-5 inline-flex items-center gap-1.5 rounded-full bg-[#2da94f]/10 px-3 py-1.5 text-[12px] font-semibold text-[#2da94f]">
          <CheckCircle2 className="w-4 h-4" strokeWidth={2.5} aria-hidden="true" />
          {t.connectedChip}
        </div>
      )}

      {/* Total available hero */}
      <div className="bg-[#315C9D] rounded-2xl p-5 text-white mb-4">
        <div className="flex items-center gap-2 text-white/80 mb-1">
          <Wallet className="w-4 h-4" strokeWidth={2} aria-hidden="true" />
          <span className="text-xs font-medium">{t.totalAvailable}</span>
        </div>
        <div className="text-3xl font-black tracking-tight">₹{totalAvailable.toLocaleString('en-IN')}</div>
        <div className="mt-4 pt-4 border-t border-white/15 flex items-center justify-between">
          <div>
            <div className="text-[11px] text-white/70">{t.totalLimit}</div>
            <div className="text-sm font-semibold">₹{totalLimit.toLocaleString('en-IN')}</div>
          </div>
          <div className="text-right">
            <div className="text-[11px] text-white/70">{t.spent}</div>
            <div className="text-sm font-semibold">₹{totalUsed.toLocaleString('en-IN')}</div>
          </div>
        </div>
      </div>

      {/* Repayment reassurance */}
      <div className="bg-[#eaf7ef] border border-[#2da94f]/20 rounded-2xl p-4 mb-6 flex items-start gap-3">
        <div className="w-10 h-10 rounded-full bg-[#2da94f]/15 flex items-center justify-center flex-shrink-0">
          <ShieldCheck className="w-5 h-5 text-[#2da94f]" strokeWidth={2} aria-hidden="true" />
        </div>
        <div>
          <p className="text-sm font-semibold text-[#111827] mb-0.5">{t.repayTitle}</p>
          <p className="text-[12px] text-[#4b5563] leading-relaxed">{t.repayBody}</p>
        </div>
      </div>

      <h2 className="text-sm font-bold text-[#111827] mb-3">{t.yourAdvances}</h2>

      {/* Advance cards */}
      <div className="space-y-4">
        {creditLines.map((line, index) => {
          const isExpanded = expandedCard === line.id;
          const usagePct = (parseInt(line.usedAmount.replace(/[^0-9]/g, ''), 10) / (parseInt(line.totalLimit.replace(/[^0-9]/g, ''), 10) || 1)) * 100;
          const ProductIcon = getProductIcon(line.productName);
          const usage = isTa ? line.usageTa : line.usageEn;

          return (
            <motion.div
              key={line.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 + index * 0.08 }}
              className="bg-white border border-gray-200 rounded-2xl overflow-hidden"
            >
              <div className="p-4">
                <div className="flex items-start gap-3 mb-4">
                  <div className="w-11 h-11 rounded-xl bg-[#315C9D]/10 flex items-center justify-center flex-shrink-0">
                    <ProductIcon className="w-6 h-6 text-[#315C9D]" strokeWidth={2} aria-hidden="true" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-bold text-[#111827] leading-tight">{line.productName}</h3>
                    <p className="text-[11px] text-gray-500 mt-0.5 truncate">A/c {line.displayAccountNumber} · {line.upiId}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <div className="text-[10px] text-gray-500">{t.available}</div>
                    <div className="text-base font-black text-[#315C9D] leading-tight">{line.availableLimit}</div>
                  </div>
                </div>

                {/* Usage bar */}
                <div className="flex items-center justify-between text-[11px] text-gray-500 mb-1.5">
                  <span>{t.spent} {line.usedAmount}</span>
                  <span>{t.totalLimit} {line.totalLimit}</span>
                </div>
                <div className="w-full h-2 bg-[#315C9D]/10 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${usagePct}%` }}
                    transition={{ delay: 0.25 + index * 0.08, duration: 0.8 }}
                    className="h-full bg-[#315C9D] rounded-full motion-reduce:transition-none"
                  />
                </div>

                <div className="mt-3 inline-flex items-center gap-1.5 text-[11px] font-medium text-[#2da94f]">
                  <Landmark className="w-3.5 h-3.5" strokeWidth={2} aria-hidden="true" />
                  {t.autoRepaid}
                </div>

                {/* Usage restriction */}
                {usage && (
                  <div className="mt-3 bg-[#f9fafb] border border-[#e5e7eb] rounded-lg p-3 flex items-start gap-2.5">
                    <Info className="w-4 h-4 text-[#6b7280] mt-0.5 flex-shrink-0" aria-hidden="true" />
                    <div>
                      <p className="text-[12px] font-semibold text-[#111827] mb-0.5">{t.usageTitle}</p>
                      <p className="text-[11px] text-[#6b7280] leading-relaxed">{usage}</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Transactions — only once there is spending (UPI connected) */}
              {line.transactions.length > 0 && (
              <div className="border-t border-gray-100">
                <button
                  onClick={() => setExpandedCard(isExpanded ? null : line.id)}
                  aria-expanded={isExpanded}
                  className="w-full flex items-center justify-between px-4 py-3 text-left focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#315C9D]"
                >
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-[#315C9D]" strokeWidth={2} aria-hidden="true" />
                    <span className="text-[13px] font-semibold text-[#111827]">{t.recentTx} ({line.transactions.length})</span>
                  </div>
                  {isExpanded ? (
                    <ChevronUp className="w-5 h-5 text-gray-400" aria-hidden="true" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-gray-400" aria-hidden="true" />
                  )}
                </button>

                {isExpanded && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="px-4 pb-4 space-y-2">
                    {line.transactions.map((tx) => (
                      <div key={tx.id} className="flex items-start gap-3 p-3 bg-[#f9fafb] border border-gray-100 rounded-xl">
                        <div className="w-9 h-9 rounded-full bg-[#315C9D]/10 flex items-center justify-center flex-shrink-0">
                          <CreditCard className="w-4 h-4 text-[#315C9D]" strokeWidth={2} aria-hidden="true" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between mb-1 gap-2">
                            <div className="text-[13px] font-semibold text-[#111827] truncate">{tx.merchant}</div>
                            <div className="text-[13px] font-bold text-[#111827] flex-shrink-0">{tx.amount}</div>
                          </div>
                          <div className="flex items-center gap-1.5 text-[11px] text-gray-500">
                            <Calendar className="w-3 h-3" aria-hidden="true" />
                            <span>{tx.date} • {tx.time}</span>
                          </div>
                          <div className="flex items-center gap-1 text-[11px] text-gray-400 mt-0.5">
                            <MapPin className="w-3 h-3" aria-hidden="true" />
                            <span className="truncate">{tx.location}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </motion.div>
                )}
              </div>
              )}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
