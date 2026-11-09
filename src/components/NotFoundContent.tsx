import Link from "next/link";
import { ArrowRight } from "@/components/Icons";

export function NotFoundContent() {
  return (
    <section className="page-head container" style={{ minHeight: "80vh", display: "grid", placeItems: "center" }}>
      <div className="section-head corners corners--lg" style={{ padding: "56px clamp(24px,6vw,80px)", margin: 0 }}>
        <span className="pill">404</span>
        <h1>This page is out of frame.</h1>
        <p className="lead">The page you were looking for has moved or no longer exists.</p>
        <div className="btn-row" style={{ justifyContent: "center" }}>
          <Link href="/" className="btn btn--primary">
            Back to home <ArrowRight className="arrow" />
          </Link>
          <Link href="/work" className="btn btn--ghost">Explore Our Work</Link>
        </div>
      </div>
    </section>
  );
}
