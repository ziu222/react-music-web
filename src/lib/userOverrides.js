/* ── Admin user overrides storage (frontend-only) ─────────────────
 * Lưu trong localStorage key `melodies_user_overrides`, object map
 * theo email lowercase — đè role/plan/status/banReason/deleted lên
 * seed users mà không sửa src/data/users.js.
 */

import users from "../data/users";

const STORE_KEY = "melodies_user_overrides";

function readStore() {
  try {
    const raw = localStorage.getItem(STORE_KEY);
    const parsed = raw ? JSON.parse(raw) : {};
    return parsed && typeof parsed === "object" && !Array.isArray(parsed) ? parsed : {};
  } catch {
    return {};
  }
}

function saveStore(overrides) {
  try { localStorage.setItem(STORE_KEY, JSON.stringify(overrides)); }
  catch (err) { void err; }
}

export function loadUserOverrides() {
  return readStore();
}

export function applyUserOverride(user) {
  if (!user?.email) return user;
  const override = readStore()[user.email.toLowerCase()];
  return override ? { ...user, ...override } : user;
}

export function setUserOverride(email, patch) {
  const overrides = readStore();
  const key = String(email).toLowerCase();
  overrides[key] = { ...(overrides[key] ?? null), ...patch };
  saveStore(overrides);
  return overrides;
}

export function getAllUsersWithOverrides() {
  return users.map(applyUserOverride);
}
