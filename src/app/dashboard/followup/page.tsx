import { getServerSession } from "next-auth";
import { getTranslations } from "next-intl/server";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { RefreshCw } from "lucide-react";
import { SeguimientoView } from "@/components/dashboard/FollowupView";
import { DashboardPageHeader } from "@/components/dashboard/PageHeader";
import { ROUTES, hrefLoginCallback } from "@/lib/routes";

export default async function SeguimientoPage() {
  const session = await getServerSession(authOptions);
  const t = await getTranslations("dashboard.pages.followup");

  if (!session?.user) {
    redirect(hrefLoginCallback(ROUTES.followup));
  }

  return (
    <div className="mx-auto max-w-5xl p-4 pb-24 sm:p-6 lg:p-8 lg:pb-12">
      <DashboardPageHeader title={t("title")} description={t("description")} icon={RefreshCw} />
      <SeguimientoView userId={session.user.id ?? null} />
    </div>
  );
}
