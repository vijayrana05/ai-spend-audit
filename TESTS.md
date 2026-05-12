# TESTS

## How to run

### Frontend
- Unit tests (Vitest):
  - `cd frontend && npm test`
- Watch mode:
  - `cd frontend && npm run test:watch`

### Backend
- Build + TypeScript typecheck (no unit test runner yet):
  - `cd backend && npm run build`

## Every automated test written

### `frontend/src/audit/__tests__/engine.test.ts`
**Framework:** Vitest

This file contains **5 automated unit tests** that specifically cover the deterministic, rule-based audit engine (`runAudit`).

#### Test 1 — ChatGPT downgrade rule
- **Test name:** `recommends ChatGPT Plus instead of Team for <=2 seats when cheaper`
- **Covers:** ChatGPT plan downgrade recommendation.
- **Asserts:**
  - `recommendation.action === "downgrade"`
  - `recommendation.recommendedPlanId === "chatgpt_plus"`
  - `estimatedSavingsMonthlyUsd === 40`

#### Test 2 — GitHub Copilot downgrade rule
- **Test name:** `recommends Copilot Individual instead of Business for a single seat when cheaper`
- **Covers:** Copilot Business → Copilot Individual downgrade for a single seat.
- **Asserts:**
  - `recommendation.recommendedPlanId === "copilot_individual"`
  - `estimatedSavingsMonthlyUsd === 9`

#### Test 3 — Cursor downgrade rule
- **Test name:** `recommends Cursor Pro instead of Business for <=2 seats when cheaper`
- **Covers:** Cursor Business → Cursor Pro downgrade for small teams.
- **Asserts:**
  - `recommendation.recommendedPlanId === "cursor_pro"`
  - `estimatedSavingsMonthlyUsd === 40`

#### Test 4 — API credits recommendation rule
- **Test name:** `recommends credits for meaningful API spend and estimates 10% savings`
- **Covers:** Credit-based recommendation for high API spend.
- **Asserts:**
  - `recommendation.action === "credits"`
  - `estimatedSavingsMonthlyUsd === 200` (10% of $2000)

#### Test 5 — No API credits recommendation when spend is low
- **Test name:** `does not recommend credits when API spend is low (keeps)`
- **Covers:** Ensures low API spend does not trigger the credits recommendation.
- **Asserts:**
  - `recommendation.action === "keep"`
  - `estimatedSavingsMonthlyUsd === 0`

### How to run this test file
- Run all frontend unit tests:
  - `cd frontend && npm test`

## What is covered (summary)
- **Frontend:** Audit engine rules, savings calculations, and pricing entry resolution (via `engine.test.ts`).
- **Backend:** automated coverage is currently limited to **build/typecheck** (`npm run build`). Narrative generation is intentionally not unit-tested end-to-end because it depends on an external Gemini API; instead, the backend enforces JSON parsing + schema validation + fallback behavior.

## CI / GitHub Actions
- Workflow file: `.github/workflows/ci.yml`
- Runs on every push to `main` (and on PRs):
  - **Frontend:** `npm run lint`, `npm test`, `npm run build`
  - **Backend:** `npm run build`

Notes:
- The required minimum is **5 audit-engine tests** that actually run; `npm test` in `frontend/` runs all 5 and should pass.
