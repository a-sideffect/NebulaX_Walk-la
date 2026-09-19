import { useState, useEffect } from 'react';
import { TabType, LocationPoint, RouteOption, WeatherStatus, AdvisoryInfo } from './types';
import { 
  DEFAULT_ORIGIN, 
  DEFAULT_DESTINATION, 
  DEFAULT_ADVISORY, 
  DEFAULT_ROUTES 
} from './data/mockData';
import { fetchRouteOptionsForTrip, OneMapClientError } from './services/onemap';
import { TopHeader } from './components/TopHeader';
import { RouteSearchCard } from './components/RouteSearchCard';
import { LiveAdvisoryCard } from './components/LiveAdvisoryCard';
import { RouteOptionsList } from './components/RouteOptionsList';
import { StartNavButton } from './components/StartNavButton';
import { BottomNavBar } from './components/BottomNavBar';
import { NavigationScreen } from './components/NavigationScreen';
import { ARGuideScreen } from './components/ARGuideScreen';
import { TransitScreen } from './components/TransitScreen';
import { AlertsScreen } from './components/AlertsScreen';
import { LocationPickerModal } from './components/LocationPickerModal';
import { WeatherPickerModal } from './components/WeatherPickerModal';
import { ProfileModal } from './components/ProfileModal';

