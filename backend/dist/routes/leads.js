"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.leadsRouter = void 0;
const express_1 = __importDefault(require("express"));
const zod_1 = require("zod");
const supabase_1 = require("../config/supabase");
const LeadCreateSchema = zod_1.z.object({
    email: zod_1.z.string().trim().toLowerCase().email(),
    shareId: zod_1.z.string().trim().min(3).max(64).optional(),
    source: zod_1.z.enum(["results", "share", "unknown"]).optional().default("unknown"),
    // Honeypot field: should be empty for real users.
    honeypot: zod_1.z.string().optional(),
});
exports.leadsRouter = express_1.default.Router();
exports.leadsRouter.post("/", async (req, res) => {
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
    const { data, error } = await supabase_1.supabase
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
        if (error?.code === "23505") {
            return res.status(200).json({ ok: true, lead: null, deduped: true });
        }
        return res.status(500).json({ error: `Failed to create lead: ${error.message}` });
    }
    return res.status(201).json({ ok: true, lead: data ?? null });
});
