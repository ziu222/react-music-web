/* ── Play / Like log (frontend-only) ────────────────────────────────
 * Lưu số lượt play và like thực tế của từng bài vào localStorage.
 * Artist analytics đọc dữ liệu này để overlay lên seeded stats.
 *
 * Key: melodies_play_log
 * Schema: { [songId]: { plays: number, likes: number } }
 */

const KEY = "melodies_play_log";

function load() {
  try {
    return JSON.parse(localStorage.getItem(KEY) || "{}");
  } catch {
    return {};
  }
}

function save(data) {
  try {
    localStorage.setItem(KEY, JSON.stringify(data));
  } catch {}
}

export function incrementPlay(songId) {
  const data = load();
  const entry = data[songId] ?? { plays: 0, likes: 0 };
  data[songId] = { ...entry, plays: entry.plays + 1 };
  save(data);
}

export function incrementLike(songId) {
  const data = load();
  const entry = data[songId] ?? { plays: 0, likes: 0 };
  data[songId] = { ...entry, likes: entry.likes + 1 };
  save(data);
}

export function decrementLike(songId) {
  const data = load();
  const entry = data[songId] ?? { plays: 0, likes: 0 };
  data[songId] = { ...entry, likes: Math.max(0, entry.likes - 1) };
  save(data);
}

export function getPlayCounts() {
  return load();
}
