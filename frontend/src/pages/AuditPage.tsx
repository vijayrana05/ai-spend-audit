import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuditDraft } from "@/state/useAuditDraft";
import type { ToolKey, ToolPlanId } from "@/types/audit";

const TOOL_OPTIONS: Array<{ key: ToolKey; label: string; plans: Array<{ id: ToolPlanId; label: string }> }> = [
  {
    key: "cursor",
    label: "Cursor",
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
    plans: [
      { id: "copilot_individual", label: "Individual" },
      { id: "copilot_business", label: "Business" },
      { id: "copilot_enterprise", label: "Enterprise" },
    ],
  },
  {
    key: "claude",
    label: "Claude",
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
    plans: [
      { id: "chatgpt_plus", label: "Plus" },
      { id: "chatgpt_team", label: "Team" },
      { id: "chatgpt_enterprise", label: "Enterprise" },
      { id: "chatgpt_api", label: "API direct" },
    ],
  },
  {
    key: "anthropic_api",
    label: "Anthropic API (direct)",
    plans: [{ id: "anthropic_api", label: "API direct" }],
  },
  {
    key: "openai_api",
    label: "OpenAI API (direct)",
    plans: [{ id: "openai_api", label: "API direct" }],
  },
  {
    key: "gemini",
    label: "Gemini",
    plans: [
      { id: "gemini_pro", label: "Pro" },
      { id: "gemini_ultra", label: "Ultra" },
      { id: "gemini_api", label: "API" },
    ],
  },
  {
    key: "windsurf",
    label: "Windsurf",
    plans: [
      { id: "windsurf_free", label: "Free" },
      { id: "windsurf_pro", label: "Pro" },
      { id: "windsurf_team", label: "Team" },
    ],
  },
];

export default function AuditPage() {
  const navigate = useNavigate();
  const { draft, setTeamSize, setPrimaryUseCase, upsertTool, removeTool } = useAuditDraft();

  const selectedToolKeys = useMemo(() => new Set(draft.tools.map((t) => t.tool)), [draft.tools]);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="mx-auto flex max-w-5xl items-center justify-between px-4 py-6">
        <div className="text-sm font-semibold tracking-tight">Credex • AI Spend Audit</div>
        <Button variant="outline" onClick={() => navigate("/")}
        >
          Back
        </Button>
      </header>

      <main className="mx-auto max-w-5xl space-y-8 px-4 pb-16">
        <section className="space-y-2">
          <h1 className="text-3xl font-semibold tracking-tight">Enter your AI tool spend</h1>
          <p className="text-sm text-muted-foreground">
            This is saved locally in your browser (so refresh won’t wipe it).
          </p>
        </section>

        <section className="grid gap-4 rounded-2xl border bg-card p-6 shadow-sm md:grid-cols-2">
          <div className="space-y-2">
            <label className="text-sm font-medium">Team size</label>
            <input
              className="h-10 w-full rounded-md border bg-background px-3 text-sm"
              inputMode="numeric"
              value={draft.teamSize}
              onChange={(e) => setTeamSize(e.target.value)}
              placeholder="e.g. 8"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Primary use case</label>
            <select
              className="h-10 w-full rounded-md border bg-background px-3 text-sm"
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
        </section>

        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Tools</h2>
            <div className="text-xs text-muted-foreground">Add only what you actively pay for.</div>
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            {TOOL_OPTIONS.map((tool) => {
              const selected = selectedToolKeys.has(tool.key);
              const entry = draft.tools.find((t) => t.tool === tool.key);

              return (
                <div key={tool.key} className="rounded-2xl border bg-card p-5 shadow-sm">
                  <div className="flex items-center justify-between">
                    <div className="font-medium">{tool.label}</div>
                    {selected ? (
                      <Button variant="outline" size="sm" onClick={() => removeTool(tool.key)}>
                        Remove
                      </Button>
                    ) : (
                      <Button
                        size="sm"
                        onClick={() =>
                          upsertTool({
                            tool: tool.key,
                            planId: tool.plans[0]!.id,
                            monthlySpend: "",
                            seats: "1",
                          })
                        }
                      >
                        Add
                      </Button>
                    )}
                  </div>

                  {selected && entry ? (
                    <div className="mt-4 grid gap-3">
                      <div className="grid gap-2">
                        <label className="text-xs font-medium text-muted-foreground">Plan</label>
                        <select
                          className="h-10 w-full rounded-md border bg-background px-3 text-sm"
                          value={entry.planId}
                          onChange={(e) => upsertTool({ ...entry, planId: e.target.value as ToolPlanId })}
                        >
                          {tool.plans.map((p) => (
                            <option key={p.id} value={p.id}>
                              {p.label}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div className="grid gap-2">
                          <label className="text-xs font-medium text-muted-foreground">Monthly spend ($)</label>
                          <input
                            className="h-10 w-full rounded-md border bg-background px-3 text-sm"
                            inputMode="decimal"
                            value={entry.monthlySpend}
                            onChange={(e) => upsertTool({ ...entry, monthlySpend: e.target.value })}
                            placeholder="e.g. 60"
                          />
                        </div>
                        <div className="grid gap-2">
                          <label className="text-xs font-medium text-muted-foreground">Seats</label>
                          <input
                            className="h-10 w-full rounded-md border bg-background px-3 text-sm"
                            inputMode="numeric"
                            value={entry.seats}
                            onChange={(e) => upsertTool({ ...entry, seats: e.target.value })}
                            placeholder="e.g. 3"
                          />
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="mt-3 text-sm text-muted-foreground">
                      Add this tool if you pay for it.
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        <section className="flex items-center justify-between rounded-2xl border bg-card p-6 shadow-sm">
          <div>
            <div className="text-sm font-medium">Next: Generate your audit</div>
            <div className="text-xs text-muted-foreground">Phase 1 uses a placeholder result.</div>
          </div>
          <Button onClick={() => navigate("/results")}>Generate audit</Button>
        </section>
      </main>
    </div>
  );
}