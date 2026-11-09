import { desc, eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { guardAdminApi } from "@/lib/api-guard";
import { db, schema } from "@/lib/db";

/** Media library listing for the dashboard picker. */
export async function GET(req: Request) {
  const g = await guardAdminApi(req);
  if (g.error) return g.error;
  const kind = new URL(req.url).searchParams.get("kind") === "video" ? "video" : "image";
  const rows = await db()
    .select({ id: schema.mediaAssets.id, url: schema.mediaAssets.url, name: schema.mediaAssets.originalName, createdAt: schema.mediaAssets.createdAt })
    .from(schema.mediaAssets)
    .where(eq(schema.mediaAssets.kind, kind))
    .orderBy(desc(schema.mediaAssets.createdAt))
    .limit(200);
  return NextResponse.json({ items: rows }, { headers: { "Cache-Control": "no-store" } });
}
