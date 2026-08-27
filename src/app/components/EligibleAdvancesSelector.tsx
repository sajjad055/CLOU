import { useNavigate } from 'react-router';
import { motion } from 'motion/react';
import { Sparkles, Check } from 'lucide-react';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';
import { useState } from 'react';
import successLottie from '@/assets/success.lottie';
import { StickyFooter } from './StickyFooter';
import { BottomSheet } from './BottomSheet';
import { useLanguage } from '../hooks/useLanguage';
import { ADVANCE_OFFERS } from '../data/advancesCatalog';

interface EligibleAdvancesSelectorProps {
  /**
   * `false` (default) — full-screen use on `/sanctioned-offers`: the terms + CTA
   * ride in a fixed `StickyFooter`.
   * `true` — embedded inside the home Salary Advance tab: the terms + CTA render
   * as a normal block at the end of the content, since the tab has its own chrome.
   */
  embedded?: boolean;
}

/**
 * "You are eligible for the below salary advances" — the tick, the selectable
 * advance cards, the terms declaration and the Activate action.
 *
 * Extracted from `SanctionedOffersPage` so the same selection experience can be
 * shown full-screen (the KYC flow lands here) and embedded in the home tab once
 * KYC is complete but no advance is active yet. Activation navigates into the
 * existing processing → activated pipeline either way.
 */
