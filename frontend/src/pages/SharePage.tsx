import { Link, useParams } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import { fetchSharedAudit } from "@/services/backend";
import { getPricingEntry } from "@/audit/engine";
import { generateNarrativeForShare, type NarrativeSummary } from "@/services/narrative";
import { createLead } from "@/services/leads";
import type { ToolPlanId } from "@/types/audit";
 
type SharedAuditResponse = { auditResult: unknown };
type LoadState = { status: "idle" | "loading" } | { status: "error"; message: string } | { status: "success"; data: SharedAuditResponse };
type NarrativeState = { status: "idle" } | { status: "loading" } | { status: "error"; message: string } | { status: "success"; summary: NarrativeSummary; model: string; promptVersion: string; cached: boolean };
type LeadState = { status: "idle" } | { status: "loading" } | { status: "success" } | { status: "error"; message: string };
 
type SharedAuditPayload = {
  totals?: { estimatedSavingsMonthlyUsd?: number; estimatedSavingsAnnualUsd?: number };
  items?: Array<{
    tool: string;
    current?: { planId?: ToolPlanId; seats?: number; monthlySpendUsd?: number };
    estimatedSavingsMonthlyUsd?: number;
    recommendation?: { action?: string; recommendedPlanId?: ToolPlanId; recommendedTool?: string };
    explanation?: string;
  }>;
};
 
const inputCls = "h-10 w-full rounded-lg border border-[#f0ede8]/10 bg-[#0a0a0a] px-3 text-sm text-[#f0ede8] placeholder-[#f0ede8]/25 focus:outline-none focus:border-[#c9a84c]/50 transition-colors";
const actionColors: Record<string, string> = {
  keep: "text-[#f0ede8]/40 bg-[#f0ede8]/05",
  credits: "text-[#c9a84c] bg-[#c9a84c]/10",
  downgrade: "text-emerald-400 bg-emerald-400/10",
  switch: "text-sky-400 bg-sky-400/10",
};
const actionLabels: Record<string, string> = { keep: "Keep", credits: "Credits", downgrade: "Downgrade", switch: "Switch" };
 
