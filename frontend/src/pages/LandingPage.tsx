import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="mx-auto flex max-w-5xl items-center justify-between px-4 py-6">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-primary" />
          <span className="text-sm font-semibold tracking-tight">Credex • AI Spend Audit</span>
        </div>
        <Link to="/audit">
          <Button>Start free audit</Button>
        </Link>
      </header>

      <main className="mx-auto grid max-w-5xl gap-8 px-4 pb-16 pt-10 md:grid-cols-2 md:items-center">
        <section className="space-y-4">
          <h1 className="text-balance text-4xl font-semibold tracking-tight md:text-5xl">
            Find wasted spend across Cursor, ChatGPT, Claude, Copilot, Gemini — in 3 minutes.
          </h1>
          <p className="text-pretty text-base text-muted-foreground md:text-lg">
            A "Mint for AI subscriptions". Enter what you pay and your team size. Get a defensible audit
            with plan downgrades, alternatives, and expected monthly + annual savings.
          </p>
          <div className="flex flex-wrap gap-3 pt-2">
            <Link to="/audit">
              <Button size="lg">Start audit</Button>
            </Link>
            <Link to="/audit">
              <Button variant="outline" size="lg">
                See how it works
              </Button>
            </Link>
          </div>
          <div className="pt-4 text-sm text-muted-foreground">
            No login required. We only ask for your email after the results.
          </div>
        </section>

        <section className="rounded-2xl border bg-card p-6 shadow-sm">
          <div className="text-sm font-medium">What you’ll get</div>
          <ul className="mt-4 space-y-3 text-sm text-muted-foreground">
            <li>• Per-tool breakdown (current spend → recommended plan/tool)</li>
            <li>• Total monthly + annual savings (highlighted)</li>
            <li>• Shareable audit link (sanitized)</li>
            <li>• Optional Credex consultation when savings are meaningful</li>
          </ul>
          <div className="mt-6 rounded-xl bg-muted p-4">
            <div className="text-xs font-medium text-muted-foreground">Example outcome</div>
            <div className="mt-2 grid grid-cols-2 gap-3 text-sm">
              <div className="rounded-lg border bg-background p-3">
                <div className="text-xs text-muted-foreground">Monthly savings</div>
                <div className="mt-1 text-2xl font-semibold">$420</div>
              </div>
              <div className="rounded-lg border bg-background p-3">
                <div className="text-xs text-muted-foreground">Annual savings</div>
                <div className="mt-1 text-2xl font-semibold">$5,040</div>
              </div>
            </div>
            <div className="mt-3 text-xs text-muted-foreground">
              Example only — your audit uses rule-based calculations.
            </div>
          </div>
        </section>
      </main>

      <footer className="mx-auto max-w-5xl px-4 pb-10 text-xs text-muted-foreground">
        Credex is a discounted AI infrastructure credits provider. This tool helps you identify waste and
        opportunities to reduce costs.
      </footer>
    </div>
  );
}