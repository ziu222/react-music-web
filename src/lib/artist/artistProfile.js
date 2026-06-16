/* ── Artist public profile storage (frontend-only) ────────────────
 * Lưu trong localStorage key `melodies_artist_profiles`, object map
 * theo email lowercase — bio, thể loại, liên kết mạng xã hội.
 */

const STORE_KEY = "melodies_artist_profiles";

export const DEFAULT_PROFILE = {
  bio: "",
  genres: [],
  links: { website: "", facebook: "", instagram: "", youtube: "" },
  avatarBlobId: null,   // ảnh đại diện thật — blob trong IndexedDB (mediaStore)
  displayName: "",      // nghệ danh — rỗng thì dùng tên tài khoản
  themeColor: "",       // màu chủ đề hồ sơ — rỗng thì dùng màu tài khoản
};

function readStore() {
  try {
    const raw = localStorage.getItem(STORE_KEY);
    const parsed = raw ? JSON.parse(raw) : {};
    return parsed && typeof parsed === "object" && !Array.isArray(parsed) ? parsed : {};
  } catch {
    return {};
  }
}

export function loadArtistProfile(email) {
  const stored = readStore()[String(email).toLowerCase()];
  return {
    ...DEFAULT_PROFILE,
    ...(stored ?? null),
    links: { ...DEFAULT_PROFILE.links, ...(stored?.links ?? null) },
  };
}

export function saveArtistProfile(email, profile) {
  const store = readStore();
  store[String(email).toLowerCase()] = profile;
  try { localStorage.setItem(STORE_KEY, JSON.stringify(store)); }
  catch (err) { void err; }
}
