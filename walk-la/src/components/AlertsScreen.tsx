import React, { useEffect, useState } from 'react';
import { CloudRain, AlertCircle } from 'lucide-react';
import { getWeatherForecast } from '../services/weather';

export const AlertsScreen: React.FC = () => {
  const [weather, setWeather] = useState<any>(null);
const [weatherLoading, setWeatherLoading] = useState(true);
const [weatherError, setWeatherError] = useState(false);

useEffect(() => {
  async function loadWeather() {
    try {
      setWeatherLoading(true);

      const data = await getWeatherForecast();

      console.log("Weather API response:", data);

      setWeather(data);
      setWeatherError(false);
    } catch (error) {
      console.error("Failed to load weather:", error);
      setWeatherError(true);
    } finally {
      setWeatherLoading(false);
    }
  }

  // Get weather immediately when the screen opens
  loadWeather();

  // Refresh weather every 5 minutes
  const interval = setInterval(() => {
    loadWeather();
  }, 5 * 60 * 1000);

  // Stop the timer when the screen is closed
  return () => clearInterval(interval);
}, []);
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
  {weatherLoading
    ? "Checking local weather..."
    : weatherError
      ? "Unable to retrieve local weather"
      : "Current weather near you"}
</h2>
          <p className="text-[12.5px] text-slate-300 mt-1 leading-relaxed">
  Live weather conditions and forecasts based on your location.
</p>
        </div>
      </div>
    {/* Live Weather Information */}
<div className="bg-[#121c27] rounded-[22px] border border-slate-800/80 p-4 space-y-4">

  <div className="flex items-center justify-between">
    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
      Live Weather
    </span>

    <span className="text-[11px] text-[#00ffa3]">
      NEA / Data.gov.sg
    </span>
  </div>

  {weatherLoading && (
    <div className="text-sm text-slate-400">
      Getting your local weather...
    </div>
  )}

  {weatherError && (
    <div className="flex items-center gap-2 text-sm text-[#fba268]">
      <AlertCircle className="w-4 h-4" />
      Unable to retrieve weather information.
    </div>
  )}

  {weather && !weatherLoading && !weatherError && (
    <div className="space-y-3">

      <div className="flex items-center gap-3">
        <div className="w-11 h-11 rounded-xl bg-[#113830] text-[#00ffa3] flex items-center justify-center">
          <CloudRain className="w-5 h-5" />
        </div>

        <div>
          <div className="text-[15px] font-bold text-white">
            Local Weather Forecast
          </div>

          <div className="text-[11px] text-slate-400">
            Updated from Data.gov.sg
          </div>
        </div>
      </div>

      {/* We'll populate the actual forecast here */}
      <div className="bg-[#15212e] rounded-xl p-3">
        <p className="text-[12px] text-slate-300">
          Weather data loaded successfully.
        </p>
      </div>

    </div>
  )}
</div>
      {/* Mini Radar Visualizer */}
      <div className="bg-[#121c27] rounded-[22px] border border-slate-800/80 p-4 space-y-2">
        <div className="flex items-center justify-between text-[11px] font-bold text-slate-400 uppercase">
          <span>Weather Conditions</span>
<span className="text-[#38bdf8]">Your Location</span>
        </div>

        <div className="relative h-32 rounded-xl overflow-hidden bg-slate-950 border border-slate-800 flex items-center justify-center">
          {/* Radar scan animation ring */}
          <div className="absolute inset-0 bg-[radial-gradient(#143b4f_1px,transparent_1px)] [background-size:16px_16px] opacity-40" />
          <div className="w-24 h-24 rounded-full border border-sky-500/30 animate-ping absolute" />
          <div className="w-16 h-16 rounded-full border border-[#00ffa3]/50 absolute" />
          <div className="w-2.5 h-2.5 rounded-full bg-[#00ffa3] shadow-[0_0_12px_#00ffa3] absolute" />
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
      </div>
    </div>
  );
};
