import React from 'react';
import { Cloud } from 'lucide-react';
import { AdvisoryInfo } from '../types';

interface LiveAdvisoryCardProps {
  advisory: AdvisoryInfo;
  selectedRouteId: string;
  onSelectRoute: (routeId: string) => void;
}

export const LiveAdvisoryCard: React.FC<LiveAdvisoryCardProps> = ({
  advisory,
  selectedRouteId,
  onSelectRoute,
}) => {
  const isTransitSelected = selectedRouteId === 'route-feeder-291';

  return (
    <div 
      className="bg-[#121c27] rounded-[24px] border border-slate-800/80 p-4.5 shadow-xl relative overflow-hidden"
      id="live-commute-advisory-card"
    >
      {/* Header Row */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Cloud className="w-4 h-4 text-[#38bdf8] stroke-[2.4]" />
          <span className="text-[11px] font-extrabold tracking-widest text-[#38bdf8] uppercase">
            LIVE COMMUTE ADVISORY
          </span>
        </div>
        <span className="bg-[#342419] border border-[#5a3922] text-[#fba268] text-[11px] font-bold px-2.5 py-0.5 rounded-full tracking-tight">
          Rain imminent
        </span>
      </div>

      {/* Recommended Title */}
      <h2 className="text-[22px] font-bold text-white tracking-tight leading-snug mt-2.5">
        {advisory.recommendationTitle}
      </h2>

      {/* Description */}
      <p className="text-[13.5px] text-slate-300 leading-relaxed mt-1.5 font-normal">
        {advisory.description}
      </p>

      {/* Comparison sub-cards */}
      <div className="grid grid-cols-2 gap-2.5 mt-3.5">
        
        {/* Left Card: Transit */}
        <button
          type="button"
          onClick={() => onSelectRoute('route-feeder-291')}
          id="advisory-card-transit"
          className={`text-left p-3 rounded-xl transition-all cursor-pointer ${
            isTransitSelected
              ? 'bg-[#0d2622] border-[1.5px] border-[#00ffa3]/60 shadow-[0_0_15px_rgba(0,255,163,0.1)]'
              : 'bg-[#15212e]/70 border border-slate-800 hover:bg-[#1a2837]'
          }`}
        >
          <div className="flex items-center justify-between gap-1 mb-1">
            <span className="text-[10px] font-bold text-[#00ffa3] tracking-wider uppercase">
              TRANSIT
            </span>
            <span className="bg-[#00ffa3]/20 text-[#00ffa3] font-bold text-[9.5px] px-1.5 py-0.5 rounded tracking-wide">
              100% DRY
            </span>
          </div>
          <div className="flex items-baseline mt-0.5">
            <span className="text-[23px] font-black text-white leading-none">
              {advisory.transitSummary.totalMins}
            </span>
            <span className="text-[12px] text-slate-300 ml-1.5 font-medium">
              mins total
            </span>
          </div>
          <p className="text-[11.5px] text-slate-400 font-medium mt-1 truncate">
            {advisory.transitSummary.busNotice}
          </p>
        </button>

        {/* Right Card: Sheltered Walk */}
        <button
          type="button"
          onClick={() => onSelectRoute('route-canopy-walk')}
          id="advisory-card-walk"
          className={`text-left p-3 rounded-xl transition-all cursor-pointer ${
            !isTransitSelected
              ? 'bg-[#0d2622] border-[1.5px] border-[#00ffa3]/60 shadow-[0_0_15px_rgba(0,255,163,0.1)]'
              : 'bg-[#15212e]/70 border border-slate-800 hover:bg-[#1a2837]'
          }`}
        >
          <div className="flex items-center justify-between gap-1 mb-1">
            <span className="text-[10px] font-bold text-slate-400 tracking-wider uppercase">
              SHELTERED WALK
            </span>
            <span className="bg-[#1f2e3d] text-slate-300 font-semibold text-[9.5px] px-1.5 py-0.5 rounded">
              {advisory.walkSummary.coveredPercent}% COVERED
            </span>
          </div>
          <div className="flex items-baseline mt-0.5">
            <span className="text-[23px] font-black text-white leading-none">
              {advisory.walkSummary.totalMins}
            </span>
            <span className="text-[12px] text-slate-300 ml-1.5 font-medium">
              mins walk
            </span>
          </div>
          <p className="text-[11.5px] text-[#f97316] font-semibold mt-1 truncate">
            {advisory.walkSummary.openCrossingMeters}m open crossing
          </p>
        </button>

      </div>
    </div>
  );
};
