import { supabase } from "./supabase";

function mapRow(r) {
  return {
    id: r.id,
    title: r.title,
    artist: r.artist,
    album: r.album,
    genre: r.genre,
    duration: r.duration,
    durationSecs: r.duration_secs,
    plays: r.plays,
    likes: r.likes ?? 0,
    bg: r.bg,
    audioUrl: r.audio_url ?? null,
    coverUrl: r.cover_url ?? null,
    explicit: r.explicit ?? false,
    community: r.community ?? false,
    language: r.language ?? null,
    lyricsText: r.lyrics_text ?? null,
    artistEmail: r.artist_email ?? null,
    hidden: r.hidden ?? false,
    takenDownAt: r.taken_down_at ?? null,
    takedownReason: r.takedown_reason ?? null,
  };
}

export async function fetchSongsFromSupabase() {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from("songs")
    .select("*")
    .order("community")
    .order("id");
  if (error) throw error;
  if (!data) return [];
  return data.map(mapRow);
}
