## Day 1 — 2026-05-07

**Hours worked:** 3.5

**What I did:** Built Phase 1 of the React + Vite frontend. Added the landing page, audit form page, results placeholder page, and share placeholder page. Set up React Router for `/`, `/audit`, `/results`, and `/share/:id`. Implemented a typed `useAuditDraft` hook with `localStorage` persistence for team size, use case, and tool entries.

**What I learned:** Building the full user flow first makes iteration faster later. Persisting form state early also makes manual testing much easier.

**Blockers / what I'm stuck on:** `frontend/src/lib/server.ts` is using `process.env` inside the Vite frontend, which is breaking build/typecheck. Need to either switch to `import.meta.env` or move the helper out of the frontend.

**Plan for tomorrow:** Fix the build issue, create `PRICING_DATA.md` with official pricing sources, and start implementing the first audit engine rules with unit tests.

---

## Day 2 — 2026-05-08

**Hours worked:** 5

**What I did:** Implemented Phase 2 (pricing + audit engine). Added `PRICING_DATA.md` at the repo root with official pricing URLs and verification dates, then mirrored the same values into a typed pricing table in `frontend/src/audit/pricing.ts`. Built a deterministic, rule-based audit engine in `frontend/src/audit/engine.ts` that generates per-tool recommendations, estimated savings, and links back to pricing sources. Integrated the engine into the Results page so totals and per-tool breakdown render from real calculations instead of placeholder numbers.

**What I learned:** Having a single, traceable pricing source makes the audit logic much easier to justify and test. Writing unit tests early also helped keep the recommendation rules “tight” and prevented regressions while iterating.

**Blockers / what I'm stuck on:** Need to refine plan nuances (e.g., minimum seats on team tiers, usage-based plans, and the "retail vs credits" framing) so recommendations stay financially credible. Also still need to resolve the `frontend/src/lib/server.ts` build/typecheck issue (Vite env handling / moving server-only code out of the frontend).

**Plan for tomorrow:** Expand the rule set for Claude/ChatGPT (min seats + plan comparisons), improve credits logic and UI messaging, add more audit engine tests for the new rules, and start Phase 3 work on a proper shareable results flow.

---

## Day 3 — 2026-05-09

**Hours worked:** 6

**What I did:** Completed Phase 3 (shareable audits + OG tags + real persistence). Built backend endpoints for creating and retrieving share records (`POST /api/audits`, `GET /api/share/:id`) and an OG-tag HTML route (`GET /share/:id`) that redirects to the frontend share page. Replaced the in-memory share store with a Supabase-backed implementation using `@supabase/supabase-js`, created the `public.public_audits` table via `SUPABASE_SCHEMA.sql`, and wired the backend to read `SUPABASE_URL` + `SUPABASE_SERVICE_ROLE_KEY` via `dotenv`. On the frontend, kept the share UX (Results → “Create share link” → `/share/:id`) and verified the full flow end-to-end (create record, fetch record, OG meta tag HTML response).

**What I learned:** OG previews for share links don’t work reliably in SPAs without a server-rendered HTML response. Using Supabase with a service role key makes the MVP simple, but it requires careful secret handling (never expose the key client-side).

**Blockers / what I'm stuck on:** Need to rotate any leaked Supabase keys and ensure `.env` files are ignored by git. Still need to fix the lingering Vite build/typecheck issue around server-only Supabase helpers in the frontend (`frontend/src/lib/server.ts`).

**Plan for tomorrow:** Start Phase 4 by adding an LLM-generated narrative summary endpoint in the backend (with prompt versioning in `PROMPTS.md`), store the summary alongside the shared audit in Supabase, and render the narrative section on both Results and Share pages.

---

## Day 4 — 2026-05-10

**Hours worked:** 6.5

**What I did:** Completed Phase 4 and implemented Phase 5 lead capture. On Phase 4, I finished the backend narrative summary endpoint (`POST /api/narrative`) and made it reliable by enforcing a strict JSON schema (Zod validation) and adding a single "repair" retry if the model returns malformed output. I also updated the Supabase schema to include narrative columns (`narrative_summary`, `narrative_model`, `narrative_prompt_version`, `narrative_created_at`) using `ALTER TABLE ... ADD COLUMN IF NOT EXISTS` (because `CREATE TABLE IF NOT EXISTS` doesn’t apply upgrades). On the frontend, I kept the “Generate summary” UX on the shared audit page and rendered the narrative sections, along with model + prompt metadata.

For Phase 5, I added lead capture forms on both the Results and Share pages, created a new backend route (`POST /api/leads`) to persist leads into a new `public.leads` table in Supabase, and added basic abuse protection. Abuse protection includes per-route rate limiting (`express-rate-limit`) and a honeypot field that silently drops obvious bot submissions. I also added a unique index on `lower(email)` to reduce duplicate lead spam.

**What I learned:** Schema migrations in Supabase need explicit `ALTER TABLE` steps or existing projects will fail at runtime. For AI-generated JSON, “prompting harder” isn’t enough—server-side validation and retry/repair logic is needed to make the feature production-stable. On lead capture, a combination of rate limiting + honeypot provides a decent MVP baseline without adding extra services.

**Blockers / what I'm stuck on:** Still need to implement a real confirmation email (Resend/Postmark/SES) to fully satisfy the lead capture requirement, and add a fallback templated narrative if the LLM fails. Also need to finish the remaining required root docs + CI workflow and ensure commits are spread across at least 5 calendar days.

**Plan for tomorrow:** Implement confirmation email sending for leads, add graceful fallback narrative behavior on `/api/narrative`, then start the required deliverables (`ARCHITECTURE.md`, `TESTS.md`, `REFLECTION.md`, `GTM.md`, etc.) and GitHub Actions CI.

---

## Day 5 — 2026-05-11

**Hours worked:** 7

**What I did:** Finished the remaining “production-style SaaS” requirements that were still open. Implemented a deterministic fallback narrative summary so shared audits remain useful even if the LLM fails, and updated the narrative route to return a valid summary (and persist it) instead of throwing a 500. Implemented lead confirmation emails using Resend (configurable via env) and expanded lead capture to support optional `company` and `role` fields. Added a GitHub Actions CI workflow that runs frontend lint/tests/build and backend build on every push/PR. Created the remaining required root deliverable docs (architecture, tests, reflection, GTM/economics, landing copy, metrics) and updated the root README with setup instructions, deployment notes, and key technical tradeoffs.

On the engineering side, I fixed front-end lint blockers that would fail CI by restructuring the button component exports (to satisfy React Fast Refresh rules), tightening types on the share page payload, and removing remaining explicit `any` usage from linted code paths.

**What I learned:** Making an MVP “launchable” is often less about adding net-new features and more about reliability guardrails and submission packaging: failure modes (LLM errors), abuse protections, CI discipline, and clear documentation. Also, strict lint rules can force better component boundaries and more explicit typing, which pays off quickly once CI is in place.

**Blockers / what I'm stuck on:** The only remaining mandatory item that can’t be “coded” is `USER_INTERVIEWS.md`—it needs 3 real interviews with quotes and resulting design changes. Also still need to add screenshots/demo link and deployed URL to the README.

**Plan for tomorrow:** Conduct 3 user interviews (real founders/operators), update `USER_INTERVIEWS.md` with direct quotes and the specific changes made based on feedback, and add a short Loom demo + screenshots to the README. Then ensure commits are spread across the required calendar days.
