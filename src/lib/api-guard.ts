import "server-only";
import { NextResponse } from "next/server";
import { getAdmin } from "./auth";

/** Validates session (database-backed) and same-origin for admin API routes. */
export async function guardAdminApi(req: Request) {
  const origin = req.headers.get("origin");
  const host = req.headers.get("x-forwarded-host") ?? req.headers.get("host");
  if (req.method !== "GET") {
    if (!origin || !host || new URL(origin).host !== host) {
      return { error: NextResponse.json({ error: "Cross-origin request rejected." }, { status: 403 }) };
    }
  }
  const admin = await getAdmin();
  if (!admin) return { error: NextResponse.json({ error: "Please sign in again." }, { status: 401 }) };
  return { admin };
}
