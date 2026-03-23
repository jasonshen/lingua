import { P } from "../styles/theme";

export function ProgressStep({ progress }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 24, minHeight: 300 }}>
      <div style={{
        width: 64, height: 64, border: `4px solid ${P.border}`, borderTopColor: P.accent,
        borderRadius: "50%", animation: "spin 1s linear infinite",
      }} />
      <div style={{ textAlign: "center" }}>
        <h3 style={{ margin: 0, fontSize: 20, color: P.text, fontFamily: "'Fraunces', serif" }}>Working...</h3>
        <p style={{ color: P.textMuted, fontSize: 14, marginTop: 8 }}>{progress}</p>
      </div>
    </div>
  );
}
