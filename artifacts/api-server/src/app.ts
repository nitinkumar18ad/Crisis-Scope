import express from "express";
import cors from "cors";
import { pinoHttp } from "pino-http";
import router from "./routes";
import { logger } from "./lib/logger";
import { checkDbConnection } from "./db-resolver";

const app = express();

app.use(
  pinoHttp({
    logger,
    serializers: {
      req(req: Record<string, unknown>) {
        return {
          id: req.id,
          method: req.method,
          url: (req.url as string)?.split("?")[0],
        };
      },
      res(res: Record<string, unknown>) {
        return {
          statusCode: res.statusCode,
        };
      },
    },
  }),
);
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Default to mock DB; will be updated after connection check
app.locals.useRealDb = false;

app.get("/", (_req, res) => {
  res.json({ status: "ok", message: "Crisis Scope API is running", docs: "/api/healthz" });
});

app.use("/api", router);

// Initialise DB connection and start background jobs
(async () => {
  const isReal = await checkDbConnection();
  app.locals.useRealDb = isReal;

  if (isReal) {
    logger.info("Using real PostgreSQL database");
  } else {
    logger.info("Using mock in-memory database (offline mode)");
  }

  const { startScheduler } = await import("./scheduler");
  startScheduler(isReal);
})();

export default app;
