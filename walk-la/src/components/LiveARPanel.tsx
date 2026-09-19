import React from 'react';
import { Camera, Compass, ShieldAlert, Navigation2 } from 'lucide-react';
import { useLiveGuidance, GuidanceTarget } from '../hooks/useLiveGuidance';

interface LiveARPanelProps {
  target: GuidanceTarget | null;
  targetLabel: string;
  active: boolean;
  onToggle: () => void;
}

export const LiveARPanel: React.FC<LiveARPanelProps> = ({
  target,
  targetLabel,
  active,
  onToggle,
}) => {
  const {
    videoRef,
    permissionState,
    heading,
    relativeBearing,
    distanceMeters,
    offRoute,
    accuracyDegraded,
    start,
    stop,
  } = useLiveGuidance(target);

  const handleToggle = () => {
    if (active) {
      stop();
    } else {
      start();
    }
    onToggle();
  };

  return (
    <div
      className="bg-[#121c27] rounded-[22px] border border-slate-800/80 p-3.5 space-y-3"
      id="live-ar-panel"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span
            className={`w-2 h-2 rounded-full ${
              active ? 'bg-[#00ffa3] animate-pulse' : 'bg-slate-600'
            }`}
          />
          <span className="text-[11px] font-extrabold uppercase tracking-widest text-[#00ffa3]">
            LIVE GUIDANCE VIEW
          </span>
        </div>
        <button
          type="button"
          onClick={handleToggle}
          className="px-3 py-1.5 rounded-xl bg-[#0f2c25] hover:bg-[#143a31] border border-[#1a5b4e] text-[#00ffa3] text-[11.5px] font-bold flex items-center gap-1.5 cursor-pointer"
        >
          <Camera className="w-3.5 h-3.5" />
          <span>{active ? 'Stop' : 'Start Live Cam'}</span>
        </button>
      </div>

      {active && (
        <div
          className={`relative rounded-2xl overflow-hidden border-[1.5px] bg-slate-950 aspect-[4/3] transition-colors ${
            offRoute
              ? 'border-[#f97316] shadow-[0_0_25px_rgba(249,115,22,0.25)]'
              : 'border-[#00ffa3]/40'
          }`}
        >
          <video ref={videoRef} playsInline muted className="w-full h-full object-cover" />

          <div className="absolute inset-0 pointer-events-none p-3 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 bg-[#09151e]/85 backdrop-blur-md px-2.5 py-1 rounded-full border border-slate-700/60 text-slate-200 text-[11px] font-medium">
                <Compass className="w-3.5 h-3.5 text-[#00ffa3]" />
                <span>{heading != null ? `${Math.round(heading)}°` : '—'}</span>
              </div>
              {accuracyDegraded && (
                <div className="flex items-center gap-1.5 bg-[#2e1d13]/90 backdrop-blur-md px-2.5 py-1 rounded-full border border-[#59341c] text-[#fba268] text-[10.5px] font-bold">
                  <ShieldAlert className="w-3.5 h-3.5" />
                  <span>GPS weak</span>
                </div>
              )}
            </div>

            <div className="my-auto flex flex-col items-center justify-center">
              {relativeBearing != null ? (
                <Navigation2
                  className="w-16 h-16 text-[#00ffa3] drop-shadow-[0_0_10px_rgba(0,255,163,0.6)] transition-transform duration-300"
                  style={{ transform: `rotate(${relativeBearing}deg)` }}
                />
              ) : (
                <span className="text-[12px] text-slate-400 bg-slate-900/80 px-3 py-1.5 rounded-full">
                  Acquiring signal…
                </span>
              )}
              {distanceMeters != null && (
                <div className="mt-2 text-[12px] font-bold text-white bg-slate-900/80 px-2.5 py-1 rounded-md border border-slate-700">
                  {Math.round(distanceMeters)}m to {targetLabel}
                </div>
              )}
            </div>

            {offRoute && (
              <div className="bg-[#2e1d13]/90 backdrop-blur-md rounded-xl p-2.5 border border-[#59341c] text-[#fba268] text-[11.5px] font-bold text-center">
                Off route — follow the arrow back
              </div>
            )}
          </div>
        </div>
      )}

      {active && permissionState === 'denied' && (
        <p className="text-[12px] text-slate-400">
          Camera, motion, or location permission was denied — showing step list only.
        </p>
      )}

      {active && !target && (
        <p className="text-[12px] text-slate-400">
          This step has no target coordinates yet — add them to unlock the live arrow.
        </p>
      )}
    </div>
  );
};
