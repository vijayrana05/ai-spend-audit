import { describe, expect, it } from "vitest";
import { runAudit } from "@/audit/engine";
import type { AuditDraft } from "@/types/audit";

function draftWithTools(tools: AuditDraft["tools"]): AuditDraft {
  return {
    version: 1,
    teamSize: "5",
    primaryUseCase: "coding",
    tools,
    updatedAt: Date.now(),
  };
}

describe("audit engine (Phase 2)", () => {
  it("recommends ChatGPT Plus instead of Team for <=2 seats when cheaper", () => {
    const d = draftWithTools([
      { tool: "chatgpt", planId: "chatgpt_team", monthlySpend: "60", seats: "1" },
    ]);

    const result = runAudit(d);
    expect(result.items[0]?.recommendation.action).toBe("downgrade");
    expect(result.items[0]?.recommendation.recommendedPlanId).toBe("chatgpt_plus");
    expect(result.items[0]?.estimatedSavingsMonthlyUsd).toBe(40);
  });

  it("recommends Copilot Individual instead of Business for a single seat when cheaper", () => {
    const d = draftWithTools([
      { tool: "github_copilot", planId: "copilot_business", monthlySpend: "19", seats: "1" },
    ]);

    const result = runAudit(d);
    expect(result.items[0]?.recommendation.recommendedPlanId).toBe("copilot_individual");
    expect(result.items[0]?.estimatedSavingsMonthlyUsd).toBe(9);
  });

  it("recommends Cursor Pro instead of Business for <=2 seats when cheaper", () => {
    const d = draftWithTools([
      { tool: "cursor", planId: "cursor_business", monthlySpend: "80", seats: "2" },
    ]);

    const result = runAudit(d);
    expect(result.items[0]?.recommendation.recommendedPlanId).toBe("cursor_pro");
    expect(result.items[0]?.estimatedSavingsMonthlyUsd).toBe(40);
  });

  it("recommends credits for meaningful API spend and estimates 10% savings", () => {
    const d = draftWithTools([
      { tool: "openai_api", planId: "openai_api", monthlySpend: "2000", seats: "1" },
    ]);

    const result = runAudit(d);
    expect(result.items[0]?.recommendation.action).toBe("credits");
    expect(result.items[0]?.estimatedSavingsMonthlyUsd).toBe(200);
  });

  it("does not recommend credits when API spend is low (keeps)", () => {
    const d = draftWithTools([
      { tool: "openai_api", planId: "openai_api", monthlySpend: "40", seats: "1" },
    ]);

    const result = runAudit(d);
    expect(result.items[0]?.recommendation.action).toBe("keep");
    expect(result.items[0]?.estimatedSavingsMonthlyUsd).toBe(0);
  });
});
