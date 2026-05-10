import { GoogleGenerativeAI } from "@google/generative-ai";
import type { NarrativeSummary } from "../types/narrative";

function required(name: string): string {
  const v = process.env[name];
  if (!v) throw new Error(`Missing required env var: ${name}`);
  return v;
}

// Default matches Google AI Studio model picker (can be overridden via GEMINI_MODEL)
export const GEMINI_MODEL = process.env.GEMINI_MODEL ?? "gemini-3-flash-preview";

const OUTPUT_SCHEMA = {
  type: "object",
  additionalProperties: false,
  required: ["executiveSummary", "topFindings", "actionPlan", "assumptionsAndCaveats", "disclaimer"],
  properties: {
    executiveSummary: { type: "string" },
    topFindings: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        required: ["title", "detail"],
        properties: {
          title: { type: "string" },
          detail: { type: "string" },
          impactUsdMonthly: { type: "number" },
        },
      },
    },
    actionPlan: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        required: ["step", "owner"],
        properties: {
          step: { type: "string" },
          owner: { type: "string", enum: ["finance", "engineering", "it", "founder", "other"] },
        },
      },
    },
    assumptionsAndCaveats: { type: "array", items: { type: "string" } },
    disclaimer: { type: "string" },
  },
} as const;

type NarrativeInput =
  | { mode: "audit"; auditResult: unknown }
  | { mode: "repair"; repairPrompt: string };

export async function generateNarrativeSummary(input: NarrativeInput): Promise<NarrativeSummary> {
  const apiKey = required("GEMINI_API_KEY");

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: GEMINI_MODEL });

  const prompt =
    input.mode === "repair"
      ? input.repairPrompt
      : "You are a careful financial analyst. You do not invent facts. You only reason from the provided JSON.\n" +
        "Return ONLY valid JSON. No Markdown. No code fences.\n\n" +
        "You MUST follow this JSON Schema exactly (arrays must contain objects, not strings):\n" +
        JSON.stringify(OUTPUT_SCHEMA) +
        "\n\nAUDIT_JSON:\n" +
        JSON.stringify(input.auditResult) +
        "\n\nConstraints:\n" +
        "- If there are no savings opportunities, say so.\n" +
        "- Use USD amounts when stating impacts.\n" +
        "- Keep executiveSummary under 80 words.\n" +
        "- disclaimer must mention this is an estimate and users should verify against invoices and vendor pricing pages.";

  const resp = await model.generateContent(prompt);
  const text = resp.response.text();

  // Gemini sometimes wraps JSON in code fences; strip if present.
  const cleaned = text
    .trim()
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/```\s*$/i, "")
    .trim();

  let parsed: unknown;
  try {
    parsed = JSON.parse(cleaned);
  } catch {
    throw new Error(`Model did not return valid JSON (model=${GEMINI_MODEL}). Raw text: ${text.slice(0, 400)}`);
  }

  return parsed as NarrativeSummary;
}
