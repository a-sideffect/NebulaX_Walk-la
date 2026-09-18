export type TabType = 'plan' | 'ar' | 'transit' | 'alerts';

export interface LocationPoint {
  id: string;
  name: string;
  stationCode?: string;
  gateOrExit?: string;
  type: 'mrt' | 'hub' | 'bus_interchange' | 'mall' | 'hdb';
  coordinates: { lat: number; lng: number };
}

export interface RouteOption {
  id: string;
  type: 'transit' | 'walk' | 'hybrid';
  title: string;
  badge?: string;
  badgeType?: 'fastest' | 'dry' | 'linkway';
  subtitle: string;
  durationMinutes: number;
  coveredPercentage: number;
  arrivalSubtext?: string;
  openCrossingMeters?: number;
  shelterDistanceMeters?: number;
  steps: NavigationStep[];
}

export interface NavigationStep {
  id: string;
  instruction: string;
  detail: string;
  covered: boolean;
  distanceMeters: number;
  durationSeconds: number;
  iconType: 'subway' | 'bus' | 'walk' | 'turn-left' | 'turn-right' | 'straight' | 'shelter' | 'destination';
  shelterType?: 'Underground' | 'Covered Linkway' | 'Air-conditioned Mall' | 'Void Deck' | 'Open Crossing';
}

export interface WeatherStatus {
  condition: 'rain_soon' | 'heavy_rain' | 'light_rain' | 'clear';
  temperatureC: number;
  rainArrivalMins: number | null;
  rainfallIntensityMm: number;
  radarCellDistanceKm: number;
  advisoryText: string;
}

export interface AdvisoryInfo {
  recommendationTitle: string;
  description: string;
  transitSummary: {
    totalMins: number;
    busNotice: string;
    is100Dry: boolean;
  };
  walkSummary: {
    totalMins: number;
    openCrossingMeters: number;
    coveredPercent: number;
  };
}

export interface BusArrival {
  serviceNo: string;
  destination: string;
  nextArrivalMins: number;
  subsequentArrivalMins: number;
  shelteredBerth: string;
  isCoveredWalkway: boolean;
  crowdLevel: 'low' | 'medium' | 'high';
  isDoubleDecker: boolean;
}

export interface CommuteAlert {
  id: string;
  type: 'weather' | 'linkway' | 'umbrella_sharing';
  title: string;
  location: string;
  timeAgo: string;
  severity: 'high' | 'medium' | 'info';
  description: string;
}
