import type { Metadata } from "next";
import { ContactForm } from "@/components/ContactForm";
import { Testimonials } from "@/components/Testimonials";
import { site } from "@/content/site";
import { issueFormToken } from "@/lib/form-token";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Contact — Start a Project",
  description: "Tell KYNDE Motion about your project. Share your goals, timeline and budget and we will reply by email.",
  alternates: { canonical: "/contact" },
};

export default async function ContactPage({ searchParams }: { searchParams: Promise<{ service?: string }> }) {
  const { service } = await searchParams;
  return (
    <>
      <section className="page-head container" aria-labelledby="contact-title">
        <div className="section-head" style={{ marginBottom: 48 }}>
          <span className="pill pill--cyan">Start a Project</span>
          <h1 id="contact-title">Tell us about your project</h1>
          <p className="lead">
            Share a few details about what you need. We will read every enquiry and reply by email with next steps.
          </p>
        </div>
        <div className="contact-wrap">
          <ContactForm token={issueFormToken()} initialService={service} />

          <h2 className="h-card" style={{ marginTop: 72, textAlign: "center" }}>Prefer another way to reach us?</h2>
          <div className="alt-contacts" style={{ marginTop: 24 }}>
            <a className="alt-contact" href={`mailto:${site.email}`}>
              <span>Email</span>
              <strong>{site.email}</strong>
            </a>
            <a className="alt-contact" href={site.whatsapp.href} target="_blank" rel="noopener noreferrer">
              <span>WhatsApp</span>
              <strong>{site.whatsapp.display}</strong>
            </a>
            <a className="alt-contact" href={site.instagram.href} target="_blank" rel="noopener noreferrer">
              <span>Instagram</span>
              <strong>{site.instagram.handle}</strong>
            </a>
            <a className="alt-contact" href={site.linkedin.href} target="_blank" rel="noopener noreferrer">
              <span>LinkedIn</span>
              <strong>View profile</strong>
            </a>
          </div>
        </div>
      </section>
      <Testimonials />
    </>
  );
}
