import React from 'react';
import { CloudRain, Umbrella, Wrench, Clock, MapPin, AlertCircle } from 'lucide-react';
import { MOCK_ALERTS } from '../data/mockData';

export const AlertsScreen: React.FC = () => {
  return (
    <div className="space-y-4 select-none pb-24" id="alerts-screen">
      {/* Top Banner */}
      <div className="bg-[#261a12] rounded-[22px] border border-[#52331f] p-4 shadow-xl flex items-start gap-3">
        <div className="w-9 h-9 rounded-xl bg-[#3d2314] text-[#fba268] flex items-center justify-center shrink-0 mt-0.5">
          <CloudRain className="w-5 h-5 stroke-[2.4]" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#fba268]">
              DOPPLER WEATHER RADAR
            </span>
            <span className="bg-[#3b2011] text-[#fba268] text-[9.5px] font-black px-1.5 py-0.5 rounded">
              NEA SYNC
            </span>
          </div>
          <h2 className="text-[16px] font-bold text-white mt-1 leading-snug">
            Rain cell reaching Tampines in 10 minutes
          </h2>
          <p className="text-[12.5px] text-slate-300 mt-1 leading-relaxed">
            Commuters advised to use the continuous covered linkways or take Feeder Bus 291 to avoid open crossings.
          </p>
        </div>
      </div>

      {/* Mini Radar Visualizer */}
      <div className="bg-[#121c27] rounded-[22px] border border-slate-800/80 p-4 space-y-2">
        <div className="flex items-center justify-between text-[11px] font-bold text-slate-400 uppercase">
          <span>Live Rain Precipitation Radar</span>
          <span className="text-[#38bdf8]">Tampines Sector</span>
        </div>

        <div className="relative h-32 rounded-xl overflow-hidden bg-slate-950 border border-slate-800 flex items-center justify-center">
          {/* Radar scan animation ring */}
          <div className="absolute inset-0 bg-[radial-gradient(#143b4f_1px,transparent_1px)] [background-size:16px_16px] opacity-40" />
          <div className="w-24 h-24 rounded-full border border-sky-500/30 animate-ping absolute" />
          <div className="w-16 h-16 rounded-full border border-[#00ffa3]/50 absolute" />
          <div className="w-2.5 h-2.5 rounded-full bg-[#00ffa3] shadow-[0_0_12px_#00ffa3] absolute" />
          
          <div className="absolute top-2 left-3 text-[11px] font-bold text-sky-400 bg-slate-900/80 px-2 py-0.5 rounded">
            Rain Cloud: 2.4 km away
          </div>
          <div className="absolute bottom-2 right-3 text-[11px] font-bold text-[#00ffa3] bg-slate-900/80 px-2 py-0.5 rounded">
            Exit B Covered Walkway
          </div>
        </div>
      </div>

      {/* Commute Advisories List */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between px-1">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
            Commute & Linkway Updates
          </span>
          <span className="text-[11px] text-slate-400">
            3 Active
          </span>
        </div>

        <div className="space-y-2.5">
          {MOCK_ALERTS.map((alert) => {
            const isHigh = alert.severity === 'high';
            const isUmbrella = alert.type === 'umbrella_sharing';

            return (
              <div
                key={alert.id}
                className="bg-[#121c27] rounded-2xl border border-slate-800/80 p-4 space-y-2"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    {isHigh ? (
                      <AlertCircle className="w-4 h-4 text-[#fba268]" />
                    ) : isUmbrella ? (
                      <Umbrella className="w-4 h-4 text-[#00ffa3]" />
                    ) : (
                      <Wrench className="w-4 h-4 text-[#38bdf8]" />
                    )}
                    <span className="font-bold text-white text-[14px]">
                      {alert.title}
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-400 shrink-0">
                    {alert.timeAgo}
                  </span>
                </div>

                <div className="flex items-center gap-1.5 text-[11.5px] text-slate-400">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  <span>{alert.location}</span>
                </div>

                <p className="text-[12.5px] text-slate-300 leading-relaxed pt-1 border-t border-slate-800/60">
                  {alert.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
