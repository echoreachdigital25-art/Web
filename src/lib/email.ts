import "server-only";
import type { Enquiry } from "./db/schema";
import { site } from "@/content/site";

/**
 * Sends enquiry notifications through Resend (https://resend.com) when
 * RESEND_API_KEY and ENQUIRY_FROM_EMAIL are configured. Returns the real
 * outcome so the dashboard can show whether a notification was delivered
 * to the provider. Without configuration nothing is sent.
 */
export function emailConfigured() {
  return Boolean(process.env.RESEND_API_KEY && process.env.ENQUIRY_FROM_EMAIL);
}

const esc = (s: string) =>
  s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);

export async function sendEnquiryNotification(e: Enquiry): Promise<{ status: "sent" | "failed" | "not_configured"; error?: string }> {
  if (!emailConfigured()) return { status: "not_configured" };
  const to = (process.env.ENQUIRY_NOTIFY_TO ?? site.email).split(",").map((s) => s.trim()).filter(Boolean);
  const rows: [string, string | null][] = [
    ["Name", e.name],
    ["Business", e.businessName],
    ["Email", e.email],
    ["Website / social", e.website],
    ["Service", e.service],
    ["Budget", e.budget],
    ["Timeline", e.timeline],
  ];
  const text = [...rows.map(([k, v]) => `${k}: ${v || "—"}`), "", "Project description:", e.description].join("\n");
  const html = `<div style="font-family:Arial,sans-serif;font-size:14px;color:#0B1F3A">
  <h2 style="margin:0 0 16px">New project enquiry</h2>
  <table cellpadding="6" style="border-collapse:collapse">${rows
    .map(([k, v]) => `<tr><td style="color:#555">${k}</td><td><strong>${esc(v || "—")}</strong></td></tr>`)
    .join("")}</table>
  <h3 style="margin:20px 0 8px">Project description</h3>
  <p style="white-space:pre-wrap">${esc(e.description)}</p></div>`;
  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from: process.env.ENQUIRY_FROM_EMAIL,
        to,
        reply_to: e.email,
        subject: `New enquiry: ${e.name}${e.businessName ? ` (${e.businessName})` : ""} — ${e.service}`,
        text,
        html,
      }),
      signal: AbortSignal.timeout(10_000),
    });
    if (!res.ok) return { status: "failed", error: `Provider responded ${res.status}: ${(await res.text()).slice(0, 300)}` };
    return { status: "sent" };
  } catch (err) {
    return { status: "failed", error: err instanceof Error ? err.message : String(err) };
  }
}
