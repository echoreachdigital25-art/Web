/**
 * Applies SQL migrations from ./drizzle to DATABASE_URL.
 * Usage: npm run db:migrate
 */
import "./_env";
import { migrate } from "drizzle-orm/node-postgres/migrator";
import { scriptDb } from "./_db";

const { db, pool } = scriptDb();
await migrate(db, { migrationsFolder: "./drizzle" });
console.log("✓ Database migrations applied.");
await pool.end();
