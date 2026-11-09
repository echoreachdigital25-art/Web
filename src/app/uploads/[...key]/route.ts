import { createReadStream } from "node:fs";
import { stat } from "node:fs/promises";
import path from "node:path";
import { Readable } from "node:stream";
import { isValidKey, LOCAL_ROOT, storageDriver } from "@/lib/storage";

export const runtime = "nodejs";

const TYPES: Record<string, string> = { jpg: "image/jpeg", png: "image/png", webp: "image/webp", avif: "image/avif", mp4: "video/mp4", webm: "video/webm" };

/** Serves locally stored uploads (with HTTP range support for video seeking). */
export async function GET(req: Request, ctx: { params: Promise<{ key: string[] }> }) {
  if (storageDriver() !== "local") return new Response("Not found", { status: 404 });
  const key = "uploads/" + (await ctx.params).key.join("/");
  if (!isValidKey(key)) return new Response("Not found", { status: 404 });
  const file = path.join(LOCAL_ROOT, key);
  const info = await stat(file).catch(() => null);
  if (!info?.isFile()) return new Response("Not found", { status: 404 });
  const type = TYPES[key.split(".").pop()!] ?? "application/octet-stream";
  const headers: Record<string, string> = {
    "Content-Type": type,
    "Accept-Ranges": "bytes",
    "Cache-Control": "public, max-age=31536000, immutable",
    "X-Content-Type-Options": "nosniff",
  };
  const range = req.headers.get("range");
  if (range) {
    const m = range.match(/bytes=(\d*)-(\d*)/);
    let start = m?.[1] ? Number(m[1]) : 0;
    let end = m?.[2] ? Number(m[2]) : info.size - 1;
    if (!m?.[1] && m?.[2]) {
      start = Math.max(0, info.size - Number(m[2]));
      end = info.size - 1;
    }
    if (start >= info.size || end >= info.size || start > end) {
      return new Response(null, { status: 416, headers: { "Content-Range": `bytes */${info.size}` } });
    }
    const stream = Readable.toWeb(createReadStream(file, { start, end })) as ReadableStream;
    return new Response(stream, {
      status: 206,
      headers: { ...headers, "Content-Range": `bytes ${start}-${end}/${info.size}`, "Content-Length": String(end - start + 1) },
    });
  }
  const stream = Readable.toWeb(createReadStream(file)) as ReadableStream;
  return new Response(stream, { headers: { ...headers, "Content-Length": String(info.size) } });
}
