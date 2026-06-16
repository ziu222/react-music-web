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
  faMicrophoneLines,
  faCheck,
  faCircleInfo,
  faFileAudio,
  faLink,
  faRotateLeft,
} from "@fortawesome/free-solid-svg-icons";
import { C } from "../../constants/theme";
import { listenerStats } from "../../data/listenerStats";
import { setUserOverride } from "../../lib/user/userOverrides";
import { logAdminAction } from "../../lib/user/auditLog";
import { getRequest, requestMoreInfo, resolveUpgradeRequest, undoRejectUpgradeRequest } from "../../lib/artist/upgradeRequests";
import { grantPremium, revokePremium, getGrantHistory, getActiveGrant, GRANT_DURATIONS } from "../../lib/user/premiumGrants";
import { createNotification, loadNotifications, saveNotifications } from "../../lib/social/notifications";
import { getMediaBlobUrl } from "../../lib/music/mediaStore";

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
  const [upgradeReq, setUpgradeReq] = useState(null);
  const [sampleAudioUrls, setSampleAudioUrls] = useState([]);
  const [adminInfoNote, setAdminInfoNote] = useState("");
  const [adminRejectReason, setAdminRejectReason] = useState("");
  const [upgradeAction, setUpgradeAction] = useState(null); // "info" | "reject" | null
  const [premiumDuration, setPremiumDuration] = useState("1m");
  const grantHistory = getGrantHistory(user?.email ?? "");
  const activeGrant = getActiveGrant(user?.email ?? "");

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
    setUpgradeAction(null);
    setAdminInfoNote("");
    setAdminRejectReason("");
    if (user) {
      const req = getRequest(user.email);
      setUpgradeReq(req);
      if (req?.sampleBlobIds?.length) {
        Promise.all(req.sampleBlobIds.map((id) => getMediaBlobUrl(id))).then(setSampleAudioUrls);
      } else {
        setSampleAudioUrls([]);
      }
    } else {
      setUpgradeReq(null);
      setSampleAudioUrls([]);
    }
  }, [user?.id]);

  useEffect(() => {
    if (!confirmDelete) return undefined;
    const t = setTimeout(() => setConfirmDelete(false), 3000);
    return () => clearTimeout(t);
  }, [confirmDelete]);

  if (!user) return null;

  const isSelf = user.email === currentAdmin?.email;

  const approveUpgrade = () => {
    resolveUpgradeRequest(user.email, true);
    setUserOverride(user.email, { role: "artist" }).catch(() => {});
    logAdminAction(currentAdmin, "approve_artist_signup", user.name, `→ ${upgradeReq?.artistName}`);
    const notif = createNotification("system", "Chúc mừng! Bạn đã trở thành Nghệ sĩ 🎉",
      `Tài khoản Nghệ sĩ "${upgradeReq?.artistName}" đã được kích hoạt. Đăng nhập lại để dùng Melodies Studio.`);
    saveNotifications(user.email, [notif, ...loadNotifications(user.email)]);
    setUpgradeReq(null);
    onChanged();
  };

  const sendInfoRequest = () => {
    if (!adminInfoNote.trim()) return;
    requestMoreInfo(user.email, adminInfoNote.trim());
    logAdminAction(currentAdmin, "request_info_artist_signup", user.name, adminInfoNote.trim());
    const notif = createNotification("system", "Admin cần thêm thông tin",
      `Yêu cầu đăng ký Nghệ sĩ của bạn cần bổ sung: ${adminInfoNote.trim()}`);
    saveNotifications(user.email, [notif, ...loadNotifications(user.email)]);
    setUpgradeReq(getRequest(user.email));
    setUpgradeAction(null);
    setAdminInfoNote("");
  };

  const sendReject = () => {
    if (!adminRejectReason.trim()) return;
    resolveUpgradeRequest(user.email, false, adminRejectReason.trim());
    logAdminAction(currentAdmin, "reject_artist_signup", user.name, adminRejectReason.trim());
    const notif = createNotification("system", "Đơn đăng ký Nghệ sĩ chưa được duyệt",
      `Lý do: ${adminRejectReason.trim()}`);
    saveNotifications(user.email, [notif, ...loadNotifications(user.email)]);
    setUpgradeReq(getRequest(user.email));
    setUpgradeAction(null);
    setAdminRejectReason("");
  };

  const undoRejectArtist = () => {
    undoRejectUpgradeRequest(user.email);
    logAdminAction(currentAdmin, "undo_reject", user.name, "Hoàn tác từ chối đơn artist");
    const notif = createNotification("system", "Đơn đăng ký Nghệ sĩ đang được xét duyệt lại",
      "Đơn của bạn đã được đưa trở lại hàng chờ xét duyệt.");
    saveNotifications(user.email, [notif, ...loadNotifications(user.email)]);
    setUpgradeReq(getRequest(user.email));
  };
  const isPremium = user.plan === "premium";
  const isBanned = user.status === "banned";
  const roleChip = ROLE_CHIPS[user.role] ?? ROLE_CHIPS.listener;
  const stats = listenerStats.find((s) => s.userId === user.id);

  const act = (action, patch, detail) => {
    setUserOverride(user.email, patch).catch(() => {});
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

        {upgradeReq && (upgradeReq.status === "pending" || upgradeReq.status === "info_requested") && (
          <div style={{ padding: "16px 24px 0", borderTop: "1px solid var(--island-border)", marginTop: 16 }}>
            <SectionLabel>Đơn đăng ký Nghệ sĩ</SectionLabel>

            <div style={{ fontSize: 11, color: "var(--island-faint)", marginBottom: 10 }}>
              {upgradeReq.status === "info_requested"
                ? "Đã yêu cầu bổ sung · " + (upgradeReq.listenerReply ? "Đã phản hồi" : "Chờ phản hồi")
                : "Đang chờ xét duyệt"}
            </div>

            {[
              ["Tên nghệ sĩ", upgradeReq.artistName],
              ["Thể loại", upgradeReq.genre],
            ].map(([k, v]) => (
              <div key={k} style={{ display: "flex", gap: 10, fontSize: 12, marginBottom: 6 }}>
                <span style={{ width: 80, flexShrink: 0, color: "var(--island-faint)" }}>{k}</span>
                <span style={{ color: "var(--island-text)", fontWeight: 600 }}>{v}</span>
              </div>
            ))}
            <div style={{ fontSize: 12, color: "var(--island-text)", marginBottom: 10, lineHeight: 1.6,
              padding: "8px 10px", background: "var(--overlay-1)", borderRadius: 6, maxHeight: 80, overflowY: "auto" }}>
              {upgradeReq.bio}
            </div>

            {upgradeReq.status === "info_requested" && upgradeReq.adminNote && (
              <div style={{ fontSize: 11, color: "#f59e0b", marginBottom: 6 }}>
                Câu hỏi của admin: {upgradeReq.adminNote}
              </div>
            )}
            {upgradeReq.listenerReply && (
              <div style={{ fontSize: 11, color: "#34d399", marginBottom: 10 }}>
                Phản hồi: {upgradeReq.listenerReply}
              </div>
            )}

            {sampleAudioUrls.filter(Boolean).map((url, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                <FontAwesomeIcon icon={faFileAudio} style={{ color: C[400], fontSize: 12, flexShrink: 0 }} />
                <audio controls src={url} style={{ flex: 1, height: 28, minWidth: 160 }} />
              </div>
            ))}
            {upgradeReq.sampleLinks?.filter((l) => l.trim()).map((link, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11, marginBottom: 4 }}>
                <FontAwesomeIcon icon={faLink} style={{ color: "var(--island-faint)", fontSize: 10 }} />
                <span style={{ color: C[400], wordBreak: "break-all" }}>{link}</span>
              </div>
            ))}

            {upgradeAction === "info" && (
              <div style={{ marginTop: 10 }}>
                <textarea value={adminInfoNote} onChange={(e) => setAdminInfoNote(e.target.value)}
                  placeholder="Nhập câu hỏi / yêu cầu bổ sung..." rows={2} autoFocus
                  style={{ width: "100%", boxSizing: "border-box", padding: "8px 10px", borderRadius: 6,
                    background: "rgba(252,249,245,0.08)", border: "1.5px solid #f59e0b66",
                    color: "var(--island-text)", fontSize: 12, resize: "none", outline: "none", fontFamily: "inherit" }} />
                <div style={{ display: "flex", gap: 6, marginTop: 6 }}>
                  <button onClick={() => { setUpgradeAction(null); setAdminInfoNote(""); }}
                    style={{ flex: 1, background: "transparent", border: "1px solid var(--island-border)",
                      color: "var(--island-muted)", borderRadius: 9999, padding: "6px 10px", fontSize: 11, fontWeight: 600, cursor: "pointer" }}>
                    Hủy
                  </button>
                  <button onClick={sendInfoRequest} disabled={!adminInfoNote.trim()}
                    style={{ flex: 2, background: "#f59e0b", border: "none", color: "#000",
                      borderRadius: 9999, padding: "6px 10px", fontSize: 11, fontWeight: 700,
                      cursor: adminInfoNote.trim() ? "pointer" : "not-allowed", opacity: adminInfoNote.trim() ? 1 : 0.5 }}>
                    Gửi yêu cầu bổ sung
                  </button>
                </div>
              </div>
            )}

            {upgradeAction === "reject" && (
              <div style={{ marginTop: 10 }}>
                <textarea value={adminRejectReason} onChange={(e) => setAdminRejectReason(e.target.value)}
                  placeholder="Lý do từ chối (bắt buộc)..." rows={2} autoFocus
                  style={{ width: "100%", boxSizing: "border-box", padding: "8px 10px", borderRadius: 6,
                    background: "rgba(252,249,245,0.08)", border: "1.5px solid rgba(239,68,68,0.4)",
                    color: "var(--island-text)", fontSize: 12, resize: "none", outline: "none", fontFamily: "inherit" }} />
                <div style={{ display: "flex", gap: 6, marginTop: 6 }}>
                  <button onClick={() => { setUpgradeAction(null); setAdminRejectReason(""); }}
                    style={{ flex: 1, background: "transparent", border: "1px solid var(--island-border)",
                      color: "var(--island-muted)", borderRadius: 9999, padding: "6px 10px", fontSize: 11, fontWeight: 600, cursor: "pointer" }}>
                    Hủy
                  </button>
                  <button onClick={sendReject} disabled={!adminRejectReason.trim()}
                    style={{ flex: 2, background: "#ef4444", border: "none", color: "#fff",
                      borderRadius: 9999, padding: "6px 10px", fontSize: 11, fontWeight: 700,
                      cursor: adminRejectReason.trim() ? "pointer" : "not-allowed", opacity: adminRejectReason.trim() ? 1 : 0.5 }}>
                    Xác nhận từ chối
                  </button>
                </div>
              </div>
            )}

            {upgradeAction === null && (
              <div style={{ display: "flex", gap: 6, marginTop: 12 }}>
                <button onClick={approveUpgrade}
                  style={{ flex: 1, background: "#34d399", border: "none", color: "#08110d",
                    borderRadius: 9999, padding: "7px 10px", fontSize: 11, fontWeight: 700,
                    cursor: "pointer", display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 4 }}>
                  <FontAwesomeIcon icon={faCheck} style={{ fontSize: 10 }} />
                  Duyệt
                </button>
                <button onClick={() => setUpgradeAction("info")}
                  style={{ flex: 1.4, background: "transparent", border: "1px solid #f59e0b",
                    color: "#f59e0b", borderRadius: 9999, padding: "7px 10px", fontSize: 11,
                    fontWeight: 600, cursor: "pointer", display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 4 }}>
                  <FontAwesomeIcon icon={faCircleInfo} style={{ fontSize: 10 }} />
                  Yêu cầu thêm TT
                </button>
                <button onClick={() => setUpgradeAction("reject")}
                  style={{ flex: 1, background: "transparent", border: "1px solid #ef4444",
                    color: "#ef4444", borderRadius: 9999, padding: "7px 10px", fontSize: 11,
                    fontWeight: 600, cursor: "pointer", display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 4 }}>
                  <FontAwesomeIcon icon={faXmark} style={{ fontSize: 10 }} />
                  Từ chối
                </button>
              </div>
            )}
          </div>
        )}

        {upgradeReq && upgradeReq.status === "rejected" && (
          <div style={{ padding: "16px 24px 0", borderTop: "1px solid var(--island-border)", marginTop: 16 }}>
            <SectionLabel>Đơn đăng ký Nghệ sĩ — Đã từ chối</SectionLabel>
            <div style={{ fontSize: 11, color: "#fb7185", marginBottom: 10 }}>
              Lý do: {upgradeReq.rejectReason ?? "Không rõ"}
            </div>
            {[
              ["Tên nghệ sĩ", upgradeReq.artistName],
              ["Thể loại", upgradeReq.genre],
            ].map(([k, v]) => (
              <div key={k} style={{ display: "flex", gap: 10, fontSize: 12, marginBottom: 6 }}>
                <span style={{ width: 80, flexShrink: 0, color: "var(--island-faint)" }}>{k}</span>
                <span style={{ color: "var(--island-text)", fontWeight: 600 }}>{v}</span>
              </div>
            ))}
            <button
              onClick={undoRejectArtist}
              style={{
                marginTop: 8,
                background: "transparent",
                border: "1px solid var(--island-border)",
                color: "var(--island-muted)",
                borderRadius: 9999,
                padding: "7px 16px",
                fontSize: 12,
                fontWeight: 600,
                cursor: "pointer",
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
              }}
            >
              <FontAwesomeIcon icon={faRotateLeft} style={{ fontSize: 11 }} />
              Hoàn tác từ chối — xét duyệt lại
            </button>
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

          {!isPremium && (
            <div style={{ marginBottom: 8 }}>
              <div style={{ display: "flex", gap: 6, marginBottom: 6, flexWrap: "wrap" }}>
                {GRANT_DURATIONS.map((d) => (
                  <button key={d.key} onClick={() => setPremiumDuration(d.key)} style={{
                    background: premiumDuration === d.key ? "#fbbf24" : "transparent",
                    border: "1px solid #fbbf24",
                    color: premiumDuration === d.key ? "#0a0a08" : "#fbbf24",
                    borderRadius: 9999, padding: "5px 12px", fontSize: 11, fontWeight: 600,
                    cursor: "pointer",
                  }}>{d.label}</button>
                ))}
              </div>
              <button
                onClick={() => {
                  const { expiresAt } = grantPremium(currentAdmin?.email, user.email, premiumDuration);
                  act("change_plan", { plan: "premium" }, "→ premium " + GRANT_DURATIONS.find(d=>d.key===premiumDuration)?.label);
                  void expiresAt;
                }}
                style={{
                  width: "100%", background: "transparent", border: "1px solid #fbbf24",
                  color: "#fbbf24", borderRadius: 9999, padding: "8px 12px", fontSize: 12,
                  fontWeight: 600, cursor: "pointer", display: "inline-flex", alignItems: "center",
                  justifyContent: "center", gap: 6, marginBottom: 0,
                }}
              >
                <FontAwesomeIcon icon={faCrown} style={{ fontSize: 11 }} />
                Nâng lên Premium ({GRANT_DURATIONS.find(d=>d.key===premiumDuration)?.label})
              </button>
            </div>
          )}
          {isPremium && (
            <div style={{ marginBottom: 8 }}>
              <div style={{ fontSize: 11, color: "#fbbf24", marginBottom: 6, display: "flex", alignItems: "center", gap: 6 }}>
                <FontAwesomeIcon icon={faCrown} style={{ fontSize: 10 }} />
                {activeGrant?.expiresAt
                  ? "Hết hạn: " + new Date(activeGrant.expiresAt).toLocaleDateString("vi-VN")
                  : "Premium vĩnh viễn"}
              </div>
              <button
                onClick={() => { revokePremium(currentAdmin?.email, user.email); act("change_plan", { plan: "free" }, "→ free"); }}
                style={{
                  width: "100%", background: "transparent", border: "1px solid #fbbf24",
                  color: "#fbbf24", borderRadius: 9999, padding: "8px 12px", fontSize: 12,
                  fontWeight: 600, cursor: "pointer", display: "inline-flex", alignItems: "center",
                  justifyContent: "center", gap: 6,
                }}
              >
                <FontAwesomeIcon icon={faCrown} style={{ fontSize: 11 }} />
                Hạ xuống Free
              </button>
            </div>
          )}
          {grantHistory.length > 0 && (
            <div style={{ marginBottom: 8 }}>
              <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", color: "var(--island-faint)", marginBottom: 6 }}>
                Lịch sử subscription
              </div>
              {grantHistory.slice(0, 4).map((g) => (
                <div key={g.id} style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "var(--island-muted)", padding: "3px 0", borderBottom: "1px solid var(--island-border)" }}>
                  <span style={{ color: g.plan === "premium" ? "#fbbf24" : "var(--island-faint)" }}>
                    {g.plan === "premium" ? "↑ Premium" : "↓ Free"} · {g.durationLabel}
                  </span>
                  <span>{new Date(g.grantedAt).toLocaleDateString("vi-VN")}</span>
                </div>
              ))}
            </div>
          )}

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
