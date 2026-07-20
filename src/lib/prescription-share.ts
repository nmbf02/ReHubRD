/**
 * Encode/decode a prescription into a compact, URL-safe token carried inside a
 * QR code. DEMO verification (zero-cost): the data travels inside the QR itself
 * and nothing is stored on a server — like showing a paper prescription. In
 * production this would be a short id pointing to a server-signed, revocable
 * record with minimal data (see README "modo real").
 */

export interface SharedMed {
  n: string; // name
  d?: string; // dose
  t: string[]; // times
}

export interface SharePayload {
  v: 1;
  meds: SharedMed[];
  doctor?: string;
  center?: string;
  date: string; // ISO
}

function toBase64Url(json: string): string {
  const bytes = new TextEncoder().encode(json);
  let binary = "";
  for (let i = 0; i < bytes.length; i += 1) binary += String.fromCharCode(bytes[i]);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function fromBase64Url(token: string): string {
  const base64 = token.replace(/-/g, "+").replace(/_/g, "/");
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) bytes[i] = binary.charCodeAt(i);
  return new TextDecoder().decode(bytes);
}

export function encodeShare(payload: SharePayload): string {
  return toBase64Url(JSON.stringify(payload));
}

export function decodeShare(token: string): SharePayload | null {
  try {
    const parsed = JSON.parse(fromBase64Url(token)) as SharePayload;
    if (parsed && parsed.v === 1 && Array.isArray(parsed.meds)) return parsed;
    return null;
  } catch {
    return null;
  }
}
