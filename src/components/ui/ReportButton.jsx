import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFlag } from "@fortawesome/free-solid-svg-icons";
import { loadSession } from "../../auth/session";
import { submitReport, REPORT_REASONS } from "../../lib/social/reports";

/* Nút báo cáo vi phạm cho 1 bài hát — tự quản modal + gọi submitReport.
 * Hiện khi hover row (giống nút like/queue). */
export default function ReportButton({ song, visible }) {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState(REPORT_REASONS[0]);
  const [done, setDone] = useState(false);

  const submit = (e) => {
    e.stopPropagation();
    const user = loadSession();
    submitReport(user?.email || "guest@melodies.local", song, reason);
    setDone(true);
    setTimeout(() => { setOpen(false); setDone(false); }, 1400);
  };

  return (
    <>
      <button
        type="button"
        aria-label={`Báo cáo ${song.title}`}
        title="Báo cáo vi phạm"
        tabIndex={visible ? 0 : -1}
        onClick={(e) => { e.stopPropagation(); setOpen(true); setDone(false); }}
        style={{
          background: "none",
          border: "none",
          cursor: "pointer",
          fontSize: 12,
          color: "var(--text-tertiary)",
          padding: "2px 4px",
          lineHeight: 1,
          flexShrink: 0,
          opacity: visible ? 1 : 0,
          pointerEvents: visible ? "auto" : "none",
          transition: "opacity 0.15s, color 0.1s",
        }}
        onMouseEnter={(e) => { e.currentTarget.style.color = "#fb7185"; }}
        onMouseLeave={(e) => { e.currentTarget.style.color = "var(--text-tertiary)"; }}
      >
        <FontAwesomeIcon icon={faFlag} />
      </button>

      {open && (
        <>
          <div
            onClick={(e) => { e.stopPropagation(); setOpen(false); }}
            style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 1300 }}
          />
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              position: "fixed", top: "50%", left: "50%", transform: "translate(-50%,-50%)",
              width: 340, maxWidth: "92vw", background: "var(--island-menu, #282828)",
              borderRadius: 12, padding: 22, zIndex: 1301, boxShadow: "rgba(0,0,0,0.6) 0 16px 48px",
              boxSizing: "border-box",
            }}
          >
            {done ? (
              <div style={{ textAlign: "center", padding: "12px 0" }}>
                <div style={{ fontSize: 28, color: "#34d399", marginBottom: 8 }}>✓</div>
                <div style={{ fontSize: 14, color: "var(--island-text, #fff)", fontWeight: 600 }}>
                  Đã gửi báo cáo
                </div>
                <div style={{ fontSize: 12, color: "var(--island-muted, #b3b3b3)", marginTop: 4 }}>
                  Cảm ơn bạn — quản trị viên sẽ xem xét.
                </div>
              </div>
            ) : (
              <>
                <div style={{ fontSize: 15, fontWeight: 700, color: "var(--island-text, #fff)", marginBottom: 4 }}>
                  Báo cáo vi phạm
                </div>
                <div style={{ fontSize: 12, color: "var(--island-muted, #b3b3b3)", marginBottom: 14, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                  {song.title} — {song.artist}
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 16 }}>
                  {REPORT_REASONS.map((r) => (
                    <label
                      key={r}
                      style={{
                        display: "flex", alignItems: "center", gap: 10, fontSize: 13,
                        color: "var(--island-text, #fff)", cursor: "pointer", padding: "6px 8px",
                        borderRadius: 8, background: reason === r ? "rgba(255,255,255,0.08)" : "transparent",
                      }}
                    >
                      <input type="radio" name="report-reason" checked={reason === r} onChange={() => setReason(r)} />
                      {r}
                    </label>
                  ))}
                </div>
                <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
                  <button
                    onClick={(e) => { e.stopPropagation(); setOpen(false); }}
                    style={{
                      background: "transparent", border: "1px solid var(--island-border, rgba(255,255,255,0.12))",
                      color: "var(--island-muted, #b3b3b3)", borderRadius: 9999, padding: "8px 16px",
                      fontSize: 13, cursor: "pointer",
                    }}
                  >
                    Hủy
                  </button>
                  <button
                    onClick={submit}
                    style={{
                      background: "#fb7185", border: "none", color: "#fff", borderRadius: 9999,
                      padding: "8px 18px", fontSize: 13, fontWeight: 700, cursor: "pointer",
                    }}
                  >
                    Gửi báo cáo
                  </button>
                </div>
              </>
            )}
          </div>
        </>
      )}
    </>
  );
}
