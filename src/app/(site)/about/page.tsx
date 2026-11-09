import type { Metadata } from "next";
import Link from "next/link";
import { AutoVideo } from "@/components/AutoVideo";
import { ClosingCta } from "@/components/ClosingCta";
import { ArrowRight } from "@/components/Icons";
import { site } from "@/content/site";
import { testimonials } from "@/content/testimonials";

export const metadata: Metadata = {
  title: "About",
  description:
    "KYNDE Motion is an independent creative production and digital studio helping ambitious brands stand out and grow.",
  alternates: { canonical: "/about" },
};

const principles = [
  {
    t: "Our creative philosophy",
    d: "Good work is made to be noticed and remembered. We start with the idea, then craft every frame, word and interaction so it earns attention honestly and holds it.",
  },
  {
    t: "How we approach challenges",
    d: "We begin with the business problem, not the deliverable. Once we understand your audience, goals and constraints, we recommend the mix of creative, digital and marketing work that will actually move things forward.",
  },
  {
    t: "Quality and thoughtful innovation",
    d: "We use new tools, including AI, where they make the work better, faster or more ambitious, and never as a shortcut around craft. Every output is reviewed with the same care, whatever made it.",
  },
  {
    t: "Partnership",
    d: "We keep communication clear and consistent, welcome feedback, and stay focused on what success looks like for you.",
  },
];

export default function AboutPage() {
  const evan = testimonials[0];
  return (
    <>
      <section className="container about-hero" aria-labelledby="about-title">
        <div className="circle corners">
          <AutoVideo src="/media/hero/reel.mp4" poster="/media/hero/reel-poster.webp" control controlClassName="reel-toggle" label="studio reel" />
        </div>
        <div className="about-hero-copy">
          <span className="pill">About us</span>
          <h1 id="about-title">We are KYNDE Motion</h1>
          <p className="lead">
            An independent creative production and digital studio. We help ambitious brands look exceptional, work
            seamlessly online and keep growing.
          </p>
          <div className="btn-row">
            <Link href="/contact" className="btn btn--primary">
              Start a Project <ArrowRight className="arrow" />
            </Link>
            <Link href="/work" className="btn btn--ghost">
              Explore Our Work
            </Link>
          </div>
        </div>
      </section>

      <section className="section container" aria-labelledby="who-title" style={{ paddingBottom: 0 }}>
        <h2 id="who-title" className="sr-only">Who we are</h2>
        <div className="two-col">
          <div className="prose dropcap">
            <p>
              We are a studio that brings creative production, digital platforms and marketing systems together under
              one roof. We concept and produce video, from creator-style ads and product commercials to explainers and
              brand films, and we build the websites, Shopify stores and automated journeys that put that work to use.
            </p>
            <p>
              Bringing these disciplines together means your brand looks and sounds consistent everywhere, and nothing
              gets lost between suppliers. One team understands the whole picture: the story, the platform and the
              systems behind them.
            </p>
          </div>
          <figure className="big-quote">
            <blockquote>
              <p>“{evan.excerpt}”</p>
            </blockquote>
            <figcaption className="muted">
              <strong style={{ color: "var(--white)" }}>{evan.name}</strong> · excerpt from client feedback
            </figcaption>
          </figure>
        </div>
      </section>

      <section className="section container" aria-labelledby="principles-title">
        <div className="section-head section-head--left reveal">
          <span className="pill">What guides us</span>
          <h2 id="principles-title" className="h-section">How we think and work</h2>
        </div>
        <div className="rule-list">
          {principles.map((p) => (
            <div key={p.t} className="rule-row reveal">
              <h3>{p.t}</h3>
              <p>{p.d}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="container" aria-labelledby="who-we-support" style={{ paddingBottom: "var(--section)" }}>
        <div className="two-col">
          <div className="section-head section-head--left reveal" style={{ marginBottom: 0 }}>
            <span className="pill">Who we work with</span>
            <h2 id="who-we-support" className="h-section">Built for ambitious brands</h2>
            <p className="lead">
              We work with founders, ecommerce brands, growing businesses and established companies across the USA, UK,
              Europe, Canada, Australia and the Middle East.
            </p>
          </div>
          <div style={{ display: "grid", gap: 28, alignContent: "start" }} className="reveal">
            <div>
              <h3 className="include-title" style={{ marginBottom: 12 }}>Sectors</h3>
              <ul className="chip-cloud" style={{ listStyle: "none", margin: 0, padding: 0 }}>
                {site.sectors.map((s) => (
                  <li key={s} className="pill">{s}</li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="include-title" style={{ marginBottom: 12 }}>Regions</h3>
              <ul className="chip-cloud" style={{ listStyle: "none", margin: 0, padding: 0 }}>
                {site.regions.map((s) => (
                  <li key={s} className="pill pill--cyan">{s}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      <ClosingCta />
    </>
  );
}
