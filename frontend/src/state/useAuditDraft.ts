import { useEffect, useMemo, useState } from "react";
import type { AuditDraft, PrimaryUseCase, ToolKey, ToolSpendInput } from "@/types/audit";

const STORAGE_KEY = "ai-spend-audit:draft:v1";

const DEFAULT_DRAFT: AuditDraft = {
  version: 1,
  teamSize: "",
  primaryUseCase: "coding",
  tools: [],
  updatedAt: Date.now(),
};

function safeParse(json: string | null): AuditDraft | null {
  if (!json) return null;
  try {
    const parsed = JSON.parse(json) as AuditDraft;
    if (parsed?.version !== 1) return null;
    if (!Array.isArray(parsed.tools)) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function useAuditDraft() {
  const [draft, setDraft] = useState<AuditDraft>(() => {
    const existing = safeParse(localStorage.getItem(STORAGE_KEY));
    return existing ?? DEFAULT_DRAFT;
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(draft));
  }, [draft]);

  const actions = useMemo(() => {
    return {
      setTeamSize: (teamSize: string) =>
        setDraft((d) => ({ ...d, teamSize, updatedAt: Date.now() })),

      setPrimaryUseCase: (primaryUseCase: PrimaryUseCase) =>
        setDraft((d) => ({ ...d, primaryUseCase, updatedAt: Date.now() })),

      upsertTool: (toolInput: ToolSpendInput) =>
        setDraft((d) => {
          const next = d.tools.slice();
          const idx = next.findIndex((t) => t.tool === toolInput.tool);
          if (idx >= 0) next[idx] = toolInput;
          else next.push(toolInput);
          return { ...d, tools: next, updatedAt: Date.now() };
        }),

      removeTool: (tool: ToolKey) =>
        setDraft((d) => ({
          ...d,
          tools: d.tools.filter((t) => t.tool !== tool),
          updatedAt: Date.now(),
        })),

      reset: () => setDraft({ ...DEFAULT_DRAFT, updatedAt: Date.now() }),
    };
  }, []);

  return { draft, ...actions };
}
