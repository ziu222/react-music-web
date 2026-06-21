import { supabase } from "../supabase/supabase";

/* toggleSongHidden — ghi trực tiếp vào songs.hidden trên DB */
export async function toggleSongHidden(id, hidden) {
  if (!supabase) return;
  await supabase.from("songs").update({ hidden }).eq("id", id)
    .catch(err => console.error("[toggleSongHidden]", err.message));
}

/* applySongOverrides — lọc bài đã bị admin gỡ (hidden = true trong catalog) */
export function applySongOverrides(songs) {
  return songs.filter(s => !s.hidden);
}
