import rateLimit from "express-rate-limit";

/**
 * Basic abuse protection for public endpoints.
 * NOTE: In multi-instance deployments, prefer a shared store (Redis/Upstash).
 */
export function createStandardLimiter(options?: {
  windowMs?: number;
  max?: number;
}) {
  return rateLimit({
    windowMs: options?.windowMs ?? 60_000,
    max: options?.max ?? 60,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: "Too many requests. Please try again shortly." },
  });
}

export const narrativeLimiter = createStandardLimiter({ windowMs: 60_000, max: 12 });
export const leadsLimiter = createStandardLimiter({ windowMs: 60_000, max: 10 });
export const shareReadLimiter = createStandardLimiter({ windowMs: 60_000, max: 120 });
export const shareCreateLimiter = createStandardLimiter({ windowMs: 60_000, max: 30 });
