import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ProjectDetail } from "@/components/ProjectDetail";
import { getNextProject, getPublishedBySlug } from "@/lib/projects";
import { site } from "@/content/site";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const project = await getPublishedBySlug(slug);
  if (!project) return { title: "Project not found" };
  const description = project.summary || site.description;
  return {
    title: project.title,
    description,
    alternates: { canonical: `/work/${project.slug}` },
    openGraph: {
      type: "article",
      title: `${project.title} — KYNDE Motion`,
      description,
      url: `/work/${project.slug}`,
      images: project.thumbnailUrl ? [{ url: project.thumbnailUrl, alt: project.thumbnailAlt ?? project.title }] : undefined,
    },
  };
}

export default async function ProjectPage({ params }: Props) {
  const { slug } = await params;
  const project = await getPublishedBySlug(slug);
  if (!project) notFound();
  const next = await getNextProject(project);
  return <ProjectDetail project={project} next={next} />;
}
