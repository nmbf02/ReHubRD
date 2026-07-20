import { getServerSession } from "next-auth";
import { getTranslations } from "next-intl/server";
import { redirect } from "next/navigation";
import { Pill } from "lucide-react";
import { authOptions } from "@/lib/auth";
import { MedicationsView } from "@/components/dashboard/MedicationsView";
import { NearbyPharmacies } from "@/components/dashboard/NearbyPharmacies";
import { DashboardPageHeader } from "@/components/dashboard/PageHeader";
import { ROUTES, hrefLoginCallback } from "@/lib/routes";

export default async function MedicationsPage() {
  const session = await getServerSession(authOptions);
  const t = await getTranslations("dashboard.medications");

  if (!session?.user) {
    redirect(hrefLoginCallback(ROUTES.medications));
  }

  return (
    <div className="mx-auto max-w-5xl p-4 pb-24 sm:p-6 lg:p-8 lg:pb-12">
      <DashboardPageHeader title={t("title")} description={t("description")} icon={Pill} />
      <MedicationsView userId={session.user.id ?? null} />
      <NearbyPharmacies />
    </div>
  );
}
