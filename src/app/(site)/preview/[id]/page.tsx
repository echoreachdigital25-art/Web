import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ProjectDetail } from "@/components/ProjectDetail";
import { requireAdmin } from "@/lib/auth";
import { adminGetProject } from "@/lib/projects";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Preview", robots: { index: false, follow: false } };

/** Admin-only preview of any project (including drafts), rendered with the public design. */
export default async function PreviewPage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const { id } = await params;
  const project = await adminGetProject(id);
  if (!project) notFound();
  const label = project.status === "published" ? "Published" : project.status === "draft" ? "Draft — not visible to the public" : "Archived — not visible to the public";
  return (
    <>
      <div className="preview-bar" role="status">
        <span>Preview · {label}</span>
        <a href={`/admin/projects/${project.id}`}>Back to editor</a>
      </div>
      <ProjectDetail project={project} next={null} />
    </>
  );
}
