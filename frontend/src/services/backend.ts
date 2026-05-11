export const BACKEND_BASE_URL = import.meta.env.VITE_BACKEND_BASE_URL ?? "http://localhost:8787";

export async function createShareableAudit(auditResult: unknown): Promise<{ shareId: string; sharePath: string }> {
  const res = await fetch(`${BACKEND_BASE_URL}/api/audits`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ auditResult }),
  });

  if (!res.ok) {
    throw new Error("Failed to create shareable audit");
  }

  return res.json();
}

export async function fetchSharedAudit(shareId: string): Promise<unknown> {
  const res = await fetch(`${BACKEND_BASE_URL}/api/share/${shareId}`);
  if (!res.ok) throw new Error("Not found");
  return res.json();
}
