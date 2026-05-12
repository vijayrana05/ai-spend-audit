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
 * Returns true when the user's reported spend exceeds the catalogue price by
 * more than the given multiplier. Used to surface billing anomalies.
 * e.g. multiplier 1.15 = 15% over expected cost.
 */
function isOverpaying(
  currentSpend: number,
  planId: ToolPlanId,
  seats: number,
  multiplier = 1.15,
): boolean {
  const expected = estimatePlanCost(planId, seats);
  if (expected == null || expected === 0) return false;
  return currentSpend > expected * multiplier;
}

/**
 * Builds an overpayment anomaly item. The action is "keep" because we can't
 * recommend a specific plan — we're flagging a billing discrepancy.
 */
function buildOverpaymentItem(
  tool: ToolKey,
  planId: ToolPlanId,
  seats: number,
  currentSpend: number,
  expectedSpend: number,
): AuditItem {
  const overage = Math.round((currentSpend - expectedSpend) * 100) / 100;
  return {
    tool,
    current: { planId, seats, monthlySpendUsd: currentSpend },
    recommendation: { action: "keep" },
    estimatedSavingsMonthlyUsd: overage,
    explanation: `Your reported spend ($${currentSpend}/mo) is notably higher than the catalogue price of $${expectedSpend}/mo for ${seats} seat(s). This may indicate unused seats, a billing error, or add-ons. Review your invoice to confirm.`,
    sources: sourceForPlan(planId),
  };
}

/**
 * Phase 2: deterministic, rule-based audit (no LLM).
 * We treat user-entered monthly spend as canonical for "current spend".
 *
 * Rule evaluation order matters: more specific / higher-savings rules run
 * first so that `best` is set to the most impactful recommendation.
 * Each rule only replaces `best` if its savings exceed the current `best`.
 */
