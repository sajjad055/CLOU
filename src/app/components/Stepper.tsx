import { Check } from 'lucide-react';

export interface StepperStep {
  id: string;
  title: string;
  description: string;
}

interface StepperProps {
  steps: StepperStep[];
  /** How many leading steps are done. The step at this index is the current one. */
  completedCount: number;
  labels: { done: string; inProgress: string; pending: string };
}

/**
 * Vertical progress stepper.
 *
 * Each step is a node on a connecting rail: the rail segment leaving a completed
 * node is filled green, segments from the current step down stay grey — so
 * progress reads at a glance from the rail, not from colour on the labels alone.
 * State is also stated in words via the per-step chip, so the meaning survives
 * for anyone who can't rely on colour (WCAG 1.4.1).
 *
 * Semantics: an ordered list, `aria-current="step"` on the active row, and the
 * decorative rail/number glyphs hidden from assistive tech.
 */
export function Stepper({ steps, completedCount, labels }: StepperProps) {
  return (
    <ol className="relative">
      {steps.map((step, i) => {
        const done = i < completedCount;
        const current = i === completedCount;
        const isLast = i === steps.length - 1;
        const stateLabel = done ? labels.done : current ? labels.inProgress : labels.pending;

        return (
          <li
            key={step.id}
            aria-current={current ? 'step' : undefined}
            className="relative flex gap-4 pb-3 last:pb-0"
          >
            {/* Connecting rail — filled once this step is done, grey otherwise. */}
            {!isLast && (
              <span
                aria-hidden="true"
                className={`absolute left-4 top-9 -bottom-0.5 w-0.5 -translate-x-1/2 rounded-full transition-colors ${
                  done ? 'bg-[#2da94f]' : 'bg-gray-200'
                }`}
              />
            )}

            {/* Node */}
            <div className="relative z-10 shrink-0">
              {done ? (
                <span className="flex w-8 h-8 rounded-full bg-[#2da94f] items-center justify-center shadow-sm">
                  <Check className="w-4 h-4 text-white" strokeWidth={3} aria-hidden="true" />
                </span>
              ) : current ? (
                <span className="flex w-8 h-8 rounded-full bg-[#315C9D] items-center justify-center text-[13px] font-bold text-white ring-4 ring-[#315C9D]/15" aria-hidden="true">
                  {i + 1}
                </span>
              ) : (
                <span className="flex w-8 h-8 rounded-full border-2 border-gray-300 bg-white items-center justify-center text-[13px] font-bold text-gray-400" aria-hidden="true">
                  {i + 1}
                </span>
              )}
            </div>

            {/* Content */}
            <div
              className={`flex-1 min-w-0 rounded-xl px-3.5 py-2.5 transition-colors ${
                current ? 'bg-[#315C9D]/[0.06] ring-1 ring-[#315C9D]/15' : ''
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <h3 className={`text-sm font-semibold leading-tight ${done || current ? 'text-[#111827]' : 'text-gray-500'}`}>
                  {step.title}
                </h3>
                <span
                  className={`text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full shrink-0 ${
                    done
                      ? 'bg-[#2da94f]/10 text-[#2da94f]'
                      : current
                        ? 'bg-[#315C9D]/10 text-[#315C9D]'
                        : 'bg-gray-100 text-gray-400'
                  }`}
                >
                  {stateLabel}
                </span>
              </div>
              <p className="text-[11px] text-gray-500 leading-snug mt-0.5">{step.description}</p>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
