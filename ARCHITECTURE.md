# ARCHITECTURE

## Overview
AI Spend Audit is a production-style SaaS MVP that helps startups analyze AI tool subscription/API spend, estimate savings, generate a shareable audit link, and capture leads for Credex.

## High-level diagram

```mermaid
graph TD
  U[User in Browser] --> FE[Frontend (Vite + React + TS)]
  FE -->|POST audit payload| BE[Backend (Express + TS)]
  BE -->|Insert/Select| SB[(Supabase Postgres)]
  BE -->|Generate narrative| LLM[Gemini API]
  BE -->|Send confirmation| EM[Resend Email API]
  U -->|Open shared link| BE
  BE -->|OG HTML + redirect| FE
```

## Data flow

### Create audit + share
1. User enters tool plans/spend/seats + team size + use case.
2. Frontend runs a **rule-based audit engine** (no AI used for calculations).
3. User clicks **Create share link**.
4. Frontend sends sanitized `auditResult` to backend (`POST /api/audits`).
5. Backend stores the payload in Supabase table `public.public_audits`.
6. Backend returns `shareId` and share path.

### Shared audit page + OG tags
- Public OG crawlers request `GET /share/:id` (backend serves OG tags + redirects).
- The browser loads the SPA route `/share/:id`.
- Frontend fetches the sanitized audit via `GET /api/share/:id`.

### Narrative summary
- Frontend calls `POST /api/narrative`.
- Backend loads the audit payload from Supabase.
- If narrative is cached, returns it.
- If not cached:
  - Attempt Gemini narrative generation with strict JSON schema validation + one repair retry.
  - On model failure, return a deterministic **fallback template narrative**.
  - Persist summary and metadata to Supabase.

### Lead capture
- Results and Share pages submit email (+ optional company/role) to `POST /api/leads`.
- Backend rate-limits and honeypot-filters submissions.
- Backend stores the lead in Supabase table `public.leads`.
- Backend attempts to send a confirmation email via Resend (no-op if not configured).

## Stack justification
- **Vite + React + TS:** fast iteration, strong typing for pricing + audit engine.
- **Express backend:** simple API + OG HTML endpoint without SSR complexity.
- **Supabase Postgres:** production-ready persistence with minimal ops overhead.
- **Gemini API:** narrative summarization only (calculations remain rule-based).
- **Resend:** lightweight transactional email sending.

## Scaling discussion (10k audits/day)
- Move rate limiting to a shared store (Redis/Upstash) when running multiple backend instances.
- Cache public audit fetches (CDN edge) for hot share links.
- Async narrative generation (queue) if LLM latency/cost becomes a bottleneck.
- Add monitoring + alerting (e.g., request rate, error rate, LLM spend).
- Partition or TTL older public audits/leads depending on retention policy.
