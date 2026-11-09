"use server";

import { and, asc, eq, gt, lt, desc } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { destroySession, requireAdmin } from "@/lib/auth";
import { db, schema } from "@/lib/db";
import { projectInput, type ProjectInput, type SaveIntent, type SaveResult } from "@/lib/project-schema";
import { adminGetProject, nextSortOrder, slugTaken } from "@/lib/projects";
import { ownMediaPrefixes } from "@/lib/storage";
import { parseVideoUrl } from "@/lib/video";

const p = schema.projects;

function revalidatePublic(slug?: string) {
  revalidatePath("/", "layout");
  if (slug) revalidatePath(`/work/${slug}`);
}

const isOwnMedia = (url: string) => ownMediaPrefixes().some((pre) => url.startsWith(pre)) && !url.includes("..");

/** Validates and normalises an editor payload. Returns field errors for the form. */
function validate(raw: unknown, intent: SaveIntent) {
  const parsed = projectInput.safeParse(raw);
  const fieldErrors: Partial<Record<keyof ProjectInput, string>> = {};
  if (!parsed.success) {
    for (const i of parsed.error.issues) {
      const k = i.path[0] as keyof ProjectInput;
      if (!fieldErrors[k]) fieldErrors[k] = i.message;
    }
    return { fieldErrors } as const;
  }
  const d = parsed.data;

  // Media URLs must point at our own storage (or a supported video service).
  if (d.thumbnailUrl && !isOwnMedia(d.thumbnailUrl)) fieldErrors.thumbnailUrl = "Upload the thumbnail or choose one from the media library.";
  if (d.previewUrl && !(isOwnMedia(d.previewUrl) && /\.(mp4|webm)$/i.test(d.previewUrl))) fieldErrors.previewUrl = "Upload the preview clip as an MP4 or WebM file.";
  if (d.gallery.some((g) => !isOwnMedia(g.url))) fieldErrors.gallery = "Gallery images must be uploaded or chosen from the media library.";

  let videoSource = d.videoSource;
  let videoUrl = d.videoUrl;
  if (videoSource === "none") {
    videoUrl = "";
  } else if (!videoUrl) {
    fieldErrors.videoUrl = "Add a video, or choose “No video”.";
  } else {
    const v = parseVideoUrl(videoUrl, ownMediaPrefixes());
    if (!v) fieldErrors.videoUrl = "This link isn’t supported. Use an uploaded file, a YouTube or Vimeo link, or a direct https link to an MP4/WebM file.";
    else {
      videoSource = v.source;
      if (v.source === "file") videoUrl = v.url;
    }
  }

  if (intent === "publish" || intent === "save") {
    // Publishing (or saving a live project) needs the essentials visitors will see.
    if (intent === "publish") {
      if (!d.summary) fieldErrors.summary = "Add a short summary before publishing.";
      if (!d.thumbnailUrl) fieldErrors.thumbnailUrl = "Add a thumbnail before publishing.";
    }
  }

  if (Object.keys(fieldErrors).length) return { fieldErrors } as const;

  return {
    values: {
      title: d.title,
      slug: d.slug,
      category: d.category,
      summary: d.summary,
      client: d.client || null,
      year: d.year || null,
      role: d.role || null,
      overview: d.overview || null,
      deliverables: d.deliverables,
      thumbnailUrl: d.thumbnailUrl || null,
      thumbnailAlt: d.thumbnailAlt || null,
      videoSource,
      videoUrl: videoUrl || null,
      previewUrl: d.previewUrl || null,
      orientation: d.orientation,
      gallery: d.gallery,
      featured: d.featured,
      sortOrder: d.sortOrder,
    },
  } as const;
}

export async function saveProject(id: string | null, raw: unknown, intent: SaveIntent): Promise<SaveResult> {
  await requireAdmin();
  const existing = id ? await adminGetProject(id) : null;
  if (id && !existing) return { ok: false, message: "This project no longer exists." };
  if (existing?.status === "archived") return { ok: false, message: "Restore this project from the archive before editing it." };

  const effectiveIntent: SaveIntent = intent === "save" && existing?.status === "published" ? "publish" : intent;
  const result = validate(raw, effectiveIntent);
  if ("fieldErrors" in result) {
    return { ok: false, message: "Please fix the highlighted fields.", fieldErrors: result.fieldErrors };
  }
  const values = result.values;
  if (await slugTaken(values.slug, id ?? undefined)) {
    return { ok: false, message: "Please fix the highlighted fields.", fieldErrors: { slug: "Another project already uses this URL. Try a different one." } };
  }

  const now = new Date();
  let status = existing?.status ?? "draft";
  if (intent === "publish") status = "published";
  if (intent === "unpublish") status = "draft";

  let savedId = id;
  if (existing) {
    await db()
      .update(p)
      .set({
        ...values,
        status,
        publishedAt: status === "published" ? (existing.publishedAt ?? now) : existing.publishedAt,
        updatedAt: now,
      })
      .where(eq(p.id, existing.id));
  } else {
    const [row] = await db()
      .insert(p)
      .values({ ...values, status, publishedAt: status === "published" ? now : null })
      .returning({ id: p.id });
    savedId = row.id;
  }

  revalidatePublic(values.slug);
  if (existing && existing.slug !== values.slug) revalidatePath(`/work/${existing.slug}`);
  revalidatePath("/admin", "layout");

  const message =
    intent === "publish" && existing?.status !== "published"
      ? "Published. The project is now live on the site."
      : intent === "unpublish"
        ? "Unpublished. The project is now a draft and hidden from the site."
        : status === "published"
          ? "Changes saved and live on the site."
          : "Draft saved. It is not visible on the site.";
  return { ok: true, id: savedId!, status, message };
}

