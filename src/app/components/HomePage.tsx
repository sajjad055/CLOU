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
  Heart,
  ChevronRight,
  ShieldCheck,
  CheckCircle2,
  Lock,
  ArrowRight,
} from 'lucide-react';
import kalanjiyamLogo from '@/assets/kalanjiyam-logo.svg';
import { Stepper } from './Stepper';
import { ActivatedAdvancesDashboard } from './ActivatedAdvancesDashboard';
import { getActiveFlow, hrmsEntryRoute, isHrmsFlow } from '../flows/hrmsFlows';
import { resetJourney } from '../flows/hrmsJourney';
import { useLanguage } from '../hooks/useLanguage';
import {
  KYC_STEPS,
  KYC_TOTAL_STEPS,
  kycPercent,
  kycStatusOf,
  useSalaryAdvanceState,
} from '../state/salaryAdvance';

type TabId = 'salary-advance' | 'kyc';

interface AdvanceType {
  id: string;
  icon: any;
  titleEn: string;
  titleTa: string;
  descEn: string;
  descTa: string;
}

const ADVANCE_TYPES: AdvanceType[] = [
  { id: 'festival', icon: PartyPopper, titleEn: 'Festival Advance', titleTa: 'பண்டிகை முன்பணம்', descEn: 'For Pongal, Deepavali & more', descTa: 'பொங்கல், தீபாவளி மற்றும் பலவற்றிற்கு' },
  { id: 'long-term', icon: Clock, titleEn: 'Long Term Advance', titleTa: 'நீண்ட கால முன்பணம்', descEn: 'Repay over a longer tenure', descTa: 'நீண்ட காலத்தில் திருப்பிச் செலுத்தலாம்' },
  { id: 'short-term', icon: IndianRupee, titleEn: 'Short Term Advance', titleTa: 'குறுகிய கால முன்பணம்', descEn: 'Quick, short-tenure support', descTa: 'விரைவான, குறுகிய கால உதவி' },
  { id: 'pay-advance', icon: PiggyBank, titleEn: 'Pay Advance', titleTa: 'சம்பள முன்பணம்', descEn: 'Advance against your salary', descTa: 'உங்கள் சம்பளத்திற்கு எதிரான முன்பணம்' },
];

