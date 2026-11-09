import Image from "next/image";
import Link from "next/link";
import { site } from "@/content/site";
import { ArrowRight } from "./Icons";
import { Tilt } from "./Tilt";

export function ClosingCta({ title = "Let’s make your brand impossible to ignore." }: { title?: string }) {
  return (
    <section className="closing" aria-labelledby="closing-title">
      <div className="container">
        <h2 id="closing-title" className="reveal">{title}</h2>
        <p className="lead reveal">
          Tell us what you are building, launching or reimagining. We will come back with questions, ideas and a clear
          way forward.
        </p>
        <div className="btn-row reveal">
          <Link href="/contact" className="btn btn--primary">
            Start a Project <ArrowRight className="arrow" />
          </Link>
          <a href={site.whatsapp.href} className="btn btn--ghost" target="_blank" rel="noopener noreferrer">
            Let’s Talk<span className="sr-only"> on WhatsApp (opens in a new tab)</span>
          </a>
        </div>
        <Tilt className="fan" max={8}>
          <div className="fan-inner" aria-hidden="true">
            <div className="fan-card fan-card--l corners">
              <Image src="/media/work/colombia-in-bricks/still-3.webp" alt="" fill sizes="240px" style={{ objectFit: "cover" }} />
            </div>
            <div className="fan-card fan-card--c corners">
              <Image src="/media/work/body-glow-creator-ad/poster.webp" alt="" fill sizes="240px" style={{ objectFit: "cover" }} />
            </div>
            <div className="fan-card fan-card--r corners">
              <Image src="/media/work/clean-energy-brand-film/still-1.webp" alt="" fill sizes="240px" style={{ objectFit: "cover" }} />
            </div>
          </div>
        </Tilt>
        <ul className="socials" aria-label="Social links">
          <li><a href={site.instagram.href} target="_blank" rel="noopener noreferrer">Instagram</a></li>
          <li><a href={site.linkedin.href} target="_blank" rel="noopener noreferrer">LinkedIn</a></li>
          <li><a href={site.whatsapp.href} target="_blank" rel="noopener noreferrer">WhatsApp</a></li>
          <li><a href={`mailto:${site.email}`}>Email</a></li>
        </ul>
      </div>
    </section>
  );
}
