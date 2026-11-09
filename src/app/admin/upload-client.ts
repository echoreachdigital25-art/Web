"use client";

export type UploadKind = "image" | "video";

/**
 * Uploads a file in three steps: request a target from the server (which
 * validates type and size), PUT the file directly to storage with progress,
 * then ask the server to verify and record it. Returns the public URL.
 */
export async function uploadFile(file: File, kind: UploadKind, onProgress?: (pct: number) => void): Promise<string> {
  const res = await fetch("/api/admin/uploads", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ kind, contentType: file.type, size: file.size, name: file.name }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error ?? "Upload could not start.");

  await new Promise<void>((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open(data.upload.method, data.upload.url);
    for (const [k, v] of Object.entries<string>(data.upload.headers ?? {})) xhr.setRequestHeader(k, v);
    xhr.upload.onprogress = (e) => e.lengthComputable && onProgress?.(Math.round((e.loaded / e.total) * 100));
    xhr.onload = () => (xhr.status >= 200 && xhr.status < 300 ? resolve() : reject(new Error(parseErr(xhr.responseText) ?? `Upload failed (${xhr.status}).`)));
    xhr.onerror = () => reject(new Error("Network error while uploading. If you use cloud storage, check the bucket's CORS settings (see README)."));
    xhr.send(file);
  });

  const done = await fetch("/api/admin/uploads/complete", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ key: data.key, kind, contentType: file.type, name: file.name }),
  });
  const d2 = await done.json().catch(() => ({}));
  if (!done.ok) throw new Error(d2.error ?? "Upload could not be verified.");
  return d2.asset.url as string;
}

function parseErr(text: string): string | null {
  try {
    return JSON.parse(text).error ?? null;
  } catch {
    return null;
  }
}

export const ACCEPT = {
  image: "image/jpeg,image/png,image/webp,image/avif",
  video: "video/mp4,video/webm",
};
