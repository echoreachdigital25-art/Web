/**
 * Runs automatically before every Vercel build (see "vercel-build" in package.json):
 *   1. applies database migrations
 *   2. adds the initial portfolio projects, only when the database has no projects at all
 *      (so projects you delete later are never re-added)
 *   3. creates the first administrator from ADMIN_BOOTSTRAP_EMAIL / ADMIN_BOOTSTRAP_PASSWORD,
 *      but only while no administrator exists yet (it never changes an existing account)
 */
import "./_env";
import { count } from "drizzle-orm";
import { drizzle } from "drizzle-orm/node-postgres";
import { migrate } from "drizzle-orm/node-postgres/migrator";
import { Pool } from "pg";
import * as schema from "../src/lib/db/schema";
import { hashPassword, PASSWORD_MIN_LENGTH } from "../src/lib/password";
import { seed } from "./_seed-lib";

const url = process.env.DATABASE_URL_UNPOOLED || process.env.DATABASE_URL;
if (!url) {
  console.error("\n✗ DATABASE_URL is not set. In Vercel: Storage → connect a Neon Postgres database to this project, then redeploy.\n");
  process.exit(1);
}
if (!process.env.AUTH_SECRET || process.env.AUTH_SECRET.length < 32) {
  console.error("\n✗ AUTH_SECRET is missing or shorter than 32 characters. Add it in Vercel → Settings → Environment Variables, then redeploy.\n");
  process.exit(1);
}

const pool = new Pool({ connectionString: url, max: 1 });
const db = drizzle(pool, { schema });

await migrate(db, { migrationsFolder: "./drizzle" });
console.log("✓ Database migrations applied.");
const [{ value: projectCount }] = await db.select({ value: count() }).from(schema.projects);
if (projectCount === 0) await seed(db);
else console.log(`✓ ${projectCount} project(s) already in the database — starter projects not re-added.`);

const [{ value: admins }] = await db.select({ value: count() }).from(schema.adminUsers);
const email = process.env.ADMIN_BOOTSTRAP_EMAIL?.trim().toLowerCase();
const password = process.env.ADMIN_BOOTSTRAP_PASSWORD;
if (admins > 0) {
  console.log("✓ Administrator account exists." + (password ? " You can now delete ADMIN_BOOTSTRAP_PASSWORD from Vercel." : ""));
} else if (email && password) {
  if (password.length < PASSWORD_MIN_LENGTH) {
    console.error(`✗ ADMIN_BOOTSTRAP_PASSWORD must be at least ${PASSWORD_MIN_LENGTH} characters.`);
    process.exit(1);
  }
  await db.insert(schema.adminUsers).values({ email, passwordHash: await hashPassword(password) });
  console.log(`✓ Administrator ${email} created. Delete ADMIN_BOOTSTRAP_PASSWORD from Vercel after your first sign-in.`);
} else {
  console.log("! No administrator yet. Set ADMIN_BOOTSTRAP_EMAIL and ADMIN_BOOTSTRAP_PASSWORD in Vercel and redeploy to create one.");
}
await pool.end();
