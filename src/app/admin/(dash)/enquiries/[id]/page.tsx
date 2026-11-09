import { eq } from "drizzle-orm";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { db, schema } from "@/lib/db";
import { markEnquiryUnread, setEnquiryArchived } from "../../../actions";

export const metadata: Metadata = { title: "Enquiry" };

export default async function EnquiryPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!/^[0-9a-f-]{36}$/i.test(id)) notFound();
  const e = schema.enquiries;
  const [row] = await db().select().from(e).where(eq(e.id, id)).limit(1);
  if (!row) notFound();
  if (!row.readAt) await db().update(e).set({ readAt: new Date() }).where(eq(e.id, id));

  const website = row.website ? (row.website.startsWith("@") ? row.website : /^https?:\/\//.test(row.website) ? row.website : `https://${row.website}`) : null;
  const subject = encodeURIComponent(`Re: your ${row.service} enquiry — KYNDE Motion`);

  return (
    <>
      <div className="a-page-head">
        <div>
          <p className="a-small"><Link href="/admin/enquiries">← Enquiries</Link></p>
          <h1>{row.name}{row.businessName ? ` · ${row.businessName}` : ""}</h1>
          <p className="a-muted">Received {row.createdAt.toLocaleString("en-GB", { dateStyle: "full", timeStyle: "short" })}</p>
        </div>
        <div className="a-row-actions">
          <a className="a-btn a-btn--accent" href={`mailto:${row.email}?subject=${subject}`}>Reply by email</a>
          <form action={markEnquiryUnread.bind(null, row.id)}><button className="a-btn" type="submit">Mark unread</button></form>
          <form action={setEnquiryArchived.bind(null, row.id, !row.archivedAt)}>
            <button className="a-btn" type="submit">{row.archivedAt ? "Move to inbox" : "Archive"}</button>
          </form>
        </div>
      </div>
      <div className="a-panel" style={{ maxWidth: 900 }}>
        <dl className="a-dl">
          <dt>Name</dt><dd>{row.name}</dd>
          <dt>Business</dt><dd>{row.businessName || "—"}</dd>
          <dt>Email</dt><dd><a href={`mailto:${row.email}`}>{row.email}</a></dd>
          <dt>Website / social</dt>
          <dd>{website && !website.startsWith("@") ? <a href={website} target="_blank" rel="noopener noreferrer nofollow">{row.website}</a> : row.website || "—"}</dd>
          <dt>Service</dt><dd>{row.service}</dd>
          <dt>Budget</dt><dd>{row.budget}</dd>
          <dt>Timeline</dt><dd>{row.timeline}</dd>
          <dt>Project description</dt><dd>{row.description}</dd>
          <dt>Email notification</dt>
          <dd>
            {row.emailStatus === "sent" ? "Accepted by the email provider." : row.emailStatus === "failed" ? `Failed: ${row.emailError ?? "unknown error"}` : "Not sent — email notifications are not configured."}
          </dd>
        </dl>
      </div>
    </>
  );
}
