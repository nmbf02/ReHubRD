import { Pool } from "pg";

/**
 * Shared Postgres pool. Created once and cached on globalThis so dev HMR and
 * serverless warm invocations reuse a single pool instead of exhausting
 * connections. Returns null when no DATABASE_URL is configured, which lets the
 * app fall back to the demo credential path for local/offline use.
 */

const connectionString = process.env.DATABASE_URL;

const needsSsl =
  !!connectionString &&
  (/neon\.tech/.test(connectionString) ||
    /sslmode=require/.test(connectionString) ||
    process.env.PGSSL === "true");

const globalForPg = globalThis as unknown as { __rehubPgPool?: Pool };

export const pgPool: Pool | null = connectionString
  ? (globalForPg.__rehubPgPool ??= new Pool({
      connectionString,
      ssl: needsSsl ? { rejectUnauthorized: false } : undefined,
      max: 3,
      idleTimeoutMillis: 10_000,
    }))
  : null;

export function isDbConfigured(): boolean {
  return pgPool !== null;
}
