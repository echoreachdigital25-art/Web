"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, useTransition } from "react";
import { categories } from "@/content/categories";
import type { Project } from "@/lib/db/schema";
import { slugify, type ProjectInput, type SaveIntent } from "@/lib/project-schema";
import { parseVideoUrl } from "@/lib/video";
import { archiveProject, saveProject } from "./actions";
import { LibraryPicker, UploadButton } from "./MediaField";
import { uploadFile } from "./upload-client";

type Mode = "upload" | "link" | "none";
type Errors = Partial<Record<keyof ProjectInput, string>>;

function initial(p: Project | null, sortOrder: number): ProjectInput {
  return {
    title: p?.title ?? "",
    slug: p?.slug ?? "",
    category: (p?.category as ProjectInput["category"]) ?? "ugc-ai-video-ads",
    summary: p?.summary ?? "",
    client: p?.client ?? "",
    year: p?.year ?? "",
    role: p?.role ?? "",
    overview: p?.overview ?? "",
    deliverables: p?.deliverables ?? [],
    thumbnailUrl: p?.thumbnailUrl ?? "",
    thumbnailAlt: p?.thumbnailAlt ?? "",
    videoSource: p?.videoSource ?? "file",
    videoUrl: p?.videoUrl ?? "",
    previewUrl: p?.previewUrl ?? "",
    orientation: p?.orientation ?? "landscape",
    gallery: p?.gallery ?? [],
    featured: p?.featured ?? false,
    sortOrder: p?.sortOrder ?? sortOrder,
  };
}

const isUploaded = (url: string) => url.startsWith("/media/") || url.startsWith("/uploads/");

