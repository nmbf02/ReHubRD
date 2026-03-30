import { Suspense } from "react";
import { getServerSession } from "next-auth";
import { getTranslations } from "next-intl/server";
import { authOptions } from "@/lib/auth";
import { RecursosView } from "@/components/dashboard/ResourcesView";

export default async function RecursosPage() {
  const session = await getServerSession(authOptions);
  const t = await getTranslations("dashboard.pages.resources");

  return (
    <div className="p-6 lg:p-8 pb-24 lg:pb-8">
      <h1 className="text-2xl font-bold text-rehub-dark mb-2">{t("title")}</h1>
      <p className="text-rehub-dark/70 mb-8">{t("description")}</p>
      <Suspense fallback={<div className="animate-pulse h-64 bg-slate-100 rounded-2xl" />}>
        <RecursosView userId={session?.user?.id ?? null} />
      </Suspense>
    </div>
  );
}
