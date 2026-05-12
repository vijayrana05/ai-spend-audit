# ARCHITECTURE

## 1) System diagram

```mermaid
graph TD
  U[User (Browser)] --> FE[Frontend: Vite + React + TypeScript]

  FE -->|Run deterministic rules| AE[Audit Engine (in-browser)]
  AE -->|AuditResult JSON| FE

  FE -->|POST /api/audits (sanitized auditResult)| BE[Backend: Express + TypeScript]
  BE -->|Insert/Select| SB[(Supabase Postgres)]

  FE -->|GET /api/share/:id| BE
  BE -->|audit_result JSON| FE

  OG[Social crawler (Slack/X)] -->|GET /share/:id| BE
  BE -->|OG HTML + redirect| OG

  FE -->|POST /api/narrative| BE
  BE -->|Gemini API (JSON)| LLM[Google Gemini]

  FE -->|POST /api/leads| BE
  BE -->|Best-effort confirm email| EM[Resend]
```

## 2) Data flow: user input → audit result

### A) Capture inputs (frontend)
1. User enters:
   - team size
   - primary use case
   - tools used (tool + plan + seats + monthly spend)
2. Inputs are saved to `localStorage` via `useAuditDraft` so refreshes don’t lose progress.

### B) Compute the audit (deterministic engine)
1. When the user generates results, the frontend runs `runAudit(draft)`.
2. The audit engine:
   - treats user-entered monthly spend as the source of truth for “current spend”
   - applies rules (downgrade/switch/credits/anomaly detection)
   - produces an `AuditResult` with totals + per-tool recommendations
3. The Results UI renders directly from `AuditResult`.

### C) Create a share link (backend + DB)
1. User clicks “Create share link”.
2. Frontend sends a **sanitized** payload to `POST /api/audits`.
   - No lead PII (email/company/role) is included in the public audit payload.
3. Backend stores the payload in Supabase table `public.public_audits`.
4. Backend returns a `shareId`.

### D) View shared results + link previews (OG)
1. When someone opens `/share/:id`:
   - Social crawlers hit the backend route `GET /share/:id` which returns OG/Twitter meta tags for a clean link preview.
   - A browser loads the SPA route `/share/:id`, which then fetches the JSON audit payload from `GET /api/share/:id`.

### E) Generate narrative summary (optional LLM)
1. Frontend calls `POST /api/narrative` for a given `shareId`.
2. Backend:
   - loads the stored audit payload from Supabase
   - returns a cached narrative if present
   - otherwise calls Gemini and enforces a strict JSON schema (with a single repair retry)
   - if Gemini fails, returns a deterministic fallback narrative so the feature degrades gracefully
3. Backend stores the narrative + metadata back onto the share record.

### F) Lead capture (backend + DB + email)
1. Results and Share pages submit lead data to `POST /api/leads`.
2. Backend applies abuse protections (rate limiting + honeypot).
3. Lead is stored in Supabase table `public.leads`.
4. Backend attempts to send a confirmation email via Resend (no-op if not configured).

## 3) Stack choices (why this stack)
- **Vite + React + TypeScript:** fast iteration, strong typing, and a clean way to keep the audit engine deterministic and testable.
- **Deterministic audit engine in the browser:** avoids hallucinated numbers and keeps results explainable with unit tests.
- **Express + TypeScript backend:** minimal server to support persistence, OG tags, narrative generation, and lead capture.
- **Supabase Postgres:** production-grade persistence with low setup cost; simple JSON storage for `audit_result`.
- **Gemini:** used only for narrative (copy), not the math.
- **Resend:** simple transactional email API suitable for MVP confirmation emails.

## 4) What I’d change for 10k audits/day
- **Move expensive work off the request path:** narrative generation should be async (queue + worker) with retries and backoff.
- **Add caching/CDN for share reads:** cache `GET /share/:id` OG HTML and `GET /api/share/:id` responses at the edge for hot links.
- **Stronger rate limiting + bot defense:** use a shared store (Redis/Upstash) for rate limits across multi-instance deploys; consider hCaptcha for lead forms.
- **DB posture:** add retention/TTL policies for old audits/leads, and consider partitioning if tables grow large.
- **Observability:** structured logs, request tracing, and dashboards for latency/error rate; track LLM usage/cost and email delivery failures.
- **Security hardening:** tighten CORS to known origins, add RLS policies where appropriate, and rotate/lock down service keys.
