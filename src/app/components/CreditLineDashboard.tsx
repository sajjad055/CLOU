import { useState } from 'react';
import { useNavigate } from 'react-router';
import { motion } from 'motion/react';
import { CreditCard, TrendingUp, Calendar, MapPin, ChevronDown, ChevronUp, Wallet, ShieldCheck, Landmark, Car, Bike, GraduationCap, PartyPopper, Heart, Laptop, ShoppingBag, User, Search, Clock, FileText, BarChart3, Umbrella, RefreshCcw } from 'lucide-react';
import kalanjiyamLogo from '@/assets/kalanjiyam-logo.svg';

interface Transaction {
  id: string;
  merchant: string;
  amount: string;
  date: string;
  time: string;
  location: string;
  status: 'completed' | 'pending';
  type: 'debit';
}

interface CreditLine {
  id: string;
  productName: string;
  displayAccountNumber: string;
  totalLimit: string;
  availableLimit: string;
  usedAmount: string;
  upiId: string;
  transactions: Transaction[];
}

// Generate transactions based on credit line type
const generateTransactions = (productName: string): Transaction[] => {
  const festivalTransactions = [
    {
      id: '1',
      merchant: 'Saravana Stores',
      amount: '₹3,200',
      date: 'Apr 1, 2026',
      time: '11:30 AM',
      location: 'T Nagar, Chennai',
      status: 'completed' as const,
      type: 'debit' as const
    },
    {
      id: '2',
      merchant: 'Pothys Silk House',
      amount: '₹5,800',
      date: 'Mar 31, 2026',
      time: '3:45 PM',
      location: 'Pondy Bazaar, Chennai',
      status: 'completed' as const,
      type: 'debit' as const
    },
    {
      id: '3',
      merchant: 'Chennai Silks',
      amount: '₹4,500',
      date: 'Mar 30, 2026',
      time: '2:15 PM',
      location: 'Ranganathan Street, Chennai',
      status: 'completed' as const,
      type: 'debit' as const
    },
    {
      id: '4',
      merchant: 'Nalli Silks',
      amount: '₹6,200',
      date: 'Mar 29, 2026',
      time: '10:00 AM',
      location: 'Panagal Park, Chennai',
      status: 'completed' as const,
      type: 'debit' as const
    }
  ];

  const educationTransactions = [
    {
      id: '1',
      merchant: 'Higginbothams Bookstore',
      amount: '₹2,400',
      date: 'Apr 1, 2026',
      time: '9:15 AM',
      location: 'Anna Nagar, Chennai',
      status: 'completed' as const,
      type: 'debit' as const
    },
    {
      id: '2',
      merchant: 'HP Laptop Store',
      amount: '₹35,000',
      date: 'Mar 30, 2026',
      time: '1:30 PM',
      location: 'Velachery, Chennai',
      status: 'completed' as const,
      type: 'debit' as const
    },
    {
      id: '3',
      merchant: 'Odyssey Books',
      amount: '₹1,850',
      date: 'Mar 28, 2026',
      time: '5:20 PM',
      location: 'Adyar, Chennai',
      status: 'completed' as const,
      type: 'debit' as const
    }
  ];

  const marriageTransactions = [
    {
      id: '1',
      merchant: 'GRT Jewellers',
      amount: '₹45,000',
      date: 'Apr 1, 2026',
      time: '11:00 AM',
      location: 'Pondy Bazaar, Chennai',
      status: 'completed' as const,
      type: 'debit' as const
    },
    {
      id: '2',
      merchant: 'Taj Coromandel Hotel',
      amount: '₹75,000',
      date: 'Mar 29, 2026',
      time: '10:30 AM',
      location: 'Nungambakkam, Chennai',
      status: 'completed' as const,
      type: 'debit' as const
    },
    {
      id: '3',
      merchant: 'Kumaran Silks',
      amount: '₹12,500',
      date: 'Mar 27, 2026',
      time: '3:00 PM',
      location: 'Mylapore, Chennai',
      status: 'completed' as const,
      type: 'debit' as const
    }
  ];

  const medicalTransactions = [
    {
      id: '1',
      merchant: 'Apollo Hospitals',
      amount: '₹15,000',
      date: 'Apr 1, 2026',
      time: '8:30 AM',
      location: 'Greams Road, Chennai',
      status: 'completed' as const,
      type: 'debit' as const
    },
    {
      id: '2',
      merchant: 'MedPlus Pharmacy',
      amount: '₹3,200',
      date: 'Mar 31, 2026',
      time: '7:15 PM',
      location: 'Anna Nagar, Chennai',
      status: 'completed' as const,
      type: 'debit' as const
    },
    {
      id: '3',
      merchant: 'Dr. Agarwal\'s Eye Hospital',
      amount: '₹8,500',
      date: 'Mar 28, 2026',
      time: '2:00 PM',
      location: 'T Nagar, Chennai',
      status: 'completed' as const,
      type: 'debit' as const
    }
  ];

  const housingTransactions = [
    {
      id: '1',
      merchant: 'Home Centre',
      amount: '₹28,000',
      date: 'Apr 1, 2026',
      time: '12:00 PM',
      location: 'Phoenix Marketcity, Chennai',
      status: 'completed' as const,
      type: 'debit' as const
    },
    {
      id: '2',
      merchant: 'Asian Paints Dealer',
      amount: '₹15,600',
      date: 'Mar 30, 2026',
      time: '10:45 AM',
      location: 'Porur, Chennai',
      status: 'completed' as const,
      type: 'debit' as const
    },
    {
      id: '3',
      merchant: 'Pepperfry Furniture',
      amount: '₹42,000',
      date: 'Mar 27, 2026',
      time: '4:30 PM',
      location: 'OMR, Chennai',
      status: 'completed' as const,
      type: 'debit' as const
    }
  ];

  const businessTransactions = [
    {
      id: '1',
      merchant: 'Dell Business Store',
      amount: '₹55,000',
      date: 'Apr 1, 2026',
      time: '11:00 AM',
      location: 'Anna Salai, Chennai',
      status: 'completed' as const,
      type: 'debit' as const
    },
    {
      id: '2',
      merchant: 'Office Depot',
      amount: '₹12,400',
      date: 'Mar 30, 2026',
      time: '2:30 PM',
      location: 'Nungambakkam, Chennai',
      status: 'completed' as const,
      type: 'debit' as const
    },
    {
      id: '3',
      merchant: 'Reliance Digital',
      amount: '₹8,900',
      date: 'Mar 28, 2026',
      time: '5:00 PM',
      location: 'Velachery, Chennai',
      status: 'completed' as const,
      type: 'debit' as const
    }
  ];

  // Match transactions to credit line type
  const productLower = productName.toLowerCase();
  if (productLower.includes('festival')) return festivalTransactions;
  if (productLower.includes('education')) return educationTransactions;
  if (productLower.includes('marriage') || productLower.includes('wedding')) return marriageTransactions;
  if (productLower.includes('medical') || productLower.includes('health')) return medicalTransactions;
  if (productLower.includes('housing') || productLower.includes('home')) return housingTransactions;
  if (productLower.includes('business') || productLower.includes('enterprise')) return businessTransactions;
  
  // Default generic transactions
  return [
    {
      id: '1',
      merchant: 'Retail Store',
      amount: '₹2,500',
      date: 'Apr 1, 2026',
      time: '2:30 PM',
      location: 'Chennai',
      status: 'completed' as const,
      type: 'debit' as const
    }
  ];
};

