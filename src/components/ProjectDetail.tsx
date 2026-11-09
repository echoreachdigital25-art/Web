import Image from "next/image";
import Link from "next/link";
import { categoryLabel } from "@/content/categories";
import { services } from "@/content/services";
import type { Project } from "@/lib/db/schema";
import { toPublic } from "@/lib/public-project";
import { ClosingCta } from "./ClosingCta";
import { EmbedFacade } from "./EmbedFacade";
import { ArrowLeft, ArrowRight } from "./Icons";
import { ProjectCard } from "./ProjectCard";

export function ProjectDetail({ project, next }: { project: Project; next: Project | null }) {
  const pub = toPublic(project);
  const portrait = project.orientation === "portrait";
  const service = services.find((s) => s.workCategories.includes(project.category as never));
  const facts: [string, string][] = [];
  if (project.client) facts.push(["Client", project.client]);
  facts.push(["Category", categoryLabel(project.category)]);
  if (project.year) facts.push(["Year", project.year]);
  if (project.role) facts.push(["Our role", project.role]);
  const paragraphs = (project.overview ?? "").split(/\n{2,}/).map((t) => t.trim()).filter(Boolean);

  return (
    <>
      <section className={`case-hero${portrait ? " is-portrait" : ""}`} aria-labelledby="case-title">
        <div className="case-hero-bg" aria-hidden="true">
          {project.thumbnailUrl && <Image src={project.thumbnailUrl} alt="" fill priority sizes="100vw" />}
        </div>
        <div className="container case-hero-content">
          <Link href="/work" className="btn btn--ghost btn--sm">
            <ArrowLeft size={16} /> All work
          </Link>
          <div className="case-meta">
            <span className="pill pill--cyan">{categoryLabel(project.category)}</span>
            {project.year && <span className="pill">{project.year}</span>}
          </div>
          <h1 id="case-title">{project.title}</h1>
          {project.summary && <p className="lead">{project.summary}</p>}
        </div>
      </section>

      <section className="container" aria-label="Project video">
        {pub.video && (
          <div className={`player${portrait ? " player--portrait" : ""}`}>
            {pub.video.kind === "file" ? (
              <video controls playsInline preload="none" poster={project.thumbnailUrl ?? undefined}>
                <source src={pub.video.url} type={pub.video.url.endsWith(".webm") ? "video/webm" : "video/mp4"} />
                Your browser cannot play this video. <a href={pub.video.url}>Download it instead</a>.
              </video>
            ) : (
              <EmbedFacade src={pub.video.url} title={`${project.title} video`} poster={project.thumbnailUrl} />
            )}
          </div>
        )}

        <div className="case-details">
          <dl className="facts">
            {facts.map(([k, v]) => (
              <div key={k}>
                <dt>{k}</dt>
                <dd>{v}</dd>
              </div>
            ))}
          </dl>
          <div className="prose">
            {paragraphs.map((t, i) => <p key={i}>{t}</p>)}
            {project.deliverables.length > 0 && (
              <>
                <h2 className="h-card" style={{ marginTop: 12 }}>Deliverables</h2>
                <ul className="deliv-list">
                  {project.deliverables.map((d) => (
                    <li key={d} className="pill">{d}</li>
                  ))}
                </ul>
              </>
            )}
            {service && (
              <p>
                <Link href={`/services#${service.slug}`} className="text-link">
                  Explore {service.title} <ArrowRight size={16} />
                </Link>
              </p>
            )}
          </div>
        </div>

        {project.gallery.length > 0 && (
          <div className={`gallery${portrait ? " is-portrait" : ""}`}>
            {project.gallery.map((g) => (
              <figure key={g.url}>
                <Image src={g.url} alt={g.alt || `Frame from ${project.title}`} width={1000} height={portrait ? 1778 : 625} sizes="(max-width: 640px) 50vw, 600px" />
              </figure>
            ))}
          </div>
        )}

        {next && (
          <div style={{ marginTop: "clamp(72px, 9vw, 128px)" }}>
            <div className="section-head section-head--left" style={{ marginBottom: 24 }}>
              <span className="pill">Next project</span>
            </div>
            <ProjectCard project={toPublic(next)} wide headingLevel="h2" />
          </div>
        )}
      </section>
      <ClosingCta />
    </>
  );
}
