import { RouterProvider } from 'react-router';
import { router } from './routes';

// Default journey for first-time visitors (e.g. the deployed link).
// Switching flows from Dev Preview overwrites this value.
// Set to the "HRMS PAN Present, NTB" flow — the second entry in Dev Preview.
const DEFAULT_FLOW = 'hrms-pan-ntb';

if (typeof window !== 'undefined' && !localStorage.getItem('activeFlow')) {
  localStorage.setItem('activeFlow', DEFAULT_FLOW);
}

export default function App() {
  return <RouterProvider router={router} />;
}
