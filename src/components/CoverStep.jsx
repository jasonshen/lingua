import { useRef } from "react";
import { P, primaryBtn, ghostBtn } from "../styles/theme";

export function CoverStep({ coverImage, setCoverImage, bookTitle, setBookTitle, onNext, onBack }) {
  const fileRef = useRef();

  const handleFile = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    const reader = new FileReader();
    reader.onload = (ev) => setCoverImage(ev.target.result);
    reader.readAsDataURL(f);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 32 }}>
      <button style={{ ...ghostBtn, alignSelf: "flex-start" }} onClick={onBack}>← Library</button>
      <div style={{ textAlign: "center" }}>
        <h2 style={{ margin: 0, fontSize: 28, color: P.text, fontFamily: "'Fraunces', serif" }}>Add Your Book</h2>
        <p style={{ color: P.textMuted, marginTop: 8, fontSize: 15 }}>Upload the cover and give it a title</p>
      </div>
      <div
        onClick={() => fileRef.current?.click()}
        style={{
          width: 220, height: 300, borderRadius: 16,
          border: coverImage ? "none" : `2px dashed ${P.border}`,
          background: coverImage ? "none" : P.accentLight,
          display: "flex", alignItems: "center", justifyContent: "center",
          cursor: "pointer", overflow: "hidden",
          boxShadow: coverImage ? P.shadowLg : "none",
        }}
      >
        {coverImage ? (
          <img src={coverImage} alt="Cover" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        ) : (
          <div style={{ textAlign: "center", color: P.textMuted, padding: 24 }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>📷</div>
            <div style={{ fontSize: 14, lineHeight: 1.5 }}>Tap to upload or take a photo of the book cover</div>
          </div>
        )}
      </div>
      <input ref={fileRef} type="file" accept="image/*" capture="environment" style={{ display: "none" }} onChange={handleFile} />
      <input
        type="text" placeholder="Book title..." value={bookTitle}
        onChange={(e) => setBookTitle(e.target.value)}
        style={{
          width: "100%", maxWidth: 380, padding: "14px 20px", borderRadius: 12,
          border: `2px solid ${P.border}`, fontSize: 17, fontFamily: "'DM Sans', sans-serif",
          color: P.text, background: P.card, outline: "none", textAlign: "center",
        }}
      />
      <button
        style={{ ...primaryBtn, opacity: bookTitle.trim() ? 1 : 0.4, pointerEvents: bookTitle.trim() ? "auto" : "none" }}
        onClick={onNext}
      >
        Start Adding Pages →
      </button>
    </div>
  );
}
