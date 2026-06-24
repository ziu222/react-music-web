import { useEffect, useMemo, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBullhorn, faClock } from "@fortawesome/free-solid-svg-icons";
import { C, BG, TEXT, BORDER } from "../../constants/theme";
import { FilterPills } from "../../components/console/ConsoleUi";
import {
  loadNotifications,
  saveNotifications,
  createNotification,
  formatNotificationTime,
} from "../../lib/social/notifications";
import { loadAuditLog, logAdminAction } from "../../lib/user/auditLog";

const TYPE_OPTIONS = [
  { key: "system", label: "Hệ thống" },
  { key: "premium", label: "Premium" },
  { key: "social", label: "Nghệ sĩ & xã hội" },
];

// Đối tượng nhận thông báo — match() lọc từ allUsers (đã loại user.deleted ở recipientKeys).
// includeGuest: chỉ segment "Tất cả" mới gửi cho khách (chưa đăng nhập).
const SEGMENTS = [
  { key: "all", label: "Tất cả", includeGuest: true, match: () => true },
  { key: "premium", label: "Premium", match: (u) => u.plan === "premium" },
  { key: "free", label: "Miễn phí", match: (u) => u.plan === "free" },
  { key: "artist", label: "Nghệ sĩ", match: (u) => u.role === "artist" },
  { key: "listener", label: "Người nghe", match: (u) => u.role === "listener" },
];

// Preset điền nhanh tiêu đề + nội dung (vẫn cho sửa sau khi chọn).
const TEMPLATES = [
  {
    label: "Bảo trì hệ thống",
    type: "system",
    title: "Thông báo bảo trì hệ thống",
    message:
      "Melodies sẽ tạm bảo trì để nâng cấp dịch vụ. Trong thời gian này một số tính năng có thể gián đoạn. Cảm ơn bạn đã thông cảm!",
  },
  {
    label: "Ưu đãi Premium",
    type: "premium",
    title: "Ưu đãi Premium đặc biệt",
    message:
      "Nâng cấp Premium ngay hôm nay để nghe nhạc không quảng cáo, chất lượng cao và tải về nghe offline. Ưu đãi có hạn!",
  },
  {
    label: "Tính năng mới",
    type: "system",
    title: "Tính năng mới vừa ra mắt",
    message:
      "Chúng tôi vừa cập nhật những tính năng mới giúp trải nghiệm nghe nhạc của bạn tốt hơn. Khám phá ngay trên Melodies!",
  },
  {
    label: "Chào mừng nghệ sĩ mới",
    type: "social",
    title: "Chào mừng đến với cộng đồng nghệ sĩ Melodies",
    message:
      "Cảm ơn bạn đã trở thành nghệ sĩ trên Melodies. Hãy tải lên tác phẩm đầu tiên và kết nối với người hâm mộ ngay hôm nay!",
  },
];

const inputStyle = {
  background: BG.el,
  border: "1px solid " + BORDER,
  borderRadius: 8,
  padding: "10px 12px",
  fontSize: 13,
  color: "var(--text-primary)",
  outline: "none",
  width: "100%",
  boxSizing: "border-box",
};

