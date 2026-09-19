# NebulaX_Walk-la
# CanopyNav

A sheltered-walkway navigation app for Singapore commuters, built for the NebulaX 2026 hackathon (PS2 — Smart Commuter Companion). Plans multi-modal routes (walk, cycle, drive, transit) with real-time OneMap routing, live weather and bus arrivals, and a phone-camera AR guidance overlay for walking navigation.

## Features

- **Route planning** — walk, cycle, drive, and public transit (rail + bus) routes via OneMap, with up to 3 transit alternatives compared side by side
- **Live location search** — debounced address/building/postal-code search against OneMap, not a static list
- **Weather-aware routing** — pulls live 2-hour forecasts from data.gov.sg
- **Bus arrivals** — live arrival times via LTA DataMall
- **AR guidance** — camera + compass overlay for the active walking leg, with off-route detection (audio + visual alert) and graceful fallback to a step list when camera/orientation/GPS aren't available (works on desktop; full functionality needs a phone)

## Tech stack

- **Frontend**: React 19, Vite, Tailwind CSS 4, TypeScript
- **Backend**: Express (Node, plain JS) — proxies and normalizes OneMap, LTA DataMall, and data.gov.sg, so credentials never reach the browser
- **Deployment**: Docker / Google Cloud Run (one container serves both the API and the built frontend)

## Prerequisites

- [Node.js](https://nodejs.org/en/download) (LTS)
- A [OneMap](https://www.onemap.gov.sg/apidocs/register) account (free) — required for search and routing
- An [LTA DataMall](https://datamall.lta.gov.sg/content/datamall/en/request-for-api.html) account key — required for bus arrivals
- A [data.gov.sg](https://api-open.data.gov.sg/) API key — required for weather

The app still runs and the UI still loads without these, but search, routing, weather, and bus arrivals will return errors until they're configured.

## Setup

```bash
cd walk-la
npm install
cp .env.example .env
```

Open `.env` and fill in `ONEMAP_EMAIL`, `ONEMAP_PASSWORD`, `LTA_ACCOUNT_KEY`, and `DATAGOV_API_KEY`. **Never commit `.env`** — it's gitignored, and `.env.example` (the template with empty values) is the only one that should ever be in version control.

Run the backend and frontend together:

```bash
npm run dev:all
```

— or in two separate terminals:

```bash
npm run server   # Express API on :3001
npm run dev      # Vite on :3000, proxies /api/* to the server above
```

Open `http://localhost:3000`.

## Project structure

```
walk-la/
├── server/
│   ├── onemap.js      # main Express app: OneMap auth, search, routing (walk/cycle/drive/pt)
│   ├── weather.js      # data.gov.sg forecast router, mounted at /api/weather
│   └── lta.js           # LTA DataMall router (bus arrivals, covered linkways), mounted at /api/lta
├── src/
│   ├── components/     # UI screens (Plan, Navigation, AR Guide, Transit, Alerts)
│   ├── hooks/
│   │   └── useLiveGuidance.ts   # camera/compass/GPS hook powering the AR overlay
│   ├── services/        # frontend API clients (onemap.ts, weather.ts, lta.ts)
│   ├── data/mockData.ts # offline fallback routes, used if the backend/API calls fail
│   └── App.tsx
├── Dockerfile
└── .env.example
```

## API endpoints

| Endpoint | Description |
|---|---|
| `GET /api/onemap/search?searchVal=...` | Address/building/postal-code search |
| `GET /api/onemap/route?...&mode=walk\|cycle\|drive\|pt` | Routing; `pt` mode also needs `date`, `time` |
| `GET /api/weather/forecast` | 2-hour weather forecast |
| `GET /api/lta/bus-arrival?busStopCode=...` | Live bus arrival timings |
| `GET /api/lta/covered-linkways` | Sheltered walkway geometry |
| `GET /api/health` | Health check |

## Deploying (Google Cloud Run)

Credentials go in Secret Manager, not plain environment variables:

```bash
gcloud secrets create onemap-email --data-file=- <<< "your-email@example.com"
gcloud secrets create onemap-password --data-file=- <<< "your-password"
gcloud secrets create lta-account-key --data-file=- <<< "your-lta-key"
gcloud secrets create datagov-api-key --data-file=- <<< "your-datagov-key"

gcloud run deploy canopynav \
  --source . \
  --region asia-southeast1 \
  --allow-unauthenticated \
  --set-secrets=ONEMAP_EMAIL=onemap-email:latest,ONEMAP_PASSWORD=onemap-password:latest,LTA_ACCOUNT_KEY=lta-account-key:latest,DATAGOV_API_KEY=datagov-api-key:latest
```

This builds the container from the `Dockerfile` (no local Docker install needed) and prints a `*.run.app` URL serving both the API and the frontend from one origin.

## Testing the AR guidance feature

The camera/compass overlay needs a phone — laptops lack the magnetometer hardware the compass arrow depends on, and camera/orientation permissions require HTTPS (localhost is exempt, a LAN IP is not). For local testing on a phone before deploying, tunnel your dev server:

```bash
cloudflared tunnel --url http://localhost:3000
```
