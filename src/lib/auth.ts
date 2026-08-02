import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { pgPool } from "@/lib/db";

type AuthedUser = { id: string; name: string; email: string };

/** Demo account, used when there is no reachable database. */
function validateDemoCredentials(identifier: string, password: string): AuthedUser | null {
  const demoEmail = process.env.AUTH_DEMO_EMAIL ?? "demo@rehub.do";
  const demoPassword = process.env.AUTH_DEMO_PASSWORD ?? "demo123";
  if (identifier === demoEmail && password === demoPassword) {
    return { id: "demo-user", name: "Demo User", email: demoEmail };
  }
  return null;
}

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
 *
 * **Configurada-pero-caída no es lo mismo que no-configurada.** Si
 * `DATABASE_URL` apunta a un Postgres que no responde (un contenedor que se
 * apagó, un puerto que cambió), la consulta lanza y hasta ahora eso tumbaba el
 * login por completo: no había forma de entrar, ni siquiera con la cuenta de
 * demostración, porque el respaldo solo se activaba cuando NO había base.
 *
 * En desarrollo caemos al respaldo para que la app siga siendo usable sin
 * infraestructura (que es el modo en que se presenta este proyecto). En
 * producción NO: allí un fallo de base debe fallar cerrado, o bastaría con
 * tumbar la base para habilitar una credencial de demostración.
 */
async function validateCredentials(
  identifier: string,
  password: string
): Promise<AuthedUser | null> {
  if (!pgPool) {
    return validateDemoCredentials(identifier, password);
  }

  const id = identifier.trim().toLowerCase();

  let rows: Array<{
    id: string;
    username: string;
    email: string;
    name: string | null;
    password: string;
  }>;

  try {
    ({ rows } = await pgPool.query(
      `SELECT id, username, email, name, password
         FROM users
        WHERE lower(username) = $1 OR lower(email) = $1
        LIMIT 1`,
      [id]
    ));
  } catch (error) {
    if (process.env.NODE_ENV === "production") throw error;
    console.warn(
      "[auth] La base de datos no respondió; usando la cuenta de demostración.",
      error instanceof Error ? error.message : error
    );
    return validateDemoCredentials(identifier, password);
  }

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
