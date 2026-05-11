import type { NarrativeSummary } from "../types/narrative";

function money(n: unknown): string {
  const v = typeof n === "number" && Number.isFinite(n) ? n : 0;
  return `$${Math.round(v).toLocaleString("en-US")}`;
}

/**
 * Non-AI fallback summary when the LLM fails.
 * Keeps the product usable and meets the requirement to gracefully handle API failures.
 */
export function buildFallbackNarrative(auditResult: any): NarrativeSummary {
  const monthly = auditResult?.totals?.estimatedSavingsMonthlyUsd;
  const annual = auditResult?.totals?.estimatedSavingsAnnualUsd;

  const items: any[] = Array.isArray(auditResult?.items) ? auditResult.items : [];
  const top = items
    .slice()
    .sort((a, b) => (b?.estimatedSavingsMonthlyUsd ?? 0) - (a?.estimatedSavingsMonthlyUsd ?? 0))
    .slice(0, 3);

  const topFindings = top.map((it) => ({
    title: `${it?.tool ?? "Tool"}: ${money(it?.estimatedSavingsMonthlyUsd)}/mo opportunity`,
    detail:
      typeof it?.explanation === "string" && it.explanation.length > 0
        ? it.explanation
        : "Review your current plan vs your actual seat count and usage to avoid paying for unused capacity.",
    impactUsdMonthly:
      typeof it?.estimatedSavingsMonthlyUsd === "number" ? it.estimatedSavingsMonthlyUsd : undefined,
  }));

  const exec =
    (typeof monthly === "number" && monthly > 0)
      ? `Based on your inputs, you could reduce AI spend by about ${money(monthly)}/month (${money(annual)}/year) by adjusting plans and/or switching purchase methods.`
      : `Based on your inputs, we did not find a clear plan-level savings opportunity. Your current setup appears reasonably optimized for your team size and use case.`;

  return {
    executiveSummary: exec,
    topFindings:
      topFindings.length > 0
        ? topFindings
        : [
            {
              title: "No major plan waste detected",
              detail: "If usage changes, rerun the audit to see if cheaper plans or alternatives become attractive.",
            },
          ],
    actionPlan: [
      { step: "Verify current invoices and seat counts for each tool", owner: "finance" },
      { step: "Confirm which team features are actually required (SSO, admin controls, shared workspace)", owner: "it" },
      { step: "Apply plan changes and re-run the audit in 30 days", owner: "founder" },
    ],
    assumptionsAndCaveats: [
      "This summary is based only on the inputs you provided in the audit form.",
      "API usage-based pricing can vary significantly month to month.",
      "Some team/enterprise plans include security and admin features that may be required for compliance.",
    ],
    disclaimer:
      "Estimate only. Verify actual charges against invoices and the vendor pricing pages before making purchasing decisions.",
  };
}
