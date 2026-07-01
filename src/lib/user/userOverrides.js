/* ── User overrides — public.users là nguồn sự thật duy nhất ──
 * Admin thay đổi role/plan/status/ban/delete → ghi thẳng vào DB.
 * applyUserOverride là no-op vì data đã đến từ Supabase session restore.
 */

import { supabase } from "../supabase/supabase";

export function applyUserOverride(user) {
  return user;
}

export async function setUserOverride(email, patch) {
  const key = String(email).toLowerCase();

  if (supabase) {
    const dbPatch = {};
    if (patch.role      !== undefined) dbPatch.role       = patch.role;
    if (patch.plan      !== undefined) dbPatch.plan       = patch.plan;
    if (patch.status    !== undefined) dbPatch.status     = patch.status;
    if (patch.banReason !== undefined) dbPatch.ban_reason = patch.banReason;
    if (patch.deleted   !== undefined) dbPatch.deleted    = patch.deleted;
    if (patch.verified  !== undefined) dbPatch.verified   = patch.verified;
    if (patch.suspended !== undefined) dbPatch.suspended  = patch.suspended;
    if (patch.adminRole !== undefined) dbPatch.admin_role = patch.adminRole;
    if (patch.name      !== undefined) dbPatch.name       = patch.name;
    if (patch.initial   !== undefined) dbPatch.initial    = patch.initial;
    if (patch.color     !== undefined) dbPatch.color      = patch.color;

    if (Object.keys(dbPatch).length) {
      const { error } = await supabase.from("users").update(dbPatch).eq("email", key);
      if (error) console.error("[setUserOverride] cập nhật users thất bại:", error.message);
    }
  }
}

// Map 1 hàng users (snake_case từ DB / realtime payload) -> shape camelCase dùng ở UI.
export function mapUserRow(r) {
  return {
    id:         r.id,
    email:      r.email,
    name:       r.name,
    initial:    r.initial,
    color:      r.color,
    role:       r.role,
    plan:       r.plan,
    status:     r.status,
    banReason:  r.ban_reason ?? null,
    deleted:    r.deleted ?? false,
    verified:   r.verified ?? false,
    suspended:  r.suspended ?? false,
    adminRole:  r.admin_role ?? null,
    joinedAt:   r.joined_at,
  };
}

export async function getAllUsersWithOverrides() {
  if (!supabase) return [];
  const { data } = await supabase.from("users").select("*").order("joined_at");
  if (!data?.length) return [];
  return data.map(mapUserRow);
}
