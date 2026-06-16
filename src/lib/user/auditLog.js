import { supabase } from "../supabase/supabase";

const STORE_KEY = "melodies_audit_log";
const MAX_ENTRIES = 200;

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
};

let counter = 0;

function readStore() {
  try {
    const raw = localStorage.getItem(STORE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveStore(list) {
  try { localStorage.setItem(STORE_KEY, JSON.stringify(list)); }
  catch { /* quota exceeded — non-critical */ }
}

function pushToSupabase(entry) {
  if (!supabase) return;
  supabase
    .from("admin_logs")
    .insert({
      id:          entry.id,
      time:        entry.time,
      admin_email: entry.adminEmail,
      admin_name:  entry.adminName,
      action:      entry.action,
      target:      entry.target ?? "",
      detail:      entry.detail ?? "",
    })
    .then()
    .catch(() => {});
}

export function loadAuditLog() {
  return readStore();
}

export function logAdminAction(admin, action, target, detail) {
  const entry = {
    id:         "log-" + Date.now() + "-" + counter++,
    time:       Date.now(),
    adminEmail: admin?.email ?? "system",
    adminName:  admin?.name  ?? "Hệ thống",
    action,
    target:     target ?? "",
    detail:     detail ?? "",
  };
  saveStore([entry, ...readStore()].slice(0, MAX_ENTRIES));
  pushToSupabase(entry);
  return entry;
}
