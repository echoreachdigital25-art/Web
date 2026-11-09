import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "../src/lib/db/schema";

export function scriptDb() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    console.error("DATABASE_URL is not set. Copy .env.example to .env.local and fill it in.");
    process.exit(1);
  }
  const pool = new Pool({ connectionString: url, max: 2 });
  return { db: drizzle(pool, { schema }), pool, schema };
}
