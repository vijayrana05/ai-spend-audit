# PROMPTS

This document stores the exact prompts used for any model-generated output.

## Phase 4 — Narrative summary

### Purpose
Generate a concise, non-salesy narrative summary of a spend audit result. The summary should:
- Highlight the biggest savings opportunities
- Call out any questionable inputs / assumptions
- Be explicit that pricing is based on the tool's pricing pages (see the audit sources)
- Avoid making claims about a vendor's internal usage or contract terms

### Input payload
We send a sanitized `auditResult` object:
- totals: current spend, estimated savings monthly/annual
- items: per-tool current plan/spend and the rule-based recommendation

### Output format
Return strict JSON matching this TypeScript shape:

```ts
export type NarrativeSummary = {
  executiveSummary: string;
  topFindings: Array<{ title: string; detail: string; impactUsdMonthly?: number }>;
  actionPlan: Array<{ step: string; owner: "finance" | "engineering" | "it" | "founder" | "other" }>;
  assumptionsAndCaveats: string[];
  disclaimer: string;
};
```

### Prompt (v1)
**System**
You are a careful financial analyst. You do not invent facts. You only reason from the provided JSON. You write clearly and concisely.

**User**
Given this spend audit JSON, produce a narrative summary as strict JSON matching the required schema. Do not include Markdown. Do not include any keys that are not in the schema.

AUDIT_JSON:
{{AUDIT_JSON}}

Constraints:
- If there are no savings opportunities, say so.
- Use USD amounts when stating impacts.
- Keep executiveSummary under 80 words.
- disclaimer must mention this is an estimate and users should verify against invoices and vendor pricing pages.

### Versioning
- Current prompt version: `phase4_narrative_v1`

---

## Phase 5 — Lead capture (non-model)

Phase 5 adds user lead capture (email) so users can request follow-up after seeing results.

- Collection points:
  - Results page CTA (private, after running an audit)
  - Shared audit page CTA (public, tied to `shareId`)
- Storage: Supabase table `public.leads`
- Notes:
  - No model prompts are used in this phase.
  - Automated email sending is intentionally not implemented yet (MVP stores leads only).

### Abuse protection (MVP)

This project implements basic abuse protection on the backend:

- **Rate limiting:** `express-rate-limit` is applied per-route.
  - `/api/narrative`: low limit (LLM calls are expensive)
  - `/api/leads`: low limit (prevents spam)
  - `/api/share/:id`: higher limit (public sharing reads)
  - `/api/audits`: moderate limit (prevents DB spam)

Planned next step (not yet implemented):
- **Honeypot field** on the lead form + backend rejection if filled.
- Optionally **hCaptcha** if the app is exposed publicly.
