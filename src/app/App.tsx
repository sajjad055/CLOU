import { RouterProvider } from 'react-router';
import { router } from './routes';

// Default journey for first-time visitors (e.g. the deployed Netlify link).
// Switching flows from Dev Preview overwrites this value.
const DEFAULT_FLOW = 'ntb-no-ckyc';

if (typeof window !== 'undefined' && !localStorage.getItem('activeFlow')) {
  localStorage.setItem('activeFlow', DEFAULT_FLOW);
}

export default function App() {
  return <RouterProvider router={router} />;
}
