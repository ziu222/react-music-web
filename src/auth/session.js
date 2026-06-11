/* ── Frontend-only auth/session model ─────────────────────────────
 * Ba trạng thái người nghe:
 *   - guest:   không có session
 *   - free:    đã đăng nhập, plan "free"
 *   - premium: đã đăng nhập, plan "premium"
 * Session và entitlement (gói theo email) được mock trong localStorage.
 * Role groundwork cho các phase sau: listener | artist | admin.
 */

const SESSION_KEY = "melodies_session";
const ENTITLEMENT_KEY = "melodies_entitlements";
const QUALITY_KEY = "melodies_audio_quality";

export const PLAN_FREE = "free";
export const PLAN_PREMIUM = "premium";

export const ROLE_LISTENER = "listener";
export const ROLE_ARTIST = "artist";
export const ROLE_ADMIN = "admin";

const VALID_ROLES = new Set([ROLE_LISTENER, ROLE_ARTIST, ROLE_ADMIN]);

function readJSON(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function writeJSON(key, value) {
  try { localStorage.setItem(key, JSON.stringify(value)); }
  catch (err) { void err; }
}

/* Chuẩn hóa user từ mọi nguồn (seed data, social, register) về một shape. */
export function normalizeUser(user) {
  if (!user) return null;
  const role = VALID_ROLES.has(user.role) ? user.role : ROLE_LISTENER;
  const plan = user.plan === PLAN_PREMIUM ? PLAN_PREMIUM : PLAN_FREE;
  const normalized = { ...user, role, plan };
  delete normalized.password;
  return normalized;
}

export function isPremiumUser(user) {
  return user?.plan === PLAN_PREMIUM;
}

/* ── Session ── */
export function loadSession() {
  const stored = readJSON(SESSION_KEY, null);
  if (!stored?.email) return null;
  return normalizeUser(applyEntitlement(stored));
}

export function saveSession(user) {
  if (!user) return;
  writeJSON(SESSION_KEY, normalizeUser(user));
}

export function clearSession() {
  try { localStorage.removeItem(SESSION_KEY); }
  catch (err) { void err; }
}

/* ── Entitlements (plan đã mua, key theo email) ── */
function loadEntitlements() {
  const stored = readJSON(ENTITLEMENT_KEY, {});
  return stored && typeof stored === "object" ? stored : {};
}

export function saveEntitlement(email, plan) {
  if (!email) return;
  const entitlements = loadEntitlements();
  entitlements[email.toLowerCase()] = plan;
  writeJSON(ENTITLEMENT_KEY, entitlements);
}

/* Gói đã mua (entitlement) thắng gói mặc định trên user object. */
export function applyEntitlement(user) {
  if (!user?.email) return user;
  const owned = loadEntitlements()[user.email.toLowerCase()];
  return owned === PLAN_PREMIUM ? { ...user, plan: PLAN_PREMIUM } : user;
}

/* ── Audio quality (mock, premium-only) ── */
export function loadAudioQuality() {
  return localStorage.getItem(QUALITY_KEY) === "high" ? "high" : "normal";
}

export function saveAudioQuality(quality) {
  try { localStorage.setItem(QUALITY_KEY, quality === "high" ? "high" : "normal"); }
  catch (err) { void err; }
}
