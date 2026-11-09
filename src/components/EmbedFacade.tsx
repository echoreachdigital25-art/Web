"use client";

import Image from "next/image";
import { useState } from "react";
import { Play } from "./Icons";

/** Loads a YouTube/Vimeo iframe only after the visitor chooses to play. */
export function EmbedFacade({ src, title, poster }: { src: string; title: string; poster: string | null }) {
  const [on, setOn] = useState(false);
  if (on) {
    return (
      <iframe
        src={`${src}${src.includes("?") ? "&" : "?"}autoplay=1`}
        title={title}
        allow="autoplay; fullscreen; picture-in-picture; encrypted-media"
        allowFullScreen
        referrerPolicy="strict-origin-when-cross-origin"
      />
    );
  }
  return (
    <button type="button" className="facade" onClick={() => setOn(true)} aria-label={`Play video: ${title}`}>
      {poster && <Image src={poster} alt="" fill sizes="(max-width: 1240px) 100vw, 1200px" />}
      <span className="play-btn" aria-hidden="true">
        <span className="play-ico"><Play size={12} /></span>
        Play video
      </span>
    </button>
  );
}
