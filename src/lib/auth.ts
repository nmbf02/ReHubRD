import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

/**
 * Credential validation.
 * Production: connect to a database and verify passwords with bcrypt (or equivalent).
 */
async function validateCredentials(
  email: string,
  password: string
): Promise<{ id: string; name: string; email: string } | null> {
  // Demo: validar contra variables de entorno (solo desarrollo)
  const demoEmail = process.env.AUTH_DEMO_EMAIL ?? "demo@rehub.do";
  const demoPassword = process.env.AUTH_DEMO_PASSWORD ?? "demo123";

  if (email === demoEmail && password === demoPassword) {
    return {
      id: "demo-user",
      name: "Demo User",
      email: demoEmail,
    };
  }

  return null;
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
