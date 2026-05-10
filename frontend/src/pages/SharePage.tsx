import { Link, useParams } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { fetchSharedAudit } from "@/services/backend";
import { getPricingEntry } from "@/audit/engine";
import { generateNarrativeForShare, type NarrativeSummary } from "@/services/narrative";
import { createLead } from "@/services/leads";

type LoadState =
  | { status: "idle" | "loading" }
  | { status: "error"; message: string }
  | { status: "success"; data: any };

type NarrativeState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "success"; summary: NarrativeSummary; model: string; promptVersion: string; cached: boolean };

type LeadState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "success" }
  | { status: "error"; message: string };

export default function SharePage() {
  const { id } = useParams();
  const [state, setState] = useState<LoadState>({ status: "idle" });
  const [narrative, setNarrative] = useState<NarrativeState>({ status: "idle" });

  const [leadEmail, setLeadEmail] = useState("");
  const [leadCompanyTrap, setLeadCompanyTrap] = useState("");
  const [leadState, setLeadState] = useState<LeadState>({ status: "idle" });

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

  async function onGenerateNarrative() {
    if (!id) return;
    try {
      setNarrative({ status: "loading" });
      const resp = await generateNarrativeForShare(id);
      setNarrative({
        status: "success",
        summary: resp.narrativeSummary,
        model: resp.model,
        promptVersion: resp.promptVersion,
        cached: resp.cached,
      });
    } catch (e) {
      setNarrative({ status: "error", message: e instanceof Error ? e.message : "Failed to generate narrative" });
    }
  }

  async function onSubmitLead() {
    if (!id) return;
    try {
      setLeadState({ status: "loading" });
      await createLead({ email: leadEmail, shareId: id, source: "share", honeypot: leadCompanyTrap });
      setLeadState({ status: "success" });
    } catch (e) {
      setLeadState({ status: "error", message: e instanceof Error ? e.message : "Failed to submit" });
    }
  }

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
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <div className="text-sm font-semibold">AI narrative summary</div>
                    <div className="mt-1 text-xs text-muted-foreground">
                      Phase 4: generated from the sanitized audit payload.
                    </div>
                  </div>
                  <Button onClick={onGenerateNarrative} disabled={narrative.status === "loading"}>
                    {narrative.status === "loading" ? "Generating…" : "Generate summary"}
                  </Button>
                </div>

                {narrative.status === "error" ? (
                  <div className="mt-4 text-sm text-destructive">{narrative.message}</div>
                ) : narrative.status === "success" ? (
                  <div className="mt-4 grid gap-4">
                    <div>
                      <div className="text-xs font-medium text-muted-foreground">Executive summary</div>
                      <div className="mt-1 text-sm">{narrative.summary.executiveSummary}</div>
                    </div>

                    <div>
                      <div className="text-xs font-medium text-muted-foreground">Top findings</div>
                      <ul className="mt-2 list-disc space-y-2 pl-5 text-sm">
                        {narrative.summary.topFindings.map((f, idx) => (
                          <li key={idx}>
                            <span className="font-medium">{f.title}:</span> {f.detail}
                            {typeof f.impactUsdMonthly === "number" ? (
                              <span className="text-muted-foreground"> (≈ ${f.impactUsdMonthly}/mo)</span>
                            ) : null}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div>
                      <div className="text-xs font-medium text-muted-foreground">Action plan</div>
                      <ul className="mt-2 list-disc space-y-2 pl-5 text-sm">
                        {narrative.summary.actionPlan.map((s, idx) => (
                          <li key={idx}>
                            {s.step} <span className="text-muted-foreground">({s.owner})</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div>
                      <div className="text-xs font-medium text-muted-foreground">Assumptions & caveats</div>
                      <ul className="mt-2 list-disc space-y-2 pl-5 text-sm">
                        {narrative.summary.assumptionsAndCaveats.map((c, idx) => (
                          <li key={idx}>{c}</li>
                        ))}
                      </ul>
                    </div>

                    <div className="text-xs text-muted-foreground">
                      Model: {narrative.model} • Prompt: {narrative.promptVersion}
                      {narrative.cached ? " • cached" : ""}
                    </div>

                    <div className="rounded-lg border bg-card p-4 text-xs text-muted-foreground">
                      {narrative.summary.disclaimer}
                    </div>
                  </div>
                ) : (
                  <div className="mt-4 text-sm text-muted-foreground">
                    Click “Generate summary” to produce a narrative summary for this shared audit.
                  </div>
                )}
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

              <div className="rounded-2xl border bg-background p-5">
                <div className="text-sm font-semibold">Get help implementing these savings</div>
                <div className="mt-1 text-xs text-muted-foreground">
                  Phase 5: leave an email and we’ll follow up. (No automated email send yet.)
                </div>

                {/* Honeypot (hidden) */}
                <label className="hidden">
                  Company
                  <input
                    value={leadCompanyTrap}
                    onChange={(e) => setLeadCompanyTrap(e.target.value)}
                    tabIndex={-1}
                    autoComplete="off"
                  />
                </label>

                <div className="mt-3 flex gap-2">
                  <input
                    value={leadEmail}
                    onChange={(e) => setLeadEmail(e.target.value)}
                    placeholder="you@company.com"
                    className="h-10 w-full rounded-md border bg-background px-3 text-sm"
                    type="email"
                    autoComplete="email"
                  />
                  <Button onClick={onSubmitLead} disabled={leadState.status === "loading" || !leadEmail.trim()}>
                    {leadState.status === "loading" ? "Sending…" : "Send"}
                  </Button>
                </div>
                {leadState.status === "success" ? (
                  <div className="mt-2 text-xs text-muted-foreground">Thanks — we’ll reach out.</div>
                ) : leadState.status === "error" ? (
                  <div className="mt-2 text-xs text-destructive">{leadState.message}</div>
                ) : null}
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
