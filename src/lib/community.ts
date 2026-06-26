import { pgPool } from "@/lib/db";

export interface CommunityMember {
  id: string;
  name: string;
  situation: string | null;
}

/** People who opted in to the support circle (optionally excluding the viewer). */
export async function getCommunityMembers(excludeId?: string): Promise<CommunityMember[]> {
  if (!pgPool) return [];
  const { rows } = await pgPool.query<{ id: string; name: string | null; situation: string | null }>(
    `SELECT id, name, situation
       FROM users
      WHERE share_in_community = true
        ${excludeId ? "AND id <> $1" : ""}
      ORDER BY created_at`,
    excludeId ? [excludeId] : []
  );
  return rows.map((r) => ({
    id: String(r.id),
    name: r.name ?? "Anónimo",
    situation: r.situation,
  }));
}

export async function getUserVisibility(userId: string): Promise<boolean> {
  if (!pgPool) return false;
  const { rows } = await pgPool.query<{ share_in_community: boolean }>(
    `SELECT share_in_community FROM users WHERE id = $1`,
    [userId]
  );
  return rows[0]?.share_in_community ?? false;
}

export async function setCommunityVisibility(userId: string, visible: boolean): Promise<void> {
  if (!pgPool) return;
  await pgPool.query(`UPDATE users SET share_in_community = $2 WHERE id = $1`, [userId, visible]);
}
