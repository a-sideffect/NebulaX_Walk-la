import React from 'react';
import { X, CloudRain, Sun, CloudDrizzle, Check, CloudLightning } from 'lucide-react';
import { WeatherStatus } from '../types';

interface WeatherPickerModalProps {
  isOpen: boolean;
  currentWeather: WeatherStatus;
  onSelectWeather: (weather: WeatherStatus) => void;
  onClose: () => void;
}

export const WeatherPickerModal: React.FC<WeatherPickerModalProps> = ({
  isOpen,
  currentWeather,
  onSelectWeather,
  onClose,
}) => {
  if (!isOpen) return null;

  const weatherPresets: Array<{
    status: WeatherStatus;
    title: string;
    badge: string;
    description: string;
    icon: React.ComponentType<{ className?: string }>;
  }> = [
    {
      status: {
        condition: 'rain_soon',
        temperatureC: 29,
        rainArrivalMins: 10,
        rainfallIntensityMm: 14.5,
        radarCellDistanceKm: 2.4,
        advisoryText: 'Rain cell arrives in Tampines in 10 minutes. Boarding shelter is only 35m from your exit.',
      },
      title: 'Rain in 10m • 29°C (Default)',
      badge: 'Rain imminent',
      description: 'Doppler radar shows rain cloud 2.4km away. Feeder bus is recommended for 100% dry transit.',
      icon: CloudRain,
    },
    {
      status: {
        condition: 'heavy_rain',
        temperatureC: 26,
        rainArrivalMins: 0,
        rainfallIntensityMm: 35.0,
        radarCellDistanceKm: 0,
        advisoryText: 'Heavy rainstorm ongoing across Tampines. Open crossings impassable without large umbrella.',
      },
      title: 'Heavy Rainstorm • 26°C',
      badge: 'Active Downpour',
      description: 'Continuous downpour. Strongly stay within underground or covered transit concourses.',
      icon: CloudLightning,
    },
    {
      status: {
        condition: 'light_rain',
        temperatureC: 28,
        rainArrivalMins: null,
        rainfallIntensityMm: 2.0,
        radarCellDistanceKm: 0.5,
        advisoryText: 'Passing drizzle over Tampines central. Canopy walkway provides 95% protection.',
      },
      title: 'Passing Drizzle • 28°C',
      badge: 'Light Showers',
      description: 'Mild drizzle. Walking via covered linkways is pleasant and brisk.',
      icon: CloudDrizzle,
    },
    {
      status: {
        condition: 'clear',
        temperatureC: 31,
        rainArrivalMins: null,
        rainfallIntensityMm: 0,
        radarCellDistanceKm: 40,
        advisoryText: 'Clear and overcast. No rain detected within 30km radius.',
      },
      title: 'Clear Skies • 31°C',
      badge: 'Dry Weather',
      description: 'Zero rain imminent. Sheltered walkway offers shade and sun protection.',
      icon: Sun,
    },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-150">
      <div 
        className="w-full max-w-md bg-[#101822] rounded-t-[28px] sm:rounded-[28px] border border-slate-800 shadow-2xl overflow-hidden flex flex-col"
        id="weather-picker-modal"
      >
        <div className="px-5 pt-4 pb-3 flex items-center justify-between border-b border-slate-800">
          <div>
            <h3 className="text-[16px] font-bold text-white tracking-tight">
              Singapore Meteorological Radar
            </h3>
            <p className="text-[11.5px] text-slate-400">
              Simulate real-time precipitation conditions
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-slate-300 hover:text-white cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-4 space-y-2.5 max-h-[70vh] overflow-y-auto">
          {weatherPresets.map((preset, idx) => {
            const isSelected = preset.status.condition === currentWeather.condition;
            const Icon = preset.icon;

            return (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  onSelectWeather(preset.status);
                  onClose();
                }}
                className={`w-full text-left p-3.5 rounded-2xl flex items-start gap-3 transition-colors cursor-pointer ${
                  isSelected
                    ? 'bg-[#0d2822] border-[1.5px] border-[#00ffa3]/80'
                    : 'bg-[#14202c]/70 hover:bg-[#182736] border border-slate-800/80'
                }`}
              >
                <div className="w-10 h-10 rounded-xl bg-[#1c2c3d] flex items-center justify-center text-[#38bdf8] shrink-0 mt-0.5">
                  <Icon className="w-5 h-5 stroke-[2.2]" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-bold text-white text-[14.5px]">
                      {preset.title}
                    </span>
                    <span className="text-[10px] bg-[#2d1e15] border border-[#5a3622] text-[#fba268] font-bold px-2 py-0.5 rounded-full shrink-0">
                      {preset.badge}
                    </span>
                  </div>
                  <p className="text-[12px] text-slate-300 mt-1 leading-snug">
                    {preset.description}
                  </p>
                </div>
                {isSelected && (
                  <Check className="w-5 h-5 text-[#00ffa3] shrink-0 self-center ml-1" />
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
