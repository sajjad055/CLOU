import { Outlet, useNavigate, useLocation } from 'react-router';
import { Home, Bell, Info, Settings, Wallet } from 'lucide-react';
import { DevPreview } from './DevPreview';

// Bottom nav only appears on the top-level tabs, not during the onboarding journey.
const SHOW_NAV_ROUTES = ['/', '/credit-line-dashboard'];

export function Layout() {
  const navigate = useNavigate();
  const location = useLocation();
  const hideNav = !SHOW_NAV_ROUTES.includes(location.pathname);

  return (
    <div className="relative min-h-screen bg-white">
      <Outlet />
      <DevPreview />

      {/* Bottom Navigation */}
      {!hideNav && <nav className="fixed bottom-0 left-0 w-full z-50 flex justify-around items-center px-4 py-3 bg-white border-t border-[#e5e7eb] shadow-[0_-2px_8px_rgba(0,0,0,0.06)]">
        {(() => {
          const homeActive = location.pathname === '/' || location.pathname === '/credit-line-dashboard';
          const creditsActive = false;
          return (
            <>
              <button onClick={() => navigate('/')} className="flex flex-col items-center justify-center p-2 min-w-[52px] active:scale-90 duration-150">
                <div className="w-6 h-6 flex items-center justify-center mb-0.5">
                  <Home className={`w-5 h-5 ${homeActive ? 'text-[#315C9D] fill-[#315C9D]' : 'text-[#6b7280]'}`} />
                </div>
                <span className={`text-[10px] font-semibold ${homeActive ? 'text-[#315C9D]' : 'text-[#6b7280]'}`}>Home</span>
              </button>
              <button onClick={() => navigate('/credit-line-dashboard')} className="flex flex-col items-center justify-center p-2 min-w-[52px] active:scale-90 duration-150">
                <div className="w-6 h-6 flex items-center justify-center mb-0.5">
                  <Wallet className={`w-5 h-5 ${creditsActive ? 'text-[#315C9D] fill-[#315C9D]/15' : 'text-[#6b7280]'}`} />
                </div>
                <span className={`text-[10px] font-semibold ${creditsActive ? 'text-[#315C9D]' : 'text-[#6b7280]'}`}>My Credits</span>
              </button>
            </>
          );
        })()}
        <a href="#" className="flex flex-col items-center justify-center p-2 min-w-[52px] active:scale-90 duration-150">
          <div className="w-6 h-6 flex items-center justify-center mb-0.5">
            <Bell className="w-5 h-5 text-[#6b7280]" />
          </div>
          <span className="text-[10px] font-semibold text-[#6b7280]">Alerts</span>
        </a>
        <a href="#" className="flex flex-col items-center justify-center p-2 min-w-[52px] active:scale-90 duration-150">
          <div className="w-6 h-6 flex items-center justify-center mb-0.5">
            <Info className="w-5 h-5 text-[#6b7280]" />
          </div>
          <span className="text-[10px] font-semibold text-[#6b7280]">About</span>
        </a>
        <a href="#" className="flex flex-col items-center justify-center p-2 min-w-[52px] active:scale-90 duration-150">
          <div className="w-6 h-6 flex items-center justify-center mb-0.5">
            <Settings className="w-5 h-5 text-[#6b7280]" />
          </div>
          <span className="text-[10px] font-semibold text-[#6b7280]">Settings</span>
        </a>
      </nav>}
    </div>
  );
}
