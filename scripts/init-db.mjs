/**
 * One-time (idempotent) database setup for ReHub.
 * Creates the `users` table and seeds the accounts. Safe to re-run — it upserts.
 *
 * Usage:
 *   DATABASE_URL=postgres://... node scripts/init-db.mjs
 *   # or: npm run db:setup   (reads DATABASE_URL from the environment / .env.local)
 */
import { Pool } from "pg";
import bcrypt from "bcryptjs";
import { readFileSync } from "node:fs";

// Load DATABASE_URL from .env.local if not already in the environment.
if (!process.env.DATABASE_URL) {
  try {
    const env = readFileSync(new URL("../.env.local", import.meta.url), "utf8");
    const match = env.match(/^DATABASE_URL=(.*)$/m);
    if (match) process.env.DATABASE_URL = match[1].trim().replace(/^["']|["']$/g, "");
  } catch {
    /* no .env.local — rely on the environment */
  }
}

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  console.error("✗ DATABASE_URL is not set. Pass it inline or add it to .env.local.");
  process.exit(1);
}

const ssl = /neon\.tech|sslmode=require/.test(connectionString)
  ? { rejectUnauthorized: false }
  : undefined;

const pool = new Pool({ connectionString, ssl });

// The seed accounts. `welcome` / `nathaly` is the headline demo account.
const ACCOUNTS = [
  { username: "nathaly", email: "nathaly@rehub.do", name: "Nathaly", password: "welcome" },
  { username: "demo", email: "demo@rehub.do", name: "Demo", password: "demo123" },
];

async function main() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id          BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
      username    TEXT UNIQUE NOT NULL,
      email       TEXT UNIQUE NOT NULL,
      name        TEXT,
      password    TEXT NOT NULL,
      created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
    );
  `);
  console.log("✓ users table ready");

  for (const account of ACCOUNTS) {
    const hash = await bcrypt.hash(account.password, 10);
    await pool.query(
      `INSERT INTO users (username, email, name, password)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (username)
       DO UPDATE SET email = EXCLUDED.email, name = EXCLUDED.name, password = EXCLUDED.password`,
      [account.username, account.email, account.name, hash]
    );
    console.log(`✓ seeded "${account.username}"`);
  }

  await pool.end();
  console.log("\n✓ Database ready. Login with: nathaly / welcome");
}

main().catch((err) => {
  console.error("✗ DB setup failed:", err.message);
  process.exit(1);
});
