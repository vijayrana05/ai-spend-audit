import { Link, useParams } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { fetchSharedAudit } from "@/services/backend";
import { getPricingEntry } from "@/audit/engine";

type LoadState =
  | { status: "idle" | "loading" }
  | { status: "error"; message: string }
  | { status: "success"; data: any };

export default function SharePage() {
  const { id } = useParams();
  const [state, setState] = useState<LoadState>({ status: "idle" });

  useEffect(() => {
    if (!id) return;
    let cancelled = false;

    setState({ status: "loading" });
    fetchSharedAudit(id)
      .then((data) => {
        if (cancelled) return;
        setState({ status: "success", data });
      })
      .catch((err) => {
        if (cancelled) return;
        setState({ status: "error", message: err instanceof Error ? err.message : "Failed to load" });
      });

    return () => {
      cancelled = true;
    };
  }, [id]);

  const audit = useMemo(() => {
    if (state.status !== "success") return null;
    return state.data?.auditResult ?? null;
  }, [state]);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="mx-auto flex max-w-5xl items-center justify-between px-4 py-6">
        <div className="text-sm font-semibold tracking-tight">Credex • Shared Audit</div>
        <Link to="/">
          <Button variant="outline">Home</Button>
        </Link>
      </header>

      <main className="mx-auto max-w-5xl space-y-6 px-4 pb-16">
        <section className="rounded-2xl border bg-card p-6 shadow-sm">
          <h1 className="text-2xl font-semibold tracking-tight">Shared audit</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Public link (sanitized). No personal or company details are shown.
          </p>

          {state.status === "loading" || state.status === "idle" ? (
            <div className="mt-6 text-sm text-muted-foreground">Loading…</div>
          ) : state.status === "error" ? (
            <div className="mt-6 text-sm text-destructive">{state.message}</div>
          ) : audit ? (
            <div className="mt-6 grid gap-4">
              <div className="grid gap-3 md:grid-cols-2">
                <div className="rounded-xl border bg-background p-5">
                  <div className="text-xs text-muted-foreground">Monthly savings</div>
                  <div className="mt-1 text-4xl font-semibold">${audit.totals?.estimatedSavingsMonthlyUsd ?? 0}</div>
                </div>
                <div className="rounded-xl border bg-background p-5">
                  <div className="text-xs text-muted-foreground">Annual savings</div>
                  <div className="mt-1 text-4xl font-semibold">${audit.totals?.estimatedSavingsAnnualUsd ?? 0}</div>
                </div>
              </div>

              <div className="rounded-2xl border bg-background p-5">
                <div className="text-sm font-semibold">Tools</div>
                <div className="mt-4 grid gap-3">
                  {(audit.items ?? []).map((item: any) => {
                    const currentPricing = item?.current?.planId ? getPricingEntry(item.current.planId) : null;
                    return (
                      <div key={item.tool} className="rounded-xl border bg-card p-5">
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <div className="text-sm font-semibold">{currentPricing?.tool ?? item.tool}</div>
                            <div className="mt-1 text-xs text-muted-foreground">
                              Current: {currentPricing?.planName ?? item.current?.planId} • {item.current?.seats} seat(s) • ${item.current?.monthlySpendUsd}/mo
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-xs text-muted-foreground">Est. savings</div>
                            <div className="text-lg font-semibold">${item.estimatedSavingsMonthlyUsd ?? 0}/mo</div>
                          </div>
                        </div>

                        <div className="mt-3 text-sm">
                          <span className="font-medium">Recommendation:</span>{" "}
                          {item.recommendation?.action === "keep" && "Keep current setup"}
                          {item.recommendation?.action === "credits" && "Use discounted credits (Credex)"}
                          {item.recommendation?.action === "downgrade" && item.recommendation?.recommendedPlanId
                            ? `Switch to ${getPricingEntry(item.recommendation.recommendedPlanId).planName}`
                            : null}
                          {item.recommendation?.action === "switch" && item.recommendation?.recommendedTool
                            ? `Switch to ${item.recommendation.recommendedTool}`
                            : null}
                        </div>

                        <div className="mt-1 text-sm text-muted-foreground">{item.explanation}</div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="text-xs text-muted-foreground">
                Share ID: <span className="font-mono">{id}</span>
              </div>
            </div>
          ) : (
            <div className="mt-6 text-sm text-muted-foreground">No audit data found.</div>
          )}
        </section>
      </main>
    </div>
  );
}
