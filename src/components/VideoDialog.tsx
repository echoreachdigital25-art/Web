"use client";

import { useEffect, useRef } from "react";
import type { PublicProject } from "@/lib/public-project";
import { Close } from "./Icons";

/**
 * Accessible video modal built on <dialog>: focus moves into the dialog,
 * Escape closes it, background content is inert, and focus returns to the
 * button that opened it. The video only loads once the dialog is opened.
 */
export function VideoDialog({ project, open, onClose }: { project: PublicProject; open: boolean; onClose: () => void }) {
  const ref = useRef<HTMLDialogElement>(null);
  const opener = useRef<Element | null>(null);

  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (open && !d.open) {
      opener.current = document.activeElement;
      d.showModal();
    } else if (!open && d.open) {
      d.close();
    }
  }, [open]);

  const portrait = project.orientation === "portrait";
  const titleId = `vd-${project.slug}`;

  return (
    <dialog
      ref={ref}
      className={`dialog dialog--video${portrait ? " is-portrait" : ""}`}
      aria-labelledby={titleId}
      onClose={() => {
        onClose();
        (opener.current as HTMLElement | null)?.focus?.();
      }}
      onClick={(e) => {
        if (e.target === ref.current) ref.current?.close();
      }}
    >
      <button type="button" className="icon-btn dialog-close" aria-label="Close video" onClick={() => ref.current?.close()}>
        <Close />
      </button>
      <div className="video-shell">
        {open && project.video?.kind === "file" && (
          <video src={project.video.url} poster={project.thumbnailUrl ?? undefined} controls autoPlay playsInline preload="metadata">
            Your browser cannot play this video. <a href={project.video.url}>Download the video</a>.
          </video>
        )}
        {open && project.video?.kind === "embed" && (
          <iframe
            src={`${project.video.url}${project.video.url.includes("?") ? "&" : "?"}autoplay=1`}
            title={`${project.title} video`}
            allow="autoplay; fullscreen; picture-in-picture; encrypted-media"
            allowFullScreen
            referrerPolicy="strict-origin-when-cross-origin"
          />
        )}
      </div>
      <div className="video-caption">
        <h2 id={titleId} className="h-card" style={{ fontSize: "1.1rem" }}>
          {project.title}
        </h2>
        <span className="pill pill--sm">{project.categoryLabel}</span>
      </div>
    </dialog>
  );
}