export default function SharePage() {
  const { id } = useParams();
  const [state, setState] = useState<LoadState>({ status: "idle" });
  const [narrative, setNarrative] = useState<NarrativeState>({ status: "idle" });
  const [leadEmail, setLeadEmail] = useState("");
  const [leadCompany, setLeadCompany] = useState("");
  const [leadRole, setLeadRole] = useState("");
  const [leadCompanyTrap, setLeadCompanyTrap] = useState("");
  const [leadState, setLeadState] = useState<LeadState>({ status: "idle" });
 
  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    setState({ status: "loading" });
    fetchSharedAudit(id)
      .then((raw) => { if (!cancelled) setState({ status: "success", data: raw as SharedAuditResponse }); })
      .catch((err) => { if (!cancelled) setState({ status: "error", message: err instanceof Error ? err.message : "Failed to load" }); });
    return () => { cancelled = true; };
  }, [id]);
 
  const audit = useMemo(() => {
    if (state.status !== "success") return null;
    return state.data?.auditResult as SharedAuditPayload;
  }, [state]);
 
  async function onGenerateNarrative() {
    if (!id) return;
    try {
      setNarrative({ status: "loading" });
      const resp = await generateNarrativeForShare(id);
      setNarrative({ status: "success", summary: resp.narrativeSummary, model: resp.model, promptVersion: resp.promptVersion, cached: resp.cached });
    } catch (e) {
      setNarrative({ status: "error", message: e instanceof Error ? e.message : "Failed to generate narrative" });
    }
  }
 
  async function onSubmitLead() {
    if (!id) return;
    try {
      setLeadState({ status: "loading" });
      await createLead({ email: leadEmail, shareId: id, source: "share", honeypot: leadCompanyTrap, company: leadCompany.trim() || undefined, role: leadRole.trim() || undefined });
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
            <span className="text-xs font-semibold tracking-widest uppercase text-[#f0ede8]/50">SpendPilot · Shared Audit</span>
          </div>
          <Link to="/">
            <button className="px-4 py-1.5 text-xs border border-[#f0ede8]/15 text-[#f0ede8]/50 rounded hover:border-[#f0ede8]/30 hover:text-[#f0ede8]/80 transition-all">
              ← Home
            </button>
          </Link>
        </div>
      </header>
 
      <main className="mx-auto max-w-6xl px-6 pb-20 pt-10 space-y-8">
        {/* Status: loading / error */}
        {(state.status === "loading" || state.status === "idle") && (
          <div className="rounded-2xl border border-[#f0ede8]/06 bg-[#0e0e0d] p-12 text-center">
            <div className="inline-block h-5 w-5 border-2 border-[#c9a84c]/30 border-t-[#c9a84c] rounded-full animate-spin mb-3" />
            <div className="text-sm text-[#f0ede8]/30">Loading audit…</div>
          </div>
        )}
        {state.status === "error" && (
          <div className="rounded-2xl border border-red-500/20 bg-red-500/05 p-8 text-center">
            <div className="text-sm text-red-400">{state.message}</div>
          </div>
        )}
 
        {state.status === "success" && !audit && (
          <div className="rounded-2xl border border-[#f0ede8]/06 bg-[#0e0e0d] p-8 text-sm text-[#f0ede8]/30 text-center">No audit data found.</div>
        )}
 
        {state.status === "success" && audit && (
          <>
            {/* Header card */}
            <section className="rounded-2xl border border-[#c9a84c]/20 bg-[#0e0e09] p-8 relative overflow-hidden">
              <div className="pointer-events-none absolute right-0 top-0 w-64 h-64 rounded-full opacity-[0.06]" style={{ background: "radial-gradient(ellipse, #c9a84c 0%, transparent 70%)", transform: "translate(30%, -30%)" }} />
              <div className="flex items-start justify-between gap-4 mb-1">
                <div>
                  <div className="text-xs font-semibold tracking-widest uppercase text-[#f0ede8]/35 mb-3">Shared Audit</div>
                  <h1 className="text-xl font-bold tracking-tight">AI Spend Audit Results</h1>
                  <p className="text-xs text-[#f0ede8]/35 mt-1">Public link — sanitized, no personal details.</p>
                </div>
              </div>
              <div className="mt-6 grid md:grid-cols-2 gap-4">
                <div className="rounded-xl bg-[#0a0a0a] border border-[#f0ede8]/06 p-4">
                  <div className="text-xs text-[#f0ede8]/35 tracking-wide uppercase mb-1">Monthly savings</div>
                  <div className="text-4xl font-bold text-[#c9a84c] tabular-nums">${audit.totals?.estimatedSavingsMonthlyUsd ?? 0}</div>
                </div>
                <div className="rounded-xl bg-[#0a0a0a] border border-[#f0ede8]/06 p-4">
                  <div className="text-xs text-[#f0ede8]/35 tracking-wide uppercase mb-1">Annual savings</div>
                  <div className="text-4xl font-bold text-[#f0ede8] tabular-nums">${audit.totals?.estimatedSavingsAnnualUsd ?? 0}</div>
                </div>
              </div>
            </section>
 
            {/* AI Narrative */}
            <section className="rounded-2xl border border-[#f0ede8]/06 bg-[#0e0e0d] overflow-hidden">
              <div className="flex items-center justify-between gap-4 p-5 border-b border-[#f0ede8]/06">
                <div>
                  <div className="text-sm font-semibold">AI narrative summary</div>
                  <div className="text-xs text-[#f0ede8]/30 mt-0.5">Generated from the sanitized audit payload.</div>
                </div>
                <button onClick={onGenerateNarrative} disabled={narrative.status === "loading"}
                  className="px-5 py-2 text-xs bg-[#c9a84c] text-[#0a0a0a] font-semibold rounded-lg hover:bg-[#e0bd68] transition-colors disabled:opacity-40 shrink-0">
                  {narrative.status === "loading" ? (
                    <span className="flex items-center gap-2"><span className="inline-block h-3 w-3 border border-[#0a0a0a]/30 border-t-[#0a0a0a] rounded-full animate-spin" />Generating…</span>
                  ) : "Generate summary"}
                </button>
              </div>
 
              <div className="p-5">
                {narrative.status === "idle" && (
                  <p className="text-sm text-[#f0ede8]/30">Click "Generate summary" to produce a narrative for this audit.</p>
                )}
                {narrative.status === "error" && <p className="text-sm text-red-400">{narrative.message}</p>}
                {narrative.status === "success" && (
                  <div className="space-y-5">
                    <div>
                      <div className="text-xs font-semibold tracking-widest uppercase text-[#f0ede8]/35 mb-2">Executive summary</div>
                      <p className="text-sm text-[#f0ede8]/70 leading-relaxed">{narrative.summary.executiveSummary}</p>
                    </div>
 
                    <div>
                      <div className="text-xs font-semibold tracking-widest uppercase text-[#f0ede8]/35 mb-2">Top findings</div>
                      <div className="space-y-2">
                        {narrative.summary.topFindings.map((f, idx) => (
                          <div key={idx} className="rounded-lg bg-[#0a0a0a] border border-[#f0ede8]/06 p-3 flex items-start gap-3">
                            <div className="h-5 w-5 rounded bg-[#c9a84c]/15 text-[#c9a84c] text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">{idx + 1}</div>
                            <div>
                              <span className="text-xs font-semibold text-[#f0ede8]/80">{f.title}: </span>
                              <span className="text-xs text-[#f0ede8]/50">{f.detail}</span>
                              {typeof f.impactUsdMonthly === "number" && (
                                <span className="text-xs text-[#c9a84c] ml-1">(≈ ${f.impactUsdMonthly}/mo)</span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
 
                    <div>
                      <div className="text-xs font-semibold tracking-widest uppercase text-[#f0ede8]/35 mb-2">Action plan</div>
                      <div className="space-y-1.5">
                        {narrative.summary.actionPlan.map((s, idx) => (
                          <div key={idx} className="flex items-start gap-2 text-xs text-[#f0ede8]/55">
                            <span className="text-[#c9a84c] shrink-0 mt-0.5">→</span>
                            <span>{s.step} <span className="text-[#f0ede8]/30">({s.owner})</span></span>
                          </div>
                        ))}
                      </div>
                    </div>
 
                    <div>
                      <div className="text-xs font-semibold tracking-widest uppercase text-[#f0ede8]/35 mb-2">Assumptions & caveats</div>
                      <div className="space-y-1">
                        {narrative.summary.assumptionsAndCaveats.map((c, idx) => (
                          <div key={idx} className="text-xs text-[#f0ede8]/35 flex gap-1.5"><span>·</span><span>{c}</span></div>
                        ))}
                      </div>
                    </div>
 
                    <div className="rounded-lg bg-[#0a0a0a] border border-[#f0ede8]/06 p-3 text-xs text-[#f0ede8]/30 leading-relaxed">
                      {narrative.summary.disclaimer}
                    </div>
 
                    <div className="text-xs text-[#f0ede8]/20">
                      Model: {narrative.model} · Prompt: {narrative.promptVersion}{narrative.cached ? " · cached" : ""}
                    </div>
                  </div>
                )}
              </div>
            </section>
 
            {/* Tools */}
            <section className="space-y-4">
              <h2 className="text-base font-semibold">Tools</h2>
              <div className="space-y-3">
                {(audit.items ?? []).map((item) => {
                  const currentPricing = item?.current?.planId ? getPricingEntry(item.current.planId) : null;
                  const action = item.recommendation?.action ?? "keep";
                  return (
                    <div key={item.tool} className="rounded-2xl border border-[#f0ede8]/06 bg-[#0e0e0d] p-5">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-start gap-3">
                          <div className="h-9 w-9 rounded-xl bg-[#f0ede8]/06 flex items-center justify-center text-xs font-bold text-[#f0ede8]/50 shrink-0 mt-0.5">
                            {(currentPricing?.tool ?? item.tool).charAt(0)}
                          </div>
                          <div>
                            <div className="text-sm font-semibold">{currentPricing?.tool ?? item.tool}</div>
                            <div className="text-xs text-[#f0ede8]/35 mt-0.5">
                              {currentPricing?.planName ?? item.current?.planId} · {item.current?.seats} seat(s) · ${item.current?.monthlySpendUsd}/mo
                            </div>
                          </div>
                        </div>
                        <div className="text-right shrink-0">
                          <div className={`inline-block text-xs font-semibold px-2.5 py-1 rounded-full mb-1 ${actionColors[action] ?? "text-[#f0ede8]/40 bg-[#f0ede8]/05"}`}>
                            {actionLabels[action] ?? action}
                          </div>
                          <div className="text-lg font-bold text-[#c9a84c] tabular-nums">${item.estimatedSavingsMonthlyUsd ?? 0}/mo</div>
                        </div>
                      </div>
                      <div className="mt-3 pt-3 border-t border-[#f0ede8]/06 space-y-1">
                        <div className="text-xs font-medium text-[#f0ede8]/55">
                          {action === "keep" && "Keep current setup"}
                          {action === "credits" && "Use discounted credits (SpendPilot)"}
                          {action === "downgrade" && item.recommendation?.recommendedPlanId ? `Switch to ${getPricingEntry(item.recommendation.recommendedPlanId).planName}` : null}
                          {action === "switch" && item.recommendation?.recommendedTool ? `Switch to ${item.recommendation.recommendedTool}` : null}
                        </div>
                        <p className="text-xs text-[#f0ede8]/35 leading-relaxed">{item.explanation}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
 
            {/* Lead capture */}
            <section className="rounded-2xl border border-[#f0ede8]/06 bg-[#0e0e0d] p-6 space-y-4">
              <div>
                <div className="text-sm font-semibold">Get help implementing these savings</div>
                <p className="text-xs text-[#f0ede8]/35 mt-1">Leave your email and we'll send a confirmation. SpendPilot may follow up if savings are large.</p>
              </div>
 
              {/* Honeypot */}
              <label className="hidden">Company<input value={leadCompanyTrap} onChange={(e) => setLeadCompanyTrap(e.target.value)} tabIndex={-1} autoComplete="off" /></label>
 
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
            </section>
 
            <div className="text-xs text-[#f0ede8]/20">Share ID: <span className="font-mono text-[#f0ede8]/30">{id}</span></div>
          </>
        )}
      </main>
    </div>
  );
}
 