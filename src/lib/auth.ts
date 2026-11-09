import "server-only";
import { createHash, randomBytes } from "node:crypto";
import { and, eq, gt, lt } from "drizzle-orm";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { cache } from "react";
import { db, schema } from "./db";
import { isProd } from "./env";

export const SESSION_COOKIE = isProd ? "__Host-kynde_admin" : "kynde_admin";
const SESSION_DAYS = 14;

const sha256 = (v: string) => createHash("sha256").update(v).digest("hex");

export async function createSession(userId: string) {
  const token = randomBytes(32).toString("base64url");
  const expiresAt = new Date(Date.now() + SESSION_DAYS * 864e5);
  await db().insert(schema.adminSessions).values({ id: sha256(token), userId, expiresAt });
  // Remove this user's expired sessions.
  await db().delete(schema.adminSessions).where(and(eq(schema.adminSessions.userId, userId), lt(schema.adminSessions.expiresAt, new Date())));
  const jar = await cookies();
  jar.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: isProd,
    sameSite: "lax",
    path: "/",
    expires: expiresAt,
  });
}

export async function destroySession() {
  const jar = await cookies();
  const token = jar.get(SESSION_COOKIE)?.value;
  if (token) await db().delete(schema.adminSessions).where(eq(schema.adminSessions.id, sha256(token)));
  jar.delete(SESSION_COOKIE);
}

/** Returns the signed-in administrator, validated against the database. */
export const getAdmin = cache(async () => {
  const jar = await cookies();
  const token = jar.get(SESSION_COOKIE)?.value;
  if (!token || token.length > 100) return null;
  const rows = await db()
    .select({ id: schema.adminUsers.id, email: schema.adminUsers.email, name: schema.adminUsers.name })
    .from(schema.adminSessions)
    .innerJoin(schema.adminUsers, eq(schema.adminUsers.id, schema.adminSessions.userId))
    .where(and(eq(schema.adminSessions.id, sha256(token)), gt(schema.adminSessions.expiresAt, new Date())))
    .limit(1);
  return rows[0] ?? null;
});

/** Use in every protected page, server action and route handler. */
export async function requireAdmin() {
  const admin = await getAdmin();
  if (!admin) redirect("/admin/login");
  return admin;
}
