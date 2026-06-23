import { supabase } from "./supabase";

/**
 * Curated/seed playlists now live in the `curated_playlists` table so they can
 * be tweaked without a redeploy. Maps snake_case → the shape App.jsx expects
 * (matching src/data/playlists.js). Returns null on any failure so callers can
 * fall back to the bundled static seed.
 */
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
