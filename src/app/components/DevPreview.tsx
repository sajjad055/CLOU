import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router';
import { Code2, X, Home, FileText, Phone, Lock, CheckCircle, Loader2, CreditCard, Settings, Sparkles, ShieldCheck, Fingerprint, FileCheck, Smartphone, AlertCircle, ChevronDown, ChevronUp } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { HRMS_FLOW_IDS, HRMS_FLOWS } from '../flows/hrmsFlows';
import { resetJourney } from '../flows/hrmsJourney';

/**
 * Every flow-entry path in the panel, mapped to the `activeFlow` value it sets.
 * The legacy `ckyc-only` and `combined` keys are preserved: they exist in
 * `handleNavigate` today without a matching `routes` entry.
 */
const FLOW_ENTRY_PATHS: Record<string, string> = {
  '/__flow-ckyc-only': 'ckyc-only',
  '/__flow-combined': 'combined',
  '/__flow-ntb-no-ckyc': 'ntb-no-ckyc',
  '/__flow-etb-no-ckyc': 'etb-no-ckyc',
  '/__flow-ntb-no-ckyc-id': 'ntb-no-ckyc-id',
  '/__flow-etb-no-ckyc-id': 'etb-no-ckyc-id',
  '/__flow-ntb-knows-ckyc': 'ntb-knows-ckyc',
  '/__flow-etb-knows-ckyc': 'etb-knows-ckyc',
  '/__flow-ntb-knows-ckyc-id': 'ntb-knows-ckyc-id',
  '/__flow-etb-knows-ckyc-id': 'etb-knows-ckyc-id',
  ...Object.fromEntries(HRMS_FLOW_IDS.map((id) => [`/__flow-${id}`, id])),
};

interface PageRoute {
  path: string;
  name: string;
  icon: any;
  description: string;
}

const routes: PageRoute[] = [
  // The five HRMS journeys lead the list. Label and description come straight
  // from the flow registry so the panel can never drift from HRMS_FLOWS.
  ...HRMS_FLOW_IDS.map((id) => ({
    path: `/__flow-${id}`,
    name: HRMS_FLOWS[id].labelEn,
    icon: Sparkles,
    description: HRMS_FLOWS[id].descriptionEn,
  })),
  { path: '/__flow-ntb-no-ckyc', name: '▶ NTB, No CKYC Number', icon: Sparkles, description: 'Phone → CKYC (don\'t know) → PAN → OTP → Dedupe → Aadhaar → Face → Offers' },
  { path: '/__flow-etb-no-ckyc', name: '▶ ETB, No CKYC Number', icon: Sparkles, description: 'Phone → CKYC (don\'t know) → PAN → OTP → ETB found → Skip Aadhaar → Offers' },
  { path: '/__flow-ntb-no-ckyc-id', name: '▶ NTB, No CKYC Number + Employee ID', icon: Sparkles, description: 'Phone → CKYC (don\'t know) → PAN → OTP → Dedupe → Aadhaar → Face → Employee ID → Offers' },
  { path: '/__flow-etb-no-ckyc-id', name: '▶ ETB, No CKYC Number + Employee ID', icon: Sparkles, description: 'Phone → CKYC (don\'t know) → PAN → OTP → ETB → Employee ID → Offers' },
  { path: '/__flow-ntb-knows-ckyc', name: '▶ NTB, User Knows CKYC Number', icon: Sparkles, description: 'Phone → CKYC (knows) → OTP → CKYC pull → PAN (pre-filled) → Aadhaar → Face → Offers' },
  { path: '/__flow-etb-knows-ckyc', name: '▶ ETB, User Knows CKYC Number', icon: Sparkles, description: 'Phone → CKYC (knows) → OTP → CKYC pull → PAN (pre-filled) → ETB → Offers' },
  { path: '/__flow-ntb-knows-ckyc-id', name: '▶ NTB, Knows CKYC Number + Employee ID', icon: Sparkles, description: 'Phone → CKYC (knows) → OTP → CKYC pull → PAN → Aadhaar → Face → Employee ID → Offers' },
  { path: '/__flow-etb-knows-ckyc-id', name: '▶ ETB, Knows CKYC Number + Employee ID', icon: Sparkles, description: 'Phone → CKYC (knows) → OTP → CKYC pull → PAN → ETB → Employee ID → Offers' },
  { path: '/', name: 'Dashboard', icon: Home, description: 'KALANJIYAM home' },
  { path: '/advances-upi', name: 'UPI Landing', icon: FileText, description: 'Advances on UPI intro' },
  { path: '/phone-input', name: 'Phone Input', icon: Phone, description: 'Enter phone number' },
  { path: '/otp-verification', name: 'OTP', icon: Lock, description: 'Verify OTP' },
  { path: '/pan-verification', name: 'PAN Verify', icon: FileText, description: 'Verify PAN details' },
  { path: '/aadhaar-verification', name: 'Aadhaar Verify', icon: ShieldCheck, description: 'Aadhaar + Face scan' },
  { path: '/ckyc-consent', name: 'CKYC Consent', icon: FileText, description: 'Flow A: CKYC ID + OTP → offers' },
  { path: '/ckyc-customer-details', name: 'CKYC Details Review', icon: FileCheck, description: 'Review customer details fetched from CKYC' },
  { path: '/ckyc-plus-id', name: 'CKYC + ID Upload', icon: FileText, description: 'Flow C: CKYC ID + OTP → ID upload → offers' },
  { path: '/employee-id-upload', name: 'ID Upload', icon: FileText, description: 'Flow B: Employee ID card upload' },
  { path: '/kyc-options', name: 'KYC Options', icon: ShieldCheck, description: 'Choose verification method' },
  { path: '/kyc-aadhaar-biometric', name: 'Biometric KYC', icon: Fingerprint, description: 'Facial verification (Full KYC)' },
  { path: '/kyc-ckyc-verification', name: 'CKYC Verify', icon: FileCheck, description: 'PAN details & speed post' },
  { path: '/kyc-aadhaar-otp', name: 'Aadhaar OTP', icon: Smartphone, description: 'Min KYC with limits' },
  { path: '/success', name: 'Success Splash', icon: CheckCircle, description: 'Success animation' },
  { path: '/loading', name: 'Loading', icon: Loader2, description: 'Processing screen' },
  { path: '/sanctioned-offers', name: 'Offers', icon: CreditCard, description: 'Select credit lines' },
  { path: '/credit-line-processing', name: 'Processing', icon: Settings, description: 'Activation progress' },
  { path: '/credit-line-activated', name: 'Activated', icon: Sparkles, description: 'Success with confetti' },
  { path: '/upi-connection', name: 'UPI Setup', icon: Code2, description: 'Connect to UPI apps' },
];

