import { getServerSession } from "next-auth";
import { getTranslations } from "next-intl/server";
import { redirect } from "next/navigation";
import { BellRing } from "lucide-react";
import { authOptions } from "@/lib/auth";
import { DoctorAlertsView } from "@/components/dashboard/DoctorAlertsView";
import { DashboardPageHeader } from "@/components/dashboard/PageHeader";
import { ROUTES, hrefLoginCallback } from "@/lib/routes";

export default async function AlertsPage() {
  const session = await getServerSession(authOptions);
  const t = await getTranslations("dashboard.pages.alerts");

  if (!session?.user) {
    redirect(hrefLoginCallback(ROUTES.alerts));
  }

  return (
    <div className="mx-auto max-w-6xl p-4 pb-24 sm:p-6 lg:p-8 lg:pb-12">
      <DashboardPageHeader title={t("title")} description={t("description")} icon={BellRing} />
      <DoctorAlertsView
        userId={session.user.id ?? null}
        userName={session.user.name ?? null}
      />
    </div>
  );
}
