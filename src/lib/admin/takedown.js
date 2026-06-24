import { supabase } from "../supabase/supabase";

// Cửa sổ khôi phục bản quyền: 30 ngày kể từ thời điểm gỡ (taken_down_at)
const RESTORE_WINDOW_MS = 30 * 24 * 3600 * 1000;

/* Gỡ bản quyền 1 bài hát (DMCA).
 * Tái dùng cờ hidden để loại khỏi catalog + ghi mốc thời gian & lý do.
 * Trả { error } để caller xử lý thông báo. */
export async function takedownSong(songId, reason) {
  try {
    const { error } = await supabase
      .from("songs")
      .update({
        hidden: true,
        taken_down_at: new Date().toISOString(),
        takedown_reason: reason ?? "",
      })
      .eq("id", songId);
    return { error };
  } catch (error) {
    return { error };
  }
}

/* Khôi phục bài đã gỡ bản quyền: bỏ cờ hidden + xóa mốc & lý do. */
export async function restoreTakedownSong(songId) {
  try {
    const { error } = await supabase
      .from("songs")
      .update({
        hidden: false,
        taken_down_at: null,
        takedown_reason: null,
      })
      .eq("id", songId);
    return { error };
  } catch (error) {
    return { error };
  }
}

/* Còn trong cửa sổ khôi phục 30 ngày không?
 * takenDownAt null/falsy -> false. */
export function canRestoreTakedown(takenDownAt) {
  if (!takenDownAt) return false;
  return Date.now() - new Date(takenDownAt).getTime() <= RESTORE_WINDOW_MS;
}
