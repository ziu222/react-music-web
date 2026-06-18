/* ── User overrides — dùng Supabase public.users làm nguồn sự thật ──
 * Admin thay đổi role/plan/status/ban/delete → ghi thẳng vào DB.
 * localStorage cache dùng để đọc nhanh khi app mount, Supabase là primary.
 */

import { supabase } from "../supabase/supabase";

const STORE_KEY = "melodies_user_overrides";

function readStore() {
  try {
    const raw = localStorage.getItem(STORE_KEY);
    const parsed = raw ? JSON.parse(raw) : {};
    return parsed && typeof parsed === "object" && !Array.isArray(parsed) ? parsed : {};
  } catch { return {}; }
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

export async function setUserOverride(email, patch) {
  const key = String(email).toLowerCase();

  // Cập nhật localStorage cache
  const overrides = readStore();
  overrides[key] = { ...(overrides[key] ?? {}), ...patch };
  saveStore(overrides);

  // Ghi lên Supabase
  if (supabase) {
    const dbPatch = {};
    if (patch.role      !== undefined) dbPatch.role       = patch.role;
    if (patch.plan      !== undefined) dbPatch.plan       = patch.plan;
    if (patch.status    !== undefined) dbPatch.status     = patch.status;
    if (patch.banReason !== undefined) dbPatch.ban_reason = patch.banReason;
    if (patch.deleted   !== undefined) dbPatch.deleted    = patch.deleted;
    if (patch.verified   !== undefined) dbPatch.verified   = patch.verified;
    if (patch.suspended  !== undefined) dbPatch.suspended  = patch.suspended;

    if (Object.keys(dbPatch).length) {
      // Await để caller biết khi nào write commit → refetch sau đó không bị race
      const { error } = await supabase.from("users").update(dbPatch).eq("email", key);
      if (error) console.error("[setUserOverride] cập nhật users thất bại:", error.message);
    }
  }

  return overrides;
}

export async function getAllUsersWithOverrides() {
  if (supabase) {
    const { data } = await supabase.from("users").select("*").order("joined_at");
    if (data?.length) {
      return data.map(r => ({
        id: r.id,
        email: r.email,
        name: r.name,
        initial: r.initial,
        color: r.color,
        role: r.role,
        plan: r.plan,
        status: r.status,
        banReason: r.ban_reason ?? null,
        deleted: r.deleted ?? false,
        verified: r.verified ?? false,
        suspended: r.suspended ?? false,
        joinedAt: r.joined_at,
      }));
    }
  }
  // Fallback: localStorage overrides only (no base users without Supabase)
  return [];
}
