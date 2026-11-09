import type { Metadata } from "next";
import { site } from "@/content/site";

export const metadata: Metadata = {
  title: "Privacy notice",
  description: "How KYNDE Motion handles information submitted through this website.",
  alternates: { canonical: "/privacy" },
};

/**
 * DRAFT FOR OWNER REVIEW. This notice describes what the website code
 * actually does. Have it reviewed (ideally by a qualified adviser) and add
 * your legal business name, address and hosting providers before launch.
 */
export default function PrivacyPage() {
  return (
    <section className="page-head container legal">
      <span className="pill">Privacy</span>
      <h1 style={{ margin: "18px 0 24px", fontSize: "clamp(2.4rem, 5vw, 3.6rem)" }}>Privacy notice</h1>
      <p className="notice">
        Draft for owner review: this notice describes how this website currently handles data. It has not been
        reviewed by a legal adviser.
      </p>

      <h2>What we collect</h2>
      <p>When you send an enquiry through our contact form, we store the details you provide:</p>
      <ul>
        <li>your name and email address;</li>
        <li>optionally, your business name and website or social media link;</li>
        <li>the service you are interested in, your project description, estimated budget and timeline.</li>
      </ul>
      <p>
        To protect the form from abuse, we also store a one-way hashed version of your IP address for a short period
        to limit repeated submissions. We do not store your IP address itself.
      </p>

      <h2>How we use it</h2>
      <p>
        We use your enquiry only to respond to you and discuss your project. When email notifications are enabled, a
        copy of your enquiry is sent to our inbox through our email delivery provider.
      </p>

      <h2>Cookies and analytics</h2>
      <p>
        This website does not use analytics, advertising or tracking cookies. A single essential cookie is used only
        when a site administrator signs in to the private dashboard. Embedded videos from third-party platforms
        (such as YouTube or Vimeo), if used, load only after you choose to play them.
      </p>

      <h2>Storage and retention</h2>
      <p>
        Enquiries are stored in our website database with our hosting providers. We keep enquiries for as long as
        needed to respond and manage any resulting project, and delete them on request.
      </p>

      <h2>Your choices</h2>
      <p>
        You can ask us to access, correct or delete the information you have sent us by emailing{" "}
        <a href={`mailto:${site.email}`}>{site.email}</a>.
      </p>
    </section>
  );
}
