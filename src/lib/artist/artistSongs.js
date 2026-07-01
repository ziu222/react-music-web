import { supabase } from "../supabase/supabase";

/* Cập nhật metadata bài đã phát hành của nghệ sĩ.
 * RLS songs cho phép update (demo). UI chỉ hiển thị bài của chính artist. */
export async function updateSongMeta(id, patch) {
  if (!supabase) return { error: null };
  return supabase.from("songs").update(patch).eq("id", id);
}

/* Đổi tên album = cập nhật cột album cho mọi bài thuộc album đó của artist. */
export async function renameAlbumForArtist(artistEmail, oldName, newName) {
  if (!supabase) return { error: null };
  return supabase
    .from("songs")
    .update({ album: newName })
    .eq("artist_email", String(artistEmail).toLowerCase())
    .eq("album", oldName);
}
