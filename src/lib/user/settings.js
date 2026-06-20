import { supabase } from "../supabase/supabase";

/* ── Per-user settings ─────────────────────────────────────────────
 * LS cache → instant mount, không flash theme/audio.
 * DB (users.settings) → cross-device sync khi đăng nhập.
 */

const STORE_KEY = "melodies_user_settings";

export const DEFAULT_SETTINGS = {
  audioQuality: "normal",
  autoplay: true,
  explicitContent: false,
  themeMode: "dark",
  notifyTypes: { system: true, library: true, premium: true, social: true },
};

function readStore() {
  try {
    const raw = localStorage.getItem(STORE_KEY);
    const parsed = raw ? JSON.parse(raw) : {};
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch { return {}; }
}

function mergeSettings(stored) {
  return {
    ...DEFAULT_SETTINGS,
    ...(stored ?? null),
    notifyTypes: { ...DEFAULT_SETTINGS.notifyTypes, ...(stored?.notifyTypes ?? null) },
  };
}

/* Đọc ngay từ LS cache — gọi đồng bộ khi mount để không flash */
export function loadSettings(userKey) {
  return mergeSettings(readStore()[userKey]);
}

/* Ghi LS ngay + async ghi DB nếu là tài khoản thật */
export function saveSettings(userKey, settings) {
  const store = readStore();
  store[userKey] = settings;
  try { localStorage.setItem(STORE_KEY, JSON.stringify(store)); } catch {}
  if (supabase && userKey.includes("@")) {
    supabase.from("users").update({ settings }).eq("email", userKey.toLowerCase())
      .then().catch(() => {});
  }
}

/* Gọi sau khi login để hydrate cross-device settings từ DB */
export async function syncSettingsFromDB(userEmail) {
  if (!supabase || !userEmail) return null;
  const { data } = await supabase
    .from("users")
    .select("settings")
    .eq("email", userEmail.toLowerCase())
    .maybeSingle();
  if (!data?.settings) return null;
  return mergeSettings(data.settings);
}

export function normalizeSettingsForEntitlement(settings, isPremium) {
  if (isPremium || settings.audioQuality !== "high") return settings;
  return { ...settings, audioQuality: "normal" };
}
