import { supabase } from "./supabase";

/* Per-user listening history (user_play_history). Powers cross-device
   "Nghe gần đây" and real listener stats. */

// Fire-and-forget: bump play_count + last_played_at via an atomic RPC.
export function recordUserPlay(userEmail, songId) {
  if (!supabase || !userEmail || songId == null) return;
  supabase
    .rpc("increment_user_play", { p_email: userEmail.toLowerCase(), p_song: String(songId) })
    .then()
    .catch(() => {});
}

// Most-recently-played song ids (numeric), newest first.
export async function loadUserRecent(userEmail, limit = 12) {
  if (!supabase || !userEmail) return [];
  const { data } = await supabase
    .from("user_play_history")
    .select("song_id")
    .eq("user_email", userEmail.toLowerCase())
    .order("last_played_at", { ascending: false })
    .limit(limit);
  return (data ?? []).map(r => Number(r.song_id)).filter(n => !Number.isNaN(n));
}

// Full per-song play counts for stats: [{ songId, plays }].
export async function loadUserPlayHistory(userEmail) {
  if (!supabase || !userEmail) return [];
  const { data } = await supabase
    .from("user_play_history")
    .select("song_id, play_count")
    .eq("user_email", userEmail.toLowerCase());
  return (data ?? []).map(r => ({ songId: Number(r.song_id), plays: r.play_count }));
}

// Recent activity with timestamps for the admin user detail view:
// [{ songId, plays, lastPlayedAt }], newest first, capped at `limit`.
export async function loadUserActivity(userEmail, limit = 15) {
  if (!supabase || !userEmail) return [];
  const { data } = await supabase
    .from("user_play_history")
    .select("song_id, play_count, last_played_at")
    .eq("user_email", userEmail.toLowerCase())
    .order("last_played_at", { ascending: false })
    .limit(limit);
  return (data ?? []).map(r => ({
    songId: Number(r.song_id),
    plays: r.play_count,
    lastPlayedAt: r.last_played_at,
  }));
}
