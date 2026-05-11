import { Resend } from "resend";

function optional(name: string): string | undefined {
  const v = process.env[name];
  return v && v.trim().length > 0 ? v : undefined;
}

export type LeadConfirmationInput = {
  toEmail: string;
  shareId?: string;
  estimatedSavingsMonthlyUsd?: number;
};

function money(n: unknown): string {
  const v = typeof n === "number" && Number.isFinite(n) ? n : 0;
  return `$${Math.round(v).toLocaleString("en-US")}`;
}

/**
 * Sends a lead confirmation email.
 * If RESEND_API_KEY is not configured, this becomes a no-op (but still succeeds).
 */
export async function sendLeadConfirmationEmail(input: LeadConfirmationInput): Promise<{ sent: boolean }> {
  const apiKey = optional("RESEND_API_KEY");
  const from = optional("RESEND_FROM") ?? "Credex <no-reply@credex.example>";
  const appBaseUrl = optional("APP_BASE_URL") ?? "http://localhost:5173";

  if (!apiKey) {
    return { sent: false };
  }

  const resend = new Resend(apiKey);

  const shareUrl = input.shareId ? `${appBaseUrl}/share/${input.shareId}` : appBaseUrl;
  const savingsLine =
    typeof input.estimatedSavingsMonthlyUsd === "number"
      ? `Estimated savings (monthly): ${money(input.estimatedSavingsMonthlyUsd)}`
      : "";

  const subject = "Your AI Spend Audit (confirmation)";
  const text =
    `Thanks for using the Credex AI Spend Audit tool.\n\n` +
    (savingsLine ? `${savingsLine}\n\n` : "") +
    `You can view/share your audit here: ${shareUrl}\n\n` +
    `If your audit shows large savings opportunities, Credex may reach out to help you explore discounted AI credits.\n\n` +
    `— Credex`;

  await resend.emails.send({
    from,
    to: input.toEmail,
    subject,
    text,
  });

  return { sent: true };
}
