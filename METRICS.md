# METRICS

## North Star metric (and why)
**North Star:** **Qualified consults booked per week** (consultation bookings where the audit indicates **>$500/month** in potential savings).

**Why this is the North Star:** This tool only matters to Credex if it produces high-intent conversations that can convert into a credits purchase. “Leads captured” can be inflated (curiosity, students, spam). “Audits completed” can be vanity. A booked consult tied to meaningful savings is the closest early-stage proxy for real revenue intent.

## 3 input metrics that drive the North Star
1. **Completed audits per week**
   - Definition: number of users who reach Results with a computed audit (not just start the form).
   - Why it matters: it’s the top-of-funnel volume feeding everything else.

2. **Share links created per completed audit (%)**
   - Definition: share creations / completed audits.
   - Why it matters: sharing is the main distribution loop, and “create share link” correlates with perceived value.

3. **Qualified lead capture rate (%)**
   - Definition: (emails submitted with savings > $500/mo) / (completed audits with savings > $500/mo).
   - Why it matters: measures how well the results page converts the highest-value segment.

## What I’d instrument first
Start with low-effort, high-signal server-side counters (no fancy analytics required):
- `POST /api/public-audits` → count share creations
- `GET /share/:id` + OG route hits → count share opens
- `POST /api/leads` → count lead submits (also log honeypot drops + rate-limit blocks)
- `POST /api/narrative` → count generations + fallback rate + validation failures

Then add a lightweight client event tracker later (PostHog/GA): audit start, audit complete, CTA clicked, share clicked.

## Pivot trigger (specific number)
After **14 days**, pivot/iterate hard on messaging or the funnel if:
- **Qualified lead capture rate < 8%**, OR
- **Qualified consults booked < 3/week** despite **≥100 completed audits/week**.

Those thresholds indicate the tool is getting usage but not generating enough high-intent action to justify continued investment.
