import { ReactNode } from 'react';

interface AppCardProps {
  icon: ReactNode;
  title: string;
  iconBg: string;
  badge?: string;
  onClick?: () => void;
}

export function AppCard({ icon, title, iconBg, badge, onClick }: AppCardProps) {
  return (
    <div 
      onClick={onClick}
      className="relative flex flex-col items-center cursor-pointer"
    >
      {badge && (
        <div className="absolute -top-1 -right-1 bg-orange-500 text-white text-[9px] px-1.5 py-0.5 rounded-full z-10 uppercase tracking-wide">
          {badge}
        </div>
      )}
      <div 
        className={`w-16 h-16 rounded-2xl ${iconBg} flex items-center justify-center shadow-sm mb-2`}
      >
        {icon}
      </div>
      <span className="text-xs text-center text-gray-700 max-w-[80px] leading-tight">
        {title}
      </span>
    </div>
  );
}