import React, { useState, useEffect, useRef } from 'react';
import { Camera, Compass, Eye, Shield, RefreshCw, Zap } from 'lucide-react';

export const ARGuideScreen: React.FC = () => {
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [heading, setHeading] = useState(342);
  const [distanceToRefuge, setDistanceToRefuge] = useState(145);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  const startCamera = async () => {
    try {
      setCameraError(null);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' },
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
        setCameraActive(true);
      }
    } catch (err) {
      console.log('Camera access unavailable or declined, using simulated linkway feed', err);
      setCameraError('Camera access declined or unavailable. Using simulated Singapore covered linkway viewfinder.');
      setCameraActive(false);
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach((t) => t.stop());
      videoRef.current.srcObject = null;
    }
    setCameraActive(false);
  };

  useEffect(() => {
    const interval = setInterval(() => {
      setHeading((prev) => ((prev + 1) % 360));
      setDistanceToRefuge((prev) => (prev > 5 ? prev - 1 : 180));
    }, 2000);
    return () => {
      clearInterval(interval);
      stopCamera();
    };
  }, []);

  return (
    <div className="space-y-4 select-none pb-24" id="ar-guide-screen">
      {/* Top Title Banner */}
      <div className="bg-[#121c27] rounded-[22px] border border-slate-800/80 p-4 shadow-xl flex items-center justify-between">
        <div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#00ffa3] animate-pulse" />
            <span className="text-[10.5px] font-extrabold uppercase tracking-widest text-[#00ffa3]">
              AR SHELTERED WALKWAY HUD
            </span>
          </div>
          <h2 className="text-[17px] font-bold text-white mt-0.5">
            Tampines East Linkway Corridor
          </h2>
        </div>

        <button
          type="button"
          onClick={cameraActive ? stopCamera : startCamera}
          className="px-3 py-1.5 rounded-xl bg-[#0f2c25] hover:bg-[#143a31] border border-[#1a5b4e] text-[#00ffa3] text-[11.5px] font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
        >
          <Camera className="w-3.5 h-3.5" />
          <span>{cameraActive ? 'Sim View' : 'Live Cam'}</span>
        </button>
      </div>

      {/* AR Viewport Window */}
      <div className="relative rounded-[24px] overflow-hidden border-[1.5px] border-[#00ffa3]/40 bg-slate-950 aspect-[4/5] shadow-[0_0_30px_rgba(0,255,163,0.12)]">
        
        {/* Background: Either real camera video or simulated realistic Singapore covered walkway */}
        {cameraActive ? (
          <video
            ref={videoRef}
            playsInline
            muted
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="relative w-full h-full bg-slate-900 overflow-hidden">
            {/* High quality covered linkway representation */}
            <img
              src="https://images.unsplash.com/photo-1517649763962-0c623266ddc0?w=800&auto=format&fit=crop&q=80"
              alt="Singapore Sheltered Linkway Corridor"
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover brightness-[0.65] contrast-[1.1]"
            />
            {/* Simulated perspective canopy roof line */}
            <div className="absolute inset-0 bg-gradient-to-b from-[#00ffa3]/10 via-transparent to-[#0b1016]/80 pointer-events-none" />
          </div>
        )}

        {/* AR Overlays (HUD) */}
        <div className="absolute inset-0 pointer-events-none p-4 flex flex-col justify-between">
          
          {/* Top HUD Indicators */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 bg-[#09151e]/85 backdrop-blur-md px-3 py-1.5 rounded-full border border-slate-700/60 text-slate-200 text-[11.5px] font-medium shadow-lg">
              <Compass className="w-3.5 h-3.5 text-[#00ffa3]" />
              <span>{heading}° NNW</span>
            </div>

            <div className="flex items-center gap-1.5 bg-[#082a22]/90 backdrop-blur-md px-3 py-1.5 rounded-full border border-[#00ffa3]/50 text-[#00ffa3] text-[11px] font-bold shadow-lg">
              <Shield className="w-3.5 h-3.5" />
              <span>CANOPY LOCKED (100%)</span>
            </div>
          </div>

          {/* Center AR Crosshair & Target Overlay */}
          <div className="my-auto flex flex-col items-center justify-center text-center">
            {/* Floating AR Waypoint Tag */}
            <div className="animate-bounce bg-[#00ffa3] text-[#022f20] px-3.5 py-1.5 rounded-full font-black text-[12px] shadow-[0_4px_15px_rgba(0,255,163,0.5)] flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 fill-[#022f20]" />
              <span>Our Tampines Hub Concourse</span>
            </div>

            {/* Target Distance Reticle */}
            <div className="mt-3 w-28 h-28 rounded-full border-2 border-dashed border-[#00ffa3]/80 flex items-center justify-center relative">
              <div className="w-20 h-20 rounded-full border border-[#00ffa3]/40 flex items-center justify-center">
                <div className="w-2.5 h-2.5 rounded-full bg-[#00ffa3] shadow-[0_0_10px_#00ffa3]" />
              </div>
              <div className="absolute -bottom-6 text-[11px] font-bold text-white bg-slate-900/80 px-2 py-0.5 rounded-md border border-slate-700">
                {distanceToRefuge}m to Gate 3
              </div>
            </div>

            {/* Ground chevrons pointing straight forward */}
            <div className="flex flex-col items-center space-y-1 mt-6 opacity-80">
              <div className="w-0 h-0 border-l-[14px] border-l-transparent border-r-[14px] border-r-transparent border-b-[14px] border-b-[#00ffa3] animate-pulse" />
              <div className="w-0 h-0 border-l-[10px] border-l-transparent border-r-[10px] border-r-transparent border-b-[10px] border-b-[#00ffa3]/60" />
            </div>
          </div>

          {/* Bottom HUD Bar */}
          <div className="bg-[#0c1824]/90 backdrop-blur-md rounded-2xl p-3 border border-slate-700/80 flex items-center justify-between text-[12px]">
            <div className="flex items-center gap-2">
              <Eye className="w-4 h-4 text-[#38bdf8]" />
              <span className="text-slate-300 font-medium">Tracking Continuous Overhead Roof</span>
            </div>
            <span className="text-[#00ffa3] font-bold">Safe from Rain</span>
          </div>

        </div>
      </div>

      {cameraError && (
        <div className="text-[12px] text-slate-400 bg-slate-900/80 p-3 rounded-xl border border-slate-800">
          {cameraError}
        </div>
      )}

      {/* AR Walkway Tips */}
      <div className="bg-[#121c27] rounded-2xl border border-slate-800 p-4 space-y-2">
        <h3 className="text-[13px] font-bold text-white uppercase tracking-wider">
          How AR Canopy Navigation Works
        </h3>
        <p className="text-[12.5px] text-slate-300 leading-relaxed">
          Hold your camera upright while walking. The HUD automatically tracks Singapore Town Council covered linkways and HDB void decks, keeping you 100% dry without opening an umbrella.
        </p>
      </div>
    </div>
  );
};
