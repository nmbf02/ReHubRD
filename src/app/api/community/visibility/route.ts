import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getUserVisibility, setCommunityVisibility } from "@/lib/community";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ visible: false }, { status: 401 });
  }
  const visible = await getUserVisibility(session.user.id);
  return NextResponse.json({ visible });
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const body = (await req.json().catch(() => ({}))) as { visible?: unknown };
  const visible = Boolean(body?.visible);
  await setCommunityVisibility(session.user.id, visible);
  return NextResponse.json({ visible });
}
