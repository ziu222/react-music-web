import { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faXmark,
  faStar,
  faCrown,
  faEye,
  faBan,
  faLockOpen,
  faTrash,
} from "@fortawesome/free-solid-svg-icons";
import { C } from "../constants/theme";
import { listenerStats } from "../data/listenerStats";
import { setUserOverride } from "../lib/userOverrides";
import { logAdminAction } from "../lib/auditLog";

const ROLE_CHIPS = {
  listener: { label: "Listener", color: null },
  artist: { label: "Nghệ sĩ", color: "#a78bfa" },
  admin: { label: "Quản trị viên", color: "#34d399" },
};

const ROLE_OPTIONS = [
  { key: "listener", label: "Listener" },
  { key: "artist", label: "Nghệ sĩ" },
  { key: "admin", label: "Admin" },
];

function formatJoinDate(dateStr) {
  if (!dateStr) return "";
  return new Date(dateStr).toLocaleDateString("vi-VN", { year: "numeric", month: "long" });
}

function Chip({ color, children }) {
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 4,
        borderRadius: 9999,
        padding: "2px 9px",
        fontSize: 11,
        fontWeight: 600,
        color: color ?? "var(--island-faint)",
        background: color ? color + "1f" : "var(--overlay-1)",
        border: "1px solid " + (color ? color + "4d" : "var(--island-border)"),
      }}
    >
      {children}
    </span>
  );
}

function SectionLabel({ children }) {
  return (
    <div
      style={{
        fontSize: 10,
        fontWeight: 700,
        letterSpacing: "0.08em",
        color: "var(--island-faint)",
        marginBottom: 10,
        textTransform: "uppercase",
      }}
    >
      {children}
    </div>
  );
}

