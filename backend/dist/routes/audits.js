"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.auditsRouter = void 0;
const express_1 = require("express");
const zod_1 = require("zod");
const shareStore_1 = require("../services/shareStore");
exports.auditsRouter = (0, express_1.Router)();
// For Phase 3, frontend sends an already-sanitized AuditResult.
// In Phase 4/5, backend should compute audit from inputs and persist to DB.
const CreateAuditBodySchema = zod_1.z.object({
    auditResult: zod_1.z.unknown(),
});
exports.auditsRouter.post("/", async (req, res) => {
    const parsed = CreateAuditBodySchema.safeParse(req.body);
    if (!parsed.success) {
        return res.status(400).json({ error: "Invalid request body" });
    }
    try {
        const record = await shareStore_1.shareStore.create(parsed.data.auditResult);
        return res.status(201).json({
            shareId: record.id,
            sharePath: `/share/${record.id}`,
        });
    }
    catch {
        return res.status(500).json({ error: "Failed to create shareable audit" });
    }
});
