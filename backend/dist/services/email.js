"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendLeadConfirmationEmail = sendLeadConfirmationEmail;
const resend_1 = require("resend");
function optional(name) {
    const v = process.env[name];
    return v && v.trim().length > 0 ? v : undefined;
}
function money(n) {
    const v = typeof n === "number" && Number.isFinite(n) ? n : 0;
    return `$${Math.round(v).toLocaleString("en-US")}`;
}
/**
 * Sends a lead confirmation email.
 * If RESEND_API_KEY is not configured, this becomes a no-op (but still succeeds).
 */
async function sendLeadConfirmationEmail(input) {
    const apiKey = optional("RESEND_API_KEY");
    const from = optional("RESEND_FROM") ?? "Credex <no-reply@credex.example>";
    const appBaseUrl = optional("APP_BASE_URL") ?? "http://localhost:5173";
    if (!apiKey) {
        return { sent: false };
    }
    const resend = new resend_1.Resend(apiKey);
    const shareUrl = input.shareId ? `${appBaseUrl}/share/${input.shareId}` : appBaseUrl;
    const savingsLine = typeof input.estimatedSavingsMonthlyUsd === "number"
        ? `Estimated savings (monthly): ${money(input.estimatedSavingsMonthlyUsd)}`
        : "";
    const subject = "Your AI Spend Audit (confirmation)";
    const text = `Thanks for using the Credex AI Spend Audit tool.\n\n` +
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
