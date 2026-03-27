"use client";

import { useState, Suspense, useEffect } from "react";
import { signIn, useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { ROUTES } from "@/lib/routes";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session, status } = useSession();
  const callbackUrl = searchParams.get("callbackUrl") ?? ROUTES.dashboard;
  const error = searchParams.get("error");

  useEffect(() => {
    if (status === "authenticated") {
      router.replace(ROUTES.dashboard);
    }
  }, [status, router]);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [formError, setFormError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFormError("");

    if (!email.trim() || !password) {
      setFormError("Ingresa tu correo y contraseña.");
      return;
    }

    setIsLoading(true);

    try {
      const result = await signIn("credentials", {
        email: email.trim(),
        password,
        redirect: false,
        callbackUrl,
      });

      if (!result) {
        setFormError("No se recibió respuesta. Intenta de nuevo.");
        setIsLoading(false);
        return;
      }

      if (result.error) {
        const errorMessages: Record<string, string> = {
          CredentialsSignin: "Correo o contraseña incorrectos.",
          CallbackRouteError: "Error de configuración. Verifica NEXTAUTH_URL y NEXTAUTH_SECRET.",
          Default: "Error al iniciar sesión. Intenta de nuevo.",
        };
        setFormError(
          errorMessages[result.error] ?? errorMessages.Default
        );
        setIsLoading(false);
        return;
      }

      if (result.ok) {
        router.replace(callbackUrl);
        router.refresh();
        return;
      }

      setFormError("Error inesperado. Intenta de nuevo.");
      setIsLoading(false);
    } catch (err) {
      console.error("Login error:", err);
      setFormError("Ocurrió un error. Intenta de nuevo.");
      setIsLoading(false);
    }
  }

  if (status === "loading" || status === "authenticated") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="w-8 h-8 border-2 border-rehub-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex">
      {/* Panel izquierdo - branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-rehub-dark to-rehub-secondary p-12 flex-col justify-between">
        <Link href="/" className="text-2xl font-bold text-white">
          ReHub
        </Link>
        <div>
          <h2 className="text-2xl font-semibold text-white mb-4">
            Tu centro de recuperación post-accidente
          </h2>
          <p className="text-rehub-light/80 max-w-sm">
            Accede a tu plan personalizado, seguimiento adaptativo y recursos de
            acompañamiento.
          </p>
        </div>
        <p className="text-sm text-white/60">
          Re · Recovery · Hub · Centro
        </p>
      </div>

      {/* Panel derecho - formulario */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-white">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="w-full max-w-md"
        >
          <div className="lg:hidden text-center mb-8">
            <Link href="/" className="text-2xl font-bold text-rehub-primary">
              ReHub
            </Link>
          </div>

          <h1 className="text-2xl font-bold text-rehub-dark mb-2">
            Iniciar sesión
          </h1>
          <p className="text-rehub-dark/70 mb-8">
            Ingresa tus credenciales para acceder a tu cuenta.
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">
            {(formError || error) && (
              <div
                className="p-4 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm"
                role="alert"
              >
                {formError || "Error al iniciar sesión. Verifica tus credenciales."}
              </div>
            )}

            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-rehub-dark mb-2"
              >
                Correo electrónico
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="tu@correo.com"
                className="w-full px-4 py-3 rounded-xl border border-rehub-dark/20 focus:border-rehub-primary focus:ring-2 focus:ring-rehub-primary/20 outline-none transition-all"
                disabled={isLoading}
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-rehub-dark mb-2"
              >
                Contraseña
              </label>
              <input
                id="password"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-3 rounded-xl border border-rehub-dark/20 focus:border-rehub-primary focus:ring-2 focus:ring-rehub-primary/20 outline-none transition-all"
                disabled={isLoading}
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-4 bg-rehub-primary text-white rounded-xl font-semibold hover:bg-rehub-secondary transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isLoading ? "Ingresando..." : "Entrar"}
            </button>
          </form>

          <p className="mt-8 text-center text-sm text-rehub-dark/60">
            ¿No tienes cuenta?{" "}
            <Link
              href="/registro"
              className="text-rehub-primary font-medium hover:underline"
            >
              Regístrate
            </Link>
          </p>

          <p className="mt-6 text-center text-xs text-rehub-dark/50">
            Demo: demo@rehub.do / demo123
          </p>
        </motion.div>
      </div>
    </div>
  );
}

function LoginFormFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="w-8 h-8 border-2 border-rehub-primary border-t-transparent rounded-full animate-spin" />
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<LoginFormFallback />}>
      <LoginForm />
    </Suspense>
  );
}
