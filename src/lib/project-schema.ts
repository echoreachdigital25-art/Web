import { z } from "zod";
import { categorySlugs } from "@/content/categories";

export const slugify = (s: string) =>
  s
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);

const text = (max: number) => z.string().trim().max(max, `Keep this under ${max} characters.`);

export const projectInput = z.object({
  title: text(120).min(2, "Add a title (at least 2 characters)."),
  slug: z
    .string()
    .trim()
    .max(80)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Use lowercase letters, numbers and hyphens only (e.g. summer-campaign)."),
  category: z.enum(categorySlugs, { message: "Choose a category." }),
  summary: text(500),
  client: text(120),
  year: z.string().trim().regex(/^(\d{4})?$/, "Use a four-digit year, e.g. 2025."),
  role: text(200),
  overview: text(8000),
  deliverables: z.array(text(80).min(1)).max(20),
  thumbnailUrl: text(1000),
  thumbnailAlt: text(200),
  videoSource: z.enum(["file", "youtube", "vimeo", "none"]),
  videoUrl: text(1000),
  previewUrl: text(1000),
  orientation: z.enum(["landscape", "portrait", "square"]),
  gallery: z.array(z.object({ url: text(1000).min(1), alt: text(200) })).max(24),
  featured: z.boolean(),
  sortOrder: z.coerce.number().int().min(0).max(9999),
});

export type ProjectInput = z.infer<typeof projectInput>;
export type SaveIntent = "save" | "publish" | "unpublish";
export type SaveResult =
  | { ok: true; id: string; status: string; message: string }
  | { ok: false; message: string; fieldErrors?: Partial<Record<keyof ProjectInput, string>> };
