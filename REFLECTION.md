# REFLECTION

## 1) Hardest bug this week + how I debugged it 
The hardest bug was getting the “narrative summary” feature (Phase 4) to behave reliably end-to-end across deployment. Locally, I could hit `POST /api/narrative` and see a response, but in the deployed environment I started getting inconsistent failures. My first hypothesis was “bad env vars / missing API key,” because 404s and auth issues look similar from the client side. I verified the backend logs and confirmed the Gemini call was succeeding sometimes, so I shifted to the second hypothesis: “the storage layer is rejecting writes.” That led me to Supabase errors like “column narrative_summary does not exist.”

The key discovery was that my schema file had the right columns, but the actual table in Supabase was created earlier. `CREATE TABLE IF NOT EXISTS` doesn’t modify an existing table, so the database never got the new narrative columns. I tried re-running the schema SQL and saw no change, which confirmed the hypothesis. The fix that worked was writing explicit `ALTER TABLE ... ADD COLUMN IF NOT EXISTS` statements (and running them) so existing tables were upgraded safely.

After that, I hit a second reliability issue: the model occasionally returned JSON that was “almost correct” but violated my expected shape. I tried prompt tightening, but the only durable solution was adding strict server-side JSON parsing + Zod validation and a single “repair” retry, plus a deterministic fallback narrative if validation still fails.

## 2) A decision I reversed mid-week 
Mid-week I reversed a decision about where “serious” logic should live. Early on, I optimized for speed by keeping the backend thin: the audit is deterministic, so running it in the browser felt fine, and the backend initially only existed to store/retrieve share records and serve OG metadata. That approach let me iterate quickly on the UI and rules.

However, once I added narrative generation and lead capture, I changed my mind. My initial hypothesis was “I can keep this frontend-first and just call third-party APIs directly.” But that immediately conflicted with basic product sanity: narrative generation requires an API key, and lead capture needs abuse protections (rate limiting and honeypots) that aren’t enforceable if the client can bypass them. I also wanted the narrative output to be constrained and validated before it is stored or shown.

What made me reverse the decision was realizing that credibility and safety matter more than minimizing code. Moving narrative + leads into the backend gave me: (1) secret management (no keys in the browser), (2) server-side schema validation and consistent error handling, (3) a single place to add guardrails, and (4) less opportunity for clients to spoof lead submissions. It also forced me to treat Supabase schema as a migration problem (ALTERs, indexes, dedupe constraints) instead of “just dump JSON,” which ultimately improved reliability.

## 3) What I would build in week 2 
In week 2 I’d focus on making the MVP feel more like a product a founder could actually use repeatedly and share confidently.

First, I’d add “pricing governance” so the audit engine can’t silently drift from the documented pricing assumptions. Concretely: a validation script/test that parses `PRICING_DATA.md` (or a structured extracted artifact generated from it) and fails CI if the values used in code don’t match the doc. That reduces the risk of recommendations being based on stale numbers.

Second, I’d add a PDF export and/or “share as report” flow. A clean PDF with the inputs, assumptions, findings, and recommendations would make the audit more credible in investor/founder contexts, and it would increase viral sharing. In the same theme, an embeddable widget (iframe) that shows the headline savings and a CTA could turn every shared audit into a lightweight acquisition channel.

Third, I’d productize retention: user accounts (auth) with saved audits, plus a simple dashboard for revisiting past audits and tracking changes over time. That opens the door to recurring usage.

Finally, I’d make the growth funnel measurable: UTM attribution on share links, event tracking for key steps (audit run, narrative generated, share created, lead submitted), and A/B tests on the lead capture CTA and the “share” prompt. On the engineering side, I’d add real observability (structured logs + metrics), and tighten security with robust RLS if any direct client Supabase access is introduced later.

## 4) How I used AI tools
I used an AI coding assistant (in VS Code) mainly to accelerate UI work and reduce “blank page” time. The most valuable usage was on page/layout design: rough component structure for the Landing/Audit/Results/Share pages, naming suggestions, and small UX touches (copy variations, empty states, error states). I also used it for mechanical tasks like drafting TypeScript types, suggesting Express route structure, and generating an initial Zod schema shape to validate narrative output.

What I did not trust AI with was the business logic and the pricing math. The audit engine is deterministic and rule-based, and I manually wrote/reviewed the decision logic and thresholds because this is where “one wrong assumption” creates misleading recommendations. I also didn’t trust AI to make security decisions (rate limiting behavior, Supabase service-role usage, CORS) without verification.

One specific time the AI was wrong: it suggested that re-running `CREATE TABLE IF NOT EXISTS` would “update” my existing Supabase table to include new columns. That’s false in Postgres—existing tables are not modified. I caught it because the runtime error still said the column didn’t exist after a re-run. I validated by inspecting the table schema and then fixed it correctly with `ALTER TABLE ... ADD COLUMN IF NOT EXISTS`.

Overall, AI sped up scaffolding and UI iteration, but I treated it like an assistant that proposes drafts—not an authority for correctness.

## 5) Self-ratings 
- **Discipline — 10/10:** I iterated in small, testable increments, kept the app deployable as features landed, and worked through integration issues (Supabase/env/model access) until the core loop was stable.
- **Code quality — 7/10:** The code is readable and type-safe with clear separation (frontend audit engine vs backend persistence), but backend testing and more consistent error/telemetry patterns would raise confidence.
- **Design sense — 6/10:** The UI is clean and usable, but it’s still “MVP simple” and could benefit from stronger visual hierarchy, more polished spacing/typography, and a more distinctive brand system.
- **Problem solving — 8/10:** I formed concrete hypotheses (env vs DB schema vs model vs JSON shape), used logs and reproduction to narrow causes, and added durable fixes (migrations, validation, fallback paths).
- **Entrepreneurial thinking — 8/10:** I prioritized shareability, lead capture, and credibility guardrails, and I identified week-2 work that improves retention and measurable growth loops (attribution, events, A/B tests).
