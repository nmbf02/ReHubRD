import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { HeartPulse } from "lucide-react";
import { ROUTES } from "@/lib/routes";

export default async function RegisterPage() {
  const t = await getTranslations("register");

  return (
    <section className="relative min-h-screen flex items-center justify-center p-8 bg-ink-gradient grain overflow-hidden">
      {/* Soft ambient orb */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 flex items-center justify-center"
      >
        <div className="h-[480px] w-[480px] rounded-full bg-rehub-500/10 blur-3xl" />
      </div>

      <div className="relative z-10 max-w-md w-full text-center">
        {/* Icon chip */}
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-gradient text-white shadow-glow">
          <HeartPulse className="h-8 w-8" />
        </div>

        {/* Card */}
        <div className="rounded-3xl border border-white/10 bg-white/5 px-8 py-10 shadow-card backdrop-blur-md">
          <h1 className="text-balance text-3xl sm:text-4xl font-bold tracking-tight leading-tight text-white mb-4">
            {t("title")}
          </h1>
          <p className="text-pretty text-rehub-200/80 mb-8 text-base leading-relaxed">
            {t("body")}
          </p>
          <Link
            href={ROUTES.login}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-rehub-600 px-6 py-3 font-semibold text-white shadow-glow transition-all hover:bg-rehub-700 hover:shadow-glow-lg"
          >
            {t("goToLogin")}
          </Link>
        </div>
      </div>
    </section>
  );
}
