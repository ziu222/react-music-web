import { supabase } from "../supabase/supabase";

/* ── RBAC permissions ──
 * Map hằng số 19 quyền (UPPER_SNAKE → 'dot.string') dùng làm khoá tham chiếu
 * khắp các tab admin. DEFAULT_ROLE_PERMISSIONS là fallback khi fetch DB fail,
 * PHẢI khớp seed bảng admin_roles ở Supabase.
 */
export const PERMISSIONS = {
  DASHBOARD_VIEW:      "dashboard.view",
  SYSTEM_VIEW:         "system.view",
  AUDIT_VIEW:          "audit.view",
  USERS_VIEW:          "users.view",
  USERS_BAN:           "users.ban",
  USERS_GRANT_PREMIUM: "users.grant_premium",
  USERS_VERIFY:        "users.verify",
  USERS_SUSPEND:       "users.suspend",
  REVIEW_APPROVE:      "review.approve",
  CONTENT_EDIT:        "content.edit",
  CONTENT_DELETE:      "content.delete",
  CONTENT_FEATURE:     "content.feature",
  CONTENT_TAKEDOWN:    "content.takedown",
  REPORTS_RESOLVE:     "reports.resolve",
  PROMO_MANAGE:        "promo.manage",
  BROADCAST_SEND:      "broadcast.send",
  ROLES_MANAGE:        "roles.manage",
  ADMINS_MANAGE:       "admins.manage",
  CONFIG_MANAGE:       "config.manage",
};

/* Fallback khi fetch admin_roles fail — khớp seed Supabase Step 1. */
export const DEFAULT_ROLE_PERMISSIONS = {
  super_admin: ["*"],
  admin_ba: ["dashboard.view", "system.view", "audit.view"],
  admin_hr: [
    "dashboard.view",
    "users.view",
    "users.ban",
    "users.grant_premium",
    "users.verify",
    "users.suspend",
    "admins.manage",
  ],
  admin_content: [
    "dashboard.view",
    "review.approve",
    "content.edit",
    "content.delete",
    "content.feature",
    "content.takedown",
    "reports.resolve",
  ],
  admin_marketing: ["dashboard.view", "promo.manage", "broadcast.send"],
};

/* PERMISSION_GROUPS — catalog hiển thị, gom quyền theo nhóm để render toggle
 * ở màn Phân quyền. Mỗi perm là cặp [key, nhãn tiếng Việt]. */
export const PERMISSION_GROUPS = [
  {
    group: "Tổng quan",
    perms: [
      ["dashboard.view", "Xem dashboard"],
      ["system.view", "Xem sức khỏe hệ thống"],
      ["audit.view", "Xem nhật ký"],
    ],
  },
  {
    group: "Người dùng",
    perms: [
      ["users.view", "Xem người dùng"],
      ["users.ban", "Khóa/mở tài khoản"],
      ["users.grant_premium", "Cấp/thu hồi Premium"],
      ["users.verify", "Xác minh nghệ sĩ"],
      ["users.suspend", "Tạm dừng nghệ sĩ"],
      ["admins.manage", "Quản lý đội admin"],
    ],
  },
  {
    group: "Nội dung",
    perms: [
      ["review.approve", "Duyệt bài hát"],
      ["content.edit", "Sửa metadata"],
      ["content.delete", "Gỡ/xóa bài"],
      ["content.feature", "Feature bài"],
      ["content.takedown", "Gỡ bản quyền (DMCA)"],
      ["reports.resolve", "Xử lý báo cáo"],
    ],
  },
  {
    group: "Marketing",
    perms: [
      ["promo.manage", "Quản lý mã KM"],
      ["broadcast.send", "Gửi thông báo"],
    ],
  },
  {
    group: "Hệ thống",
    perms: [
      ["roles.manage", "Phân quyền admin"],
      ["config.manage", "Cấu hình hệ thống"],
    ],
  },
];

/* can(permissions, perm) → true nếu mảng chứa '*' hoặc chứa đúng perm.
 * An toàn với null/undefined: trả false khi permissions rỗng. */
export function can(permissions, perm) {
  if (!Array.isArray(permissions) || permissions.length === 0) return false;
  if (permissions.includes("*")) return true;
  if (!perm) return false;
  return permissions.includes(perm);
}

/* Nạp danh sách quyền theo admin_role: super_admin → ['*'];
 * còn lại fetch admin_roles, lỗi/null → fallback DEFAULT_ROLE_PERMISSIONS. */
export async function loadRolePermissions(adminRole) {
  if (!adminRole) return [];
  if (adminRole === "super_admin") return ["*"];

  const fallback = DEFAULT_ROLE_PERMISSIONS[adminRole] ?? [];
  try {
    if (!supabase) return fallback;
    const { data, error } = await supabase
      .from("admin_roles")
      .select("permissions")
      .eq("key", adminRole)
      .single();
    if (error || !data?.permissions) return fallback;
    return Array.isArray(data.permissions) ? data.permissions : fallback;
  } catch {
    return fallback;
  }
}
