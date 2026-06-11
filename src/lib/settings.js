/* ── Per-user settings storage (frontend-only) ────────────────────
 * Lưu trong localStorage key `melodies_user_settings`, map theo
 * user key (email hoặc "guest") để user A đổi không ảnh hưởng user B.
 */

const STORE_KEY = "melodies_user_settings";

export const DEFAULT_SETTINGS = {
  audioQuality: "normal",   // normal | high (high gate premium)
  autoplay: true,           // tự phát bài tiếp theo khi hết bài
  explicitContent: false,   // chưa có backend — UI để "sắp có"
  themeMode: "dark",        // system | dark | light (dark-first)
  notifyTypes: {
    system: true,
    library: true,
    premium: true,
    social: true,
  },
};

function readStore() {
  try {
    const raw = localStorage.getItem(STORE_KEY);
    const parsed = raw ? JSON.parse(raw) : {};
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

export function loadSettings(userKey) {
  const stored = readStore()[userKey];
  return {
    ...DEFAULT_SETTINGS,
    ...(stored ?? null),
    notifyTypes: { ...DEFAULT_SETTINGS.notifyTypes, ...(stored?.notifyTypes ?? null) },
  };
}

/* High quality là quyền lợi premium — ép về normal khi user không còn quyền.
 * Giá trị stored giữ nguyên để nâng cấp xong preference cũ quay lại. */
export function normalizeSettingsForEntitlement(settings, isPremium) {
  if (isPremium || settings.audioQuality !== "high") return settings;
  return { ...settings, audioQuality: "normal" };
}

export function saveSettings(userKey, settings) {
  const store = readStore();
  store[userKey] = settings;
  try { localStorage.setItem(STORE_KEY, JSON.stringify(store)); }
  catch (err) { void err; }
}
