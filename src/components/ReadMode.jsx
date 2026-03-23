import { useState, useEffect, useRef, useCallback } from "react";
import { sbFetch, sbUploadAudio } from "../lib/supabase";
import { generateSpeechBlob } from "../lib/elevenlabs";
import { LANGUAGES } from "../lib/constants";
import { P, baseBtn, primaryBtn, secondaryBtn, ghostBtn } from "../styles/theme";
import { ProgressStep } from "./ProgressStep";

export function ReadMode({ book, onBack }) {
  const [pagesData, setPagesData] = useState([]);
  const [translationsMap, setTranslationsMap] = useState({});
  const [langCode, setLangCode] = useState(null);
  const [pageIdx, setPageIdx] = useState(-1);
  const [speaking, setSpeaking] = useState(false);
  const [speakingEn, setSpeakingEn] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [error, setError] = useState(null);
  const audioRef = useRef(null);

  useEffect(() => {
    (async () => {
      try {
        const pages = await sbFetch(`/rest/v1/book_pages?book_id=eq.${book.id}&order=page_number.asc&select=*`);
        setPagesData(pages);

        const pageIds = pages.map((p) => p.id);
        if (pageIds.length === 0) { setLoadingData(false); return; }

        const trans = await sbFetch(`/rest/v1/page_translations?book_page_id=in.(${pageIds.join(",")})&select=*`);

        const map = {};
        for (const t of trans) {
          const page = pages.find((p) => p.id === t.book_page_id);
          if (!page) continue;
          if (!map[t.language_code]) map[t.language_code] = {};
          map[t.language_code][page.page_number] = {
            text: t.translated_text,
            audio_path: t.audio_path,
            id: t.id,
          };
        }
        setTranslationsMap(map);
        const langs = Object.keys(map);
        if (langs.length > 0 && !langCode) setLangCode(langs[0]);
      } catch (e) {
        console.error("Load error:", e);
      } finally {
        setLoadingData(false);
      }
    })();
  }, [book.id]);

  const availableLangs = Object.keys(translationsMap);
  const lang = LANGUAGES.find((l) => l.code === langCode);
  const totalPages = pagesData.length;
  const currentPage = pageIdx >= 0 ? pagesData[pageIdx] : null;
  const currentTrans = langCode && currentPage ? translationsMap[langCode]?.[currentPage.page_number] : null;

  const stopAll = useCallback(() => {
    if (audioRef.current) { audioRef.current.pause(); audioRef.current.currentTime = 0; audioRef.current = null; }
    window.speechSynthesis?.cancel();
    setSpeaking(false); setSpeakingEn(false); setLoading(false);
  }, []);

  useEffect(() => () => stopAll(), [stopAll]);
  useEffect(() => { stopAll(); }, [pageIdx, langCode, stopAll]);

  const playAudio = async (isEnglish = false) => {
    stopAll();
    setError(null);

    if (isEnglish && currentPage) {
      setSpeakingEn(true);
      const utter = new SpeechSynthesisUtterance(currentPage.english_text);
      utter.lang = "en-US";
      utter.rate = 0.85;
      utter.onend = () => setSpeakingEn(false);
      utter.onerror = () => setSpeakingEn(false);
      window.speechSynthesis.speak(utter);
      return;
    }

    if (!currentTrans) return;
    setSpeaking(true);

    if (currentTrans.audio_path) {
      try {
        const audio = new Audio(currentTrans.audio_path);
        audioRef.current = audio;
        audio.onended = () => { setSpeaking(false); audioRef.current = null; };
        audio.onerror = () => { setSpeaking(false); setError("Playback failed"); audioRef.current = null; };
        await audio.play();
      } catch (err) {
        setSpeaking(false);
        setError(err.message);
      }
      return;
    }

    setLoading(true);
    try {
      const blob = await generateSpeechBlob(currentTrans.text, book.voice_id);
      const storagePath = `${book.id}/${langCode}/page_${currentPage.page_number}.mp3`;
      const publicUrl = await sbUploadAudio(storagePath, blob);

      await sbFetch(`/rest/v1/page_translations?id=eq.${currentTrans.id}`, {
        method: "PATCH",
        body: JSON.stringify({ audio_path: publicUrl }),
      });

      setTranslationsMap((prev) => ({
        ...prev,
        [langCode]: {
          ...prev[langCode],
          [currentPage.page_number]: { ...currentTrans, audio_path: publicUrl },
        },
      }));

      setLoading(false);
      const audio = new Audio(URL.createObjectURL(blob));
      audioRef.current = audio;
      audio.onended = () => { setSpeaking(false); audioRef.current = null; };
      audio.onerror = () => { setSpeaking(false); audioRef.current = null; };
      await audio.play();
    } catch (err) {
      setLoading(false);
      setSpeaking(false);
      setError(err.message);
    }
  };

  if (loadingData) return <ProgressStep progress="Loading book data..." />;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <button style={ghostBtn} onClick={() => { stopAll(); onBack(); }}>← Library</button>
        <h2 style={{ margin: 0, fontSize: 18, fontFamily: "'Fraunces', serif", color: P.text }}>{book.title}</h2>
        <div style={{ width: 80 }} />
      </div>

      {availableLangs.length > 0 && (
        <div style={{ display: "flex", gap: 8, justifyContent: "center", flexWrap: "wrap" }}>
          {availableLangs.map((code) => {
            const l = LANGUAGES.find((x) => x.code === code);
            const active = code === langCode;
            return (
              <button key={code} onClick={() => setLangCode(code)} style={{
                ...baseBtn, padding: "8px 14px", borderRadius: 20, fontSize: 13,
                background: active ? P.accent : "transparent", color: active ? "#fff" : P.textMuted,
                border: active ? "none" : `1.5px solid ${P.border}`,
              }}>
                {l?.flag} {l?.label}
              </button>
            );
          })}
        </div>
      )}

      <div style={{
        background: P.card, borderRadius: 20, padding: 28, boxShadow: P.shadowLg,
        minHeight: 280, display: "flex", flexDirection: "column", alignItems: "center",
        justifyContent: "center", textAlign: "center", gap: 20,
      }}>
        {pageIdx === -1 ? (
          <>
            {book.cover_url && <img src={book.cover_url} alt="" style={{ maxHeight: 200, borderRadius: 12, boxShadow: P.shadow }} />}
            <h3 style={{ margin: 0, fontSize: 22, fontFamily: "'Fraunces', serif", color: P.text }}>{book.title}</h3>
            <p style={{ color: P.textMuted, fontSize: 14 }}>Tap "Next" to start reading</p>
          </>
        ) : currentPage ? (
          <>
            <span style={{ fontSize: 12, color: P.textMuted, fontWeight: 600, letterSpacing: 1, textTransform: "uppercase" }}>
              Page {pageIdx + 1} of {totalPages}
            </span>
            <div style={{ width: "100%" }}>
              <p style={{ fontSize: 19, lineHeight: 1.7, color: P.text, margin: "0 0 10px", fontFamily: "'Fraunces', serif" }}>
                {currentPage.english_text}
              </p>
              <button onClick={() => speakingEn ? stopAll() : playAudio(true)} style={{
                ...baseBtn, padding: "6px 14px", fontSize: 13, borderRadius: 16,
                background: speakingEn ? P.accent : P.accentLight, color: speakingEn ? "#fff" : P.accent,
              }}>
                {speakingEn ? "⏹ Stop" : "🔊 English"}
              </button>
            </div>
            <div style={{ width: "80%", height: 1, background: P.border }} />
            <div style={{ width: "100%" }}>
              <p style={{ fontSize: 19, lineHeight: 1.7, color: P.accent, margin: "0 0 10px", fontFamily: "'Fraunces', serif" }}>
                {currentTrans?.text || "No translation"}
              </p>
              {error && <p style={{ fontSize: 12, color: "#c00", margin: "0 0 8px" }}>{error}</p>}
              <button
                onClick={() => (speaking || loading) ? stopAll() : playAudio(false)}
                disabled={!currentTrans}
                style={{
                  ...baseBtn, padding: "10px 28px", fontSize: 15, borderRadius: 24,
                  background: loading ? P.textMuted : speaking ? "#FF4444" : P.accent, color: "#fff",
                  boxShadow: speaking ? "0 0 0 4px rgba(255,68,68,0.2)" : "0 0 0 4px rgba(232,115,74,0.15)",
                  opacity: currentTrans ? 1 : 0.4,
                }}
              >
                {loading ? (
                  <><span style={{ width: 14, height: 14, border: "2px solid rgba(255,255,255,0.3)", borderTopColor: "#fff", borderRadius: "50%", animation: "spin 0.6s linear infinite", display: "inline-block" }} /> Generating...</>
                ) : speaking ? "⏹ Stop" : (
                  currentTrans?.audio_path ? `🔊 Play in ${lang?.label}` : `🔊 Generate + Play in ${lang?.label}`
                )}
              </button>
              {currentTrans?.audio_path && (
                <p style={{ fontSize: 11, color: P.textMuted, marginTop: 6 }}>Saved to library</p>
              )}
            </div>
          </>
        ) : null}
      </div>

      <div style={{ display: "flex", gap: 12 }}>
        <button style={{ ...secondaryBtn, flex: 1, opacity: pageIdx > -1 ? 1 : 0.3 }}
          onClick={() => setPageIdx((p) => Math.max(-1, p - 1))} disabled={pageIdx <= -1}>← Previous</button>
        <button style={{ ...primaryBtn, flex: 1, opacity: pageIdx < totalPages - 1 ? 1 : 0.3 }}
          onClick={() => setPageIdx((p) => Math.min(totalPages - 1, p + 1))} disabled={pageIdx >= totalPages - 1}>Next →</button>
      </div>

      <div style={{ display: "flex", justifyContent: "center", gap: 6 }}>
        {[-1, ...pagesData.map((_, i) => i)].map((i) => (
          <div key={i} onClick={() => setPageIdx(i)} style={{
            width: pageIdx === i ? 24 : 8, height: 8, borderRadius: 4,
            background: pageIdx === i ? P.accent : P.border, cursor: "pointer", transition: "all 0.2s ease",
          }} />
        ))}
      </div>
    </div>
  );
}
