import { NextResponse } from "next/server";
import { z } from "zod";
import { guardAdminApi } from "@/lib/api-guard";
import { createUploadTarget, newKey, validateUpload } from "@/lib/storage";

const body = z.object({
  kind: z.enum(["image", "video"]),
  contentType: z.string().max(100),
  size: z.number().int().positive(),
  name: z.string().max(255).optional(),
});

/** Step 1: validate the file and return a short-lived upload target. */
export async function POST(req: Request) {
  const g = await guardAdminApi(req);
  if (g.error) return g.error;
  const parsed = body.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid upload request." }, { status: 400 });
  const { kind, contentType, size } = parsed.data;
  const check = validateUpload(kind, contentType, size);
  if (!check.ok) return NextResponse.json({ error: check.error }, { status: 400 });
  try {
    const key = newKey(check.ext);
    const target = await createUploadTarget(key, contentType, size);
    return NextResponse.json({ key, upload: target });
  } catch (err) {
    console.error("[upload] could not create target", err);
    return NextResponse.json({ error: err instanceof Error ? err.message : "Storage is not configured." }, { status: 500 });
  }
}
