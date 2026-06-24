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
  const normalized = { ...user, role, plan, premiumExpiresAt: user.premiumExpiresAt ?? null };
  delete normalized.password;
  return normalized;
}

export function isPremiumUser(user) {
  if (user?.plan !== PLAN_PREMIUM) return false;
  if (user.premiumExpiresAt && new Date(user.premiumExpiresAt) <= new Date()) return false;
  return true;
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

export function saveEntitlement(email, plan, expiresAt = null) {
  if (!email) return;
  const entitlements = loadEntitlements();
  entitlements[email.toLowerCase()] = { plan, expiresAt };
  writeJSON(ENTITLEMENT_KEY, entitlements);
}

/* Gói đã mua (entitlement) thắng gói mặc định trên user object. */
export function applyEntitlement(user) {
  if (!user?.email) return user;
  const owned = loadEntitlements()[user.email.toLowerCase()];
  if (!owned) return user;
  const plan = typeof owned === 'string' ? owned : (owned.plan ?? owned);
  const expiresAt = (typeof owned === 'object' && owned !== null) ? (owned.expiresAt ?? null) : null;
  if (plan !== PLAN_PREMIUM) return user;
  if (expiresAt && new Date(expiresAt) <= new Date()) return user;
  return { ...user, plan: PLAN_PREMIUM, premiumExpiresAt: expiresAt };
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

  // Grant DB là NGUỒN SỰ THẬT cho Premium (kèm hạn). meta.plan chỉ là bản denormalize
  // phục vụ màn admin. Không grant hợp lệ = free, kể cả khi meta.plan/localStorage nói premium
  // (nếu không, admin thu hồi premium sẽ bị localStorage "hồi sinh" ở lần đăng nhập sau).
  let premiumExpiresAt = null;
  let effectivePlan = meta.plan; // fallback nếu không đọc được grant (lỗi mạng)
  let grantResolved = false;
  try {
    const { getActiveGrant } = await import('../lib/user/premiumGrants.js');
    const grant = await getActiveGrant(session.user.email);
    grantResolved = true;
    if (grant) {
      effectivePlan = PLAN_PREMIUM;
      premiumExpiresAt = grant.expiresAt;
    } else {
      effectivePlan = PLAN_FREE;
    }
  } catch { /* giữ meta.plan làm fallback */ }

  // KHÔNG dùng applyEntitlement ở đây: localStorage chỉ là cache cho loadSession đồng bộ.
  const user = normalizeUser({
    id: session.user.id,
    email: session.user.email,
    name: meta.name,
    initial: meta.initial,
    color: meta.color,
    role: meta.role,
    plan: effectivePlan,
    premiumExpiresAt,
    status: meta.status,
    admin_role: meta.admin_role,
    joinedAt: meta.joined_at,
  });
  // Đồng bộ cache localStorage theo quyết định từ DB để loadSession lần sau khớp.
  if (grantResolved) saveEntitlement(session.user.email, effectivePlan, premiumExpiresAt);
  saveSession(user);
  return user;
}