// Fetch activated credit lines and enrich with transaction data
const getCreditLinesWithTransactions = (): CreditLine[] => {
  try {
    const activatedOffers = localStorage.getItem('activatedCreditLines');
    if (!activatedOffers) {
      return [];
    }

    const offers = JSON.parse(activatedOffers) as Array<{
      id: string;
      nameEn: string;
      amount: string;
      accountPrefix: string;
    }>;

    return offers.map((offer, index) => {
      const totalLimitNum = parseInt(offer.amount.replace(/[^0-9]/g, ''));
      const usedAmountNum = Math.floor(Math.random() * (totalLimitNum * 0.4)); // 0-40% usage
      const availableLimitNum = totalLimitNum - usedAmountNum;

      // Randomly select some transactions for each account
      const transactions = generateTransactions(offer.nameEn);

      return {
        id: String(index + 1),
        productName: offer.nameEn,
        displayAccountNumber: `${offer.accountPrefix.substring(0, 4).toUpperCase()}${Math.floor(1000 + Math.random() * 9000)}`,
        totalLimit: `₹${totalLimitNum.toLocaleString('en-IN')}`,
        availableLimit: `₹${availableLimitNum.toLocaleString('en-IN')}`,
        usedAmount: `₹${usedAmountNum.toLocaleString('en-IN')}`,
        upiId: `${offer.accountPrefix.toLowerCase()}${Math.floor(100 + Math.random() * 900)}@ybl`,
        transactions: transactions
      };
    });
  } catch (error) {
    console.error('Error loading credit lines:', error);
    return [];
  }
};

