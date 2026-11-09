import "server-only";

export function authSecret(): string {
  const s = process.env.AUTH_SECRET;
  if (!s || s.length < 32) {
    throw new Error("AUTH_SECRET must be set to a random string of at least 32 characters (see .env.example).");
  }
  return s;
}

export const isProd = process.env.NODE_ENV === "production";
