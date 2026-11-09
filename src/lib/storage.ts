import "server-only";
import { randomUUID } from "node:crypto";
import { mkdir, open, stat, unlink } from "node:fs/promises";
import path from "node:path";
import { AwsClient } from "aws4fetch";
import { isProd } from "./env";

/**
 * Media storage.
 *  - "s3":    any S3-compatible bucket (Cloudflare R2 recommended, AWS S3, etc.).
 *             Browsers upload directly with short-lived presigned URLs, so large
 *             videos never pass through serverless function size limits.
 *  - "local": files on this server's disk under .data/uploads. For local
 *             development, or a single always-on server with a persistent disk.
 *             Never use on Vercel/Cloudflare — their filesystems are not durable.
 */

export const UPLOAD_RULES = {
  image: {
    types: { "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp", "image/avif": "avif" } as Record<string, string>,
    maxBytes: Number(process.env.UPLOAD_MAX_IMAGE_MB ?? 10) * 1024 * 1024,
  },
  video: {
    types: { "video/mp4": "mp4", "video/webm": "webm" } as Record<string, string>,
    maxBytes: Number(process.env.UPLOAD_MAX_VIDEO_MB ?? 500) * 1024 * 1024,
  },
} as const;

export type UploadKind = keyof typeof UPLOAD_RULES;

export function storageDriver(): "s3" | "local" {
  const d = process.env.STORAGE_DRIVER ?? (process.env.S3_BUCKET ? "s3" : "local");
  if (d !== "s3" && d !== "local") throw new Error(`Unknown STORAGE_DRIVER "${d}"`);
  if (d === "local" && isProd && process.env.ALLOW_LOCAL_STORAGE_IN_PRODUCTION !== "true") {
    throw new Error(
      "Local media storage is disabled in production. Configure S3-compatible storage (see README → Media storage).",
    );
  }
  return d;
}

export const LOCAL_ROOT = path.join(process.cwd(), ".data", "uploads");

function s3() {
  const { S3_ENDPOINT, S3_ACCESS_KEY_ID, S3_SECRET_ACCESS_KEY, S3_BUCKET, S3_PUBLIC_BASE_URL } = process.env;
  if (!S3_ENDPOINT || !S3_ACCESS_KEY_ID || !S3_SECRET_ACCESS_KEY || !S3_BUCKET || !S3_PUBLIC_BASE_URL) {
    throw new Error("S3 storage is not fully configured (S3_ENDPOINT, S3_BUCKET, S3_ACCESS_KEY_ID, S3_SECRET_ACCESS_KEY, S3_PUBLIC_BASE_URL).");
  }
  const client = new AwsClient({
    accessKeyId: S3_ACCESS_KEY_ID,
    secretAccessKey: S3_SECRET_ACCESS_KEY,
    service: "s3",
    region: process.env.S3_REGION ?? "auto",
  });
  const objectUrl = (key: string) => `${S3_ENDPOINT.replace(/\/$/, "")}/${S3_BUCKET}/${key}`;
  return { client, objectUrl, publicBase: S3_PUBLIC_BASE_URL.replace(/\/$/, "") };
}

/** Public URL prefixes that count as "our" media (for validating saved URLs). */
export function ownMediaPrefixes(): string[] {
  const list = ["/media/", "/uploads/"];
  if (process.env.S3_PUBLIC_BASE_URL) list.push(process.env.S3_PUBLIC_BASE_URL.replace(/\/$/, "") + "/");
  return list;
}

export function validateUpload(kind: UploadKind, contentType: string, size: number) {
  const rule = UPLOAD_RULES[kind];
  const ext = rule.types[contentType];
  if (!ext) return { ok: false as const, error: `Unsupported file type. Allowed: ${Object.values(rule.types).join(", ").toUpperCase()}.` };
  if (!Number.isFinite(size) || size <= 0) return { ok: false as const, error: "The file appears to be empty." };
  if (size > rule.maxBytes) return { ok: false as const, error: `File is too large. Maximum is ${Math.round(rule.maxBytes / 1048576)} MB.` };
  return { ok: true as const, ext };
}

