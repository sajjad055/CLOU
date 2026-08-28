import { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { Loader2 } from 'lucide-react';
import { TopBar } from './TopBar';
import { EligibleAdvancesSelector } from './EligibleAdvancesSelector';
import { useLanguage } from '../hooks/useLanguage';

/** How long the "fetching" loader shows before the advances list is revealed. */
const FETCH_MS = 2200;

/**
 * Separate page for choosing and activating salary advances. Reached from the
 * home Salary Advance tab (once KYC is done) by tapping the Advances-on-UPI
 * block.
 *
 * Because the advances may not be ready the instant the application is
 * submitted, the page first shows a short "fetching your salary advances"
 * loader, then reveals the congratulatory eligible-advances list where the user
 * selects and activates.
 */
export function SelectAdvancesPage() {
  const [selectedLanguage] = useLanguage();
  const [phase, setPhase] = useState<'fetching' | 'ready'>('fetching');
  const isTa = selectedLanguage === 'Tamil';

  useEffect(() => {
    const timer = setTimeout(() => setPhase('ready'), FETCH_MS);
    return () => clearTimeout(timer);
  }, []);

  const t = {
    fetching: isTa ? 'உங்கள் சம்பள முன்பணங்கள் பெறப்படுகின்றன…' : 'Fetching your salary advances…',
    fetchingSub: isTa
      ? 'நீங்கள் தகுதியான முன்பணங்களைப் பெறுகிறோம்.'
      : 'Getting the advances you are eligible for.',
  };

  return (
    <div className="min-h-screen bg-white relative overflow-hidden flex flex-col">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none">
        <div className="w-full h-full" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M10 10h10v10H10zM40 40h10v10H40zM70 70h10v10H70z' fill='%23315C9D' fill-opacity='0.5'/%3E%3C/svg%3E")`,
          backgroundRepeat: 'repeat'
        }}></div>
      </div>

      <TopBar showBack />

      {phase === 'fetching' ? (
        <main className="flex-1 flex flex-col items-center justify-center px-6" aria-live="polite">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="flex flex-col items-center text-center max-w-sm"
          >
            <div className="w-16 h-16 rounded-full border-4 border-[#ebecef] border-t-[#315C9D] animate-spin motion-reduce:animate-none mb-6" aria-hidden="true" />
            <div className="flex items-center gap-2 text-[#315C9D]">
              <Loader2 className="w-4 h-4 animate-spin motion-reduce:animate-none" strokeWidth={2.5} aria-hidden="true" />
              <p className="text-base font-semibold">{t.fetching}</p>
            </div>
            <p className="text-sm text-gray-500 leading-relaxed mt-2">{t.fetchingSub}</p>
          </motion.div>
        </main>
      ) : (
        <main className="flex-1 overflow-y-auto">
          <div className="max-w-lg mx-auto relative px-6 pt-6 pb-44">
            <EligibleAdvancesSelector />
          </div>
        </main>
      )}
    </div>
  );
}
