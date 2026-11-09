/**
 * Creates (or resets the password of) a dashboard administrator.
 *
 *   npm run admin:create -- --email you@example.com [--name "Your Name"]
 *
 * You will be prompted for a password (hidden input). For non-interactive
 * environments set ADMIN_PASSWORD for that single command only.
 * There is intentionally no public sign-up route.
 */
import "./_env";
import { eq } from "drizzle-orm";
import { createInterface } from "node:readline";
import { Writable } from "node:stream";
import { hashPassword, PASSWORD_MIN_LENGTH } from "../src/lib/password";
import { scriptDb } from "./_db";

function arg(name: string) {
  const i = process.argv.indexOf(`--${name}`);
  return i > -1 ? process.argv[i + 1] : undefined;
}

async function promptHidden(question: string): Promise<string> {
  let muted = false;
  const out = new Writable({
    write(chunk, _enc, cb) {
      if (!muted) process.stdout.write(chunk);
      cb();
    },
  });
  const rl = createInterface({ input: process.stdin, output: out, terminal: true });
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      rl.close();
      process.stdout.write("\n");
      resolve(answer);
    });
    muted = true;
  });
}

const email = arg("email")?.trim().toLowerCase();
const name = arg("name");
if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
  console.error('Usage: npm run admin:create -- --email you@example.com [--name "Name"]');
  process.exit(1);
}

let password = process.env.ADMIN_PASSWORD;
if (!password) {
  password = await promptHidden(`Password for ${email} (min ${PASSWORD_MIN_LENGTH} chars): `);
  const confirm = await promptHidden("Confirm password: ");
  if (password !== confirm) {
    console.error("Passwords do not match.");
    process.exit(1);
  }
}
if (password.length < PASSWORD_MIN_LENGTH) {
  console.error(`Password must be at least ${PASSWORD_MIN_LENGTH} characters.`);
  process.exit(1);
}

const { db, pool, schema } = scriptDb();
const passwordHash = await hashPassword(password);
const existing = await db.select().from(schema.adminUsers).where(eq(schema.adminUsers.email, email));
if (existing.length) {
  await db.update(schema.adminUsers).set({ passwordHash, name: name ?? existing[0].name }).where(eq(schema.adminUsers.email, email));
  // Sign out every existing session for this account after a password reset.
  await db.delete(schema.adminSessions).where(eq(schema.adminSessions.userId, existing[0].id));
  console.log(`✓ Password updated for ${email}. Existing sessions were signed out.`);
} else {
  await db.insert(schema.adminUsers).values({ email, name, passwordHash });
  console.log(`✓ Administrator ${email} created. Sign in at /admin/login.`);
}
await pool.end();
