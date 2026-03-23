# Storytime

A multilingual children's book reader. Input a children's book page-by-page in English, translate it into multiple languages, and read along with high-quality audio playback.

## Languages Supported

- Spanish (Latin American)
- Mandarin Chinese (simplified)
- Cantonese Chinese (spoken Cantonese, traditional characters)
- Thai
- Indonesian

## Tech Stack

- **Frontend**: React + Vite (SPA)
- **Database**: Supabase Postgres
- **File Storage**: Supabase Storage
- **Translation**: Anthropic Claude API
- **Text-to-Speech**: ElevenLabs Multilingual v2
- **English Audio**: Browser Web Speech API

## Setup

1. Copy `.env.example` to `.env.local` and fill in your keys
2. Run the SQL migration in `sql/migration.sql` via the Supabase SQL Editor
3. `npm install && npm run dev`

## Deploy

```bash
npm run build
# Deploy dist/ to Vercel
```
