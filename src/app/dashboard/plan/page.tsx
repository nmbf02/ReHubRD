import { getServerSession } from "next-auth";
import { getTranslations } from "next-intl/server";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { ClipboardList } from "lucide-react";
import { PlanView } from "@/components/dashboard/PlanView";
import { DashboardPageHeader } from "@/components/dashboard/PageHeader";
import { ROUTES, hrefLoginCallback } from "@/lib/routes";

export default async function PlanPage() {
  const session = await getServerSession(authOptions);
  const t = await getTranslations("dashboard.pages.plan");

  if (!session?.user) {
    redirect(hrefLoginCallback(ROUTES.plan));
  }

  return (
    <div className="mx-auto max-w-5xl p-4 pb-24 sm:p-6 lg:p-8 lg:pb-12">
      <DashboardPageHeader title={t("title")} description={t("description")} icon={ClipboardList} />
      <PlanView userId={session.user.id ?? null} />
    </div>
  );
}
