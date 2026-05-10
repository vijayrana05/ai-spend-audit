import express from "express";
import { z } from "zod";
import { supabase } from "../config/supabase";

const LeadCreateSchema = z.object({
  email: z.string().trim().toLowerCase().email(),
  shareId: z.string().trim().min(3).max(64).optional(),
  source: z.enum(["results", "share", "unknown"]).optional().default("unknown"),
  // Honeypot field: should be empty for real users.
  honeypot: z.string().optional(),
});

export const leadsRouter = express.Router();

leadsRouter.post("/", async (req, res) => {
  const parsed = LeadCreateSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: "Invalid request", details: parsed.error.flatten() });
  }

  const { email, shareId, source, honeypot } = parsed.data;

  // Basic spam protection: if honeypot has content, pretend it's ok.
  if (honeypot && honeypot.trim().length > 0) {
    return res.status(201).json({ ok: true, lead: null });
  }

  // Note: This uses the backend service role key.
  // Keep RLS policies strict (or keep this table RLS enabled and only accessible via backend).
  const { data, error } = await supabase
    .from("leads")
    .insert({
      email,
      share_id: shareId ?? null,
      source,
    })
    .select("id, created_at")
    .maybeSingle();

  if (error) {
    // Handle duplicate email gracefully if unique index is present.
    if ((error as any)?.code === "23505") {
      return res.status(200).json({ ok: true, lead: null, deduped: true });
    }
    return res.status(500).json({ error: `Failed to create lead: ${error.message}` });
  }

  return res.status(201).json({ ok: true, lead: data ?? null });
});
