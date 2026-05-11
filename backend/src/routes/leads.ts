import express from "express";
import { z } from "zod";
import { supabase } from "../config/supabase";
import { sendLeadConfirmationEmail } from "../services/email";

const LeadCreateSchema = z.object({
  email: z.string().trim().toLowerCase().email(),
  shareId: z.string().trim().min(3).max(64).optional(),
  source: z.enum(["results", "share", "unknown"]).optional().default("unknown"),
  // Honeypot field: should be empty for real users.
  honeypot: z.string().optional(),
  // Optional fields
  company: z.string().trim().min(1).max(120).optional(),
  role: z.string().trim().min(1).max(120).optional(),
});

export const leadsRouter = express.Router();

leadsRouter.post("/", async (req, res) => {
  const parsed = LeadCreateSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: "Invalid request", details: parsed.error.flatten() });
  }

  const { email, shareId, source, honeypot, company, role } = parsed.data;

  // Basic spam protection: if honeypot has content, pretend it's ok.
  if (honeypot && honeypot.trim().length > 0) {
    return res.status(201).json({ ok: true, lead: null });
  }

  const { data, error } = await supabase
    .from("leads")
    .insert({
      email,
      share_id: shareId ?? null,
      source,
      company: company ?? null,
      role: role ?? null,
    })
    .select("id, created_at")
    .maybeSingle();

  if (error) {
    if ((error as any)?.code === "23505") {
      // duplicate email (unique index). still send email confirmation to be helpful.
      try {
        await sendLeadConfirmationEmail({ toEmail: email, shareId });
      } catch {
        // ignore email failures
      }
      return res.status(200).json({ ok: true, lead: null, deduped: true });
    }
    return res.status(500).json({ error: `Failed to create lead: ${error.message}` });
  }

  // Optional: pull quick savings context (best-effort)
  let savingsMonthly: number | undefined = undefined;
  if (shareId) {
    const { data: auditRow } = await supabase
      .from("public_audits")
      .select("audit_result")
      .eq("id", shareId)
      .maybeSingle();

    savingsMonthly = auditRow?.audit_result?.totals?.estimatedSavingsMonthlyUsd;
  }

  try {
    await sendLeadConfirmationEmail({ toEmail: email, shareId, estimatedSavingsMonthlyUsd: savingsMonthly });
  } catch (e) {
    // eslint-disable-next-line no-console
    console.warn("Lead created but confirmation email failed", { email, error: e });
  }

  return res.status(201).json({ ok: true, lead: data ?? null });
});