export function EligibleAdvancesSelector({ embedded = false }: EligibleAdvancesSelectorProps) {
  const navigate = useNavigate();
  const [selectedLanguage] = useLanguage();
  const [selectedOffers, setSelectedOffers] = useState<string[]>([]);
  const [showTermsSheet, setShowTermsSheet] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  const content = {
    English: {
      title: 'You are eligible for the below salary advances',
      subtitle: 'Select all the salary advances you need',
      activateBtn: 'Activate Selected',
      selectBtn: 'Select Offers to Activate',
      validUntil: 'Valid until 31st May 2026',
      termsDeclaration: 'I agree to the terms and conditions for activating my selected credit lines.',
      readMore: 'Read more',
    },
    Tamil: {
      title: 'நீங்கள் கீழே உள்ள சம்பள முன்பணங்களுக்கு தகுதியுடையவர்',
      subtitle: 'உங்களுக்குத் தேவையான சம்பள முன்பணங்களைத் தேர்ந்தெடுக்கவும்',
      activateBtn: 'செயல்படுத்து',
      selectBtn: 'தேர்ந்தெடு',
      validUntil: '31 மே 2026 வரை செல்லுபடியாகும்',
      termsDeclaration: 'எனது தேர்ந்தெடுக்கப்பட்ட கடன் வரிசைகளை செயல்படுத்துவதற்கான விதிமுறைகள் மற்றும் நிபந்தனைகளை நான் ஏற்கிறேன்.',
      readMore: 'மேலும் படிக்க',
    },
  };

  const t = content[selectedLanguage];

  const toggleOffer = (offerId: string) => {
    setSelectedOffers((prev) =>
      prev.includes(offerId) ? prev.filter((id) => id !== offerId) : [...prev, offerId],
    );
  };

  const canActivate = selectedOffers.length > 0 && agreedToTerms;

  const handleActivate = () => {
    if (!canActivate) return;
    navigate('/credit-line-processing', { state: { selectedOffers } });
  };

  const footer = (
    <>
      {/* Terms taken inline, with the full text behind "Read more". The button
          wraps only the box so the link can run in the same text flow. */}
      <div className="flex items-start gap-3 mb-3">
        <button
          type="button"
          role="checkbox"
          aria-checked={agreedToTerms}
          aria-labelledby="offers-terms-label"
          onClick={() => setAgreedToTerms(!agreedToTerms)}
          className="flex-shrink-0 mt-0.5 p-0.5 rounded-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#315C9D]"
        >
          <span
            className={`flex w-5 h-5 rounded-[5px] border items-center justify-center transition-colors ${
              agreedToTerms ? 'bg-[#315C9D] border-[#315C9D]' : 'bg-white border-[#c4c4c4]'
            }`}
          >
            {agreedToTerms && <Check className="w-3.5 h-3.5 text-white" strokeWidth={3} aria-hidden="true" />}
          </span>
        </button>

        <p className="text-[12px] text-[#6b7280] leading-relaxed">
          <span id="offers-terms-label">{t.termsDeclaration}</span>{' '}
          <button
            type="button"
            onClick={() => setShowTermsSheet(true)}
            className="text-[12px] font-semibold text-[#315C9D] underline underline-offset-2 rounded-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#315C9D]"
          >
            {t.readMore}
          </button>
        </p>
      </div>

      <button
        type="button"
        onClick={handleActivate}
        disabled={!canActivate}
        className="w-full h-12 rounded-lg bg-[#315C9D] text-white font-semibold text-base flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed transition-opacity active:scale-[0.99] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#315C9D]"
      >
        {selectedOffers.length > 0 ? t.activateBtn : t.selectBtn}
      </button>
    </>
  );

  return (
    <>
      {/* Title Section */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="text-center mb-5"
      >
        <div className="flex justify-center mb-2">
          <div className="w-16 h-16">
            <DotLottieReact src={successLottie} autoplay loop={false} style={{ width: '100%', height: '100%' }} />
          </div>
        </div>
        <h2 className="text-xl font-black text-[#111827] tracking-tight leading-tight">{t.title}</h2>
      </motion.div>

      {/* Decorative instruction heading */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="flex items-center justify-center gap-2 mb-5"
      >
        <span className="w-5 h-px bg-gradient-to-l from-[#315C9D]/40 to-transparent flex-shrink-0"></span>
        <Sparkles className="w-3.5 h-3.5 text-[#315C9D] flex-shrink-0" fill="#315C9D" aria-hidden="true" />
        <p className="text-[12px] font-semibold text-[#6b7280] text-center max-w-[240px] leading-snug">{t.subtitle}</p>
        <Sparkles className="w-3.5 h-3.5 text-[#315C9D] flex-shrink-0" fill="#315C9D" aria-hidden="true" />
        <span className="w-5 h-px bg-gradient-to-r from-[#315C9D]/40 to-transparent flex-shrink-0"></span>
      </motion.div>

      {/* Credit Lines List */}
      <div className="space-y-3">
        {ADVANCE_OFFERS.map((offer, index) => {
          const isSelected = selectedOffers.includes(offer.id);
          return (
            <motion.button
              key={offer.id}
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.4, delay: 0.2 + index * 0.05 }}
              onClick={() => toggleOffer(offer.id)}
              aria-pressed={isSelected}
              className={`relative w-full h-[110px] rounded-xl border overflow-hidden transition-all text-left focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#315C9D] ${
                isSelected ? 'border-[#315C9D] bg-white shadow-md' : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm'
              }`}
            >
              <img
                src={offer.image}
                alt=""
                className={`pointer-events-none select-none absolute bottom-0 right-4 w-auto object-contain object-bottom ${offer.imageClass}`}
              />

              <div className="relative z-10 h-full min-w-0 max-w-[58%] flex flex-col justify-between p-3">
                <h3 className="text-[12px] font-semibold text-gray-900 leading-tight pr-6">
                  {selectedLanguage === 'English' ? offer.nameEn : offer.nameTa}
                </h3>
                <div>
                  <p className="text-xl font-black text-[#111827] leading-none mb-1">{offer.amount}</p>
                  <p className="text-xs text-gray-500">{t.validUntil}</p>
                </div>
              </div>

              <div className="absolute top-3 right-3 z-20">
                {isSelected ? (
                  <motion.div
                    initial={{ scale: 0.6, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                    className="w-5 h-5 rounded-[5px] bg-[#315C9D] flex items-center justify-center shadow-sm"
                  >
                    <Check className="w-3.5 h-3.5 text-white" strokeWidth={3} aria-hidden="true" />
                  </motion.div>
                ) : (
                  <div className="w-5 h-5 rounded-[5px] border-2 border-gray-300 bg-white/80"></div>
                )}
              </div>
            </motion.button>
          );
        })}
      </div>

      {embedded ? <div className="mt-6">{footer}</div> : <StickyFooter>{footer}</StickyFooter>}

      {/* Terms sheet — read-only. Acceptance is taken by the checkbox above. */}
      <BottomSheet
        open={showTermsSheet}
        onClose={() => setShowTermsSheet(false)}
        title="Terms & Conditions"
        closeLabel={selectedLanguage === 'English' ? 'Close' : 'மூடு'}
        footer={
          <button
            type="button"
            onClick={() => setShowTermsSheet(false)}
            className="w-full h-12 rounded-lg bg-[#315C9D] text-white font-semibold text-base flex items-center justify-center active:scale-[0.98] transition-transform focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#315C9D]"
          >
            {selectedLanguage === 'English' ? 'Close' : 'மூடு'}
          </button>
        }
      >
        <p className="text-sm text-gray-700 leading-relaxed">
          I consent and authorize <span className="font-bold text-[#315C9D]">Indian Overseas Bank (IOB)</span> to create and manage the selected credit line(s) on behalf of the <span className="font-bold text-[#315C9D]">Government of Tamil Nadu</span>.
        </p>
      </BottomSheet>
    </>
  );
}
