import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import {
  search,
  getRoute,
  getPublicTransportRoutes,
  OneMapConfigError,
  OneMapUpstreamError,
} from './onemapClient';

const app = express();
// Cloud Run injects PORT (typically 8080) and expects the container to bind
// to it -- that takes priority. SERVER_PORT is the local-dev override (8787),
// matching the Vite proxy target in vite.config.ts.
const PORT = Number(process.env.PORT) || Number(process.env.SERVER_PORT) || 8787;
const DIST_DIR = path.join(import.meta.dirname, '..', 'dist');

app.use(cors());
app.use(express.json());

app.get('/api/health', (_req, res) => {
  res.json({ ok: true });
});

app.get('/api/onemap/search', async (req, res) => {
  const q = String(req.query.q ?? '').trim();
  if (!q) {
    res.status(400).json({ error: 'Missing required query param: q' });
    return;
  }
  try {
    const results = await search(q);
    res.json({ results });
  } catch (err) {
    handleOneMapError(err, res);
  }
});

app.get('/api/onemap/route', async (req, res) => {
  const { startLat, startLng, endLat, endLng, mode } = req.query;

  if (!startLat || !startLng || !endLat || !endLng || !mode) {
    res.status(400).json({
      error: 'Missing required query params: startLat, startLng, endLat, endLng, mode',
    });
    return;
  }

  const start = { lat: Number(startLat), lng: Number(startLng) };
  const end = { lat: Number(endLat), lng: Number(endLng) };

  if ([start.lat, start.lng, end.lat, end.lng].some((n) => Number.isNaN(n))) {
    res.status(400).json({ error: 'startLat/startLng/endLat/endLng must be valid numbers' });
    return;
  }

  try {
    if (mode === 'walk' || mode === 'cycle' || mode === 'drive') {
      const route = await getRoute(start, end, mode);
      res.json({ routes: [route] });
      return;
    }

    if (mode === 'pt') {
      const { date, time, transitMode, maxWalkDistance, numItineraries } = req.query;
      if (!date || !time) {
        res.status(400).json({ error: 'pt mode requires date and time query params' });
        return;
      }
      const routes = await getPublicTransportRoutes(start, end, {
        date: String(date),
        time: String(time),
        mode: (transitMode as 'TRANSIT' | 'BUS' | 'RAIL') ?? 'TRANSIT',
        maxWalkDistance: maxWalkDistance ? String(maxWalkDistance) : undefined,
        numItineraries: numItineraries ? String(numItineraries) : undefined,
      });
      res.json({ routes });
      return;
    }

    res.status(400).json({ error: `Unknown mode "${mode}" -- expected walk, cycle, drive, or pt` });
  } catch (err) {
    handleOneMapError(err, res);
  }
});

function handleOneMapError(err: unknown, res: express.Response) {
  if (err instanceof OneMapConfigError) {
    console.error('[onemap] config error:', err.message);
    res.status(500).json({ error: err.message });
    return;
  }
  if (err instanceof OneMapUpstreamError) {
    console.error('[onemap] upstream error:', err.status, err.message, err.body);
    res.status(502).json({ error: err.message, upstreamStatus: err.status });
    return;
  }
  console.error('[onemap] unexpected error:', err);
  res.status(500).json({ error: 'Unexpected server error' });
}

// Serve the built frontend when dist/ exists (the production container --
// see Dockerfile). In local dev, dist/ usually doesn't exist because you're
// running `npm run dev` (Vite) separately, so this is skipped without error.
if (fs.existsSync(DIST_DIR)) {
  app.use(express.static(DIST_DIR));
  // SPA fallback: any non-API route serves index.html so the app's own
  // client-side tab state (not a router) can take over. Must be registered
  // after every /api/* route above, or it would swallow them.
  app.get(/^(?!\/api\/).*/, (_req, res) => {
    res.sendFile(path.join(DIST_DIR, 'index.html'));
  });
} else {
  console.log('[static] dist/ not found -- skipping static file serving (expected in local dev).');
}

app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
  if (!process.env.ONEMAP_EMAIL || !process.env.ONEMAP_PASSWORD) {
    console.warn(
      '[onemap] ONEMAP_EMAIL / ONEMAP_PASSWORD are not set -- routing calls will fail until they are configured.'
    );
  }
});
