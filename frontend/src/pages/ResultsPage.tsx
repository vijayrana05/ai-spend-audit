import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuditDraft } from "@/state/useAuditDraft";
import { runAudit, getPricingEntry } from "@/audit/engine";

export default function ResultsPage() {
  const { draft } = useAuditDraft();

  const result = runAudit(draft);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="mx-auto flex max-w-5xl items-center justify-between px-4 py-6">
        <div className="text-sm font-semibold tracking-tight">Credex • AI Spend Audit</div>
        <Link to="/audit">
          <Button variant="outline">Edit inputs</Button>
        </Link>
      </header>

      <main className="mx-auto max-w-5xl space-y-6 px-4 pb-16">
        <section className="rounded-2xl border bg-card p-6 shadow-sm">
          <div className="text-sm font-medium text-muted-foreground">Estimated savings</div>
          <div className="mt-2 grid gap-3 md:grid-cols-2">
            <div className="rounded-xl border bg-background p-5">
              <div className="text-xs text-muted-foreground">Monthly</div>
              <div className="mt-1 text-4xl font-semibold">${result.totals.estimatedSavingsMonthlyUsd}</div>
            </div>
            <div className="rounded-xl border bg-background p-5">
              <div className="text-xs text-muted-foreground">Annual</div>
              <div className="mt-1 text-4xl font-semibold">${result.totals.estimatedSavingsAnnualUsd}</div>
            </div>
          </div>
          <div className="mt-4 text-sm text-muted-foreground">
            Current monthly spend (from your inputs): ${result.totals.currentMonthlySpendUsd}
          </div>
        </section>

        <section className="rounded-2xl border bg-card p-6 shadow-sm">
          <h2 className="text-lg font-semibold">Per-tool breakdown</h2>
          <div className="mt-4 grid gap-3">
            {result.items.length === 0 ? (
              <div className="text-sm text-muted-foreground">No tools added yet.</div>
            ) : (
              result.items.map((item) => {
                const currentPricing = getPricingEntry(item.current.planId);
                return (
                  <div key={item.tool} className="rounded-xl border bg-background p-5">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <div className="text-sm font-semibold">{currentPricing.tool}</div>
                        <div className="mt-1 text-xs text-muted-foreground">
                          Current: {currentPricing.planName} • {item.current.seats} seat(s) • ${item.current.monthlySpendUsd}/mo
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-xs text-muted-foreground">Est. savings</div>
                        <div className="text-lg font-semibold">${item.estimatedSavingsMonthlyUsd}/mo</div>
                      </div>
                    </div>

                    <div className="mt-3 text-sm">
                      <span className="font-medium">Recommendation:</span>{" "}
                      {item.recommendation.action === "keep" && "Keep current setup"}
                      {item.recommendation.action === "credits" && "Use discounted credits (Credex)"}
                      {item.recommendation.action === "downgrade" && item.recommendation.recommendedPlanId
                        ? `Switch to ${getPricingEntry(item.recommendation.recommendedPlanId).planName}`
                        : null}
                      {item.recommendation.action === "switch" && item.recommendation.recommendedTool
                        ? `Switch to ${item.recommendation.recommendedTool}`
                        : null}
                    </div>

                    <div className="mt-1 text-sm text-muted-foreground">{item.explanation}</div>

                    <div className="mt-3 flex flex-wrap gap-2 text-xs text-muted-foreground">
                      {item.sources.map((s) => (
                        <a
                          key={`${item.tool}-${s.url}`}
                          className="underline"
                          href={s.url}
                          target="_blank"
                          rel="noreferrer"
                        >
                          Pricing source (verified {s.verifiedAt})
                        </a>
                      ))}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </section>

        <section className="rounded-2xl border bg-card p-6 shadow-sm">
          <h2 className="text-lg font-semibold">Credex recommendation</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Phase 2: Credex credits are suggested for meaningful API spend (conservative 10% estimate). Lead capture and
            email confirmation are added in Phase 5.
          </p>
        </section>
      </main>
    </div>
  );
}
