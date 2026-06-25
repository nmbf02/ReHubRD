import { getServerSession } from "next-auth";
import { getTranslations } from "next-intl/server";
import { User } from "lucide-react";
import { authOptions } from "@/lib/auth";
import { PerfilForm } from "@/components/dashboard/ProfileForm";
import { DashboardPageHeader } from "@/components/dashboard/PageHeader";

export default async function PerfilPage() {
  const session = await getServerSession(authOptions);
  const t = await getTranslations("dashboard.pages.profile");

  return (
    <div className="mx-auto max-w-5xl p-4 pb-24 sm:p-6 lg:p-8 lg:pb-12">
      <DashboardPageHeader title={t("title")} description={t("description")} icon={User} />
      <PerfilForm
        userId={session?.user?.id}
        userName={session?.user?.name ?? undefined}
        userEmail={session?.user?.email ?? undefined}
      />
    </div>
  );
}
