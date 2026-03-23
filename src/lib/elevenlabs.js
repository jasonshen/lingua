const XI_API_KEY = import.meta.env.VITE_ELEVENLABS_API_KEY;
const XI_MODEL = "eleven_multilingual_v2";

export async function generateSpeechBlob(text, voiceId) {
  const resp = await fetch(
    `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`,
    {
      method: "POST",
      headers: {
        "xi-api-key": XI_API_KEY,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        text,
        model_id: XI_MODEL,
        voice_settings: {
          stability: 0.6,
          similarity_boost: 0.75,
          style: 0.4,
          use_speaker_boost: true,
        },
      }),
    }
  );
  if (!resp.ok) {
    const err = await resp.text();
    throw new Error(`ElevenLabs ${resp.status}: ${err}`);
  }
  return await resp.blob();
}