export function newKey(ext: string) {
  const d = new Date();
  return `uploads/${d.getUTCFullYear()}/${String(d.getUTCMonth() + 1).padStart(2, "0")}/${randomUUID()}.${ext}`;
}

export function isValidKey(key: string) {
  return /^uploads\/\d{4}\/\d{2}\/[0-9a-f-]{36}\.(jpg|png|webp|avif|mp4|webm)$/.test(key);
}

export function publicUrlFor(key: string) {
  return storageDriver() === "s3" ? `${s3().publicBase}/${key}` : `/${key}`;
}

/** Prepares a direct browser upload. */
export async function createUploadTarget(key: string, contentType: string, size: number) {
  if (storageDriver() === "local") {
    return {
      url: `/api/admin/uploads/local/${key}`,
      method: "PUT" as const,
      headers: { "Content-Type": contentType },
    };
  }
  const { client, objectUrl } = s3();
  const url = new URL(objectUrl(key));
  url.searchParams.set("X-Amz-Expires", "900");
  const signed = await client.sign(new Request(url, { method: "PUT", headers: { "Content-Type": contentType, "Content-Length": String(size) } }), {
    aws: { signQuery: true, allHeaders: true },
  });
  return { url: signed.url, method: "PUT" as const, headers: { "Content-Type": contentType } };
}

const SIGNATURES: Record<string, (b: Buffer) => boolean> = {
  "image/jpeg": (b) => b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff,
  "image/png": (b) => b.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])),
  "image/webp": (b) => b.subarray(0, 4).toString("latin1") === "RIFF" && b.subarray(8, 12).toString("latin1") === "WEBP",
  "image/avif": (b) => b.subarray(4, 8).toString("latin1") === "ftyp" && /avi[fs]/.test(b.subarray(8, 12).toString("latin1")),
  "video/mp4": (b) => b.subarray(4, 8).toString("latin1") === "ftyp",
  "video/webm": (b) => b.subarray(0, 4).equals(Buffer.from([0x1a, 0x45, 0xdf, 0xa3])),
};

export function matchesSignature(contentType: string, head: Buffer) {
  return SIGNATURES[contentType]?.(head) ?? false;
}

/** Confirms an uploaded object exists, has the declared size and real file signature. */
export async function verifyUploaded(key: string, contentType: string) {
  if (storageDriver() === "local") {
    const file = path.join(LOCAL_ROOT, key);
    const info = await stat(file).catch(() => null);
    if (!info) return { ok: false as const, error: "Upload not found." };
    const fh = await open(file, "r");
    const head = Buffer.alloc(16);
    await fh.read(head, 0, 16, 0);
    await fh.close();
    if (!matchesSignature(contentType, head)) {
      await unlink(file).catch(() => {});
      return { ok: false as const, error: "The file content does not match its type." };
    }
    return { ok: true as const, size: info.size };
  }
  const { client, objectUrl } = s3();
  const res = await client.fetch(objectUrl(key), { headers: { Range: "bytes=0-15" } });
  if (!res.ok) return { ok: false as const, error: "Upload not found in storage." };
  const head = Buffer.from(await res.arrayBuffer());
  const total = Number(res.headers.get("content-range")?.split("/")[1] ?? head.length);
  if (!matchesSignature(contentType, head)) {
    await client.fetch(objectUrl(key), { method: "DELETE" }).catch(() => {});
    return { ok: false as const, error: "The file content does not match its type." };
  }
  return { ok: true as const, size: total };
}

export async function deleteObject(key: string) {
  if (!isValidKey(key)) return;
  if (storageDriver() === "local") {
    await unlink(path.join(LOCAL_ROOT, key)).catch(() => {});
    return;
  }
  const { client, objectUrl } = s3();
  await client.fetch(objectUrl(key), { method: "DELETE" }).catch(() => {});
}

export async function ensureLocalDir(file: string) {
  await mkdir(path.dirname(file), { recursive: true });
}
