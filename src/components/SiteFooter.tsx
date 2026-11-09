import Link from "next/link";
import { nav, site } from "@/content/site";
import { Wordmark } from "./Logo";

export function SiteFooter() {
  const year = new Date().getFullYear();
  return (
    <footer className="site-footer">
      <div className="container">
        <div className="footer-grid">
          <div className="footer-brand">
            <Link href="/" className="brand" aria-label="KYNDE Motion — home">
              <Wordmark />
            </Link>
            <p>
              We create compelling visual experiences, build powerful digital platforms and implement intelligent
              marketing solutions for ambitious brands.
            </p>
          </div>
          <div className="footer-col">
            <h2>Pages</h2>
            <ul>
              {nav.map((n) => (
                <li key={n.href}>
                  <Link href={n.href}>{n.label}</Link>
                </li>
              ))}
            </ul>
          </div>
          <div className="footer-col">
            <h2>Contact</h2>
            <ul>
              <li><a href={`mailto:${site.email}`}>{site.email}</a></li>
              <li><a href={site.whatsapp.href} target="_blank" rel="noopener noreferrer">WhatsApp</a></li>
              <li><a href={site.instagram.href} target="_blank" rel="noopener noreferrer">Instagram {site.instagram.handle}</a></li>
              <li><a href={site.linkedin.href} target="_blank" rel="noopener noreferrer">LinkedIn</a></li>
            </ul>
          </div>
        </div>
        <div className="footer-base">
          <span>© {year} KYNDE Motion. All rights reserved.</span>
          <Link href="/privacy">Privacy notice</Link>
        </div>
      </div>
    </footer>
  );
}
