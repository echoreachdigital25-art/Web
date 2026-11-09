"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import type { PublicProject } from "@/lib/public-project";
import { Play } from "./Icons";
import { VideoDialog } from "./VideoDialog";

/**
 * Card media: poster image, muted preview on hover (desktop, motion allowed),
 * and a separate Play button that opens the accessible video dialog.
 */
export function ProjectMedia({ project, sizes, priority, wide }: { project: PublicProject; sizes: string; priority?: boolean; wide?: boolean }) {
  const [open, setOpen] = useState(false);
  const [playing, setPlaying] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const portrait = project.orientation === "portrait";

  const canHover = () =>
    typeof window !== "undefined" &&
    window.matchMedia("(hover: hover)").matches &&
    !window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const start = () => {
    const v = videoRef.current;
    if (!v || !project.previewUrl || !canHover()) return;
    if (!v.src) v.src = project.previewUrl;
    v.play().then(() => setPlaying(true)).catch(() => {});
  };
  const stop = () => {
    const v = videoRef.current;
    if (!v) return;
    v.pause();
    setPlaying(false);
  };

  // Hover anywhere on the card (the title link covers the whole card).
  const wrapRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const card = wrapRef.current?.closest(".project-card") ?? wrapRef.current;
    if (!card) return;
    card.addEventListener("pointerenter", start);
    card.addEventListener("pointerleave", stop);
    return () => {
      card.removeEventListener("pointerenter", start);
      card.removeEventListener("pointerleave", stop);
    };
  });

  const poster = project.thumbnailUrl;
  const preview = project.previewUrl ? (
    <video ref={videoRef} className="pm-preview" muted loop playsInline preload="none" aria-hidden="true" tabIndex={-1} />
  ) : null;

  return (
    <div ref={wrapRef} className={`project-media corners${playing ? " is-playing" : ""}`}>
      {portrait ? (
        <>
          {poster && <Image src={poster} alt="" fill sizes={sizes} className="pm-fill pm-blur" aria-hidden="true" />}
          <div className="pm-portrait">
            {poster && <Image src={poster} alt={project.thumbnailAlt} fill sizes="(max-width: 640px) 60vw, 300px" priority={priority} />}
            {preview}
          </div>
        </>
      ) : (
        <>
          {poster ? (
            <Image src={poster} alt={project.thumbnailAlt} fill sizes={sizes} priority={priority} className="pm-fill" />
          ) : (
            <div className="pm-fill" style={{ background: "linear-gradient(140deg,#16365f,#050b16)" }} />
          )}
          {preview}
        </>
      )}
      {project.video && (
        <>
          <button type="button" className="play-btn" onClick={() => setOpen(true)} aria-label={`Play video: ${project.title}`}>
            <span className="play-ico"><Play size={12} /></span>
            <span aria-hidden="true">{wide ? "Play video" : "Play"}</span>
          </button>
          <VideoDialog project={project} open={open} onClose={() => setOpen(false)} />
        </>
      )}
    </div>
  );
}
