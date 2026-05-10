export type NarrativeSummary = {
  executiveSummary: string;
  topFindings: Array<{ title: string; detail: string; impactUsdMonthly?: number }>;
  actionPlan: Array<{ step: string; owner: "finance" | "engineering" | "it" | "founder" | "other" }>;
  assumptionsAndCaveats: string[];
  disclaimer: string;
};

export const NARRATIVE_PROMPT_VERSION = "phase4_narrative_v1" as const;