export function runAudit(draft: AuditDraft): AuditResult {
  const items: AuditItem[] = draft.tools.map((t) => {
    const tool = t.tool;
    const seats = toPositiveInt(t.seats, 1);
    const currentSpend = toNonNegativeMoney(t.monthlySpend);

    // Base item — replaced by any rule that finds real savings.
    let best: AuditItem = buildDefaultKeep(tool, t);

    // Helper: only update `best` when this rule's savings beat the current best.
    function tryUpdate(candidate: AuditItem) {
      if (candidate.estimatedSavingsMonthlyUsd > best.estimatedSavingsMonthlyUsd) {
        best = candidate;
      }
    }

    // ─────────────────────────────────────────────
    // SECTION 1 — ChatGPT / OpenAI subscription rules
    // ─────────────────────────────────────────────

    // Rule 1a: ChatGPT Team → Plus
    // Team ($30/seat) vs Plus ($20/seat): Plus lacks shared workspace & longer
    // context window, but for ≤3 seats those admin features are rarely needed.
    if (t.planId === "chatgpt_team" && seats <= 3) {
      const plusCost = estimatePlanCost("chatgpt_plus", seats);
      const savings = clampSavings(currentSpend, plusCost);
      if (savings > 0 && plusCost != null) {
        tryUpdate({
          tool,
          current: { planId: t.planId, seats, monthlySpendUsd: currentSpend },
          recommendation: { action: "downgrade", recommendedPlanId: "chatgpt_plus" },
          estimatedSavingsMonthlyUsd: savings,
          explanation:
            `ChatGPT Team costs $30/seat vs Plus at $20/seat. For ${seats} seat(s) you could save ~$${savings}/mo by switching to individual Plus subscriptions — unless you actively rely on shared custom GPTs or the higher context window.`,
          sources: [...sourceForPlan("chatgpt_team"), ...sourceForPlan("chatgpt_plus")],
        });
      }
    }

    // ─────────────────────────────────────────────
    // SECTION 2 — GitHub Copilot rules
    // ─────────────────────────────────────────────

    // Rule 2a: Copilot Business for 1–2 seats → Individual
    // Business ($19/seat) vs Individual ($10/seat). Org policy controls and
    // IP indemnity are only meaningful for larger teams.
    if (t.planId === "copilot_business" && seats <= 2) {
      const individualCost = estimatePlanCost("copilot_individual", seats);
      const savings = clampSavings(currentSpend, individualCost);
      if (savings > 0 && individualCost != null) {
        tryUpdate({
          tool,
          current: { planId: t.planId, seats, monthlySpendUsd: currentSpend },
          recommendation: { action: "downgrade", recommendedPlanId: "copilot_individual" },
          estimatedSavingsMonthlyUsd: savings,
          explanation:
            `Copilot Business costs $19/seat vs Individual at $10/seat. For ${seats} seat(s) the org-wide policy controls and IP indemnity rarely justify the premium — switching saves ~$${savings}/mo.`,
          sources: [...sourceForPlan("copilot_business"), ...sourceForPlan("copilot_individual")],
        });
      }
    }

    // Rule 2b: Copilot Enterprise for ≤5 seats → Business
    // Enterprise ($39/seat) targets large orgs needing Bing-powered chat and
    // pull-request summaries. Small teams almost never use these features.
    if (t.planId === "copilot_enterprise" && seats <= 5) {
      const businessCost = estimatePlanCost("copilot_business", seats);
      const savings = clampSavings(currentSpend, businessCost);
      if (savings > 0 && businessCost != null) {
        tryUpdate({
          tool,
          current: { planId: t.planId, seats, monthlySpendUsd: currentSpend },
          recommendation: { action: "downgrade", recommendedPlanId: "copilot_business" },
          estimatedSavingsMonthlyUsd: savings,
          explanation:
            `Copilot Enterprise ($39/seat) adds Bing-powered chat and PR summaries designed for large orgs. For ${seats} seat(s), Copilot Business ($19/seat) covers all core coding features and saves ~$${savings}/mo.`,
          sources: [...sourceForPlan("copilot_enterprise"), ...sourceForPlan("copilot_business")],
        });
      }
    }

    // ─────────────────────────────────────────────
    // SECTION 3 — Cursor rules
    // ─────────────────────────────────────────────

    // Rule 3a: Cursor Business for ≤3 seats → Pro
    // Business ($40/seat) vs Pro ($20/seat). The Business plan adds SSO,
    // audit logs, and centralised billing — rarely needed below 4 seats.
    if (t.planId === "cursor_business" && seats <= 3) {
      const proCost = estimatePlanCost("cursor_pro", seats);
      const savings = clampSavings(currentSpend, proCost);
      if (savings > 0 && proCost != null) {
        tryUpdate({
          tool,
          current: { planId: t.planId, seats, monthlySpendUsd: currentSpend },
          recommendation: { action: "downgrade", recommendedPlanId: "cursor_pro" },
          estimatedSavingsMonthlyUsd: savings,
          explanation:
            `Cursor Business ($40/seat) adds SSO and audit logs that are rarely needed for ${seats} seat(s). Cursor Pro ($20/seat) has the same AI model access and saves ~$${savings}/mo.`,
          sources: [...sourceForPlan("cursor_business"), ...sourceForPlan("cursor_pro")],
        });
      }
    }

    // Rule 3b: Cursor Pro for ≤2 seats → consider Windsurf Pro as a cheaper switch
    // Windsurf Pro ($15/seat) vs Cursor Pro ($20/seat). Core AI coding features
    // are comparable; this is a "switch" rather than a "downgrade".
    if (t.planId === "cursor_pro" && seats <= 2) {
      const windsurfCost = estimatePlanCost("windsurf_pro", seats);
      const savings = clampSavings(currentSpend, windsurfCost);
      if (savings > 0 && windsurfCost != null) {
        tryUpdate({
          tool,
          current: { planId: t.planId, seats, monthlySpendUsd: currentSpend },
          recommendation: { action: "switch", recommendedPlanId: "windsurf_pro", recommendedTool: "windsurf" as ToolKey },
          estimatedSavingsMonthlyUsd: savings,
          explanation:
            `Windsurf Pro ($15/seat) offers comparable AI coding assistance to Cursor Pro ($20/seat). For ${seats} seat(s) this switch saves ~$${savings}/mo. Note: Windsurf uses a different editor; factor in migration effort.`,
          sources: [...sourceForPlan("cursor_pro"), ...sourceForPlan("windsurf_pro")],
        });
      }
    }

    // ─────────────────────────────────────────────
    // SECTION 4 — Claude / Anthropic subscription rules
    // ─────────────────────────────────────────────

    // Rule 4a: Claude Max for solo users → Pro
    // Max ($100/seat) is designed for heavy/power users. Pro ($20/seat) covers
    // the vast majority of use-cases with generous daily limits.
    if (t.planId === "claude_max" && seats === 1) {
      const proCost = estimatePlanCost("claude_pro", 1);
      const savings = clampSavings(currentSpend, proCost);
      if (savings > 0 && proCost != null) {
        tryUpdate({
          tool,
          current: { planId: t.planId, seats, monthlySpendUsd: currentSpend },
          recommendation: { action: "downgrade", recommendedPlanId: "claude_pro" },
          estimatedSavingsMonthlyUsd: savings,
          explanation:
            `Claude Max ($100/mo) is built for extremely heavy usage. If you don't regularly hit Pro's usage limits, Claude Pro ($20/mo) handles most workloads and saves ~$${savings}/mo.`,
          sources: [...sourceForPlan("claude_max"), ...sourceForPlan("claude_pro")],
        });
      }
    }

    // Rule 4b: Claude Team for 1 seat → Pro
    // Team ($30/seat) adds collaboration features (shared projects, admin
    // console). A solo user has no one to collaborate with.
    if (t.planId === "claude_team" && seats === 1) {
      const proCost = estimatePlanCost("claude_pro", 1);
      const savings = clampSavings(currentSpend, proCost);
      if (savings > 0 && proCost != null) {
        tryUpdate({
          tool,
          current: { planId: t.planId, seats, monthlySpendUsd: currentSpend },
          recommendation: { action: "downgrade", recommendedPlanId: "claude_pro" },
          estimatedSavingsMonthlyUsd: savings,
          explanation:
            `Claude Team ($30/mo) adds shared projects and an admin console designed for teams. As a solo user you're paying $10/mo extra for features you can't use — Claude Pro ($20/mo) covers the same AI capabilities.`,
          sources: [...sourceForPlan("claude_team"), ...sourceForPlan("claude_pro")],
        });
      }
    }

    // ─────────────────────────────────────────────
    // SECTION 5 — Gemini / Google subscription rules
    // ─────────────────────────────────────────────

    // Rule 5a: Gemini Ultra for solo users → Pro
    // Ultra ($29.99/seat) vs Pro ($19.99/seat). Ultra adds access to Gemini
    // Advanced and 2TB storage. Light AI users rarely benefit from these.
    if (t.planId === "gemini_ultra" && seats === 1) {
      const proCost = estimatePlanCost("gemini_pro", 1);
      const savings = clampSavings(currentSpend, proCost);
      if (savings > 0 && proCost != null) {
        tryUpdate({
          tool,
          current: { planId: t.planId, seats, monthlySpendUsd: currentSpend },
          recommendation: { action: "downgrade", recommendedPlanId: "gemini_pro" },
          estimatedSavingsMonthlyUsd: savings,
          explanation:
            `Gemini Ultra ($29.99/mo) adds Gemini Advanced and 2 TB storage over the Pro tier ($19.99/mo). If you don't actively use those features, downgrading saves ~$${savings}/mo.`,
          sources: [...sourceForPlan("gemini_ultra"), ...sourceForPlan("gemini_pro")],
        });
      }
    }

    // ─────────────────────────────────────────────
    // SECTION 6 — API / usage-based rules
    // ─────────────────────────────────────────────

    // Rule 6: High API spend → discounted credits recommendation
    // Applies to all major API plans. Threshold: savings must be ≥ $25/mo to
    // be actionable (lowered from $50 to surface more opportunities).
    const API_PLAN_IDS: ToolPlanId[] = [
      "openai_api",
      "anthropic_api",
      "chatgpt_api",
      "claude_api",
      "gemini_api",
    ];
    if (API_PLAN_IDS.includes(t.planId)) {
      const discountRate = 0.1;
      const savings = Math.round(currentSpend * discountRate * 100) / 100;
      if (savings >= 25) {
        tryUpdate({
          tool,
          current: { planId: t.planId, seats, monthlySpendUsd: currentSpend },
          recommendation: { action: "credits" },
          estimatedSavingsMonthlyUsd: savings,
          explanation:
            `At $${currentSpend}/mo in API spend, purchasing discounted prepaid credits could reduce your effective cost by ~10% (~$${savings}/mo). This estimate is conservative; actual savings vary by provider and volume tier.`,
          sources: sourceForPlan(t.planId),
        });
      }
    }

    // ─────────────────────────────────────────────
    // SECTION 7 — Overpayment / billing anomaly detection
    // Runs last and only fires when no better recommendation was found, so
    // users aren't shown two conflicting recommendations for one tool.
    // ─────────────────────────────────────────────
    if (best.recommendation.action === "keep" && best.estimatedSavingsMonthlyUsd === 0) {
      const expectedSpend = estimatePlanCost(t.planId, seats);
      if (expectedSpend != null && isOverpaying(currentSpend, t.planId, seats)) {
        const overage = Math.round((currentSpend - expectedSpend) * 100) / 100;
        tryUpdate(buildOverpaymentItem(tool, t.planId, seats, currentSpend, expectedSpend));
        // Suppress tiny overages that would just add noise (< $5/mo).
        if (overage < 5) {
          best = buildDefaultKeep(tool, t);
        }
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