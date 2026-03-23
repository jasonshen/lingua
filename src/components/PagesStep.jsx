import { useState, useRef } from "react";
import { useSpeechRecognition } from "../hooks/useSpeechRecognition";
import { P, baseBtn, primaryBtn, secondaryBtn, ghostBtn } from "../styles/theme";

export function PagesStep({ pages, setPages, onFinish, onBack, title, startPageNumber = 1, finishLabel }) {
  const [currentText, setCurrentText] = useState("");
  const { listening, transcribing, start, stop } = useSpeechRecognition();
  const textareaRef = useRef();

  const addPage = () => {
    if (!currentText.trim()) return;
    setPages((p) => [...p, currentText.trim()]);
    setCurrentText("");
    textareaRef.current?.focus();
  };

  const removePage = (idx) => setPages((p) => p.filter((_, i) => i !== idx));

  const handleMic = () => {
    if (listening) {
      stop();
      return;
    }
    start((t) => setCurrentText((p) => (p ? p + " " + t : t)));
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <button style={ghostBtn} onClick={onBack}>← Back</button>
        <h2 style={{ margin: 0, fontSize: 22, fontFamily: "'Fraunces', serif", color: P.text }}>{title || "Add Pages"}</h2>
        <div style={{ width: 80 }} />
      </div>
      {pages.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {pages.map((p, i) => (
            <div key={i} style={{ background: P.card, borderRadius: 12, padding: "14px 18px", boxShadow: P.shadow, display: "flex", alignItems: "flex-start", gap: 12 }}>
              <span style={{ background: P.accentLight, color: P.accent, borderRadius: 8, padding: "4px 10px", fontSize: 13, fontWeight: 700, flexShrink: 0, marginTop: 2 }}>{startPageNumber + i}</span>
              <p style={{ margin: 0, fontSize: 15, lineHeight: 1.6, color: P.text, flex: 1 }}>{p}</p>
              <button onClick={() => removePage(i)} style={{ ...ghostBtn, padding: 4, fontSize: 18, color: "#ccc", flexShrink: 0 }}>×</button>
            </div>
          ))}
        </div>
      )}
      <div style={{ background: P.card, borderRadius: 16, padding: 20, boxShadow: P.shadow }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
          <span style={{ fontSize: 14, color: P.textMuted, fontWeight: 600 }}>Page {startPageNumber + pages.length}</span>
          <button onClick={handleMic} disabled={transcribing} style={{ ...baseBtn, background: listening ? "#FF4444" : transcribing ? P.textMuted : P.accentLight, color: listening || transcribing ? "#fff" : P.accent, padding: "8px 16px", fontSize: 14, borderRadius: 20, opacity: transcribing ? 0.7 : 1 }}>
            {transcribing ? "⏳ Transcribing..." : listening ? "⏹ Stop" : "🎤 Dictate"}
          </button>
        </div>
        <textarea
          ref={textareaRef}
          value={currentText}
          onChange={(e) => setCurrentText(e.target.value)}
          placeholder="Type or dictate the text for this page..."
          rows={4}
          style={{
            width: "100%", border: `2px solid ${P.border}`, borderRadius: 10, padding: 14,
            fontSize: 16, fontFamily: "'DM Sans', sans-serif", color: P.text, resize: "vertical",
            outline: "none", boxSizing: "border-box", lineHeight: 1.6,
          }}
        />
        <button style={{ ...primaryBtn, marginTop: 12, width: "100%", opacity: currentText.trim() ? 1 : 0.4 }} onClick={addPage} disabled={!currentText.trim()}>
          Add Page
        </button>
      </div>
      {pages.length > 0 && (
        <button style={{ ...secondaryBtn, width: "100%", background: P.successLight, color: P.success, borderColor: P.success }} onClick={onFinish}>
          {finishLabel || `Finish Book (${pages.length} page${pages.length !== 1 ? "s" : ""}) →`}
        </button>
      )}
    </div>
  );
}
