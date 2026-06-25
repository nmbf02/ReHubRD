import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { pgPool } from "@/lib/db";

type AuthedUser = { id: string; name: string; email: string };

/**
 * Credential validation.
 *
 * When a database is configured (DATABASE_URL set), users are looked up by
 * username OR email and the password is verified against a bcrypt hash.
 * When no database is configured, we fall back to the env-var demo account so
 * the app still runs locally/offline.
 *
 * `identifier` is the value typed in the login field — a username (e.g.
 * "nathaly") or an email.
 */
async function validateCredentials(
  identifier: string,
  password: string
): Promise<AuthedUser | null> {
  if (!pgPool) {
    // No DB configured — demo fallback (local/offline only).
    const demoEmail = process.env.AUTH_DEMO_EMAIL ?? "demo@rehub.do";
    const demoPassword = process.env.AUTH_DEMO_PASSWORD ?? "demo123";
    if (identifier === demoEmail && password === demoPassword) {
      return { id: "demo-user", name: "Demo User", email: demoEmail };
    }
    return null;
  }

  const id = identifier.trim().toLowerCase();
  const { rows } = await pgPool.query<{
    id: string;
    username: string;
    email: string;
    name: string | null;
    password: string;
  }>(
    `SELECT id, username, email, name, password
       FROM users
      WHERE lower(username) = $1 OR lower(email) = $1
      LIMIT 1`,
    [id]
  );

  const user = rows[0];
  if (!user) return null;

  const ok = await bcrypt.compare(password, user.password);
  if (!ok) return null;

  return {
    id: String(user.id),
    name: user.name ?? user.username,
    email: user.email,
  };
}

export const authOptions: NextAuthOptions = {
  debug: process.env.NODE_ENV !== "production",
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }
        return validateCredentials(credentials.email, credentials.password);
      },
    }),
  ],
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 días
  },
  pages: {
    signIn: "/login",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.email = user.email ?? undefined;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
      }
      return session;
    },
  },
};
