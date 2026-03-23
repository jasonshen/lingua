-- ============================================
-- Storytime App - Supabase Migration
-- Run this in: Supabase Dashboard > SQL Editor
-- ============================================

-- 1. Create tables
-- ─────────────────

CREATE TABLE books (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  cover_url TEXT,
  voice_id TEXT NOT NULL DEFAULT '21m00Tcm4TlvDq8ikWAM',
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE book_pages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  book_id UUID NOT NULL REFERENCES books(id) ON DELETE CASCADE,
  page_number INTEGER NOT NULL,
  english_text TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(book_id, page_number)
);

CREATE TABLE page_translations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  book_page_id UUID NOT NULL REFERENCES book_pages(id) ON DELETE CASCADE,
  language_code TEXT NOT NULL,
  translated_text TEXT NOT NULL,
  audio_path TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(book_page_id, language_code)
);

-- 2. Create indexes
-- ─────────────────

CREATE INDEX idx_book_pages_book_id ON book_pages(book_id);
CREATE INDEX idx_page_translations_page_id ON page_translations(book_page_id);
CREATE INDEX idx_page_translations_lang ON page_translations(language_code);

-- 3. Create storage bucket
-- ─────────────────────────

INSERT INTO storage.buckets (id, name, public)
VALUES ('book-audio', 'book-audio', true);

-- 4. Row Level Security (open for anon - single user app)
-- ────────────────────────────────────────────────────────

ALTER TABLE books ENABLE ROW LEVEL SECURITY;
ALTER TABLE book_pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE page_translations ENABLE ROW LEVEL SECURITY;

-- Allow all operations for anon role (personal app, not multi-tenant)
CREATE POLICY "Allow all on books" ON books FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on book_pages" ON book_pages FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on page_translations" ON page_translations FOR ALL USING (true) WITH CHECK (true);

-- Storage policy: allow public read and anon upload
CREATE POLICY "Public read audio" ON storage.objects FOR SELECT USING (bucket_id = 'book-audio');
CREATE POLICY "Anon upload audio" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'book-audio');
CREATE POLICY "Anon update audio" ON storage.objects FOR UPDATE USING (bucket_id = 'book-audio');
