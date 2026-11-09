import type { Metadata } from "next";
import Link from "next/link";
import { ClosingCta } from "@/components/ClosingCta";
import { ArrowRight, Plus } from "@/components/Icons";
import { ProjectCard } from "@/components/ProjectCard";
import { services } from "@/content/services";
import { getPublishedProjects } from "@/lib/projects";
import { toPublic, type PublicProject } from "@/lib/public-project";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Services",
  description:
    "Creative production and video advertising, website design, Shopify development, marketing automation, email marketing and social media management.",
  alternates: { canonical: "/services" },
};

async function relatedWork(): Promise<Record<string, PublicProject[]>> {
  try {
    const all = await getPublishedProjects();
    const out: Record<string, PublicProject[]> = {};
    for (const s of services) {
      out[s.slug] = all.filter((p) => s.workCategories.includes(p.category as never)).slice(0, 3).map(toPublic);
    }
    return out;
  } catch (err) {
    console.error("[services] could not load related work", err);
    return {};
  }
}

const contactHref = (title: string) => `/contact?service=${encodeURIComponent(title)}`;

export default async function ServicesPage() {
  const related = await relatedWork();
  const [flagship, ...rest] = services;

  return (
    <>
      <section className="page-head container">
        <div className="section-head section-head--left" style={{ marginBottom: 0 }}>
          <span className="pill">Services</span>
          <h1>Discover our services</h1>
          <p className="lead">
            Creative production leads everything we do. Around it, we build the websites, stores and marketing systems
            that turn attention into growth.
          </p>
        </div>
        <nav className="jump" aria-label="Jump to a service">
          {services.map((s) => (
            <a key={s.slug} href={`#${s.slug}`} className="filter">
              <span className="count">{s.number}</span> {s.title}
            </a>
          ))}
        </nav>
      </section>

      {/* Flagship */}
      <section id={flagship.slug} className="svc svc--flagship container" aria-labelledby={`${flagship.slug}-title`}>
        <div className="flagship-card reveal">
          <div className="svc-grid">
            <div className="svc-head">
              <span className="svc-num" aria-hidden="true">{flagship.number}</span>
              <span className="pill pill--cyan">Flagship service</span>
              <h2 id={`${flagship.slug}-title`}>{flagship.title}</h2>
            </div>
            <div className="svc-head">
              <p className="lead" style={{ maxWidth: "none" }}>{flagship.summary}</p>
              <Link href={contactHref(flagship.title)} className="btn btn--primary">
                {flagship.cta} <ArrowRight className="arrow" />
              </Link>
            </div>
          </div>
          <div className="flag-groups">
            {flagship.groups.map((g) => (
              <div key={g.title} className="flag-group">
                <h3>{g.title}</h3>
                <ul>
                  {g.items.map((i) => (
                    <li key={i}>{i}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          {(related[flagship.slug]?.length ?? 0) > 0 && (
            <div className="related">
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
                <h3 className="h-card" style={{ fontSize: "1.15rem" }}>Relevant work</h3>
                <Link href="/work" className="text-link">
                  Explore Our Work <ArrowRight size={16} />
                </Link>
              </div>
              <div className="related-grid">
                {related[flagship.slug].map((p) => (
                  <ProjectCard key={p.slug} project={p} headingLevel="h3" sizes="(max-width: 640px) 100vw, 380px" />
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      {rest.map((s) => {
        const work = related[s.slug] ?? [];
        return (
          <section key={s.slug} id={s.slug} className="svc container" aria-labelledby={`${s.slug}-title`}>
            <div className="svc-grid">
              <div className="svc-head reveal">
                <span className="svc-num" aria-hidden="true">{s.number}</span>
                <h2 id={`${s.slug}-title`}>{s.title}</h2>
                <p className="lead">{s.summary}</p>
                <Link href={contactHref(s.title)} className="btn">
                  {s.cta} <ArrowRight className="arrow" />
                </Link>
              </div>
              <div className="svc-groups reveal">
                {s.groups.map((g, gi) => (
                  <details key={g.title} className="svc-group" open={gi === 0}>
                    <summary>
                      {g.title}
                      <span className="n">{g.items.length} {g.items.length === 1 ? "item" : "items"}</span>
                      <span className="chev" aria-hidden="true"><Plus size={16} /></span>
                    </summary>
                    <ul>
                      {g.items.map((i) => (
                        <li key={i}>{i}</li>
                      ))}
                    </ul>
                  </details>
                ))}
                {work.length > 0 && (
                  <div className="related-grid" style={{ gridTemplateColumns: "1fr 1fr" }}>
                    {work.slice(0, 2).map((p) => (
                      <ProjectCard key={p.slug} project={p} sizes="300px" />
                    ))}
                  </div>
                )}
              </div>
            </div>
          </section>
        );
      })}

      <ClosingCta title="Not sure which service you need? Let’s talk it through." />
    </>
  );
}
