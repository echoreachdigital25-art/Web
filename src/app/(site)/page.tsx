import Image from "next/image";
import Link from "next/link";
import { AutoVideo } from "@/components/AutoVideo";
import { HeroToggle } from "@/components/HeroToggle";
import { ClosingCta } from "@/components/ClosingCta";
import { ArrowRight } from "@/components/Icons";
import { ProjectCard } from "@/components/ProjectCard";
import { Testimonials } from "@/components/Testimonials";
import { Tilt } from "@/components/Tilt";
import { services } from "@/content/services";
import { site } from "@/content/site";
import { getFeaturedProjects } from "@/lib/projects";
import { toPublic } from "@/lib/public-project";

export const dynamic = "force-dynamic";

const STATEMENT =
  "We create the visuals that capture attention, build the platforms that turn it into action, and connect the systems that keep customers coming back.";

const steps = [
  { t: "Discover", d: "We get to know your business, your audience and what you need the work to achieve." },
  { t: "Define", d: "Together we agree the scope, creative direction and deliverables before production begins." },
  { t: "Create", d: "We produce and develop the work — concepts, scripts, footage, design, builds and systems." },
  { t: "Refine", d: "We share the work for review and incorporate your feedback with care." },
  { t: "Deliver", d: "We launch or hand over everything you need, with ongoing support where agreed." },
];

async function loadFeatured() {
  try {
    return (await getFeaturedProjects(4)).map(toPublic);
  } catch (err) {
    console.error("[home] could not load featured projects", err);
    return [];
  }
}

