import type { Metadata } from "next";
import Link from "next/link";
import { categoryLabel } from "@/content/categories";
import type { ProjectStatus } from "@/lib/db/schema";
import { adminCounts, adminListProjects } from "@/lib/projects";
import { moveProject, restoreProject, toggleFeatured } from "../actions";

export const metadata: Metadata = { title: "Projects" };

const NOTICES: Record<string, string> = {
  archived: "Project archived. It is hidden from the site and can be restored at any time.",
  deleted: "Project permanently deleted.",
};

const TABS: { key: ProjectStatus; label: string }[] = [
  { key: "published", label: "Published" },
  { key: "draft", label: "Drafts" },
  { key: "archived", label: "Archive" },
];

export default async function ProjectsPage({ searchParams }: { searchParams: Promise<{ tab?: string; notice?: string }> }) {
  const sp = await searchParams;
  const tab: ProjectStatus = (["published", "draft", "archived"] as const).find((t) => t === sp.tab) ?? "published";
  const [rows, counts] = await Promise.all([adminListProjects(tab), adminCounts()]);

  return (
    <>
      <div className="a-page-head">
        <div>
          <h1>Projects</h1>
          <p className="a-muted">Published projects appear on the website in the order shown here.</p>
        </div>
        <Link href="/admin/projects/new" className="a-btn a-btn--accent">+ New project</Link>
      </div>

      {sp.notice && NOTICES[sp.notice] && <p className="a-alert a-alert--ok" role="status">{NOTICES[sp.notice]}</p>}

      <nav className="a-tabs" aria-label="Project status">
        {TABS.map((t) => (
          <Link key={t.key} href={`/admin?tab=${t.key}`} aria-current={tab === t.key ? "page" : undefined}>
            {t.label} ({counts[t.key]})
          </Link>
        ))}
      </nav>

      {rows.length === 0 ? (
        <div className="a-panel a-empty">
          {tab === "archived" ? "The archive is empty." : tab === "draft" ? "No drafts." : "No published projects yet."}{" "}
          {tab !== "archived" && <Link href="/admin/projects/new">Create a project</Link>}
        </div>
      ) : (
        <div className="a-table-wrap">
          <table className="a-table">
            <thead>
              <tr>
                <th scope="col">Thumbnail</th>
                <th scope="col">Project</th>
                <th scope="col">Status</th>
                {tab !== "archived" && <th scope="col">Homepage</th>}
                {tab !== "archived" && <th scope="col">Order</th>}
                <th scope="col">Actions</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((p, i) => (
                <tr key={p.id}>
                  <td>
                    {p.thumbnailUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={p.thumbnailUrl} alt="" className="a-thumb" width={88} height={56} loading="lazy" />
                    ) : (
                      <div className="a-thumb" aria-hidden="true" />
                    )}
                  </td>
                  <td className="a-title-cell">
                    <Link href={`/admin/projects/${p.id}`}>{p.title}</Link>
                    <div className="a-muted a-small">{categoryLabel(p.category)} · /work/{p.slug}</div>
                  </td>
                  <td>
                    <span className={`a-status a-status--${p.status}`}>{p.status === "published" ? "Published" : p.status === "draft" ? "Draft" : "Archived"}</span>
                  </td>
                  {tab !== "archived" && (
                    <td>
                      <form action={toggleFeatured.bind(null, p.id)}>
                        <button type="submit" className="a-btn a-btn--sm" aria-pressed={p.featured} title="Show in the homepage Featured Work section">
                          {p.featured ? "★ Featured" : "☆ Feature"}
                        </button>
                      </form>
                    </td>
                  )}
                  {tab !== "archived" && (
                    <td>
                      <div className="a-row-actions">
                        <form action={moveProject.bind(null, p.id, "up")}>
                          <button type="submit" className="a-btn a-btn--sm" disabled={i === 0} aria-label={`Move ${p.title} up`}>↑</button>
                        </form>
                        <form action={moveProject.bind(null, p.id, "down")}>
                          <button type="submit" className="a-btn a-btn--sm" disabled={i === rows.length - 1} aria-label={`Move ${p.title} down`}>↓</button>
                        </form>
                      </div>
                    </td>
                  )}
                  <td>
                    <div className="a-row-actions">
                      {tab === "archived" ? (
                        <form action={restoreProject.bind(null, p.id)}>
                          <button type="submit" className="a-btn a-btn--sm">Restore to drafts</button>
                        </form>
                      ) : (
                        <>
                          <Link href={`/admin/projects/${p.id}`} className="a-btn a-btn--sm">Edit</Link>
                          <a href={`/preview/${p.id}`} target="_blank" rel="noopener noreferrer" className="a-btn a-btn--sm">Preview ↗</a>
                          {p.status === "published" && (
                            <a href={`/work/${p.slug}`} target="_blank" rel="noopener noreferrer" className="a-btn a-btn--sm">View live ↗</a>
                          )}
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
