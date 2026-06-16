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
    bg: r.bg,
    audioUrl: r.audio_url ?? null,
    coverUrl: r.cover_url ?? null,
    explicit: r.explicit ?? false,
    community: r.community ?? false,
  };
}

export async function fetchSongsFromSupabase() {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from("songs")
    .select("*")
    .eq("community", false)
    .order("id");
  if (error || !data) return [];
  return data.map(mapRow);
}
