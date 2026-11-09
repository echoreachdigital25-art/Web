"use server";

import { eq } from "drizzle-orm";
import { db, schema } from "@/lib/db";
import { sendEnquiryNotification } from "@/lib/email";
import { enquirySchema, type EnquiryField, type EnquiryState } from "@/lib/enquiry-schema";
import { checkFormToken } from "@/lib/form-token";
import { rateLimit } from "@/lib/rate-limit";
import { clientIp } from "@/lib/request";
import { site } from "@/content/site";

const FIELDS = ["name", "businessName", "email", "website", "service", "description", "budget", "timeline"] as const;

export async function submitEnquiry(_prev: EnquiryState, formData: FormData): Promise<EnquiryState> {
  const values: Record<string, string> = {};
  for (const f of FIELDS) values[f] = String(formData.get(f) ?? "");

  const fallback = `We couldn’t submit your enquiry. Please try again, or email us at ${site.email}.`;

  // Spam checks: honeypot + signed render time.
  if (String(formData.get("company_url") ?? "") !== "") {
    return { status: "error", message: fallback, values };
  }
  const token = checkFormToken(String(formData.get("form_token") ?? ""));
  if (token === "too_fast") {
    return { status: "error", message: "That was quick! Please check your details and submit again.", values };
  }
  if (token === "expired") {
    return { status: "error", message: "This form has been open for a long time. Please refresh the page and try again.", values };
  }
  if (token !== "ok") return { status: "error", message: fallback, values };

  const parsed = enquirySchema.safeParse(values);
  if (!parsed.success) {
    const fieldErrors: Partial<Record<EnquiryField, string>> = {};
    for (const issue of parsed.error.issues) {
      const key = issue.path[0] as EnquiryField;
      if (!fieldErrors[key]) fieldErrors[key] = issue.message;
    }
    return { status: "error", message: "Please correct the highlighted fields.", fieldErrors, values };
  }

  try {
    const ip = await clientIp();
    const limit = await rateLimit("enquiry", ip, 5, 60 * 60 * 1000);
    if (!limit.ok) {
      return { status: "error", message: `You’ve sent several enquiries recently. Please wait a while, or email us at ${site.email}.`, values };
    }

    const d = parsed.data;
    const [row] = await db()
      .insert(schema.enquiries)
      .values({
        name: d.name,
        businessName: d.businessName ?? null,
        email: d.email,
        website: d.website ?? null,
        service: d.service,
        description: d.description,
        budget: d.budget,
        timeline: d.timeline,
      })
      .returning();

    // The enquiry is saved. Notification outcome is recorded for the dashboard,
    // and never changes what the visitor is told.
    const result = await sendEnquiryNotification(row);
    await db()
      .update(schema.enquiries)
      .set({ emailStatus: result.status, emailError: result.error ?? null })
      .where(eq(schema.enquiries.id, row.id));

    return { status: "success", name: d.name.split(" ")[0] };
  } catch (err) {
    console.error("[enquiry] failed to save", err);
    return { status: "error", message: fallback, values };
  }
}
