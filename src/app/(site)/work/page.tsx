import type { Metadata } from "next";
import Link from "next/link";
import { ClosingCta } from "@/components/ClosingCta";
import { ProjectCard } from "@/components/ProjectCard";
import { getActiveCategories, getPublishedProjects } from "@/lib/projects";
import { toPublic } from "@/lib/public-project";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Our Work",
  description:
    "Selected work from KYNDE Motion: creator-style video ads, product explainers and brand films for ambitious brands.",
  alternates: { canonical: "/work" },
};

export default async function WorkPage({ searchParams }: { searchParams: Promise<{ category?: string }> }) {
  const { category } = await searchParams;
  const active = await getActiveCategories();
  const selected = active.find((c) => c.slug === category)?.slug;
  const projects = (await getPublishedProjects(selected)).map(toPublic);
  const total = active.reduce((n, c) => n + c.count, 0);

  return (
    <>
      <section className="page-head container">
        <div className="section-head" style={{ marginBottom: 40 }}>
          <span className="pill">Our Work</span>
          <h1>Selected work</h1>
          <p className="lead">
            Advertising, explainers and brand films. Press play on any project, or open it for the full story.
          </p>
        </div>

        {active.length > 1 && (
          <nav className="filters" aria-label="Filter projects by category">
            <Link href="/work" className="filter" aria-current={!selected ? "true" : undefined} scroll={false}>
              All <span className="count">{total}</span>
            </Link>
            {active.map((c) => (
              <Link
                key={c.slug}
                href={`/work?category=${c.slug}`}
                className="filter"
                aria-current={selected === c.slug ? "true" : undefined}
                scroll={false}
              >
                {c.label} <span className="count">{c.count}</span>
              </Link>
            ))}
          </nav>
        )}

        <p className="sr-only" aria-live="polite">
          Showing {projects.length} project{projects.length === 1 ? "" : "s"}
          {selected ? ` in ${active.find((c) => c.slug === selected)?.label}` : ""}.
        </p>

        {projects.length ? (
          <div className="work-list">
            {projects.map((p, i) => (
              <ProjectCard key={p.slug} project={p} wide headingLevel="h2" priority={i === 0} />
            ))}
          </div>
        ) : (
          <p className="lead" style={{ margin: "0 auto", textAlign: "center" }}>
            New projects are on the way. In the meantime, <Link href="/contact" className="text-link">tell us about yours</Link>.
          </p>
        )}
      </section>
      <ClosingCta title="Have a project in mind? Let’s make it impossible to ignore." />
    </>
  );
}
