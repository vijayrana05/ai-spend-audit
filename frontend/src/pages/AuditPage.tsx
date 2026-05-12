import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useAuditDraft } from "@/state/useAuditDraft";
import type { ToolKey, ToolPlanId } from "@/types/audit";
 
const TOOL_OPTIONS: Array<{ key: ToolKey; label: string; icon: string; plans: Array<{ id: ToolPlanId; label: string }> }> = [
  {
    key: "cursor",
    label: "Cursor",
    icon: "C",
    plans: [
      { id: "cursor_hobby", label: "Hobby" },
      { id: "cursor_pro", label: "Pro" },
      { id: "cursor_business", label: "Business" },
      { id: "cursor_enterprise", label: "Enterprise" },
    ],
  },
  {
    key: "github_copilot",
    label: "GitHub Copilot",
    icon: "G",
    plans: [
      { id: "copilot_individual", label: "Individual" },
      { id: "copilot_business", label: "Business" },
      { id: "copilot_enterprise", label: "Enterprise" },
    ],
  },
  {
    key: "claude",
    label: "Claude",
    icon: "A",
    plans: [
      { id: "claude_free", label: "Free" },
      { id: "claude_pro", label: "Pro" },
      { id: "claude_max", label: "Max" },
      { id: "claude_team", label: "Team" },
      { id: "claude_enterprise", label: "Enterprise" },
      { id: "claude_api", label: "API direct" },
    ],
  },
  {
    key: "chatgpt",
    label: "ChatGPT",
    icon: "O",
    plans: [
      { id: "chatgpt_plus", label: "Plus" },
      { id: "chatgpt_team", label: "Team" },
      { id: "chatgpt_enterprise", label: "Enterprise" },
      { id: "chatgpt_api", label: "API direct" },
    ],
  },
  {
    key: "anthropic_api",
    label: "Anthropic API",
    icon: "A",
    plans: [{ id: "anthropic_api", label: "API direct" }],
  },
  {
    key: "openai_api",
    label: "OpenAI API",
    icon: "O",
    plans: [{ id: "openai_api", label: "API direct" }],
  },
  {
    key: "gemini",
    label: "Gemini",
    icon: "G",
    plans: [
      { id: "gemini_pro", label: "Pro" },
      { id: "gemini_ultra", label: "Ultra" },
      { id: "gemini_api", label: "API" },
    ],
  },
  {
    key: "windsurf",
    label: "Windsurf",
    icon: "W",
    plans: [
      { id: "windsurf_free", label: "Free" },
      { id: "windsurf_pro", label: "Pro" },
      { id: "windsurf_team", label: "Team" },
    ],
  },
];
 
const inputCls = "h-10 w-full rounded-lg border border-[#f0ede8]/10 bg-[#0a0a0a] px-3 text-sm text-[#f0ede8] placeholder-[#f0ede8]/25 focus:outline-none focus:border-[#c9a84c]/50 transition-colors";
const labelCls = "text-xs font-medium tracking-wide uppercase text-[#f0ede8]/40";
 
