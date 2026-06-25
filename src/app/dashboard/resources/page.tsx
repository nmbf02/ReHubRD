import { Suspense } from "react";
import { getServerSession } from "next-auth";
import { getTranslations } from "next-intl/server";
import { BookOpen } from "lucide-react";
import { authOptions } from "@/lib/auth";
import { RecursosView } from "@/components/dashboard/ResourcesView";
import { DashboardPageHeader } from "@/components/dashboard/PageHeader";

export default async function RecursosPage() {
  const session = await getServerSession(authOptions);
  const t = await getTranslations("dashboard.pages.resources");

  return (
    <div className="mx-auto max-w-6xl p-4 pb-24 sm:p-6 lg:p-8 lg:pb-12">
      <DashboardPageHeader title={t("title")} description={t("description")} icon={BookOpen} />
      <Suspense fallback={<div className="h-64 animate-pulse rounded-2xl bg-rehub-100/50" />}>
        <RecursosView userId={session?.user?.id ?? null} />
      </Suspense>
    </div>
  );
}
