import { LANG_INSTRUCTIONS } from "./constants";

export async function translatePages(pages, languageCode) {
  const apiKey = import.meta.env.VITE_ANTHROPIC_API_KEY;

  const resp = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-dangerous-direct-browser-access": "true",
    },
    body: JSON.stringify({
      model: "claude-sonnet-4-20250514",
      max_tokens: 2000,
      messages: [
        {
          role: "user",
          content: `You are translating a children's picture book for young children (ages 1-5). ${LANG_INSTRUCTIONS[languageCode]}

Keep the language simple, warm, and natural. Preserve the rhythm and feeling of the original. This text will be read aloud by a text-to-speech system, so write exactly how it should be spoken.

Return ONLY a JSON array of strings, one per page. No other text, no markdown.

Pages:
${pages.map((p, i) => `[Page ${i + 1}]: ${p}`).join("\n")}`,
        },
      ],
    }),
  });

  const data = await resp.json();
  const text = data.content?.map((b) => b.text || "").join("") || "[]";
  const cleaned = text.replace(/```json|```/g, "").trim();
  return JSON.parse(cleaned);
}
