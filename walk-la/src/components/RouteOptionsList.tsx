import React from 'react';
import { Bus, Footprints } from 'lucide-react';
import { RouteOption } from '../types';

interface RouteOptionsListProps {
  routes: RouteOption[];
  selectedRouteId: string;
  onSelectRoute: (id: string) => void;
}

export const RouteOptionsList: React.FC<RouteOptionsListProps> = ({
  routes,
  selectedRouteId,
  onSelectRoute,
}) => {
  return (
    <div className="space-y-2.5 select-none" id="route-options-container">
      {/* Header */}
      <div className="flex items-center justify-between px-1">
        <span className="text-[11px] font-bold tracking-wider text-slate-400 uppercase">
          ROUTE OPTIONS
        </span>
        <span className="text-[12px] font-semibold text-[#00ffa3]">
          {routes.length} Available
        </span>
      </div>

      {/* List of cards */}
      <div className="space-y-2.5">
        {routes.map((route) => {
          const isSelected = route.id === selectedRouteId;
          const isBus = route.type === 'transit';

          return (
            <div
              key={route.id}
              onClick={() => onSelectRoute(route.id)}
              role="button"
              tabIndex={0}
              id={`route-card-${route.id}`}
              className={`w-full rounded-[22px] p-3.5 flex items-center justify-between gap-3 transition-all cursor-pointer text-left ${
                isSelected
                  ? 'border-[1.5px] border-[#00ffa3] bg-[#0c2420] shadow-[0_0_22px_rgba(0,255,163,0.14)] ring-1 ring-[#00ffa3]/30'
                  : 'border border-slate-800/90 bg-[#131d27]/70 hover:bg-[#162330]'
              }`}
            >
              {/* Left icon */}
              <div
                className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${
                  isBus
                    ? 'bg-[#103831] text-[#00ffa3]'
                    : 'bg-[#1a2736] text-slate-300'
                }`}
              >
                {isBus ? (
                  <Bus className="w-5 h-5 stroke-[2.2]" />
                ) : (
                  <Footprints className="w-5 h-5 stroke-[2.2]" />
                )}
              </div>

              {/* Middle Title & Details */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-[16.5px] font-bold text-white tracking-tight leading-tight">
                    {route.title}
                  </span>
                  {route.badge && (
                    <span
                      className={`text-[9.5px] font-extrabold uppercase px-2 py-0.5 rounded-md tracking-wider ${
                        route.badgeType === 'fastest'
                          ? 'bg-[#00ffa3] text-[#032e22]'
                          : 'bg-[#1c2938] text-slate-300 border border-slate-700/60'
                      }`}
                    >
                      {route.badge}
                    </span>
                  )}
                </div>
                <p className="text-[12px] text-slate-400 leading-snug mt-0.5 truncate">
                  {route.subtitle}
                </p>
              </div>

              {/* Right Side Timing */}
              <div className="text-right shrink-0 pl-2">
                <div
                  className={`text-[19px] font-extrabold tracking-tight leading-none ${
                    isSelected && isBus ? 'text-[#00ffa3]' : 'text-white'
                  }`}
                >
                  {route.durationMinutes} min
                </div>
                <div
                  className={`text-[11px] font-semibold mt-1 ${
                    isBus ? 'text-[#00ffa3]' : 'text-slate-400'
                  }`}
                >
                  {route.arrivalSubtext}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
