export function MobileHeader() {
  return (
    <div className="flex items-center justify-between px-4 py-2 text-xs">
      <span className="font-medium">9:41</span>
      <div className="flex items-center gap-1">
        <div className="w-4 h-2.5">
          <svg viewBox="0 0 16 10" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="0.5" y="0.5" width="4" height="9" rx="1" stroke="currentColor" strokeWidth="1" fill="none"/>
            <rect x="6" y="2" width="4" height="8" rx="1" fill="currentColor"/>
            <rect x="11.5" y="3.5" width="4" height="6" rx="1" stroke="currentColor" strokeWidth="1" fill="currentColor"/>
          </svg>
        </div>
        <div className="w-4 h-3">
          <svg viewBox="0 0 16 12" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M2 9C2 9 3 7 8 7C13 7 14 9 14 9V11C14 11.5523 13.5523 12 13 12H3C2.44772 12 2 11.5523 2 11V9Z" fill="currentColor"/>
            <path d="M2 5C2 5 3.5 3 8 3C12.5 3 14 5 14 5V7C14 7 13 5 8 5C3 5 2 7 2 7V5Z" fill="currentColor"/>
            <path d="M2 1C2 1 4 0 8 0C12 0 14 1 14 1V3C14 3 12.5 1 8 1C3.5 1 2 3 2 3V1Z" fill="currentColor"/>
          </svg>
        </div>
        <div className="w-6 h-3">
          <svg viewBox="0 0 24 12" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="1" y="1" width="18" height="10" rx="2" stroke="currentColor" strokeWidth="2" fill="none"/>
            <rect x="20" y="4" width="3" height="4" rx="1" fill="currentColor"/>
            <rect x="3" y="3" width="14" height="6" rx="1" fill="currentColor"/>
          </svg>
        </div>
      </div>
    </div>
  );
}
