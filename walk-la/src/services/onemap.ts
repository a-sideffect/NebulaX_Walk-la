import { RouteOption, NavigationStep, LocationPoint } from '../types';

export interface OneMapSearchResult {
  name: string;
  address: string;
  postal: string | null;
  lat: number;
  lng: number;
}

interface NormalizedStep {
  instruction: string;
  distanceMeters: number;
  durationSeconds: number;
  mode: 'walk' | 'bus' | 'rail' | 'drive' | 'cycle';
  coordinates: { lat: number; lng: number };
}

interface NormalizedRoute {
  totalDistanceMeters: number;
  totalDurationSeconds: number;
  geometry: Array<{ lat: number; lng: number }>;
  steps: NormalizedStep[];
}

export class OneMapClientError extends Error {}

async function apiGet(path: string, params: Record<string, string>) {
  const url = new URL(path, window.location.origin);
  for (const [key, value] of Object.entries(params)) url.searchParams.set(key, value);

  const res = await fetch(url.toString());
  const body = await res.json().catch(() => null);
  if (!res.ok) {
    throw new OneMapClientError(body?.error ?? `Request to ${path} failed (${res.status})`);
  }
  return body;
}

export async function searchPlaces(query: string): Promise<OneMapSearchResult[]> {
  if (!query.trim()) return [];
  const body = await apiGet('/api/onemap/search', { q: query });
  return body.results ?? [];
}

export function searchResultToLocationPoint(result: OneMapSearchResult): LocationPoint {
  return {
    id: `onemap-${result.postal ?? `${result.lat},${result.lng}`}`,
    name: result.name,
    type: 'mall', // OneMap search doesn't classify venue type; closest neutral default in the existing union
    coordinates: { lat: result.lat, lng: result.lng },
  };
}

// ---- mode -> UI presentation mapping ----
// covered/shelterType are heuristic placeholders (rail/bus assumed sheltered,
// walk/cycle/drive unknown) until the disruption/sheltered-walkway overlay
// described in ps2-dev-plan.md is layered on top of these routes.
function stepFromNormalized(normalized: NormalizedStep, id: string): NavigationStep {
  const byMode: Record<NormalizedStep['mode'], { iconType: NavigationStep['iconType']; covered: boolean; shelterType?: NavigationStep['shelterType'] }> = {
    walk: { iconType: 'walk', covered: false },
    cycle: { iconType: 'walk', covered: false },
    drive: { iconType: 'straight', covered: true, shelterType: 'Air-conditioned Mall' },
    bus: { iconType: 'bus', covered: true, shelterType: 'Covered Linkway' },
    rail: { iconType: 'subway', covered: true, shelterType: 'Underground' },
  };
  const presentation = byMode[normalized.mode];

  return {
    id,
    instruction: normalized.instruction,
    detail: `${Math.round(normalized.distanceMeters)}m`,
    covered: presentation.covered,
    distanceMeters: Math.round(normalized.distanceMeters),
    durationSeconds: Math.round(normalized.durationSeconds),
    iconType: presentation.iconType,
    shelterType: presentation.shelterType,
    coordinates: normalized.coordinates,
  };
}

function routeOptionFromNormalized(
  route: NormalizedRoute,
  opts: { id: string; type: RouteOption['type']; title: string; subtitle: string; badge?: string; badgeType?: RouteOption['badgeType'] }
): RouteOption {
  const steps = route.steps.map((s, i) => stepFromNormalized(s, `${opts.id}-step-${i}`));
  const coveredMeters = steps.filter((s) => s.covered).reduce((sum, s) => sum + s.distanceMeters, 0);
  const coveredPercentage =
    route.totalDistanceMeters > 0 ? Math.round((coveredMeters / route.totalDistanceMeters) * 100) : 0;

  return {
    id: opts.id,
    type: opts.type,
    title: opts.title,
    badge: opts.badge,
    badgeType: opts.badgeType,
    subtitle: opts.subtitle,
    durationMinutes: Math.max(1, Math.round(route.totalDurationSeconds / 60)),
    coveredPercentage,
    arrivalSubtext: `${Math.round(route.totalDistanceMeters)}m`,
    openCrossingMeters: steps.filter((s) => !s.covered).reduce((sum, s) => sum + s.distanceMeters, 0),
    shelterDistanceMeters: coveredMeters,
    steps: steps.length > 0 ? steps : [placeholderStep(opts.id)],
  };
}

