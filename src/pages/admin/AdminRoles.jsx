import { useEffect, useMemo, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFloppyDisk, faLock, faCheck } from "@fortawesome/free-solid-svg-icons";
import { TEXT, BORDER, BG, C } from "../../constants/theme";
import { PERMISSION_GROUPS } from "../../lib/user/permissions";
import { loadAdminRoles, updateRolePermissions } from "../../lib/user/adminRoles";
import { setUserOverride } from "../../lib/user/userOverrides";
import { logAdminAction } from "../../lib/user/auditLog";

/* ── Màn Phân quyền ──
 * (A) Vai trò & quyền: mỗi role 1 card, toggle quyền theo PERMISSION_GROUPS.
 *     - super_admin (isSystem) read-only toàn quyền — cấm sửa is_system.
 *     - role thường: toggle local + nút Lưu gọi updateRolePermissions.
 * (B) Quản trị viên: list user role==='admin', <select> gán admin_role.
 *     - SAFEGUARD: không cho tự đổi quyền chính mình (self-lockout).
 */

const TOTAL_PERMS = PERMISSION_GROUPS.reduce((n, g) => n + g.perms.length, 0);

// So sánh 2 mảng quyền không phụ thuộc thứ tự
function samePerms(a, b) {
  if (a.length !== b.length) return false;
  const setB = new Set(b);
  return a.every((p) => setB.has(p));
}

export default function AdminRoles({ authUser, users = [], can = () => true, onRefresh }) {
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  // Bản nháp quyền theo key role: { [key]: string[] }
  const [draft, setDraft] = useState({});
  const [savingKey, setSavingKey] = useState(null);
  const [savedKey, setSavedKey] = useState(null);

  useEffect(() => {
    let alive = true;
    loadAdminRoles()
      .then((data) => {
        if (!alive) return;
        setRoles(data);
        // Khởi tạo nháp = bản gốc của từng role
        setDraft(Object.fromEntries(data.map((r) => [r.key, r.permissions])));
        setLoading(false);
      })
      .catch(() => { if (alive) setLoading(false); });
    return () => { alive = false; };
  }, []);

  // Danh sách quản trị viên (role === 'admin')
  const admins = useMemo(() => users.filter((u) => u.role === "admin" && !u.deleted), [users]);

  // Bật/tắt 1 quyền trong nháp của 1 role
  const togglePerm = (key, perm) => {
    setDraft((prev) => {
      const cur = prev[key] ?? [];
      const next = cur.includes(perm) ? cur.filter((p) => p !== perm) : [...cur, perm];
      return { ...prev, [key]: next };
    });
  };

  const saveRole = async (role) => {
    const next = draft[role.key] ?? [];
    setSavingKey(role.key);
    const { error } = await updateRolePermissions(role.key, next);
    setSavingKey(null);
    if (error) return; // RLS chặn / lỗi DB — giữ nguyên nháp để thử lại
    logAdminAction(authUser, "edit_role_perms", role.name, next.length + " quyền");
    // Đồng bộ bản gốc trong state để nút Lưu tắt lại
    setRoles((prev) => prev.map((r) => (r.key === role.key ? { ...r, permissions: next } : r)));
    setSavedKey(role.key);
    setTimeout(() => setSavedKey((k) => (k === role.key ? null : k)), 2000);
    onRefresh?.();
  };

  // Đổi sub-role admin cho 1 user
  const changeAdminRole = async (user, newKey) => {
    const value = newKey || null; // option trống → bỏ gán
    await setUserOverride(user.email, { adminRole: value });
    logAdminAction(authUser, "change_admin_role", user.email, value ?? "— Chưa gán —");
    onRefresh?.();
  };

  const sectionTitle = { fontSize: 13, fontWeight: 700, color: TEXT.mid, marginBottom: 14 };

  return (
    <div>
      {/* ── (A) Vai trò & quyền ── */}
      <div style={sectionTitle}>Vai trò & quyền</div>

      {loading && (
        <div style={{ padding: 24, textAlign: "center", color: TEXT.tertiary, fontSize: 13 }}>
          Đang tải vai trò...
        </div>
      )}

      {!loading && roles.length === 0 && (
        <div style={{ padding: 24, textAlign: "center", color: TEXT.tertiary, fontSize: 13 }}>
          Chưa có vai trò nào
        </div>
      )}

      {!loading && roles.map((role) => {
        const current = draft[role.key] ?? [];
        const isAll = current.includes("*");
        const dirty = !role.isSystem && !samePerms(current, role.permissions);
        const saving = savingKey === role.key;
        const saved = savedKey === role.key;
        const count = isAll ? TOTAL_PERMS : current.length;

        return (
          <div
            key={role.key}
            style={{
              background: BG.card,
              border: "1px solid " + BORDER,
              borderRadius: 10,
              padding: 18,
              marginBottom: 16,
            }}
          >
            {/* Header card: tên + badge số quyền + badge hệ thống */}
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14, flexWrap: "wrap" }}>
              <div style={{ fontSize: 15, fontWeight: 700, color: TEXT.strong }}>{role.name}</div>
              <Badge color={C[400]}>{isAll ? "Toàn quyền" : count + " quyền"}</Badge>
              {role.isSystem && (
                <Badge color="#a78bfa">
                  <FontAwesomeIcon icon={faLock} style={{ fontSize: 9, marginRight: 4 }} />
                  Hệ thống
                </Badge>
              )}
            </div>

            {/* Grid toggle quyền theo nhóm */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
                gap: 16,
              }}
            >
              {PERMISSION_GROUPS.map((g) => (
                <div key={g.group}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: TEXT.tertiary, marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.04em" }}>
                    {g.group}
                  </div>
                  {g.perms.map(([permKey, label]) => {
                    const checked = isAll || current.includes(permKey);
                    const disabled = role.isSystem; // super_admin: read-only
                    return (
                      <PermToggle
                        key={permKey}
                        label={label}
                        checked={checked}
                        disabled={disabled}
                        onToggle={() => togglePerm(role.key, permKey)}
                      />
                    );
                  })}
                </div>
              ))}
            </div>

            {/* Nút Lưu — chỉ role thường (isSystem không có nút) */}
            {!role.isSystem && (
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 16 }}>
                <button
                  onClick={() => saveRole(role)}
                  disabled={!dirty || saving}
                  style={{
                    background: dirty && !saving ? "#f97316" : "var(--overlay-1)",
                    border: "none",
                    color: dirty && !saving ? "#fff" : TEXT.tertiary,
                    borderRadius: 9999,
                    padding: "8px 20px",
                    fontSize: 12,
                    fontWeight: 700,
                    cursor: dirty && !saving ? "pointer" : "default",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 6,
                    transition: "all 0.15s",
                  }}
                >
                  <FontAwesomeIcon icon={faFloppyDisk} style={{ fontSize: 11 }} />
                  {saving ? "Đang lưu..." : "Lưu thay đổi"}
                </button>
                {saved && (
                  <span style={{ fontSize: 12, color: "#34d399", display: "inline-flex", alignItems: "center", gap: 5 }}>
                    <FontAwesomeIcon icon={faCheck} style={{ fontSize: 10 }} />
                    Đã lưu
                  </span>
                )}
              </div>
            )}
          </div>
        );
      })}

      {/* ── (B) Quản trị viên ── */}
      <div style={{ ...sectionTitle, marginTop: 28 }}>Quản trị viên ({admins.length})</div>

      {admins.length === 0 && (
        <div style={{ padding: 24, textAlign: "center", color: TEXT.tertiary, fontSize: 13 }}>
          Chưa có quản trị viên nào
        </div>
      )}

      {admins.map((user) => {
        const isSelf =
          !!authUser?.email &&
          String(user.email).toLowerCase() === String(authUser.email).toLowerCase();
        return (
          <div
            key={user.id}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              padding: "10px 14px",
              background: BG.card,
              border: "1px solid " + BORDER,
              borderRadius: 8,
              marginBottom: 8,
            }}
          >
            {/* Avatar initial + color */}
            <div
              style={{
                width: 34,
                height: 34,
                borderRadius: "50%",
                background: user.color || "var(--overlay-2)",
                border: "1px solid " + BORDER,
                color: "#fff",
                fontSize: 12,
                fontWeight: 700,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              {user.initial}
            </div>

            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: TEXT.strong, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                {user.name}
              </div>
              <div style={{ fontSize: 11, color: TEXT.tertiary, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                {user.email}
              </div>
            </div>

            {/* SAFEGUARD self-lockout: không cho tự đổi quyền chính mình */}
            {isSelf ? (
              <span style={{ fontSize: 11, color: TEXT.tertiary, fontStyle: "italic", flexShrink: 0 }}>
                Bạn — không thể tự đổi quyền
              </span>
            ) : (
              <select
                value={user.adminRole ?? ""}
                onChange={(e) => changeAdminRole(user, e.target.value)}
                style={{
                  background: BG.el,
                  border: "1px solid " + BORDER,
                  borderRadius: 6,
                  padding: "6px 10px",
                  color: TEXT.primary,
                  fontSize: 12,
                  outline: "none",
                  cursor: "pointer",
                  flexShrink: 0,
                }}
              >
                <option value="">— Chưa gán —</option>
                {roles.map((r) => (
                  <option key={r.key} value={r.key}>{r.name}</option>
                ))}
              </select>
            )}
          </div>
        );
      })}
    </div>
  );
}

