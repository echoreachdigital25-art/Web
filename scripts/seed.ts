/**
 * Inserts the initial portfolio projects (skips any slug that already exists)
 * and registers their media in the dashboard media library.
 * Usage: npm run db:seed
 */
import "./_env";
import { scriptDb } from "./_db";
import { seed } from "./_seed-lib";

const { db, pool } = scriptDb();
await seed(db);
await pool.end();
