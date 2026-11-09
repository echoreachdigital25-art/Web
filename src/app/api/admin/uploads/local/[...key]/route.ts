import { createWriteStream } from "node:fs";
import { rename, unlink } from "node:fs/promises";
import path from "node:path";
import { Readable } from "node:stream";
import { pipeline } from "node:stream/promises";
import { NextResponse } from "next/server";
import { guardAdminApi } from "@/lib/api-guard";
import { ensureLocalDir, isValidKey, LOCAL_ROOT, storageDriver, UPLOAD_RULES, validateUpload } from "@/lib/storage";

export const runtime = "nodejs";

/** Local-storage upload target (development / single-server hosting only). */
export async function PUT(req: Request, ctx: { params: Promise<{ key: string[] }> }) {
  const g = await guardAdminApi(req);
  if (g.error) return g.error;
  if (storageDriver() !== "local") return NextResponse.json({ error: "Local storage is disabled." }, { status: 404 });

  const key = (await ctx.params).key.join("/");
  if (!isValidKey(key)) return NextResponse.json({ error: "Invalid key." }, { status: 400 });
  const contentType = req.headers.get("content-type") ?? "";
  const kind = contentType.startsWith("video/") ? "video" : "image";
  const declared = Number(req.headers.get("content-length") ?? 0);
  const check = validateUpload(kind, contentType, declared || 1);
  if (!check.ok) return NextResponse.json({ error: check.error }, { status: 400 });
  if (!key.endsWith(`.${check.ext}`)) return NextResponse.json({ error: "File type does not match." }, { status: 400 });
  if (!req.body) return NextResponse.json({ error: "Empty upload." }, { status: 400 });

  const file = path.join(LOCAL_ROOT, key);
  const tmp = `${file}.part`;
  await ensureLocalDir(file);
  const max = UPLOAD_RULES[kind].maxBytes;
  let received = 0;
  const limiter = new TransformStream<Uint8Array, Uint8Array>({
    transform(chunk, controller) {
      received += chunk.byteLength;
      if (received > max) controller.error(new Error("too_large"));
      else controller.enqueue(chunk);
    },
  });
  try {
    await pipeline(Readable.fromWeb(req.body.pipeThrough(limiter) as never), createWriteStream(tmp, { flags: "wx" }));
    await rename(tmp, file);
  } catch (err) {
    await unlink(tmp).catch(() => {});
    const tooLarge = err instanceof Error && err.message === "too_large";
    return NextResponse.json({ error: tooLarge ? "File is too large." : "Upload failed." }, { status: tooLarge ? 413 : 500 });
  }
  return new NextResponse(null, { status: 200 });
}
