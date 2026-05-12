import { Link, useNavigate } from "react-router-dom";
import { useMemo, useState } from "react";
import { useAuditDraft } from "@/state/useAuditDraft";
import { runAudit, getPricingEntry } from "@/audit/engine";
import { createShareableAudit } from "@/services/backend";
import { createLead } from "@/services/leads";
 
function formatUsd(value: number) {
  return `$${Math.round(value * 100) / 100}`;
}
 
const inputCls = "h-10 w-full rounded-lg border border-[#f0ede8]/10 bg-[#0a0a0a] px-3 text-sm text-[#f0ede8] placeholder-[#f0ede8]/25 focus:outline-none focus:border-[#c9a84c]/50 transition-colors";
 
const actionColors: Record<string, string> = {
  keep: "text-[#f0ede8]/40 bg-[#f0ede8]/05",
  credits: "text-[#c9a84c] bg-[#c9a84c]/10",
  downgrade: "text-emerald-400 bg-emerald-400/10",
  switch: "text-sky-400 bg-sky-400/10",
};
const actionLabels: Record<string, string> = {
  keep: "Keep",
  credits: "Credits",
  downgrade: "Downgrade",
  switch: "Switch",
};
 
export default function ResultsPage() {
  const navigate = useNavigate();
  const { draft } = useAuditDraft();
  const [shareState, setShareState] = useState<{ status: "idle" } | { status: "loading" } | { status: "error"; message: string }>({ status: "idle" });
 
  const [leadEmail, setLeadEmail] = useState("");
  const [leadCompany, setLeadCompany] = useState("");
  const [leadRole, setLeadRole] = useState("");
  const [leadCompanyTrap, setLeadCompanyTrap] = useState("");
  const [leadState, setLeadState] = useState<{ status: "idle" } | { status: "loading" } | { status: "success" } | { status: "error"; message: string }>({ status: "idle" });
 
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
      setShareState({ status: "error", message: e instanceof Error ? e.message : "Failed to create share link" });
    }
  }
 
  async function onSubmitLead() {
    try {
      setLeadState({ status: "loading" });
      await createLead({ email: leadEmail, source: "results", honeypot: leadCompanyTrap, company: leadCompany.trim() || undefined, role: leadRole.trim() || undefined });
      setLeadState({ status: "success" });
    } catch (e) {
      setLeadState({ status: "error", message: e instanceof Error ? e.message : "Failed to submit" });
    }
  }
 
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-[#f0ede8]" style={{ fontFamily: "'DM Sans', system-ui, sans-serif" }}>
      {/* Grain */}
      <div className="pointer-events-none fixed inset-0 z-50 opacity-[0.035]" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`, backgroundSize: "200px 200px" }} />
 
      <header className="sticky top-0 z-40 bg-[#0a0a0a]/90 backdrop-blur border-b border-[#f0ede8]/06">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="h-6 w-6 rounded border border-[#c9a84c]/40 flex items-center justify-center">
              <div className="h-2.5 w-2.5 rounded-sm bg-[#c9a84c]" />
            </div>
            <span className="text-xs font-semibold tracking-widest uppercase text-[#f0ede8]/50">SpendPilot · Audit Results</span>
          </div>
          <div className="flex items-center gap-2">
            <Link to="/audit">
              <button className="px-4 py-1.5 text-xs border border-[#f0ede8]/15 text-[#f0ede8]/50 rounded hover:border-[#f0ede8]/30 hover:text-[#f0ede8]/80 transition-all">
                ← Edit inputs
              </button>
            </Link>
            <button
              onClick={onCreateShareLink}
              disabled={shareState.status === "loading"}
              className="px-4 py-1.5 text-xs border border-[#c9a84c]/40 text-[#c9a84c] rounded hover:bg-[#c9a84c] hover:text-[#0a0a0a] transition-all disabled:opacity-40"
            >
              {shareState.status === "loading" ? "Creating…" : "Share audit"}
            </button>
          </div>
        </div>
      </header>
 
      <main className="mx-auto max-w-6xl px-6 pb-20 pt-10 space-y-8">
        {/* Savings hero */}
        <section className="rounded-2xl border border-[#c9a84c]/20 bg-[#0e0e09] p-8 relative overflow-hidden">
          <div className="pointer-events-none absolute right-0 top-0 w-64 h-64 rounded-full opacity-[0.06]" style={{ background: "radial-gradient(ellipse, #c9a84c 0%, transparent 70%)", transform: "translate(30%, -30%)" }} />
 
          <div className="text-xs font-semibold tracking-widest uppercase text-[#f0ede8]/35 mb-5">Estimated savings</div>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="md:col-span-1">
              <div className="text-xs text-[#f0ede8]/35 tracking-wide uppercase mb-1">Monthly</div>
              <div className="text-5xl font-bold text-[#c9a84c] tabular-nums">{formatUsd(monthlySavings)}</div>
            </div>
            <div className="md:col-span-1">
              <div className="text-xs text-[#f0ede8]/35 tracking-wide uppercase mb-1">Annual</div>
              <div className="text-5xl font-bold text-[#f0ede8] tabular-nums">{formatUsd(annualSavings)}</div>
            </div>
            <div className="md:col-span-1 flex flex-col justify-end gap-1.5">
              <div className="flex justify-between text-xs">
                <span className="text-[#f0ede8]/35">Current monthly</span>
                <span className="text-[#f0ede8]/60 tabular-nums font-medium">{formatUsd(result.totals.currentMonthlySpendUsd)}</span>
              </div>
              <div className="h-2 rounded-full bg-[#f0ede8]/08 overflow-hidden">
                <div
                  className="h-full rounded-full bg-[#c9a84c]"
                  style={{ width: result.totals.currentMonthlySpendUsd > 0 ? `${Math.min(100, (monthlySavings / result.totals.currentMonthlySpendUsd) * 100)}%` : "0%" }}
                />
              </div>
              <div className="text-xs text-[#f0ede8]/30 text-right">
                {result.totals.currentMonthlySpendUsd > 0
                  ? `${Math.round((monthlySavings / result.totals.currentMonthlySpendUsd) * 100)}% reducible`
                  : "—"}
              </div>
            </div>
          </div>
          {shareState.status === "error" && <div className="mt-4 text-xs text-red-400">{shareState.message}</div>}
        </section>
 
        {/* Per-tool breakdown */}
        <section className="space-y-4">
          <h2 className="text-base font-semibold">Per-tool breakdown</h2>
          <div className="space-y-3">
            {result.items.length === 0 ? (
              <div className="rounded-2xl border border-[#f0ede8]/06 bg-[#0e0e0d] px-6 py-8 text-sm text-[#f0ede8]/30 text-center">
                No tools added. <Link to="/audit" className="text-[#c9a84c] underline">Go back and add some.</Link>
              </div>
            ) : (
              result.items.map((item) => {
                const currentPricing = getPricingEntry(item.current.planId);
                const action = item.recommendation.action;
                return (
                  <div key={item.tool} className="rounded-2xl border border-[#f0ede8]/06 bg-[#0e0e0d] p-5">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-3">
                        <div className="h-9 w-9 rounded-xl bg-[#f0ede8]/06 flex items-center justify-center text-xs font-bold text-[#f0ede8]/50 shrink-0 mt-0.5">
                          {currentPricing.tool.charAt(0)}
                        </div>
                        <div>
                          <div className="text-sm font-semibold text-[#f0ede8]">{currentPricing.tool}</div>
                          <div className="text-xs text-[#f0ede8]/35 mt-0.5">
                            {currentPricing.planName} · {item.current.seats} seat{item.current.seats !== 1 ? "s" : ""} · {formatUsd(item.current.monthlySpendUsd)}/mo
                          </div>
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <div className={`inline-block text-xs font-semibold px-2.5 py-1 rounded-full mb-1 ${actionColors[action] ?? "text-[#f0ede8]/40 bg-[#f0ede8]/05"}`}>
                          {actionLabels[action] ?? action}
                        </div>
                        <div className="text-lg font-bold text-[#c9a84c] tabular-nums">{formatUsd(item.estimatedSavingsMonthlyUsd)}/mo</div>
                      </div>
                    </div>
 
                    <div className="mt-4 pt-4 border-t border-[#f0ede8]/06 space-y-1.5">
                      <div className="text-xs font-medium text-[#f0ede8]/60">
                        {action === "keep" && "Keep current setup"}
                        {action === "credits" && "Use discounted credits (SpendPilot)"}
                        {action === "downgrade" && item.recommendation.recommendedPlanId
                          ? `Switch to ${getPricingEntry(item.recommendation.recommendedPlanId).planName}`
                          : null}
                        {action === "switch" && item.recommendation.recommendedTool
                          ? `Switch to ${item.recommendation.recommendedTool}`
                          : null}
                      </div>
                      <p className="text-xs text-[#f0ede8]/35 leading-relaxed">{item.explanation}</p>
                      <div className="flex flex-wrap gap-2 pt-1">
                        {item.sources.map((s) => (
                          <a key={`${item.tool}-${s.url}`} href={s.url} target="_blank" rel="noreferrer"
                            className="text-[10px] text-[#c9a84c]/50 hover:text-[#c9a84c] underline transition-colors">
                            Pricing source (verified {s.verifiedAt})
                          </a>
                        ))}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </section>
 
        {/* SpendPilot recommendation */}
        <section className="rounded-2xl border border-[#f0ede8]/06 bg-[#0e0e0d] p-6 space-y-4">
          <h2 className="text-base font-semibold">SpendPilot recommendation</h2>
 
          {showBigUpsell ? (
            <div className="grid md:grid-cols-2 gap-4">
              <div className="rounded-xl border border-[#c9a84c]/20 bg-[#0a0a0a] p-5 space-y-4">
                <div>
                  <div className="text-sm font-semibold">Save meaningfully with discounted credits</div>
                  <p className="text-xs text-[#f0ede8]/40 mt-1 leading-relaxed">
                    Your estimated savings are {formatUsd(monthlySavings)}/mo. SpendPilot can structure discounted credits and reduce retail API spend.
                  </p>
                </div>
 
                {/* Honeypot */}
                <label className="hidden">
                  Company<input value={leadCompanyTrap} onChange={(e) => setLeadCompanyTrap(e.target.value)} tabIndex={-1} autoComplete="off" />
                </label>
 
                <div className="space-y-2">
                  <input value={leadEmail} onChange={(e) => setLeadEmail(e.target.value)} placeholder="you@company.com" className={inputCls} type="email" autoComplete="email" />
                  <div className="grid grid-cols-2 gap-2">
                    <input value={leadCompany} onChange={(e) => setLeadCompany(e.target.value)} placeholder="Company (optional)" className={inputCls} type="text" autoComplete="organization" />
                    <input value={leadRole} onChange={(e) => setLeadRole(e.target.value)} placeholder="Role (optional)" className={inputCls} type="text" />
                  </div>
                  <div className="flex justify-end">
                    <button onClick={onSubmitLead} disabled={leadState.status === "loading" || !leadEmail.trim()}
                      className="px-5 py-2 bg-[#c9a84c] text-[#0a0a0a] text-sm font-semibold rounded-lg hover:bg-[#e0bd68] transition-colors disabled:opacity-40">
                      {leadState.status === "loading" ? "Sending…" : "Send →"}
                    </button>
                  </div>
                </div>
                {leadState.status === "success" && <p className="text-xs text-[#f0ede8]/40">Thanks — check your inbox.</p>}
                {leadState.status === "error" && <p className="text-xs text-red-400">{leadState.message}</p>}
              </div>
 
              <div className="rounded-xl border border-[#f0ede8]/06 bg-[#0a0a0a] p-5 space-y-4">
                <div>
                  <div className="text-sm font-semibold">Next step</div>
                  <p className="text-xs text-[#f0ede8]/40 mt-1">Prefer a call? Calendar booking coming in a later phase.</p>
                </div>
                <div className="flex flex-wrap gap-2 mt-auto">
                  <button disabled className="px-4 py-2 bg-[#f0ede8]/05 text-[#f0ede8]/25 text-sm rounded-lg cursor-not-allowed text-xs">
                    Book a SpendPilot consult
                  </button>
                  <button onClick={onCreateShareLink} disabled={shareState.status === "loading"}
                    className="px-4 py-2 border border-[#c9a84c]/40 text-[#c9a84c] text-xs rounded-lg hover:bg-[#c9a84c] hover:text-[#0a0a0a] transition-all disabled:opacity-40">
                    {shareState.status === "loading" ? "Creating…" : "Share this audit"}
                  </button>
                </div>
              </div>
            </div>
          ) : showOptimized ? (
            <div className="rounded-xl border border-[#f0ede8]/06 bg-[#0a0a0a] p-5">
              <div className="text-sm font-semibold text-[#f0ede8]/70">Your AI spend looks fairly optimized</div>
              <p className="text-xs text-[#f0ede8]/35 mt-1 leading-relaxed">No major plan-level waste found. If your usage changes, new optimizations may surface.</p>
              <button disabled className="mt-4 px-4 py-2 text-xs border border-[#f0ede8]/10 text-[#f0ede8]/25 rounded-lg cursor-not-allowed">
                Notify me about new optimizations
              </button>
            </div>
          ) : (
            <p className="text-sm text-[#f0ede8]/40">
              If you have meaningful API usage, discounted credits can reduce your effective cost per token.
            </p>
          )}
 
          <p className="text-xs text-[#f0ede8]/20">Lead capture wires to /api/leads and sends a confirmation email when configured.</p>
        </section>
      </main>
    </div>
  );
}