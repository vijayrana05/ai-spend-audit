# AI Spend Audit

Production-style SaaS MVP for Credex: a "Mint for AI subscriptions" that helps startups audit AI tool spend, estimate savings, generate a shareable report, generate an AI-written narrative, and capture leads.

## Features
- Spend input form with persistence (localStorage)
- Rule-based audit engine (no AI used for calculations)
- Polished results page with totals + per-tool breakdown
- Shareable public audit URLs with Open Graph + Twitter card previews
- AI-generated narrative summary (Gemini) with strict JSON schema validation + fallback template
- Lead capture (email + optional company/role) stored in Supabase, with abuse protection and confirmation email support (Resend)

## Screenshots / demo
- TODO: Add screenshots or a Loom/Youtube demo link

## Tech stack
- Frontend: Vite + React + TypeScript + Tailwind
- Backend: Express + TypeScript
- Database: Supabase Postgres
- AI: Gemini API (narrative summary only)
- Email: Resend (optional; configured via env)

## Local setup

### 1) Frontend
- `cd frontend`
- create `.env.local`:
  - `VITE_BACKEND_BASE_URL=http://localhost:8787`
- `npm install`
- `npm run dev`

### 2) Backend
- `cd backend`
- create `.env`:
  - `SUPABASE_URL=...`
  - `SUPABASE_SERVICE_ROLE_KEY=...`
  - `GEMINI_API_KEY=...`
  - optional email:
    - `RESEND_API_KEY=...`
    - `RESEND_FROM=Credex <no-reply@yourdomain.com>`
    - `APP_BASE_URL=http://localhost:5173`
- `npm install`
- `npm run dev`

### 3) Supabase schema
Run `backend/SUPABASE_SCHEMA.sql` in the Supabase SQL editor.

## Deployment
- Frontend: Vercel (Vite)
- Backend: Render/Fly.io/Railway (Express)
- Supabase: hosted Postgres

## Important technical tradeoffs (5)
1. **Rule-based audit engine:** calculations are deterministic for credibility and testability.
2. **Backend OG tags:** share previews require server-served HTML; SPA alone is not enough.
3. **Service-role Supabase key in backend:** simplifies MVP writes, but must never reach the browser.
4. **Schema validation for LLM JSON:** prompts are not sufficient; Zod + repair retry + fallback template improves reliability.
5. **Rate limiting + honeypot vs hCaptcha:** MVP uses low-friction protections; hCaptcha can be added if abuse increases.

## Docs
- `ARCHITECTURE.md`
- `PRICING_DATA.md`
- `PROMPTS.md`
- `TESTS.md`
- `DEVLOG.md`
- Business docs: `GTM.md`, `ECONOMICS.md`, `LANDING_COPY.md`, `METRICS.md`, `USER_INTERVIEWS.md`