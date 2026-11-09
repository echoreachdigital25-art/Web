import Link from "next/link";
import type { PublicProject } from "@/lib/public-project";
import { ProjectMedia } from "./ProjectMedia";

type Props = {
  project: PublicProject;
  headingLevel?: "h2" | "h3";
  wide?: boolean;
  priority?: boolean;
  sizes?: string;
  className?: string;
};

export function ProjectCard({ project, headingLevel = "h3", wide, priority, sizes, className = "" }: Props) {
  const H = headingLevel;
  return (
    <article className={`project-card${wide ? " project-card--wide" : ""} ${className}`}>
      <ProjectMedia
        project={project}
        wide={wide}
        priority={priority}
        sizes={sizes ?? (wide ? "(max-width: 1240px) 100vw, 1200px" : "(max-width: 640px) 100vw, 600px")}
      />
      <div className="project-body">
        <div>
          <H>
            <Link href={`/work/${project.slug}`}>{project.title}</Link>
          </H>
          {wide ? <p>{project.summary}</p> : <p>View project</p>}
        </div>
        <span className="pill pill--sm">{project.categoryLabel}</span>
      </div>
    </article>
  );
}
