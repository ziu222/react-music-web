import { supabase } from "../supabase/supabase";

const KEY = "melodies_play_log";

function load() {
  try { return JSON.parse(localStorage.getItem(KEY) || "{}"); }
  catch { return {}; }
}

function save(data) {
  try { localStorage.setItem(KEY, JSON.stringify(data)); }
  catch {}
}

function pushToSupabase(songId, plays, likes) {
  if (!supabase) return;
  supabase
    .from("play_counts")
    .upsert({ song_id: songId, plays, likes, updated_at: new Date().toISOString() })
    .then()
    .catch(() => {});
}

export function incrementPlay(songId) {
  const data = load();
  const entry = data[songId] ?? { plays: 0, likes: 0 };
  data[songId] = { ...entry, plays: entry.plays + 1 };
  save(data);
  pushToSupabase(songId, data[songId].plays, data[songId].likes);
}

export function incrementLike(songId) {
  const data = load();
  const entry = data[songId] ?? { plays: 0, likes: 0 };
  data[songId] = { ...entry, likes: entry.likes + 1 };
  save(data);
  pushToSupabase(songId, data[songId].plays, data[songId].likes);
}

export function decrementLike(songId) {
  const data = load();
  const entry = data[songId] ?? { plays: 0, likes: 0 };
  data[songId] = { ...entry, likes: Math.max(0, entry.likes - 1) };
  save(data);
  pushToSupabase(songId, data[songId].plays, data[songId].likes);
}

export function getPlayCounts() {
  return load();
}

export async function syncPlayCountsFromSupabase() {
  if (!supabase) return;
  const { data } = await supabase.from("play_counts").select("song_id,plays,likes");
  if (!data?.length) return;
  const map = {};
  data.forEach((r) => { map[r.song_id] = { plays: r.plays, likes: r.likes }; });
  save(map);
}
