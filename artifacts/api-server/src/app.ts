import express from "express";
import cors from "cors";
import { pinoHttp } from "pino-http";
import router from "./routes";
import { logger } from "./lib/logger";

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

import { startScheduler } from "./scheduler";

app.get("/", (_req, res) => {
  res.json({ status: "ok", message: "Crisis Scope API is running", docs: "/api/healthz" });
});

app.use("/api", router);


// Start background jobs
startScheduler();

export default app;
