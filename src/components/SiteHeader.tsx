"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";
import { nav, site } from "@/content/site";
import { Close, Menu, ArrowRight } from "./Icons";
import { Monogram, Wordmark } from "./Logo";

function isActive(pathname: string, href: string) {
  return href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(href + "/");
}

export function SiteHeader() {
  const pathname = usePathname();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const openerRef = useRef<HTMLButtonElement>(null);

  // Close the menu after navigation.
  useEffect(() => {
    dialogRef.current?.close();
  }, [pathname]);

  return (
    <>
      <header className="site-header">
        <Link href="/" className="brand" aria-label="KYNDE Motion — home">
          <Wordmark />
        </Link>
        <div className="header-actions">
          <Link href="/contact" className="btn btn--sm">
            Start a Project
          </Link>
          <button
            ref={openerRef}
            type="button"
            className="icon-btn menu-btn"
            aria-label="Open menu"
            aria-haspopup="dialog"
            onClick={() => dialogRef.current?.showModal()}
          >
            <Menu />
          </button>
        </div>
      </header>

      <dialog
        ref={dialogRef}
        className="mobile-menu"
        aria-label="Site menu"
        onClose={() => openerRef.current?.focus()}
      >
        <div className="mobile-menu-top">
          <span className="brand">
            <Wordmark sub={false} />
          </span>
          <button type="button" className="icon-btn" aria-label="Close menu" onClick={() => dialogRef.current?.close()}>
            <Close />
          </button>
        </div>
        <nav aria-label="Main">
          {nav.map((item) => (
            <Link key={item.href} href={item.href} aria-current={isActive(pathname, item.href) ? "page" : undefined}>
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="menu-foot">
          <Link href="/contact" className="btn btn--primary">
            Start a Project <ArrowRight className="arrow" />
          </Link>
          <a className="muted" href={`mailto:${site.email}`}>{site.email}</a>
        </div>
      </dialog>
    </>
  );
}

export function FloatingNav() {
  const pathname = usePathname();
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const threshold = () => (pathname === "/" ? window.innerHeight * 0.6 : 120);
    const update = () => el.setAttribute("data-hidden", window.scrollY < threshold() ? "true" : "false");
    update();
    window.addEventListener("scroll", update, { passive: true });
    return () => window.removeEventListener("scroll", update);
  }, [pathname]);

  return (
    <nav ref={ref} className="float-nav" aria-label="Main" data-hidden="false">
      <Link href="/" className="mono" aria-label="KYNDE Motion — home">
        <Monogram />
      </Link>
      {nav.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className="nav-link"
          aria-current={isActive(pathname, item.href) ? "page" : undefined}
        >
          {item.label}
        </Link>
      ))}
    </nav>
  );
}
