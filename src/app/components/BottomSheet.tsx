import { useEffect, useId, useRef } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { X } from 'lucide-react';

/**
 * A shadcn/vaul-style bottom sheet.
 *
 * Deliberate constraints, all of which the ad-hoc sheets this replaces got wrong
 * in at least one place:
 *
 *  • Height is capped at 80vh. The body scrolls; the header and footer never do,
 *    so a very long consent text can never push the close control off screen.
 *  • A grab handle sits at the top to signal "this can be pulled down", and it
 *    really works: dragging past a threshold (or flicking) dismisses the sheet.
 *  • Focus is trapped while open and returned to the trigger on close, and
 *    Escape closes. Body scroll is locked behind the sheet.
 *  • Content is width-matched to the app shell (`max-w-lg`) and centred, so it
 *    does not stretch edge-to-edge on a desktop viewport.
 *
 * The sheet is presentational only — it never decides anything. Callers own
 * whether it is a gate or, as of this change, purely informational.
 */

interface BottomSheetProps {
  open: boolean;
  onClose: () => void;
  /** Rendered as the sheet's accessible name. */
  title: string;
  /** Optional row between the title and the scrolling body (e.g. a language picker). */
  toolbar?: React.ReactNode;
  children: React.ReactNode;
  /** Pinned below the scroll area. Omit for a read-only sheet. */
  footer?: React.ReactNode;
  /** Accessible label for the close button. */
  closeLabel?: string;
}

/** Drag distance, or flick velocity, past which release dismisses the sheet. */
const DISMISS_OFFSET = 120;
const DISMISS_VELOCITY = 500;

export function BottomSheet({
  open,
  onClose,
  title,
  toolbar,
  children,
  footer,
  closeLabel = 'Close',
}: BottomSheetProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const restoreFocusRef = useRef<HTMLElement | null>(null);
  const reduceMotion = useReducedMotion();
  const titleId = useId();

  // Remember the trigger so focus can go back to it, move focus into the sheet,
  // and lock the page behind it.
  useEffect(() => {
    if (!open) return;

    restoreFocusRef.current = document.activeElement as HTMLElement | null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    // Focus the panel itself rather than the first control, so a screen reader
    // announces the sheet's name before its contents.
    const focusTimer = setTimeout(() => panelRef.current?.focus(), 0);

    return () => {
      clearTimeout(focusTimer);
      document.body.style.overflow = previousOverflow;
      restoreFocusRef.current?.focus?.();
    };
  }, [open]);

  // Escape closes; Tab cycles within the sheet.
  useEffect(() => {
    if (!open) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        onClose();
        return;
      }
      if (event.key !== 'Tab') return;

      const panel = panelRef.current;
      if (!panel) return;

      const focusable = panel.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
      );
      if (focusable.length === 0) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      const active = document.activeElement;

      if (event.shiftKey && (active === first || active === panel)) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && active === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={reduceMotion ? { opacity: 0.6 } : { opacity: 0 }}
            animate={{ opacity: 0.6 }}
            exit={reduceMotion ? { opacity: 0 } : { opacity: 0 }}
            transition={reduceMotion ? { duration: 0 } : undefined}
            onClick={onClose}
            className="fixed inset-0 bg-black z-[100]"
            aria-hidden="true"
          />

          <motion.div
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            tabIndex={-1}
            initial={reduceMotion ? { y: 0 } : { y: '100%' }}
            animate={{ y: 0 }}
            exit={reduceMotion ? { y: 0, opacity: 0 } : { y: '100%' }}
            transition={
              reduceMotion ? { duration: 0 } : { type: 'spring', damping: 32, stiffness: 320 }
            }
            drag={reduceMotion ? false : 'y'}
            dragElastic={{ top: 0, bottom: 0.4 }}
            dragConstraints={{ top: 0, bottom: 0 }}
            onDragEnd={(_, info) => {
              if (info.offset.y > DISMISS_OFFSET || info.velocity.y > DISMISS_VELOCITY) onClose();
            }}
            className="fixed bottom-0 left-0 right-0 z-[101] mx-auto w-full max-w-lg max-h-[80vh] bg-white rounded-t-2xl shadow-2xl overflow-hidden flex flex-col outline-none"
          >
            {/* Grab handle — signals the sheet can be pulled down, and does it. */}
            <div className="flex justify-center pt-3 pb-2 cursor-grab active:cursor-grabbing shrink-0">
              <div className="w-10 h-1 rounded-full bg-[#d9d9d9]" aria-hidden="true" />
            </div>

            <div className="px-6 pb-3 flex items-start justify-between gap-3 border-b border-[#e5e7eb] shrink-0">
              <h2 id={titleId} className="text-base font-semibold text-[#111827] pt-0.5">
                {title}
              </h2>
              <button
                type="button"
                onClick={onClose}
                aria-label={closeLabel}
                className="-mt-1 -mr-2 w-11 h-11 flex items-center justify-center rounded-lg text-[#6b7280] hover:bg-[#f9fafb] transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#315C9D] shrink-0"
              >
                <X className="w-5 h-5" strokeWidth={2.5} aria-hidden="true" />
              </button>
            </div>

            {toolbar && <div className="shrink-0 border-b border-[#e5e7eb]">{toolbar}</div>}

            {/* The only scrolling region, so the header and footer stay put. */}
            <div className="flex-1 overflow-y-auto overscroll-contain px-6 py-5">{children}</div>

            {footer && (
              <div className="px-6 py-5 border-t border-[#e5e7eb] shrink-0">{footer}</div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
