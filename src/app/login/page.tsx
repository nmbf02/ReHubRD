"use client";

import { useState, Suspense, useEffect } from "react";
import { signIn, useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { HeartPulse, User, Lock, ArrowRight, ShieldCheck, AlertCircle } from "lucide-react";
import { ROUTES } from "@/lib/routes";
import { RecoveryTree } from "@/components/effects/RecoveryTree";

const ease = [0.22, 1, 0.36, 1] as const;

function LoginForm() {
  const t = useTranslations("login");
  const tCommon = useTranslations("common");
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

  function translateAuthError(code: string): string {
    if (code === "CredentialsSignin") return t("errors.CredentialsSignin");
    if (code === "CallbackRouteError") return t("errors.CallbackRouteError");
    return t("errors.Default");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFormError("");

    if (!email.trim() || !password) {
      setFormError(t("validationRequired"));
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
        setFormError(t("errorNoResponse"));
        setIsLoading(false);
        return;
      }

      if (result.error) {
        setFormError(translateAuthError(result.error));
        setIsLoading(false);
        return;
      }

      if (result.ok) {
        router.replace(callbackUrl);
        router.refresh();
        return;
      }

      setFormError(t("errorUnexpected"));
      setIsLoading(false);
    } catch (err) {
      console.error("Login error:", err);
      setFormError(t("errorNetwork"));
      setIsLoading(false);
    }
  }

  if (status === "loading" || status === "authenticated") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white dark:bg-rehub-950">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-rehub-500 border-t-transparent" />
      </div>
    );
  }

  const inputClass =
    "w-full rounded-xl border border-rehub-200 bg-white py-2.5 pl-10 pr-4 text-rehub-950 outline-none transition-all placeholder:text-rehub-900/40 focus:border-rehub-500 focus:ring-4 focus:ring-rehub-500/15 disabled:opacity-60 dark:border-white/15 dark:bg-white/5 dark:text-white dark:placeholder:text-rehub-100/40";

  return (
    <div className="flex min-h-screen">
      {/* Brand panel with the generative recovery tree */}
      <div className="relative hidden flex-col justify-between overflow-hidden bg-ink-gradient p-12 lg:flex lg:w-1/2">
        <RecoveryTree className="pointer-events-none absolute inset-0" />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-gradient-to-t from-rehub-950/55 via-transparent to-rehub-950/35"
        />

        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease }}
          className="relative z-10"
        >
          <Link href={ROUTES.home} className="inline-flex items-center gap-2.5 text-2xl font-bold tracking-tight text-white">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 ring-1 ring-white/15 backdrop-blur">
              <HeartPulse className="h-5 w-5 text-rehub-300" />
            </span>
            {tCommon("brand")}
          </Link>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.12, ease }}
          className="relative z-10 max-w-md"
        >
          <h2 className="text-balance text-3xl font-bold leading-[1.15] tracking-tight text-white">
            {t("heroTitle")}
          </h2>
          <p className="mt-4 text-pretty text-lg leading-relaxed text-rehub-100/85">
            {t("heroSubtitle")}
          </p>
        </motion.div>

        <motion.p
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.24, ease }}
          className="relative z-10 inline-flex items-center gap-2 text-sm text-white/60"
        >
          <ShieldCheck className="h-4 w-4 text-rehub-300/80" />
          {t("heroFooter")}
        </motion.p>
      </div>

      {/* Form */}
      <div className="flex w-full items-center justify-center bg-white p-8 dark:bg-rehub-950 lg:w-1/2">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="w-full max-w-md"
        >
          <div className="mb-8 text-center lg:hidden">
            <Link href={ROUTES.home} className="inline-flex items-center gap-2 text-2xl font-bold tracking-tight text-rehub-700 dark:text-white">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-rehub-700 text-white">
                <HeartPulse className="h-5 w-5" />
              </span>
              {tCommon("brand")}
            </Link>
          </div>

          <h1 className="text-3xl font-bold tracking-tight text-rehub-950 dark:text-white">{t("title")}</h1>
          <p className="mt-2 text-pretty text-rehub-900/65 dark:text-rehub-100/65">{t("subtitle")}</p>

          <form onSubmit={handleSubmit} className="mt-8 space-y-6">
            {(formError || error) && (
              <div
                className="flex items-start gap-2.5 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-300"
                role="alert"
              >
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                <span>{formError || t("errorUrl")}</span>
              </div>
            )}

            <div>
              <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-rehub-900 dark:text-rehub-100">
                {t("emailLabel")}
              </label>
              <div className="relative">
                <User className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-rehub-900/40 dark:text-rehub-100/40" />
                <input
                  id="email"
                  type="text"
                  autoComplete="username"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={t("emailPlaceholder")}
                  className={inputClass}
                  disabled={isLoading}
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="mb-1.5 block text-sm font-medium text-rehub-900 dark:text-rehub-100">
                {t("passwordLabel")}
              </label>
              <div className="relative">
                <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-rehub-900/40 dark:text-rehub-100/40" />
                <input
                  id="password"
                  type="password"
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={t("passwordPlaceholder")}
                  className={inputClass}
                  disabled={isLoading}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="group inline-flex w-full items-center justify-center gap-2 rounded-xl bg-rehub-700 px-5 py-3 font-semibold text-white shadow-soft transition-colors hover:bg-rehub-800 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-rehub-500 dark:hover:bg-rehub-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rehub-600 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-rehub-950"
            >
              {isLoading ? (
                t("submitting")
              ) : (
                <>
                  {t("submit")}
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </>
              )}
            </button>
          </form>

          <p className="mt-8 text-center text-sm text-rehub-900/60 dark:text-rehub-100/60">
            {t("noAccount")}{" "}
            <Link href={ROUTES.register} className="font-semibold text-rehub-700 hover:underline dark:text-rehub-300">
              {t("registerLink")}
            </Link>
          </p>

          <p className="mt-6 text-center text-xs text-rehub-900/45 dark:text-rehub-100/45">{t("demoHint")}</p>
        </motion.div>
      </div>
    </div>
  );
}

function LoginFormFallback() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-white dark:bg-rehub-950">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-rehub-500 border-t-transparent" />
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
