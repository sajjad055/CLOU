import { useState } from 'react';
import { useNavigate } from 'react-router';
import {
  User,
  Search,
  Clock,
  Wallet,
  PartyPopper,
  IndianRupee,
  PiggyBank,
  FileText,
  BarChart3,
  Umbrella,
  RefreshCcw,
  Heart,
  ChevronRight,
} from 'lucide-react';
import kalanjiyamLogo from '@/assets/kalanjiyam-logo.svg';

type TabId = 'apps' | 'advance';

interface GridItem {
  id: string;
  title: string;
  icon: any;
  isNew?: boolean;
  onClick?: () => void;
}

export function HomePage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<TabId>('advance');
  const [favorites, setFavorites] = useState<Set<string>>(new Set());

  const toggleFavorite = (id: string) => {
    setFavorites((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  // Advance types available under the "Advances on UPI" feature
  const advanceTypes: { id: string; title: string; description: string; icon: any }[] = [
    { id: 'festival', title: 'Festival Advance', description: 'For Pongal, Deepavali & more', icon: PartyPopper },
    { id: 'long-term', title: 'Long Term Advance', description: 'Repay over a longer tenure', icon: Clock },
    { id: 'short-term', title: 'Short Term Advance', description: 'Quick, short-tenure support', icon: IndianRupee },
    { id: 'pay-advance', title: 'Pay Advance', description: 'Advance against your salary', icon: PiggyBank },
  ];

  const appItems: GridItem[] = [
    { id: 'pay-slips', title: 'Pay Slips', icon: FileText },
    { id: 'gpf', title: 'GPF Balance', icon: BarChart3 },
    { id: 'insurance', title: 'Group Insurance', icon: Umbrella },
    { id: 'reimbursements', title: 'Reimbursements', icon: RefreshCcw },
  ];

  const tabs: { id: TabId; label: string }[] = [
    { id: 'apps', label: 'My Apps' },
    { id: 'advance', label: 'Advance' },
  ];

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

      {/* Main Content */}
      <main className="pt-[124px] px-6 max-w-lg mx-auto relative">
        {/* Quote */}
        <div className="mb-8 text-center px-2">
          <p className="text-[15px] text-gray-600 font-semibold italic leading-relaxed">
            'கல்வி தரும் நனிநல்ல கற்றார்முன் சொல்லா திருக்கப் பெறின்.'
          </p>
        </div>

        {activeTab === 'advance' ? (
          <>
            {/* Main feature — Advances on UPI */}
            <button
              onClick={() => navigate('/advances-upi')}
              className="relative w-full bg-[#315C9D] text-white rounded-2xl px-5 py-4 flex items-center gap-4 mb-6 active:scale-[0.99] transition-transform text-left focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#315C9D]"
            >
              <div className="w-12 h-12 rounded-xl bg-white/15 flex items-center justify-center shrink-0">
                <Wallet className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <h3 className="text-sm font-bold leading-tight">Advances on UPI</h3>
                  <span className="text-[9px] font-bold uppercase tracking-wide bg-white/20 px-1.5 py-0.5 rounded-full">New</span>
                </div>
                <p className="text-xs text-white/70 leading-snug">Instant advance credited to your UPI ID</p>
              </div>
              <ChevronRight className="w-5 h-5 text-white/50 shrink-0" strokeWidth={2.5} />
            </button>

            {/* Advance types list */}
            <h2 className="text-sm font-bold text-[#111827] mb-3">What can you take an advance for?</h2>
            <div className="space-y-2.5">
              {advanceTypes.map((item) => {
                const Icon = item.icon;
                const isFav = favorites.has(item.id);
                return (
                  <div key={item.id} className="relative">
                    <button
                      onClick={() => navigate('/advances-upi')}
                      className="w-full flex items-center gap-3 bg-white border border-gray-100 rounded-xl p-3 pr-14 shadow-[0_1px_6px_rgba(0,0,0,0.04)] active:scale-[0.99] transition-transform text-left focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#315C9D]"
                    >
                      <div className="w-11 h-11 rounded-xl bg-[#315C9D]/10 flex items-center justify-center shrink-0">
                        <Icon className="w-5 h-5 text-[#315C9D]" strokeWidth={2} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-semibold text-[#111827] leading-tight">{item.title}</h4>
                        <p className="text-[11px] text-gray-500 leading-snug mt-0.5">{item.description}</p>
                      </div>
                    </button>
                    <button
                      onClick={() => toggleFavorite(item.id)}
                      aria-label={isFav ? `Remove ${item.title} from favourites` : `Add ${item.title} to favourites`}
                      aria-pressed={isFav}
                      className="absolute top-1/2 -translate-y-1/2 right-3 w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#315C9D]"
                    >
                      <Heart
                        className={`w-4 h-4 transition-colors ${isFav ? 'fill-[#315C9D] text-[#315C9D]' : 'text-gray-300'}`}
                        strokeWidth={2}
                      />
                    </button>
                  </div>
                );
              })}
            </div>
          </>
        ) : (
          /* My Apps — service tiles */
          <section className="grid grid-cols-2 gap-4">
            {appItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={item.onClick}
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
        )}
      </main>
    </div>
  );
}
