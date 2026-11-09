"use client";

import { useEffect, useRef, useState } from "react";
import { Pause, Play } from "./Icons";

type Props = {
  src: string;
  poster: string;
  className?: string;
  /** Show a pause/play button (required for motion that lasts > 5s). */
  control?: boolean;
  controlClassName?: string;
  label?: string;
  /** Start loading immediately (hero only). Otherwise loads when near the viewport. */
  eager?: boolean;
  /** Other videos sharing this group id are paused/played by this control too. */
  group?: string;
};

/**
 * Muted, looping, inline decorative video. Never autoplays with sound, does
 * not download until near the viewport, pauses off-screen, and stays on the
 * poster frame when the visitor prefers reduced motion.
 */
export function AutoVideo({ src, poster, className, control, controlClassName, label = "background video", eager, group }: Props) {
  const ref = useRef<HTMLVideoElement>(null);
  const [paused, setPaused] = useState(false);
  const [reduced, setReduced] = useState(false);
  const userPaused = useRef(false);

  useEffect(() => {
    const v = ref.current;
    if (!v) return;
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (mq.matches) {
      setReduced(true);
      setPaused(true);
      userPaused.current = true;
      return;
    }
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          if (v.preload === "none") {
            v.preload = "auto";
            if (!v.src) v.src = src;
          }
          if (!userPaused.current) v.play().catch(() => setPaused(true));
        } else {
          v.pause();
        }
      },
      { rootMargin: eager ? "0px" : "200px 0px" },
    );
    io.observe(v);
    const onGroup = (ev: Event) => {
      const detail = (ev as CustomEvent<{ group: string; paused: boolean }>).detail;
      if (!group || detail.group !== group) return;
      userPaused.current = detail.paused;
      setPaused(detail.paused);
      if (detail.paused) v.pause();
      else v.play().catch(() => {});
    };
    window.addEventListener("kynde:video-group", onGroup);
    return () => {
      io.disconnect();
      window.removeEventListener("kynde:video-group", onGroup);
    };
  }, [src, eager, group]);

  const toggle = () => {
    const next = !paused;
    if (group) {
      window.dispatchEvent(new CustomEvent("kynde:video-group", { detail: { group, paused: next } }));
    } else {
      const v = ref.current;
      userPaused.current = next;
      setPaused(next);
      if (next) v?.pause();
      else {
        if (v && !v.src) v.src = src;
        v?.play().catch(() => {});
      }
    }
  };

  return (
    <>
      <video
        ref={ref}
        className={className}
        poster={poster}
        muted
        loop
        playsInline
        preload="none"
        aria-hidden="true"
        tabIndex={-1}
        disablePictureInPicture
        src={eager && !reduced ? src : undefined}
      />
      {control && (
        <button type="button" className={`icon-btn ${controlClassName ?? ""}`} onClick={toggle} aria-label={paused ? `Play ${label}` : `Pause ${label}`}>
          {paused ? <Play /> : <Pause />}
        </button>
      )}
    </>
  );
}
