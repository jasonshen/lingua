import { VOICES, LANGUAGES } from "../lib/constants";
import { P, baseBtn, primaryBtn, ghostBtn } from "../styles/theme";

export function ReviewStep({ bookTitle, coverImage, pages, onBack, onTranslate, selectedLangs, setSelectedLangs, voiceId, setVoiceId }) {
  const toggleLang = (code) =>
    setSelectedLangs((p) => (p.includes(code) ? p.filter((c) => c !== code) : [...p, code]));

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <button style={ghostBtn} onClick={onBack}>← Back</button>
        <h2 style={{ margin: 0, fontSize: 22, fontFamily: "'Fraunces', serif", color: P.text }}>Review</h2>
        <div style={{ width: 80 }} />
      </div>
      <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
        {coverImage && <img src={coverImage} alt="" style={{ width: 60, height: 80, objectFit: "cover", borderRadius: 8, boxShadow: P.shadow }} />}
        <div>
          <h3 style={{ margin: 0, fontSize: 18, color: P.text }}>{bookTitle}</h3>
          <p style={{ margin: "4px 0 0", color: P.textMuted, fontSize: 14 }}>{pages.length} pages</p>
        </div>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {pages.map((p, i) => (
          <div key={i} style={{ background: P.card, borderRadius: 10, padding: "12px 16px", fontSize: 14, color: P.text, lineHeight: 1.5, boxShadow: P.shadow }}>
            <span style={{ fontWeight: 700, color: P.accent, marginRight: 8 }}>{i + 1}.</span>
            {p.length > 120 ? p.slice(0, 120) + "..." : p}
          </div>
        ))}
      </div>
      <div>
        <p style={{ fontSize: 14, fontWeight: 600, color: P.textMuted, marginBottom: 10 }}>Choose a reading voice:</p>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {VOICES.map((v) => {
            const active = voiceId === v.id;
            return (
              <button key={v.id} onClick={() => setVoiceId(v.id)} style={{
                ...baseBtn, padding: "12px 18px", borderRadius: 12, background: active ? P.accent : P.card,
                color: active ? "#fff" : P.text, border: `2px solid ${active ? P.accent : P.border}`,
                justifyContent: "flex-start", width: "100%", boxShadow: active ? P.shadow : "none",
              }}>
                <span style={{ fontWeight: 700 }}>{v.name}</span>
                <span style={{ fontWeight: 400, opacity: 0.7, fontSize: 13 }}>{v.desc}</span>
              </button>
            );
          })}
        </div>
      </div>
      <div>
        <p style={{ fontSize: 14, fontWeight: 600, color: P.textMuted, marginBottom: 10 }}>Translate into:</p>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
          {LANGUAGES.map((lang) => {
            const active = selectedLangs.includes(lang.code);
            return (
              <button key={lang.code} onClick={() => toggleLang(lang.code)} style={{
                ...baseBtn, padding: "10px 18px", borderRadius: 12, background: active ? P.accent : P.card,
                color: active ? "#fff" : P.text, border: `2px solid ${active ? P.accent : P.border}`, fontSize: 14,
              }}>
                {lang.flag} {lang.label}
              </button>
            );
          })}
        </div>
      </div>
      <button style={{ ...primaryBtn, width: "100%", opacity: selectedLangs.length ? 1 : 0.4 }} onClick={onTranslate} disabled={!selectedLangs.length}>
        Generate Translations
      </button>
    </div>
  );
}
