# Crisis Scope Repository Tree

Curated snapshot of the current workspace as of 2026-07-05.

- Includes source, config, docs, and notable local-only folders.
- Omits bulky generated/vendor content such as `node_modules`, most `dist`, and pnpm store internals unless they clarify repo structure.

```text
Crisis Scope
├── .agents/
├── .codex/
├── .local/
│   ├── secondary_skills/
│   ├── share/
│   ├── skills/
│   └── state/
├── .vscode/
│   └── settings.json
├── artifacts/
│   ├── api-server/
│   │   ├── .env
│   │   ├── api/
│   │   │   └── index.js
│   │   ├── public/
│   │   ├── src/
│   │   │   ├── app.ts
│   │   │   ├── index.ts
│   │   │   ├── lib/
│   │   │   │   └── logger.ts
│   │   │   ├── middlewares/
│   │   │   ├── routes/
│   │   │   │   ├── health.ts
│   │   │   │   ├── index.ts
│   │   │   │   └── risk.ts
│   │   │   └── scheduler.ts
│   │   ├── build.mjs
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   └── vercel.json
│   └── crisis-dashboard/
│       ├── public/
│       │   ├── favicon.svg
│       │   └── opengraph.jpg
│       ├── src/
│       │   ├── components/
│       │   │   ├── dashboard/
│       │   │   │   ├── AlertsPanel.tsx
│       │   │   │   ├── AnomaliesList.tsx
│       │   │   │   ├── CountryPredictionModal.tsx
│       │   │   │   ├── CrisisSection.tsx
│       │   │   │   ├── RiskChart.tsx
│       │   │   │   ├── StatsRow.tsx
│       │   │   │   └── WorldMap.tsx
│       │   │   ├── layout/
│       │   │   │   ├── BackgroundVideo.tsx
│       │   │   │   └── Navbar.tsx
│       │   │   └── ui/
│       │   │       ├── LightBeamButton.tsx
│       │   │       ├── MagicBento.tsx
│       │   │       └── ...shared shadcn-style UI primitives
│       │   ├── hooks/
│       │   │   ├── use-mobile.tsx
│       │   │   └── use-toast.ts
│       │   ├── lib/
│       │   │   └── utils.ts
│       │   ├── pages/
│       │   │   ├── Dashboard.tsx
│       │   │   └── not-found.tsx
│       │   ├── App.tsx
│       │   ├── index.css
│       │   └── main.tsx
│       ├── components.json
│       ├── index.html
│       ├── package.json
│       ├── run3-out.txt
│       ├── tsconfig.json
│       ├── vercel.json
│       └── vite.config.ts
├── lib/
│   ├── api-client-react/
│   │   ├── src/
│   │   │   ├── generated/
│   │   │   │   ├── api.schemas.ts
│   │   │   │   └── api.ts
│   │   │   ├── custom-fetch.ts
│   │   │   └── index.ts
│   │   ├── package.json
│   │   └── tsconfig.json
│   ├── api-spec/
│   │   ├── openapi.yaml
│   │   ├── orval.config.ts
│   │   └── package.json
│   ├── api-zod/
│   │   ├── src/
│   │   │   ├── generated/
│   │   │   │   ├── api.ts
│   │   │   │   └── types/
│   │   │   │       ├── alert.ts
│   │   │   │       ├── forecastResult.ts
│   │   │   │       ├── getForecastParams.ts
│   │   │   │       ├── getPredictionParams.ts
│   │   │   │       ├── getRiskHistoryParams.ts
│   │   │   │       ├── globalSummary.ts
│   │   │   │       ├── healthStatus.ts
│   │   │   │       ├── predictionResult.ts
│   │   │   │       ├── riskEvent.ts
│   │   │   │       └── riskHistoryPoint.ts
│   │   │   └── index.ts
│   │   ├── package.json
│   │   └── tsconfig.json
│   └── db/
│       ├── src/
│       │   ├── schema/
│       │   │   ├── alerts.ts
│       │   │   ├── index.ts
│       │   │   └── riskEvents.ts
│       │   ├── ensure-schema.ts
│       │   └── index.ts
│       ├── drizzle.config.ts
│       ├── package.json
│       └── tsconfig.json
├── scripts/
│   ├── src/
│   │   └── hello.ts
│   ├── package.json
│   ├── post-merge.sh
│   └── tsconfig.json
├── .env
├── .gitignore
├── .npmrc
├── docker-compose.yml
├── handover.md
├── package.json
├── pnpm-lock.yaml
├── pnpm-workspace.yaml
├── README.md
├── tree.md
├── tsconfig.base.json
└── tsconfig.json
```

## Notes

- `artifacts/` contains the runnable app surfaces: the API server and the dashboard.
- `lib/api-spec` is the contract source; `lib/api-client-react` and `lib/api-zod` contain generated client/types derived from it.
- `.local/` is present in this checkout and contains local Codex/pnpm support data rather than app source.
