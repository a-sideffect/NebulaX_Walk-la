import express from "express";
import cors from "cors";
import path from "path";
import fs from "fs";
import "dotenv/config";
import weatherRouter from "./weather.js";
import ltaRouter from "./lta.js";

const app = express();

app.use(cors());
app.use(express.json());
app.use("/api/weather", weatherRouter);
app.use("/api/lta", ltaRouter);

const ONEMAP_BASE_URL = "https://www.onemap.gov.sg";

let accessToken = null;
let tokenExpiry = 0;

// ========================================
// GET ONEMAP ACCESS TOKEN
// ========================================

async function getAccessToken() {
  // Reuse existing token if it is still valid
  if (accessToken && Date.now() < tokenExpiry) {
    return accessToken;
  }

  const response = await fetch(`${ONEMAP_BASE_URL}/api/auth/post/getToken`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email: process.env.ONEMAP_EMAIL,
      password: process.env.ONEMAP_PASSWORD,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error("OneMap authentication failed:", errorText);
    throw new Error("Failed to authenticate with OneMap");
  }

  const data = await response.json();
  accessToken = data.access_token;

  // OneMap tokens are valid for 3 days. Refresh before the full expiry.
  tokenExpiry = Date.now() + 70 * 60 * 60 * 1000;

  return accessToken;
}

// ========================================
// SEARCH LOCATIONS
// ========================================

app.get("/api/onemap/search", async (req, res) => {
  try {
    const searchValue = req.query.searchVal;

    if (!searchValue) {
      return res.status(400).json({
        error: "searchVal is required",
      });
    }

    const token = await getAccessToken();

    const params = new URLSearchParams({
      searchVal: searchValue,
      returnGeom: "Y",
      getAddrDetails: "Y",
      pageNum: "1",
    });

    const response = await fetch(
      `${ONEMAP_BASE_URL}/api/common/elastic/search?${params}`,
      {
        method: "GET",
        headers: {
          Authorization: token,
        },
      }
    );

    const data = await response.json();
    res.status(response.status).json(data);
  } catch (error) {
    console.error("OneMap search error:", error);
    res.status(500).json({
      error: "OneMap search failed",
    });
  }
});

// ========================================
// POLYLINE DECODING
// (standard Google encoded-polyline algorithm, precision 5 --
//  OneMap's route_geometry and PT leg geometries use this same encoding)
// ========================================

