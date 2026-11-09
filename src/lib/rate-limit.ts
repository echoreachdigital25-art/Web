import "server-only";
import { createHmac } from "node:crypto";
import { and, count, eq, gte, lt } from "drizzle-orm";
import { db, schema } from "./db";
import { authSecret } from "./env";

/** Hash identifiers (e.g. IP addresses) so raw values are never stored. */
export function hashKey(value: string) {
  return createHmac("sha256", authSecret()).update(value).digest("hex").slice(0, 40);
}

/**
 * Records an event and returns whether the caller is still within the limit.
 * `limit` events are allowed per `windowMs`.
 */
export async function rateLimit(bucket: string, rawKey: string, limit: number, windowMs: number) {
  const key = hashKey(rawKey);
  const since = new Date(Date.now() - windowMs);
  const [{ value }] = await db()
    .select({ value: count() })
    .from(schema.rateLimitEvents)
    .where(and(eq(schema.rateLimitEvents.bucket, bucket), eq(schema.rateLimitEvents.key, key), gte(schema.rateLimitEvents.createdAt, since)));
  if (value >= limit) return { ok: false as const };
  await db().insert(schema.rateLimitEvents).values({ bucket, key });
  // Opportunistic cleanup of old rows (cheap; indexed).
  if (Math.random() < 0.05) {
    await db().delete(schema.rateLimitEvents).where(lt(schema.rateLimitEvents.createdAt, new Date(Date.now() - 7 * 864e5)));
  }
  return { ok: true as const };
}

export async function clearRateLimit(bucket: string, rawKey: string) {
  await db()
    .delete(schema.rateLimitEvents)
    .where(and(eq(schema.rateLimitEvents.bucket, bucket), eq(schema.rateLimitEvents.key, hashKey(rawKey))));
}
