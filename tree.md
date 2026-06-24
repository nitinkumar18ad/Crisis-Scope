Global-Crisis-Tracker
├── .npmrc
├── artifacts
│   ├── api-server
│   │   ├── .replit-artifact
│   │   │   └── artifact.toml
│   │   ├── build.mjs
│   │   ├── package.json
│   │   ├── src
│   │   │   ├── app.ts
│   │   │   ├── index.ts
│   │   │   ├── lib
│   │   │   │   └── logger.ts
│   │   │   ├── middlewares
│   │   │   └── routes
│   │   │       ├── health.ts
│   │   │       ├── index.ts
│   │   │       └── risk.ts
│   │   └── tsconfig.json
│   └── crisis-dashboard
│       ├── .replit-artifact
│       │   └── artifact.toml
│       ├── components.json
│       ├── index.html
│       ├── package.json
│       ├── public
│       │   ├── favicon.svg
│       │   └── opengraph.jpg
│       ├── src
│       │   ├── App.tsx
│       │   ├── components
│       │   │   ├── dashboard
│       │   │   │   ├── AlertsPanel.tsx
│       │   │   │   ├── AnomaliesList.tsx
│       │   │   │   ├── CountryPredictionModal.tsx
│       │   │   │   ├── CrisisSection.tsx
│       │   │   │   ├── RiskChart.tsx
│       │   │   │   ├── StatsRow.tsx
│       │   │   │   └── WorldMap.tsx
│       │   │   ├── layout
│       │   │   │   └── Navbar.tsx
│       │   │   └── ui
│       │   │       ├── accordion.tsx
│       │   │       ├── alert-dialog.tsx
│       │   │       ├── alert.tsx
│       │   │       ├── aspect-ratio.tsx
│       │   │       ├── avatar.tsx
│       │   │       ├── badge.tsx
│       │   │       ├── breadcrumb.tsx
│       │   │       ├── button-group.tsx
│       │   │       ├── button.tsx
│       │   │       ├── calendar.tsx
│       │   │       ├── card.tsx
│       │   │       ├── carousel.tsx
│       │   │       ├── chart.tsx
│       │   │       ├── checkbox.tsx
│       │   │       ├── collapsible.tsx
│       │   │       ├── command.tsx
│       │   │       ├── context-menu.tsx
│       │   │       ├── dialog.tsx
│       │   │       ├── drawer.tsx
│       │   │       ├── dropdown-menu.tsx
│       │   │       ├── empty.tsx
│       │   │       ├── field.tsx
│       │   │       ├── form.tsx
│       │   │       ├── hover-card.tsx
│       │   │       ├── input-group.tsx
│       │   │       ├── input-otp.tsx
│       │   │       ├── input.tsx
│       │   │       ├── item.tsx
│       │   │       ├── kbd.tsx
│       │   │       ├── label.tsx
│       │   │       ├── menubar.tsx
│       │   │       ├── navigation-menu.tsx
│       │   │       ├── pagination.tsx
│       │   │       ├── popover.tsx
│       │   │       ├── progress.tsx
│       │   │       ├── radio-group.tsx
│       │   │       ├── resizable.tsx
│       │   │       ├── scroll-area.tsx
│       │   │       ├── select.tsx
│       │   │       ├── separator.tsx
│       │   │       ├── sheet.tsx
│       │   │       ├── sidebar.tsx
│       │   │       ├── skeleton.tsx
│       │   │       ├── slider.tsx
│       │   │       ├── sonner.tsx
│       │   │       ├── spinner.tsx
│       │   │       ├── switch.tsx
│       │   │       ├── table.tsx
│       │   │       ├── tabs.tsx
│       │   │       ├── textarea.tsx
│       │   │       ├── toast.tsx
│       │   │       ├── toaster.tsx
│       │   │       ├── toggle-group.tsx
│       │   │       ├── toggle.tsx
│       │   │       └── tooltip.tsx
│       │   ├── hooks
│       │   │   ├── use-mobile.tsx
│       │   │   └── use-toast.ts
│       │   ├── index.css
│       │   ├── lib
│       │   │   └── utils.ts
│       │   ├── main.tsx
│       │   └── pages
│       │       ├── Dashboard.tsx
│       │       └── not-found.tsx
│       ├── tsconfig.json
│       ├── vite-mock-api.ts
│       └── vite.config.ts
├── lib
│   ├── api-client-react
│   │   ├── package.json
│   │   ├── src
│   │   │   ├── custom-fetch.ts
│   │   │   ├── generated
│   │   │   │   ├── api.schemas.ts
│   │   │   │   └── api.ts
│   │   │   └── index.ts
│   │   └── tsconfig.json
│   ├── api-spec
│   │   ├── openapi.yaml
│   │   ├── orval.config.ts
│   │   └── package.json
│   ├── api-zod
│   │   ├── package.json
│   │   ├── src
│   │   │   ├── generated
│   │   │   │   ├── api.ts
│   │   │   │   └── types
│   │   │   │       ├── alert.ts
│   │   │   │       ├── forecastResult.ts
│   │   │   │       ├── forecastResultForecastItem.ts
│   │   │   │       ├── getForecastParams.ts
│   │   │   │       ├── getPredictionParams.ts
│   │   │   │       ├── globalSummary.ts
│   │   │   │       ├── healthStatus.ts
│   │   │   │       ├── index.ts
│   │   │   │       ├── predictionResult.ts
│   │   │   │       ├── predictionResultFeatures.ts
│   │   │   │       ├── predictionResultPredictedRiskLevel.ts
│   │   │   │       ├── riskEvent.ts
│   │   │   │       ├── riskEventCategory.ts
│   │   │   │       ├── riskEventRiskLevel.ts
│   │   │   │       └── riskHistoryPoint.ts
│   │   │   └── index.ts
│   │   └── tsconfig.json
│   └── db
│       ├── drizzle.config.ts
│       ├── package.json
│       ├── src
│       │   ├── index.ts
│       │   └── schema
│       │       ├── index.ts
│       │       └── riskEvents.ts
│       └── tsconfig.json
├── package.json
├── pnpm-lock.yaml
├── pnpm-workspace.yaml
├── scripts
│   ├── package.json
│   ├── post-merge.sh
│   ├── src
│   │   └── hello.ts
│   └── tsconfig.json
├── tree.md
├── tsconfig.base.json
└── tsconfig.json
