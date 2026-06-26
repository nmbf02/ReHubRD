/**
 * One-time (idempotent) database setup for ReHub.
 * Creates the `users` table, evolves its columns, and seeds accounts +
 * the "Círculo de apoyo" community members. Safe to re-run — it upserts.
 *
 * Usage:
 *   DATABASE_URL=postgres://... node scripts/init-db.mjs
 *   # or: npm run db:setup   (reads DATABASE_URL from the environment / .env.local)
 */
import { Pool } from "pg";
import bcrypt from "bcryptjs";
import { readFileSync } from "node:fs";

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

// Real account (logs in) + community members that populate the support circle.
// `share` = opted in to appear in the Círculo de apoyo. `situation` = what
// they're going through, shown to peers.
const ACCOUNTS = [
  { username: "nathaly", email: "nathaly@rehub.do", name: "Nathaly", password: "welcome", situation: "Recuperándome de un accidente de tránsito", share: true },
  { username: "demo", email: "demo@rehub.do", name: "Demo", password: "demo123", situation: null, share: false },
  { username: "carla", email: "carla@rehub.do", name: "Carla", password: "rehub-pilot", situation: "Fractura de cadera, en fisioterapia", share: true },
  { username: "jose", email: "jose@rehub.do", name: "José", password: "rehub-pilot", situation: "Accidente laboral, volviendo al trabajo", share: true },
  { username: "maria", email: "maria@rehub.do", name: "María", password: "rehub-pilot", situation: "Lesión de rodilla, aprendiendo a caminar otra vez", share: true },
  { username: "luis", email: "luis@rehub.do", name: "Luis", password: "rehub-pilot", situation: "Buscando apoyo emocional tras el alta", share: true },
  { username: "rosa", email: "rosa@rehub.do", name: "Rosa", password: "rehub-pilot", situation: "Cuidadora de mi esposo en recuperación", share: true },
  { username: "pedro", email: "pedro@rehub.do", name: "Pedro", password: "rehub-pilot", situation: "Rehabilitación tras una cirugía", share: true },
  { username: "ana", email: "ana@rehub.do", name: "Ana", password: "rehub-pilot", situation: "Volviendo a conducir después del miedo", share: true },
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
  // Evolve the schema for the support-circle feature (idempotent).
  await pool.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS situation TEXT;`);
  await pool.query(
    `ALTER TABLE users ADD COLUMN IF NOT EXISTS share_in_community BOOLEAN NOT NULL DEFAULT false;`
  );
  console.log("✓ users table ready");

  for (const a of ACCOUNTS) {
    const hash = await bcrypt.hash(a.password, 10);
    await pool.query(
      `INSERT INTO users (username, email, name, password, situation, share_in_community)
       VALUES ($1, $2, $3, $4, $5, $6)
       ON CONFLICT (username)
       DO UPDATE SET email = EXCLUDED.email, name = EXCLUDED.name, password = EXCLUDED.password,
                     situation = EXCLUDED.situation, share_in_community = EXCLUDED.share_in_community`,
      [a.username, a.email, a.name, hash, a.situation, a.share]
    );
    console.log(`✓ seeded "${a.username}"${a.share ? " (en el círculo)" : ""}`);
  }

  await pool.end();
  console.log("\n✓ Database ready. Login with: nathaly / welcome");
}

main().catch((err) => {
  console.error("✗ DB setup failed:", err.message);
  process.exit(1);
});
