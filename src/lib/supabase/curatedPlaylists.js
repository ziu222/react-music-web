import { supabase } from "./supabase";
export async function fetchCuratedPlaylists() {
  if (!supabase) return null;
  const { data, error } = await supabase
    .from("curated_playlists")
    .select("id, name, type, bg, song_ids, sort")
    .order("sort");
  if (error || !data?.length) return null;
  return data.map(r => ({
    id: r.id,
    name: r.name,
    type: r.type,
    bg: r.bg,
    ...(r.type === "liked" ? {} : { songIds: r.song_ids ?? [] }),
  }));
}
