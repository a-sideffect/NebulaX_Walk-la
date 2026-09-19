import React, { useEffect, useState } from 'react';
import { Bus, Train, ShieldCheck, Umbrella, Users, ArrowRight } from 'lucide-react';
import { getBusArrivals } from '../services/lta';

const getMinutesUntilArrival = (arrivalTime: string) => {
  if (!arrivalTime) return null;

  const arrival = new Date(arrivalTime).getTime();
  const now = Date.now();

  const minutes = Math.ceil((arrival - now) / 60000);

  return Math.max(0, minutes);
};

export const TransitScreen: React.FC = () => {
  const [busArrivals, setBusArrivals] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
  const fetchBusArrivals = async () => {
    try {
      setIsLoading(true);

      const data = await getBusArrivals("75009");

      setBusArrivals(data.Services || []);
    } catch (error) {
      console.error("Failed to fetch bus arrivals:", error);
      setBusArrivals([]);
    } finally {
      setIsLoading(false);
    }
  };

  fetchBusArrivals();
}, []);

  return (
    <div className="space-y-4 select-none pb-24" id="transit-screen">
      {/* Header Info Banner */}
      <div className="bg-[#121c27] rounded-[22px] border border-slate-800/80 p-4 shadow-xl">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-[#09352e] text-[#00ffa3] flex items-center justify-center">
            <Train className="w-4 h-4 stroke-[2.4]" />
          </div>
          <div>
            <h2 className="text-[17px] font-bold text-white leading-tight">
              Tampines Interchange & MRT
            </h2>
            <p className="text-[11.5px] text-slate-400">
              East-West Line (EW2) • Downtown Line (DT32)
            </p>
          </div>
        </div>

        {/* Shelter coverage metric */}
        <div className="mt-3.5 pt-3 border-t border-slate-800/80 grid grid-cols-2 gap-2 text-center">
          <div className="bg-[#0c221e] border border-[#00ffa3]/30 rounded-xl p-2.5">
            <span className="block text-[10px] uppercase font-bold text-[#00ffa3]">
              Canopy Coverage
            </span>
            <span className="text-[18px] font-black text-white">100% Dry</span>
            <span className="block text-[10.5px] text-slate-400">Concourse to Berths</span>
          </div>
          <div className="bg-[#152331] border border-slate-700/60 rounded-xl p-2.5">
            <span className="block text-[10px] uppercase font-bold text-slate-400">
              Available Exits
            </span>
            <span className="text-[18px] font-black text-white">4 Sheltered</span>
            <span className="block text-[10.5px] text-slate-400">Exits A, B, C, D</span>
          </div>
        </div>
      </div>

      {/* MRT Station Exit Shelter Directory */}
      <div className="bg-[#121c27] rounded-[22px] border border-slate-800/80 p-4 space-y-3">
        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
          MRT Sheltered Exits
        </span>

        <div className="space-y-2">
          <div className="bg-[#15212e]/70 border border-slate-800 p-3 rounded-xl flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-white text-[13.5px]">Exit B</span>
                <span className="bg-[#0c312a] text-[#00ffa3] text-[10px] font-bold px-2 py-0.5 rounded">
                  Covered Linkway
                </span>
              </div>
              <p className="text-[11.5px] text-slate-400 mt-0.5">
                Feeder Bus Interchange, Our Tampines Hub, Blk 101-118
              </p>
            </div>
            <ShieldCheck className="w-5 h-5 text-[#00ffa3] shrink-0" />
          </div>

          <div className="bg-[#15212e]/70 border border-slate-800 p-3 rounded-xl flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-white text-[13.5px]">Exit A</span>
                <span className="bg-[#152e3d] text-[#38bdf8] text-[10px] font-bold px-2 py-0.5 rounded">
                  Underground Link
                </span>
              </div>
              <p className="text-[11.5px] text-slate-400 mt-0.5">
                Tampines 1 Shopping Mall Basement 1
              </p>
            </div>
            <ShieldCheck className="w-5 h-5 text-[#00ffa3] shrink-0" />
          </div>
        </div>
      </div>

      {/* Live Feeder Bus Departures with Shelter Quality */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between px-1">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
            Sheltered Feeder Bus Berths
          </span>
          <span className="text-[11px] font-semibold text-[#00ffa3]">
            Live NEA & LTA Sync
          </span>
        </div>

        <div className="space-y-2">
          {busArrivals.map((bus) => (
            <div
              key={bus.ServiceNo}
              className="bg-[#121c27] rounded-2xl border border-slate-800/80 p-3.5 flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl bg-[#113830] text-[#00ffa3] flex items-center justify-center font-black text-[18px]">
                  {bus.ServiceNo}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white text-[14px]">
                      {bus.shelteredBerth}
                    </span>
                    <span className="text-[10px] bg-[#0c2f27] text-[#00ffa3] font-bold px-1.5 py-0.5 rounded flex items-center gap-1">
                      <Umbrella className="w-3 h-3" />
                      100% Dry
                    </span>
                  </div>
                  <p className="text-[11.5px] text-slate-400 mt-0.5 truncate max-w-[180px]">
                    To {bus.destination}
                  </p>
                </div>
              </div>

              <div className="text-right">
                <div className="text-[18px] font-extrabold text-[#00ffa3] leading-tight">
                  {getMinutesUntilArrival(bus.NextBus?.EstimatedArrival)} min
                </div>
                <div className="text-[11px] text-slate-400 mt-0.5">
                  Next: {bus.subsequentArrivalMins}m
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
