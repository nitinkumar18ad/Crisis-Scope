# Crisis Scope Handover

This file is the continuity guide for any AI or developer taking over work in this repository.

Mandatory rule: after making any meaningful change, update this `handover.md` in the same task so the next AI inherits current context instead of stale notes.

## Project summary

- Project name: `Crisis Scope`
- Purpose: real-time global crisis monitoring and analysis system
- Monorepo style: `pnpm` workspace with apps in `artifacts/*` and shared libraries in `lib/*`
- Main stack:
  - Frontend: React 19, Vite, TypeScript, Tailwind CSS, TanStack Query, Wouter
  - Backend: Express 5, TypeScript, Pino
  - Database: PostgreSQL via Drizzle ORM
  - API contract/codegen: OpenAPI + Orval + Zod

## Workspace structure

- `artifacts/crisis-dashboard`
  - React dashboard app
  - Entry points: `src/main.tsx`, `src/App.tsx`
  - Main page: `src/pages/Dashboard.tsx`
  - Dashboard UI lives mostly under `src/components/dashboard`
  - Shared UI primitives live under `src/components/ui`
- `artifacts/api-server`
  - Express API server
  - Entry points: `src/index.ts`, `src/app.ts`
  - Routes: `src/routes/health.ts`, `src/routes/risk.ts`
  - Background ingest/seeding job: `src/scheduler.ts`
- `lib/db`
  - Drizzle connection + schema
  - Config: `drizzle.config.ts`
  - Schema: `src/schema/riskEvents.ts`, `src/schema/alerts.ts`
- `lib/api-spec`
  - Source of truth for API contract: `openapi.yaml`
  - Orval config: `orval.config.ts`
- `lib/api-client-react`
  - Generated React Query client from OpenAPI
- `lib/api-zod`
  - Generated Zod schemas/types from OpenAPI
- `scripts`
  - Small workspace scripts/helpers

## How the system fits together

1. The backend exposes `/api/*` endpoints from `artifacts/api-server`.
2. The frontend proxies `/api` requests to `http://localhost:8080` in local dev.
3. Database reads/writes go through `@workspace/db`.
4. Shared API types are generated from `lib/api-spec/openapi.yaml`.
5. The scheduler seeds historical/demo/live-ish data into PostgreSQL and powers dashboard content.

## Current backend behavior

Implemented routes in `artifacts/api-server/src/routes/risk.ts`:

- `GET /api/risk/data`
  - latest risk event per `country-category` pair from recent rows
- `GET /api/risk/alerts`
  - latest 50 alerts
- `GET /api/risk/anomalies`
  - anomaly events sorted by highest risk
- `GET /api/risk/predict?country=...`
  - computes weighted prediction from recent event history
  - optionally uses Gemini for explanation if `GEMINI_API_KEY` exists
- `GET /api/risk/forecast?country=...`
  - 7-day forecast
  - optionally uses Gemini for generated score series
  - falls back to deterministic rising trend if Gemini is unavailable
- `GET /api/risk/summary`
  - aggregate dashboard stats
- `GET /api/risk/history`
  - 30-day category history for charts
- `GET /api/healthz`
  - returns `{ status: "ok" }`

Background processing in `artifacts/api-server/src/scheduler.ts`:

- starts automatically from `src/app.ts`
- runs initial jobs after 5 seconds
- repeats every 30 minutes
- jobs include:
  - historical data seeding
  - economic/supply-chain seed data
  - ReliefWeb fetch
  - USGS earthquake fetch
  - NewsAPI fetch, with mock fallback when key is missing/invalid
  - OpenWeather fetch when key exists

## Current data model

Defined in `lib/db/src/schema`.

`risk_events`:

- `id`
- `country`
- `region`
- `category`: `climate | economic | supply_chain`
- `riskScore`
- `riskLevel`: `Low | Medium | High`
- `source`
- `timestamp`
- `isAnomaly`
- `lat`
- `lng`

`alerts`:

- `id`
- `title`
- `description`
- `severity`
- `source`
- `country`
- `createdAt`

## Environment requirements

Do not commit secret values. Keep only variable names/documentation here.

Required for backend startup:

- `DATABASE_URL`
- `PORT`

Optional but used for richer/live behavior:

- `NEWS_API_KEY`
- `OPENWEATHER_API_KEY`
- `GEMINI_API_KEY`
- `BASE_PATH` for frontend base path if needed

