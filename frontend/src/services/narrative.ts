export const BACKEND_BASE_URL = import.meta.env.VITE_BACKEND_BASE_URL ?? "http://localhost:8787";

export type NarrativeSummary = {
  executiveSummary: string;
  topFindings: Array<{ title: string; detail: string; impactUsdMonthly?: number }>;
  actionPlan: Array<{ step: string; owner: "finance" | "engineering" | "it" | "founder" | "other" }>;
  assumptionsAndCaveats: string[];
  disclaimer: string;
};

export async function generateNarrativeForShare(shareId: string): Promise<{
  shareId: string;
  narrativeSummary: NarrativeSummary;
  model: string;
  promptVersion: string;
  cached: boolean;
}> {
  const res = await fetch(`${BACKEND_BASE_URL}/api/narrative`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ shareId }),
  });

  if (!res.ok) throw new Error("Failed to generate narrative");
  return res.json();
}
