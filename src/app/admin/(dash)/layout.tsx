import { and, count, isNull } from "drizzle-orm";
import { requireAdmin } from "@/lib/auth";
import { db, schema } from "@/lib/db";
import { signOut } from "../actions";
import { AdminNav } from "../AdminNav";

export const dynamic = "force-dynamic";

export default async function DashLayout({ children }: { children: React.ReactNode }) {
  const admin = await requireAdmin();
  const [{ value: unread }] = await db()
    .select({ value: count() })
    .from(schema.enquiries)
    .where(and(isNull(schema.enquiries.readAt), isNull(schema.enquiries.archivedAt)));

  return (
    <div className="a-shell">
      <aside className="a-side">
        <p className="a-brand">KYNDE Motion</p>
        <AdminNav unread={unread} />
        <div className="a-side-foot">
          <span>Signed in as {admin.email}</span>
          <a href="/" target="_blank" rel="noopener noreferrer">View website ↗</a>
          <form action={signOut}>
            <button type="submit" className="a-linkbtn" style={{ color: "#fff" }}>Sign out</button>
          </form>
        </div>
      </aside>
      <main className="a-main" id="main">{children}</main>
    </div>
  );
}
