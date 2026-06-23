import { supabase } from "../supabase/supabase";

/* ── Admin sub-roles — bảng admin_roles là nguồn sự thật ──
 * loadAdminRoles nạp toàn bộ vai trò (kèm permissions) cho màn Phân quyền;
 * updateRolePermissions ghi lại mảng quyền mới. RLS gate has_permission('roles.manage')
 * và chặn sửa is_system ở phía DB nên ở đây chỉ cần gọi an toàn.
 */

export async function loadAdminRoles() {
  if (!supabase) return [];
  try {
    const { data, error } = await supabase
      .from("admin_roles")
      .select("*")
      .order("sort");
    if (error || !data?.length) return [];
    return data.map(r => ({
      key:         r.key,
      name:        r.name,
      permissions: Array.isArray(r.permissions) ? r.permissions : [],
      isSystem:    r.is_system,
      sort:        r.sort,
    }));
  } catch {
    return [];
  }
}

export async function updateRolePermissions(key, permissions) {
  if (!supabase) return { error: new Error("supabase chưa cấu hình") };
  try {
    const { error } = await supabase
      .from("admin_roles")
      .update({ permissions })
      .eq("key", key);
    return { error: error ?? null };
  } catch (error) {
    return { error };
  }
}
