import React from 'react';
import { ArrowUpDown, MapPin, Circle } from 'lucide-react';
import { LocationPoint } from '../types';

interface RouteSearchCardProps {
  origin: LocationPoint;
  destination: LocationPoint;
  onSwap: () => void;
  onSelectOrigin: () => void;
  onSelectDestination: () => void;
}

export const RouteSearchCard: React.FC<RouteSearchCardProps> = ({
  origin,
  destination,
  onSwap,
  onSelectOrigin,
  onSelectDestination,
}) => {
  return (
    <div 
      className="relative bg-[#121c27] rounded-[24px] border border-slate-800/80 p-4 shadow-xl overflow-hidden"
      id="route-search-card"
    >
      <div className="flex items-stretch justify-between gap-3">
        {/* Left side: Points with vertical connector */}
        <div className="flex-1 flex flex-col justify-between space-y-4">
          
          {/* FROM Point */}
          <div 
            onClick={onSelectOrigin}
            role="button"
            tabIndex={0}
            id="from-location-selector"
            className="group flex items-start gap-3.5 cursor-pointer text-left focus:outline-none"
          >
            <div className="pt-0.5 shrink-0">
              <Circle className="w-5 h-5 text-[#00ffa3] stroke-[3]" />
            </div>
            <div className="flex-1 min-w-0">
              <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 leading-tight">
                FROM
              </span>
              <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                <span className="text-[15px] font-semibold text-white group-hover:text-[#00ffa3] transition-colors leading-snug truncate max-w-[220px]">
                  {origin.name}
                </span>
                {origin.stationCode && (
                  <span className="bg-[#0b3832] text-[#00ffa3] border border-[#13574d] text-[10.5px] font-bold px-2 py-0.5 rounded-md tracking-wide">
                    {origin.stationCode}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Subtle horizontal divider with vertical connector trace */}
          <div className="relative pl-2.5">
            <div className="absolute left-[9px] -top-3 bottom-0 w-[1.5px] bg-gradient-to-b from-[#00ffa3]/60 via-slate-700 to-[#38bdf8]/60" />
            <div className="h-[1px] bg-slate-800/80 w-full ml-5" />
          </div>

          {/* TO Point */}
          <div 
            onClick={onSelectDestination}
            role="button"
            tabIndex={0}
            id="to-location-selector"
            className="group flex items-start gap-3.5 cursor-pointer text-left focus:outline-none"
          >
            <div className="pt-0.5 shrink-0">
              <MapPin className="w-5 h-5 text-[#0ea5e9] fill-[#0ea5e9]/20 stroke-[2.4]" />
            </div>
            <div className="flex-1 min-w-0">
              <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 leading-tight">
                TO
              </span>
              <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                <span className="text-[15px] font-semibold text-white group-hover:text-[#38bdf8] transition-colors leading-snug truncate max-w-[220px]">
                  {destination.name}
                </span>
                {destination.gateOrExit && (
                  <span className="bg-[#142e40] text-[#38bdf8] border border-[#1f4864] text-[10.5px] font-bold px-2 py-0.5 rounded-md tracking-wide">
                    {destination.gateOrExit}
                  </span>
                )}
              </div>
            </div>
          </div>

        </div>

        {/* Right side: Swap button positioned neatly */}
        <div className="flex items-center justify-center pl-2 shrink-0 self-center">
          <button
            onClick={onSwap}
            type="button"
            id="btn-swap-locations"
            aria-label="Swap Origin and Destination"
            className="w-10 h-10 rounded-full bg-[#1c2937] hover:bg-[#26374a] active:scale-90 border border-slate-700/60 flex items-center justify-center text-slate-300 hover:text-white transition-all shadow-md cursor-pointer"
          >
            <ArrowUpDown className="w-4 h-4 stroke-[2.2]" />
          </button>
        </div>
      </div>
    </div>
  );
};
