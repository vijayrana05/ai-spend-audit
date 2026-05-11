# TESTS

## How to run

### Frontend
- Unit tests:
  - `cd frontend && npm test`
- Watch mode:
  - `cd frontend && npm run test:watch`

### Backend
- Currently: build/typecheck only
  - `cd backend && npm run build`

## What is covered

### Audit engine (required)
At least 5 unit tests specifically cover the rule-based audit engine.

- `frontend/src/audit/__tests__/engine.test.ts`
  - verifies downgrade/switch/credits recommendations
  - verifies savings calculations
  - verifies pricing entry resolution

## Notes
- Narrative generation is intentionally not unit-tested end-to-end (external Gemini API). Instead, JSON schema validation + fallback behavior is enforced in the backend route.
