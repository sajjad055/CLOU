import { useState } from 'react';
import { useNavigate } from 'react-router';
import { motion } from 'motion/react';
import { CreditCard, User, Search, Clock, FileText, BarChart3, Umbrella, RefreshCcw } from 'lucide-react';
import kalanjiyamLogo from '@/assets/kalanjiyam-logo.svg';
import { ActivatedAdvancesDashboard } from './ActivatedAdvancesDashboard';

const appItems = [
  { id: 'pay-slips', title: 'Pay Slips', icon: FileText },
  { id: 'gpf', title: 'GPF Balance', icon: BarChart3 },
  { id: 'insurance', title: 'Group Insurance', icon: Umbrella },
  { id: 'reimbursements', title: 'Reimbursements', icon: RefreshCcw },
];

/** Demo data used by the "Load demo data" button when nothing is activated yet. */
const DEMO_ACTIVATED = [
  { id: 'festival', nameEn: 'Festival Advance', nameTa: 'பண்டிகை முன்பணம்', amount: '₹50,000', accountPrefix: 'festival', accountNumber: 'festival1234567890' },
  { id: 'gadget', nameEn: 'Gadget Purchase Advance', nameTa: 'கேஜெட் கொள்முதல் முன்பணம்', amount: '₹75,000', accountPrefix: 'gadget', accountNumber: 'gadget9876543210' },
];

function hasActivatedLines(): boolean {
  try {
    const raw = localStorage.getItem('activatedCreditLines');
    if (!raw) return false;
    const arr = JSON.parse(raw);
    return Array.isArray(arr) && arr.length > 0;
  } catch {
    return false;
  }
}

export function CreditLineDashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'apps' | 'advance'>('advance');
  const hasLines = hasActivatedLines();

  const tabs: { id: 'apps' | 'advance'; label: string }[] = [
    { id: 'apps', label: 'My Apps' },
    { id: 'advance', label: 'Advance' },
  ];

  const populateTestData = () => {
    try {
      localStorage.setItem('activatedCreditLines', JSON.stringify(DEMO_ACTIVATED));
    } catch {
      // Storage unavailable — nothing to load.
    }
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-[#f9f9ff] pb-24 relative overflow-hidden">
      {/* Watermark Background Pattern */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none">
        <div className="w-full h-full" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M10 10h10v10H10zM40 40h10v10H40zM70 70h10v10H70z' fill='%23315C9D' fill-opacity='0.5'/%3E%3C/svg%3E")`,
          backgroundRepeat: 'repeat'
        }}></div>
      </div>

      {/* Header */}
      <header className="fixed top-0 left-0 w-full z-50 bg-[#315C9D] text-white shadow-md">
        <div className="max-w-lg mx-auto relative flex items-center justify-between px-4 py-3.5">
          <button
            aria-label="Profile"
            className="relative w-10 h-10 rounded-full bg-white/15 ring-1 ring-white/30 overflow-hidden flex items-center justify-center shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
          >
            <User className="w-5 h-5 text-white" aria-hidden="true" />
            <img
              src="https://images.unsplash.com/photo-1720462717810-53de0eb9c3c6?crop=faces&fit=crop&w=96&h=96&q=80"
              alt=""
              className="absolute inset-0 w-full h-full object-cover"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />
          </button>
          <img src={kalanjiyamLogo} alt="Kalanjiyam" className="absolute left-1/2 -translate-x-1/2 h-7 w-auto object-contain brightness-0 invert" />
          <div className="flex items-center gap-2 shrink-0">
            <button
              aria-label="Recent activity"
              className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-white/10 transition-colors active:scale-95 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
            >
              <Clock className="w-5 h-5 text-white" />
            </button>
            <button
              aria-label="Search"
              className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-white/10 transition-colors active:scale-95 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
            >
              <Search className="w-5 h-5 text-white" />
            </button>
          </div>
        </div>
      </header>

      {/* Tabs */}
      <div className="fixed top-[68px] left-0 w-full z-40 bg-[#f9f9ff]/95 backdrop-blur-sm border-b border-gray-100">
        <div className="max-w-lg mx-auto flex items-center gap-7 px-6">
          {tabs.map((tab) => {
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`relative py-3 text-sm font-bold uppercase tracking-wide transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#315C9D] ${
                  active ? 'text-[#315C9D]' : 'text-gray-400 hover:text-gray-600'
                }`}
              >
                {tab.label}
                {active && (
                  <span className="absolute left-0 right-0 -bottom-px h-0.5 bg-[#315C9D] rounded-full" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 pt-[124px]">
        {activeTab === 'apps' ? (
          <section className="grid grid-cols-2 gap-4">
            {appItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  className="w-full aspect-square bg-white rounded-2xl shadow-[0_2px_12px_rgba(0,0,0,0.06)] flex flex-col items-center justify-center text-center px-4 active:scale-[0.98] transition-transform focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#315C9D]"
                >
                  <div className="w-16 h-16 rounded-full bg-[#315C9D]/10 flex items-center justify-center mb-3">
                    <Icon className="w-7 h-7 text-[#315C9D]" strokeWidth={1.75} />
                  </div>
                  <h3 className="text-[12px] font-bold text-[#111827] leading-tight uppercase tracking-wide">
                    {item.title}
                  </h3>
                </button>
              );
            })}
          </section>
        ) : hasLines ? (
          <ActivatedAdvancesDashboard />
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white border border-gray-200 rounded-2xl p-8 text-center mt-6"
          >
            <div className="w-14 h-14 rounded-2xl bg-[#315C9D]/10 flex items-center justify-center mx-auto mb-4">
              <CreditCard className="w-7 h-7 text-[#315C9D]" strokeWidth={2} />
            </div>
            <h3 className="text-lg font-bold text-[#111827] mb-1">No credit lines yet</h3>
            <p className="text-sm text-[#6b7280] mb-6">
              Complete the journey to activate your salary advances and see them here.
            </p>
            <div className="flex flex-col gap-2.5">
              <button
                onClick={() => navigate('/')}
                className="w-full h-12 rounded-lg bg-[#315C9D] text-white font-semibold text-base transition-colors"
              >
                Start Activation Journey
              </button>
              <button
                onClick={populateTestData}
                className="w-full h-12 rounded-lg bg-transparent text-[#315C9D] font-semibold text-base hover:bg-[#315C9D]/5 transition-colors"
              >
                Load demo data
              </button>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
