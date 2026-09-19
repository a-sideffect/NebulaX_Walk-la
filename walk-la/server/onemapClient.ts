// OneMap (Singapore Land Authority) API client.
//
// Verified against the current official docs as of this build:
//   Auth:    POST https://www.onemap.gov.sg/api/auth/post/getToken
//   Search:  GET  https://www.onemap.gov.sg/api/common/elastic/search
//   Route:   GET  https://www.onemap.gov.sg/api/public/routingsvc/route
// The auth header is the raw token string (no "Bearer " prefix) -- OneMap's
// flow predates the Bearer convention on this endpoint.
//
// Credentials (ONEMAP_EMAIL / ONEMAP_PASSWORD) never leave this process --
// the frontend only ever talks to our own /api/onemap/* routes.

const ONEMAP_BASE = 'https://www.onemap.gov.sg';

interface TokenCache {
  token: string;
  expiresAtMs: number;
}

let tokenCache: TokenCache | null = null;
// Refresh a bit before the real expiry so an in-flight request never races
// a token that dies mid-call. OneMap tokens are valid ~3 days; refresh 1h early.
const REFRESH_MARGIN_MS = 60 * 60 * 1000;

export class OneMapConfigError extends Error {}
export class OneMapUpstreamError extends Error {
  constructor(message: string, public status: number, public body?: unknown) {
    super(message);
  }
}

async function fetchNewToken(): Promise<TokenCache> {
  const email = process.env.ONEMAP_EMAIL;
  const password = process.env.ONEMAP_PASSWORD;
  if (!email || !password) {
    throw new OneMapConfigError(
      'ONEMAP_EMAIL / ONEMAP_PASSWORD are not set. Add them to your .env file (see .env.example).'
    );
  }

  const res = await fetch(`${ONEMAP_BASE}/api/auth/post/getToken`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });

  const body: any = await res.json().catch(() => null);
  if (!res.ok || !body?.access_token) {
    throw new OneMapUpstreamError(
      'OneMap authentication failed -- check ONEMAP_EMAIL/ONEMAP_PASSWORD are correct and the account is verified.',
      res.status,
      body
    );
  }

  // expiry_timestamp is a Unix seconds timestamp per OneMap's docs.
  const expiresAtMs = Number(body.expiry_timestamp) * 1000;
  return { token: body.access_token as string, expiresAtMs };
}

export async function getToken(): Promise<string> {
  const now = Date.now();
  if (tokenCache && tokenCache.expiresAtMs - REFRESH_MARGIN_MS > now) {
    return tokenCache.token;
  }
  tokenCache = await fetchNewToken();
  return tokenCache.token;
}

async function onemapGet(path: string, params: Record<string, string>): Promise<any> {
  const token = await getToken();
  const url = new URL(`${ONEMAP_BASE}${path}`);
  for (const [key, value] of Object.entries(params)) url.searchParams.set(key, value);

  const res = await fetch(url, { headers: { Authorization: token } });
  const body: any = await res.json().catch(() => null);
  if (!res.ok) {
    throw new OneMapUpstreamError(`OneMap request to ${path} failed`, res.status, body);
  }
  return body;
}

// ---- Polyline decoding (standard Google encoded-polyline algorithm, precision 5) ----
// OneMap's route_geometry and leg geometries use this same well-known encoding.
export function decodePolyline(encoded: string): Array<{ lat: number; lng: number }> {
  const points: Array<{ lat: number; lng: number }> = [];
  let index = 0;
  let lat = 0;
  let lng = 0;

  while (index < encoded.length) {
    let result = 0;
    let shift = 0;
    let b: number;
    do {
      b = encoded.charCodeAt(index++) - 63;
      result |= (b & 0x1f) << shift;
      shift += 5;
    } while (b >= 0x20);
    lat += result & 1 ? ~(result >> 1) : result >> 1;

    result = 0;
    shift = 0;
    do {
      b = encoded.charCodeAt(index++) - 63;
      result |= (b & 0x1f) << shift;
      shift += 5;
    } while (b >= 0x20);
    lng += result & 1 ? ~(result >> 1) : result >> 1;

    points.push({ lat: lat / 1e5, lng: lng / 1e5 });
  }

  return points;
}

// ---- Public types (normalized shape returned to the frontend) ----
export interface NormalizedStep {
  instruction: string;
  distanceMeters: number;
  durationSeconds: number;
  mode: 'walk' | 'bus' | 'rail' | 'drive' | 'cycle';
  coordinates: { lat: number; lng: number };
}

export interface NormalizedRoute {
  totalDistanceMeters: number;
  totalDurationSeconds: number;
  geometry: Array<{ lat: number; lng: number }>;
  steps: NormalizedStep[];
}

export interface SearchResult {
  name: string;
  address: string;
  postal: string | null;
  lat: number;
  lng: number;
}

