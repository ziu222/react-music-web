/* ── Follower reverse-index (frontend-only) ────────────────────────
 * Lưu danh sách email follower theo nghệ sĩ để admin có thể gửi
 * thông báo "nhạc mới" đến đúng người khi duyệt bài.
 *
 * Key: melodies_follower_index
 * Schema: { [artistName]: string[] }  — mảng email followers
 */

const KEY = "melodies_follower_index";

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

export function addFollower(artistName, email) {
  if (!artistName || !email) return;
  const data = load();
  const list = data[artistName] ?? [];
  if (!list.includes(email)) {
    data[artistName] = [...list, email];
    save(data);
  }
}

export function removeFollower(artistName, email) {
  if (!artistName || !email) return;
  const data = load();
  const list = data[artistName] ?? [];
  data[artistName] = list.filter((e) => e !== email);
  save(data);
}

export function getFollowers(artistName) {
  if (!artistName) return [];
  return load()[artistName] ?? [];
}