// Pick a product icon based on the credit line name
const getProductIcon = (name: string) => {
  const n = name.toLowerCase();
  if (n.includes('four') || n.includes('vehicle') || n.includes('car')) return Car;
  if (n.includes('two') || n.includes('bike')) return Bike;
  if (n.includes('education')) return GraduationCap;
  if (n.includes('festival')) return PartyPopper;
  if (n.includes('marriage') || n.includes('wedding')) return Heart;
  if (n.includes('electronic') || n.includes('computer')) return Laptop;
  if (n.includes('handloom') || n.includes('textile')) return ShoppingBag;
  return CreditCard;
};

const appItems = [
  { id: 'pay-slips', title: 'Pay Slips', icon: FileText },
  { id: 'gpf', title: 'GPF Balance', icon: BarChart3 },
  { id: 'insurance', title: 'Group Insurance', icon: Umbrella },
  { id: 'reimbursements', title: 'Reimbursements', icon: RefreshCcw },
];

export function CreditLineDashboard() {
  const navigate = useNavigate();
  const [expandedCard, setExpandedCard] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'apps' | 'advance'>('advance');
  const creditLines = getCreditLinesWithTransactions();

  const toggleCard = (id: string) => {
    setExpandedCard(expandedCard === id ? null : id);
  };

  const totalAvailable = creditLines.reduce((sum, line) => {
    const amount = parseInt(line.availableLimit.replace(/[^0-9]/g, ''));
    return sum + amount;
  }, 0);

  const totalUsed = creditLines.reduce((sum, line) => {
    const amount = parseInt(line.usedAmount.replace(/[^0-9]/g, ''));
    return sum + amount;
  }, 0);

  const totalLimit = creditLines.reduce((sum, line) => {
    const amount = parseInt(line.totalLimit.replace(/[^0-9]/g, ''));
    return sum + amount;
  }, 0);

  // Debug function to manually populate test data
  const populateTestData = () => {
    const testData = [
      {
        id: 'festival',
        nameEn: 'Festival',
        nameTa: 'பண்டிகை',
        amount: '₹25,000',
        accountPrefix: 'festival',
        accountNumber: 'festival1234567890'
      },
      {
        id: 'education',
        nameEn: 'Education',
        nameTa: 'கல்வி',
        amount: '₹75,000',
        accountPrefix: 'education',
        accountNumber: 'education9876543210'
      }
    ];
    localStorage.setItem('activatedCreditLines', JSON.stringify(testData));
    window.location.reload(); // Reload to show the data
  };

  const tabs: { id: 'apps' | 'advance'; label: string }[] = [
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
        ) : creditLines.length === 0 ? (
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
                onClick={() => navigate('/advances-upi')}
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
        ) : (
          <>
            {/* Total available hero */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 }}
              className="bg-[#315C9D] rounded-2xl p-5 text-white mb-4"
            >
              <div className="flex items-center gap-2 text-white/80 mb-1">
                <Wallet className="w-4 h-4" strokeWidth={2} />
                <span className="text-xs font-medium">Total available to spend</span>
              </div>
              <div className="text-3xl font-black tracking-tight">
                ₹{totalAvailable.toLocaleString('en-IN')}
              </div>
              <div className="mt-4 pt-4 border-t border-white/15 flex items-center justify-between">
                <div>
                  <div className="text-[11px] text-white/70">Total limit</div>
                  <div className="text-sm font-semibold">₹{totalLimit.toLocaleString('en-IN')}</div>
                </div>
                <div className="text-right">
                  <div className="text-[11px] text-white/70">Spent so far</div>
                  <div className="text-sm font-semibold">₹{totalUsed.toLocaleString('en-IN')}</div>
                </div>
              </div>
            </motion.div>

            {/* Calming repayment reassurance */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.12 }}
              className="bg-[#eaf7ef] border border-[#2da94f]/20 rounded-2xl p-4 mb-6 flex items-start gap-3"
            >
              <div className="w-10 h-10 rounded-full bg-[#2da94f]/15 flex items-center justify-center flex-shrink-0">
                <ShieldCheck className="w-5 h-5 text-[#2da94f]" strokeWidth={2} />
              </div>
              <div>
                <p className="text-sm font-semibold text-[#111827] mb-0.5">
                  Repayment is taken care of
                </p>
                <p className="text-[12px] text-[#4b5563] leading-relaxed">
                  Instalments are auto-deducted from your salary by the Government of Tamil Nadu — nothing to pay manually.
                </p>
              </div>
            </motion.div>

            <h2 className="text-sm font-bold text-[#111827] mb-3">Your advances</h2>

            {/* Credit line cards */}
            <div className="space-y-4">
              {creditLines.map((line, index) => {
                const isExpanded = expandedCard === line.id;
                const usagePercentage =
                  (parseInt(line.usedAmount.replace(/[^0-9]/g, '')) /
                    parseInt(line.totalLimit.replace(/[^0-9]/g, ''))) * 100;
                const ProductIcon = getProductIcon(line.productName);

                return (
                  <motion.div
                    key={line.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.15 + index * 0.08 }}
                    className="bg-white border border-gray-200 rounded-2xl overflow-hidden"
                  >
                    <div className="p-4">
                      <div className="flex items-start gap-3 mb-4">
                        <div className="w-11 h-11 rounded-xl bg-[#315C9D]/10 flex items-center justify-center flex-shrink-0">
                          <ProductIcon className="w-6 h-6 text-[#315C9D]" strokeWidth={2} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-sm font-bold text-[#111827] leading-tight">
                            {line.productName} Advance
                          </h3>
                          <p className="text-[11px] text-gray-500 mt-0.5 truncate">
                            A/c {line.displayAccountNumber} · {line.upiId}
                          </p>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <div className="text-[10px] text-gray-500">Available</div>
                          <div className="text-base font-black text-[#315C9D] leading-tight">
                            {line.availableLimit}
                          </div>
                        </div>
                      </div>

                      {/* Usage bar */}
                      <div className="flex items-center justify-between text-[11px] text-gray-500 mb-1.5">
                        <span>Spent {line.usedAmount}</span>
                        <span>Limit {line.totalLimit}</span>
                      </div>
                      <div className="w-full h-2 bg-[#315C9D]/10 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${usagePercentage}%` }}
                          transition={{ delay: 0.35 + index * 0.08, duration: 0.8 }}
                          className="h-full bg-[#315C9D] rounded-full"
                        />
                      </div>

                      {/* Auto-repay chip */}
                      <div className="mt-3 inline-flex items-center gap-1.5 text-[11px] font-medium text-[#2da94f]">
                        <Landmark className="w-3.5 h-3.5" strokeWidth={2} />
                        Auto-repaid from your salary
                      </div>
                    </div>

                    {/* Transactions */}
                    <div className="border-t border-gray-100">
                      <button
                        onClick={() => toggleCard(line.id)}
                        aria-expanded={isExpanded}
                        className="w-full flex items-center justify-between px-4 py-3 text-left"
                      >
                        <div className="flex items-center gap-2">
                          <TrendingUp className="w-4 h-4 text-[#315C9D]" strokeWidth={2} />
                          <span className="text-[13px] font-semibold text-[#111827]">
                            Recent transactions ({line.transactions.length})
                          </span>
                        </div>
                        {isExpanded ? (
                          <ChevronUp className="w-5 h-5 text-gray-400" />
                        ) : (
                          <ChevronDown className="w-5 h-5 text-gray-400" />
                        )}
                      </button>

                      {isExpanded && (
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="px-4 pb-4 space-y-2"
                        >
                          {line.transactions.map((transaction) => (
                            <div
                              key={transaction.id}
                              className="flex items-start gap-3 p-3 bg-[#f9fafb] border border-gray-100 rounded-xl"
                            >
                              <div className="w-9 h-9 rounded-full bg-[#315C9D]/10 flex items-center justify-center flex-shrink-0">
                                <CreditCard className="w-4 h-4 text-[#315C9D]" strokeWidth={2} />
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-start justify-between mb-1 gap-2">
                                  <div className="text-[13px] font-semibold text-[#111827] truncate">
                                    {transaction.merchant}
                                  </div>
                                  <div className="text-[13px] font-bold text-[#111827] flex-shrink-0">
                                    {transaction.amount}
                                  </div>
                                </div>
                                <div className="flex items-center gap-1.5 text-[11px] text-gray-500">
                                  <Calendar className="w-3 h-3" />
                                  <span>{transaction.date} • {transaction.time}</span>
                                </div>
                                <div className="flex items-center gap-1 text-[11px] text-gray-400 mt-0.5">
                                  <MapPin className="w-3 h-3" />
                                  <span className="truncate">{transaction.location}</span>
                                </div>
                              </div>
                            </div>
                          ))}
                        </motion.div>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
}