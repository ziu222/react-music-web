import { useMemo, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBullhorn } from "@fortawesome/free-solid-svg-icons";
import { C, BG, TEXT, BORDER } from "../../constants/theme";
import users from "../../data/users";
import {
  loadNotifications,
  saveNotifications,
  createNotification,
  formatNotificationTime,
} from "../../lib/notifications";
import { loadAuditLog, logAdminAction } from "../../lib/auditLog";

const TYPE_OPTIONS = [
  { key: "system", label: "Hệ thống" },
  { key: "premium", label: "Premium" },
  { key: "social", label: "Nghệ sĩ & xã hội" },
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

export default function AdminBroadcast({ authUser }) {
  const [type, setType] = useState("system");
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [sentMsg, setSentMsg] = useState(null);
  const [historyVersion, setHistoryVersion] = useState(0);

  const history = useMemo(
    () => loadAuditLog().filter((e) => e.action === "broadcast").slice(0, 8),
    [historyVersion]
  );

  const canSend = title.trim() && body.trim();

  const send = () => {
    if (!canSend) return;
    const keys = [...new Set(users.map((u) => u.email.toLowerCase())), "guest"];
    keys.forEach((key) => {
      saveNotifications(key, [
        createNotification(type, title.trim(), body.trim()),
        ...loadNotifications(key),
      ]);
    });
    logAdminAction(authUser, "broadcast", title.trim(), keys.length + " người nhận");
    setTitle("");
    setBody("");
    setSentMsg(`Đã gửi thông báo đến ${keys.length} người dùng`);
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
            placeholder="Nội dung gửi đến toàn bộ người dùng..."
            onFocus={(e) => (e.target.style.borderColor = C[500])}
            onBlur={(e) => (e.target.style.borderColor = "var(--border)")}
            style={{ ...inputStyle, minHeight: 90, resize: "vertical", fontFamily: "inherit" }}
          />
        </div>

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
          Gửi đến tất cả người dùng
        </button>

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
