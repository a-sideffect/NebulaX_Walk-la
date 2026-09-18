import React from 'react';
import { Route, Scan, Bus, Bell } from 'lucide-react';
import { TabType } from '../types';

interface BottomNavBarProps {
  currentTab: TabType;
  onChangeTab: (tab: TabType) => void;
  alertCount?: number;
}

export const BottomNavBar: React.FC<BottomNavBarProps> = ({
  currentTab,
  onChangeTab,
  alertCount = 3,
}) => {
  const navItems: Array<{
    id: TabType;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
  }> = [
    { id: 'plan', label: 'Plan', icon: Route },
    { id: 'ar', label: 'AR Guide', icon: Scan },
    { id: 'transit', label: 'Bus & MRT', icon: Bus },
    { id: 'alerts', label: 'Alerts', icon: Bell },
  ];

  return (
    <nav 
      className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-[#0b1016]/95 backdrop-blur-xl border-t border-slate-800/80 px-6 py-2 z-40"
      id="bottom-navigation-bar"
    >
      <div className="flex items-center justify-between">
        {navItems.map((item) => {
          const isActive = currentTab === item.id;
          const Icon = item.icon;

          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onChangeTab(item.id)}
              id={`tab-button-${item.id}`}
              className={`flex flex-col items-center justify-center min-w-[64px] py-1 cursor-pointer transition-all ${
                isActive
                  ? 'text-[#00ffa3]'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <div className="relative">
                <Icon
                  className={`w-5 h-5 transition-transform duration-200 ${
                    isActive ? 'scale-110 stroke-[2.4]' : 'stroke-[1.8]'
                  }`}
                />
                {item.id === 'alerts' && alertCount > 0 && (
                  <span className="absolute -top-1 -right-1.5 w-2 h-2 rounded-full bg-[#f97316] ring-2 ring-[#0b1016]" />
                )}
              </div>
              <span
                className={`text-[11px] mt-1 tracking-tight font-medium ${
                  isActive ? 'font-bold text-[#00ffa3]' : 'text-slate-400'
                }`}
              >
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
