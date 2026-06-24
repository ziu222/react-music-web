import { supabase } from "../supabase/supabase";

const _statsCache = new Map();

export async function getRating(songId, userEmail) {
  if (!supabase || !songId || !userEmail) return null;
  const { data } = await supabase.from("song_ratings")
    .select("rating")
    .eq("song_id", songId)
    .eq("user_email", userEmail.toLowerCase())
    .maybeSingle();
  return data?.rating ?? null;
}

export async function setRating(songId, userEmail, rating) {
  if (!supabase || !songId || !userEmail) return;
  _statsCache.delete(songId);
  await supabase.from("song_ratings").upsert({
    song_id: songId,
    user_email: userEmail.toLowerCase(),
    rating,
  }, { onConflict: "song_id,user_email" });
}

export async function getSongRatingStats(songId) {
  if (_statsCache.has(songId)) return _statsCache.get(songId);
  if (!supabase || !songId) return { average: 0, count: 0 };
  const { data } = await supabase.from("song_ratings")
    .select("rating")
    .eq("song_id", songId);
  const rows = data ?? [];
  const count = rows.length;
  const average = count ? rows.reduce((s, r) => s + r.rating, 0) / count : 0;
  const result = { average: Math.round(average * 10) / 10, count };
  _statsCache.set(songId, result);
  return result;
}