export default function UserDetailModal({
  user,
  currentAdmin,
  onClose,
  onChanged,
  onImpersonate,
}) {
  const [banForm, setBanForm] = useState(false);
  const [banReason, setBanReason] = useState("");
  const [confirmDelete, setConfirmDelete] = useState(false);

  useEffect(() => {
    if (!user) return undefined;
    const onKey = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [user, onClose]);

  useEffect(() => {
    setBanForm(false);
    setBanReason("");
    setConfirmDelete(false);
  }, [user?.id]);

  useEffect(() => {
    if (!confirmDelete) return undefined;
    const t = setTimeout(() => setConfirmDelete(false), 3000);
    return () => clearTimeout(t);
  }, [confirmDelete]);

  if (!user) return null;

  const isSelf = user.email === currentAdmin?.email;
  const isPremium = user.plan === "premium";
  const isBanned = user.status === "banned";
  const roleChip = ROLE_CHIPS[user.role] ?? ROLE_CHIPS.listener;
  const stats = listenerStats.find((s) => s.userId === user.id);

  const act = (action, patch, detail) => {
    setUserOverride(user.email, patch);
    logAdminAction(currentAdmin, action, user.name, detail);
    onChanged();
  };

  const dangerBtn = {
    flex: 1,
    background: "transparent",
    border: "1px solid #ef4444",
    color: "#ef4444",
    borderRadius: 9999,
    padding: "8px 12px",
    fontSize: 12,
    fontWeight: 600,
    cursor: "pointer",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  };

  const greenBtn = { ...dangerBtn, border: "1px solid #34d399", color: "#34d399" };

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        background: "var(--scrim)",
        backdropFilter: "blur(12px)",
        zIndex: 300,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        animation: "fadeIn 150ms ease",
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "var(--island-bg)",
          borderRadius: 12,
          maxWidth: 460,
          width: "90%",
          boxShadow: "var(--shadow-modal)",
          overflow: "hidden",
          animation: "authModalIn 200ms cubic-bezier(0.4,0,0.2,1)",
          maxHeight: "90vh",
          overflowY: "auto",
        }}
      >
        <div
          style={{
            background: `linear-gradient(160deg, ${user.color}44 0%, ${user.color}11 60%, transparent 100%)`,
            padding: "28px 24px 20px",
            position: "relative",
          }}
        >
          <button
            onClick={onClose}
            style={{
              position: "absolute",
              top: 12,
              right: 14,
              background: "transparent",
              border: "none",
              color: "var(--island-muted)",
              cursor: "pointer",
              fontSize: 16,
              width: 28,
              height: 28,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              borderRadius: "50%",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = "var(--island-text)";
              e.currentTarget.style.background = "var(--island-hover)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = "var(--island-muted)";
              e.currentTarget.style.background = "transparent";
            }}
          >
            <FontAwesomeIcon icon={faXmark} />
          </button>

          <div style={{ display: "flex", alignItems: "flex-start", gap: 16 }}>
            <div
              style={{
                width: 72,
                height: 72,
                borderRadius: "50%",
                background: user.color,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 26,
                fontWeight: 700,
                color: "#fff",
                flexShrink: 0,
                boxShadow: `0 4px 16px ${user.color}55`,
                opacity: isBanned || user.deleted ? 0.55 : 1,
              }}
            >
              {user.initial}
            </div>

            <div style={{ minWidth: 0, flex: 1 }}>
              <div
                style={{
                  fontSize: 20,
                  fontWeight: 700,
                  color: "var(--island-text)",
                  marginBottom: 4,
                  lineHeight: 1.2,
                }}
              >
                {user.name}
              </div>
              <div
                style={{
                  fontSize: 12,
                  color: "var(--island-muted)",
                  marginBottom: 8,
                  wordBreak: "break-all",
                }}
              >
                {user.email}
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
                <Chip color={roleChip.color}>{roleChip.label}</Chip>
                {isPremium ? (
                  <Chip color="#fbbf24">
                    <FontAwesomeIcon icon={faStar} style={{ fontSize: 9 }} />
                    Premium
                  </Chip>
                ) : (
                  <Chip>Free</Chip>
                )}
                {isBanned && <Chip color="#f87171">Đã khóa</Chip>}
                {user.deleted && <Chip>Đã xóa</Chip>}
                <span style={{ fontSize: 11, color: "var(--island-faint)" }}>
                  Thành viên từ {formatJoinDate(user.joinedAt)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {user.role === "listener" && stats && (
          <div style={{ padding: "16px 24px 0" }}>
            <SectionLabel>Thống kê nghe nhạc</SectionLabel>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              {[
                { value: stats.songsListened.toLocaleString("vi-VN"), label: "Bài đã nghe" },
                { value: `${stats.totalHours.toLocaleString("vi-VN")} giờ`, label: "Thời gian nghe" },
              ].map((s) => (
                <div
                  key={s.label}
                  style={{
                    background: "var(--overlay-1)",
                    border: "1px solid var(--island-border)",
                    borderRadius: 8,
                    padding: "12px 14px",
                  }}
                >
                  <div
                    style={{
                      fontSize: 22,
                      fontWeight: 700,
                      color: "var(--island-text)",
                      lineHeight: 1.2,
                    }}
                  >
                    {s.value}
                  </div>
                  <div style={{ fontSize: 11, color: "var(--island-muted)", marginTop: 3 }}>
                    {s.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div
          style={{
            padding: "16px 24px 22px",
            marginTop: 16,
            borderTop: "1px solid var(--island-border)",
          }}
        >
          <SectionLabel>Quyền quản trị</SectionLabel>

          {isBanned && user.banReason && (
            <div
              style={{
                background: "rgba(239,68,68,0.08)",
                border: "1px solid rgba(239,68,68,0.25)",
                borderRadius: 8,
                padding: "8px 12px",
                fontSize: 12,
                color: "#fb7185",
                marginBottom: 14,
              }}
            >
              Lý do khóa: {user.banReason}
            </div>
          )}

          <div
            style={{
              marginBottom: 14,
              opacity: isSelf ? 0.45 : 1,
              pointerEvents: isSelf ? "none" : "auto",
            }}
          >
            <div style={{ fontSize: 12, fontWeight: 600, color: "var(--island-muted)", marginBottom: 6 }}>
              Vai trò
            </div>
            <div style={{ display: "flex", gap: 6 }}>
              {ROLE_OPTIONS.map((r) => {
                const active = user.role === r.key;
                return (
                  <button
                    key={r.key}
                    onClick={() => {
                      if (active) return;
                      act("change_role", { role: r.key }, "→ " + r.key);
                    }}
                    style={{
                      flex: 1,
                      background: active ? "var(--overlay-2)" : "transparent",
                      border: active ? `1px solid ${C[500]}` : "1px solid var(--island-border)",
                      color: active ? "var(--island-text)" : "var(--island-muted)",
                      borderRadius: 9999,
                      padding: "7px 10px",
                      fontSize: 12,
                      fontWeight: 600,
                      cursor: "pointer",
                      transition: "all 0.15s",
                    }}
                  >
                    {r.label}
                  </button>
                );
              })}
            </div>
          </div>

          <button
            onClick={() =>
              act(
                "change_plan",
                { plan: isPremium ? "free" : "premium" },
                "→ " + (isPremium ? "free" : "premium")
              )
            }
            style={{
              width: "100%",
              background: "transparent",
              border: "1px solid #fbbf24",
              color: "#fbbf24",
              borderRadius: 9999,
              padding: "8px 12px",
              fontSize: 12,
              fontWeight: 600,
              cursor: "pointer",
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 6,
              marginBottom: 8,
            }}
          >
            <FontAwesomeIcon icon={faCrown} style={{ fontSize: 11 }} />
            {isPremium ? "Hạ xuống Free" : "Nâng lên Premium"}
          </button>

          {!isSelf && !isBanned && !user.deleted && user.role !== "admin" && (
            <button
              onClick={() => onImpersonate(user)}
              style={{
                width: "100%",
                background: "transparent",
                border: "1px solid var(--island-border)",
                color: "var(--island-muted)",
                borderRadius: 9999,
                padding: "8px 12px",
                fontSize: 12,
                fontWeight: 600,
                cursor: "pointer",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 6,
                marginBottom: 8,
                transition: "all 0.15s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = "var(--island-text)";
                e.currentTarget.style.borderColor = "var(--island-rail, rgba(255,255,255,0.16))";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = "var(--island-muted)";
                e.currentTarget.style.borderColor = "var(--island-border)";
              }}
            >
              <FontAwesomeIcon icon={faEye} style={{ fontSize: 11 }} />
              Xem với tư cách
            </button>
          )}

          {banForm && (
            <div style={{ marginBottom: 8 }}>
              <textarea
                value={banReason}
                onChange={(e) => setBanReason(e.target.value)}
                placeholder="Nhập lý do khóa (bắt buộc)..."
                autoFocus
                style={{
                  width: "100%",
                  minHeight: 64,
                  background: "rgba(252,249,245,0.08)",
                  border: "1.5px solid rgba(239,68,68,0.4)",
                  borderRadius: 8,
                  padding: 10,
                  color: "var(--island-text)",
                  fontSize: 13,
                  resize: "vertical",
                  outline: "none",
                  boxSizing: "border-box",
                  fontFamily: "inherit",
                  marginBottom: 8,
                }}
              />
              <button
                onClick={() => {
                  const reason = banReason.trim();
                  if (!reason) return;
                  act("ban_user", { status: "banned", banReason: reason }, reason);
                  setBanForm(false);
                  setBanReason("");
                }}
                disabled={!banReason.trim()}
                style={{
                  width: "100%",
                  background: "#ef4444",
                  border: "none",
                  color: "#fff",
                  borderRadius: 9999,
                  padding: "8px 12px",
                  fontSize: 12,
                  fontWeight: 700,
                  cursor: banReason.trim() ? "pointer" : "not-allowed",
                  opacity: banReason.trim() ? 1 : 0.5,
                }}
              >
                Xác nhận khóa tài khoản
              </button>
            </div>
          )}

          <div style={{ display: "flex", gap: 8 }}>
            {isBanned ? (
              <button
                onClick={() => act("unban_user", { status: "active", banReason: null }, "")}
                disabled={isSelf}
                style={{ ...greenBtn, opacity: isSelf ? 0.45 : 1 }}
              >
                <FontAwesomeIcon icon={faLockOpen} style={{ fontSize: 11 }} />
                Mở khóa
              </button>
            ) : (
              <button
                onClick={() => setBanForm((f) => !f)}
                disabled={isSelf || user.role === "admin"}
                style={{
                  ...dangerBtn,
                  opacity: isSelf || user.role === "admin" ? 0.45 : 1,
                  cursor: isSelf || user.role === "admin" ? "not-allowed" : "pointer",
                }}
              >
                <FontAwesomeIcon icon={faBan} style={{ fontSize: 11 }} />
                {banForm ? "Hủy khóa" : "Khóa tài khoản"}
              </button>
            )}

            {user.deleted ? (
              <button
                onClick={() => act("restore_user", { deleted: false }, "")}
                style={greenBtn}
              >
                Khôi phục
              </button>
            ) : (
              <button
                onClick={() => {
                  if (!confirmDelete) {
                    setConfirmDelete(true);
                    return;
                  }
                  act("delete_user", { deleted: true }, "");
                  onClose();
                }}
                disabled={isSelf}
                style={{
                  ...dangerBtn,
                  opacity: isSelf ? 0.45 : 1,
                  cursor: isSelf ? "not-allowed" : "pointer",
                  background: confirmDelete ? "rgba(239,68,68,0.15)" : "transparent",
                }}
              >
                <FontAwesomeIcon icon={faTrash} style={{ fontSize: 11 }} />
                {confirmDelete ? "Xác nhận xóa?" : "Xóa tài khoản"}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
