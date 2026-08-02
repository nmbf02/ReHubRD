import { getServerSession } from "next-auth";
import { getTranslations } from "next-intl/server";
import { redirect } from "next/navigation";
import { TrendingUp } from "lucide-react";
import { authOptions } from "@/lib/auth";
import { ProgressView } from "@/components/dashboard/ProgressView";
import { DashboardPageHeader } from "@/components/dashboard/PageHeader";
import { ROUTES, hrefLoginCallback } from "@/lib/routes";

export default async function ProgressPage() {
  const session = await getServerSession(authOptions);
  const t = await getTranslations("dashboard.pages.progress");

  if (!session?.user) {
    redirect(hrefLoginCallback(ROUTES.progress));
  }

  return (
    <div className="mx-auto max-w-5xl p-4 pb-24 sm:p-6 lg:p-8 lg:pb-12">
      <DashboardPageHeader title={t("title")} description={t("description")} icon={TrendingUp} />
      <ProgressView userId={session.user.id ?? null} />
    </div>
  );
}
