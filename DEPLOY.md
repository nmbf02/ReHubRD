# Deploying ReHub (Vercel + Neon Postgres — free tier)

ReHub is a Next.js 14 app with database-backed login. Production runs on
**Vercel** (host) + **Neon** (serverless Postgres). Both have free tiers that
comfortably cover a school/pilot project.

## What you need
- A GitHub account with access to this repo (already pushed).
- A [Vercel](https://vercel.com) account (sign in with GitHub).
- A [Neon](https://neon.tech) account (free).

## 1 · Create the database (Neon)
1. Neon → **New Project** (region close to you, e.g. US East).
2. Open **Connection Details** and copy the **Pooled connection** string
   (it looks like `postgresql://user:pass@ep-xxx-pooler.us-east-2.aws.neon.tech/neondb?sslmode=require`).
   Use the *pooled* one — it's built for serverless.

## 2 · Import the project (Vercel)
1. Vercel → **Add New… → Project** → import `nmbf02/ReHubRD`.
2. Framework preset: **Next.js** (auto-detected). Leave build/output defaults.
3. Add **Environment Variables** (Production + Preview):

   | Name | Value |
   |------|-------|
   | `DATABASE_URL` | the Neon **pooled** string from step 1 |
   | `NEXTAUTH_SECRET` | a random 32+ char secret — `openssl rand -base64 32` |
   | `NEXTAUTH_URL` | your deployment URL, e.g. `https://rehub-rd.vercel.app` |

   > Tip: you can also add Neon straight from Vercel’s **Storage** tab
   > (Marketplace → Neon), which injects `DATABASE_URL` for you.

4. Click **Deploy**.

## 3 · Create the table + seed users (one time)
Run locally, pointed at the Neon database:

```bash
DATABASE_URL="postgresql://...your-neon-pooled-url..." npm run db:setup
```

This creates the `users` table and seeds the accounts. Idempotent — safe to re-run.

## 4 · Log in
Open your Vercel URL → **Iniciar sesión**:

- **Usuario:** `nathaly`  ·  **Contraseña:** `welcome`

(`demo` / `demo123` also works.)

---

### Notes
- **Auth** uses NextAuth credentials with JWT sessions and bcrypt-hashed
  passwords stored in Postgres. No password is ever stored in plain text.
- **Profile / follow-up data** is stored locally in the browser
  (`localStorage`), per the pilot’s privacy model — it does not require the
  database and is not shared across devices.
- If `DATABASE_URL` is **not** set, the app falls back to the demo credentials
  for offline/local use, so it never hard-fails.
- To add users: insert a row in `users` with a bcrypt hash, or add them to the
  `ACCOUNTS` list in `scripts/init-db.mjs` and re-run `npm run db:setup`.
