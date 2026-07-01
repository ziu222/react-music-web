import { supabase } from "../supabase/supabase";

const KEY = "melodies_play_log";

function load() {
  try { return JSON.parse(localStorage.getItem(KEY) || "{}"); }
  catch { return {}; }
}

function save(data) {
  try { localStorage.setItem(KEY, JSON.stringify(data)); }
  catch (e) { void e; }
}

// Ghi likes lên songs.likes trực tiếp (play_counts đã xoá)
function pushLikesToSupabase(songId, likes) {
  if (!supabase) return;
  supabase
    .from("songs")
    .update({ likes })
    .eq("id", Number(songId))
    .then()
    .catch(() => {});
}

export function incrementPlay(songId) {
  const data = load();
  const entry = data[songId] ?? { plays: 0, likes: 0 };
  data[songId] = { ...entry, plays: entry.plays + 1 };
  save(data);
  // plays được tính trong songs.plays (seed data) + play_snapshots —
  // không update songs.plays theo từng click để tránh contention cao
}

export function incrementLike(songId) {
  const data = load();
  const entry = data[songId] ?? { plays: 0, likes: 0 };
  data[songId] = { ...entry, likes: entry.likes + 1 };
  save(data);
  pushLikesToSupabase(songId, data[songId].likes);
}

export function decrementLike(songId) {
  const data = load();
  const entry = data[songId] ?? { plays: 0, likes: 0 };
  data[songId] = { ...entry, likes: Math.max(0, entry.likes - 1) };
  save(data);
  pushLikesToSupabase(songId, data[songId].likes);
}

export function getPlayCounts() {
  return load();
}

export async function syncPlayCountsFromSupabase() {
  if (!supabase) return;
  // Sync likes từ songs.likes về localStorage
  const { data } = await supabase.from("songs").select("id,plays,likes");
  if (!data?.length) return;
  const current = load();
  data.forEach((r) => {
    current[r.id] = {
      plays: current[r.id]?.plays ?? r.plays ?? 0,
      likes: r.likes ?? 0,
    };
  });
  save(current);
}
