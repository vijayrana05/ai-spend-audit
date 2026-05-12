## Day 1 — 2026-05-07

**Hours worked:** 3.5

**What I did:** Built Phase 1 of the React + Vite frontend. Added the landing page, audit form page, results placeholder page, and share placeholder page. Set up React Router for `/`, `/audit`, `/results`, and `/share/:id`. Also implemented a typed `useAuditDraft` hook with `localStorage` persistence for team size, use case, and tool entries so form progress wouldn’t get lost during testing.

**What I learned:** Building the complete user flow first made later iteration much faster. Setting up persistence early also saved a lot of time while manually testing the forms and navigation.

**Blockers / what I'm stuck on:** `frontend/src/lib/server.ts` is still using `process.env` inside the Vite frontend, which breaks the build/typecheck. Need to switch it to `import.meta.env` or move the helper into a server-only location.

**Plan for tomorrow:** Fix the build issue, create `PRICING_DATA.md` with official pricing references, and start implementing the first audit engine rules along with unit tests.

---

## Day 2 — 2026-05-08

**Hours worked:** 5

**What I did:** Implemented Phase 2 (pricing + audit engine). Added `PRICING_DATA.md` at the repo root with official pricing links and verification dates, then mirrored the values into a typed pricing table in `frontend/src/audit/pricing.ts`. Built a deterministic rule-based audit engine in `frontend/src/audit/engine.ts` that generates per-tool recommendations, estimated savings, and pricing source links. Integrated the engine into the Results page so the totals and tool breakdowns now come from actual calculations instead of placeholder values.

**What I learned:** Having one clear pricing source made the audit logic much easier to reason about and maintain. Writing tests alongside the rules also helped catch edge cases early before they became messy later.

**Blockers / what I'm stuck on:** Still need to improve handling for plan nuances like minimum seats, usage-based pricing, and credits vs retail pricing so recommendations stay realistic. The `frontend/src/lib/server.ts` env/build issue is also still unresolved.

**Plan for tomorrow:** Expand the ChatGPT/Claude recommendation rules, improve credits logic + UI messaging, add more tests for the updated rules, and begin work on the shareable results flow.

---

## Day 3 — 2026-05-09

**Hours worked:** 4

**What I did:** Finished Phase 3 (shareable audits + OG tags + persistence). Added backend endpoints for creating and retrieving shared audits (`POST /api/audits`, `GET /api/share/:id`) and built an OG-tag HTML route (`GET /share/:id`) that redirects to the frontend share page. Replaced the temporary in-memory store with a Supabase-backed implementation using `@supabase/supabase-js`, created the `public.public_audits` table via `SUPABASE_SCHEMA.sql`, and connected the backend to `SUPABASE_URL` + `SUPABASE_SERVICE_ROLE_KEY` through `dotenv`.

On the frontend side, I kept the share flow simple: Results → “Create share link” → `/share/:id`, then tested the full flow end-to-end including DB persistence and OG metadata rendering.

**What I learned:** OG previews don’t work reliably with pure SPAs unless the server returns actual HTML metadata. Supabase made persistence very quick to set up, but using a service role key also made secret handling much more important.

**Blockers / what I'm stuck on:** Need to rotate any exposed Supabase keys and double-check that `.env` files are fully ignored by git. The Vite build/typecheck issue around server-only helpers in `frontend/src/lib/server.ts` is also still pending.

**Plan for tomorrow:** Start Phase 4 by adding an LLM-generated narrative summary endpoint, introduce prompt versioning with `PROMPTS.md`, persist summaries in Supabase, and render them on both Results and Share pages.

---

## Day 4 — 2026-05-10

**Hours worked:** 4

**What I did:** Completed Phase 4 and implemented Phase 5 lead capture.

For Phase 4, I finished the backend narrative summary endpoint (`POST /api/narrative`) and made it more reliable by enforcing strict JSON schema validation with Zod and adding a retry/repair pass when the model returned malformed JSON. I also updated the Supabase schema to include narrative-related columns (`narrative_summary`, `narrative_model`, `narrative_prompt_version`, `narrative_created_at`) using `ALTER TABLE ... ADD COLUMN IF NOT EXISTS`.