/**
 * How many entries stay visible before the "View all" toggle. Five keeps the
 * panel to the HRMS journeys, which are what we demo day to day; everything
 * older sits one tap away.
 */
const VISIBLE_COUNT = 5;

export function DevPreview() {
  const [isOpen, setIsOpen] = useState(false);
  const [showAll, setShowAll] = useState(false);
  const [flowError, setFlowError] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // Show in all environments for demo purposes
  // if (import.meta.env.PROD) {
  //   return null;
  // }

  const handleNavigate = (path: string) => {
    // Flow-start entries — set flow type, clear any prior journey, start from landing
    const flowId = FLOW_ENTRY_PATHS[path];
    if (flowId) {
      try {
        localStorage.setItem('activeFlow', flowId);
        resetJourney();
      } catch {
        // Storage unavailable: keep the panel open, announce it, navigate
        // nowhere, and leave the previously selected flow in place.
        setFlowError(true);
        return;
      }
      setFlowError(false);
      navigate('/');
      setIsOpen(false);
      return;
    }

    // Add mock state for pages that need it
    if (path === '/otp-verification') {
      navigate(path, { state: { phoneNumber: '+91 98765 43210' } });
    } else if (path === '/sanctioned-offers') {
      navigate(path);
    } else if (path === '/credit-line-processing') {
      navigate(path, { state: { selectedOffers: ['festival', 'gadget'] } });
    } else if (path === '/credit-line-activated') {
      navigate(path, { state: { activatedOfferIds: ['festival', 'gadget'] } });
    } else {
      navigate(path);
    }
    setIsOpen(false);
  };

  const visibleRoutes = showAll ? routes : routes.slice(0, VISIBLE_COUNT);
  const hiddenCount = routes.length - VISIBLE_COUNT;

  return (
    <>
      {/* Floating Button */}
      <motion.button
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.5 }}
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-[9999] w-14 h-14 rounded-full bg-gradient-to-br from-purple-600 to-pink-600 shadow-2xl flex items-center justify-center hover:shadow-purple-500/50 hover:scale-110 transition-all group"
        title="Developer Preview Navigation"
      >
        {isOpen ? (
          <X className="w-6 h-6 text-white" strokeWidth={2.5} />
        ) : (
          <Code2 className="w-6 h-6 text-white group-hover:rotate-12 transition-transform" strokeWidth={2.5} />
        )}
      </motion.button>

      {/* Navigation Panel */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[9998]"
            />

            {/* Panel */}
            <motion.div
              initial={{ x: 400 }}
              animate={{ x: 0 }}
              exit={{ x: 400 }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed right-0 top-0 bottom-0 w-full max-w-sm bg-white shadow-2xl z-[9999] overflow-y-auto"
            >
              {/* Header */}
              <div className="sticky top-0 bg-gradient-to-r from-purple-600 to-pink-600 p-6 shadow-lg">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                      <Code2 className="w-6 h-6 text-white" strokeWidth={2.5} />
                    </div>
                    <h2 className="text-xl font-black text-white">Dev Preview</h2>
                  </div>
                  <button
                    onClick={() => setIsOpen(false)}
                    className="w-8 h-8 rounded-lg bg-white/20 backdrop-blur-sm flex items-center justify-center hover:bg-white/30 transition-colors"
                  >
                    <X className="w-5 h-5 text-white" />
                  </button>
                </div>
                <p className="text-sm text-white/80">Quick navigation between pages</p>
              </div>

              {/* Flow selection failure */}
              {flowError && (
                <div role="alert" className="mx-4 mt-4 flex items-start gap-2 rounded-xl border-2 border-red-300 bg-red-50 p-3">
                  <AlertCircle className="w-5 h-5 text-red-700 flex-shrink-0 mt-0.5" strokeWidth={2.5} aria-hidden="true" />
                  <p className="text-sm text-red-800 leading-tight">
                    Could not save the selected flow because browser storage is unavailable. The previous flow is still active.
                  </p>
                </div>
              )}

              {/* Routes List */}
              <div className="p-4 space-y-2">
                {visibleRoutes.map((route, index) => {
                  const IconComponent = route.icon;
                  const isActive = location.pathname === route.path;

                  return (
                    <motion.button
                      key={route.path}
                      initial={{ x: 50, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ delay: index * 0.05 }}
                      onClick={() => handleNavigate(route.path)}
                      className={`w-full text-left p-4 rounded-2xl border-2 transition-all group hover:shadow-lg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#315C9D] ${
                        isActive
                          ? 'border-purple-500 bg-purple-50 shadow-md'
                          : 'border-gray-200 bg-white hover:border-purple-200'
                      }`}
                    >
                      <div className="flex items-center gap-3 mb-2">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
                          isActive
                            ? 'bg-gradient-to-br from-purple-600 to-pink-600 shadow-lg'
                            : 'bg-gray-100 group-hover:bg-purple-100'
                        }`}>
                          <IconComponent 
                            className={`w-5 h-5 ${isActive ? 'text-white' : 'text-gray-600 group-hover:text-purple-600'}`}
                            strokeWidth={2.5}
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className={`font-bold text-base leading-tight ${
                            isActive ? 'text-purple-700' : 'text-gray-900'
                          }`}>
                            {route.name}
                          </h3>
                          {isActive && (
                            <span className="text-xs font-bold text-purple-600">Active</span>
                          )}
                        </div>
                      </div>
                      <p className="text-sm text-gray-600 leading-tight">{route.description}</p>
                    </motion.button>
                  );
                })}

                {hiddenCount > 0 && (
                  <button
                    type="button"
                    onClick={() => setShowAll(!showAll)}
                    aria-expanded={showAll}
                    className="w-full h-12 flex items-center justify-center gap-2 rounded-2xl border-2 border-gray-200 bg-white text-sm font-bold text-gray-700 transition-colors hover:border-purple-200 hover:text-purple-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#315C9D]"
                  >
                    {showAll ? (
                      <>
                        Show less
                        <ChevronUp className="w-4 h-4" strokeWidth={2.5} aria-hidden="true" />
                      </>
                    ) : (
                      <>
                        {`View all (${hiddenCount} more)`}
                        <ChevronDown className="w-4 h-4" strokeWidth={2.5} aria-hidden="true" />
                      </>
                    )}
                  </button>
                )}
              </div>

              {/* Footer */}
              <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 p-4">
                <p className="text-xs text-gray-500 text-center">
                  Development mode only • Not visible in production
                </p>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}