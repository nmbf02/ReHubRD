import { getTranslations } from "next-intl/server";
import { HeartPulse, Phone } from "lucide-react";

export async function Footer() {
  const tNav = await getTranslations("landing.nav");
  const tFooter = await getTranslations("landing.footer");
  const common = await getTranslations("common");
  const currentYear = new Date().getFullYear();

  const navLinks = [
    { href: "#problema", label: tNav("problem") },
    { href: "#solucion", label: tNav("solution") },
    { href: "#funcionamiento", label: tNav("howItWorks") },
    { href: "#contacto", label: tNav("contact") },
  ];

  return (
    <footer className="grain relative overflow-hidden bg-ink-gradient text-white">
      {/* soft glow accents */}
      <div className="pointer-events-none absolute -left-24 top-0 h-72 w-72 rounded-full bg-rehub-500/20 blur-3xl" />
      <div className="pointer-events-none absolute -right-20 -bottom-16 h-72 w-72 rounded-full bg-rehub-400/10 blur-3xl" />

      <div className="relative mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
        <div className="grid gap-12 lg:grid-cols-[1.4fr_1fr_1fr]">
          {/* Brand block */}
          <div className="max-w-sm">
            <div className="flex items-center gap-2.5">
              <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-brand-gradient text-white shadow-glow">
                <HeartPulse className="h-6 w-6" />
              </span>
              <div className="leading-tight">
                <span className="block text-xl font-bold tracking-tight text-white">
                  {common("brand")}
                </span>
                <span className="block text-xs text-rehub-light/70">
                  {common("tagline")}
                </span>
              </div>
            </div>
            <p className="mt-6 text-pretty text-sm leading-relaxed text-rehub-light/70">
              {tFooter("description")}
            </p>
          </div>

          {/* Navigation column */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-widest text-rehub-light/50">
              {tFooter("navTitle")}
            </h3>
            <ul className="mt-5 space-y-3 text-sm">
              {navLinks.map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    className="group inline-flex items-center gap-2 text-rehub-light/75 transition-colors hover:text-white"
                  >
                    <span className="h-1 w-1 rounded-full bg-rehub-400/60 transition-all group-hover:w-3 group-hover:bg-rehub-300" />
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact column */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-widest text-rehub-light/50">
              {tFooter("contactTitle")}
            </h3>
            <ul className="mt-5 space-y-3">
              <li>
                <a
                  href="tel:911"
                  className="group flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 px-3.5 py-3 transition-all hover:border-white/20 hover:bg-white/10"
                >
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-rehub-500/20 text-rehub-200">
                    <Phone className="h-4 w-4" />
                  </span>
                  <span className="min-w-0">
                    <span className="block text-xs text-rehub-light/55">
                      {tFooter("emergencyLabel")}
                    </span>
                    <span className="block text-base font-bold tracking-tight text-white">
                      911
                    </span>
                  </span>
                </a>
              </li>
              <li>
                <a
                  href="tel:811"
                  className="group flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 px-3.5 py-3 transition-all hover:border-white/20 hover:bg-white/10"
                >
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-rehub-500/20 text-rehub-200">
                    <HeartPulse className="h-4 w-4" />
                  </span>
                  <span className="min-w-0">
                    <span className="block text-xs text-rehub-light/55">
                      {tFooter("mentalHealthLabel")}
                    </span>
                    <span className="block text-base font-bold tracking-tight text-white">
                      811
                    </span>
                  </span>
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-14 border-t border-white/10 pt-8">
          <p className="text-pretty text-xs leading-relaxed text-rehub-light/50">
            {tFooter("disclaimer")}
          </p>
          <div className="mt-5 flex flex-col gap-2 text-xs text-rehub-light/55 sm:flex-row sm:items-center sm:justify-between">
            <p>{tFooter("copyright", { year: currentYear })}</p>
            <p className="text-rehub-light/45">{tFooter("tagline")}</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
