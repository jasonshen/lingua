import { useState, useEffect } from "react";
import { sbFetch } from "../lib/supabase";
import { P, baseBtn, primaryBtn, ghostBtn } from "../styles/theme";

export function Library({ onNewBook, onOpenBook, onAddPages, onDeleteBook }) {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [confirmDelete, setConfirmDelete] = useState(null);

  useEffect(() => {
    sbFetch("/rest/v1/books?select=*&order=created_at.desc")
      .then(setBooks)
      .catch((e) => console.error("Failed to load books:", e))
      .finally(() => setLoading(false));
  }, []);

  const handleDelete = async (book) => {
    try {
      // CASCADE delete handles pages + translations
      await sbFetch(`/rest/v1/books?id=eq.${book.id}`, { method: "DELETE" });
      setBooks((prev) => prev.filter((b) => b.id !== book.id));
      setConfirmDelete(null);
      if (onDeleteBook) onDeleteBook(book);
    } catch (e) {
      console.error("Delete failed:", e);
      alert("Failed to delete book. Please try again.");
    }
  };

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
            <div key={b.id} style={{
              background: P.card, borderRadius: 16, boxShadow: P.shadow,
              border: `1.5px solid ${P.border}`, overflow: "hidden",
            }}>
              <button
                onClick={() => onOpenBook(b)}
                style={{
                  ...baseBtn, width: "100%", padding: "16px 20px",
                  background: "transparent", justifyContent: "flex-start",
                  border: "none", borderRadius: 0,
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
                <div style={{ textAlign: "left", marginLeft: 4, flex: 1 }}>
                  <div style={{ fontWeight: 700, color: P.text, fontSize: 16 }}>{b.title}</div>
                  <div style={{ fontWeight: 400, color: P.textMuted, fontSize: 13, marginTop: 2 }}>
                    {new Date(b.created_at).toLocaleDateString()}
                  </div>
                </div>
              </button>

              {confirmDelete === b.id ? (
                <div style={{
                  display: "flex", gap: 8, padding: "10px 16px",
                  borderTop: `1px solid ${P.border}`, background: "#FFF5F5",
                }}>
                  <span style={{ fontSize: 13, color: "#c00", flex: 1, alignSelf: "center" }}>Delete this book?</span>
                  <button onClick={() => handleDelete(b)} style={{
                    ...baseBtn, padding: "6px 16px", fontSize: 13, borderRadius: 8,
                    background: "#c00", color: "#fff",
                  }}>Delete</button>
                  <button onClick={() => setConfirmDelete(null)} style={{
                    ...baseBtn, padding: "6px 16px", fontSize: 13, borderRadius: 8,
                    background: P.border, color: P.text,
                  }}>Cancel</button>
                </div>
              ) : (
                <div style={{
                  display: "flex", gap: 0, borderTop: `1px solid ${P.border}`,
                }}>
                  <button onClick={() => onAddPages(b)} style={{
                    ...ghostBtn, flex: 1, padding: "10px 12px", fontSize: 13,
                    borderRadius: 0, borderRight: `1px solid ${P.border}`,
                    color: P.accent,
                  }}>+ Add Pages</button>
                  <button onClick={() => setConfirmDelete(b.id)} style={{
                    ...ghostBtn, padding: "10px 16px", fontSize: 13,
                    borderRadius: 0, color: "#c00",
                  }}>🗑</button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
