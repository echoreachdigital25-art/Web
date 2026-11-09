import { desc, isNotNull, isNull } from "drizzle-orm";
import type { Metadata } from "next";
import Link from "next/link";
import { db, schema } from "@/lib/db";
import { emailConfigured } from "@/lib/email";

export const metadata: Metadata = { title: "Enquiries" };

const EMAIL_LABEL = { sent: "Notified", failed: "Email failed", not_configured: "No email sent" } as const;

export default async function EnquiriesPage({ searchParams }: { searchParams: Promise<{ view?: string; notice?: string }> }) {
  const sp = await searchParams;
  const archived = sp.view === "archived";
  const e = schema.enquiries;
  const rows = await db()
    .select()
    .from(e)
    .where(archived ? isNotNull(e.archivedAt) : isNull(e.archivedAt))
    .orderBy(desc(e.createdAt))
    .limit(500);

  return (
    <>
      <div className="a-page-head">
        <div>
          <h1>Enquiries</h1>
          <p className="a-muted">Every submission from the contact form is saved here, whether or not an email notification was sent.</p>
        </div>
      </div>
      {!emailConfigured() && (
        <p className="a-alert a-alert--info">
          Email notifications are not configured, so new enquiries are only stored here. See README → “Enquiry email
          notifications” to enable them.
        </p>
      )}
      {sp.notice === "archived" && <p className="a-alert a-alert--ok" role="status">Enquiry archived.</p>}
      <nav className="a-tabs" aria-label="Enquiry view">
        <Link href="/admin/enquiries" aria-current={!archived ? "page" : undefined}>Inbox</Link>
        <Link href="/admin/enquiries?view=archived" aria-current={archived ? "page" : undefined}>Archived</Link>
      </nav>
      {rows.length === 0 ? (
        <div className="a-panel a-empty">{archived ? "No archived enquiries." : "No enquiries yet."}</div>
      ) : (
        <div className="a-table-wrap">
          <table className="a-table">
            <thead>
              <tr>
                <th scope="col">Received</th>
                <th scope="col">From</th>
                <th scope="col">Service</th>
                <th scope="col">Budget</th>
                <th scope="col">Timeline</th>
                <th scope="col">Notification</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id} className={r.readAt ? "" : "is-unread"}>
                  <td style={{ whiteSpace: "nowrap" }}>{r.createdAt.toLocaleString("en-GB", { dateStyle: "medium", timeStyle: "short" })}</td>
                  <td className="a-title-cell">
                    <Link href={`/admin/enquiries/${r.id}`}>
                      {!r.readAt && <span className="sr-only">Unread: </span>}
                      {r.name}
                    </Link>
                    <div className="a-muted a-small">{r.businessName ? `${r.businessName} · ` : ""}{r.email}</div>
                  </td>
                  <td>{r.service}</td>
                  <td>{r.budget}</td>
                  <td>{r.timeline}</td>
                  <td><span className={`a-status a-status--${r.emailStatus}`}>{EMAIL_LABEL[r.emailStatus]}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
