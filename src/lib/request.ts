import "server-only";
import { headers } from "next/headers";

/**
 * Client IP used only for rate limiting (it is hashed before storage).
 * Read from a single header your host sets and clients cannot forge:
 *   Vercel → "x-forwarded-for" (default) · Cloudflare → "cf-connecting-ip"
 */
export async function clientIp(): Promise<string> {
  const h = await headers();
  const name = (process.env.CLIENT_IP_HEADER ?? "x-forwarded-for").toLowerCase();
  const raw = h.get(name);
  return raw?.split(",")[0]?.trim() || "unknown";
}
