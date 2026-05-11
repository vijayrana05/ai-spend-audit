# REFLECTION

## Hardest bug (150–400 words)
The hardest bug was getting Phase 4 narrative summaries to work reliably end-to-end across Supabase + Gemini. The initial implementation “worked locally” but failed in production-style reality because schema changes weren’t applied to an existing Supabase table. I originally relied on `CREATE TABLE IF NOT EXISTS`, which does not upgrade an already-created table. The backend started throwing runtime errors like “column narrative_summary does not exist”, even though the schema file looked correct.

After fixing the schema with explicit `ALTER TABLE ... ADD COLUMN IF NOT EXISTS`, the next issue was model availability. Gemini returned a 404 when I guessed a model ID; the key only had access to specific models visible in AI Studio. Once the model was fixed, the final reliability issue was output shape: sometimes the model produced nearly-correct JSON but with subtle schema violations (string arrays vs object arrays). Prompt tweaks alone didn’t solve it consistently. The production-grade fix was adding server-side JSON parsing + Zod validation and a single repair retry, plus a deterministic fallback summary if the model fails.

## A decision I reversed (150–400 words)
I initially considered keeping the backend “thin” and handling most logic on the frontend for speed: do the audit in the browser, store the result, and just render it. That worked for Phase 2 and Phase 3. But for Phase 4 and Phase 5, I reversed the decision: narrative generation and lead capture needed backend enforcement to be credible and safe.

Narrative summaries need strict schema validation, retry behavior, error handling, and caching. Doing this in the frontend would expose API keys or require awkward proxying. Lead capture also needs abuse protections (rate limiting, honeypots) that are ineffective if implemented purely client-side. Moving these responsibilities server-side made the app feel more like a real SaaS product rather than a demo.

This also pushed me to treat Supabase schema as a real migration problem (ALTERs, indexes, dedupe constraints) instead of “just storing JSON”. In hindsight, that reversal was essential for reliability.

## What I’d build in week 2 (150–400 words)
In week 2, I’d focus on productization and growth loops. First, I would improve pricing governance so the `PRICING_DATA.md` source-of-truth is enforced automatically (a validation script/test that fails CI if code pricing diverges from the doc). Second, I’d add a PDF export and an embeddable widget because those increase sharing and make the audit feel more “report-like” to a founder.

On the SaaS side, I’d introduce account-based saved audits (auth) for repeat use, plus an admin dashboard for lead triage. I’d also add attribution tracking (UTM params on share links), event tracking, and A/B tests for the lead capture CTA.

On engineering, I’d convert the backend to a more deployable target (e.g., serverless functions or container), add proper logging/metrics, and implement robust RLS policies if any direct Supabase client access is introduced.

## How AI tools were used (150–400 words)
AI tools were used primarily as a coding assistant and for narrative generation. During development, I used an assistant to help plan the work in phases, scaffold React pages/routes quickly, generate initial drafts of TypeScript types, and suggest patterns for schema validation and error handling. I still manually reviewed all business logic and ensured the audit engine remained deterministic and rule-based.

In the product itself, AI is used only for the narrative summary feature. The assistant helped design prompts that are non-salesy and constrained, but the system does not rely on AI for any financial calculations. To keep the AI output safe and production-like, I added strict JSON parsing + schema validation and a fallback narrative template.

## Self-rating (150–400 words)
I’d rate this submission an 8/10 for an MVP. The core loop works end-to-end: founders can enter spend, see a defensible audit, generate a shareable link with OG tags, generate a narrative summary, and submit their email as a lead (with basic abuse protection and confirmation email support). The UI is clean and the architecture is simple.

The biggest gaps are in the “submission packaging” and operational polish: several required business docs and the 7-day devlog/commit history requirement still need work. The backend lacks automated tests beyond typechecking. The CI pipeline exists for frontend tests and builds, but could be expanded.

With another week, I’d strengthen pricing governance, add better observability, implement more robust security/RLS policies, and make the growth funnel more measurable.
