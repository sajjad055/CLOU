import { useNavigate } from 'react-router';
import { motion, AnimatePresence } from 'motion/react';
import { FileText, MapPin, Mail } from 'lucide-react';
import { useState, useEffect } from 'react';
import { TopBar } from './TopBar';
import { StickyFooter } from './StickyFooter';
import { useLanguage } from '../hooks/useLanguage';

type VerificationStep = 'pan-input' | 'verifying-pan' | 'address-confirmation';

function CTAButton({ onClick, disabled, children }: { onClick?: () => void; disabled?: boolean; children: React.ReactNode }) {
  return (
    <button onClick={onClick} disabled={disabled}
      className="w-full bg-[#315C9D] text-white h-12 rounded-lg text-base font-semibold flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed transition-opacity">
      {children}
    </button>
  );
}

function FieldLabel({ children }: { children: React.ReactNode }) {
  return <label className="block text-[12px] font-semibold text-[#666666] uppercase tracking-wide mb-2">{children}</label>;
}

function TextInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input {...props}
      className={`w-full bg-transparent border border-[#e5e7eb] rounded-lg px-4 h-14 focus:border-[#254576] focus:ring-1 focus:ring-[#254576]/20 transition-all outline-none text-sm font-semibold text-[#212121] placeholder:text-[#9e9e9e] ${props.className ?? ''}`}
    />
  );
}