export async function archiveProject(id: string) {
  await requireAdmin();
  const proj = await adminGetProject(id);
  if (!proj) return;
  await db().update(p).set({ status: "archived", archivedAt: new Date(), featured: false, updatedAt: new Date() }).where(eq(p.id, id));
  revalidatePublic(proj.slug);
  revalidatePath("/admin", "layout");
  redirect("/admin?tab=archived&notice=archived");
}

export async function restoreProject(id: string) {
  await requireAdmin();
  const proj = await adminGetProject(id);
  if (!proj) return;
  await db().update(p).set({ status: "draft", archivedAt: null, updatedAt: new Date() }).where(eq(p.id, id));
  revalidatePath("/admin", "layout");
  redirect(`/admin/projects/${id}?notice=restored`);
}

export async function deleteProjectPermanently(id: string, formData: FormData) {
  await requireAdmin();
  const proj = await adminGetProject(id);
  if (!proj || proj.status !== "archived") return; // Only archived projects can be deleted.
  if (String(formData.get("confirm") ?? "").trim() !== proj.title) {
    redirect(`/admin/projects/${id}?notice=confirm-mismatch`);
  }
  await db().delete(p).where(eq(p.id, id));
  revalidatePath("/admin", "layout");
  redirect("/admin?tab=archived&notice=deleted");
}

/** Swap display order with the neighbouring project in the same list. */
export async function moveProject(id: string, direction: "up" | "down") {
  await requireAdmin();
  const proj = await adminGetProject(id);
  if (!proj || proj.status === "archived") return;
  const neighbour = await db()
    .select()
    .from(p)
    .where(and(eq(p.status, proj.status), direction === "up" ? lt(p.sortOrder, proj.sortOrder) : gt(p.sortOrder, proj.sortOrder)))
    .orderBy(direction === "up" ? desc(p.sortOrder) : asc(p.sortOrder))
    .limit(1);
  if (!neighbour[0]) return;
  const n = neighbour[0];
  await db().transaction(async (tx) => {
    await tx.update(p).set({ sortOrder: n.sortOrder }).where(eq(p.id, proj.id));
    await tx.update(p).set({ sortOrder: proj.sortOrder }).where(eq(p.id, n.id));
  });
  revalidatePublic();
  revalidatePath("/admin", "layout");
}

export async function toggleFeatured(id: string) {
  await requireAdmin();
  const proj = await adminGetProject(id);
  if (!proj || proj.status === "archived") return;
  await db().update(p).set({ featured: !proj.featured, updatedAt: new Date() }).where(eq(p.id, id));
  revalidatePublic();
  revalidatePath("/admin", "layout");
}

export async function defaultSortOrder() {
  await requireAdmin();
  return nextSortOrder();
}

// ---------- Enquiries ----------

export async function setEnquiryArchived(id: string, archived: boolean) {
  await requireAdmin();
  if (!/^[0-9a-f-]{36}$/i.test(id)) return;
  await db().update(schema.enquiries).set({ archivedAt: archived ? new Date() : null }).where(eq(schema.enquiries.id, id));
  revalidatePath("/admin/enquiries");
  redirect(archived ? "/admin/enquiries?notice=archived" : `/admin/enquiries/${id}`);
}

export async function markEnquiryUnread(id: string) {
  await requireAdmin();
  if (!/^[0-9a-f-]{36}$/i.test(id)) return;
  await db().update(schema.enquiries).set({ readAt: null }).where(eq(schema.enquiries.id, id));
  revalidatePath("/admin/enquiries");
  redirect("/admin/enquiries");
}

// ---------- Session ----------

export async function signOut() {
  await destroySession();
  redirect("/admin/login");
}
