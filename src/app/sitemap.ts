import type { MetadataRoute } from "next";
import { site } from "@/content/site";
import { getPublishedProjects } from "@/lib/projects";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const pages = ["", "/work", "/services", "/about", "/contact", "/privacy"].map((p) => ({
    url: `${site.url}${p}`,
    changeFrequency: "monthly" as const,
    priority: p === "" ? 1 : 0.7,
  }));
  let projects: MetadataRoute.Sitemap = [];
  try {
    projects = (await getPublishedProjects()).map((p) => ({
      url: `${site.url}/work/${p.slug}`,
      lastModified: p.updatedAt,
      changeFrequency: "monthly" as const,
      priority: 0.6,
    }));
  } catch (err) {
    console.error("[sitemap] could not load projects", err);
  }
  return [...pages, ...projects];
}
