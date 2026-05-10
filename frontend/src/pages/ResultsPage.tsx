import { Link, useNavigate } from "react-router-dom";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { useAuditDraft } from "@/state/useAuditDraft";
import { runAudit, getPricingEntry } from "@/audit/engine";
import { createShareableAudit } from "@/services/backend";
import { createLead } from "@/services/leads";

function formatUsd(value: number) {
  return `$${Math.round(value * 100) / 100}`;
}

export default function ResultsPage() {
  const navigate = useNavigate();
  const { draft } = useAuditDraft();
  const [shareState, setShareState] = useState<
    { status: "idle" } | { status: "loading" } | { status: "error"; message: string }
  >({ status: "idle" });

  const [leadEmail, setLeadEmail] = useState("");
  const [leadCompanyTrap, setLeadCompanyTrap] = useState("");
  const [leadState, setLeadState] = useState<
    | { status: "idle" }
    | { status: "loading" }
    | { status: "success" }
    | { status: "error"; message: string }
  >({ status: "idle" });

  const result = useMemo(() => runAudit(draft), [draft]);

  const monthlySavings = result.totals.estimatedSavingsMonthlyUsd;
  const annualSavings = result.totals.estimatedSavingsAnnualUsd;

  const showBigUpsell = monthlySavings > 500;
  const showOptimized = monthlySavings < 100;

  async function onCreateShareLink() {
    try {
      setShareState({ status: "loading" });
      const resp = await createShareableAudit(result);
      setShareState({ status: "idle" });
      navigate(resp.sharePath);
    } catch (e) {
      setShareState({
        status: "error",
        message: e instanceof Error ? e.message : "Failed to create share link",
      });
    }
  }

  async function onSubmitLead() {
    try {
      setLeadState({ status: "loading" });
      await createLead({ email: leadEmail, source: "results", honeypot: leadCompanyTrap });
      setLeadState({ status: "success" });
    } catch (e) {
      setLeadState({
        status: "error",
        message: e instanceof Error ? e.message : "Failed to submit",
      });
    }
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="mx-auto flex max-w-5xl items-center justify-between px-4 py-6">
        <div className="text-sm font-semibold tracking-tight">Credex • AI Spend Audit</div>
        <div className="flex items-center gap-2">
          <Link to="/audit">
            <Button variant="outline">Edit inputs</Button>
          </Link>
          <Button onClick={onCreateShareLink} disabled={shareState.status === "loading"}>
            {shareState.status === "loading" ? "Creating…" : "Create share link"}
          </Button>
        </div>
      </header>

      <main className="mx-auto max-w-5xl space-y-6 px-4 pb-16">
        <section className="rounded-2xl border bg-card p-6 shadow-sm">
          <div className="text-sm font-medium text-muted-foreground">Estimated savings</div>
          <div className="mt-2 grid gap-3 md:grid-cols-2">
            <div className="rounded-xl border bg-background p-5">
              <div className="text-xs text-muted-foreground">Monthly</div>
              <div className="mt-1 text-4xl font-semibold">{formatUsd(monthlySavings)}</div>
            </div>
            <div className="rounded-xl border bg-background p-5">
              <div className="text-xs text-muted-foreground">Annual</div>
              <div className="mt-1 text-4xl font-semibold">{formatUsd(annualSavings)}</div>
            </div>
          </div>
          <div className="mt-4 text-sm text-muted-foreground">
            Current monthly spend (from your inputs): {formatUsd(result.totals.currentMonthlySpendUsd)}
          </div>
          {shareState.status === "error" ? (
            <div className="mt-3 text-sm text-destructive">{shareState.message}</div>
          ) : null}
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
                          Current: {currentPricing.planName} • {item.current.seats} seat(s) •{" "}
                          {formatUsd(item.current.monthlySpendUsd)}/mo
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-xs text-muted-foreground">Est. savings</div>
                        <div className="text-lg font-semibold">{formatUsd(item.estimatedSavingsMonthlyUsd)}/mo</div>
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

          {showBigUpsell ? (
            <div className="mt-3 rounded-xl border bg-background p-5">
              <div className="text-sm font-semibold">You could save meaningfully with discounted credits</div>
              <p className="mt-1 text-sm text-muted-foreground">
                Your estimated savings are {formatUsd(monthlySavings)}/mo. Credex can help structure discounted credits and
                reduce your retail API spend.
              </p>

              <div className="mt-4 grid gap-3 md:grid-cols-2">
                <div className="rounded-xl border bg-card p-4">
                  <div className="text-sm font-medium">Get the full breakdown</div>
                  <div className="mt-1 text-xs text-muted-foreground">
                    Phase 5: enter your email and we’ll follow up. (No automated email send yet.)
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

                <div className="rounded-xl border bg-card p-4">
                  <div className="text-sm font-medium">Next step</div>
                  <div className="mt-1 text-xs text-muted-foreground">
                    Prefer a call? We’ll add calendar booking in a later phase.
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <Button disabled>Book a Credex consult</Button>
                    <Button variant="outline" onClick={onCreateShareLink} disabled={shareState.status === "loading"}>
                      Share this audit
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ) : showOptimized ? (
            <div className="mt-3 rounded-xl border bg-background p-5">
              <div className="text-sm font-semibold">Your AI spend already looks fairly optimized</div>
              <p className="mt-1 text-sm text-muted-foreground">
                We didn’t find major plan-level waste. If your usage changes, new optimizations may appear.
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                <Button variant="outline" disabled>
                  Notify me about new optimizations
                </Button>
              </div>
            </div>
          ) : (
            <p className="mt-2 text-sm text-muted-foreground">
              If you have meaningful API usage, discounted credits can reduce your effective cost.
            </p>
          )}

          <div className="mt-4 text-xs text-muted-foreground">
            Phase 5 note: lead capture is now wired to the backend via /api/leads.
          </div>
        </section>
      </main>
    </div>
  );
}
