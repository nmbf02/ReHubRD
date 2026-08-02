import { getServerSession } from "next-auth";
import { getTranslations } from "next-intl/server";
import { redirect } from "next/navigation";
import { Building2 } from "lucide-react";
import { authOptions } from "@/lib/auth";
import { InstitutionView } from "@/components/dashboard/InstitutionView";
import { DashboardPageHeader } from "@/components/dashboard/PageHeader";
import { ROUTES, hrefLoginCallback } from "@/lib/routes";

export default async function InstitutionPage() {
  const session = await getServerSession(authOptions);
  const t = await getTranslations("dashboard.pages.institution");

  if (!session?.user) {
    redirect(hrefLoginCallback(ROUTES.institution));
  }

  return (
    <div className="mx-auto max-w-6xl p-4 pb-24 sm:p-6 lg:p-8 lg:pb-12">
      <DashboardPageHeader title={t("title")} description={t("description")} icon={Building2} />
      <InstitutionView userId={session.user.id ?? null} userName={session.user.name ?? null} />
    </div>
  );
}