function placeholderStep(routeId: string): NavigationStep {
  // OneMap occasionally returns an empty instruction list for very short
  // routes -- keep NavigationScreen from rendering against an empty array.
  return {
    id: `${routeId}-step-0`,
    instruction: 'Proceed to destination',
    detail: '',
    covered: false,
    distanceMeters: 0,
    durationSeconds: 0,
    iconType: 'destination',
  };
}

function formatOneMapDate(d: Date): string {
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${mm}-${dd}-${d.getFullYear()}`;
}

function formatOneMapTime(d: Date): string {
  return d.toTimeString().slice(0, 8); // HH:MM:SS
}

export async function fetchSimpleRoute(
  origin: LocationPoint,
  destination: LocationPoint,
  mode: 'walk' | 'cycle' | 'drive'
): Promise<RouteOption> {
  const body = await apiGet('/api/onemap/route', {
    startLat: String(origin.coordinates.lat),
    startLng: String(origin.coordinates.lng),
    endLat: String(destination.coordinates.lat),
    endLng: String(destination.coordinates.lng),
    mode,
  });
  const route: NormalizedRoute = body.routes[0];

  const labels: Record<'walk' | 'cycle' | 'drive', string> = {
    walk: 'Walking Route',
    cycle: 'Cycling Route',
    drive: 'Driving Route',
  };

  return routeOptionFromNormalized(route, {
    id: `route-onemap-${mode}`,
    type: 'walk',
    title: labels[mode],
    subtitle: `${Math.round(route.totalDistanceMeters)}m via OneMap`,
  });
}

export async function fetchTransitRoutes(
  origin: LocationPoint,
  destination: LocationPoint,
  when: Date = new Date()
): Promise<RouteOption[]> {
  const body = await apiGet('/api/onemap/route', {
    startLat: String(origin.coordinates.lat),
    startLng: String(origin.coordinates.lng),
    endLat: String(destination.coordinates.lat),
    endLng: String(destination.coordinates.lng),
    mode: 'pt',
    date: formatOneMapDate(when),
    time: formatOneMapTime(when),
    transitMode: 'TRANSIT',
    numItineraries: '3',
  });
  const routes: NormalizedRoute[] = body.routes ?? [];

  return routes.map((route, i) =>
    routeOptionFromNormalized(route, {
      id: `route-onemap-pt-${i}`,
      type: 'transit',
      title: i === 0 ? 'Fastest Transit Route' : `Transit Alternative ${i}`,
      subtitle: route.steps.map((s) => s.mode.toUpperCase()).join(' → '),
      badge: i === 0 ? 'FASTEST' : undefined,
      badgeType: i === 0 ? 'fastest' : undefined,
    })
  );
}

/** Fetch a full route set for the trip (transit + walk), falling back to
 *  whatever succeeds if one mode errors -- never throws unless both fail. */
export async function fetchRouteOptionsForTrip(
  origin: LocationPoint,
  destination: LocationPoint
): Promise<RouteOption[]> {
  const [transitResult, walkResult] = await Promise.allSettled([
    fetchTransitRoutes(origin, destination),
    fetchSimpleRoute(origin, destination, 'walk'),
  ]);

  const routes: RouteOption[] = [];
  if (transitResult.status === 'fulfilled') routes.push(...transitResult.value);
  else console.warn('[onemap] transit route fetch failed:', transitResult.reason);

  if (walkResult.status === 'fulfilled') routes.push(walkResult.value);
  else console.warn('[onemap] walk route fetch failed:', walkResult.reason);

  if (routes.length === 0) {
    throw new OneMapClientError('Both transit and walk route lookups failed');
  }
  return routes;
}
