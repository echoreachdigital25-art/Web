import "server-only";
import { createHmac, timingSafeEqual } from "node:crypto";
import { authSecret } from "./env";

/** Signed render timestamp: lets us reject instant (bot) submissions and stale forms. */
export function issueFormToken(now = Date.now()) {
  const sig = createHmac("sha256", authSecret()).update(`enquiry:${now}`).digest("base64url");
  return `${now}.${sig}`;
}

export function checkFormToken(token: string | null | undefined, minMs = 3000, maxMs = 1000 * 60 * 60 * 24) {
  if (!token) return "missing";
  const [ts, sig] = token.split(".");
  const n = Number(ts);
  if (!n || !sig) return "invalid";
  const expected = createHmac("sha256", authSecret()).update(`enquiry:${n}`).digest("base64url");
  const a = Buffer.from(sig);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return "invalid";
  const age = Date.now() - n;
  if (age < minMs) return "too_fast";
  if (age > maxMs) return "expired";
  return "ok";
}
