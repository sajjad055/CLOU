import { RouterProvider } from 'react-router';
import { router } from './routes';

// Default journey for visitors opening the shared demo link.
// Switching flows from Dev Preview still overwrites `activeFlow` after this
// one-time migration has run.
const DEFAULT_FLOW = 'hrms-pan-ntb';
const DEFAULT_FLOW_VERSION = 'hrms-pan-ntb-streamlined-v1';
const DEFAULT_FLOW_VERSION_KEY = 'defaultFlowVersion';

if (typeof window !== 'undefined') {
  try {
    const needsMigration =
      localStorage.getItem(DEFAULT_FLOW_VERSION_KEY) !== DEFAULT_FLOW_VERSION;

    if (needsMigration) {
      // Earlier builds remembered whichever Dev Preview flow was selected. A
      // returning tester could therefore stay in the longer "No PAN / no bank
      // record" journey even after the public demo default changed. Reset that
      // stale choice and its progress once for this flow version.
      localStorage.setItem('activeFlow', DEFAULT_FLOW);
      localStorage.removeItem('salaryAdvanceState');
      localStorage.removeItem('activatedCreditLines');
      localStorage.removeItem('cifNumber');
      sessionStorage.removeItem('hrmsJourney');
      localStorage.setItem(DEFAULT_FLOW_VERSION_KEY, DEFAULT_FLOW_VERSION);
    } else if (!localStorage.getItem('activeFlow')) {
      localStorage.setItem('activeFlow', DEFAULT_FLOW);
    }
  } catch {
    // Storage can be unavailable in restricted/private browsing. The screens
    // retain their existing storage-failure fallbacks in that case.
  }
}

export default function App() {
  return <RouterProvider router={router} />;
}
