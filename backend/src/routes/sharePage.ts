import { Router } from "express";
import { shareStore } from "../services/shareStore";

export const sharePageRouter = Router();

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

sharePageRouter.get("/:id", async (req, res) => {
  const id = req.params.id;

  let record: any = null;
  try {
    record = await shareStore.get(id);
  } catch {
    return res.status(500).send("Failed to load audit");
  }

  if (!record) return res.status(404).send("Not found");

  // Minimal OG tags for Phase 3. We only display sanitized totals.
  const audit = record.auditResult as any;
  const monthly = audit?.totals?.estimatedSavingsMonthlyUsd;
  const annual = audit?.totals?.estimatedSavingsAnnualUsd;

  const title = "Credex AI Spend Audit";
  const description =
    typeof monthly === "number" && typeof annual === "number"
      ? `Estimated savings: $${monthly}/mo ($${annual}/yr).`
      : "AI spend audit results";

  const safeTitle = escapeHtml(title);
  const safeDescription = escapeHtml(description);

  const frontendBaseUrl = process.env.FRONTEND_BASE_URL ?? "http://localhost:5173";
  const canonicalUrl = `${frontendBaseUrl}/share/${id}`;

  // Serve HTML with OG tags for link previews.
  res.status(200).type("html").send(`<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />

  <title>${safeTitle}</title>
  <meta name="description" content="${safeDescription}" />

  <meta property="og:title" content="${safeTitle}" />
  <meta property="og:description" content="${safeDescription}" />
  <meta property="og:type" content="website" />
  <meta property="og:url" content="${escapeHtml(canonicalUrl)}" />

  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="${safeTitle}" />
  <meta name="twitter:description" content="${safeDescription}" />
</head>
<body>
  <p>Redirecting…</p>
  <script>
    window.location.replace(${JSON.stringify(canonicalUrl)});
  </script>
</body>
</html>`);
});
