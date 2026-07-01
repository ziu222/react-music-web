import { supabase } from "../supabase/supabase";
import { getPlayCounts } from "./playLog";

/* Ghi snapshot tổng plays/likes theo NGÀY để dựng chart "lượt nghe theo thời gian".
 * Guard bằng localStorage: chỉ ghi 1 lần/ngày (khi admin mở màn Nội dung). */

const GUARD_KEY = "melodies_snapshot_day";

function today() {
  return new Date().toISOString().slice(0, 10); // YYYY-MM-DD
}

/** Ghi snapshot cho toàn bộ songs nếu hôm nay chưa ghi. Fire-and-forget. */
export function recordDailySnapshot(songs) {
  if (!supabase || !Array.isArray(songs) || !songs.length) return;
  let last = null;
  try { last = localStorage.getItem(GUARD_KEY); } catch { /* ignore */ }
  const day = today();
  if (last === day) return;
  try { localStorage.setItem(GUARD_KEY, day); } catch { /* ignore */ }

  const counts = getPlayCounts();
  const rows = songs.map((s) => ({
    song_id: s.id,
    day,
    plays: counts[s.id]?.plays ?? s.plays ?? 0,
    likes: s.likes ?? counts[s.id]?.likes ?? 0,
  }));
  // upsert theo (song_id, day) — chạy lại trong ngày chỉ cập nhật, không nhân bản
  supabase
    .from("play_snapshots")
    .upsert(rows, { onConflict: "song_id,day" })
    .then()
    .catch(() => {});
}

/** Tổng plays toàn hệ thống theo ngày (cho dashboard). */
export async function getDailyTotals(limitDays = 30) {
  if (!supabase) return [];
  const { data, error } = await supabase.from("play_snapshots").select("day,plays");
  if (error || !data) return [];
  const map = new Map();
  data.forEach((r) => map.set(r.day, (map.get(r.day) ?? 0) + (r.plays ?? 0)));
  return [...map.entries()]
    .sort((a, b) => (a[0] < b[0] ? -1 : 1))
    .slice(-limitDays)
    .map(([day, plays]) => ({ day, plays }));
}

/** Lấy chuỗi snapshot theo ngày của 1 bài (tăng dần). */
export async function getSnapshots(songId, limitDays = 30) {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from("play_snapshots")
    .select("day,plays,likes")
    .eq("song_id", songId)
    .order("day", { ascending: true })
    .limit(limitDays);
  if (error || !data) return [];
  return data;
}
