export type PrimaryUseCase = "coding" | "writing" | "data" | "research" | "mixed";

export type ToolKey =
  | "cursor"
  | "github_copilot"
  | "claude"
  | "chatgpt"
  | "anthropic_api"
  | "openai_api"
  | "gemini"
  | "windsurf";

export type ToolPlanId =
  | "cursor_hobby"
  | "cursor_pro"
  | "cursor_business"
  | "cursor_enterprise"
  | "copilot_individual"
  | "copilot_business"
  | "copilot_enterprise"
  | "claude_free"
  | "claude_pro"
  | "claude_max"
  | "claude_team"
  | "claude_enterprise"
  | "claude_api"
  | "chatgpt_plus"
  | "chatgpt_team"
  | "chatgpt_enterprise"
  | "chatgpt_api"
  | "anthropic_api"
  | "openai_api"
  | "gemini_pro"
  | "gemini_ultra"
  | "gemini_api"
  | "windsurf_free"
  | "windsurf_pro"
  | "windsurf_team";

export interface ToolSpendInput {
  tool: ToolKey;
  planId: ToolPlanId;
  monthlySpend: string; // store as string for safe input typing
  seats: string; // store as string for safe input typing
}

export interface AuditDraft {
  version: 1;
  teamSize: string;
  primaryUseCase: PrimaryUseCase;
  tools: ToolSpendInput[];
  updatedAt: number;
}
