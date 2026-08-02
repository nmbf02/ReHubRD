import { getServerSession } from "next-auth";
import { getTranslations } from "next-intl/server";
import { redirect } from "next/navigation";
import { CalendarDays } from "lucide-react";
import { authOptions } from "@/lib/auth";
import { AppointmentsView } from "@/components/dashboard/AppointmentsView";
import { DashboardPageHeader } from "@/components/dashboard/PageHeader";
import { ROUTES, hrefLoginCallback } from "@/lib/routes";

export default async function AppointmentsPage() {
  const session = await getServerSession(authOptions);
  const t = await getTranslations("dashboard.pages.appointments");

  if (!session?.user) {
    redirect(hrefLoginCallback(ROUTES.appointments));
  }

  return (
    <div className="mx-auto max-w-5xl p-4 pb-24 sm:p-6 lg:p-8 lg:pb-12">
      <DashboardPageHeader title={t("title")} description={t("description")} icon={CalendarDays} />
      <AppointmentsView userId={session.user.id ?? null} />
    </div>
  );
}
