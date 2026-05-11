# METRICS

## North Star metric
- **Qualified leads per week** (email submissions where estimated savings > $500/mo)

## Supporting metrics
- Audit starts
- Audit completions
- Results page views
- Share link creations
- Share link opens
- Narrative summary generations (and fallback rate)
- Lead submissions (total, deduped, spam-dropped via honeypot)

## Instrumentation plan
MVP instrumentation can be simple:
- Server logs counters for API endpoints
- Add client-side event tracking later (PostHog/GA)

## Pivot trigger
- If <5% of completed audits lead to email capture after 2 weeks, iterate on results page value and CTA.
- If narrative generation failure/fallback >10%, adjust prompt/model/retry strategy.
