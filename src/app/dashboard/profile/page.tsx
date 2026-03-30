import { getServerSession } from "next-auth";
import { getTranslations } from "next-intl/server";
import { authOptions } from "@/lib/auth";
import { PerfilForm } from "@/components/dashboard/ProfileForm";

export default async function PerfilPage() {
  const session = await getServerSession(authOptions);
  const t = await getTranslations("dashboard.pages.profile");

  return (
    <div className="p-6 lg:p-8 pb-24 lg:pb-8">
      <h1 className="text-2xl font-bold text-rehub-dark mb-2">{t("title")}</h1>
      <p className="text-rehub-dark/70 mb-8">{t("description")}</p>
      <PerfilForm
        userId={session?.user?.id}
        userName={session?.user?.name ?? undefined}
        userEmail={session?.user?.email ?? undefined}
      />
    </div>
  );
}
