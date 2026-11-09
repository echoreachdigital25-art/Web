import { statSync } from "node:fs";
import path from "node:path";
import type { NodePgDatabase } from "drizzle-orm/node-postgres";
import * as schema from "../src/lib/db/schema";
import { seedProjects } from "../src/content/seed-projects";

/** Adds the initial projects (skipping existing slugs) and registers their media. Safe to re-run. */
export async function seed(db: NodePgDatabase<typeof schema>) {
  const inserted = await db
    .insert(schema.projects)
    .values(seedProjects)
    .onConflictDoNothing({ target: schema.projects.slug })
    .returning({ slug: schema.projects.slug });
  console.log(`✓ ${inserted.length} project(s) added${inserted.length ? ": " + inserted.map((r) => r.slug).join(", ") : " (all already existed)"}.`);

  const assets: (typeof schema.mediaAssets.$inferInsert)[] = [];
  for (const p of seedProjects) {
    for (const url of [p.thumbnailUrl!, ...(p.gallery ?? []).map((g) => g.url), p.videoUrl!, p.previewUrl!]) {
      let size = 0;
      try {
        size = statSync(path.join("public", url)).size;
      } catch {
        continue;
      }
      const isVideo = url.endsWith(".mp4");
      assets.push({ kind: isVideo ? "video" : "image", url, storageKey: `seed:${url}`, contentType: isVideo ? "video/mp4" : "image/webp", sizeBytes: size, originalName: `${p.title} — ${path.basename(url)}` });
    }
  }
  const media = await db.insert(schema.mediaAssets).values(assets).onConflictDoNothing().returning({ id: schema.mediaAssets.id });
  console.log(`✓ ${media.length} media file(s) registered in the library.`);
}