export default async function HomePage() {
  const featured = await loadFeatured();

  return (
    <>
      {/* A. Hero */}
      <section className="hero" aria-labelledby="hero-title">
        <div className="hero-bg" aria-hidden="true">
          <AutoVideo src="/media/hero/reel.mp4" poster="/media/hero/reel-poster.webp" eager group="hero" />
        </div>

        <div className="hero-word corners corners--lg" aria-hidden="true">
          <span>KYNDE</span>
        </div>

        <div className="hero-stage">
          <div className="hero-card hero-card--side hero-card--left float-b" aria-hidden="true">
            <Image src="/media/work/colombia-in-bricks/poster.webp" alt="" fill sizes="340px" priority />
          </div>
          <div className="hero-card hero-card--side hero-card--right float-c" aria-hidden="true">
            <Image src="/media/work/clean-energy-brand-film/still-3.webp" alt="" fill sizes="340px" />
          </div>
          <div className="hero-card hero-card--main float-a">
            <AutoVideo
              src="/media/work/body-glow-creator-ad/preview.mp4"
              poster="/media/work/body-glow-creator-ad/poster.webp"
              eager
              group="hero"
            />
          </div>
        </div>

        <div className="hero-copy">
          <span className="pill pill--cyan">{site.positioning}</span>
          <h1 id="hero-title">Make Your Brand Impossible to Ignore.</h1>
          <p className="lead">
            KYNDE Motion makes video that gets noticed, builds websites and stores that convert, and sets up the
            marketing systems that help ambitious brands grow.
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

        <div className="media-toggle">
          <HeroToggle />
        </div>
      </section>

      {/* B. Studio introduction */}
      <section className="statement" data-statement aria-labelledby="studio-title">
        <div className="statement-sticky">
          <div className="statement-inner">
            <span className="pill">Our Studio</span>
            <h2 id="studio-title" className="sr-only">Who we are</h2>
            <p className="statement-text">
              {STATEMENT.split(" ").map((w, i) => (
                <span key={i}>
                  <span className="w">{w}</span>{" "}
                </span>
              ))}
            </p>
            <p className="statement-caption">© KYNDE Motion — Independent Creative Production &amp; Digital Studio</p>
          </div>
        </div>
        <div className="frames" aria-hidden="true">
          <div className="frame frame-1" data-speed="-0.08">
            <Image src="/media/work/colombia-in-bricks/still-4.webp" alt="" fill sizes="(max-width: 860px) 40vw, 26vw" />
          </div>
          <div className="frame frame-2" data-speed="-0.16">
            <Image src="/media/work/body-glow-creator-ad/still-2.webp" alt="" fill sizes="(max-width: 860px) 30vw, 17vw" />
          </div>
          <div className="frame frame-3" data-speed="-0.04">
            <Image src="/media/work/conversational-commerce-explainer/poster.webp" alt="" fill sizes="(max-width: 860px) 60vw, 34vw" />
          </div>
          <div className="frame frame-4" data-speed="-0.12">
            <Image src="/media/work/supply-chain-explainer/poster.webp" alt="" fill sizes="19vw" />
          </div>
          <div className="frame frame-5" data-speed="-0.1">
            <Image src="/media/work/clean-energy-brand-film/still-4.webp" alt="" fill sizes="28vw" />
          </div>
        </div>
      </section>

      <section className="container" aria-label="What we do" style={{ position: "relative", zIndex: 4 }}>
        <div className="wide-reel reveal">
          <div className="reel-frame corners">
            <AutoVideo
              src="/media/hero/reel.mp4"
              poster="/media/hero/reel-poster.webp"
              control
              controlClassName="reel-toggle"
              label="studio reel"
            />
            <span className="pill reel-label">Frames from our recent work</span>
          </div>
        </div>
        <div className="pillars">
          <div className="pillar reveal">
            <span className="eyebrow-num">01</span>
            <h3>Creative production</h3>
            <p>Ads, product films, explainers and brand stories, made for the channels your audience watches.</p>
          </div>
          <div className="pillar reveal">
            <span className="eyebrow-num">02</span>
            <h3>Digital experiences</h3>
            <p>Websites and Shopify stores that turn that attention into enquiries and sales.</p>
          </div>
          <div className="pillar reveal">
            <span className="eyebrow-num">03</span>
            <h3>Marketing systems</h3>
            <p>Automation, email and social management that keep leads and customers moving.</p>
          </div>
        </div>
      </section>

      {/* C. Featured work */}
      <section className="section" aria-labelledby="work-title">
        <div className="container">
          <div className="section-head reveal">
            <span className="pill">Featured Work</span>
            <h2 id="work-title" className="h-section">Work that earns attention</h2>
            <p className="lead">
              A selection of recent productions: advertising, explainers and brand films made to stop the scroll and
              hold it.
            </p>
          </div>
          {featured.length > 0 && (
            <div className="work-grid">
              {featured.map((p) => (
                <ProjectCard key={p.slug} project={p} className="reveal" />
              ))}
            </div>
          )}
          <div className="btn-row reveal" style={{ justifyContent: "center", marginTop: 40 }}>
            <Link href="/work" className="btn">
              Explore Our Work <ArrowRight className="arrow" />
            </Link>
          </div>
        </div>
      </section>

      {/* D. Services */}
      <section className="section" aria-labelledby="services-title" style={{ paddingTop: 0 }}>
        <div className="container help">
          <div className="help-intro reveal">
            <span className="pill">Services</span>
            <h2 id="services-title" className="h-section">How we help brands grow</h2>
            <p className="lead">
              Six connected services, led by creative production. Use one, or bring them together so every touchpoint
              works as one.
            </p>
            <p className="include-title">Every engagement includes:</p>
            <ul className="include-list">
              <li>Strategy shaped around your goals</li>
              <li>Consistent communication throughout</li>
              <li>Work prepared for the channels you use</li>
            </ul>
            <Link href="/services" className="btn">
              Discover Our Services <ArrowRight className="arrow" />
            </Link>
          </div>
          <div className="service-rows">
            {services.map((s) => (
              <Link
                key={s.slug}
                href={`/services#${s.slug}`}
                className={`service-row reveal${s.flagship ? " service-row--flagship" : ""}`}
              >
                <span className="thumb" aria-hidden="true">
                  {s.flagship ? (
                    <Image src="/media/work/colombia-in-bricks/still-2.webp" alt="" width={300} height={169} />
                  ) : (
                    s.number
                  )}
                </span>
                <div>
                  <h3>
                    {s.title}
                    {s.flagship && <span className="pill pill--cyan pill--sm">Flagship</span>}
                  </h3>
                  <p>{s.short}</p>
                </div>
                <ArrowRight className="go" />
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* E. Approach */}
      <section className="section" aria-labelledby="approach-title" style={{ paddingTop: 0 }}>
        <div className="container">
          <div className="section-head section-head--left reveal">
            <span className="pill">Our Approach</span>
            <h2 id="approach-title" className="h-section">A clear process from first call to launch</h2>
            <p className="lead">
              Every project is different, but the way we work stays consistent, so you always know where things stand
              and what comes next.
            </p>
          </div>
          <ol className="process" style={{ listStyle: "none", margin: 0, padding: 0 }}>
            {steps.map((s, i) => (
              <li key={s.t} className="process-row reveal">
                <span className="eyebrow-num">{String(i + 1).padStart(2, "0")}</span>
                <h3>{s.t}</h3>
                <p>{s.d}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* F. Why KYNDE Motion */}
      <section className="section" aria-labelledby="why-title" style={{ paddingTop: 0 }}>
        <div className="container">
          <div className="section-head reveal">
            <span className="pill">Why KYNDE Motion</span>
            <h2 id="why-title" className="h-section">Why brands work with us</h2>
            <p className="lead">
              Strong creative is only part of it. We pair it with clear thinking, careful execution and steady
              communication.
            </p>
          </div>
          <div className="bento">
            <Tilt className="tile tile-a reveal" max={5}>
              <div className="stack" aria-hidden="true">
                <span><Image src="/media/work/supply-chain-explainer/still-3.webp" alt="" fill sizes="200px" /></span>
                <span><Image src="/media/work/colombia-in-bricks/still-1.webp" alt="" fill sizes="200px" /></span>
                <span><Image src="/media/work/conversational-commerce-explainer/still-1.webp" alt="" fill sizes="200px" /></span>
              </div>
              <h3>Creative thinking, strategic execution</h3>
              <p>Ideas grounded in what your brand needs to achieve.</p>
            </Tilt>
            <Tilt className="tile tile-b reveal" max={5}>
              <div className="tile-photo" aria-hidden="true">
                <Image src="/media/work/supply-chain-explainer/still-1.webp" alt="" fill sizes="(max-width: 1024px) 50vw, 400px" />
              </div>
              <h3>Strong visual production</h3>
              <p>Polished footage, motion and edits built to hold attention.</p>
            </Tilt>
            <Tilt className="tile tile-c reveal" max={5}>
              <div className="tile-photo" aria-hidden="true">
                <Image src="/media/work/conversational-commerce-explainer/still-4.webp" alt="" fill sizes="(max-width: 1024px) 50vw, 400px" />
              </div>
              <h3>Tailored digital solutions</h3>
              <p>Websites, stores and systems shaped around how you work.</p>
            </Tilt>
            <Tilt className="tile tile-d reveal" max={5}>
              <div className="tile-photo" aria-hidden="true">
                <Image src="/media/work/colombia-in-bricks/still-4.webp" alt="" fill sizes="(max-width: 1024px) 50vw, 400px" style={{ objectPosition: "60% 50%" }} />
              </div>
              <h3>Attention to detail</h3>
              <p>The frame, the cut, the copy and the click: every detail is considered.</p>
            </Tilt>
            <div className="tile tile-e reveal">
              <div>
                <h3>Consistent communication</h3>
                <p>You will always know what is happening on your project.</p>
              </div>
              <div className="tags" aria-label="How we keep you informed">
                <span className="pill">Clear updates</span>
                <span className="pill">Shared feedback</span>
                <span className="pill">Agreed next steps</span>
              </div>
            </div>
            <div className="tile tile-f reveal">
              <span className="rings" aria-hidden="true" />
              <div>
                <h3>Committed to your objectives</h3>
                <p>Your goals guide every creative and technical decision we make.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* G. Testimonials */}
      <Testimonials />

      {/* H. Closing CTA (footer follows in the layout) */}
      <ClosingCta />
    </>
  );
}
