import { NextResponse } from "next/server";
import { z } from "zod";
import { guardAdminApi } from "@/lib/api-guard";
import { db, schema } from "@/lib/db";
import { deleteObject, isValidKey, publicUrlFor, UPLOAD_RULES, verifyUploaded } from "@/lib/storage";

const body = z.object({
  key: z.string().max(200),
  kind: z.enum(["image", "video"]),
  contentType: z.string().max(100),
  name: z.string().max(255).optional(),
});

/** Step 2: confirm the object exists and is the declared type, then record it. */
export async function POST(req: Request) {
  const g = await guardAdminApi(req);
  if (g.error) return g.error;
  const parsed = body.safeParse(await req.json().catch(() => null));
  if (!parsed.success || !isValidKey(parsed.data.key)) return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  const { key, kind, contentType, name } = parsed.data;
  if (!UPLOAD_RULES[kind].types[contentType]) return NextResponse.json({ error: "Unsupported type." }, { status: 400 });

  const v = await verifyUploaded(key, contentType);
  if (!v.ok) return NextResponse.json({ error: v.error }, { status: 400 });
  if (v.size > UPLOAD_RULES[kind].maxBytes) {
    await deleteObject(key);
    return NextResponse.json({ error: "File is too large." }, { status: 400 });
  }

  const [asset] = await db()
    .insert(schema.mediaAssets)
    .values({ kind, url: publicUrlFor(key), storageKey: key, contentType, sizeBytes: v.size, originalName: name ?? null })
    .onConflictDoNothing()
    .returning();
  return NextResponse.json({ asset: asset ?? { url: publicUrlFor(key), kind } });
}