export default function AdminBroadcast({ authUser, allUsers = [], can = () => true }) {
  const [type, setType] = useState("system");
  const [segment, setSegment] = useState("all");
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [sentMsg, setSentMsg] = useState(null);
  const [historyVersion, setHistoryVersion] = useState(0);
  const [history, setHistory] = useState([]);
  useEffect(() => {
    loadAuditLog().then(data => setHistory(data.filter(e => e.action === "broadcast").slice(0, 8)));
  }, [historyVersion]);

  const activeSegment = SEGMENTS.find((s) => s.key === segment) ?? SEGMENTS[0];

  // Danh sách key người nhận = email các user khớp segment (loại deleted) + "guest" nếu segment "Tất cả".
  const recipientKeys = useMemo(() => {
    const emails = allUsers
      .filter((u) => !u.deleted && activeSegment.match(u))
      .map((u) => u.email.toLowerCase());
    const keys = [...new Set(emails)];
    if (activeSegment.includeGuest) keys.push("guest");
    return keys;
  }, [allUsers, activeSegment]);

  const canSend = title.trim() && body.trim() && recipientKeys.length > 0;

  const applyTemplate = (tpl) => {
    setType(tpl.type);
    setTitle(tpl.title);
    setBody(tpl.message);
  };

  const send = () => {
    if (!canSend) return;
    recipientKeys.forEach((key) => {
      saveNotifications(key, [
        createNotification(type, title.trim(), body.trim()),
        ...loadNotifications(key),
      ]);
    });
    logAdminAction(
      authUser,
      "broadcast",
      title.trim(),
      `${activeSegment.label} · ${recipientKeys.length} người nhận`,
    );
    setTitle("");
    setBody("");
    setSentMsg(`Đã gửi thông báo tới ${activeSegment.label} (${recipientKeys.length} người)`);
    setHistoryVersion((v) => v + 1);
    setTimeout(() => setSentMsg(null), 2500);
  };

  return (
    <div>
      <div
        style={{
          maxWidth: 560,
          background: BG.card,
          border: "1px solid " + BORDER,
          borderRadius: 12,
          padding: 24,
          display: "flex",
          flexDirection: "column",
          gap: 14,
          marginBottom: 28,
        }}
      >
        {/* Preset điền nhanh */}
        <div>
          <div style={{ fontSize: 12, fontWeight: 600, color: TEXT.mid, marginBottom: 6 }}>
            Mẫu có sẵn
          </div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {TEMPLATES.map((tpl) => (
              <button
                key={tpl.label}
                onClick={() => applyTemplate(tpl)}
                style={{
                  background: "var(--overlay-1)",
                  border: "1px solid " + BORDER,
                  color: TEXT.secondary,
                  borderRadius: 9999,
                  padding: "5px 14px",
                  fontSize: 12,
                  fontWeight: 500,
                  cursor: "pointer",
                  transition: "all 0.15s",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = C[500];
                  e.currentTarget.style.color = TEXT.strong;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = "var(--border)";
                  e.currentTarget.style.color = TEXT.secondary;
                }}
              >
                {tpl.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <div style={{ fontSize: 12, fontWeight: 600, color: TEXT.mid, marginBottom: 6 }}>
            Loại thông báo
          </div>
          <select value={type} onChange={(e) => setType(e.target.value)} style={inputStyle}>
            {TYPE_OPTIONS.map((t) => (
              <option key={t.key} value={t.key}>
                {t.label}
              </option>
            ))}
          </select>
        </div>

        {/* Đối tượng nhận */}
        <div>
          <div style={{ fontSize: 12, fontWeight: 600, color: TEXT.mid, marginBottom: 6 }}>
            Đối tượng nhận
          </div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <FilterPills options={SEGMENTS} active={segment} onSelect={setSegment} />
          </div>
          <div style={{ fontSize: 12, color: C[400], fontWeight: 600, marginTop: 8 }}>
            Gửi tới {recipientKeys.length} người
          </div>
        </div>

        <div>
          <div style={{ fontSize: 12, fontWeight: 600, color: TEXT.mid, marginBottom: 6 }}>
            Tiêu đề *
          </div>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Tiêu đề thông báo..."
            onFocus={(e) => (e.target.style.borderColor = C[500])}
            onBlur={(e) => (e.target.style.borderColor = "var(--border)")}
            style={inputStyle}
          />
        </div>

        <div>
          <div style={{ fontSize: 12, fontWeight: 600, color: TEXT.mid, marginBottom: 6 }}>
            Nội dung *
          </div>
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="Nội dung gửi đến người nhận..."
            onFocus={(e) => (e.target.style.borderColor = C[500])}
            onBlur={(e) => (e.target.style.borderColor = "var(--border)")}
            style={{ ...inputStyle, minHeight: 90, resize: "vertical", fontFamily: "inherit" }}
          />
        </div>

        {can('broadcast.send') && (
          <button
            onClick={send}
            disabled={!canSend}
            style={{
              background: `linear-gradient(90deg, ${C[600]}, ${C[500]})`,
              color: "#fff",
              border: "none",
              borderRadius: 9999,
              padding: 11,
              fontSize: 13,
              fontWeight: 700,
              cursor: canSend ? "pointer" : "not-allowed",
              opacity: canSend ? 1 : 0.5,
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
            }}
          >
            <FontAwesomeIcon icon={faBullhorn} style={{ fontSize: 12 }} />
            Gửi tới {activeSegment.label} ({recipientKeys.length})
          </button>
        )}

        {/* Hẹn giờ gửi — cần cron/edge function để giao thật, tạm khoá */}
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            fontSize: 11,
            color: TEXT.tertiary,
            opacity: 0.7,
          }}
        >
          <FontAwesomeIcon icon={faClock} style={{ fontSize: 11 }} />
          Hẹn giờ gửi tự động: sắp ra mắt
        </div>

        {sentMsg && (
          <div
            style={{
              background: "rgba(52,211,153,0.1)",
              border: "1px solid rgba(52,211,153,0.3)",
              borderRadius: 8,
              padding: "8px 12px",
              fontSize: 12,
              color: "#34d399",
              animation: "fadeIn 200ms ease",
            }}
          >
            {sentMsg}
          </div>
        )}
      </div>

      <div style={{ fontSize: 14, fontWeight: 700, color: TEXT.mid, marginBottom: 12 }}>
        Lịch sử gửi
      </div>
      {history.length === 0 && (
        <div style={{ fontSize: 13, color: TEXT.tertiary }}>Chưa gửi thông báo nào</div>
      )}
      {history.map((e) => (
        <div
          key={e.id}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            padding: "8px 12px",
            borderRadius: 8,
          }}
        >
          <FontAwesomeIcon
            icon={faBullhorn}
            style={{ fontSize: 12, color: C[400], flexShrink: 0 }}
          />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div
              style={{
                fontSize: 13,
                fontWeight: 600,
                color: TEXT.strong,
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {e.target}
            </div>
            <div style={{ fontSize: 11, color: TEXT.tertiary }}>{e.detail}</div>
          </div>
          <div style={{ fontSize: 11, color: TEXT.tertiary, flexShrink: 0 }}>
            {formatNotificationTime(e.time)}
          </div>
        </div>
      ))}
    </div>
  );
}
