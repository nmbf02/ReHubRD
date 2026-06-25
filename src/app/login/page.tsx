"use client";

import { useState, Suspense, useEffect } from "react";
import { signIn, useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { HeartPulse, User, Lock, ArrowRight, ShieldCheck, AlertCircle } from "lucide-react";
import { ROUTES } from "@/lib/routes";
import { AuroraBackground } from "@/components/ui/backgrounds";

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
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="w-8 h-8 border-2 border-rehub-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex">
      {/* Brand panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-ink-gradient grain relative overflow-hidden p-12 flex-col justify-between">
        <AuroraBackground variant="ink" className="opacity-80" />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-grid bg-grid-light [mask-image:radial-gradient(ellipse_70%_60%_at_50%_40%,black,transparent)]"
        />

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease }}
          className="relative"
        >
          <Link
            href={ROUTES.home}
            className="inline-flex items-center gap-2.5 text-2xl font-bold tracking-tightest text-white"
          >
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 ring-1 ring-white/15 backdrop-blur">
              <HeartPulse className="h-5 w-5 text-rehub-300" />
            </span>
            {tCommon("brand")}
          </Link>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.12, ease }}
          className="relative max-w-md"
        >
          <h2 className="text-balance text-3xl font-bold leading-[1.15] tracking-tightest text-white">
            {t("heroTitle")}
          </h2>
          <p className="mt-4 text-pretty text-lg leading-relaxed text-rehub-100/80">
            {t("heroSubtitle")}
          </p>

          <ul className="mt-8 space-y-3">
            <li className="flex items-center gap-3 text-sm font-medium text-rehub-100/90">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white/10 ring-1 ring-white/15">
                <ShieldCheck className="h-3.5 w-3.5 text-rehub-300" />
              </span>
              {t("heroFooter")}
            </li>
          </ul>
        </motion.div>

        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.24, ease }}
          className="relative inline-flex items-center gap-2 text-sm text-white/55"
        >
          <ShieldCheck className="h-4 w-4 text-rehub-300/80" />
          {t("heroFooter")}
        </motion.p>
      </div>

      {/* Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-white">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="w-full max-w-md"
        >
          <div className="lg:hidden text-center mb-8">
            <Link
              href={ROUTES.home}
              className="inline-flex items-center gap-2 text-2xl font-bold tracking-tightest text-rehub-700"
            >
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-gradient text-white shadow-glow">
                <HeartPulse className="h-5 w-5" />
              </span>
              {tCommon("brand")}
            </Link>
          </div>

          <h1 className="text-3xl font-bold tracking-tightest text-rehub-950">{t("title")}</h1>
          <p className="mt-2 text-pretty text-rehub-900/65">{t("subtitle")}</p>

          <form onSubmit={handleSubmit} className="mt-8 space-y-6">
            {(formError || error) && (
              <div
                className="flex items-start gap-2.5 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm"
                role="alert"
              >
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                <span>{formError || t("errorUrl")}</span>
              </div>
            )}

            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-rehub-900 mb-1.5"
              >
                {t("emailLabel")}
              </label>
              <div className="relative">
                <User className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-rehub-900/40" />
                <input
                  id="email"
                  type="text"
                  autoComplete="username"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={t("emailPlaceholder")}
                  className="w-full rounded-xl border border-rehub-200 bg-white pl-10 pr-4 py-2.5 text-rehub-950 outline-none transition-all placeholder:text-rehub-900/40 focus:border-rehub-500 focus:ring-4 focus:ring-rehub-500/15 disabled:opacity-60"
                  disabled={isLoading}
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-rehub-900 mb-1.5"
              >
                {t("passwordLabel")}
              </label>
              <div className="relative">
                <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-rehub-900/40" />
                <input
                  id="password"
                  type="password"
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={t("passwordPlaceholder")}
                  className="w-full rounded-xl border border-rehub-200 bg-white pl-10 pr-4 py-2.5 text-rehub-950 outline-none transition-all placeholder:text-rehub-900/40 focus:border-rehub-500 focus:ring-4 focus:ring-rehub-500/15 disabled:opacity-60"
                  disabled={isLoading}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="group inline-flex w-full items-center justify-center gap-2 rounded-xl bg-brand-gradient px-5 py-3 font-semibold text-white shadow-glow transition-all hover:shadow-glow-lg disabled:opacity-60 disabled:cursor-not-allowed"
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

          <p className="mt-8 text-center text-sm text-rehub-900/60">
            {t("noAccount")}{" "}
            <Link
              href={ROUTES.register}
              className="font-semibold text-rehub-700 hover:text-rehub-800 hover:underline"
            >
              {t("registerLink")}
            </Link>
          </p>

          <p className="mt-6 text-center text-xs text-rehub-900/45">{t("demoHint")}</p>
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
