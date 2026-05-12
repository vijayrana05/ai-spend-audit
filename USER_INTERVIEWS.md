# USER_INTERVIEWS



## Interview 1
- **Name/Role:** Aditya, DevOps Lead
- **Company stage:** Large enterprise (S&P Global)
- **Direct quotes:**
  - “Okay, this is clean. I get it. You’re not trying to sell me a new tool, you’re trying to optimize what I already have. That’s a much easier conversation to have with my director.”
  - “The savings number is nice, but for me, the real value is seeing the seat count vs. spend. We have so much shelf-ware from people leaving or switching teams. I’d use this just for a quick headcount audit.”
  - “My first question was ‘are you going to ask for my billing credentials?’ The fact that it’s manual entry is a huge plus for any enterprise person. I can’t get approval to connect a third-party tool to anything billing-related in less than six months.”
- **Surprising insight:** He was less interested in the *savings* and more interested in the tool as a quick, no-permission-needed way to audit **seat licenses**. In a large company, just figuring out who is using what is a constant pain. He saw it as a lightweight asset management tool, not just a savings calculator.
- **Design changes made:** His feedback convinced me to make the “seats” input more prominent on the results page. I also added a line to the FAQ clarifying that no billing connection is needed, as this was a major point of trust for him.

## Interview 2
- **Name/Role:** Senior Engineer (anonymous)
- **Company stage:** Large enterprise (Visa)
- **Direct quotes:**
  - “The UI is simple, which is good. But what happens when a new model comes out? How do I know your pricing data isn’t stale? You need to show me when the pricing was last updated.”
  - “The share link is the ‘wow’ feature. I would never fill this out for myself, but I’d fill it out for my manager. I can send him the link and look smart for finding savings, without having to write a whole email explaining it.”
  - (Criticism) “The narrative summary feels a bit like a gimmick. It’s just rephrasing the results. I’d rather have a button that says ‘Copy for email’ that gives me a bulleted list of the findings I can paste into a message.”
- **Surprising insight:** The most surprising thing was his focus on the **social dynamics** of sharing the report. He immediately saw it as a tool for "managing up"—making his boss's life easier and demonstrating his own value. He didn't see himself as the end-user, but as the person who *creates the report for the decision-maker*.
- **Design changes made:** Based on his feedback, I added a `(prices last updated May 2026)` note to the pricing data source to build trust. I also considered his critique of the narrative summary; while I kept it, his idea for a "copy for email" feature is a top contender for a V2 improvement.

## Interview 3
- **Name/Role:** Ayush, Intern
- **Company stage:** Large enterprise (Morgan Stanley)
- **Direct quotes:**
  - “This is cool. The rules are smart. It caught the exact ChatGPT Team vs. Plus thing we were just talking about on my team.”
  - “You should add a rule for Claude. A lot of people are trying Sonnet for free but their teams are paying for Pro, and the math on when to switch to the Team plan is confusing.”
  - “I tried to break it by putting in a crazy high number for monthly spend, and the savings looked weird. You should probably cap the savings or have some kind of sanity check for when the inputs don’t make sense with the plan selected.”
- **Surprising insight:** He immediately started trying to "game" the engine and find its limits. His perspective as someone deep in the AI tools themselves meant he was thinking about edge cases and specific new models (like Claude 3 Sonnet) that weren't yet covered. He treated it like a puzzle to be solved.
- **Design changes made:** His feedback directly led to two changes. First, I **added Claude 3 plans** to the audit engine rules. Second, I implemented an **"overpayment anomaly" check** in the engine. Now, if a user reports a monthly spend that is wildly higher than the expected cost for that plan and seat count, the tool flags it as a potential data entry error or a major billing issue, which makes the results more robust.
