"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.narrativeRouter = void 0;
const express_1 = require("express");
const zod_1 = require("zod");
const geminiNarrative_1 = require("../services/geminiNarrative");
const supabase_1 = require("../config/supabase");
const narrative_1 = require("../types/narrative");
exports.narrativeRouter = (0, express_1.Router)();
const BodySchema = zod_1.z.object({
    shareId: zod_1.z.string().min(1),
});
const NarrativeSummarySchema = zod_1.z.object({
    executiveSummary: zod_1.z.string(),
    topFindings: zod_1.z.array(zod_1.z.object({
        title: zod_1.z.string(),
        detail: zod_1.z.string(),
        impactUsdMonthly: zod_1.z.number().optional(),
    })),
    actionPlan: zod_1.z.array(zod_1.z.object({
        step: zod_1.z.string(),
        owner: zod_1.z.enum(["finance", "engineering", "it", "founder", "other"]),
    })),
    assumptionsAndCaveats: zod_1.z.array(zod_1.z.string()),
    disclaimer: zod_1.z.string(),
});
function buildRepairPrompt(output) {
    return ("Rewrite the following JSON so it EXACTLY matches the required schema. " +
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
        JSON.stringify(output));
}
/**
 * Phase 4: generate (or return cached) narrative summary for a shared audit.
 */
exports.narrativeRouter.post("/", async (req, res) => {
    const parsed = BodySchema.safeParse(req.body);
    if (!parsed.success)
        return res.status(400).json({ error: "Invalid request body" });
    const { shareId } = parsed.data;
    // Fetch audit payload
    const { data, error } = await supabase_1.supabase
        .from("public_audits")
        .select("id, audit_result, narrative_summary, narrative_model, narrative_prompt_version")
        .eq("id", shareId)
        .maybeSingle();
    if (error) {
        // eslint-disable-next-line no-console
        console.error("/api/narrative: failed to load audit", { shareId, error });
        return res.status(500).json({ error: "Failed to load audit" });
    }
    if (!data)
        return res.status(404).json({ error: "Not found" });
    // Cache hit
    if (data.narrative_summary) {
        return res.status(200).json({
            shareId,
            model: data.narrative_model ?? geminiNarrative_1.GEMINI_MODEL,
            promptVersion: data.narrative_prompt_version ?? narrative_1.NARRATIVE_PROMPT_VERSION,
            narrativeSummary: data.narrative_summary,
            cached: true,
        });
    }
    try {
        let summary = await (0, geminiNarrative_1.generateNarrativeSummary)({ mode: "audit", auditResult: data.audit_result });
        // Validate output shape; if invalid, try one repair pass.
        const validated = NarrativeSummarySchema.safeParse(summary);
        if (!validated.success) {
            // eslint-disable-next-line no-console
            console.warn("/api/narrative: summary failed schema validation, attempting repair", {
                shareId,
                issues: validated.error.issues,
            });
            summary = await (0, geminiNarrative_1.generateNarrativeSummary)({ mode: "repair", repairPrompt: buildRepairPrompt(summary) });
            const validated2 = NarrativeSummarySchema.safeParse(summary);
            if (!validated2.success) {
                // eslint-disable-next-line no-console
                console.error("/api/narrative: repair failed schema validation", { shareId, issues: validated2.error.issues });
                return res.status(500).json({ error: "Narrative summary returned invalid schema" });
            }
            summary = validated2.data;
        }
        else {
            summary = validated.data;
        }
        const { error: updateError } = await supabase_1.supabase
            .from("public_audits")
            .update({
            narrative_summary: summary,
            narrative_model: geminiNarrative_1.GEMINI_MODEL,
            narrative_prompt_version: narrative_1.NARRATIVE_PROMPT_VERSION,
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
            model: geminiNarrative_1.GEMINI_MODEL,
            promptVersion: narrative_1.NARRATIVE_PROMPT_VERSION,
            narrativeSummary: summary,
            cached: false,
        });
    }
    catch (e) {
        // eslint-disable-next-line no-console
        console.error("/api/narrative: generation failed", { shareId, error: e });
        return res.status(500).json({ error: e instanceof Error ? e.message : "Failed to generate narrative" });
    }
});