export default function App() {
  const [currentTab, setCurrentTab] = useState<TabType>('plan');
  const [origin, setOrigin] = useState<LocationPoint>(DEFAULT_ORIGIN);
  const [destination, setDestination] = useState<LocationPoint>(DEFAULT_DESTINATION);
  const [selectedRouteId, setSelectedRouteId] = useState<string>('route-feeder-291');
  const [isNavigating, setIsNavigating] = useState(false);

  // Weather state (defaults to Rain in 10m • 29°C as shown in the screenshot)
  const [weather, setWeather] = useState<WeatherStatus>({
    condition: 'rain_soon',
    temperatureC: 29,
    rainArrivalMins: 10,
    rainfallIntensityMm: 14.5,
    radarCellDistanceKm: 2.4,
    advisoryText: 'Rain cell arrives in Tampines in 10 minutes. Boarding shelter is only 35m from your exit.',
  });

  const [advisory, setAdvisory] = useState<AdvisoryInfo>(DEFAULT_ADVISORY);
  const [routes, setRoutes] = useState<RouteOption[]>(DEFAULT_ROUTES);
  const [routesLoading, setRoutesLoading] = useState(false);
  const [routesError, setRoutesError] = useState<string | null>(null);

  // Fetch real routes from OneMap whenever origin/destination changes.
  // Falls back to the bundled mock routes if the backend/OneMap call fails,
  // so the demo never shows a dead end even if the proxy server isn't running.
  useEffect(() => {
    let cancelled = false;
    setRoutesLoading(true);
    setRoutesError(null);

    fetchRouteOptionsForTrip(origin, destination)
      .then((fetched) => {
        if (cancelled) return;
        setRoutes(fetched);
        setSelectedRouteId(fetched[0].id);
      })
      .catch((err) => {
        if (cancelled) return;
        const message =
          err instanceof OneMapClientError
            ? err.message
            : 'Could not reach the route server -- showing sample routes instead.';
        setRoutesError(message);
        setRoutes(DEFAULT_ROUTES);
        setSelectedRouteId(DEFAULT_ROUTES[0].id);
      })
      .finally(() => {
        if (!cancelled) setRoutesLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [origin, destination]);

  // Modals state
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);
  const [locationModalTarget, setLocationModalTarget] = useState<'origin' | 'destination'>('origin');
  const [isWeatherModalOpen, setIsWeatherModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  // Handle swapping origin and destination
  const handleSwap = () => {
    const temp = origin;
    setOrigin(destination);
    setDestination(temp);
  };

  // Handle selecting a location
  const handleSelectLocation = (loc: LocationPoint) => {
    if (locationModalTarget === 'origin') {
      setOrigin(loc);
    } else {
      setDestination(loc);
    }
  };

  // Handle updating simulated weather
  const handleSelectWeather = (newWeather: WeatherStatus) => {
    setWeather(newWeather);
    
    // Adapt advisory according to weather
    // Select by route type rather than a fixed mock ID -- IDs change once
    // real OneMap routes replace the bundled mock set.
    const transitRoute = routes.find((r) => r.type === 'transit');
    const walkRoute = routes.find((r) => r.type === 'walk');

    if (newWeather.condition === 'heavy_rain') {
      setAdvisory({
        recommendationTitle: 'Transit strictly advised',
        description: 'Heavy thunderstorm active. Open crossings on the walking route may have water pooling.',
        transitSummary: { totalMins: 5, busNotice: 'Check live arrivals', is100Dry: true },
        walkSummary: { totalMins: 14, openCrossingMeters: 30, coveredPercent: 90 },
      });
      setSelectedRouteId((transitRoute ?? routes[0])?.id);
    } else if (newWeather.condition === 'clear') {
      setAdvisory({
        recommendationTitle: 'Walking route recommended',
        description: 'Weather is clear. Enjoy a comfortable walk to your destination.',
        transitSummary: { totalMins: 5, busNotice: 'Check live arrivals', is100Dry: true },
        walkSummary: { totalMins: 12, openCrossingMeters: 30, coveredPercent: 95 },
      });
      setSelectedRouteId((walkRoute ?? routes[0])?.id);
    } else {
      setAdvisory(DEFAULT_ADVISORY);
      setSelectedRouteId((transitRoute ?? routes[0])?.id);
    }
  };

  const activeRoute = routes.find((r) => r.id === selectedRouteId) || routes[0];

  return (
    <div className="min-h-screen bg-[#070b10] flex justify-center selection:bg-[#00ffa3]/20">
      {/* Container simulating high-fidelity mobile app layout */}
      <div className="w-full max-w-md min-h-screen bg-[#0b1016] text-slate-100 flex flex-col shadow-2xl relative">
        
        {/* Persistent Top Header */}
        <TopHeader
          weather={weather}
          onOpenWeatherModal={() => setIsWeatherModalOpen(true)}
          onOpenProfileModal={() => setIsProfileModalOpen(true)}
        />

        {/* Tab View Content */}
        <main className="flex-1 px-4 py-2 space-y-4">
          
          {/* TAB 1: PLAN (Pixel-faithful to the screenshot) */}
          {currentTab === 'plan' && (
            <div className="space-y-3.5 pb-24 animate-in fade-in duration-200">
              {/* Origin & Destination Search Card */}
              <RouteSearchCard
                origin={origin}
                destination={destination}
                onSwap={handleSwap}
                onSelectOrigin={() => {
                  setLocationModalTarget('origin');
                  setIsLocationModalOpen(true);
                }}
                onSelectDestination={() => {
                  setLocationModalTarget('destination');
                  setIsLocationModalOpen(true);
                }}
              />

              {/* Live Commute Advisory Card */}
              <LiveAdvisoryCard
                advisory={advisory}
                selectedRouteId={selectedRouteId}
                onSelectRoute={(id) => setSelectedRouteId(id)}
              />

              {routesLoading && (
                <div className="text-[12px] text-slate-400 px-1">Fetching live routes from OneMap…</div>
              )}
              {routesError && !routesLoading && (
                <div className="text-[12px] text-[#fba268] bg-[#241a13] border border-[#50311c] rounded-xl px-3 py-2">
                  {routesError}
                </div>
              )}

              {/* Route Options List */}
              <RouteOptionsList
                routes={routes}
                selectedRouteId={selectedRouteId}
                onSelectRoute={(id) => setSelectedRouteId(id)}
              />

              {/* Start Navigation Action Button */}
              <StartNavButton
                onClick={() => setIsNavigating(true)}
                title="Start Navigation"
              />
            </div>
          )}

          {/* TAB 2: AR GUIDE (Augmented Reality Canopy Viewfinder) */}
          {currentTab === 'ar' && <ARGuideScreen />}

          {/* TAB 3: TRANSIT (Tampines Sheltered Interchange & MRT) */}
          {currentTab === 'transit' && <TransitScreen />}

          {/* TAB 4: ALERTS (Weather Doppler Radar & Commute Advisories) */}
          {currentTab === 'alerts' && <AlertsScreen />}

        </main>

        {/* Persistent Bottom Navigation Bar */}
        <BottomNavBar
          currentTab={currentTab}
          onChangeTab={(tab) => setCurrentTab(tab)}
          alertCount={3}
        />

        {/* Live Turn-by-Turn Navigation Modal Overlay */}
        {isNavigating && (
          <NavigationScreen
            route={activeRoute}
            origin={origin}
            destination={destination}
            onClose={() => setIsNavigating(false)}
          />
        )}

        {/* Location Picker Modal */}
        <LocationPickerModal
          isOpen={isLocationModalOpen}
          title={locationModalTarget === 'origin' ? 'Select Origin Location' : 'Select Destination Location'}
          currentLocation={locationModalTarget === 'origin' ? origin : destination}
          onSelect={handleSelectLocation}
          onClose={() => setIsLocationModalOpen(false)}
        />

        {/* Weather Picker Modal */}
        <WeatherPickerModal
          isOpen={isWeatherModalOpen}
          currentWeather={weather}
          onSelectWeather={handleSelectWeather}
          onClose={() => setIsWeatherModalOpen(false)}
        />

        {/* Profile Modal */}
        <ProfileModal
          isOpen={isProfileModalOpen}
          onClose={() => setIsProfileModalOpen(false)}
        />

      </div>
    </div>
  );
}
