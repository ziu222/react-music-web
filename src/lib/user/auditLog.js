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
  toggle_config:     "Đổi cấu hình",
  grant_admin:       "Cấp quyền admin",
  revoke_admin:      "Thu hồi quyền admin",
  takedown_song:     "Gỡ bản quyền (DMCA)",
  restore_takedown:  "Khôi phục bản quyền",
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

/* Lấy thời điểm hoạt động gần nhất của mỗi admin (theo email).
 * Trả về map { [email_lowercase]: maxTimeMs }. Dùng để hiển thị "Hoạt động lần cuối".
 * Vì order time desc nên row đầu tiên gặp mỗi email đã là mới nhất. */
export async function loadAdminLastActive() {
  if (!supabase) return {};
  try {
    const { data, error } = await supabase
      .from("admin_logs")
      .select("admin_email, time")
      .order("time", { ascending: false })
      .limit(500);
    if (error) return {};
    return (data || []).reduce((acc, r) => {
      const email = (r.admin_email || "").toLowerCase();
      if (!email) return acc;
      const t = new Date(r.time).getTime();
      // order desc -> lần đầu gặp email là mới nhất; chỉ set nếu chưa có
      if (acc[email] == null) acc[email] = t;
      return acc;
    }, {});
  } catch {
    return {};
  }
}

/* Chuyển 1 row admin_logs thô (payload.new từ realtime) -> shape giống item của loadAuditLog.
 * Để AdminAudit map row realtime cho đồng nhất với list đã load. */
export function fromRowRealtime(rawRow) {
  return {
    id:         rawRow.id,
    time:       new Date(rawRow.time).getTime(),
    adminEmail: rawRow.admin_email,
    adminName:  rawRow.admin_name,
    action:     rawRow.action,
    target:     rawRow.target ?? "",
    detail:     rawRow.detail ?? "",
  };
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
