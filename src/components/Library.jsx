import { useState, useEffect } from "react";
import { sbFetch } from "../lib/supabase";
import { P, baseBtn, primaryBtn } from "../styles/theme";

export function Library({ onNewBook, onOpenBook }) {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    sbFetch("/rest/v1/books?select=*&order=created_at.desc")
      .then(setBooks)
      .catch((e) => console.error("Failed to load books:", e))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <h2 style={{ margin: 0, fontSize: 24, fontFamily: "'Fraunces', serif", color: P.text }}>
            Your Books
          </h2>
          <p style={{ margin: "4px 0 0", fontSize: 14, color: P.textMuted }}>
            {books.length} book{books.length !== 1 ? "s" : ""} saved
          </p>
        </div>
        <button style={primaryBtn} onClick={onNewBook}>+ New Book</button>
      </div>

      {loading ? (
        <p style={{ color: P.textMuted, textAlign: "center", padding: 40 }}>Loading...</p>
      ) : books.length === 0 ? (
        <div style={{
          textAlign: "center", padding: "60px 20px", background: P.card,
          borderRadius: 20, boxShadow: P.shadow,
        }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>📚</div>
          <p style={{ color: P.textMuted, fontSize: 15, margin: 0 }}>
            No books yet. Tap "New Book" to get started.
          </p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {books.map((b) => (
            <button
              key={b.id}
              onClick={() => onOpenBook(b)}
              style={{
                ...baseBtn, width: "100%", padding: "16px 20px", borderRadius: 16,
                background: P.card, boxShadow: P.shadow, justifyContent: "flex-start",
                border: `1.5px solid ${P.border}`,
              }}
            >
              {b.cover_url ? (
                <img src={b.cover_url} alt="" style={{ width: 44, height: 60, objectFit: "cover", borderRadius: 6, flexShrink: 0 }} />
              ) : (
                <div style={{
                  width: 44, height: 60, borderRadius: 6, background: P.accentLight,
                  display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, flexShrink: 0,
                }}>📖</div>
              )}
              <div style={{ textAlign: "left", marginLeft: 4 }}>
                <div style={{ fontWeight: 700, color: P.text, fontSize: 16 }}>{b.title}</div>
                <div style={{ fontWeight: 400, color: P.textMuted, fontSize: 13, marginTop: 2 }}>
                  {new Date(b.created_at).toLocaleDateString()}
                </div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
