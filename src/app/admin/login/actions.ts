"use server";

import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { createSession } from "@/lib/auth";
import { db, schema } from "@/lib/db";
import { DUMMY_HASH, verifyPassword } from "@/lib/password";
import { clearRateLimit, rateLimit } from "@/lib/rate-limit";
import { clientIp } from "@/lib/request";

export type LoginState = { error?: string; email?: string };

export async function login(_prev: LoginState, formData: FormData): Promise<LoginState> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase().slice(0, 200);
  const password = String(formData.get("password") ?? "").slice(0, 500);
  if (!email || !password) return { error: "Enter your email and password.", email };

  const ip = await clientIp();
  // 5 attempts per 15 minutes per account, 20 per 15 minutes per IP.
  const byAccount = await rateLimit("login:account", email, 5, 15 * 60 * 1000);
  const byIp = await rateLimit("login:ip", ip, 20, 15 * 60 * 1000);
  if (!byAccount.ok || !byIp.ok) {
    return { error: "Too many sign-in attempts. Please wait 15 minutes and try again.", email };
  }

  const [user] = await db().select().from(schema.adminUsers).where(eq(schema.adminUsers.email, email)).limit(1);
  // Always run a hash comparison so response time does not reveal whether the email exists.
  const ok = await verifyPassword(password, user?.passwordHash ?? DUMMY_HASH);
  if (!user || !ok) return { error: "That email and password combination is incorrect.", email };

  await clearRateLimit("login:account", email);
  await db().update(schema.adminUsers).set({ lastLoginAt: new Date() }).where(eq(schema.adminUsers.id, user.id));
  await createSession(user.id);

  const next = String(formData.get("next") ?? "");
  redirect(next.startsWith("/admin") && !next.startsWith("//") ? next : "/admin");
}
