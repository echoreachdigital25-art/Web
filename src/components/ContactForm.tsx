"use client";

import Link from "next/link";
import { useActionState, useEffect, useRef, useState } from "react";
import { submitEnquiry } from "@/app/(site)/contact/actions";
import { budgetOptions, timelineOptions } from "@/content/enquiry-options";
import { serviceOptions } from "@/content/services";
import { enquirySchema, type EnquiryField, type EnquiryState } from "@/lib/enquiry-schema";
import { ArrowRight, Check } from "./Icons";

type Values = Record<EnquiryField, string>;

const empty: Values = {
  name: "",
  businessName: "",
  email: "",
  website: "",
  service: "",
  description: "",
  budget: "Not sure yet",
  timeline: "Not sure yet",
};

function validateField(field: EnquiryField, value: string): string | undefined {
  const res = enquirySchema.shape[field].safeParse(value);
  return res.success ? undefined : res.error.issues[0]?.message;
}

export function ContactForm({ token, initialService }: { token: string; initialService?: string }) {
  const [state, action, pending] = useActionState<EnquiryState, FormData>(submitEnquiry, { status: "idle" });
  const [values, setValues] = useState<Values>({
    ...empty,
    service: initialService && (serviceOptions as readonly string[]).includes(initialService) ? initialService : "",
  });
  const [errors, setErrors] = useState<Partial<Record<EnquiryField, string>>>({});
  const formRef = useRef<HTMLFormElement>(null);
  const alertRef = useRef<HTMLDivElement>(null);
  const successRef = useRef<HTMLDivElement>(null);

  // Merge server-side field errors and move focus to the first problem.
  useEffect(() => {
    if (state.status === "error") {
      if (state.fieldErrors) setErrors(state.fieldErrors);
      const first = state.fieldErrors && (Object.keys(state.fieldErrors)[0] as EnquiryField | undefined);
      if (first) formRef.current?.querySelector<HTMLElement>(`[name="${first}"]`)?.focus();
      else alertRef.current?.focus();
    }
    if (state.status === "success") successRef.current?.focus();
  }, [state]);

  if (state.status === "success") {
    return (
      <div className="success" ref={successRef} tabIndex={-1} role="status">
        <span className="tick" aria-hidden="true"><Check size={26} /></span>
        <h2 className="h-card">Thank you, {state.name}. Your enquiry has been received.</h2>
        <p className="lead" style={{ margin: "0 auto" }}>
          We have your project details and will reply to the email address you provided. If anything is urgent, you can
          also reach us on WhatsApp.
        </p>
        <div className="btn-row" style={{ justifyContent: "center" }}>
          <Link href="/work" className="btn">Explore Our Work</Link>
          <Link href="/" className="btn btn--ghost">Back to home</Link>
        </div>
      </div>
    );
  }

  const set = (field: EnquiryField) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const v = e.target.value;
    setValues((s) => ({ ...s, [field]: v }));
    if (errors[field]) setErrors((s) => ({ ...s, [field]: validateField(field, v) }));
  };
  const blur = (field: EnquiryField) => () => {
    if (values[field] !== "" || errors[field]) setErrors((s) => ({ ...s, [field]: validateField(field, values[field]) }));
  };

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    const res = enquirySchema.safeParse(values);
    if (!res.success) {
      e.preventDefault();
      const next: Partial<Record<EnquiryField, string>> = {};
      for (const issue of res.error.issues) {
        const key = issue.path[0] as EnquiryField;
        if (!next[key]) next[key] = issue.message;
      }
      setErrors(next);
      const first = (Object.keys(empty) as EnquiryField[]).find((f) => next[f]);
      if (first) formRef.current?.querySelector<HTMLElement>(`[name="${first}"]`)?.focus();
    }
  };

  const field = (name: EnquiryField) => ({
    id: `f-${name}`,
    name,
    value: values[name],
    onChange: set(name),
    onBlur: blur(name),
    "aria-invalid": errors[name] ? (true as const) : undefined,
    "aria-describedby": [errors[name] ? `e-${name}` : "", name === "description" || name === "budget" ? `h-${name}` : ""].filter(Boolean).join(" ") || undefined,
  });
  const err = (name: EnquiryField) =>
    errors[name] ? (
      <p id={`e-${name}`} className="field-error">
        {errors[name]}
      </p>
    ) : null;

  const errorCount = Object.values(errors).filter(Boolean).length;

  return (
    <form ref={formRef} className="form" action={action} onSubmit={onSubmit} noValidate aria-describedby="form-note">
      {state.status === "error" && !pending && (
        <div className="form-alert" role="alert" tabIndex={-1} ref={alertRef}>
          {state.message}
          {errorCount > 0 && ` (${errorCount} ${errorCount === 1 ? "field needs" : "fields need"} attention.)`}
        </div>
      )}

      <input type="hidden" name="form_token" defaultValue={token} />
      <div className="hp" aria-hidden="true">
        <label htmlFor="f-company_url">Leave this field empty</label>
        <input id="f-company_url" name="company_url" type="text" tabIndex={-1} autoComplete="off" defaultValue="" />
      </div>

      <div className="field">
        <label htmlFor="f-name">Name</label>
        <input className="input" type="text" autoComplete="name" required maxLength={120} {...field("name")} />
        {err("name")}
      </div>
      <div className="field">
        <label htmlFor="f-businessName">
          Business name <span className="opt">(optional)</span>
        </label>
        <input className="input" type="text" autoComplete="organization" maxLength={160} {...field("businessName")} />
        {err("businessName")}
      </div>
      <div className="field">
        <label htmlFor="f-email">Email</label>
        <input className="input" type="email" autoComplete="email" required maxLength={200} {...field("email")} />
        {err("email")}
      </div>
      <div className="field">
        <label htmlFor="f-website">
          Website or social link <span className="opt">(optional)</span>
        </label>
        <input className="input" type="text" inputMode="url" placeholder="yourbrand.com or @yourbrand" maxLength={300} {...field("website")} />
        {err("website")}
      </div>
      <div className="field field--full">
        <label htmlFor="f-service">Service required</label>
        <select className="input" required {...field("service")}>
          <option value="" disabled>
            Choose a service
          </option>
          {serviceOptions.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
        {err("service")}
      </div>
      <div className="field field--full">
        <label htmlFor="f-description">Project description</label>
        <textarea
          className="input"
          required
          maxLength={5000}
          placeholder="What are you working on, who is it for, and what would you like to achieve?"
          {...field("description")}
        />
        <p id="h-description" className="field-hint">At least 20 characters. Links to references are welcome.</p>
        {err("description")}
      </div>
      <div className="field">
        <label htmlFor="f-budget">Estimated budget</label>
        <select className="input" {...field("budget")}>
          {budgetOptions.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
        <p id="h-budget" className="field-hint">In USD. Choose “Not sure yet” if you’d like guidance.</p>
        {err("budget")}
      </div>
      <div className="field">
        <label htmlFor="f-timeline">Expected timeline</label>
        <select className="input" {...field("timeline")}>
          {timelineOptions.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
        {err("timeline")}
      </div>

      <div className="form-actions">
        <p id="form-note" className="field-hint" style={{ maxWidth: "26rem" }}>
          All fields are required unless marked optional. We use your details only to respond to your enquiry. See our{" "}
          <Link href="/privacy" className="text-link" style={{ fontSize: "inherit" }}>privacy notice</Link>.
        </p>
        <button type="submit" className="btn btn--primary" disabled={pending} aria-disabled={pending}>
          {pending ? (
            <>
              <span className="spinner" aria-hidden="true" /> Sending…
            </>
          ) : (
            <>
              Send enquiry <ArrowRight className="arrow" />
            </>
          )}
        </button>
        <p className="sr-only" aria-live="polite">{pending ? "Submitting your enquiry…" : ""}</p>
      </div>
    </form>
  );
}
