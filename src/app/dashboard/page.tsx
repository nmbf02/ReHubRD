import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { InicioDashboard } from "@/components/dashboard/Dashboard";
import { FlujoPersonalizadoView } from "@/components/dashboard/CustomFlowView";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  return (
    <div className="mx-auto max-w-6xl space-y-8 p-4 pb-24 sm:p-6 lg:p-8 lg:pb-12">
      <InicioDashboard
        userName={session?.user?.name ?? null}
        userId={session?.user?.id ?? null}
      />
      <FlujoPersonalizadoView userId={session?.user?.id ?? null} />
    </div>
  );
}
