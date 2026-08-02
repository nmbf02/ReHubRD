import { pgPool } from "@/lib/db";

export interface CommunityMember {
  id: string;
  name: string;
  situation: string | null;
}

/**
 * El círculo de apoyo es una función acompañante, no crítica: si la base no
 * está, la app tiene que seguir en pie.
 *
 * Ojo a la distinción, que es la que faltaba: `!pgPool` cubre «no hay base
 * configurada», pero NO cubre «hay una configurada que no responde» — un
 * contenedor apagado, un puerto que cambió. En ese segundo caso la consulta
 * lanza y, al ocurrir dentro de un Server Component, se llevaba por delante el
 * dashboard entero con un error de render. Degradar es lo correcto aquí; el
 * único sitio donde un fallo de base debe propagarse es la autenticación.
 */
async function withDatabase<T>(fallback: T, run: () => Promise<T>): Promise<T> {
  if (!pgPool) return fallback;
  try {
    return await run();
  } catch (error) {
    console.warn(
      "[community] La base de datos no respondió; se continúa sin el círculo de apoyo.",
      error instanceof Error ? error.message : error
    );
    return fallback;
  }
}

/** People who opted in to the support circle (optionally excluding the viewer). */
export async function getCommunityMembers(excludeId?: string): Promise<CommunityMember[]> {
  return withDatabase<CommunityMember[]>([], async () => {
    const { rows } = await pgPool!.query<{
      id: string;
      name: string | null;
      situation: string | null;
    }>(
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
  });
}

export async function getUserVisibility(userId: string): Promise<boolean> {
  return withDatabase(false, async () => {
    const { rows } = await pgPool!.query<{ share_in_community: boolean }>(
      `SELECT share_in_community FROM users WHERE id = $1`,
      [userId]
    );
    return rows[0]?.share_in_community ?? false;
  });
}

export async function setCommunityVisibility(userId: string, visible: boolean): Promise<void> {
  await withDatabase(undefined, async () => {
    await pgPool!.query(`UPDATE users SET share_in_community = $2 WHERE id = $1`, [
      userId,
      visible,
    ]);
  });
}
