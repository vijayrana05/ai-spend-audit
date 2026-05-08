import type { AuditDraft, ToolKey, ToolPlanId, ToolSpendInput } from "@/types/audit";
import { PRICING, type PricingEntry } from "@/audit/pricing";

export type RecommendationAction = "keep" | "downgrade" | "switch" | "credits";

export interface AuditRecommendation {
  action: RecommendationAction;
  recommendedPlanId?: ToolPlanId;
  recommendedTool?: ToolKey;
}

export interface AuditItem {
  tool: ToolKey;
  current: {
    planId: ToolPlanId;
    seats: number;
    monthlySpendUsd: number;
  };
  recommendation: AuditRecommendation;
  estimatedSavingsMonthlyUsd: number;
  explanation: string;
  sources: Array<{ url: string; verifiedAt: string }>;
}

export interface AuditResult {
  totals: {
    currentMonthlySpendUsd: number;
    estimatedSavingsMonthlyUsd: number;
    estimatedSavingsAnnualUsd: number;
  };
  items: AuditItem[];
}

function toPositiveInt(value: string, fallback: number) {
  const n = Number.parseInt(value, 10);
  if (!Number.isFinite(n) || n <= 0) return fallback;
  return n;
}

function toNonNegativeMoney(value: string) {
  const n = Number.parseFloat(value);
  if (!Number.isFinite(n) || n < 0) return 0;
  return Math.round(n * 100) / 100;
}

function sourceForPlan(planId: ToolPlanId) {
  const entry = PRICING[planId];
  return [{ url: entry.officialUrl, verifiedAt: entry.verifiedAt }];
}

function estimatePlanCost(planId: ToolPlanId, seats: number): number | null {
  const entry = PRICING[planId];
  if (entry.priceMonthlyUsd == null) return null;
  if (entry.billingUnit === "per_seat") return entry.priceMonthlyUsd * seats;
  if (entry.billingUnit === "flat") return entry.priceMonthlyUsd;
  return null;
}

function clampSavings(current: number, recommended: number | null) {
  if (recommended == null) return 0;
  return Math.max(0, Math.round((current - recommended) * 100) / 100);
}

function buildDefaultKeep(tool: ToolKey, input: ToolSpendInput): AuditItem {
  const seats = toPositiveInt(input.seats, 1);
  const monthlySpendUsd = toNonNegativeMoney(input.monthlySpend);

  return {
    tool,
    current: { planId: input.planId, seats, monthlySpendUsd },
    recommendation: { action: "keep" },
    estimatedSavingsMonthlyUsd: 0,
    explanation: "No obvious savings found based on your current inputs.",
    sources: sourceForPlan(input.planId),
  };
}

/**
 * Phase 2: deterministic, rule-based audit (no LLM).
 * We treat user-entered monthly spend as canonical for "current spend".
 */
export function runAudit(draft: AuditDraft): AuditResult {
  const items: AuditItem[] = draft.tools.map((t) => {
    const tool = t.tool;
    const seats = toPositiveInt(t.seats, 1);
    const currentSpend = toNonNegativeMoney(t.monthlySpend);

    // Base item
    let best: AuditItem = buildDefaultKeep(tool, t);

    // Rule: ChatGPT Team for very small seat count → compare to Plus
    if (t.planId === "chatgpt_team" && seats <= 2) {
      const plusCost = estimatePlanCost("chatgpt_plus", seats);
      const savings = clampSavings(currentSpend, plusCost);
      if (savings > 0 && plusCost != null) {
        best = {
          tool,
          current: { planId: t.planId, seats, monthlySpendUsd: currentSpend },
          recommendation: { action: "downgrade", recommendedPlanId: "chatgpt_plus" },
          estimatedSavingsMonthlyUsd: savings,
          explanation:
            "For small teams, ChatGPT Team often costs more than individual Plus seats without adding meaningful value.",
          sources: [...sourceForPlan("chatgpt_team"), ...sourceForPlan("chatgpt_plus")],
        };
      }
    }

    // Rule: Copilot Business for 1 seat → compare to Individual
    if (t.planId === "copilot_business" && seats === 1) {
      const individualCost = estimatePlanCost("copilot_individual", 1);
      const savings = clampSavings(currentSpend, individualCost);
      if (savings > 0 && individualCost != null) {
        best = {
          tool,
          current: { planId: t.planId, seats, monthlySpendUsd: currentSpend },
          recommendation: { action: "downgrade", recommendedPlanId: "copilot_individual" },
          estimatedSavingsMonthlyUsd: savings,
          explanation:
            "If you don’t need org-wide policy controls, Copilot Individual is typically cheaper for a single seat.",
          sources: [...sourceForPlan("copilot_business"), ...sourceForPlan("copilot_individual")],
        };
      }
    }

    // Rule: Cursor Business for <= 2 seats → compare to Pro
    if (t.planId === "cursor_business" && seats <= 2) {
      const proCost = estimatePlanCost("cursor_pro", seats);
      const savings = clampSavings(currentSpend, proCost);
      if (savings > 0 && proCost != null) {
        best = {
          tool,
          current: { planId: t.planId, seats, monthlySpendUsd: currentSpend },
          recommendation: { action: "downgrade", recommendedPlanId: "cursor_pro" },
          estimatedSavingsMonthlyUsd: savings,
          explanation:
            "For small teams, Cursor Pro is often more cost-effective than Business unless you need advanced admin controls.",
          sources: [...sourceForPlan("cursor_business"), ...sourceForPlan("cursor_pro")],
        };
      }
    }

    // Rule: API direct spend → Credex credits estimate (conservative 10%)
    if (t.planId === "openai_api" || t.planId === "anthropic_api" || t.planId === "chatgpt_api" || t.planId === "claude_api") {
      const discountRate = 0.1;
      const savings = Math.round(currentSpend * discountRate * 100) / 100;
      if (savings >= 50) {
        // Only trigger when meaningful; otherwise we keep.
        best = {
          tool,
          current: { planId: t.planId, seats, monthlySpendUsd: currentSpend },
          recommendation: { action: "credits" },
          estimatedSavingsMonthlyUsd: savings,
          explanation:
            "If most of this is API usage, discounted credits can often reduce your effective monthly cost (estimate uses a conservative 10%).",
          sources: sourceForPlan(t.planId),
        };
      }
    }

    return best;
  });

  const currentMonthlySpendUsd = Math.round(items.reduce((sum, i) => sum + i.current.monthlySpendUsd, 0) * 100) / 100;
  const estimatedSavingsMonthlyUsd = Math.round(items.reduce((sum, i) => sum + i.estimatedSavingsMonthlyUsd, 0) * 100) / 100;
  const estimatedSavingsAnnualUsd = Math.round(estimatedSavingsMonthlyUsd * 12 * 100) / 100;

  return {
    totals: { currentMonthlySpendUsd, estimatedSavingsMonthlyUsd, estimatedSavingsAnnualUsd },
    items,
  };
}

export function getPricingEntry(planId: ToolPlanId): PricingEntry {
  return PRICING[planId];
}
