import type { ReactNode } from 'react';

/**
 * Pins primary CTA content to the bottom of the screen on journey screens.
 * Includes a 24px (pb-6) bottom padding and a subtle top divider.
 */
export function StickyFooter({ children }: { children: ReactNode }) {
  return (
    <div className="fixed bottom-0 left-0 w-full bg-white border-t border-[#e5e7eb] z-40">
      <div className="max-w-lg mx-auto px-4 pt-4 pb-6">
        {children}
      </div>
    </div>
  );
}