function decodePolyline(encoded) {
  const points = [];
  let index = 0;
  let lat = 0;
  let lng = 0;

  while (index < encoded.length) {
    let result = 0;
    let shift = 0;
    let b;
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

// ========================================
// ROUTING: walk / cycle / drive
// ========================================

async function fetchSimpleRoute(start, end, routeType) {
  const token = await getAccessToken();
  const params = new URLSearchParams({
    start: `${start.lat},${start.lng}`,
    end: `${end.lat},${end.lng}`,
    routeType,
  });

  const response = await fetch(
    `${ONEMAP_BASE_URL}/api/public/routingsvc/route?${params}`,
    { headers: { Authorization: token } }
  );
  const body = await response.json();
  if (!response.ok) {
    const err = new Error("OneMap route request failed");
    err.status = response.status;
    err.body = body;
    throw err;
  }

  const geometry = decodePolyline(body.route_geometry ?? "");
  const instructions = body.route_instructions ?? [];
  const mode = routeType === "walk" ? "walk" : routeType === "cycle" ? "cycle" : "drive";

  const steps = instructions.map((instr) => {
    // route_instructions entries are arrays; index 9 is [lat, lng].
    const coordPair = Array.isArray(instr) ? instr[9] : null;
    const [lat, lng] = Array.isArray(coordPair)
      ? coordPair
      : [geometry[0]?.lat ?? 0, geometry[0]?.lng ?? 0];
    return {
      instruction: Array.isArray(instr) ? String(instr[0]) : "Continue",
      distanceMeters: Array.isArray(instr) ? Number(instr[2]) || 0 : 0,
      durationSeconds: Array.isArray(instr) ? Number(instr[4]) || 0 : 0,
      mode,
      coordinates: { lat, lng },
    };
  });

  return {
    totalDistanceMeters: Number(body.route_summary?.total_distance) || 0,
    totalDurationSeconds: Number(body.route_summary?.total_time) || 0,
    geometry,
    steps,
  };
}

// ========================================
// ROUTING: public transport
// ========================================

async function fetchPublicTransportRoutes(start, end, opts) {
  const token = await getAccessToken();
  const params = new URLSearchParams({
    start: `${start.lat},${start.lng}`,
    end: `${end.lat},${end.lng}`,
    routeType: "pt",
    date: opts.date,
    time: opts.time,
    mode: opts.mode || "TRANSIT",
    ...(opts.maxWalkDistance ? { maxWalkDistance: opts.maxWalkDistance } : {}),
    ...(opts.numItineraries ? { numItineraries: opts.numItineraries } : {}),
  });

  const response = await fetch(
    `${ONEMAP_BASE_URL}/api/public/routingsvc/route?${params}`,
    { headers: { Authorization: token } }
  );
  const body = await response.json();
  if (!response.ok) {
    const err = new Error("OneMap PT route request failed");
    err.status = response.status;
    err.body = body;
    throw err;
  }

  const itineraries = body.plan?.itineraries ?? [];

  return itineraries.map((itinerary) => {
    const legs = itinerary.legs ?? [];
    let geometry = [];
    const steps = legs.map((leg) => {
      const legGeometry = decodePolyline(leg.legGeometry?.points ?? "");
      geometry = geometry.concat(legGeometry);
      const legMode =
        leg.mode === "WALK"
          ? "walk"
          : leg.mode === "BUS"
          ? "bus"
          : leg.mode === "RAIL" || leg.mode === "SUBWAY"
          ? "rail"
          : "walk";
      const label = leg.route
        ? `${legMode === "bus" ? "Bus" : "Ride"} ${leg.route} to ${leg.to?.name ?? "destination"}`
        : `Walk to ${leg.to?.name ?? "destination"}`;
      return {
        instruction: label,
        distanceMeters: Number(leg.distance) || 0,
        durationSeconds: Number(leg.duration) || 0,
        mode: legMode,
        coordinates: {
          lat: leg.to?.lat ?? legGeometry.at(-1)?.lat ?? 0,
          lng: leg.to?.lon ?? legGeometry.at(-1)?.lng ?? 0,
        },
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

// ========================================
// UNIFIED ROUTE ENDPOINT
// (upgraded from walk-only to walk/cycle/drive/pt)
// ========================================

app.get("/api/onemap/route", async (req, res) => {
  const { startLat, startLng, endLat, endLng, mode } = req.query;

  if (!startLat || !startLng || !endLat || !endLng) {
    return res.status(400).json({
      error: "Missing route coordinates",
    });
  }

  const start = { lat: Number(startLat), lng: Number(startLng) };
  const end = { lat: Number(endLat), lng: Number(endLng) };

  if ([start.lat, start.lng, end.lat, end.lng].some((n) => Number.isNaN(n))) {
    return res.status(400).json({ error: "startLat/startLng/endLat/endLng must be valid numbers" });
  }

  const routeType = mode || "walk";

  try {
    if (routeType === "walk" || routeType === "cycle" || routeType === "drive") {
      const route = await fetchSimpleRoute(start, end, routeType);
      return res.json({ routes: [route] });
    }

    if (routeType === "pt") {
      const { date, time, transitMode, maxWalkDistance, numItineraries } = req.query;
      if (!date || !time) {
        return res.status(400).json({ error: "pt mode requires date and time query params" });
      }
      const routes = await fetchPublicTransportRoutes(start, end, {
        date,
        time,
        mode: transitMode,
        maxWalkDistance,
        numItineraries,
      });
      return res.json({ routes });
    }

    res.status(400).json({ error: `Unknown mode "${routeType}" -- expected walk, cycle, drive, or pt` });
  } catch (error) {
    console.error("OneMap routing error:", error);
    res.status(error.status === 401 || error.status === 403 ? 502 : 500).json({
      error: "OneMap route failed",
    });
  }
});

app.get("/api/health", (_req, res) => {
  res.json({ ok: true });
});

// ========================================
// STATIC FRONTEND (production / Cloud Run)
// Serves the built dist/ folder when present, with an SPA fallback that
// never swallows /api/* routes. In local dev (npm run dev), dist/ usually
// doesn't exist, so this is skipped without error.
// ========================================

const DIST_DIR = path.join(path.dirname(new URL(import.meta.url).pathname), "..", "dist");

if (fs.existsSync(DIST_DIR)) {
  app.use(express.static(DIST_DIR));
  app.get(/^(?!\/api\/).*/, (_req, res) => {
    res.sendFile(path.join(DIST_DIR, "index.html"));
  });
} else {
  console.log("[static] dist/ not found -- skipping static file serving (expected in local dev).");
}

// ========================================
// START SERVER
// ========================================

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  if (!process.env.ONEMAP_EMAIL || !process.env.ONEMAP_PASSWORD) {
    console.warn(
      "[onemap] ONEMAP_EMAIL / ONEMAP_PASSWORD are not set -- routing/search calls will fail until they are configured."
    );
  }
});