/* Badge nhỏ cạnh tên role */
function Badge({ color, children }) {
  return (
    <span
      style={{
        borderRadius: 9999,
        padding: "2px 9px",
        fontSize: 10,
        fontWeight: 600,
        color,
        background: color + "1f",
        border: "1px solid " + color + "44",
        whiteSpace: "nowrap",
      }}
    >
      {children}
    </span>
  );
}

/* Hàng toggle 1 quyền — checkbox ẩn, ô vuông tự vẽ để khớp style inline */
function PermToggle({ label, checked, disabled, onToggle }) {
  return (
    <label
      style={{
        display: "flex",
        alignItems: "center",
        gap: 8,
        padding: "5px 0",
        cursor: disabled ? "default" : "pointer",
        opacity: disabled && !checked ? 0.5 : 1,
      }}
    >
      <input
        type="checkbox"
        checked={checked}
        disabled={disabled}
        onChange={onToggle}
        style={{ position: "absolute", opacity: 0, width: 0, height: 0 }}
      />
      <span
        style={{
          width: 16,
          height: 16,
          flexShrink: 0,
          borderRadius: 4,
          border: "1px solid " + (checked ? "#f97316" : BORDER),
          background: checked ? "#f97316" : "transparent",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          transition: "all 0.12s",
        }}
      >
        {checked && <FontAwesomeIcon icon={faCheck} style={{ fontSize: 9, color: "#fff" }} />}
      </span>
      <span style={{ fontSize: 12, color: checked ? TEXT.strong : TEXT.secondary }}>{label}</span>
    </label>
  );
}
