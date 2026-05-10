import { Router } from "express";
import { z } from "zod";
import { generateNarrativeSummary, GEMINI_MODEL } from "../services/geminiNarrative";
import { supabase } from "../config/supabase";
import { NARRATIVE_PROMPT_VERSION } from "../types/narrative";

export const narrativeRouter = Router();

const BodySchema = z.object({
  shareId: z.string().min(1),
});

const NarrativeSummarySchema = z.object({
  executiveSummary: z.string(),
  topFindings: z.array(
    z.object({
      title: z.string(),
      detail: z.string(),
      impactUsdMonthly: z.number().optional(),
    })
  ),
  actionPlan: z.array(
    z.object({
      step: z.string(),
      owner: z.enum(["finance", "engineering", "it", "founder", "other"]),
    })
  ),
  assumptionsAndCaveats: z.array(z.string()),
  disclaimer: z.string(),
});

function buildRepairPrompt(output: unknown) {
  return (
    "Rewrite the following JSON so it EXACTLY matches the required schema. " +
    "Return ONLY valid JSON. No Markdown. No code fences.\n\n" +
    "Schema:\n" +
    "{\n" +
    "  executiveSummary: string,\n" +
    "  topFindings: Array<{ title: string; detail: string; impactUsdMonthly?: number }>,\n" +
    "  actionPlan: Array<{ step: string; owner: 'finance'|'engineering'|'it'|'founder'|'other' }>,\n" +
    "  assumptionsAndCaveats: string[],\n" +
    "  disclaimer: string\n" +
    "}\n\n" +
    "INPUT_JSON:\n" +
    JSON.stringify(output)
  );
}

/**
 * Phase 4: generate (or return cached) narrative summary for a shared audit.
 */
narrativeRouter.post("/", async (req, res) => {
  const parsed = BodySchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "Invalid request body" });

  const { shareId } = parsed.data;

  // Fetch audit payload
  const { data, error } = await supabase
    .from("public_audits")
    .select("id, audit_result, narrative_summary, narrative_model, narrative_prompt_version")
    .eq("id", shareId)
    .maybeSingle();

  if (error) {
    // eslint-disable-next-line no-console
    console.error("/api/narrative: failed to load audit", { shareId, error });
    return res.status(500).json({ error: "Failed to load audit" });
  }
  if (!data) return res.status(404).json({ error: "Not found" });

  // Cache hit
  if (data.narrative_summary) {
    return res.status(200).json({
      shareId,
      model: data.narrative_model ?? GEMINI_MODEL,
      promptVersion: data.narrative_prompt_version ?? NARRATIVE_PROMPT_VERSION,
      narrativeSummary: data.narrative_summary,
      cached: true,
    });
  }

  try {
    let summary: unknown = await generateNarrativeSummary({ mode: "audit", auditResult: data.audit_result });

    // Validate output shape; if invalid, try one repair pass.
    const validated = NarrativeSummarySchema.safeParse(summary);
    if (!validated.success) {
      // eslint-disable-next-line no-console
      console.warn("/api/narrative: summary failed schema validation, attempting repair", {
        shareId,
        issues: validated.error.issues,
      });

      summary = await generateNarrativeSummary({ mode: "repair", repairPrompt: buildRepairPrompt(summary) });

      const validated2 = NarrativeSummarySchema.safeParse(summary);
      if (!validated2.success) {
        // eslint-disable-next-line no-console
        console.error("/api/narrative: repair failed schema validation", { shareId, issues: validated2.error.issues });
        return res.status(500).json({ error: "Narrative summary returned invalid schema" });
      }

      summary = validated2.data;
    } else {
      summary = validated.data;
    }

    const { error: updateError } = await supabase
      .from("public_audits")
      .update({
        narrative_summary: summary as any,
        narrative_model: GEMINI_MODEL,
        narrative_prompt_version: NARRATIVE_PROMPT_VERSION,
        narrative_created_at: new Date().toISOString(),
      })
      .eq("id", shareId);

    if (updateError) {
      // eslint-disable-next-line no-console
      console.error("/api/narrative: failed to persist narrative", { shareId, updateError });
      return res.status(500).json({ error: "Failed to persist narrative" });
    }

    return res.status(200).json({
      shareId,
      model: GEMINI_MODEL,
      promptVersion: NARRATIVE_PROMPT_VERSION,
      narrativeSummary: summary,
      cached: false,
    });
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error("/api/narrative: generation failed", { shareId, error: e });
    return res.status(500).json({ error: e instanceof Error ? e.message : "Failed to generate narrative" });
  }
});