Notes:

- `lib/db/drizzle.config.ts` throws if `DATABASE_URL` is missing.
- `lib/db/src/index.ts` also throws if `DATABASE_URL` is missing.
- `artifacts/api-server/src/index.ts` throws if `PORT` is missing or invalid.
- `artifacts/crisis-dashboard/vite.config.ts` uses `PORT` too, defaulting to `5173`.
- Frontend dev proxy currently targets backend at `http://localhost:8080`.
- There are multiple `.env` files in this repo. The running API server uses `artifacts/api-server/.env`; do not assume the root `.env` points at the same database or valid credentials.

Recommended local dev ports:

- backend: `PORT=8080`
- frontend: run with `PORT=5173`

## Important generated-code rule

If the API contract changes, update the source OpenAPI spec first, then regenerate clients/types.

Source of truth:

- `lib/api-spec/openapi.yaml`

Codegen command:

```bash
pnpm --filter @workspace/api-spec run codegen
```

This regenerates:

- `lib/api-client-react/src/generated/*`
- `lib/api-zod/src/generated/*`

Do not hand-edit generated files unless there is an unavoidable emergency and you also document why here.

## Common commands

From repo root:

```bash
pnpm install
pnpm run typecheck
pnpm run build
```

Run frontend:

```bash
pnpm --filter @workspace/crisis-dashboard run dev
```

Run backend:

```bash
pnpm --filter @workspace/api-server run dev
```

Run API codegen:

```bash
pnpm --filter @workspace/api-spec run codegen
```

Bootstrap DB tables if runtime errors mention missing relations like `risk_events` or `alerts`:

```bash
cd lib/db
$env:DATABASE_URL=((Get-Content ..\\..\\artifacts\\api-server\\.env | Where-Object { $_ -match '^DATABASE_URL=' }) -replace '^DATABASE_URL=','')
pnpm run ensure-schema
```

## Frontend notes

- Routing is minimal right now: `/` -> dashboard, fallback -> not found
- Query client is created in `artifacts/crisis-dashboard/src/App.tsx`
- Dark mode is force-enabled in `App.tsx`
- The dashboard is composed from dedicated sections:
  - `StatsRow`
  - `WorldMap`
  - `RiskChart`
  - `CrisisSection`
  - `AlertsPanel`
  - `AnomaliesList`
  - `CountryPredictionModal`

## Backend notes

- Logging uses Pino/Pino HTTP
- `express.json()` and CORS are enabled globally
- Scheduler starts as part of app boot, so local startup can mutate/populate the database automatically
- The current data pipeline mixes seeded/demo data with live external fetches
- DB bootstrap helper lives at `lib/db/src/ensure-schema.ts` and is exposed as `pnpm run ensure-schema` inside `lib/db`

## Risk areas and maintenance cautions

- `artifacts/api-server/src/scheduler.ts` is large and central; changes there can affect alerts, dashboard data, startup behavior, and DB growth
- Some live data paths rely on optional API keys and have fallbacks; preserve fallback behavior unless intentionally changing local-dev ergonomics
- `fetch` + AI response parsing in prediction/forecast is brittle by nature; verify responses carefully if modifying Gemini integration
- Frontend and backend rely on API shape staying aligned with generated clients/types
- The frontend Vite proxy assumes the API server is on `localhost:8080`

## Suggested handoff workflow for the next AI

1. Read this file first.
2. Check `package.json`, `pnpm-workspace.yaml`, and the relevant package `package.json`.
3. If changing API shape, inspect `lib/api-spec/openapi.yaml` before touching generated code.
4. If changing dashboard behavior, inspect `artifacts/crisis-dashboard/src/pages/Dashboard.tsx` and related dashboard components first.
5. If changing data ingestion or backend calculations, inspect `artifacts/api-server/src/routes/risk.ts` and `src/scheduler.ts` first.
6. After finishing work, update this `handover.md` with any new architecture decisions, commands, caveats, or changed flows.

## Update log

- 2026-06-27: Initial handover created. Captured monorepo layout, runtime flow, env requirements, data model, codegen flow, and the rule that future AIs must keep this file updated after changes.
- 2026-06-27: Fixed missing-table runtime failures by adding `lib/db/src/ensure-schema.ts` and the `lib/db` script `ensure-schema`. Also documented that `artifacts/api-server/.env` is the important DB env for the running API, while the root `.env` may differ.
