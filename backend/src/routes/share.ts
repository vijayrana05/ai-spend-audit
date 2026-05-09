import { Router } from "express";
import { shareStore } from "../services/shareStore";

export const shareRouter = Router();

shareRouter.get("/:id", async (req, res) => {
  const id = req.params.id;

  try {
    const record = await shareStore.get(id);
    if (!record) return res.status(404).json({ error: "Not found" });

    return res.status(200).json({
      id: record.id,
      createdAt: record.createdAt,
      auditResult: record.auditResult,
    });
  } catch {
    return res.status(500).json({ error: "Failed to fetch shared audit" });
  }
});
