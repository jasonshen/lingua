const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

const sbHeaders = {
  apikey: SUPABASE_KEY,
  Authorization: `Bearer ${SUPABASE_KEY}`,
  "Content-Type": "application/json",
  Prefer: "return=representation",
};

export async function sbFetch(path, opts = {}) {
  const res = await fetch(`${SUPABASE_URL}${path}`, {
    ...opts,
    headers: { ...sbHeaders, ...opts.headers },
  });
  if (!res.ok) {
    const t = await res.text();
    throw new Error(`Supabase ${res.status}: ${t}`);
  }
  const text = await res.text();
  return text ? JSON.parse(text) : null;
}

export async function sbUploadAudio(path, blob) {
  const res = await fetch(
    `${SUPABASE_URL}/storage/v1/object/book-audio/${path}`,
    {
      method: "POST",
      headers: {
        apikey: SUPABASE_KEY,
        Authorization: `Bearer ${SUPABASE_KEY}`,
        "Content-Type": "audio/mpeg",
        "x-upsert": "true",
      },
      body: blob,
    }
  );
  if (!res.ok) {
    const t = await res.text();
    throw new Error(`Storage upload ${res.status}: ${t}`);
  }
  return `${SUPABASE_URL}/storage/v1/object/public/book-audio/${path}`;
}
