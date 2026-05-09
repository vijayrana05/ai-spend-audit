"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.shareRouter = void 0;
const express_1 = require("express");
const shareStore_1 = require("../services/shareStore");
exports.shareRouter = (0, express_1.Router)();
exports.shareRouter.get("/:id", async (req, res) => {
    const id = req.params.id;
    try {
        const record = await shareStore_1.shareStore.get(id);
        if (!record)
            return res.status(404).json({ error: "Not found" });
        return res.status(200).json({
            id: record.id,
            createdAt: record.createdAt,
            auditResult: record.auditResult,
        });
    }
    catch {
        return res.status(500).json({ error: "Failed to fetch shared audit" });
    }
});
