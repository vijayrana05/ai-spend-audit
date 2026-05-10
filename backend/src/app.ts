import express from "express";
import cors from "cors";

import { auditsRouter } from "./routes/audits";
import { shareRouter } from "./routes/share";
import { sharePageRouter } from "./routes/sharePage";
import { narrativeRouter } from "./routes/narrative";
import { leadsRouter } from "./routes/leads";
import {
  leadsLimiter,
  narrativeLimiter,
  shareCreateLimiter,
  shareReadLimiter,
} from "./middleware/rateLimit";

export function createApp() {
  const app = express();

  app.use(cors());
  app.use(express.json({ limit: "1mb" }));

  app.get("/health", (_req, res) => {
    res.status(200).json({ ok: true });
  });

  // OG tags need to be served from backend, not from a Vite SPA.
  app.use("/share", sharePageRouter);

  app.use("/api/audits", shareCreateLimiter, auditsRouter);
  app.use("/api/share", shareReadLimiter, shareRouter);
  app.use("/api/narrative", narrativeLimiter, narrativeRouter);
  app.use("/api/leads", leadsLimiter, leadsRouter);

  return app;
}
