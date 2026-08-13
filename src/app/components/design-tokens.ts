// Design System Tokens for KYC Verification Pages

export const designTokens = {
  // Typography
  typography: {
    pageTitle: 'text-xl font-semibold text-gray-900',
    pageSubtitle: 'text-sm text-gray-500',
    sectionLabel: 'text-[13px] font-semibold text-gray-700',
    bodyText: 'text-[15px] font-semibold text-gray-900',
    bodyTextMedium: 'text-[13px] text-gray-700',
    smallText: 'text-[12px] text-gray-500',
    loaderTitle: 'text-xl font-semibold text-gray-900',
    loaderSubtitle: 'text-sm text-gray-500',
  },

  // Icon containers
  icons: {
    pageIcon: 'w-16 h-16 rounded-full flex items-center justify-center shadow-lg',
    pageIconInner: 'w-8 h-8',
    loaderIcon: 'w-20 h-20 rounded-full flex items-center justify-center shadow-lg',
    loaderIconInner: 'w-10 h-10',
    successIcon: 'w-32 h-32 rounded-full flex items-center justify-center shadow-2xl',
    successIconInner: 'w-20 h-20',
  },

  // Colors
  gradients: {
    primary: 'bg-gradient-to-r from-[#315C9D] to-[#315C9D]',
    success: 'bg-gradient-to-br from-green-500 to-green-600',
    warning: 'bg-gradient-to-br from-orange-500 to-orange-600',
    info: 'bg-gradient-to-br from-blue-500 to-blue-600',
    purple: 'bg-gradient-to-br from-purple-500 to-purple-600',
  },

  // Spacing
  spacing: {
    pageContainer: 'px-4 pt-6 pb-8',
    sectionMargin: 'mb-5',
    cardPadding: 'p-5',
    buttonPadding: 'px-5 py-3.5',
  },

  // Components
  components: {
    input: 'w-full bg-white border border-gray-300 rounded-xl px-4 py-3 focus:border-[#315C9D] focus:ring-2 focus:ring-[#315C9D]/20 transition-all shadow-sm outline-none text-[15px] font-medium text-gray-900',
    button: 'w-full bg-gradient-to-r from-[#315C9D] to-[#315C9D] text-white px-5 py-3.5 rounded-xl shadow-sm hover:shadow-md transition-all text-[15px] font-semibold',
    buttonSecondary: 'w-full bg-white border border-gray-200 text-gray-700 px-5 py-3.5 rounded-xl hover:bg-gray-50 transition-all text-[15px] font-semibold',
    card: 'bg-white border border-gray-200 rounded-xl p-5 shadow-sm',
    infoBox: 'bg-blue-50 border border-blue-200 rounded-xl p-4',
  },

  // Animations
  animations: {
    spring: { type: 'spring' as const, stiffness: 200, damping: 15 },
    rotation: { duration: 1, repeat: Infinity, ease: 'linear' as const },
  },
};
