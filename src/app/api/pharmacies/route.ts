import { NextResponse } from "next/server";

/**
 * Nearby pharmacies from OpenStreetMap (free, no API key). Queried server-side
 * to avoid CORS and to fail over across several public Overpass mirrors — the
 * canonical endpoint is often rate-limited/504. Zero-cost. No live stock: OSM
 * gives real locations, not inventory (see README "modo real").
 */

export const dynamic = "force-dynamic";
export const maxDuration = 20;

// Working mirror first so we return fast and stay under the function timeout;
// the canonical endpoint (overpass-api.de) is often 504/slow, so it's last.
const MIRRORS = [
  "https://maps.mail.ru/osm/tools/overpass/api/interpreter",
  "https://overpass.kumi.systems/api/interpreter",
  "https://overpass-api.de/api/interpreter",
];

interface OverpassElement {
  type: string;
  id: number;
  lat?: number;
  lon?: number;
  center?: { lat: number; lon: number };
  tags?: Record<string, string>;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const lat = Number(searchParams.get("lat"));
  const lon = Number(searchParams.get("lon"));
  const radius = Math.min(Math.max(Number(searchParams.get("radius")) || 3000, 500), 8000);

  if (!Number.isFinite(lat) || !Number.isFinite(lon)) {
    return NextResponse.json({ error: "bad_coords" }, { status: 400 });
  }

  const query = `[out:json][timeout:20];(node["amenity"="pharmacy"](around:${radius},${lat},${lon});way["amenity"="pharmacy"](around:${radius},${lat},${lon}););out center 50;`;

  for (const mirror of MIRRORS) {
    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 5000);
      const res = await fetch(mirror, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          "User-Agent": "ReHubRD/1.0 (thesis pilot)",
        },
        body: `data=${encodeURIComponent(query)}`,
        signal: controller.signal,
        cache: "no-store",
      });
      clearTimeout(timer);
      if (!res.ok) continue;

      const data = (await res.json()) as { elements?: OverpassElement[] };
      const elements = Array.isArray(data.elements) ? data.elements : [];
      const pharmacies = elements
        .map((el) => {
          const pLat = el.lat ?? el.center?.lat;
          const pLon = el.lon ?? el.center?.lon;
          if (pLat == null || pLon == null) return null;
          const tags = el.tags ?? {};
          return {
            id: `${el.type}/${el.id}`,
            name: tags.name || tags["name:es"] || "Farmacia",
            lat: pLat,
            lon: pLon,
            hours: tags.opening_hours ?? null,
            phone: tags.phone ?? tags["contact:phone"] ?? null,
            street:
              [tags["addr:street"], tags["addr:housenumber"]].filter(Boolean).join(" ") || null,
          };
        })
        .filter((p): p is NonNullable<typeof p> => p !== null);

      return NextResponse.json(
        { pharmacies },
        { headers: { "Cache-Control": "public, s-maxage=600, stale-while-revalidate=3600" } }
      );
    } catch {
      // try the next mirror
    }
  }

  return NextResponse.json({ error: "upstream_unavailable" }, { status: 502 });
}
