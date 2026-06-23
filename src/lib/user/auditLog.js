import { supabase } from "../supabase/supabase";

export const ACTION_LABELS = {
  ban_user:     "Khóa tài khoản",
  unban_user:   "Mở khóa",
  change_role:  "Đổi vai trò",
  change_plan:  "Đổi gói",
  delete_user:  "Xóa người dùng",
  restore_user: "Khôi phục người dùng",
  hide_song:    "Gỡ bài hát",
  unhide_song:  "Khôi phục bài hát",
  approve_song: "Duyệt bài hát",
  reject_song:  "Từ chối bài hát",
  undo_reject:  "Hoàn tác từ chối",
  broadcast:    "Thông báo hệ thống",
  impersonate:  "Xem với tư cách",
  change_admin_role: "Đổi sub-role admin",
  edit_role_perms:   "Sửa quyền vai trò",
};

let counter = 0;

function fromRow(r) {
  return {
    id:         r.id,
    time:       new Date(r.time).getTime(),
    adminEmail: r.admin_email,
    adminName:  r.admin_name,
    action:     r.action,
    target:     r.target ?? "",
    detail:     r.detail ?? "",
  };
}

export async function loadAuditLog() {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from("admin_logs")
    .select("*")
    .order("time", { ascending: false })
    .limit(200);
  if (error) return [];
  return (data || []).map(fromRow);
}

export function logAdminAction(admin, action, target, detail) {
  const entry = {
    id:         "log-" + Date.now() + "-" + counter++,
    time:       new Date().toISOString(),
    admin_email: admin?.email ?? "system",
    admin_name:  admin?.name  ?? "Hệ thống",
    action,
    target:     target ?? "",
    detail:     detail ?? "",
  };
  if (supabase) {
    supabase.from("admin_logs").insert(entry).then().catch(() => {});
  }
  return {
    id:         entry.id,
    time:       Date.now(),
    adminEmail: entry.admin_email,
    adminName:  entry.admin_name,
    action:     entry.action,
    target:     entry.target,
    detail:     entry.detail,
  };
}
