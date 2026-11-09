import { categoryLabel } from "@/content/categories";
import type { Project } from "./db/schema";
import { parseVideoUrl } from "./video";

/** Serializable subset of a project passed to client components. */
export type PublicProject = {
  slug: string;
  title: string;
  category: string;
  categoryLabel: string;
  summary: string;
  thumbnailUrl: string | null;
  thumbnailAlt: string;
  previewUrl: string | null;
  orientation: "landscape" | "portrait" | "square";
  video: { kind: "file"; url: string } | { kind: "embed"; url: string } | null;
};

export function toPublic(p: Project): PublicProject {
  let video: PublicProject["video"] = null;
  if (p.videoUrl && p.videoSource !== "none") {
    const parsed = parseVideoUrl(p.videoUrl, ["/media/", "/uploads/", ...(process.env.S3_PUBLIC_BASE_URL ? [process.env.S3_PUBLIC_BASE_URL.replace(/\/$/, "") + "/"] : [])]);
    if (parsed?.source === "file") video = { kind: "file", url: parsed.url };
    else if (parsed) video = { kind: "embed", url: parsed.embedUrl };
  }
  return {
    slug: p.slug,
    title: p.title,
    category: p.category,
    categoryLabel: categoryLabel(p.category),
    summary: p.summary,
    thumbnailUrl: p.thumbnailUrl,
    thumbnailAlt: p.thumbnailAlt || `Still frame from ${p.title}`,
    previewUrl: p.previewUrl || (video?.kind === "file" ? video.url : null),
    orientation: p.orientation,
    video,
  };
}