export function CKYCVerificationPage() {
  const navigate = useNavigate();
  const [selectedLanguage] = useLanguage();
  const [step, setStep] = useState<VerificationStep>('pan-input');
  const [panNumber, setPanNumber] = useState('ABCDE1234F');
  const [name, setName] = useState('Rajesh Kumar');
  const [dobDay, setDobDay] = useState('15');
  const [dobMonth, setDobMonth] = useState('MAY');
  const [dobYear, setDobYear] = useState('1990');
  const [ckycNumber, setCkycNumber] = useState('');
  const [consent, setConsent] = useState(false);
  const [showConsentSheet, setShowConsentSheet] = useState(false);
  const [showAddressDeclarationSheet, setShowAddressDeclarationSheet] = useState(false);

  const content = {
    English: {
      panTitle: "PAN & CKYC Verification",
      panSubtitle: "Enter your PAN, name, and date of birth",
      panLabel: "PAN Number",
      nameLabel: "Full Name (as per PAN)",
      dobLabel: "Date of Birth",
      dateLabel: "Date",
      monthLabel: "Month",
      yearLabel: "Year",
      ckycLabel: "CKYC Number",
      orLabel: "OR",
      consentTextFull: "I consent to share my PAN and CKYC details for identity verification and authorize Indian Overseas Bank to retrieve my information from government databases including the Central KYC Registry (CKYCR).\n\nI understand that Indian Overseas Bank will authenticate my identity through PAN and CKYC verification for personal loans and/or for other purposes, or as authorised under applicable law.\n\nI understand that Indian Overseas Bank shall ensure security and confidentiality of my personal identity data and prohibit its use other than for verification purposes.\n\nI hereby authorize Indian Overseas Bank to verify and authenticate using the PAN and CKYC details provided.\n\nThis is a Full KYC process which provides unrestricted account limits as per RBI guidelines.",
      modalConsentTitle: "PAN & CKYC Consent",
      agreeAndContinue: "Accept & Continue",
      verifyPanBtn: "Verify",
      verifyingPanTitle: "Verifying PAN",
      verifyingPanSubtitle: "Please wait while we verify your details...",
      panVerifiedTitle: "PAN Verified Successfully",
      addressDeclarationTitle: "Address Self Declaration",
      addressDeclarationText: "I hereby declare that the permanent and communication addresses shown are accurate and belong to me. I understand that Indian Overseas Bank will send a Speed Post to my communication address for verification, and I agree to confirm receipt within 7 days to complete my KYC process.\n\nI take full responsibility for the accuracy of these addresses and understand that providing false information may result in rejection of my application and legal consequences.",
      updatingAddressTitle: "Updating Address",
      updatingAddressSubtitle: "Please wait...",
      addressTitle: "Confirm Your Addresses",
      addressSubtitle: "Addresses from CKYC registry",
      permanentAddressLabel: "Permanent Address",
      communicationAddressLabel: "Communication Address",
      verificationNote: "We will send a Speed Post to your communication address for verification. Please confirm receipt within 7 days.",
      confirmAddressBtn: "Confirm & Proceed"
    },
    Tamil: {
      panTitle: "PAN & CKYC சரிபார்ப்பு",
      panSubtitle: "உங்கள் PAN, பெயர் மற்றும் பிறந்த தேதியை உள்ளிடவும்",
      panLabel: "PAN எண்",
      nameLabel: "முழு பெயர் (PAN படி)",
      dobLabel: "பிறந்த தேதி",
      dateLabel: "தேதி",
      monthLabel: "மாதம்",
      yearLabel: "வருடம்",
      ckycLabel: "CKYC எண்",
      orLabel: "அல்லது",
      consentTextFull: "அடையாள சரிபார்ப்புக்காக எனது PAN மற்றும் CKYC விவரங்களைப் பகிர நான் சம்மதிக்கிறேன்.",
      modalConsentTitle: "PAN & CKYC சம்மதம்",
      agreeAndContinue: "ஏற்று தொடரவும்",
      verifyPanBtn: "சரிபார்",
      verifyingPanTitle: "PAN சரிபார்க்கப்படுகிறது",
      verifyingPanSubtitle: "உங்கள் விவரங்களை சரிபார்க்கும்போது காத்திருக்கவும்...",
      panVerifiedTitle: "PAN வெற்றிகரமாக சரிபார்க்கப்பட்டது",
      addressDeclarationTitle: "முகவரி சுய அறிவிப்பு",
      addressDeclarationText: "காட்டப்பட்டுள்ள நிரந்தர மற்றும் தொடர்பு முகவரிகள் துல்லியமானவை என்பதை இதன்மூலம் அறிவிக்கிறேன்.",
      updatingAddressTitle: "முகவரி புதுப்பிக்கப்படுகிறது",
      updatingAddressSubtitle: "காத்திருக்கவும்...",
      addressTitle: "உங்கள் முகவரிகளை உறுதிப்படுத்தவும்",
      addressSubtitle: "CKYC பதிவேட்டில் இருந்து முகவரிகள்",
      permanentAddressLabel: "நிரந்தர முகவரி",
      communicationAddressLabel: "தொடர்பு முகவரி",
      verificationNote: "சரிபார்ப்புக்காக உங்கள் தொடர்பு முகவரிக்கு ஸ்பீட் போஸ்ட் அனுப்புவோம்.",
      confirmAddressBtn: "உறுதிசெய்து தொடரவும்"
    }
  };

  const t = content[selectedLanguage];

  const validatePAN = (pan: string) => /^[A-Z]{5}[0-9]{4}[A-Z]$/.test(pan);

  const months = [
    { short: 'JAN', full: 'January' }, { short: 'FEB', full: 'February' }, { short: 'MAR', full: 'March' },
    { short: 'APR', full: 'April' }, { short: 'MAY', full: 'May' }, { short: 'JUN', full: 'June' },
    { short: 'JUL', full: 'July' }, { short: 'AUG', full: 'August' }, { short: 'SEP', full: 'September' },
    { short: 'OCT', full: 'October' }, { short: 'NOV', full: 'November' }, { short: 'DEC', full: 'December' }
  ];

  const isValid = (ckycNumber.length === 14) || (validatePAN(panNumber) && name.trim() !== '' && dobDay !== '' && dobMonth !== '' && dobYear !== '');

  useEffect(() => {
    if (step === 'verifying-pan') { const t = setTimeout(() => setStep('address-confirmation'), 2000); return () => clearTimeout(t); }
  }, [step]);

  const selectStyle = "w-full bg-transparent border border-[#e5e7eb] rounded-lg px-3 h-14 focus:border-[#254576] focus:ring-1 focus:ring-[#254576]/20 transition-all outline-none text-sm font-semibold text-[#212121] cursor-pointer appearance-none";
  const chevronBg = `url("data:image/svg+xml,%3Csvg width='12' height='8' viewBox='0 0 12 8' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 1.5L6 6.5L11 1.5' stroke='%23666666' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E")`;

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Header */}
      <TopBar showBack />

      <main className="flex-1 overflow-y-auto bg-white">
        <div className="max-w-md mx-auto px-4 pt-8 pb-32">

          {/* ── PAN Input ── */}
          {step === 'pan-input' && (
            <div className="flex flex-col items-center">
              <motion.div initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 0.4 }} className="mb-8">
                <div className="w-12 h-12 rounded-2xl bg-[#ebecef] flex items-center justify-center">
                  <FileText className="w-6 h-6 text-[#315C9D]" strokeWidth={2} />
                </div>
              </motion.div>

              <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.1 }} className="text-center mb-8 w-full">
                <h1 className="text-xl font-semibold text-[#111827] mb-1">{t.panTitle}</h1>
                <p className="text-sm text-[#6b7280]">{t.panSubtitle}</p>
              </motion.div>

              <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2 }} className="w-full mb-6 space-y-5">
                {/* PAN */}
                <div>
                  <FieldLabel>{t.panLabel}</FieldLabel>
                  <TextInput
                    type="text"
                    value={panNumber}
                    onChange={(e) => setPanNumber(e.target.value.toUpperCase().slice(0, 10))}
                    placeholder="ABCDE1234F"
                    maxLength={10}
                    className={panNumber.length === 10 && !validatePAN(panNumber) ? '!border-red-500 focus:!border-red-500' : ''}
                  />
                  {panNumber.length === 10 && !validatePAN(panNumber) && (
                    <p className="text-[12px] text-red-600 mt-1.5 font-medium">Invalid PAN format. Must be 5 letters, 4 digits, 1 letter.</p>
                  )}
                </div>

                {/* Name */}
                <div>
                  <FieldLabel>{t.nameLabel}</FieldLabel>
                  <TextInput type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Rajesh Kumar" />
                </div>

                {/* DOB */}
                <div>
                  <FieldLabel>{t.dobLabel}</FieldLabel>
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { value: dobDay, onChange: setDobDay, placeholder: 'DD', options: Array.from({ length: 31 }, (_, i) => ({ v: (i + 1).toString(), l: (i + 1).toString() })) },
                      { value: dobMonth, onChange: setDobMonth, placeholder: 'Month', options: months.map((m) => ({ v: m.short, l: m.full })) },
                      { value: dobYear, onChange: setDobYear, placeholder: 'YYYY', options: Array.from({ length: 100 }, (_, i) => new Date().getFullYear() - 18 - i).map((y) => ({ v: y.toString(), l: y.toString() })) }
                    ].map((sel, i) => (
                      <div key={i} className="relative">
                        <select value={sel.value} onChange={(e) => sel.onChange(e.target.value)}
                          className={selectStyle}
                          style={{ backgroundImage: chevronBg, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 0.75rem center', backgroundSize: '12px' }}>
                          <option value="">{sel.placeholder}</option>
                          {sel.options.map((o) => <option key={o.v} value={o.v}>{o.l}</option>)}
                        </select>
                      </div>
                    ))}
                  </div>
                </div>

                {/* OR divider */}
                <div className="relative py-2">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-[#e5e7eb]"></div>
                  </div>
                  <div className="relative flex justify-center">
                    <span className="bg-white px-4 text-[12px] font-semibold text-[#666666] uppercase">{t.orLabel}</span>
                  </div>
                </div>

                {/* CKYC */}
                <div>
                  <FieldLabel>{t.ckycLabel}</FieldLabel>
                  <TextInput
                    type="text"
                    value={ckycNumber}
                    onChange={(e) => setCkycNumber(e.target.value.toUpperCase().slice(0, 14))}
                    placeholder="12345678901234"
                    maxLength={14}
                    className="uppercase"
                  />
                </div>
              </motion.div>

              <StickyFooter>
                <CTAButton disabled={!isValid} onClick={() => { if (isValid) setShowConsentSheet(true); }}>
                  {t.verifyPanBtn}
                </CTAButton>
              </StickyFooter>
            </div>
          )}

          {/* ── Verifying PAN ── */}
          {step === 'verifying-pan' && (
            <div className="flex flex-col items-center justify-center min-h-[60vh]">
              <motion.div initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 0.4 }} className="mb-8">
                <div className="w-12 h-12 rounded-2xl bg-[#ebecef] flex items-center justify-center">
                  <motion.div animate={{ rotate: 360 }} transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}>
                    <FileText className="w-6 h-6 text-[#315C9D]" strokeWidth={2} />
                  </motion.div>
                </div>
              </motion.div>
              <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.1 }} className="text-center">
                <h2 className="text-xl font-semibold text-[#111827] mb-1">{t.verifyingPanTitle}</h2>
                <p className="text-sm text-[#6b7280]">{t.verifyingPanSubtitle}</p>
              </motion.div>
            </div>
          )}

          {/* ── Address Confirmation ── */}
          {step === 'address-confirmation' && (
            <div className="flex flex-col items-center">
              <motion.div initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 0.4 }} className="mb-8">
                <div className="w-12 h-12 rounded-2xl bg-[#ebecef] flex items-center justify-center">
                  <MapPin className="w-6 h-6 text-[#315C9D]" strokeWidth={2} />
                </div>
              </motion.div>

              <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.1 }} className="text-center mb-6 w-full">
                <h1 className="text-xl font-semibold text-[#111827] mb-1">{t.addressTitle}</h1>
                <p className="text-sm text-[#6b7280]">{t.addressSubtitle}</p>
              </motion.div>

              <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2 }} className="w-full mb-6 space-y-4">
                {/* Permanent */}
                <div>
                  <FieldLabel>{t.permanentAddressLabel}</FieldLabel>
                  <div className="bg-[#f9fafb] border border-[#e5e7eb] rounded-lg p-4 flex items-start gap-3">
                    <MapPin className="w-5 h-5 text-[#6b7280] flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold text-[#212121] text-sm mb-1">{name}</p>
                      <p className="text-sm text-[#6b7280] leading-relaxed">No. 45, Gandhi Street<br />Vadapalani, Chennai<br />Tamil Nadu - 600026</p>
                    </div>
                  </div>
                </div>

                {/* Communication */}
                <div>
                  <FieldLabel>{t.communicationAddressLabel}</FieldLabel>
                  <div className="bg-[#f9fafb] border border-[#e5e7eb] rounded-lg p-4 flex items-start gap-3">
                    <Mail className="w-5 h-5 text-[#037eab] flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold text-[#212121] text-sm mb-1">{name}</p>
                      <p className="text-sm text-[#6b7280] leading-relaxed">Flat 12B, Pearl Apartments<br />Anna Nagar, Chennai<br />Tamil Nadu - 600040</p>
                    </div>
                  </div>
                </div>

                <p className="text-[12px] text-[#666666] leading-relaxed bg-[#ebecef] rounded-lg p-3">
                  {t.verificationNote}
                </p>
              </motion.div>

              <StickyFooter>
                <CTAButton onClick={() => setShowAddressDeclarationSheet(true)}>{t.confirmAddressBtn}</CTAButton>
              </StickyFooter>
            </div>
          )}

        </div>
      </main>

      {/* ── Consent Sheet ── */}
      <AnimatePresence>
        {showConsentSheet && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.7 }} exit={{ opacity: 0 }}
              onClick={() => setShowConsentSheet(false)} className="fixed inset-0 bg-black z-[100]" />
            <motion.div initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="fixed bottom-0 left-0 right-0 bg-white rounded-t-xl shadow-2xl z-[101] max-h-[75vh] overflow-hidden flex flex-col">
              <div className="flex justify-center pt-3 pb-2"><div className="w-10 h-1 bg-[#d9d9d9] rounded-full" /></div>
              <div className="px-6 py-3 border-b border-[#e5e7eb]">
                <h2 className="text-base font-semibold text-[#111827]">{content.English.modalConsentTitle}</h2>
              </div>
              <div className="flex-1 overflow-y-auto px-6 py-5">
                <p className="text-sm text-[#6b7280] leading-relaxed whitespace-pre-line">{content.English.consentTextFull}</p>
              </div>
              <div className="px-6 py-5 border-t border-[#e5e7eb]">
                <CTAButton onClick={() => { setConsent(true); setShowConsentSheet(false); setStep('verifying-pan'); }}>
                  {content.English.agreeAndContinue}
                </CTAButton>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ── Address Declaration Sheet ── */}
      <AnimatePresence>
        {showAddressDeclarationSheet && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.7 }} exit={{ opacity: 0 }}
              onClick={() => setShowAddressDeclarationSheet(false)} className="fixed inset-0 bg-black z-[100]" />
            <motion.div initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="fixed bottom-0 left-0 right-0 bg-white rounded-t-xl shadow-2xl z-[101] max-h-[75vh] overflow-hidden flex flex-col">
              <div className="flex justify-center pt-3 pb-2"><div className="w-10 h-1 bg-[#d9d9d9] rounded-full" /></div>
              <div className="px-6 py-3 border-b border-[#e5e7eb]">
                <h2 className="text-base font-semibold text-[#111827]">{content.English.addressDeclarationTitle}</h2>
              </div>
              <div className="flex-1 overflow-y-auto px-6 py-5">
                <p className="text-sm text-[#6b7280] leading-relaxed whitespace-pre-line">{content.English.addressDeclarationText}</p>
              </div>
              <div className="px-6 py-5 border-t border-[#e5e7eb]">
                <CTAButton onClick={() => { setShowAddressDeclarationSheet(false); navigate('/sanctioned-offers'); }}>
                  {content.English.agreeAndContinue}
                </CTAButton>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
