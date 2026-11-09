import "server-only";
import { drizzle, type NodePgDatabase } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "./schema";

type DB = NodePgDatabase<typeof schema>;

const globalForDb = globalThis as unknown as { __kyndeDb?: DB; __kyndePool?: Pool };

function create(): DB {
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error("DATABASE_URL is not set. See .env.example and README → Database.");
  }
  const pool = new Pool({
    connectionString: url,
    max: Number(process.env.DATABASE_POOL_MAX ?? 5),
  });
  globalForDb.__kyndePool = pool;
  return drizzle(pool, { schema });
}

/** Lazily created so builds without a database (e.g. static pages) still work. */
export function db(): DB {
  if (!globalForDb.__kyndeDb) globalForDb.__kyndeDb = create();
  return globalForDb.__kyndeDb;
}

export { schema };
