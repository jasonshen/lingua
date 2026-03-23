export const P = {
  bg: "#FFF8F0",
  card: "#FFFFFF",
  accent: "#E8734A",
  accentHover: "#D4622F",
  accentLight: "#FFF0EB",
  text: "#2D2A26",
  textMuted: "#8A8580",
  border: "#EDE8E3",
  success: "#4A9E6F",
  successLight: "#EDFAF2",
  shadow: "0 2px 12px rgba(45,42,38,0.08)",
  shadowLg: "0 8px 32px rgba(45,42,38,0.12)",
};

export const baseBtn = {
  border: "none",
  borderRadius: 10,
  cursor: "pointer",
  fontFamily: "'DM Sans', sans-serif",
  fontWeight: 600,
  fontSize: 15,
  transition: "all 0.2s ease",
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  gap: 8,
};

export const primaryBtn = {
  ...baseBtn,
  background: P.accent,
  color: "#fff",
  padding: "12px 28px",
};

export const secondaryBtn = {
  ...baseBtn,
  background: "transparent",
  color: P.accent,
  border: `2px solid ${P.accent}`,
  padding: "10px 24px",
};

export const ghostBtn = {
  ...baseBtn,
  background: "transparent",
  color: P.textMuted,
  padding: "8px 16px",
  fontSize: 14,
};
