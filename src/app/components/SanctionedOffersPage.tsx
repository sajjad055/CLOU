import { useEffect } from 'react';
import { TopBar } from './TopBar';
import { EligibleAdvancesSelector } from './EligibleAdvancesSelector';
import { markKycComplete } from '../state/salaryAdvance';

export function SanctionedOffersPage() {
  // Reaching the offers screen means identity verification cleared and the
  // customer is eligible — so KYC is complete from the home screen's point of
  // view, even if they don't activate an offer right now.
  useEffect(() => {
    markKycComplete();
  }, []);

  return (
    <div className="min-h-screen bg-white relative overflow-hidden flex flex-col">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none">
        <div className="w-full h-full" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M10 10h10v10H10zM40 40h10v10H40zM70 70h10v10H70z' fill='%23315C9D' fill-opacity='0.5'/%3E%3C/svg%3E")`,
          backgroundRepeat: 'repeat'
        }}></div>
      </div>

      {/* Header */}
      <TopBar showBack={false} />

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-lg mx-auto relative px-6 pt-6 pb-44">
          <EligibleAdvancesSelector />
        </div>
      </main>
    </div>
  );
}
