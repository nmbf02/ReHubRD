import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { InicioDashboard } from "@/components/dashboard/Dashboard";
import { FlujoPersonalizadoView } from "@/components/dashboard/CustomFlowView";
import { CommunityCircle } from "@/components/dashboard/CommunityCircle";
import { getCommunityMembers, getUserVisibility } from "@/lib/community";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id ?? null;

  const [members, visible] = await Promise.all([
    getCommunityMembers(userId ?? undefined),
    userId ? getUserVisibility(userId) : Promise.resolve(false),
  ]);

  return (
    <div className="mx-auto max-w-6xl space-y-8 p-4 pb-24 sm:p-6 lg:p-8 lg:pb-12">
      <InicioDashboard userName={session?.user?.name ?? null} userId={userId} />
      <CommunityCircle members={members} initialVisible={visible} />
      <FlujoPersonalizadoView userId={userId} />
    </div>
  );
}
