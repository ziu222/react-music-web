/* ── Admin song catalog overrides (frontend-only) ─────────────────
 * Lưu trong localStorage key `melodies_song_overrides` — danh sách
 * id bài hát admin đã gỡ khỏi catalog; App lọc list theo đây nên
 * listener không còn thấy bài bị gỡ ở Home/Search/Library.
 */

const STORE_KEY = "melodies_song_overrides";

function readStore() {
  try {
    const raw = localStorage.getItem(STORE_KEY);
    const parsed = raw ? JSON.parse(raw) : null;
    return parsed && typeof parsed === "object" && Array.isArray(parsed.hiddenIds)
      ? parsed
      : { hiddenIds: [] };
  } catch {
    return { hiddenIds: [] };
  }
}

function saveStore(store) {
  try { localStorage.setItem(STORE_KEY, JSON.stringify(store)); }
  catch (err) { void err; }
}

export function loadSongOverrides() {
  return readStore();
}

export function isSongHidden(id) {
  return readStore().hiddenIds.includes(id);
}

export function toggleSongHidden(id) {
  const store = readStore();
  const hiddenIds = store.hiddenIds.includes(id)
    ? store.hiddenIds.filter((x) => x !== id)
    : [...store.hiddenIds, id];
  saveStore({ ...store, hiddenIds });
  return hiddenIds;
}

export function applySongOverrides(songs) {
  const { hiddenIds } = readStore();
  if (!hiddenIds.length) return songs;
  return songs.filter((s) => !hiddenIds.includes(s.id));
}
