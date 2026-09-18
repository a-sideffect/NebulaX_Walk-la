import React from 'react';
import { Umbrella, CloudRain } from 'lucide-react';
import { WeatherStatus } from '../types';

interface TopHeaderProps {
  weather: WeatherStatus;
  onOpenWeatherModal: () => void;
  onOpenProfileModal?: () => void;
}

export const TopHeader: React.FC<TopHeaderProps> = ({
  weather,
  onOpenWeatherModal,
  onOpenProfileModal,
}) => {
  const getConditionLabel = () => {
    switch (weather.condition) {
      case 'rain_soon':
        return `Rain in ${weather.rainArrivalMins ?? 10}m • ${weather.temperatureC}°C`;
      case 'heavy_rain':
        return `Heavy Rain • ${weather.temperatureC}°C`;
      case 'light_rain':
        return `Passing Drizzle • ${weather.temperatureC}°C`;
      case 'clear':
        return `Clear Sky • ${weather.temperatureC}°C`;
    }
  };

  return (
    <header className="flex items-center justify-between px-4 pt-3 pb-2 select-none" id="app-top-header">
      {/* App Logo & Title */}
      <div className="flex items-center gap-2.5 min-w-0">
        <div 
          className="w-10 h-10 rounded-xl bg-[#08352f] border border-[#0d4f45] flex items-center justify-center shrink-0 shadow-inner"
          id="brand-logo-icon"
        >
          <Umbrella className="w-5 h-5 text-[#00ffa3] stroke-[2.2]" />
        </div>
        <div className="flex flex-col min-w-0">
          <h1 className="text-[17px] font-bold text-white tracking-tight leading-tight truncate flex items-center gap-1">
            CanopyNav
          </h1>
          <span className="text-[11.5px] text-slate-400 leading-none truncate">
            Sheltered Walkway & Rain Radar
          </span>
        </div>
      </div>

      {/* Weather Pill & Profile Avatar */}
      <div className="flex items-center gap-2 shrink-0">
        <button
          onClick={onOpenWeatherModal}
          id="btn-weather-pill"
          type="button"
          aria-label="View Weather Radar Advisory"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#152331]/90 hover:bg-[#1a2c3d] border border-slate-700/60 shadow-sm transition-colors text-slate-200 active:scale-95"
        >
          <CloudRain className="w-3.5 h-3.5 text-[#38bdf8] shrink-0 stroke-[2.2]" />
          <span className="text-[11.5px] font-semibold tracking-tight whitespace-nowrap">
            {getConditionLabel()}
          </span>
        </button>

        {/* User Profile Avatar */}
        <button
          onClick={onOpenProfileModal}
          id="btn-profile-avatar"
          type="button"
          aria-label="User Profile"
          className="w-9 h-9 rounded-full overflow-hidden border-[1.5px] border-slate-600/80 hover:border-[#00ffa3] transition-colors shrink-0 bg-slate-800 flex items-center justify-center shadow-sm"
        >
          <img
            src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80"
            alt="Profile avatar"
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover"
          />
        </button>
      </div>
    </header>
  );
};
