import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuditDraft } from "@/state/useAuditDraft";

export default function ResultsPage() {
  const { draft } = useAuditDraft();

  // Phase 1 placeholder numbers (real audit engine comes in Phase 2)
  const totalMonthlySavings = 420;
  const totalAnnualSavings = totalMonthlySavings * 12;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="mx-auto flex max-w-5xl items-center justify-between px-4 py-6">
        <div className="text-sm font-semibold tracking-tight">Credex • AI Spend Audit</div>
        <Link to="/audit">
          <Button variant="outline">Edit inputs</Button>
        </Link>
      </header>

      <main className="mx-auto max-w-5xl space-y-6 px-4 pb-16">
        <section className="rounded-2xl border bg-card p-6 shadow-sm">
          <div className="text-sm font-medium text-muted-foreground">Estimated savings</div>
          <div className="mt-2 grid gap-3 md:grid-cols-2">
            <div className="rounded-xl border bg-background p-5">
              <div className="text-xs text-muted-foreground">Monthly</div>
              <div className="mt-1 text-4xl font-semibold">${totalMonthlySavings}</div>
            </div>
            <div className="rounded-xl border bg-background p-5">
              <div className="text-xs text-muted-foreground">Annual</div>
              <div className="mt-1 text-4xl font-semibold">${totalAnnualSavings}</div>
            </div>
          </div>
          <div className="mt-4 text-sm text-muted-foreground">
            Phase 1 note: these are placeholder values so we can polish the UI and user flow first.
          </div>
        </section>

        <section className="rounded-2xl border bg-card p-6 shadow-sm">
          <h2 className="text-lg font-semibold">Your inputs (saved locally)</h2>
          <div className="mt-4 grid gap-2 text-sm">
            <div>
              <span className="text-muted-foreground">Team size:</span> {draft.teamSize || "—"}
            </div>
            <div>
              <span className="text-muted-foreground">Use case:</span> {draft.primaryUseCase}
            </div>
            <div className="pt-2 text-muted-foreground">Tools:</div>
            {draft.tools.length === 0 ? (
              <div className="text-muted-foreground">No tools added yet.</div>
            ) : (
              <ul className="list-disc pl-5">
                {draft.tools.map((t) => (
                  <li key={t.tool}>
                    {t.tool} — {t.planId} — ${t.monthlySpend || "0"}/mo — {t.seats} seat(s)
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>

        <section className="rounded-2xl border bg-card p-6 shadow-sm">
          <h2 className="text-lg font-semibold">Credex recommendation</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Phase 1 placeholder: Credex upsell logic and lead capture are implemented later.
          </p>
        </section>
      </main>
    </div>
  );
}
