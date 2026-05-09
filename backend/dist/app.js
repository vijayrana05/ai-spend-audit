"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createApp = createApp;
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const audits_1 = require("./routes/audits");
const share_1 = require("./routes/share");
const sharePage_1 = require("./routes/sharePage");
function createApp() {
    const app = (0, express_1.default)();
    app.use((0, cors_1.default)());
    app.use(express_1.default.json({ limit: "1mb" }));
    app.get("/health", (_req, res) => {
        res.status(200).json({ ok: true });
    });
    // OG tags need to be served from backend, not from a Vite SPA.
    app.use("/share", sharePage_1.sharePageRouter);
    app.use("/api/audits", audits_1.auditsRouter);
    app.use("/api/share", share_1.shareRouter);
    return app;
}
