import { supabase } from "../supabase/supabase";

/* Kiểm duyệt rating/review — dùng chung cho admin (mọi bài) và artist (bài của mình).
 * RLS gate quyền xoá: admin có content.delete, artist khớp songs.artist_email.
 * fetchEngagement chỉ nạp comment+rating của tập songIds truyền vào. */

export async function fetchEngagement(songIds) {
  if (!supabase || !songIds?.length) return { comments: [], ratings: [] };
  const ids = songIds.map(Number);
  const [c, r] = await Promise.all([
    supabase.from("song_comments").select("*").in("song_id", ids).order("created_at", { ascending: false }),
    supabase.from("song_ratings").select("*").in("song_id", ids).order("created_at", { ascending: false }),
  ]);
  return { comments: c.data ?? [], ratings: r.data ?? [] };
}

export async function deleteComment(id) {
  if (!supabase) return { error: null };
  return supabase.from("song_comments").delete().eq("id", id);
}

export async function deleteRating(id) {
  if (!supabase) return { error: null };
  return supabase.from("song_ratings").delete().eq("id", id);
}
