import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, ChevronRight, CreditCard, Building2, CheckCircle, X, Search, Lightbulb } from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';
import phonePeImg from '../../imports/image-13.png';

type Screen = 'home' | 'payment-methods' | 'credit-line' | 'bank-list' | 'account-selection' | 'vpa-creation' | 'success';

interface LoanAccount {
  id: string;
  accountNumber: string;
  displayAccountNumber: string;
  limit: string;
  productName: string;
  accountPrefix: string;
}

// Generate account number from prefix (first 4 chars) and random 4 digit suffix
const generateDisplayAccount = (prefix: string) => {
  const last4 = Math.floor(1000 + Math.random() * 9000);
  return `${prefix.substring(0, 4).toUpperCase()}${last4}`;
};

// Fetch activated credit lines from localStorage and map to loan accounts
const getActivatedLoanAccounts = (): LoanAccount[] => {
  try {
    const activatedOffers = localStorage.getItem('activatedCreditLines');
    if (!activatedOffers) {
      // Default fallback accounts
      return [
        {
          id: '1',
          accountNumber: 'festival3847',
          displayAccountNumber: 'FEST3847',
          limit: '₹25,000',
          productName: 'Festival Advance',
          accountPrefix: 'festival'
        },
        {
          id: '2',
          accountNumber: 'education5642',
          displayAccountNumber: 'EDUC5642',
          limit: '₹75,000',
          productName: 'Education Advance',
          accountPrefix: 'education'
        }
      ];
    }

    const offers = JSON.parse(activatedOffers) as Array<{
      id: string;
      nameEn: string;
      amount: string;
      accountPrefix: string;
    }>;

    return offers.map((offer, index) => ({
      id: String(index + 1),
      accountNumber: `${offer.accountPrefix}${Math.floor(1000 + Math.random() * 9000)}`,
      displayAccountNumber: generateDisplayAccount(offer.accountPrefix),
      limit: offer.amount,
      productName: offer.nameEn,
      accountPrefix: offer.accountPrefix
    }));
  } catch (error) {
    console.error('Error loading activated credit lines:', error);
    return [
      {
        id: '1',
        accountNumber: 'festival3847',
        displayAccountNumber: 'FEST3847',
        limit: '₹25,000',
        productName: 'Festival Advance',
        accountPrefix: 'festival'
      }
    ];
  }
};

