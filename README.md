# Crisis-Scope

Real-time global crisis monitoring and analysis system.

## Run locally

1. Install dependencies with `pnpm install`.
2. Add your environment variables in a local `.env` file.
3. Start the API with `pnpm dev:api`.
4. In a second terminal, start the dashboard with `pnpm dev:dashboard`.

The Vite dashboard proxies `/api` requests to `http://localhost:8080` in development.

## Production build

Run:

```bash
pnpm build
```

This builds the dashboard into `artifacts/api-server/dist/public` and builds the API server into `artifacts/api-server/dist`.

Start production with:

```bash
pnpm start
```

The API server will serve both:

- `/api/*` for backend endpoints
- `/` for the built dashboard

## Deployment notes

- Set `PORT` in the deployment environment.
- Set `DATABASE_URL`, `NEWS_API_KEY`, `OPENWEATHER_API_KEY`, and `GEMINI_API_KEY`.
- Use the root build command `pnpm build`.
- Use the root start command `pnpm start`.
