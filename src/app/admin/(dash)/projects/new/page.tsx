import type { Metadata } from "next";
import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { nextSortOrder } from "@/lib/projects";
import { ProjectEditor } from "../../../ProjectEditor";

export const metadata: Metadata = { title: "New project" };

export default async function NewProjectPage() {
  await requireAdmin();
  const order = await nextSortOrder();
  return (
    <>
      <div className="a-page-head">
        <div>
          <p className="a-small"><Link href="/admin">← Projects</Link></p>
          <h1>New project</h1>
          <p className="a-muted">Save as a draft first if you are not ready to publish. Drafts are never shown on the site.</p>
        </div>
      </div>
      <ProjectEditor project={null} defaultOrder={order} storageBase={process.env.S3_PUBLIC_BASE_URL ?? null} />
    </>
  );
}
