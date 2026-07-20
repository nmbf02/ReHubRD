/**
 * Generate the calming welcome clip with ElevenLabs, ONCE, and bundle it at
 * public/audio/welcome.mp3 (zero runtime cost — the app plays the bundled file).
 *
 * The API key is read from the environment; it is never stored in the repo.
 * Run it with YOUR key (keeps the key out of the codebase):
 *
 *   ELEVENLABS_API_KEY=your_key node scripts/generate-voice.mjs
 *
 * The script text is the single source of truth in
 * messages/es.json → dashboard.welcomeVoice.script
 */
import fs from "node:fs";

const KEY = process.env.ELEVENLABS_API_KEY;
if (!KEY) {
  console.error("Falta ELEVENLABS_API_KEY. Uso: ELEVENLABS_API_KEY=xxx node scripts/generate-voice.mjs");
  process.exit(1);
}

const messages = JSON.parse(fs.readFileSync("messages/es.json", "utf8"));
const text = messages?.dashboard?.welcomeVoice?.script;
if (!text) {
  console.error("No encontré dashboard.welcomeVoice.script en messages/es.json");
  process.exit(1);
}

const headers = { "xi-api-key": KEY };

// 1) pick a warm voice available in the account (prefer a soft female voice)
const voicesRes = await fetch("https://api.elevenlabs.io/v1/voices", { headers });
if (!voicesRes.ok) {
  console.error("Error listando voces:", voicesRes.status, await voicesRes.text());
  process.exit(1);
}
const voices = (await voicesRes.json()).voices ?? [];
const preferred = ["sarah", "alice", "lily", "matilda", "charlotte", "rachel"];
const pick =
  voices.find((v) => preferred.includes((v.name ?? "").toLowerCase())) ||
  voices.find((v) => (v.labels?.gender ?? "").toLowerCase() === "female") ||
  voices[0];
if (!pick) {
  console.error("No hay voces disponibles en la cuenta.");
  process.exit(1);
}
console.log("Voz elegida:", pick.name, `(${pick.voice_id})`);

// 2) synthesize (multilingual model → good Spanish)
const ttsRes = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${pick.voice_id}`, {
  method: "POST",
  headers: { ...headers, "Content-Type": "application/json", Accept: "audio/mpeg" },
  body: JSON.stringify({
    text,
    model_id: "eleven_multilingual_v2",
    voice_settings: { stability: 0.55, similarity_boost: 0.75, style: 0.15, use_speaker_boost: true },
  }),
});
if (!ttsRes.ok) {
  console.error("Error TTS:", ttsRes.status, await ttsRes.text());
  process.exit(1);
}

const buf = Buffer.from(await ttsRes.arrayBuffer());
fs.mkdirSync("public/audio", { recursive: true });
fs.writeFileSync("public/audio/welcome.mp3", buf);
console.log(`OK → public/audio/welcome.mp3 (${(buf.length / 1024).toFixed(0)} KB)`);
