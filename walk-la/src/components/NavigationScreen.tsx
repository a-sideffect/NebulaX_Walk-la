import { getWalkingRoute } from '../services/onemap';
import React, { useState, useEffect } from 'react';
import { 
  X, Volume2, VolumeX, ShieldCheck, 
  CloudRain, ChevronRight, CheckCircle2, 
  Footprints, Bus, AlertTriangle 
} from 'lucide-react';
import { RouteOption, LocationPoint } from '../types';
import { LiveARPanel } from './LiveARPanel';

interface NavigationScreenProps {
  route: RouteOption;
  origin: LocationPoint;
  destination: LocationPoint;
  onClose: () => void;
}

export const NavigationScreen: React.FC<NavigationScreenProps> = ({
  route,
  origin,
  destination,
  onClose,
}) => {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isVoiceMuted, setIsVoiceMuted] = useState(false);
  const [rainCountdownSeconds, setRainCountdownSeconds] = useState(580); // ~9.6 mins
  const [liveViewActive, setLiveViewActive] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setRainCountdownSeconds((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatCountdown = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}m ${s < 10 ? '0' : ''}${s}s`;
  };

  const currentStep = route.steps[currentStepIndex] || route.steps[0];
  const isLastStep = currentStepIndex === route.steps.length - 1;

  return (
    <div 
      className="fixed inset-0 z-50 bg-[#0b1016] flex flex-col max-w-md mx-auto overflow-hidden animate-in fade-in duration-200"
      id="live-navigation-screen"
    >
      {/* Top Header Bar */}
      <div className="bg-[#101924] border-b border-slate-800/80 px-4 py-3.5 flex items-center justify-between shadow-md">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onClose}
            aria-label="Exit Navigation"
            className="w-9 h-9 rounded-full bg-slate-800/80 hover:bg-slate-700 flex items-center justify-center text-slate-300 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#00ffa3] animate-ping" />
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#00ffa3]">
                LIVE CANOPY NAVIGATION
              </span>
            </div>
            <h2 className="text-[15px] font-bold text-white leading-tight truncate max-w-[200px]">
              {destination.name}
            </h2>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIsVoiceMuted(!isVoiceMuted)}
            aria-label="Toggle Voice Guidance"
            className={`w-9 h-9 rounded-full border flex items-center justify-center transition-colors ${
              isVoiceMuted
                ? 'bg-slate-800 border-slate-700 text-slate-400'
                : 'bg-[#0d2a23] border-[#165a4c] text-[#00ffa3]'
            }`}
          >
            {isVoiceMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Main Interactive Stage */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        
        {/* Rain Countdown Alert Card */}
        <div className="bg-[#241a13] border border-[#50311c] rounded-2xl p-3.5 flex items-center justify-between gap-3 shadow-md">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#3d2414] text-[#fba268] flex items-center justify-center shrink-0">
              <CloudRain className="w-5 h-5 stroke-[2.4]" />
            </div>
            <div>
              <div className="text-[11px] font-bold uppercase tracking-wider text-[#fba268]">
                Tampines Weather Radar
              </div>
              <div className="text-[13px] text-slate-200 font-medium">
                Downpour expected in <span className="font-extrabold text-white">{formatCountdown(rainCountdownSeconds)}</span>
              </div>
            </div>
          </div>
          <div className="bg-[#351c0d] px-2.5 py-1 rounded-lg border border-[#6b3815] text-[#fba268] text-[11px] font-bold whitespace-nowrap">
            {route.coveredPercentage}% Sheltered
          </div>
        </div>

        {/* Live Guidance View */}
        <LiveARPanel
          target={currentStep.coordinates ?? null}
          targetLabel={currentStep.instruction}
          active={liveViewActive}
          onToggle={() => setLiveViewActive((v) => !v)}
        />

        {/* Current Active Step Instruction Card */}
        <div className="bg-[#121d28] rounded-[22px] border-[1.5px] border-[#00ffa3]/80 p-5 shadow-[0_0_25px_rgba(0,255,163,0.12)]">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] font-extrabold tracking-wider uppercase text-[#00ffa3]">
              STEP {currentStepIndex + 1} OF {route.steps.length}
            </span>
            <div className="flex items-center gap-1.5 bg-[#0a2f27] px-2.5 py-1 rounded-full border border-[#12584a] text-[#00ffa3] text-[11px] font-semibold">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>{currentStep.shelterType || 'Covered Linkway'}</span>
            </div>
          </div>

          <div className="flex items-start gap-3.5 my-2">
            <div className="w-12 h-12 rounded-2xl bg-[#0e3129] border border-[#164e42] flex items-center justify-center text-[#00ffa3] shrink-0">
              {currentStep.iconType === 'bus' ? (
                <Bus className="w-6 h-6 stroke-[2.2]" />
              ) : (
                <Footprints className="w-6 h-6 stroke-[2.2]" />
              )}
            </div>
            <div>
              <h3 className="text-[19px] font-bold text-white leading-tight">
                {currentStep.instruction}
              </h3>
              <p className="text-[13.5px] text-slate-300 mt-1.5 leading-relaxed">
                {currentStep.detail}
              </p>
            </div>
          </div>

          <div className="mt-4 pt-3.5 border-t border-slate-800/80 flex items-center justify-between text-[12px] text-slate-400">
            <span>Distance: <strong className="text-white">{currentStep.distanceMeters}m</strong></span>
            <span>Covered: <strong className="text-[#00ffa3]">{currentStep.covered ? '100% Dry' : 'Open Crossing'}</strong></span>
          </div>
        </div>

        {/* Route Overview Path Visualization */}
        <div className="bg-[#121c27] rounded-[22px] border border-slate-800/80 p-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Canopy Route Progress
            </span>
            <span className="text-[12px] font-medium text-slate-300">
              {route.durationMinutes} mins total
            </span>
          </div>

          {/* Visual Step Nodes */}
          <div className="space-y-2 pt-1">
            {route.steps.map((step, idx) => {
              const isDone = idx < currentStepIndex;
              const isCurrent = idx === currentStepIndex;

              return (
                <button
                  key={step.id}
                  type="button"
                  onClick={() => setCurrentStepIndex(idx)}
                  className={`w-full text-left p-3 rounded-xl flex items-center gap-3 transition-colors cursor-pointer ${
                    isCurrent
                      ? 'bg-[#0e2621] border border-[#00ffa3]/50'
                      : isDone
                      ? 'bg-slate-900/50 opacity-60'
                      : 'bg-[#152230]/60 hover:bg-[#182737]'
                  }`}
                >
                  <div className="shrink-0">
                    {isDone ? (
                      <CheckCircle2 className="w-5 h-5 text-[#00ffa3]" />
                    ) : isCurrent ? (
                      <div className="w-5 h-5 rounded-full border-2 border-[#00ffa3] flex items-center justify-center">
                        <div className="w-2 h-2 rounded-full bg-[#00ffa3]" />
                      </div>
                    ) : (
                      <div className="w-5 h-5 rounded-full border-2 border-slate-600 text-[10px] font-bold flex items-center justify-center text-slate-400">
                        {idx + 1}
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[13px] font-semibold text-white truncate">
                      {step.instruction}
                    </div>
                    <div className="text-[11px] text-slate-400 flex items-center gap-2">
                      <span>{step.distanceMeters}m</span>
                      <span>•</span>
                      <span className={step.covered ? 'text-[#00ffa3]' : 'text-[#f97316]'}>
                        {step.shelterType}
                      </span>
                    </div>
                  </div>
                  {isCurrent && (
                    <span className="text-[10px] font-black uppercase bg-[#00ffa3] text-[#023122] px-2 py-0.5 rounded">
                      Active
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Rain Advisory Safety Note */}
        {!route.steps[currentStepIndex]?.covered && (
          <div className="bg-[#2e1d13] border border-[#59341c] rounded-xl p-3 flex items-start gap-2.5 text-[#fba268]">
            <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
            <div className="text-[12px] leading-snug">
              <strong>Unsheltered Segment:</strong> This 30m stretch has no overhead canopy roof. Open umbrella or proceed quickly before rain cell arrives in ~9m.
            </div>
          </div>
        )}

      </div>

      {/* Bottom Step Control Navigation */}
      <div className="bg-[#0e1620] border-t border-slate-800 px-4 py-3.5 flex items-center gap-3">
        <button
          type="button"
          onClick={() => {
            if (isLastStep) {
              onClose();
            } else {
              setCurrentStepIndex((prev) => Math.min(prev + 1, route.steps.length - 1));
            }
          }}
          className="flex-1 py-3.5 rounded-2xl bg-[#00ffa3] hover:bg-[#00e592] text-[#023122] font-bold text-[15.5px] flex items-center justify-center gap-2 shadow-[0_4px_20px_rgba(0,255,163,0.3)] cursor-pointer"
        >
          <span>{isLastStep ? 'Arrived at Destination' : 'Next Step'}</span>
          <ChevronRight className="w-5 h-5 stroke-[2.6]" />
        </button>
      </div>
    </div>
  );
};
