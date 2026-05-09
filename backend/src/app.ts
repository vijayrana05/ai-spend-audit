import express from "express";
import cors from "cors";

import { auditsRouter } from "./routes/audits";
import { shareRouter } from "./routes/share";
import { sharePageRouter } from "./routes/sharePage";

export function createApp() {
  const app = express();

  app.use(cors());
  app.use(express.json({ limit: "1mb" }));

  app.get("/health", (_req, res) => {
    res.status(200).json({ ok: true });
  });

  // OG tags need to be served from backend, not from a Vite SPA.
  app.use("/share", sharePageRouter);

  app.use("/api/audits", auditsRouter);
  app.use("/api/share", shareRouter);

  return app;
}