export function ProjectEditor({ project, defaultOrder, storageBase }: { project: Project | null; defaultOrder: number; storageBase: string | null }) {
  const router = useRouter();
  const [v, setV] = useState<ProjectInput>(() => initial(project, defaultOrder));
  const [errors, setErrors] = useState<Errors>({});
  const [message, setMessage] = useState<{ kind: "ok" | "error"; text: string } | null>(null);
  const [dirty, setDirty] = useState(false);
  const [pending, start] = useTransition();
  const [slugTouched, setSlugTouched] = useState(Boolean(project));
  const isOwnFile = (url: string) => isUploaded(url) || (!!storageBase && url.startsWith(storageBase));
  const [mode, setMode] = useState<Mode>(() =>
    project?.videoSource === "none" ? "none" : project?.videoUrl && !isOwnFile(project.videoUrl) ? "link" : "upload",
  );
  const [linkDraft, setLinkDraft] = useState(project?.videoUrl && !isOwnFile(project.videoUrl) ? project.videoUrl : "");
  const msgRef = useRef<HTMLDivElement>(null);
  const status = project?.status ?? "draft";

  // Warn before leaving with unsaved changes.
  useEffect(() => {
    const h = (e: BeforeUnloadEvent) => {
      if (dirty) e.preventDefault();
    };
    window.addEventListener("beforeunload", h);
    return () => window.removeEventListener("beforeunload", h);
  }, [dirty]);

  const set = <K extends keyof ProjectInput>(k: K, val: ProjectInput[K]) => {
    setV((s) => ({ ...s, [k]: val }));
    setDirty(true);
    if (errors[k]) setErrors((e) => ({ ...e, [k]: undefined }));
  };

  const onTitle = (t: string) => {
    setV((s) => ({ ...s, title: t, slug: slugTouched ? s.slug : slugify(t) }));
    setDirty(true);
  };

  const payload = (): ProjectInput => {
    if (mode === "none") return { ...v, videoSource: "none", videoUrl: "" };
    if (mode === "link") {
      const parsed = parseVideoUrl(linkDraft);
      return { ...v, videoSource: parsed?.source ?? "file", videoUrl: linkDraft.trim() };
    }
    return { ...v, videoSource: "file" };
  };

  const submit = (intent: SaveIntent) => {
    setMessage(null);
    start(async () => {
      const res = await saveProject(project?.id ?? null, payload(), intent);
      if (res.ok) {
        setDirty(false);
        setErrors({});
        if (!project) {
          router.replace(`/admin/projects/${res.id}?notice=created`);
          return;
        }
        setMessage({ kind: "ok", text: res.message });
        router.refresh();
      } else {
        setErrors(res.fieldErrors ?? {});
        setMessage({ kind: "error", text: res.message });
      }
      requestAnimationFrame(() => msgRef.current?.focus());
    });
  };

  const err = (k: keyof ProjectInput) =>
    errors[k] ? (
      <p className="a-error" id={`err-${k}`} role="alert">
        {errors[k]}
      </p>
    ) : null;
  const aria = (k: keyof ProjectInput) => ({
    "aria-invalid": errors[k] ? (true as const) : undefined,
    "aria-describedby": errors[k] ? `err-${k}` : undefined,
  });

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        submit("save");
      }}
      noValidate
    >
      <div ref={msgRef} tabIndex={-1} aria-live="polite">
        {message && <p className={`a-alert a-alert--${message.kind === "ok" ? "ok" : "error"}`}>{message.text}</p>}
      </div>

      <div className="a-editor">
        <div style={{ display: "grid", gap: 16 }}>
          {/* Basics */}
          <section className="a-panel" aria-labelledby="sec-basics">
            <div className="a-panel-head">
              <h2 id="sec-basics">Basics</h2>
              <p className="a-hint">What visitors see on project cards and at the top of the project page.</p>
            </div>
            <div className="a-form">
              <div className="a-field">
                <label htmlFor="title">Title</label>
                <input id="title" className="a-input" value={v.title} onChange={(e) => onTitle(e.target.value)} maxLength={120} {...aria("title")} />
                {err("title")}
              </div>
              <div className="a-field">
                <label htmlFor="slug">Page address</label>
                <div className="a-prefix">
                  <span>/work/</span>
                  <input
                    id="slug"
                    className="a-input"
                    value={v.slug}
                    onChange={(e) => {
                      setSlugTouched(true);
                      set("slug", e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "-"));
                    }}
                    maxLength={80}
                    {...aria("slug")}
                  />
                </div>
                <p className="a-hint">Filled in from the title. Changing it on a live project changes its link.</p>
                {err("slug")}
              </div>
              <div className="a-grid-2">
                <div className="a-field">
                  <label htmlFor="category">Category</label>
                  <select id="category" className="a-input" value={v.category} onChange={(e) => set("category", e.target.value as ProjectInput["category"])} {...aria("category")}>
                    {categories.map((c) => (
                      <option key={c.slug} value={c.slug}>{c.label}</option>
                    ))}
                  </select>
                  <p className="a-hint">Filters only show categories that have published projects.</p>
                  {err("category")}
                </div>
                <div className="a-field">
                  <span className="a-label" id="orient-label">Video shape</span>
                  <div className="a-radios" role="radiogroup" aria-labelledby="orient-label">
                    {(["landscape", "portrait", "square"] as const).map((o) => (
                      <label key={o}>
                        <input type="radio" name="orientation" checked={v.orientation === o} onChange={() => set("orientation", o)} />
                        {o === "landscape" ? "Landscape 16:9" : o === "portrait" ? "Vertical 9:16" : "Square"}
                      </label>
                    ))}
                  </div>
                </div>
              </div>
              <div className="a-field">
                <label htmlFor="summary">Summary</label>
                <textarea id="summary" className="a-input" value={v.summary} onChange={(e) => set("summary", e.target.value)} maxLength={500} rows={3} {...aria("summary")} />
                <p className="a-hint">One or two sentences describing the work. Required before publishing. {v.summary.length}/500</p>
                {err("summary")}
              </div>
            </div>
          </section>

          {/* Video */}
          <section className="a-panel" aria-labelledby="sec-video">
            <div className="a-panel-head">
              <h2 id="sec-video">Video</h2>
              <p className="a-hint">Upload an MP4 (H.264) file for best results, or link a YouTube or Vimeo video.</p>
            </div>
            <div className="a-form">
              <div className="a-radios" role="radiogroup" aria-label="Video source">
                <label><input type="radio" name="vmode" checked={mode === "upload"} onChange={() => { setMode("upload"); setDirty(true); }} /> Upload a file</label>
                <label><input type="radio" name="vmode" checked={mode === "link"} onChange={() => { setMode("link"); setDirty(true); }} /> YouTube / Vimeo / video link</label>
                <label><input type="radio" name="vmode" checked={mode === "none"} onChange={() => { setMode("none"); setDirty(true); }} /> No video</label>
              </div>

              {mode === "upload" && (
                <div className="a-media-box">
                  {v.videoUrl && isOwnFile(v.videoUrl) ? (
                    <FramePicker
                      src={v.videoUrl}
                      poster={v.thumbnailUrl || undefined}
                      onCaptured={(url) => {
                        set("thumbnailUrl", url);
                        setMessage({ kind: "ok", text: "Frame saved as the thumbnail. Remember to save the project." });
                      }}
                    />
                  ) : (
                    <p className="a-hint">No video uploaded yet.</p>
                  )}
                  <div className="a-media-actions">
                    <UploadButton kind="video" label={v.videoUrl && isOwnFile(v.videoUrl) ? "Replace video" : "Upload video"} onUploaded={(url) => set("videoUrl", url)} />
                    <LibraryPicker kind="video" onPick={(url) => set("videoUrl", url)} />
                  </div>
                  <p className="a-hint">MP4 or WebM, up to the configured limit (500 MB by default). Compress long films before uploading for faster playback.</p>
                </div>
              )}
              {mode === "link" && (
                <div className="a-field">
                  <label htmlFor="videolink">Video link</label>
                  <input
                    id="videolink"
                    className="a-input"
                    placeholder="https://www.youtube.com/watch?v=… or https://vimeo.com/…"
                    value={linkDraft}
                    onChange={(e) => {
                      setLinkDraft(e.target.value);
                      setDirty(true);
                    }}
                    {...aria("videoUrl")}
                  />
                  <p className="a-hint">
                    {linkDraft && (parseVideoUrl(linkDraft) ? `Recognised: ${parseVideoUrl(linkDraft)!.source === "file" ? "direct video file" : parseVideoUrl(linkDraft)!.source}` : "This link is not recognised yet.")}
                  </p>
                </div>
              )}
              {err("videoUrl")}

              {mode !== "none" && (
                <div className="a-field">
                  <span className="a-label">Hover preview clip <span className="a-muted">(optional)</span></span>
                  <p className="a-hint">A short, silent 5–8 second MP4 that plays when visitors hover a project card. Without it, the main uploaded video is used.</p>
                  <div className="a-media-actions">
                    {v.previewUrl && <video src={v.previewUrl} muted loop autoPlay playsInline style={{ width: 160, borderRadius: 8 }} aria-label="Current preview clip" />}
                    <UploadButton kind="video" label={v.previewUrl ? "Replace clip" : "Upload clip"} onUploaded={(url) => set("previewUrl", url)} />
                    {v.previewUrl && <button type="button" className="a-btn a-btn--sm a-btn--danger" onClick={() => set("previewUrl", "")}>Remove</button>}
                  </div>
                  {err("previewUrl")}
                </div>
              )}
            </div>
          </section>

          {/* Thumbnail */}
          <section className="a-panel" aria-labelledby="sec-thumb">
            <div className="a-panel-head">
              <h2 id="sec-thumb">Thumbnail</h2>
              <p className="a-hint">Shown on project cards and as the video poster. Use a frame from the actual work. Required before publishing.</p>
            </div>
            <div className="a-media-box">
              {v.thumbnailUrl ? (
                <div className="a-media-preview">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={v.thumbnailUrl} alt="Current thumbnail" />
                </div>
              ) : (
                <p className="a-hint">No thumbnail yet.</p>
              )}
              <div className="a-media-actions">
                <UploadButton kind="image" label={v.thumbnailUrl ? "Replace image" : "Upload image"} onUploaded={(url) => set("thumbnailUrl", url)} />
                <LibraryPicker kind="image" onPick={(url) => set("thumbnailUrl", url)} />
                {mode === "upload" && v.videoUrl && <span className="a-hint">…or pause the video above and use “Use this frame”.</span>}
              </div>
              {err("thumbnailUrl")}
              <div className="a-field">
                <label htmlFor="thumbalt">Image description (alt text)</label>
                <input id="thumbalt" className="a-input" value={v.thumbnailAlt} onChange={(e) => set("thumbnailAlt", e.target.value)} maxLength={200} placeholder="e.g. Animated city skyline built from toy bricks" />
                <p className="a-hint">Describes the image for screen-reader users and search engines.</p>
              </div>
            </div>
          </section>

          {/* Case study */}
          <details className="a-details" open={Boolean(v.client || v.overview || v.role || v.deliverables.length || v.gallery.length)}>
            <summary>Case-study details (optional)</summary>
            <div>
              <p className="a-alert a-alert--warn" style={{ margin: 0 }}>
                Only add client names, results or responsibilities you have confirmed and have permission to share.
              </p>
              <div className="a-grid-2">
                <div className="a-field">
                  <label htmlFor="client">Client name</label>
                  <input id="client" className="a-input" value={v.client} onChange={(e) => set("client", e.target.value)} maxLength={120} />
                </div>
                <div className="a-field">
                  <label htmlFor="year">Year</label>
                  <input id="year" className="a-input" inputMode="numeric" value={v.year} onChange={(e) => set("year", e.target.value)} maxLength={4} {...aria("year")} />
                  {err("year")}
                </div>
              </div>
              <div className="a-field">
                <label htmlFor="role">Our role</label>
                <input id="role" className="a-input" value={v.role} onChange={(e) => set("role", e.target.value)} maxLength={200} placeholder="e.g. Concept, scripting, production and editing" />
              </div>
              <div className="a-field">
                <label htmlFor="overview">Project story</label>
                <textarea id="overview" className="a-input" rows={6} value={v.overview} onChange={(e) => set("overview", e.target.value)} maxLength={8000} />
                <p className="a-hint">Leave a blank line between paragraphs.</p>
              </div>
              <div className="a-field">
                <label htmlFor="deliv">Deliverables</label>
                <textarea
                  id="deliv"
                  className="a-input"
                  rows={3}
                  defaultValue={v.deliverables.join("\n")}
                  onChange={(e) => set("deliverables", e.target.value.split("\n").map((s) => s.trim()).filter(Boolean).slice(0, 20))}
                  placeholder={"One per line, e.g.\n30-second ad\n3 social cut-downs"}
                />
              </div>
              <div className="a-field">
                <span className="a-label">Gallery images</span>
                <p className="a-hint">Stills from the work, shown below the video.</p>
                {v.gallery.length > 0 && (
                  <div className="a-gallery">
                    {v.gallery.map((g, i) => (
                      <figure key={g.url + i}>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={g.url} alt={g.alt} />
                        <button type="button" className="a-btn a-btn--sm a-btn--danger" onClick={() => set("gallery", v.gallery.filter((_, j) => j !== i))} aria-label={`Remove gallery image ${i + 1}`}>✕</button>
                      </figure>
                    ))}
                  </div>
                )}
                <div className="a-media-actions">
                  <UploadButton kind="image" multiple label="Upload images" onUploaded={(url) => setV((s) => ({ ...s, gallery: [...s.gallery, { url, alt: `Frame from ${s.title}` }] }))} />
                  <LibraryPicker kind="image" label="Add from library" onPick={(url) => set("gallery", [...v.gallery, { url, alt: `Frame from ${v.title}` }])} />
                </div>
                {err("gallery")}
              </div>
            </div>
          </details>
        </div>

        {/* Sidebar */}
        <aside className="a-editor-side" aria-label="Publishing">
          <section className="a-panel">
            <h2>Status</h2>
            <p style={{ margin: "8px 0 12px" }}>
              <span className={`a-status a-status--${status}`}>{status === "published" ? "Published — live on the site" : "Draft — not visible on the site"}</span>
            </p>
            {project && (
              <p className="a-hint">
                <a href={`/preview/${project.id}`} target="_blank" rel="noopener noreferrer">Preview this project ↗</a>
                {dirty && " (shows the last saved version)"}
              </p>
            )}
          </section>
          <section className="a-panel a-form">
            <h2>Display</h2>
            <label className="a-check">
              <input type="checkbox" checked={v.featured} onChange={(e) => set("featured", e.target.checked)} />
              <span>
                Feature on the homepage
                <span className="a-hint" style={{ display: "block" }}>Up to four featured projects appear in “Featured Work”.</span>
              </span>
            </label>
            <div className="a-field">
              <label htmlFor="order">Display order</label>
              <input id="order" className="a-input" type="number" min={0} max={9999} value={v.sortOrder} onChange={(e) => set("sortOrder", Number(e.target.value))} {...aria("sortOrder")} />
              <p className="a-hint">Lower numbers appear first. You can also use the ↑ ↓ buttons on the Projects list.</p>
              {err("sortOrder")}
            </div>
          </section>
          {project && (
            <section className="a-panel">
              <h2>Archive</h2>
              <p className="a-hint" style={{ margin: "6px 0 12px" }}>Removes the project from the site. You can restore it from the Archive tab at any time.</p>
              <button
                type="button"
                className="a-btn a-btn--sm a-btn--danger"
                disabled={pending}
                onClick={() => {
                  if (confirm(`Archive “${project.title}”? It will be hidden from the website.`)) start(() => archiveProject(project.id));
                }}
              >
                Archive project
              </button>
            </section>
          )}
        </aside>
      </div>

      <div className="a-savebar">
        <span className="a-status-text">{pending ? "Saving…" : dirty ? "You have unsaved changes." : "All changes saved."}</span>
        {status === "published" ? (
          <>
            <button type="button" className="a-btn" disabled={pending} onClick={() => submit("unpublish")}>Unpublish</button>
            <button type="submit" className="a-btn a-btn--primary" disabled={pending}>Save changes</button>
          </>
        ) : (
          <>
            <button type="submit" className="a-btn" disabled={pending}>Save draft</button>
            <button type="button" className="a-btn a-btn--accent" disabled={pending} onClick={() => submit("publish")}>Publish</button>
          </>
        )}
      </div>
    </form>
  );
}

