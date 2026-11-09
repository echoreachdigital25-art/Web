"use client";

import { useRef, useState } from "react";
import { ACCEPT, uploadFile, type UploadKind } from "./upload-client";

type Item = { id: string; url: string; name: string | null };

/** Dialog listing previously uploaded media so it can be re-used. */
export function LibraryPicker({ kind, onPick, label = "Choose from library" }: { kind: UploadKind; onPick: (url: string) => void; label?: string }) {
  const ref = useRef<HTMLDialogElement>(null);
  const [items, setItems] = useState<Item[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const open = async () => {
    ref.current?.showModal();
    setError(null);
    try {
      const res = await fetch(`/api/admin/media?kind=${kind}`, { cache: "no-store" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Could not load the media library.");
      setItems(data.items);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not load the media library.");
    }
  };

  return (
    <>
      <button type="button" className="a-btn a-btn--sm" onClick={open}>
        {label}
      </button>
      <dialog ref={ref} className="a-dialog" aria-label={`Media library: ${kind}s`} onClick={(e) => e.target === ref.current && ref.current?.close()}>
        <div className="a-dialog-head">
          <h2>{kind === "image" ? "Image" : "Video"} library</h2>
          <button type="button" className="a-btn a-btn--sm" onClick={() => ref.current?.close()}>Close</button>
        </div>
        <div className="a-dialog-body">
          {error && <p className="a-alert a-alert--error">{error}</p>}
          {!items && !error && <p className="a-muted">Loading…</p>}
          {items?.length === 0 && <p className="a-muted">Nothing uploaded yet.</p>}
          <div className="a-pick-grid">
            {items?.map((it) => (
              <button
                key={it.id}
                type="button"
                onClick={() => {
                  onPick(it.url);
                  ref.current?.close();
                }}
                aria-label={`Use ${it.name ?? it.url}`}
                title={it.name ?? it.url}
              >
                {kind === "image" ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={it.url} alt="" loading="lazy" />
                ) : (
                  <video src={it.url} muted preload="metadata" />
                )}
              </button>
            ))}
          </div>
        </div>
      </dialog>
    </>
  );
}

/** Upload button with progress and error reporting. */
export function UploadButton({
  kind,
  onUploaded,
  label,
  multiple,
}: {
  kind: UploadKind;
  onUploaded: (url: string) => void;
  label: string;
  multiple?: boolean;
}) {
  const input = useRef<HTMLInputElement>(null);
  const [progress, setProgress] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handle = async (files: FileList | null) => {
    if (!files?.length) return;
    setError(null);
    for (const file of Array.from(files)) {
      setProgress(0);
      try {
        const url = await uploadFile(file, kind, setProgress);
        onUploaded(url);
      } catch (e) {
        setError(`${file.name}: ${e instanceof Error ? e.message : "Upload failed."}`);
        break;
      }
    }
    setProgress(null);
    if (input.current) input.current.value = "";
  };

  return (
    <span style={{ display: "inline-grid", gap: 6 }}>
      <button type="button" className="a-btn a-btn--sm" onClick={() => input.current?.click()} disabled={progress !== null}>
        {progress !== null ? `Uploading… ${progress}%` : label}
      </button>
      <input
        ref={input}
        type="file"
        accept={ACCEPT[kind]}
        multiple={multiple}
        hidden
        onChange={(e) => handle(e.target.files)}
        aria-label={label}
      />
      {progress !== null && (
        <span className="a-progress" role="progressbar" aria-valuenow={progress} aria-valuemin={0} aria-valuemax={100} aria-label="Upload progress">
          <span style={{ width: `${progress}%` }} />
        </span>
      )}
      {error && (
        <span className="a-error" role="alert">
          {error}
        </span>
      )}
    </span>
  );
}
