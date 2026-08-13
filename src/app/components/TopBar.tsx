import { useState } from 'react';
import { useNavigate } from 'react-router';
import { ArrowLeft, Globe } from 'lucide-react';
import { useLanguage } from '../hooks/useLanguage';
import kalanjiyamLogo from '@/assets/kalanjiyam-logo.svg';
import tnEmblem from '@/assets/tamil-nadu-emblem.png';

interface TopBarProps {
  /** Show the back arrow. Set to false on entry/terminal screens where going back is not meaningful. */
  showBack?: boolean;
  /** Custom back handler. Defaults to router history back. */
  onBack?: () => void;
  /** Show the Tamil Nadu government emblem alongside the Kalanjiyam logo (co-branded lockup). */
  showGovtLogo?: boolean;
}

/**
 * Standard app top bar: back button (optional), centered Kalanjiyam logo, and
 * a language switcher. Matches the landing page header and keeps the selected
 * language in sync across screens via the shared useLanguage hook.
 */
export function TopBar({ showBack = true, onBack, showGovtLogo = false }: TopBarProps) {
  const navigate = useNavigate();
  const [language, setLanguage] = useLanguage();
  const [showLanguageMenu, setShowLanguageMenu] = useState(false);

  return (
    <header className="w-full bg-[#f9fafb] border-b border-[#e5e7eb] sticky top-0 z-50 flex items-center py-3 px-2 flex-shrink-0">
      <div className="max-w-lg mx-auto w-full flex items-center justify-between">
        {showBack ? (
          <button
            onClick={onBack ?? (() => navigate(-1))}
            aria-label="Go back"
            className="w-12 h-12 flex items-center justify-center hover:bg-gray-100 rounded-lg transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#315C9D]"
          >
            <ArrowLeft className="w-6 h-6 text-[#111827]" />
          </button>
        ) : (
          <div className="w-12 h-12" aria-hidden="true" />
        )}

        {showGovtLogo ? (
          <div className="flex items-center gap-2.5">
            <img src={tnEmblem} alt="Government of Tamil Nadu" className="h-[38px] w-auto object-contain" />
            <div className="w-px h-5 bg-[#e5e7eb]" aria-hidden="true" />
            <img src={kalanjiyamLogo} alt="Kalanjiyam" className="h-5 w-auto object-contain" />
          </div>
        ) : (
          <img src={kalanjiyamLogo} alt="Kalanjiyam" className="h-7 w-auto object-contain" />
        )}

        <div className="relative">
          <button
            onClick={() => setShowLanguageMenu(!showLanguageMenu)}
            aria-label="Change language"
            aria-haspopup="true"
            aria-expanded={showLanguageMenu}
            className="w-12 h-12 flex items-center justify-center hover:bg-gray-100 rounded-lg transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#315C9D]"
          >
            <Globe className="w-5 h-5 text-[#111827]" />
          </button>
          {showLanguageMenu && (
            <div className="absolute right-0 mt-1 bg-white rounded-lg shadow-lg border border-[#e5e7eb] py-1 min-w-[120px] z-50">
              {(['English', 'Tamil'] as const).map((l) => (
                <button
                  key={l}
                  onClick={() => { setLanguage(l); setShowLanguageMenu(false); }}
                  className={`w-full text-left px-4 py-2 text-sm hover:bg-[#f9fafb] ${language === l ? 'text-[#315C9D] font-semibold' : 'text-[#111827]'}`}
                >
                  {l === 'English' ? 'English' : 'தமிழ் (Tamil)'}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