export default function AuditPage() {
  const navigate = useNavigate();
  const { draft, setTeamSize, setPrimaryUseCase, upsertTool, removeTool } = useAuditDraft();
 
  const selectedToolKeys = useMemo(() => new Set(draft.tools.map((t) => t.tool)), [draft.tools]);
  const totalMonthly = draft.tools.reduce((sum, t) => sum + (parseFloat(t.monthlySpend) || 0) * (parseInt(t.seats) || 1), 0);
 
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
            <span className="text-xs font-semibold tracking-widest uppercase text-[#f0ede8]/50">SpendPilot · AI Spend Audit</span>
          </div>
          <div className="flex items-center gap-3">
            
            
            <button onClick={() => navigate("/")} className="px-4 py-1.5 text-xs border border-[#f0ede8]/15 text-[#f0ede8]/50 rounded hover:border-[#f0ede8]/30 hover:text-[#f0ede8]/80 transition-all">
              ← Back
            </button>
          </div>
        </div>
      </header>
 
      <main className="mx-auto max-w-6xl px-6 pb-20 pt-10 space-y-10">
        {/* Title */}
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight">Enter your AI tool spend</h1>
          <p className="text-sm text-[#f0ede8]/35">Saved locally in your browser — refreshing won't clear it.</p>
        </div>
 
        {/* Context row */}
        <div className="grid md:grid-cols-2 gap-4 p-6 rounded-2xl border border-[#f0ede8]/08 bg-[#0e0e0d]">
          <div className="space-y-2">
            <label className={labelCls}>Team size</label>
            <input
              className={inputCls}
              inputMode="numeric"
              value={draft.teamSize}
              onChange={(e) => setTeamSize(e.target.value)}
              placeholder="e.g. 8"
            />
          </div>
          <div className="space-y-2">
            <label className={labelCls}>Primary use case</label>
            <select
              className={inputCls + " cursor-pointer"}
              value={draft.primaryUseCase}
              onChange={(e) => setPrimaryUseCase(e.target.value as typeof draft.primaryUseCase)}
            >
              <option value="coding">Coding</option>
              <option value="writing">Writing</option>
              <option value="data">Data</option>
              <option value="research">Research</option>
              <option value="mixed">Mixed</option>
            </select>
          </div>
        </div>
 
        {/* Tools */}
        <div className="space-y-4">
          <div className="flex items-baseline justify-between">
            <h2 className="text-base font-semibold">Tools</h2>
            <p className="text-xs text-[#f0ede8]/30">Add only what you actively pay for</p>
          </div>
 
          <div className="grid gap-3 md:grid-cols-2">
            {TOOL_OPTIONS.map((tool) => {
              const selected = selectedToolKeys.has(tool.key);
              const entry = draft.tools.find((t) => t.tool === tool.key);
 
              return (
                <div
                  key={tool.key}
                  className={`rounded-2xl border transition-all duration-200 ${selected ? "border-[#c9a84c]/30 bg-[#111008]" : "border-[#f0ede8]/06 bg-[#0e0e0d]"}`}
                >
                  <div className="flex items-center justify-between p-5">
                    <div className="flex items-center gap-3">
                      <div className={`h-8 w-8 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 ${selected ? "bg-[#c9a84c] text-[#0a0a0a]" : "bg-[#f0ede8]/08 text-[#f0ede8]/40"}`}>
                        {tool.icon}
                      </div>
                      <span className={`text-sm font-semibold ${selected ? "text-[#f0ede8]" : "text-[#f0ede8]/60"}`}>{tool.label}</span>
                    </div>
 
                    {selected ? (
                      <button
                        onClick={() => removeTool(tool.key)}
                        className="text-xs px-3 py-1.5 border border-[#f0ede8]/15 text-[#f0ede8]/40 rounded-lg hover:border-red-500/40 hover:text-red-400 transition-all"
                      >
                        Remove
                      </button>
                    ) : (
                      <button
                        onClick={() => upsertTool({ tool: tool.key, planId: tool.plans[0]!.id, monthlySpend: "", seats: "1" })}
                        className="text-xs px-3 py-1.5 border border-[#c9a84c]/40 text-[#c9a84c] rounded-lg hover:bg-[#c9a84c] hover:text-[#0a0a0a] transition-all"
                      >
                        + Add
                      </button>
                    )}
                  </div>
 
                  {selected && entry ? (
                    <div className="px-5 pb-5 space-y-3 border-t border-[#c9a84c]/10 pt-4">
                      <div className="space-y-1.5">
                        <label className={labelCls}>Plan</label>
                        <select
                          className={inputCls}
                          value={entry.planId}
                          onChange={(e) => upsertTool({ ...entry, planId: e.target.value as ToolPlanId })}
                        >
                          {tool.plans.map((p) => (
                            <option key={p.id} value={p.id}>{p.label}</option>
                          ))}
                        </select>
                      </div>
 
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1.5">
                          <label className={labelCls}>Monthly spend ($)</label>
                          <input
                            className={inputCls}
                            inputMode="decimal"
                            value={entry.monthlySpend}
                            onChange={(e) => upsertTool({ ...entry, monthlySpend: e.target.value })}
                            placeholder="e.g. 60"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <label className={labelCls}>Seats</label>
                          <input
                            className={inputCls}
                            inputMode="numeric"
                            value={entry.seats}
                            onChange={(e) => upsertTool({ ...entry, seats: e.target.value })}
                            placeholder="e.g. 3"
                          />
                        </div>
                      </div>
                    </div>
                  ) : !selected ? (
                    <div className="px-5 pb-5 text-xs text-[#f0ede8]/25">
                      Add this tool if you actively pay for it.
                    </div>
                  ) : null}
                </div>
              );
            })}
          </div>
        </div>
 
        {/* Footer CTA */}
        <div className="flex items-center justify-between rounded-2xl border border-[#c9a84c]/20 bg-[#0e0e09] p-6">
          <div>
            <div className="text-sm font-semibold">Ready to generate your audit?</div>
            <div className="text-xs text-[#f0ede8]/35 mt-0.5">
              {draft.tools.length === 0
                ? "Add at least one tool to continue."
                : `${draft.tools.length} tool${draft.tools.length > 1 ? "s" : ""} added — total ${totalMonthly > 0 ? `$${totalMonthly.toFixed(0)}/mo` : "entered"}.`}
            </div>
          </div>
          <button
            onClick={() => navigate("/results")}
            className="px-6 py-2.5 bg-[#c9a84c] text-[#0a0a0a] text-sm font-semibold rounded-lg hover:bg-[#e0bd68] transition-colors disabled:opacity-40"
          >
            Generate audit →
          </button>
        </div>
      </main>
    </div>
  );
}
 