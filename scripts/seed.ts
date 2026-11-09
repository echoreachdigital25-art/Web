/**
 * Inserts the initial portfolio projects (skips any slug that already exists)
 * and registers their media in the dashboard media library.
 * Usage: npm run db:seed
 */
import "./_env";
import { statSync } from "node:fs";
import path from "node:path";
import { scriptDb } from "./_db";
import { seedProjects } from "../src/content/seed-projects";

const { db, pool, schema } = scriptDb();
const inserted = await db
  .insert(schema.projects)
  .values(seedProjects)
  .onConflictDoNothing({ target: schema.projects.slug })
  .returning({ slug: schema.projects.slug });
console.log(`✓ ${inserted.length} project(s) added${inserted.length ? ": " + inserted.map((r) => r.slug).join(", ") : " (all already existed)"}.`);

const assets: (typeof schema.mediaAssets.$inferInsert)[] = [];
for (const p of seedProjects) {
  const urls = [p.thumbnailUrl!, ...(p.gallery ?? []).map((g) => g.url), p.videoUrl!, p.previewUrl!];
  for (const url of urls) {
    const file = path.join("public", url);
    let size = 0;
    try {
      size = statSync(file).size;
    } catch {
      continue;
    }
    const isVideo = url.endsWith(".mp4");
    assets.push({
      kind: isVideo ? "video" : "image",
      url,
      storageKey: `seed:${url}`,
      contentType: isVideo ? "video/mp4" : "image/webp",
      sizeBytes: size,
      originalName: `${p.title} — ${path.basename(url)}`,
    });
  }
}
const media = await db.insert(schema.mediaAssets).values(assets).onConflictDoNothing().returning({ id: schema.mediaAssets.id });
console.log(`✓ ${media.length} media file(s) registered in the library.`);
await pool.end();
