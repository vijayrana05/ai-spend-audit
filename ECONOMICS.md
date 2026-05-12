# ECONOMICS

These are rough, decision-making numbers for an MVP. The goal is to sanity-check whether an AI spend audit funnel can be profitable for Credex if deployed tomorrow.

## 1) What is a converted lead worth to Credex?
Assume Credex monetizes via a **credits deal** (OpenAI/Anthropic/etc.) with a take-rate / margin.

### Deal size assumptions (per customer)
- Typical target customer from this funnel: **Seed–Series A** startup with **10–30 engineers**.
- Likely API spend if they care enough to run an audit: **$2k–$15k/month**.

For a midpoint model:
- **Average credits purchase volume:** $6,000/month
- **Gross margin / take rate to Credex:** 15% (could be lower/higher depending on structure)
- **Gross margin per month:** $6,000 × 0.15 = **$900/month**
- **Gross margin per year:** $900 × 12 = **$10,800/year**

### Retention assumption
- If the customer stays on credits for **12 months** on average:
  - **Gross margin per customer (LTV, gross):** **$10.8k**

### Converted lead value
Not every lead converts. So “lead value” depends on whether you mean:
- **Value of a lead that converts to a credit purchase** (i.e., a customer): ≈ **$10.8k gross margin**
- **Expected value per captured lead** (blended): depends on conversion rate (modeled below)

## 2) CAC by channel (from the GTM plan)
Because this is $0 paid budget, CAC is mostly **time cost**. I’ll convert time to dollars so we can compare channels.

Assume fully-loaded cost for founder/operator time: **$100/hour** (rough, but reasonable).

### Channel A — Community posts (HN / Reddit / Indie Hackers)
- Work: 1 strong post + screenshots + responding to comments ≈ **2 hours**
- Cost/post: 2 × $100 = **$200**
- If a post drives 200 visits, 40 completed audits, 6 leads:
  - **CAC per lead:** $200 / 6 = **$33/lead**

### Channel B — LinkedIn content (CTO-facing)
- Work: write + image + comments ≈ **1.5 hours** → **$150/post**
- If a post drives 120 visits, 25 completed audits, 4 leads:
  - **CAC per lead:** $150 / 4 = **$38/lead**

### Channel C — Founder-led outbound (personalized DMs/emails)
- Work: 12 personalized messages/day × ~5 min each ≈ **1 hour/day** → **$100/day**
- Assume 12 messages → 3 clicks → 1 completed audit → 0.3 leads (30% lead capture from completions)
  - Leads/day ≈ 0.3
  - **CAC per lead:** $100 / 0.3 ≈ **$333/lead**

Interpretation: outbound is expensive per lead, but tends to produce **higher intent** leads (better downstream conversion), so it can still be worth it.

## 3) Funnel conversion required to be profitable
Let’s define a simple funnel:
- **Audit completed → consultation booked → credit purchase**

Assume:
- Gross margin per customer (12-mo): **$10,800**
- CAC per captured lead:
  - Community/LinkedIn blended: **$35/lead**
  - Outbound: **$333/lead**

Now add conversion rates.

### Model A (organic/community)
Assume per 1,000 completed audits:
- Lead capture rate from completed audits: **15%** → 150 leads
- Consultation booking rate from leads: **20%** → 30 consults
- Purchase rate from consults: **20%** → 6 customers

Economics:
- Gross margin: 6 × $10,800 = **$64,800**
- Lead acquisition cost: 150 leads × $35 = **$5,250**
- **Gross profit after CAC:** $64,800 − $5,250 = **$59,550**

This is strongly profitable if those conversion rates hold.

### Break-even conversion math (organic)
For 1 captured lead:
- Expected value = (P(lead→consult) × P(consult→purchase) × $10,800)
- Break-even when expected value ≥ CAC

Let:
- lead→consult = **c**
- consult→purchase = **p**
- CAC per lead = **$35**

Break-even:
- c × p × 10,800 ≥ 35
- c × p ≥ 35 / 10,800 ≈ **0.00324** (0.324%)

Examples that break even:
- If c = 10%, then p needs to be ≥ 3.24%
- If c = 20%, then p needs to be ≥ 1.62%

So the bar is low on paper for organic, assuming the $10.8k gross LTV is realistic.

### Model B (outbound)
CAC per lead is higher: **$333/lead**
Break-even:
- c × p × 10,800 ≥ 333
- c × p ≥ 333 / 10,800 ≈ **0.0308** (3.08%)

Examples:
- If c = 25%, then p must be ≥ 12.3%
- If c = 30%, then p must be ≥ 10.3%

Outbound only works if the consult-to-purchase conversion is meaningfully higher (which is plausible because outbound targets “already spending / already feeling pain”).

## 4) What must be true for $1M ARR in 18 months
Interpretation: $1M ARR = ~$83,333 in revenue/month. If we model “ARR” as Credex gross margin (not top-line credits volume), then using the same margin assumptions:

### Translate $1M ARR into credits volume
If Credex margin is 15%:
- Needed monthly credits volume = $83,333 / 0.15 ≈ **$555,553/month**

If average customer purchases $6,000/month in credits:
- Active customers needed = $555,553 / $6,000 ≈ **93 customers**

So the question becomes: can the tool acquire ~**93 active credit customers** by month 18?

### Customer acquisition math
Assume (blended) per month by month 18:
- Completed audits/month: **2,000**
- Lead capture: **15%** → 300 leads
- Lead→consult: **20%** → 60 consults
- Consult→purchase: **15%** → 9 new customers/month

If average customer retention is ~12 months, steady-state active base after ramp can approach:
- Active customers ≈ (new customers/month) × (months retained)
- 9 × 12 = **108 active customers**

That supports ~$1M ARR gross-margin-equivalent under the assumptions.

### What has to be true (concrete conditions)
To reach that, at least these need to hold:
1. **Distribution works organically:** consistent sources of 2,000+ completed audits/month by month 18 (community + LinkedIn + referrals + Credex distribution).
2. **High-intent segment exists:** a meaningful fraction of audits include API spend large enough to justify credits (e.g., $2k+/mo).
3. **Sales motion is lightweight:** booking a consult and converting doesn’t require heavy enterprise procurement; it’s a founder/CTO decision.
4. **Retention is real:** customers stick for ~12 months (or spend grows over time).
5. **Credex offer is materially better:** either discounted effective rates or operational convenience that makes “switching to credits” an obvious next step.

## 5) Notes / sensitivity
The model is most sensitive to:
- **Average monthly credits volume per customer** ($2k vs $6k vs $15k)
- **Margin / take rate** (10% vs 15% vs 25%)
- **Lead→consult and consult→purchase conversion**

Even if inputs are off by 2×, the economics can still work because the gross LTV per converted customer is large relative to organic CAC—*but only if the tool reliably finds companies with meaningful AI spend.*
