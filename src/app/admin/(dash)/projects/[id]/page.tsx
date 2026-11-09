import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { adminGetProject } from "@/lib/projects";
import { deleteProjectPermanently, restoreProject } from "../../../actions";
import { ProjectEditor } from "../../../ProjectEditor";

export const metadata: Metadata = { title: "Edit project" };

const NOTICES: Record<string, [string, string]> = {
  created: ["ok", "Project created as a draft. Publish it when you are ready."],
  restored: ["ok", "Project restored as a draft."],
  "confirm-mismatch": ["error", "The title you typed did not match, so nothing was deleted."],
};

export default async function EditProjectPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ notice?: string }> }) {
  await requireAdmin();
  const { id } = await params;
  const { notice } = await searchParams;
  const project = await adminGetProject(id);
  if (!project) notFound();
  const n = notice ? NOTICES[notice] : undefined;

  return (
    <>
      <div className="a-page-head">
        <div>
          <p className="a-small"><Link href={`/admin?tab=${project.status}`}>← Projects</Link></p>
          <h1>{project.title}</h1>
          <p className="a-muted">Last updated {project.updatedAt.toLocaleString("en-GB", { dateStyle: "medium", timeStyle: "short" })}</p>
        </div>
      </div>
      {n && <p className={`a-alert a-alert--${n[0]}`} role="status">{n[1]}</p>}

      {project.status === "archived" ? (
        <div className="a-panel" style={{ maxWidth: 640 }}>
          <h2>This project is archived</h2>
          <p className="a-muted" style={{ margin: "8px 0 16px" }}>
            It is hidden from the website. Restore it to drafts to edit or republish it.
          </p>
          <form action={restoreProject.bind(null, project.id)}>
            <button type="submit" className="a-btn a-btn--primary">Restore to drafts</button>
          </form>
          <hr style={{ border: 0, borderTop: "1px solid var(--a-line)", margin: "24px 0" }} />
          <h2>Delete permanently</h2>
          <p className="a-muted" style={{ margin: "8px 0 12px" }}>
            This cannot be undone. Uploaded files remain in your media library. Type the project title to confirm.
          </p>
          <form action={deleteProjectPermanently.bind(null, project.id)} className="a-form">
            <div className="a-field">
              <label htmlFor="confirm">Project title</label>
              <input id="confirm" name="confirm" className="a-input" autoComplete="off" placeholder={project.title} />
            </div>
            <div>
              <button type="submit" className="a-btn a-btn--danger">Delete permanently</button>
            </div>
          </form>
        </div>
      ) : (
        <ProjectEditor project={project} defaultOrder={project.sortOrder} storageBase={process.env.S3_PUBLIC_BASE_URL ?? null} />
      )}
    </>
  );
}
