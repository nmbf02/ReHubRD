import Link from "next/link";
import { getTranslations } from "next-intl/server";
import {
  Stethoscope,
  ClipboardList,
  RefreshCw,
  ArrowRight,
  Check,
} from "lucide-react";
import { ROUTES } from "@/lib/routes";
import { GridBackground } from "@/components/ui/backgrounds";
import { HeroMascot } from "@/components/effects/HeroMascot";

const PREVIEW_CARDS = [
  { key: "profile", Icon: Stethoscope, done: true },
  { key: "plan", Icon: ClipboardList, done: true },
  { key: "followup", Icon: RefreshCw, done: false },
] as const;

const STATS = [
  { value: "24", key: "statGuides" },
  { value: "35", key: "statCenters" },
  { value: "31", key: "statProvinces" },
] as const;

export async function Hero() {
  const t = await getTranslations("landing.hero");

  return (
    <section className="relative overflow-hidden border-b border-border bg-white pt-32 pb-16 dark:bg-rehub-950 lg:pt-40 lg:pb-24">
      <GridBackground className="-z-10 opacity-60" />

      <div className="relative mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="grid items-center gap-14 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16">
          {/* Copy — rendered instantly, no fade-in */}
          <div>
            <div className="flex items-center gap-2.5 text-xs font-semibold uppercase tracking-[0.16em] text-rehub-700 dark:text-rehub-300">
              <span className="h-1.5 w-1.5 rounded-full bg-rehub-600" />
              {t("badge")}
            </div>

            <h1 className="mt-5 text-balance text-4xl font-bold leading-[1.08] tracking-tight text-rehub-950 dark:text-white sm:text-5xl lg:text-[3.4rem]">
              {t("titlePrefix")}{" "}
              <span className="text-rehub-700 dark:text-rehub-300">{t("titleHighlight")}</span>{" "}
              {t("titleSuffix")}
            </h1>

            <p className="mt-6 max-w-xl text-pretty text-lg leading-relaxed text-rehub-900/70 dark:text-rehub-100/70">
              {t("subtitle")}
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
              <Link
                href={ROUTES.login}
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-rehub-700 px-6 py-3 font-semibold text-white shadow-soft transition-colors hover:bg-rehub-800 dark:bg-rehub-500 dark:hover:bg-rehub-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rehub-600 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-rehub-950"
              >
                {t("ctaPrimary")}
                <ArrowRight className="h-4 w-4" />
              </Link>
              <a
                href="#funcionamiento"
                className="inline-flex items-center justify-center rounded-lg border border-border bg-white px-6 py-3 font-semibold text-rehub-900 transition-colors hover:bg-rehub-50/70 dark:bg-white/5 dark:text-rehub-100 dark:hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rehub-600 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-rehub-950"
              >
                {t("ctaSecondary")}
              </a>
            </div>

            <div className="mt-12 border-t border-border pt-8">
              <p className="text-sm text-rehub-900/55 dark:text-rehub-100/55">{t("trustLabel")}</p>
              <dl className="mt-5 grid max-w-md grid-cols-3 gap-6">
                {STATS.map((s) => (
                  <div key={s.key}>
                    <dt className="text-3xl font-bold tracking-tight text-rehub-950 dark:text-white tabular-nums">
                      {s.value}
                    </dt>
                    <dd className="mt-1 text-xs leading-tight text-rehub-900/55 dark:text-rehub-100/55">
                      {t(s.key)}
                    </dd>
                  </div>
                ))}
              </dl>
            </div>
          </div>

          {/* Product preview — a faithful, calm mock of the real plan screen */}
          <div className="relative">
            <div className="overflow-hidden rounded-xl border border-border bg-white shadow-elevated">
              {/* window chrome */}
              <div className="flex items-center gap-1.5 border-b border-border bg-rehub-50/50 px-4 py-3">
                <span className="h-2.5 w-2.5 rounded-full bg-rehub-200" />
                <span className="h-2.5 w-2.5 rounded-full bg-rehub-200" />
                <span className="h-2.5 w-2.5 rounded-full bg-rehub-200" />
                <span className="ml-3 text-xs font-medium text-rehub-900/45">
                  rehub.do/dashboard
                </span>
              </div>

              <div className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-rehub-700 text-white">
                      <ClipboardList className="h-5 w-5" />
                    </span>
                    <div>
                      <p className="text-sm font-semibold text-rehub-950">
                        {t("previewTitle")}
                      </p>
                      <p className="text-xs text-rehub-900/50">{t("previewProgress")}</p>
                    </div>
                  </div>
                  <span className="rounded-md bg-rehub-50 px-2.5 py-1 text-xs font-medium text-rehub-700">
                    {t("previewBadge")}
                  </span>
                </div>

                <div className="mt-5 flex items-center gap-4 rounded-lg border border-border bg-white p-4">
                  <ProgressRing value={62} />
                  <div className="flex-1">
                    <div className="h-1.5 w-full overflow-hidden rounded-full bg-rehub-100">
                      <div className="h-full w-[62%] rounded-full bg-rehub-600" />
                    </div>
                    <div className="mt-2.5 flex gap-1.5">
                      {[0, 1, 2, 3].map((i) => (
                        <span
                          key={i}
                          className={
                            i < 2
                              ? "h-1 flex-1 rounded-full bg-rehub-500"
                              : "h-1 flex-1 rounded-full bg-rehub-100"
                          }
                        />
                      ))}
                    </div>
                  </div>
                </div>

                <div className="mt-4 space-y-2">
                  {PREVIEW_CARDS.map(({ key, Icon, done }, i) => (
                    <div
                      key={key}
                      className="flex items-center gap-3 rounded-lg border border-border bg-white p-3"
                    >
                      <span
                        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${
                          done ? "bg-rehub-100 text-rehub-700" : "bg-rehub-50 text-rehub-400"
                        }`}
                      >
                        <Icon className="h-5 w-5" />
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold text-rehub-950">
                          {t(`cards.${key}.title`)}
                        </p>
                        <p className="truncate text-xs text-rehub-900/55">
                          {t(`cards.${key}.desc`)}
                        </p>
                      </div>
                      <span
                        className={`flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold ${
                          done
                            ? "bg-rehub-600 text-white"
                            : "border border-border text-rehub-300"
                        }`}
                      >
                        {done ? <Check className="h-3 w-3" /> : i + 1}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        <HeroMascot className="absolute right-1 -bottom-3 z-20 hidden h-[80px] w-[66px] sm:block lg:right-4 lg:-bottom-5 lg:h-[94px] lg:w-[78px]" />
      </div>
    </section>
  );
}

function ProgressRing({ value }: { value: number }) {
  const r = 26;
  const c = 2 * Math.PI * r;
  return (
    <div className="relative h-16 w-16 shrink-0">
      <svg className="h-16 w-16 -rotate-90" viewBox="0 0 64 64">
        <circle cx="32" cy="32" r={r} fill="none" stroke="#CCFBF1" strokeWidth="5" />
        <circle
          cx="32"
          cy="32"
          r={r}
          fill="none"
          stroke="#0D9488"
          strokeWidth="5"
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={c - (value / 100) * c}
        />
      </svg>
      <span className="absolute inset-0 flex items-center justify-center text-sm font-bold text-rehub-800">
        {value}%
      </span>
    </div>
  );
}
