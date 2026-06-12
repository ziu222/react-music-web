import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheck, faXmark, faCircleCheck } from "@fortawesome/free-solid-svg-icons";
import { BG, TEXT, BORDER } from "../../constants/theme";
import { reviewSubmission } from "../../lib/submissions";
import { logAdminAction } from "../../lib/auditLog";
import {
  loadNotifications,
  saveNotifications,
  createNotification,
} from "../../lib/notifications";
import { StatusBadge } from "../../components/console/ConsoleUi";

function notifyArtist(sub, approved, reason) {
  const key = sub.artistEmail.toLowerCase();
  const notif = approved
    ? createNotification(
        "system",
        "Bài hát được phê duyệt 🎉",
        `"${sub.title}" đã được duyệt và sẵn sàng phát hành.`
      )
    : createNotification(
        "system",
        "Bài hát bị từ chối",
        `"${sub.title}" — Lý do: ${reason}`
      );
  saveNotifications(key, [notif, ...loadNotifications(key)]);
}

export default function AdminReview({ subs, setSubs, authUser }) {
  const [rejectTarget, setRejectTarget] = useState(null);
  const [rejectReason, setRejectReason] = useState("");

  const pending = subs
    .filter((s) => s.status === "pending")
    .sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt));

  const reviewed = subs
    .filter((s) => s.status !== "pending")
    .sort((a, b) => new Date(b.reviewedAt) - new Date(a.reviewedAt))
    .slice(0, 10);

  const approve = (sub) => {
    setSubs(reviewSubmission(sub.id, "approved"));
    notifyArtist(sub, true);
    logAdminAction(authUser, "approve_song", sub.title, "Nghệ sĩ: " + sub.artistName);
  };

  const confirmReject = () => {
    const reason = rejectReason.trim();
    if (!rejectTarget || !reason) return;
    setSubs(reviewSubmission(rejectTarget.id, "rejected", reason));
    notifyArtist(rejectTarget, false, reason);
    logAdminAction(authUser, "reject_song", rejectTarget.title, reason);
    setRejectTarget(null);
    setRejectReason("");
  };

  return (
    <div>
      <div style={{ fontSize: 14, fontWeight: 700, color: TEXT.mid, marginBottom: 12 }}>
        Hàng chờ duyệt ({pending.length})
      </div>

      {pending.length === 0 && (
        <div
          style={{
            border: "1px dashed " + BORDER,
            borderRadius: 10,
            padding: 32,
            textAlign: "center",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 10,
            marginBottom: 28,
          }}
        >
          <FontAwesomeIcon icon={faCircleCheck} style={{ fontSize: 26, color: "#34d399" }} />
          <div style={{ fontSize: 13, color: TEXT.tertiary }}>
            Không có bài hát nào chờ duyệt
          </div>
        </div>
      )}

      {pending.map((sub) => (
        <div
          key={sub.id}
          style={{
            background: BG.card,
            border: "1px solid " + BORDER,
            borderRadius: 10,
            padding: 16,
            marginBottom: 10,
            display: "flex",
            gap: 14,
            alignItems: "center",
            flexWrap: "wrap",
          }}
        >
          <div
            style={{
              width: 52,
              height: 52,
              borderRadius: 8,
              background: sub.bg,
              flexShrink: 0,
            }}
          />
          <div style={{ flex: 1, minWidth: 180 }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: TEXT.strong }}>
              {sub.title}
            </div>
            <div style={{ fontSize: 12, color: TEXT.secondary, marginTop: 2 }}>
              {sub.artistName} · {sub.album}
            </div>
            <div style={{ fontSize: 11, color: TEXT.tertiary, marginTop: 2 }}>
              {sub.genre} · {sub.duration} · gửi{" "}
              {new Date(sub.submittedAt).toLocaleDateString("vi-VN")}
            </div>
          </div>
          <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
            <button
              onClick={() => approve(sub)}
              onMouseEnter={(e) => (e.currentTarget.style.filter = "brightness(1.1)")}
              onMouseLeave={(e) => (e.currentTarget.style.filter = "none")}
              style={{
                background: "#34d399",
                color: "#08110d",
                fontWeight: 700,
                borderRadius: 9999,
                padding: "8px 18px",
                fontSize: 12,
                border: "none",
                cursor: "pointer",
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                transition: "filter 0.15s",
              }}
            >
              <FontAwesomeIcon icon={faCheck} style={{ fontSize: 11 }} />
              Duyệt
            </button>
            <button
              onClick={() => {
                setRejectTarget(sub);
                setRejectReason("");
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.background = "rgba(239,68,68,0.12)")
              }
              onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
              style={{
                background: "transparent",
                border: "1px solid #ef4444",
                color: "#ef4444",
                borderRadius: 9999,
                padding: "8px 18px",
                fontSize: 12,
                fontWeight: 600,
                cursor: "pointer",
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                transition: "background 0.15s",
              }}
            >
              <FontAwesomeIcon icon={faXmark} style={{ fontSize: 11 }} />
              Từ chối
            </button>
          </div>
        </div>
      ))}

      {reviewed.length > 0 && (
        <>
          <div
            style={{
              fontSize: 14,
              fontWeight: 700,
              color: TEXT.mid,
              margin: "24px 0 12px",
            }}
          >
            Lịch sử duyệt
          </div>
          {reviewed.map((sub) => (
            <div key={sub.id}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  padding: "8px 12px",
                  borderRadius: 8,
                }}
              >
                <div
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: 6,
                    background: sub.bg,
                    flexShrink: 0,
                  }}
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
                    {sub.title}
                  </div>
                  <div style={{ fontSize: 11, color: TEXT.tertiary }}>{sub.artistName}</div>
                </div>
                <StatusBadge status={sub.status} />
                <div
                  style={{
                    fontSize: 11,
                    color: TEXT.tertiary,
                    width: 76,
                    textAlign: "right",
                    flexShrink: 0,
                  }}
                >
                  {sub.reviewedAt
                    ? new Date(sub.reviewedAt).toLocaleDateString("vi-VN")
                    : ""}
                </div>
              </div>
              {sub.status === "rejected" && sub.rejectReason && (
                <div
                  style={{
                    fontSize: 11,
                    color: "#fb7185",
                    marginLeft: 56,
                    marginTop: -4,
                    marginBottom: 6,
                  }}
                >
                  Lý do: {sub.rejectReason}
                </div>
              )}
            </div>
          ))}
        </>
      )}

      {rejectTarget && (
        <>
          <div
            onClick={() => setRejectTarget(null)}
            style={{
              position: "fixed",
              inset: 0,
              background: "rgba(0,0,0,0.45)",
              zIndex: 1100,
            }}
          />
          <div
            style={{
              position: "fixed",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              width: 360,
              maxWidth: "calc(100vw - 48px)",
              background: "var(--island-menu)",
              borderRadius: 10,
              padding: 22,
              zIndex: 1101,
              boxShadow: "var(--shadow-modal)",
              animation: "menuIn 150ms cubic-bezier(0.2,0,0,1) both",
              boxSizing: "border-box",
            }}
          >
            <div
              style={{
                fontSize: 14,
                fontWeight: 700,
                color: "var(--island-text)",
                marginBottom: 12,
              }}
            >
              Từ chối "{rejectTarget.title}"?
            </div>
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="Nhập lý do từ chối (bắt buộc)..."
              autoFocus
              onFocus={(e) => (e.target.style.borderColor = "#ef4444")}
              onBlur={(e) => (e.target.style.borderColor = "var(--border)")}
              style={{
                width: "100%",
                minHeight: 80,
                background: "rgba(252,249,245,0.08)",
                border: "1.5px solid var(--border)",
                borderRadius: 8,
                padding: 10,
                color: "var(--island-text)",
                fontSize: 13,
                resize: "vertical",
                outline: "none",
                boxSizing: "border-box",
                fontFamily: "inherit",
              }}
            />
            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                gap: 8,
                marginTop: 14,
              }}
            >
              <button
                onClick={() => setRejectTarget(null)}
                style={{
                  background: "transparent",
                  border: "1px solid var(--island-border)",
                  color: "var(--island-muted)",
                  borderRadius: 9999,
                  padding: "7px 16px",
                  fontSize: 12,
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                Hủy
              </button>
              <button
                onClick={confirmReject}
                disabled={!rejectReason.trim()}
                style={{
                  background: "#ef4444",
                  border: "none",
                  color: "#fff",
                  borderRadius: 9999,
                  padding: "7px 16px",
                  fontSize: 12,
                  fontWeight: 700,
                  cursor: rejectReason.trim() ? "pointer" : "not-allowed",
                  opacity: rejectReason.trim() ? 1 : 0.5,
                }}
              >
                Xác nhận từ chối
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
