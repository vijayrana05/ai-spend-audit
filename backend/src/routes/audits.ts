import { Router } from "express";
import { z } from "zod";
import { shareStore } from "../services/shareStore";

export const auditsRouter = Router();

// For Phase 3, frontend sends an already-sanitized AuditResult.
// In Phase 4/5, backend should compute audit from inputs and persist to DB.
const CreateAuditBodySchema = z.object({
  auditResult: z.unknown(),
});

auditsRouter.post("/", async (req, res) => {
  const parsed = CreateAuditBodySchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: "Invalid request body" });
  }

  try {
    const record = await shareStore.create(parsed.data.auditResult);

    return res.status(201).json({
      shareId: record.id,
      sharePath: `/share/${record.id}`,
    });
  } catch {
    return res.status(500).json({ error: "Failed to create shareable audit" });
  }
});
