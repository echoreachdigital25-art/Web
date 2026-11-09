// Loads .env.local then .env for CLI scripts (Next.js loads these itself at runtime).
import { existsSync } from "node:fs";
for (const file of [".env.local", ".env"]) {
  if (existsSync(file)) process.loadEnvFile(file);
}
