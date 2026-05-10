import { BACKEND_BASE_URL } from "./backend";

export async function createLead(input: {
  email: string;
  shareId?: string;
  source?: "results" | "share" | "unknown";
  honeypot?: string;
}) {
  const resp = await fetch(`${BACKEND_BASE_URL}/api/leads`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });

  if (!resp.ok) {
    const text = await resp.text();
    throw new Error(text || `Lead create failed (${resp.status})`);
  }

  return resp.json() as Promise<{ ok: true; lead: { id: string; created_at: string } | null }>;
}
