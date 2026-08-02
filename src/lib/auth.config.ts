/**
 * Extensión de tipos para NextAuth.
 *
 * `isDoctor` no es una preferencia de interfaz: es el permiso que decide si una
 * cuenta puede emitir recetas. Vive en la sesión —y por tanto en el servidor—
 * precisamente para que no lo pueda cambiar el navegador, a diferencia del
 * selector de rol, que sí es un artefacto de presentación guardado en disco.
 */
import "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      email?: string | null;
      name?: string | null;
      image?: string | null;
      /** La cuenta pertenece a un profesional de salud (ver `doctor-accounts`). */
      isDoctor: boolean;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    email?: string;
    isDoctor?: boolean;
  }
}
