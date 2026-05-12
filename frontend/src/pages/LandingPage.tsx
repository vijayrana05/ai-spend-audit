import { Link } from "react-router-dom";


export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-[#f0ede8] font-[system-ui]" style={{ fontFamily: "'DM Sans', system-ui, sans-serif" }}>
      {/* Grain overlay */}
      <div
        className="pointer-events-none fixed inset-0 z-50 opacity-[0.035]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
          backgroundSize: "200px 200px",
        }}
      />

      {/* Subtle grid background */}
      <div
        className="pointer-events-none fixed inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `linear-gradient(#c9a84c 1px, transparent 1px), linear-gradient(90deg, #c9a84c 1px, transparent 1px)`,
          backgroundSize: "64px 64px",
        }}
      />

      {/* Ambient glow */}
      <div className="pointer-events-none fixed top-0 left-1/4 w-150 h-100 rounded-full opacity-[0.07]" style={{ background: "radial-gradient(ellipse, #c9a84c 0%, transparent 70%)" }} />

      <header className="relative mx-auto flex max-w-6xl items-center justify-between px-6 py-7">
        <div className="flex items-center gap-3">
          <div className="h-7 w-7 rounded-md border border-[#c9a84c]/40 flex items-center justify-center">
            <div className="h-3 w-3 rounded-sm bg-[#c9a84c]" />
          </div>
          <span className="text-sm font-semibold tracking-widest uppercase text-[#f0ede8]/70">SpendPilot</span>
          <span className="text-[#c9a84c]/40 text-xs">/</span>
          <span className="text-xs tracking-wider text-[#f0ede8]/40 uppercase">AI Spend Audit</span>
        </div>
        <Link to="/audit">
          <button className="group relative px-5 py-2 text-sm font-medium tracking-wide border border-[#c9a84c]/60 text-[#c9a84c] rounded hover:bg-[#c9a84c] hover:text-[#0a0a0a] transition-all duration-200">
            Start free audit
          </button>
        </Link>
      </header>

      <main className="relative mx-auto max-w-6xl px-6 pt-16 pb-24">
        {/* Hero */}
        <div className="grid md:grid-cols-[1fr_420px] gap-16 items-start">
          <section className="space-y-8">
            {/* Label */}
            <div className="inline-flex items-center gap-2 border border-[#c9a84c]/30 rounded-full px-4 py-1.5 text-xs text-[#c9a84c] tracking-widest uppercase">
              <div className="h-1.5 w-1.5 rounded-full bg-[#c9a84c] animate-pulse" />
              Free · No login required
            </div>

            <h1 className="text-[clamp(2.4rem,5vw,4rem)] font-bold leading-[1.05] tracking-tight text-[#f0ede8]">
              Find wasted spend
              <br />
              <span className="text-[#c9a84c]">across every AI tool</span>
              <br />
              your team pays for.
            </h1>

            <p className="text-base leading-relaxed text-[#f0ede8]/50 max-w-md">
              Enter what you pay and your team size. Get a defensible audit with plan downgrades, alternatives, and expected monthly + annual savings — in under 3 minutes.
            </p>

            <div className="flex flex-wrap gap-3 pt-2">
              <Link to="/audit">
                <button className="px-6 py-3 bg-[#c9a84c] text-[#0a0a0a] text-sm font-semibold rounded hover:bg-[#e0bd68] transition-colors duration-200 tracking-wide">
                  Start your audit →
                </button>
              </Link>
              <Link to="/audit">
                <button className="px-6 py-3 border border-[#f0ede8]/15 text-[#f0ede8]/60 text-sm font-medium rounded hover:border-[#f0ede8]/30 hover:text-[#f0ede8]/80 transition-all duration-200">
                  See how it works
                </button>
              </Link>
            </div>

            {/* Trust line */}
            <div className="pt-2 flex items-center gap-4 text-xs text-[#f0ede8]/30">
              <span>✓ No login</span>
              <span className="text-[#f0ede8]/15">·</span>
              <span>✓ Saved locally in your browser</span>
              <span className="text-[#f0ede8]/15">·</span>
              <span>✓ Email only after results</span>
            </div>
          </section>

          {/* Card */}
          <section className="rounded-2xl border border-[#f0ede8]/08 bg-[#111110] overflow-hidden shadow-2xl">
            {/* Card header */}
            <div className="border-b border-[#f0ede8]/08 px-6 py-4 flex items-center justify-between">
              <span className="text-xs font-semibold tracking-widest uppercase text-[#f0ede8]/40">Example Outcome</span>
              <div className="flex gap-1.5">
                <div className="h-2 w-2 rounded-full bg-[#f0ede8]/10" />
                <div className="h-2 w-2 rounded-full bg-[#f0ede8]/10" />
                <div className="h-2 w-2 rounded-full bg-[#c9a84c]/50" />
              </div>
            </div>

            <div className="p-6 space-y-5">
              {/* Big savings */}
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-xl bg-[#0a0a0a] border border-[#f0ede8]/06 p-4">
                  <div className="text-xs text-[#f0ede8]/35 tracking-wide uppercase mb-1">Monthly savings</div>
                  <div className="text-3xl font-bold text-[#c9a84c] tabular-nums">$420</div>
                </div>
                <div className="rounded-xl bg-[#0a0a0a] border border-[#f0ede8]/06 p-4">
                  <div className="text-xs text-[#f0ede8]/35 tracking-wide uppercase mb-1">Annual savings</div>
                  <div className="text-3xl font-bold text-[#c9a84c] tabular-nums">$5,040</div>
                </div>
              </div>

              {/* Tool rows */}
              <div className="space-y-2">
                {[
                  { tool: "Cursor Business", action: "→ Downgrade to Pro", saving: "-$32/mo" },
                  { tool: "GitHub Copilot Enterprise", action: "→ Switch to Cursor Pro", saving: "-$58/mo" },
                  { tool: "ChatGPT Team", action: "→ Keep — well-utilized", saving: "$0" },
                  { tool: "OpenAI API (direct)", action: "→ Use SpendPilot credits", saving: "-$330/mo" },
                ].map((row) => (
                  <div key={row.tool} className="flex items-center justify-between py-2.5 px-3 rounded-lg bg-[#0a0a0a] border border-[#f0ede8]/05">
                    <div>
                      <div className="text-xs font-medium text-[#f0ede8]/75">{row.tool}</div>
                      <div className="text-xs text-[#f0ede8]/35 mt-0.5">{row.action}</div>
                    </div>
                    <div className={`text-xs font-semibold tabular-nums ${row.saving === "$0" ? "text-[#f0ede8]/30" : "text-[#c9a84c]"}`}>{row.saving}</div>
                  </div>
                ))}
              </div>

              <p className="text-xs text-[#f0ede8]/25 text-center">
                Illustrative only — your audit uses rule-based calculations.
              </p>
            </div>
          </section>
        </div>

        {/* What you'll get */}
        <section className="mt-20 grid md:grid-cols-4 gap-px bg-[#f0ede8]/06 rounded-2xl overflow-hidden border border-[#f0ede8]/06">
          {[
            { num: "01", title: "Per-tool breakdown", desc: "Current spend mapped to recommended plan or alternative tool." },
            { num: "02", title: "Monthly & annual savings", desc: "Hard numbers you can bring to a budget conversation." },
            { num: "03", title: "Shareable audit link", desc: "Clean, sanitized link — no personal or company details exposed." },
            { num: "04", title: "SpendPilot consultation", desc: "Optional follow-up when savings are meaningful. No spam." },
          ].map((item) => (
            <div key={item.num} className="bg-[#0e0e0d] px-6 py-7 space-y-3">
              <div className="text-xs font-mono text-[#c9a84c]/60 tracking-widest">{item.num}</div>
              <div className="text-sm font-semibold text-[#f0ede8]/80">{item.title}</div>
              <div className="text-xs text-[#f0ede8]/35 leading-relaxed">{item.desc}</div>
            </div>
          ))}
        </section>
      </main>

      <footer className="relative mx-auto max-w-6xl px-6 pb-8 flex items-center justify-between border-t border-[#f0ede8]/06 pt-8">
        <p className="text-xs text-[#f0ede8]/25 max-w-md">
          SpendPilot is a discounted AI infrastructure credits provider. This tool identifies waste and opportunities to reduce costs.
        </p>
        <div className="text-xs text-[#f0ede8]/15 tabular-nums">&copy; 2025 SpendPilot</div>
      </footer>
    </div>
  );
}