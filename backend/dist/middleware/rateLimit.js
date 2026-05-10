"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.shareCreateLimiter = exports.shareReadLimiter = exports.leadsLimiter = exports.narrativeLimiter = void 0;
exports.createStandardLimiter = createStandardLimiter;
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
/**
 * Basic abuse protection for public endpoints.
 * NOTE: In multi-instance deployments, prefer a shared store (Redis/Upstash).
 */
function createStandardLimiter(options) {
    return (0, express_rate_limit_1.default)({
        windowMs: options?.windowMs ?? 60_000,
        max: options?.max ?? 60,
        standardHeaders: true,
        legacyHeaders: false,
        message: { error: "Too many requests. Please try again shortly." },
    });
}
exports.narrativeLimiter = createStandardLimiter({ windowMs: 60_000, max: 12 });
exports.leadsLimiter = createStandardLimiter({ windowMs: 60_000, max: 10 });
exports.shareReadLimiter = createStandardLimiter({ windowMs: 60_000, max: 120 });
exports.shareCreateLimiter = createStandardLimiter({ windowMs: 60_000, max: 30 });
