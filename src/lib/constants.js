export const VOICES = [
  { id: "21m00Tcm4TlvDq8ikWAM", name: "Rachel", desc: "Warm, calm female" },
  { id: "EXAVITQu4vr4xnSDxMaL", name: "Sarah", desc: "Soft, gentle female" },
  { id: "pNInz6obpgDQGcFmaJgB", name: "Adam", desc: "Clear, warm male" },
  { id: "ErXwobaYiN019PkySvjV", name: "Antoni", desc: "Friendly, expressive male" },
  { id: "ThT5KcBeYPX3keUQqHPh", name: "Dorothy", desc: "Bright, youthful female" },
];

export const LANGUAGES = [
  { code: "es", label: "Spanish", flag: "\u{1F1EA}\u{1F1F8}" },
  { code: "zh-CN", label: "Mandarin", flag: "\u{1F1E8}\u{1F1F3}" },
  { code: "zh-HK", label: "Cantonese", flag: "\u{1F1ED}\u{1F1F0}" },
  { code: "th", label: "Thai", flag: "\u{1F1F9}\u{1F1ED}" },
  { code: "id", label: "Indonesian", flag: "\u{1F1EE}\u{1F1E9}" },
];

export const LANG_INSTRUCTIONS = {
  es: "Translate into natural Latin American Spanish.",
  "zh-CN":
    "Translate into simplified Mandarin Chinese (\u666E\u901A\u8BDD). Use characters only, no pinyin.",
  "zh-HK":
    "Translate into spoken Cantonese Chinese (\u5EE3\u6771\u8A71). Use traditional characters appropriate for Cantonese, not standard written Chinese. Write the way a Cantonese-speaking parent would naturally say these words aloud to a child.",
  th: "Translate into Thai (\u0E20\u0E32\u0E29\u0E32\u0E44\u0E17\u0E22). Use Thai script.",
  id: "Translate into Bahasa Indonesia.",
};
