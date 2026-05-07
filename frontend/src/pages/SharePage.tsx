import { Link, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";

export default function SharePage() {
  const { id } = useParams();

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="mx-auto flex max-w-5xl items-center justify-between px-4 py-6">
        <div className="text-sm font-semibold tracking-tight">Credex • Shared Audit</div>
        <Link to="/">
          <Button variant="outline">Home</Button>
        </Link>
      </header>

      <main className="mx-auto max-w-5xl space-y-6 px-4 pb-16">
        <section className="rounded-2xl border bg-card p-6 shadow-sm">
          <h1 className="text-2xl font-semibold tracking-tight">Shared audit</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Share ID: <span className="font-mono">{id}</span>
          </p>
          <p className="mt-4 text-sm text-muted-foreground">
            Phase 1 placeholder: this page will later load a sanitized audit payload from the backend and
            include Open Graph tags.
          </p>
        </section>
      </main>
    </div>
  );
}
