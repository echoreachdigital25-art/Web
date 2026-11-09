"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

/**
 * Progressive-enhancement motion: content is fully visible without JS.
 * Adds scroll reveals, the studio-statement word reveal and gentle parallax.
 * Everything is skipped when the visitor prefers reduced motion; parallax is
 * also skipped on touch devices.
 */
export function MotionController() {
  const pathname = usePathname();

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) return;
    const touch = window.matchMedia("(hover: none)").matches;
    const root = document.documentElement;
    const cleanups: (() => void)[] = [];

    // 1. Reveal on scroll
    const reveals = Array.from(document.querySelectorAll<HTMLElement>(".reveal"));
    const vh = window.innerHeight;
    reveals.forEach((el) => {
      if (el.getBoundingClientRect().top < vh * 0.95) el.classList.add("in");
    });
    root.classList.add("reveal-ready");
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("in");
            io.unobserve(e.target);
          }
        });
      },
      { rootMargin: "0px 0px -8% 0px" },
    );
    reveals.forEach((el) => !el.classList.contains("in") && io.observe(el));
    cleanups.push(() => io.disconnect());

    // 2. Statement word reveal + 3. parallax, driven by one rAF scroll loop
    const statements = Array.from(document.querySelectorAll<HTMLElement>("[data-statement]")).map((section) => {
      section.classList.add("is-enhanced");
      return { section, words: Array.from(section.querySelectorAll<HTMLElement>(".w")) };
    });
    const parallax = touch ? [] : Array.from(document.querySelectorAll<HTMLElement>("[data-speed]"));

    let ticking = false;
    const update = () => {
      ticking = false;
      const h = window.innerHeight;
      for (const { section, words } of statements) {
        const r = section.getBoundingClientRect();
        const total = Math.max(1, r.height - h);
        const progress = Math.min(1, Math.max(0, (-r.top + h * 0.35) / (total * 0.75)));
        const lit = Math.round(progress * words.length);
        words.forEach((w, i) => w.classList.toggle("on", i < lit));
      }
      for (const el of parallax) {
        const r = el.getBoundingClientRect();
        if (r.bottom < -200 || r.top > h + 200) continue;
        const speed = Number(el.dataset.speed) || 0;
        const offset = (r.top + r.height / 2 - h / 2) * speed;
        el.style.translate = `0 ${offset.toFixed(1)}px`;
      }
    };
    const onScroll = () => {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(update);
      }
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    cleanups.push(() => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      statements.forEach(({ section, words }) => {
        section.classList.remove("is-enhanced");
        words.forEach((w) => w.classList.remove("on"));
      });
      parallax.forEach((el) => (el.style.translate = ""));
    });

    return () => cleanups.forEach((fn) => fn());
  }, [pathname]);

  return null;
}
