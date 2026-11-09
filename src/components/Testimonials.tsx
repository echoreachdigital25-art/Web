"use client";

import { useRef, useState } from "react";
import { testimonials } from "@/content/testimonials";
import { Close } from "./Icons";

type T = (typeof testimonials)[number];

function Card({ t }: { t: T }) {
  const ref = useRef<HTMLDialogElement>(null);
  const btn = useRef<HTMLButtonElement>(null);
  const [, force] = useState(0);
  return (
    <figure className="quote-card reveal" style={{ margin: 0 }}>
      <div className="quote-mark" aria-hidden="true">“</div>
      <blockquote>
        <p>
          <span className="sr-only">Excerpt: </span>…{t.excerpt}
        </p>
      </blockquote>
      <figcaption className="quote-foot">
        <span>
          <cite>{t.name}</cite>
          <br />
          <span className="excerpt-note">Excerpt from client feedback</span>
        </span>
        <button
          ref={btn}
          type="button"
          className="link-btn"
          aria-haspopup="dialog"
          onClick={() => {
            ref.current?.showModal();
            force((n) => n + 1);
          }}
        >
          Read full<span className="sr-only"> testimonial from {t.name}</span>
        </button>
      </figcaption>
      <dialog
        ref={ref}
        className="dialog"
        aria-labelledby={`t-${t.id}`}
        onClose={() => btn.current?.focus()}
        onClick={(e) => e.target === ref.current && ref.current?.close()}
      >
        <div className="dialog-inner">
          <button type="button" className="icon-btn dialog-close" aria-label="Close" onClick={() => ref.current?.close()}>
            <Close />
          </button>
          <div className="quote-mark" aria-hidden="true">“</div>
          <h2 id={`t-${t.id}`} className="sr-only">Testimonial from {t.name}</h2>
          <blockquote className="big-quote" style={{ margin: 0 }}>
            <p style={{ fontSize: "1.15rem", lineHeight: 1.6 }}>{t.full}</p>
          </blockquote>
          <p><strong>{t.name}</strong></p>
        </div>
      </dialog>
    </figure>
  );
}

export function Testimonials() {
  return (
    <section className="section" aria-labelledby="testimonials-title">
      <div className="container">
        <div className="section-head reveal">
          <span className="pill">Testimonials</span>
          <h2 id="testimonials-title" className="h-section">In our clients’ words</h2>
          <p className="lead">Feedback shared by clients we have worked with.</p>
        </div>
        <div className="quotes">
          {testimonials.map((t) => (
            <Card key={t.id} t={t} />
          ))}
        </div>
      </div>
    </section>
  );
}