// ---- Search ----
export async function search(query: string): Promise<SearchResult[]> {
  const body = await onemapGet('/api/common/elastic/search', {
    searchVal: query,
    returnGeom: 'Y',
    getAddrDetails: 'Y',
    pageNum: '1',
  });

  const results = Array.isArray(body?.results) ? body.results : [];
  return results.map((r: any) => ({
    name: r.BUILDING && r.BUILDING !== 'NIL' ? r.BUILDING : r.ROAD_NAME,
    address: r.ADDRESS,
    postal: r.POSTAL && r.POSTAL !== 'NIL' ? r.POSTAL : null,
    lat: parseFloat(r.LATITUDE),
    lng: parseFloat(r.LONGITUDE),
  }));
}

// ---- Routing: walk / cycle / drive ----
async function simpleRoute(
  start: { lat: number; lng: number },
  end: { lat: number; lng: number },
  routeType: 'walk' | 'cycle' | 'drive'
): Promise<NormalizedRoute> {
  const body = await onemapGet('/api/public/routingsvc/route', {
    start: `${start.lat},${start.lng}`,
    end: `${end.lat},${end.lng}`,
    routeType,
  });

  const geometry = decodePolyline(body?.route_geometry ?? '');
  const instructions: any[] = body?.route_instructions ?? [];
  const mode = routeType === 'walk' ? 'walk' : routeType === 'cycle' ? 'cycle' : 'drive';

  const steps: NormalizedStep[] = instructions.map((instr) => {
    // OneMap's route_instructions entries are arrays; index 9 is [lat, lng].
    const coordPair = Array.isArray(instr) ? instr[9] : null;
    const [lat, lng] = Array.isArray(coordPair) ? coordPair : [geometry[0]?.lat ?? 0, geometry[0]?.lng ?? 0];
    return {
      instruction: Array.isArray(instr) ? String(instr[0]) : 'Continue',
      distanceMeters: Array.isArray(instr) ? Number(instr[2]) || 0 : 0,
      durationSeconds: Array.isArray(instr) ? Number(instr[4]) || 0 : 0,
      mode,
      coordinates: { lat, lng },
    };
  });

  return {
    totalDistanceMeters: Number(body?.route_summary?.total_distance) || 0,
    totalDurationSeconds: Number(body?.route_summary?.total_time) || 0,
    geometry,
    steps,
  };
}

// ---- Routing: public transport ----
async function ptRoute(
  start: { lat: number; lng: number },
  end: { lat: number; lng: number },
  opts: { date: string; time: string; mode: 'TRANSIT' | 'BUS' | 'RAIL'; maxWalkDistance?: string; numItineraries?: string }
): Promise<NormalizedRoute[]> {
  const body = await onemapGet('/api/public/routingsvc/route', {
    start: `${start.lat},${start.lng}`,
    end: `${end.lat},${end.lng}`,
    routeType: 'pt',
    date: opts.date,
    time: opts.time,
    mode: opts.mode,
    ...(opts.maxWalkDistance ? { maxWalkDistance: opts.maxWalkDistance } : {}),
    ...(opts.numItineraries ? { numItineraries: opts.numItineraries } : {}),
  });

  const itineraries: any[] = body?.plan?.itineraries ?? [];

  return itineraries.map((itinerary) => {
    const legs: any[] = itinerary.legs ?? [];
    let geometry: Array<{ lat: number; lng: number }> = [];
    const steps: NormalizedStep[] = legs.map((leg) => {
      const legGeometry = decodePolyline(leg?.legGeometry?.points ?? '');
      geometry = geometry.concat(legGeometry);
      const legMode: NormalizedStep['mode'] =
        leg.mode === 'WALK' ? 'walk' : leg.mode === 'BUS' ? 'bus' : leg.mode === 'RAIL' || leg.mode === 'SUBWAY' ? 'rail' : 'walk';
      const label = leg.route ? `${legMode === 'bus' ? 'Bus' : 'Ride'} ${leg.route} to ${leg.to?.name ?? 'destination'}` : `Walk to ${leg.to?.name ?? 'destination'}`;
      return {
        instruction: label,
        distanceMeters: Number(leg.distance) || 0,
        durationSeconds: Number(leg.duration) || 0,
        mode: legMode,
        coordinates: { lat: leg.to?.lat ?? legGeometry.at(-1)?.lat ?? 0, lng: leg.to?.lon ?? legGeometry.at(-1)?.lng ?? 0 },
      };
    });

    return {
      totalDistanceMeters: legs.reduce((sum, leg) => sum + (Number(leg.distance) || 0), 0),
      totalDurationSeconds: Number(itinerary.duration) || 0,
      geometry,
      steps,
    };
  });
}

export async function getRoute(
  start: { lat: number; lng: number },
  end: { lat: number; lng: number },
  routeType: 'walk' | 'cycle' | 'drive'
): Promise<NormalizedRoute> {
  return simpleRoute(start, end, routeType);
}

export async function getPublicTransportRoutes(
  start: { lat: number; lng: number },
  end: { lat: number; lng: number },
  opts: { date: string; time: string; mode: 'TRANSIT' | 'BUS' | 'RAIL'; maxWalkDistance?: string; numItineraries?: string }
): Promise<NormalizedRoute[]> {
  return ptRoute(start, end, opts);
}