export function PhonePeAppMock() {
  const navigate = useNavigate();
  const [currentScreen, setCurrentScreen] = useState<Screen>('home');
  const [selectedAccount, setSelectedAccount] = useState<LoanAccount | null>(null);
  const [vpaName, setVpaName] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const handleBack = () => {
    if (currentScreen === 'home') {
      navigate(-1);
    } else if (currentScreen === 'payment-methods') {
      setCurrentScreen('home');
    } else if (currentScreen === 'credit-line') {
      setCurrentScreen('payment-methods');
    } else if (currentScreen === 'bank-list') {
      setCurrentScreen('credit-line');
    } else if (currentScreen === 'account-selection') {
      setCurrentScreen('bank-list');
    } else if (currentScreen === 'vpa-creation') {
      setCurrentScreen('account-selection');
    } else if (currentScreen === 'success') {
      navigate(-1);
    }
  };

  const handleClose = () => {
    navigate(-1);
  };

  return (
    <div className="min-h-screen bg-[#5f259f] flex flex-col">
      {/* PhonePe Header */}
      <header className="bg-[#5f259f] text-white py-4 px-4 flex items-center justify-between shadow-lg">
        <button onClick={handleBack} className="p-2 hover:bg-white/10 rounded-full transition-colors">
          <ArrowLeft className="w-6 h-6" />
        </button>
        <div className="flex items-center gap-2">
          <ImageWithFallback
            src={phonePeImg}
            alt="PhonePe"
            className="h-8 w-auto"
            fallback={<Building2 className="h-8 w-auto" />}
          />
        </div>
        <button onClick={handleClose} className="p-2 hover:bg-white/10 rounded-full transition-colors">
          <X className="w-6 h-6" />
        </button>
      </header>

      {/* Content */}
      <div className="flex-1 bg-gray-50">
        <AnimatePresence mode="wait">
          {/* Home Screen */}
          {currentScreen === 'home' && (
            <motion.div
              key="home"
              initial={{ opacity: 0, x: 100 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -100 }}
              className="p-4"
            >
              <h1 className="text-2xl font-bold text-gray-900 mb-6">My PhonePe</h1>
              
              <div className="space-y-3">
                <button
                  onClick={() => setCurrentScreen('payment-methods')}
                  className="w-full bg-white rounded-xl shadow-md p-5 flex items-center justify-between hover:shadow-lg transition-shadow"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center">
                      <CreditCard className="w-6 h-6 text-[#5f259f]" />
                    </div>
                    <div className="text-left">
                      <div className="font-bold text-gray-900">Payment Methods</div>
                      <div className="text-sm text-gray-500">Manage your payment options</div>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-400" />
                </button>

                <div className="w-full bg-white rounded-xl shadow-md p-5 flex items-center justify-between opacity-50">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center">
                      <Building2 className="w-6 h-6 text-gray-400" />
                    </div>
                    <div className="text-left">
                      <div className="font-bold text-gray-900">Bank Accounts</div>
                      <div className="text-sm text-gray-500">2 linked accounts</div>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-400" />
                </div>
              </div>

              <div className="mt-6 p-4 bg-purple-50 rounded-xl border-2 border-purple-200">
                <p className="text-sm text-purple-900 text-center font-medium">
                  💡 Tip: Link your credit lines to pay with UPI!
                </p>
              </div>
            </motion.div>
          )}

          {/* Payment Methods Screen */}
          {currentScreen === 'payment-methods' && (
            <motion.div
              key="payment-methods"
              initial={{ opacity: 0, x: 100 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -100 }}
              className="p-4"
            >
              <h1 className="text-2xl font-bold text-gray-900 mb-6">Payment Methods</h1>
              
              <div className="space-y-3">
                <button
                  onClick={() => setCurrentScreen('credit-line')}
                  className="w-full bg-white rounded-xl shadow-md p-5 flex items-center justify-between hover:shadow-lg transition-shadow border-2 border-purple-300"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center">
                      <CreditCard className="w-6 h-6 text-white" />
                    </div>
                    <div className="text-left">
                      <div className="font-bold text-gray-900">Credit Line on UPI</div>
                      <div className="text-sm text-gray-500">Link your credit accounts</div>
                      <div className="text-xs text-purple-600 font-semibold mt-1">✨ Recommended</div>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-400" />
                </button>

                <div className="w-full bg-white rounded-xl shadow-md p-5 flex items-center justify-between opacity-50">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center">
                      <CreditCard className="w-6 h-6 text-gray-400" />
                    </div>
                    <div className="text-left">
                      <div className="font-bold text-gray-900">Credit & Debit Cards</div>
                      <div className="text-sm text-gray-500">3 cards saved</div>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-400" />
                </div>
              </div>
            </motion.div>
          )}

          {/* Credit Line Screen */}
          {currentScreen === 'credit-line' && (
            <motion.div
              key="credit-line"
              initial={{ opacity: 0, x: 100 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -100 }}
              className="p-4"
            >
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Credit Line on UPI</h1>
              <p className="text-sm text-gray-600 mb-6">Link your bank credit lines to pay via UPI</p>
              
              <div className="space-y-3">
                <div className="bg-gradient-to-r from-purple-600 to-purple-700 rounded-xl p-6 text-white shadow-lg">
                  <div className="text-sm font-medium mb-2">Total Linked Credit Lines</div>
                  <div className="text-3xl font-bold">0</div>
                  <div className="text-xs mt-2 opacity-90">Add your first credit line below</div>
                </div>

                <button
                  onClick={() => setCurrentScreen('bank-list')}
                  className="w-full bg-white rounded-xl shadow-md p-5 flex items-center justify-between hover:shadow-lg transition-shadow border-2 border-purple-300"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center">
                      <span className="text-2xl">+</span>
                    </div>
                    <div className="text-left">
                      <div className="font-bold text-gray-900">Add New Credit Line</div>
                      <div className="text-sm text-gray-500">Select your bank</div>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-400" />
                </button>
              </div>

              <div className="mt-6 p-4 bg-blue-50 rounded-xl">
                <p className="text-xs text-blue-900 leading-relaxed">
                  <strong>How it works:</strong> Link your bank credit line and use it for UPI payments. 
                  Pay at any UPI merchant by selecting your credit line account during checkout.
                </p>
              </div>
            </motion.div>
          )}

          {/* Bank List Screen */}
          {currentScreen === 'bank-list' && (
            <motion.div
              key="bank-list"
              initial={{ opacity: 0, x: 100 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -100 }}
              className="flex flex-col h-full"
            >
              <div className="p-4">
                <h1 className="text-2xl font-bold text-gray-900 mb-4">Select Your Bank</h1>
                
                {/* Search Bar */}
                <div className="relative mb-4">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search for your bank..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 rounded-xl border-2 border-gray-200 focus:border-purple-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex-1 overflow-y-auto px-4 pb-4">
                <div className="space-y-2">
                  {/* Indian Overseas Bank - Highlighted */}
                  <button
                    onClick={() => setCurrentScreen('account-selection')}
                    className="w-full bg-white rounded-xl shadow-md p-5 flex items-center justify-between hover:shadow-lg transition-shadow border-2 border-purple-400 relative"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center">
                        <Building2 className="w-6 h-6 text-white" />
                      </div>
                      <div className="text-left">
                        <div className="font-bold text-gray-900">Indian Overseas Bank</div>
                        <div className="text-xs text-green-600 font-semibold">✓ Active credit lines found</div>
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-gray-400" />
                    <div className="absolute top-2 right-2 bg-green-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                      LINKED
                    </div>
                  </button>

                  {/* Other Banks - Disabled */}
                  {['HDFC Bank', 'ICICI Bank', 'State Bank of India', 'Axis Bank', 'Kotak Mahindra Bank'].map((bank) => (
                    <div
                      key={bank}
                      className="w-full bg-white rounded-xl shadow-sm p-5 flex items-center justify-between opacity-40"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center">
                          <Building2 className="w-6 h-6 text-gray-400" />
                        </div>
                        <div className="text-left">
                          <div className="font-bold text-gray-900">{bank}</div>
                          <div className="text-xs text-gray-400">Not available</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {/* Account Selection Screen */}
          {currentScreen === 'account-selection' && (
            <motion.div
              key="account-selection"
              initial={{ opacity: 0, x: 100 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -100 }}
              className="p-4"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center">
                  <Building2 className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-900">Indian Overseas Bank</h1>
                  <p className="text-sm text-gray-600">Select your credit line account</p>
                </div>
              </div>

              <div className="bg-purple-50 rounded-xl p-4 mb-6 border-2 border-purple-200">
                <p className="text-sm text-purple-900 font-medium">
                  ✨ Great! We found your active credit lines from KALANJIYAM
                </p>
              </div>
              
              <div className="space-y-3">
                {getActivatedLoanAccounts().map((account) => (
                  <button
                    key={account.id}
                    onClick={() => {
                      setSelectedAccount(account);
                      setCurrentScreen('vpa-creation');
                    }}
                    className={`w-full bg-white rounded-xl shadow-md p-5 hover:shadow-lg transition-all border-2 ${
                      selectedAccount?.id === account.id ? 'border-purple-500 bg-purple-50' : 'border-gray-200'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="text-left flex-1">
                        <div className="font-bold text-gray-900">{account.productName}</div>
                        <div className="text-sm text-gray-500 mt-1">A/c: {account.displayAccountNumber}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-xs text-gray-500">Credit Limit</div>
                        <div className="text-lg font-bold text-green-600">{account.limit}</div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between pt-3 border-t border-gray-200">
                      <span className="text-xs text-gray-500">Tap to link with UPI</span>
                      <ChevronRight className="w-4 h-4 text-gray-400" />
                    </div>
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {/* VPA Creation Screen */}
          {currentScreen === 'vpa-creation' && selectedAccount && (
            <motion.div
              key="vpa-creation"
              initial={{ opacity: 0, x: 100 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -100 }}
              className="p-4"
            >
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Create UPI ID</h1>
              <p className="text-sm text-gray-600 mb-6">Create a Virtual Payment Address (VPA) for your credit line</p>

              <div className="bg-gradient-to-r from-purple-600 to-purple-700 rounded-xl p-5 text-white mb-6 shadow-lg">
                <div className="text-xs font-medium mb-2 opacity-90">Selected Account</div>
                <div className="font-bold text-lg">{selectedAccount.productName}</div>
                <div className="text-sm mt-1 opacity-90">{selectedAccount.displayAccountNumber}</div>
                <div className="flex items-center gap-2 mt-3 pt-3 border-t border-white/20">
                  <span className="text-xs opacity-90">Credit Limit:</span>
                  <span className="font-bold">{selectedAccount.limit}</span>
                </div>
              </div>

              <div className="bg-white rounded-xl p-5 shadow-md mb-4">
                <label className="block text-sm font-bold text-gray-900 mb-3">
                  Choose your UPI ID
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    placeholder="yourname"
                    value={vpaName}
                    onChange={(e) => setVpaName(e.target.value.toLowerCase().replace(/[^a-z0-9]/g, ''))}
                    className="flex-1 px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-purple-500 focus:outline-none font-medium"
                  />
                  <span className="text-gray-600 font-medium">@ybl</span>
                </div>
                {vpaName && (
                  <div className="mt-3 p-3 bg-purple-50 rounded-lg">
                    <p className="text-sm text-purple-900">
                      <strong>Your UPI ID:</strong> {vpaName}@ybl
                    </p>
                  </div>
                )}
              </div>

              {/* VPA Suggestions */}
              {!vpaName && (
                <div className="bg-blue-50 rounded-xl p-4 mb-6 border-2 border-blue-200">
                  <div className="flex items-start gap-2 mb-3">
                    <Lightbulb className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-sm font-bold text-blue-900 mb-2">Suggested UPI IDs:</p>
                      <div className="space-y-2">
                        {[
                          `${selectedAccount.accountNumber.toLowerCase()}`,
                          `${selectedAccount.accountPrefix.toLowerCase()}credit`,
                          `${selectedAccount.accountPrefix.toLowerCase()}${Math.floor(1000 + Math.random() * 9000)}`
                        ].map((suggestion, index) => (
                          <button
                            key={index}
                            onClick={() => setVpaName(suggestion)}
                            className="w-full text-left px-3 py-2 bg-white rounded-lg border border-blue-300 hover:bg-blue-100 hover:border-blue-400 transition-all text-sm font-medium text-gray-900"
                          >
                            {suggestion}@ybl
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <button
                onClick={() => setCurrentScreen('success')}
                disabled={!vpaName || vpaName.length < 3}
                className={`w-full py-4 rounded-xl font-bold text-white shadow-lg transition-all ${
                  !vpaName || vpaName.length < 3
                    ? 'bg-gray-300 cursor-not-allowed'
                    : 'bg-gradient-to-r from-purple-600 to-purple-700 hover:shadow-xl active:scale-98'
                }`}
              >
                Create UPI ID & Link Account
              </button>

              <p className="text-xs text-gray-500 text-center mt-4 leading-relaxed">
                By creating this UPI ID, you agree to link your credit line with PhonePe for UPI payments.
              </p>
            </motion.div>
          )}

          {/* Success Screen */}
          {currentScreen === 'success' && selectedAccount && (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="p-4 flex flex-col items-center justify-center min-h-[calc(100vh-80px)]"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
                className="w-24 h-24 rounded-full bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center mb-6 shadow-2xl"
              >
                <CheckCircle className="w-12 h-12 text-white" strokeWidth={3} />
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-2xl font-bold text-gray-900 mb-3 text-center"
              >
                Credit Line Linked Successfully!
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="text-sm text-gray-600 text-center mb-8 max-w-sm"
              >
                Your {selectedAccount.productName} is now linked to PhonePe. You can use it for UPI payments!
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="w-full bg-white rounded-xl p-6 shadow-lg mb-6"
              >
                <div className="text-center mb-4">
                  <div className="text-xs text-gray-500 mb-1">Your UPI ID</div>
                  <div className="text-xl font-bold text-purple-600">{vpaName}@ybl</div>
                </div>
                <div className="pt-4 border-t border-gray-200">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-gray-600">Product:</span>
                    <span className="text-sm font-bold text-gray-900">{selectedAccount.productName}</span>
                  </div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-gray-600">Account:</span>
                    <span className="text-sm font-bold text-gray-900">{selectedAccount.displayAccountNumber}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Available Limit:</span>
                    <span className="text-sm font-bold text-green-600">{selectedAccount.limit}</span>
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="w-full bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl p-5 mb-6 border-2 border-purple-200"
              >
                <p className="text-sm text-gray-900 text-center font-medium">
                  🎉 You can now scan any QR code and pay using your credit line account!
                </p>
              </motion.div>

              <motion.button
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
                onClick={() => navigate('/credit-line-dashboard')}
                className="w-full py-4 rounded-xl font-bold text-white bg-gradient-to-r from-purple-600 to-purple-700 shadow-lg hover:shadow-xl active:scale-98 transition-all"
              >
                Done
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}