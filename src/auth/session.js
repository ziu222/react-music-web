/* ── Auth/session model ────────────────────────────────────────────
 * Supabase Auth là nguồn sự thật cho identity (JWT, session token).
 * public.users table lưu metadata: role, plan, status, name, color.
 * localStorage cache session để đọc đồng bộ khi mount, Supabase
 * sẽ refresh token ngầm khi cần.
 */

const SESSION_KEY = "melodies_session";
const ENTITLEMENT_KEY = "melodies_entitlements";

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

/* ── Supabase session restore ──
 * Gọi async khi app mount để đồng bộ session từ Supabase về localStorage.
 * Trả về user object nếu có session hợp lệ, null nếu không.
 */
export async function restoreSessionFromSupabase() {
  let supabase;
  try {
    supabase = (await import("../lib/supabase/supabase.js")).supabase;
  } catch { return null; }
  if (!supabase) return null;

  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.user) return null;

  const { data: meta } = await supabase
    .from("users")
    .select("*")
    .eq("id", session.user.id)
    .single();

  if (!meta) return null;

  const user = normalizeUser(applyEntitlement({
    id: session.user.id,
    email: session.user.email,
    name: meta.name,
    initial: meta.initial,
    color: meta.color,
    role: meta.role,
    plan: meta.plan,
    status: meta.status,
    joinedAt: meta.joined_at,
  }));
  saveSession(user);
  return user;
}