export function HomePage() {
  const navigate = useNavigate();
  const [language] = useLanguage();
  const state = useSalaryAdvanceState();
  const [activeTab, setActiveTab] = useState<TabId>('salary-advance');
  const [favorites, setFavorites] = useState<Set<string>>(new Set());

  const isTa = language === 'Tamil';
  const status = kycStatusOf(state);
  const percent = kycPercent(state);
  const kycDone = status === 'complete';
  const activated = state.advanceActivated;

  const t = {
    tabSalary: isTa ? 'சம்பள முன்பணம்' : 'Salary Advance',
    tabKyc: isTa ? 'KYC நிலை' : 'KYC Status',
    quote: 'கல்வி தரும் நனிநல்ல கற்றார்முன் சொல்லா திருக்கப் பெறின்.',

    upiTitle: isTa ? 'யூபிஐ மூலம் முன்பணம்' : 'Advances on UPI',
    upiNew: isTa ? 'புதியது' : 'New',
    upiDesc: isTa ? 'உங்கள் UPI ஐடிக்கு உடனடி முன்பணம்' : 'Instant advance credited to your UPI ID',
    whatFor: isTa ? 'எதற்காக முன்பணம் பெறலாம்?' : 'What can you take an advance for?',

    // Locked banner (KYC not complete) on the Salary Advance tab
    lockedTitle: isTa ? 'சம்பள முன்பணத்தைத் திறக்க KYC முடிக்கவும்' : 'Complete KYC to unlock salary advances',
    lockedNotStarted: isTa
      ? 'உங்கள் சம்பள முன்பணத்தைச் செயல்படுத்த சரிபார்ப்பை முடிக்கவும்.'
      : 'Finish verification to activate your salary advance.',
    lockedInProgress: isTa
      ? `உங்கள் KYC ${percent}% முடிந்துள்ளது. முன்பணத்தைச் செயல்படுத்த முடிக்கவும்.`
      : `You've completed ${percent}% of your KYC. Finish it to activate your salary advance.`,
    startKyc: isTa ? 'தொடங்குங்கள்' : 'Get started',
    continueKyc: isTa ? 'தொடரவும்' : 'Continue',

    // KYC done — Salary Advance tab banner (advances not yet activated)
    kycDoneTitle: isTa ? 'KYC வெற்றிகரமாக முடிந்தது' : 'KYC is successfully done',
    kycDoneBody: isTa
      ? '“யூபிஐ மூலம் முன்பணம்” திறந்து உங்கள் சம்பள முன்பணங்களைத் தேர்ந்தெடுத்து செயல்படுத்தவும்.'
      : 'Open “Advances on UPI” below to choose and activate your salary advances.',

    // KYC complete, not activated
    kycCompleteTitle: isTa ? 'உங்கள் KYC முடிந்தது!' : 'Your KYC is complete!',
    kycCompleteBody: isTa
      ? 'இப்போது உங்கள் சம்பள முன்பணத்தைச் செயல்படுத்தலாம்.'
      : 'You can now activate your salary advance.',
    activateBtn: isTa ? 'சம்பள முன்பணங்களுக்குச் செல்லவும்' : 'Go to salary advances',

    // Activated
    activatedTitle: isTa ? 'உங்கள் சம்பள முன்பணம் செயலில் உள்ளது' : 'Your salary advance is active',
    activatedBody: isTa
      ? 'உங்கள் முன்பணங்களை எந்த UPI பயன்பாட்டிலும் பயன்படுத்தலாம்.'
      : 'Use your advances across any UPI app.',
    viewAdvances: isTa ? 'எனது முன்பணங்களைக் காண்க' : 'View my advances',
    activeCount: (n: number) => (isTa ? `${n} முன்பணம் செயலில்` : `${n} advance${n === 1 ? '' : 's'} active`),
    totalAvailable: isTa ? 'மொத்தம் கிடைக்கும்' : 'Total available',

    // Complete KYC tab
    kycHeader: isTa ? 'உங்கள் KYC முடிக்கவும்' : 'Complete your KYC',
    kycIntroNotStarted: isTa
      ? 'உங்கள் சம்பள முன்பணத்தைச் செயல்படுத்த இந்தப் படிகளை முடிக்கவும்.'
      : 'Complete these steps to activate your salary advance.',
    kycIntroInProgress: isTa
      ? `நீங்கள் ${percent}% முடித்துவிட்டீர்கள். சம்பள முன்பணத்தைச் செயல்படுத்த KYC முடிக்கவும்.`
      : `You are ${percent}% complete. Finish KYC to activate your salary advance.`,
    kycCompleteBanner: isTa
      ? 'உங்கள் KYC முடிந்தது. உங்கள் சம்பள முன்பணத்தைச் செயல்படுத்தவும்.'
      : 'Your KYC is complete. Activate your salary advance.',
    stepDone: isTa ? 'முடிந்தது' : 'Done',
    stepInProgress: isTa ? 'நடைபெறுகிறது' : 'In progress',
    stepPending: isTa ? 'நிலுவையில்' : 'Pending',
    progressLabel: isTa ? 'KYC முன்னேற்றம்' : 'KYC progress',
  };

  const toggleFavorite = (id: string) => {
    setFavorites((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  // Default HRMS journey to start from the home screen when no HRMS flow is
  // already selected. Kept in sync with DEFAULT_FLOW in App.tsx.
  const DEFAULT_HRMS_FLOW = 'hrms-pan-ntb';

  /**
   * Start (or continue) the KYC journey. The home screen always leads into the
   * HRMS journey — if the active flow is a legacy/non-HRMS flow (e.g. stale
   * storage), coerce it to the default HRMS flow so Get Started can never drop
   * the user into the old CKYC/PAN entry.
   */
  const startKycJourney = () => {
    let flow = getActiveFlow();
    if (!isHrmsFlow(flow)) {
      try {
        localStorage.setItem('activeFlow', DEFAULT_HRMS_FLOW);
      } catch {
        // Storage unavailable — navigation below still targets the HRMS entry.
      }
      resetJourney();
      flow = DEFAULT_HRMS_FLOW;
    }
    // Partway through → show the "continue where you left off" resume screen,
    // which hands off to the middle of the HRMS journey (Aadhaar). A fresh start
    // begins at the HRMS entry.
    if (status === 'in-progress') {
      navigate('/kyc-resume');
      return;
    }
    navigate(hrmsEntryRoute(flow) ?? '/hrms-details');
  };

  /** Advances-on-UPI / advance cards: once KYC is done they open the separate
   *  select-advances page; while KYC is pending they start (or resume) the KYC
   *  journey. */
  const handleAdvanceClick = () => {
    if (kycDone) {
      navigate('/select-advances');
      return;
    }
    startKycJourney();
  };

  const tabs: { id: TabId; label: string }[] = [
    { id: 'salary-advance', label: t.tabSalary },
    { id: 'kyc', label: t.tabKyc },
  ];

  const onTabKeyDown = (e: React.KeyboardEvent) => {
    if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
    e.preventDefault();
    const idx = tabs.findIndex((tab) => tab.id === activeTab);
    const nextIdx = e.key === 'ArrowRight' ? (idx + 1) % tabs.length : (idx - 1 + tabs.length) % tabs.length;
    setActiveTab(tabs[nextIdx].id);
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
        <div
          role="tablist"
          aria-label={isTa ? 'சம்பள முன்பணம் மற்றும் KYC' : 'Salary advance and KYC'}
          onKeyDown={onTabKeyDown}
          className="max-w-lg mx-auto flex items-center gap-6 px-6"
        >
          {tabs.map((tab) => {
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                role="tab"
                id={`tab-${tab.id}`}
                aria-selected={active}
                aria-controls={`panel-${tab.id}`}
                tabIndex={active ? 0 : -1}
                onClick={() => setActiveTab(tab.id)}
                className={`relative py-3 text-[13px] font-bold uppercase tracking-wide transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#315C9D] ${
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
        <h1 className="sr-only">{activeTab === 'salary-advance' ? t.tabSalary : t.tabKyc}</h1>

        {/* Quote — hidden when the Salary Advance tab shows the offers/activated
            screens, which carry their own heading. */}
        {!(activeTab === 'salary-advance' && activated) && (
          <div className="mb-8 text-center px-2">
            <p className="text-[15px] text-gray-600 font-semibold italic leading-relaxed">
              '{t.quote}'
            </p>
          </div>
        )}

        {/* ── Salary Advance tab ─────────────────────────────────────────── */}
        {activeTab === 'salary-advance' && (
          <div id="panel-salary-advance" role="tabpanel" aria-labelledby="tab-salary-advance" tabIndex={0} className="focus-visible:outline-none">
            {activated ? (
              <ActivatedAdvancesDashboard />
            ) : (
              <>
                {kycDone ? renderKycDoneBanner() : renderLockedBanner()}

            {/* Main feature — Advances on UPI. Muted/greyed while KYC is pending;
                once KYC is done it becomes the active entry to pick and activate
                advances. */}
            <button
              onClick={handleAdvanceClick}
              className={`relative w-full rounded-2xl px-5 py-4 flex items-center gap-4 mb-6 active:scale-[0.99] transition-transform text-left focus-visible:outline-2 focus-visible:outline-offset-2 ${
                kycDone
                  ? 'bg-[#315C9D] text-white shadow-[0_6px_18px_rgba(49,92,157,0.35)] focus-visible:outline-white'
                  : 'bg-gray-50 border border-gray-100 text-gray-600 opacity-70 focus-visible:outline-[#315C9D]'
              }`}
            >
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${kycDone ? 'bg-white/20' : 'bg-gray-200/70'}`}>
                <Wallet className={`w-6 h-6 ${kycDone ? 'text-white' : 'text-gray-400'}`} aria-hidden="true" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <h3 className={`text-sm font-bold leading-tight ${kycDone ? 'text-white' : 'text-gray-700'}`}>{t.upiTitle}</h3>
                  <span className={`text-[9px] font-bold uppercase tracking-wide px-1.5 py-0.5 rounded-full ${kycDone ? 'bg-white text-[#315C9D]' : 'bg-gray-200 text-gray-500'}`}>{t.upiNew}</span>
                </div>
                <p className={`text-xs leading-snug ${kycDone ? 'text-white/80' : 'text-gray-500'}`}>{t.upiDesc}</p>
              </div>
              <ChevronRight className={`w-5 h-5 shrink-0 ${kycDone ? 'text-white/70' : 'text-gray-300'}`} strokeWidth={2.5} aria-hidden="true" />
            </button>

            {/* Advance types list */}
            <h2 className="text-sm font-bold text-[#111827] mb-3">{t.whatFor}</h2>
            <div className="space-y-2.5">
              {ADVANCE_TYPES.map((item) => {
                const Icon = item.icon;
                const isFav = favorites.has(item.id);
                const title = isTa ? item.titleTa : item.titleEn;
                const desc = isTa ? item.descTa : item.descEn;
                return (
                  <div key={item.id} className="relative">
                    <button
                      onClick={handleAdvanceClick}
                      className="w-full flex items-center gap-3 bg-white border border-gray-100 rounded-xl p-3 pr-14 shadow-[0_1px_6px_rgba(0,0,0,0.04)] active:scale-[0.99] transition-transform text-left focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#315C9D]"
                    >
                      <div className="w-11 h-11 rounded-xl bg-[#315C9D]/10 flex items-center justify-center shrink-0">
                        <Icon className="w-5 h-5 text-[#315C9D]" strokeWidth={2} aria-hidden="true" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-semibold text-[#111827] leading-tight">{title}</h4>
                        <p className="text-[11px] text-gray-500 leading-snug mt-0.5">{desc}</p>
                      </div>
                    </button>
                    <button
                      onClick={() => toggleFavorite(item.id)}
                      aria-label={isFav ? `Remove ${title} from favourites` : `Add ${title} to favourites`}
                      aria-pressed={isFav}
                      className="absolute top-1/2 -translate-y-1/2 right-3 w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#315C9D]"
                    >
                      <Heart
                        className={`w-4 h-4 transition-colors ${isFav ? 'fill-[#315C9D] text-[#315C9D]' : 'text-gray-300'}`}
                        strokeWidth={2}
                        aria-hidden="true"
                      />
                    </button>
                  </div>
                );
              })}
            </div>
              </>
            )}
          </div>
        )}

        {/* ── Complete KYC tab ───────────────────────────────────────────── */}
        {activeTab === 'kyc' && (
          <div id="panel-kyc" role="tabpanel" aria-labelledby="tab-kyc" tabIndex={0} className="focus-visible:outline-none">
            {kycDone ? renderKycCompleteBanner() : renderKycChecklist()}
          </div>
        )}
      </main>
    </div>
  );

  // ── Sub-renders ─────────────────────────────────────────────────────────

  /** Locked banner on the Salary Advance tab — progress + a CTA into the flow. */
  function renderLockedBanner() {
    const notStarted = status === 'not-started';
    return (
      <section className="mb-6 rounded-2xl border border-[#315C9D]/15 bg-white p-5 shadow-[0_1px_6px_rgba(0,0,0,0.04)]">
        <div className="flex items-start gap-3 mb-4">
          <div className="w-11 h-11 rounded-xl bg-[#315C9D]/10 flex items-center justify-center shrink-0">
            <Lock className="w-5 h-5 text-[#315C9D]" strokeWidth={2} aria-hidden="true" />
          </div>
          <div className="min-w-0">
            <h2 className="text-sm font-bold text-[#111827] leading-tight">{t.lockedTitle}</h2>
            <p className="text-[12px] text-[#6b7280] leading-relaxed mt-1">
              {notStarted ? t.lockedNotStarted : t.lockedInProgress}
            </p>
          </div>
        </div>

        {!notStarted && (
          <div className="mb-4">
            <div className="flex items-center justify-between text-[11px] font-semibold text-[#6b7280] mb-1.5">
              <span>{t.progressLabel}</span>
              <span className="text-[#315C9D]">{percent}%</span>
            </div>
            {renderProgressBar(percent)}
          </div>
        )}

        <button
          onClick={startKycJourney}
          className="w-full h-12 rounded-lg bg-[#315C9D] text-white font-semibold text-base flex items-center justify-center gap-2 active:scale-[0.99] transition-transform focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#315C9D]"
        >
          {notStarted ? t.startKyc : t.continueKyc}
          <ArrowRight className="w-5 h-5" strokeWidth={2.5} aria-hidden="true" />
        </button>
      </section>
    );
  }

  /** "KYC is successfully done" banner on the Salary Advance tab, shown above
   *  the now-active Advances-on-UPI block. Informational — the block itself is
   *  the action. */
  function renderKycDoneBanner() {
    return (
      <section className="mb-6 rounded-2xl border border-[#2da94f]/25 bg-[#eaf7ef] p-5">
        <div className="flex items-start gap-3">
          <div className="w-11 h-11 rounded-full bg-[#2da94f]/15 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-6 h-6 text-[#2da94f]" strokeWidth={2} aria-hidden="true" />
          </div>
          <div className="min-w-0">
            <h2 className="text-sm font-bold text-[#111827] leading-tight">{t.kycDoneTitle}</h2>
            <p className="text-[12px] text-[#4b5563] leading-relaxed mt-1">{t.kycDoneBody}</p>
          </div>
        </div>
      </section>
    );
  }

  /** "KYC complete" banner on the Complete KYC tab — sends the user to the
   *  Salary Advance tab, where the eligible advances are now selected inline. */
  function renderKycCompleteBanner() {
    return (
      <section className="mb-6 rounded-2xl border border-[#2da94f]/25 bg-[#eaf7ef] p-5">
        <div className="flex items-start gap-3 mb-4">
          <div className="w-11 h-11 rounded-full bg-[#2da94f]/15 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-6 h-6 text-[#2da94f]" strokeWidth={2} aria-hidden="true" />
          </div>
          <div className="min-w-0">
            <h2 className="text-sm font-bold text-[#111827] leading-tight">{t.kycCompleteTitle}</h2>
            <p className="text-[12px] text-[#4b5563] leading-relaxed mt-1">{t.kycCompleteBody}</p>
          </div>
        </div>
        <button
          onClick={() => setActiveTab('salary-advance')}
          className="w-full h-12 rounded-lg bg-[#315C9D] text-white font-semibold text-base flex items-center justify-center gap-2 active:scale-[0.99] transition-transform focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#315C9D]"
        >
          {t.activateBtn}
          <ArrowRight className="w-5 h-5" strokeWidth={2.5} aria-hidden="true" />
        </button>
      </section>
    );
  }

  /** The KYC step checklist (not started / in progress) on the Complete KYC tab. */
  function renderKycChecklist() {
    const notStarted = status === 'not-started';
    return (
      <>
        <section className="mb-6 rounded-2xl border border-[#315C9D]/15 bg-white p-5 shadow-[0_1px_6px_rgba(0,0,0,0.04)]">
          <div className="flex items-start gap-3 mb-4">
            <div className="w-11 h-11 rounded-xl bg-[#315C9D]/10 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-5 h-5 text-[#315C9D]" strokeWidth={2} aria-hidden="true" />
            </div>
            <div className="min-w-0">
              <h2 className="text-sm font-bold text-[#111827] leading-tight">{t.kycHeader}</h2>
              <p className="text-[12px] text-[#6b7280] leading-relaxed mt-1">
                {notStarted ? t.kycIntroNotStarted : t.kycIntroInProgress}
              </p>
            </div>
          </div>

          <div className="mb-4">
            <div className="flex items-center justify-between text-[11px] font-semibold text-[#6b7280] mb-1.5">
              <span>{t.progressLabel}</span>
              <span className="text-[#315C9D]">{percent}%</span>
            </div>
            {renderProgressBar(percent)}
          </div>

          {/* CTA lives inside the module so it stays above the fold, before the
              step list. */}
          <button
            onClick={startKycJourney}
            className="w-full h-12 rounded-lg bg-[#315C9D] text-white font-semibold text-base flex items-center justify-center gap-2 active:scale-[0.99] transition-transform focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#315C9D]"
          >
            {notStarted ? t.startKyc : t.continueKyc}
            <ArrowRight className="w-5 h-5" strokeWidth={2.5} aria-hidden="true" />
          </button>
        </section>

        {/* Step checklist — vertical progress stepper */}
        <div className="mb-6">
          <Stepper
            steps={KYC_STEPS.map((step) => ({
              id: step.id,
              title: isTa ? step.labelTa : step.labelEn,
              description: isTa ? step.descTa : step.descEn,
            }))}
            completedCount={state.completedSteps}
            labels={{ done: t.stepDone, inProgress: t.stepInProgress, pending: t.stepPending }}
          />
        </div>
      </>
    );
  }

  function renderProgressBar(value: number) {
    return (
      <div
        className="w-full h-2 bg-[#315C9D]/10 rounded-full overflow-hidden"
        role="progressbar"
        aria-valuenow={value}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={`${t.progressLabel} ${value}%`}
      >
        <div
          className="h-full bg-[#315C9D] rounded-full transition-[width] duration-700 ease-out motion-reduce:transition-none"
          style={{ width: `${value}%` }}
        />
      </div>
    );
  }
}