On the frontend, I added the “Generate summary” flow and rendered narrative sections along with metadata about the model and prompt version used.

For Phase 5, I added lead capture forms on both the Results and Share pages, created a backend route (`POST /api/leads`) to persist leads into a new `public.leads` table, and added basic abuse protection. This included per-route rate limiting using `express-rate-limit` and a honeypot field to silently filter obvious bot submissions. I also added a unique index on `lower(email)` to reduce duplicate spam entries.

**What I learned:** AI-generated JSON becomes much more reliable once you combine prompting with server-side validation and retry logic. I also learned that Supabase schema updates need explicit migration steps instead of relying on `CREATE TABLE IF NOT EXISTS`.

**Blockers / what I'm stuck on:** Still need to add real confirmation emails (Resend/Postmark/SES) and implement a fallback narrative if the LLM completely fails. I also need to finish the remaining documentation deliverables and CI workflow setup.

**Plan for tomorrow:** Add confirmation email sending, implement graceful fallback narrative behavior, then start the required docs (`ARCHITECTURE.md`, `TESTS.md`, `REFLECTION.md`, `GTM.md`, etc.) and GitHub Actions CI.

---

## Day 5 — 2026-05-11

**Hours worked:** 3

**What I did:** Finished most of the remaining “production-style SaaS” requirements. Added a deterministic fallback narrative summary so shared audits still return useful output even if the LLM fails, and updated the narrative endpoint to persist fallback summaries instead of returning a 500.

Implemented lead confirmation emails using Resend and expanded the lead form to support optional `company` and `role` fields. Added a GitHub Actions CI workflow that runs frontend lint/tests/build and backend build on every push and PR.

I also completed the remaining root-level deliverable docs including architecture, testing, reflection, GTM/economics, landing copy, and metrics documentation. Updated the README with setup instructions, deployment notes, and technical tradeoffs.

On the frontend side, I fixed several lint issues that were failing CI by restructuring button exports for React Fast Refresh compatibility, tightening share page typing, and removing leftover explicit `any` usage from linted paths.

**What I learned:** Shipping an MVP is often more about reliability, edge cases, and polish than adding new features. CI, error handling, abuse protection, and documentation ended up taking a lot more time than expected, but they also made the project feel much more complete.

**Blockers / what I'm stuck on:** The only remaining mandatory item is `USER_INTERVIEWS.md`, since it requires real interviews and feedback quotes. I also still need to add screenshots/demo links and the deployed URL to the README.

**Plan for tomorrow:** Conduct 3 user interviews, document quotes + resulting changes in `USER_INTERVIEWS.md`, add a short Loom demo and screenshots to the README, and make sure commits are distributed across the required calendar days.

---

## Day 6 — 2026-05-12

**Hours worked:** 2

**What I did:** Deployed the backend to Render and the frontend to Vercel from the same monorepo using separate service root directories. Connected the deployed frontend to the deployed backend using the `VITE_BACKEND_BASE_URL` environment variable after discovering the live build was still falling back to `localhost`, causing `ERR_CONNECTION_REFUSED`.

I also validated the lead capture pipeline end-to-end by creating the `public.leads` table in Supabase from `backend/SUPABASE_SCHEMA.sql` and confirming inserts from both the Results and Share pages.

In addition, I configured Resend for transactional emails and verified the integration path using env-based API keys. While testing, I ran into Resend’s sandbox restriction where `resend.dev` sender domains can only send emails to the account owner unless a custom domain is verified, and documented that behavior for deployment notes.

Finally, I reran the frontend test suite to make sure the audit engine and UI flows were still stable after the deployment-related changes.

**What I learned:** A lot of production issues come from deployment wiring rather than application logic. Environment variables, base URLs, backend connectivity, and provider-specific restrictions can easily break features that work perfectly in local development.

**Blockers / what I'm stuck on:** None. Core MVP functionality, CI, deployment setup, and integrations are complete. The remaining tasks are mostly optional polish items like verified email domains, more screenshots, and additional interview feedback.