/** Plays the uploaded video and lets the owner save the current frame as the thumbnail. */
function FramePicker({ src, poster, onCaptured }: { src: string; poster?: string; onCaptured: (url: string) => void }) {
  const ref = useRef<HTMLVideoElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const capture = async () => {
    const video = ref.current;
    if (!video || !video.videoWidth) {
      setError("Play or scrub the video to the frame you want first.");
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const canvas = document.createElement("canvas");
      const scale = Math.min(1, 1600 / video.videoWidth);
      canvas.width = Math.round(video.videoWidth * scale);
      canvas.height = Math.round(video.videoHeight * scale);
      canvas.getContext("2d")!.drawImage(video, 0, 0, canvas.width, canvas.height);
      const blob = await new Promise<Blob | null>((r) => canvas.toBlob(r, "image/webp", 0.86));
      if (!blob) throw new Error("Could not capture this frame.");
      const url = await uploadFile(new File([blob], "frame.webp", { type: "image/webp" }), "image");
      onCaptured(url);
    } catch (e) {
      setError(
        e instanceof DOMException
          ? "The browser blocked reading this video. If it is stored in cloud storage, allow this site in the bucket's CORS settings (see README)."
          : e instanceof Error
            ? e.message
            : "Could not capture this frame.",
      );
    } finally {
      setBusy(false);
    }
  };

  return (
    <div style={{ display: "grid", gap: 8 }}>
      <div className="a-media-preview">
        <video ref={ref} src={src} poster={poster} controls preload="metadata" crossOrigin="anonymous" playsInline />
      </div>
      <div className="a-media-actions">
        <button type="button" className="a-btn a-btn--sm" onClick={capture} disabled={busy}>
          {busy ? "Saving frame…" : "Use this frame as the thumbnail"}
        </button>
      </div>
      {error && <p className="a-error" role="alert">{error}</p>}
    </div>
  );
}
