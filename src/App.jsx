import { useState } from "react";
import { sbFetch } from "./lib/supabase";
import { translatePages } from "./lib/translate";
import { VOICES, LANGUAGES } from "./lib/constants";
import { P } from "./styles/theme";
import { Library } from "./components/Library";
import { CoverStep } from "./components/CoverStep";
import { PagesStep } from "./components/PagesStep";
import { ReviewStep } from "./components/ReviewStep";
import { ProgressStep } from "./components/ProgressStep";
import { ReadMode } from "./components/ReadMode";

export default function App() {
  const [view, setView] = useState("library");
  const [coverImage, setCoverImage] = useState(null);
  const [bookTitle, setBookTitle] = useState("");
  const [pages, setPages] = useState([]);
  const [createStep, setCreateStep] = useState("cover");
  const [selectedLangs, setSelectedLangs] = useState(["es", "zh-CN"]);
  const [voiceId, setVoiceId] = useState(VOICES[0].id);
  const [progress, setProgress] = useState("");
  const [activeBook, setActiveBook] = useState(null);
  const [libKey, setLibKey] = useState(0);

  const resetCreate = () => {
    setCoverImage(null);
    setBookTitle("");
    setPages([]);
    setCreateStep("cover");
    setSelectedLangs(["es", "zh-CN"]);
    setVoiceId(VOICES[0].id);
  };

  const handleTranslate = async () => {
    setCreateStep("working");

    try {
      setProgress("Saving book...");
      const [book] = await sbFetch("/rest/v1/books", {
        method: "POST",
        body: JSON.stringify({ title: bookTitle, cover_url: coverImage, voice_id: voiceId }),
      });

      setProgress("Saving pages...");
      const pageRows = pages.map((text, i) => ({ book_id: book.id, page_number: i + 1, english_text: text }));
      const savedPages = await sbFetch("/rest/v1/book_pages", {
        method: "POST",
        body: JSON.stringify(pageRows),
      });

      for (const code of selectedLangs) {
        const lang = LANGUAGES.find((l) => l.code === code);
        setProgress(`Translating to ${lang.label}...`);

        try {
          const parsed = await translatePages(pages, code);

          const transRows = parsed.map((translatedText, i) => ({
            book_page_id: savedPages[i].id,
            language_code: code,
            translated_text: translatedText,
          }));
          await sbFetch("/rest/v1/page_translations", {
            method: "POST",
            body: JSON.stringify(transRows),
          });
        } catch (err) {
          console.error(`Translation error for ${lang.label}:`, err);
        }
      }

      setActiveBook(book);
      setView("read");
      resetCreate();
      setLibKey((k) => k + 1);
    } catch (err) {
      console.error("Save error:", err);
      setProgress(`Error: ${err.message}. Going back...`);
      setTimeout(() => setCreateStep("review"), 3000);
    }
  };

  return (
    <div style={{ minHeight: "100vh", background: P.bg, fontFamily: "'DM Sans', sans-serif", color: P.text }}>
      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
      <div style={{ maxWidth: 520, margin: "0 auto", padding: "32px 20px" }}>
        {view !== "read" && (
          <div style={{ textAlign: "center", marginBottom: 36 }}>
            <h1 style={{ margin: 0, fontSize: 32, fontFamily: "'Fraunces', serif", fontWeight: 700, color: P.text, letterSpacing: -0.5 }}>
              📖 Storytime
            </h1>
            <p style={{ margin: "6px 0 0", fontSize: 14, color: P.textMuted }}>Read children's books in any language</p>
          </div>
        )}

        {view === "library" && (
          <Library
            key={libKey}
            onNewBook={() => { resetCreate(); setView("create"); }}
            onOpenBook={(b) => { setActiveBook(b); setView("read"); }}
          />
        )}

        {view === "create" && createStep === "cover" && (
          <CoverStep
            coverImage={coverImage} setCoverImage={setCoverImage}
            bookTitle={bookTitle} setBookTitle={setBookTitle}
            onNext={() => setCreateStep("pages")} onBack={() => setView("library")}
          />
        )}
        {view === "create" && createStep === "pages" && (
          <PagesStep
            pages={pages} setPages={setPages}
            onFinish={() => setCreateStep("review")} onBack={() => setCreateStep("cover")}
          />
        )}
        {view === "create" && createStep === "review" && (
          <ReviewStep
            bookTitle={bookTitle} coverImage={coverImage} pages={pages}
            onBack={() => setCreateStep("pages")} onTranslate={handleTranslate}
            selectedLangs={selectedLangs} setSelectedLangs={setSelectedLangs}
            voiceId={voiceId} setVoiceId={setVoiceId}
          />
        )}
        {view === "create" && createStep === "working" && <ProgressStep progress={progress} />}

        {view === "read" && activeBook && (
          <ReadMode book={activeBook} onBack={() => { setView("library"); setLibKey((k) => k + 1); }} />
        )}
      </div>
    </div>
  );
}
