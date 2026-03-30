import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { ROUTES } from "@/lib/routes";

export default async function RegisterPage() {
  const t = await getTranslations("register");

  return (
    <section>
      <div className="min-h-screen flex items-center justify-center p-8 bg-gradient-to-b from-rehub-light/30 to-white">
        <div className="max-w-md w-full text-center">
          <h1 className="text-2xl font-bold text-rehub-dark mb-4">{t("title")}</h1>
          <p className="text-rehub-dark/70 mb-8">{t("body")}</p>
          <Link
            href={ROUTES.login}
            className="inline-block px-8 py-3 bg-rehub-primary text-white rounded-xl font-semibold hover:bg-rehub-secondary transition-colors"
          >
            {t("goToLogin")}
          </Link>
        </div>
      </div>
    </section>
  );
}
