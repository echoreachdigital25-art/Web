"use client";

import { useEffect, useState } from "react";
import { Pause, Play } from "./Icons";

/** Pauses/plays every video in the "hero" group (WCAG 2.2.2 pause control). */
export function HeroToggle() {
  const [paused, setPaused] = useState(false);
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) setPaused(true);
    const on = (e: Event) => {
      const d = (e as CustomEvent<{ group: string; paused: boolean }>).detail;
      if (d.group === "hero") setPaused(d.paused);
    };
    window.addEventListener("kynde:video-group", on);
    return () => window.removeEventListener("kynde:video-group", on);
  }, []);
  return (
    <button
      type="button"
      className="icon-btn"
      aria-label={paused ? "Play background video" : "Pause background video"}
      onClick={() => window.dispatchEvent(new CustomEvent("kynde:video-group", { detail: { group: "hero", paused: !paused } }))}
    >
      {paused ? <Play /> : <Pause />}
    </button>
  );
}
