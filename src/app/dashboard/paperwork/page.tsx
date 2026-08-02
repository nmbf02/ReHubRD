import { getServerSession } from "next-auth";
import { getTranslations } from "next-intl/server";
import { redirect } from "next/navigation";
import { FileText } from "lucide-react";
import { authOptions } from "@/lib/auth";
import { PaperworkView } from "@/components/dashboard/PaperworkView";
import { DashboardPageHeader } from "@/components/dashboard/PageHeader";
import { ROUTES, hrefLoginCallback } from "@/lib/routes";

export default async function PaperworkPage() {
  const session = await getServerSession(authOptions);
  const t = await getTranslations("dashboard.pages.paperwork");

  if (!session?.user) {
    redirect(hrefLoginCallback(ROUTES.paperwork));
  }

  return (
    <div className="mx-auto max-w-5xl p-4 pb-24 sm:p-6 lg:p-8 lg:pb-12">
      <DashboardPageHeader title={t("title")} description={t("description")} icon={FileText} />
      <PaperworkView userId={session.user.id ?? null} />
    </div>
  );
}
