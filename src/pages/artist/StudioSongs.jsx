import { C, TEXT } from "../../constants/theme";
import { StatusBadge } from "../../components/console/ConsoleUi";

export default function StudioSongs({ mySubs, onResubmit }) {
  if (!mySubs.length) {
    return (
      <div style={{ padding: 24, textAlign: "center", color: TEXT.tertiary, fontSize: 13 }}>
        Chưa có bài hát nào
      </div>
    );
  }

  const sorted = [...mySubs].sort(
    (a, b) => new Date(b.submittedAt) - new Date(a.submittedAt)
  );

  return (
    <div>
      {sorted.map((sub) => (
        <div key={sub.id}>
          <div
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "var(--overlay-1)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "transparent";
            }}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              padding: "10px 12px",
              borderRadius: 8,
              transition: "background 0.12s",
            }}
          >
            <div
              style={{
                width: 40,
                height: 40,
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
              <div style={{ fontSize: 11, color: TEXT.secondary }}>
                {sub.album} · {sub.genre}
              </div>
            </div>
            <div style={{ width: 50, fontSize: 12, color: TEXT.tertiary, flexShrink: 0 }}>
              {sub.duration}
            </div>
            <div style={{ width: 90, fontSize: 11, color: TEXT.tertiary, flexShrink: 0 }}>
              {new Date(sub.submittedAt).toLocaleDateString("vi-VN")}
            </div>
            <div style={{ width: 92, flexShrink: 0, textAlign: "right" }}>
              <StatusBadge status={sub.status} />
            </div>
          </div>

          {sub.status === "rejected" && sub.rejectReason && (
            <div
              style={{
                marginLeft: 52,
                marginTop: -4,
                marginBottom: 8,
                background: "rgba(239,68,68,0.08)",
                border: "1px solid rgba(239,68,68,0.25)",
                borderRadius: 8,
                padding: "8px 12px",
                fontSize: 12,
                color: "#fb7185",
                display: "flex",
                alignItems: "center",
                gap: 12,
                flexWrap: "wrap",
              }}
            >
              <span style={{ flex: 1, minWidth: 200 }}>Lý do: {sub.rejectReason}</span>
              <button
                onClick={() => onResubmit(sub.id)}
                style={{
                  background: "transparent",
                  border: `1px solid ${C[500]}`,
                  color: C[400],
                  borderRadius: 9999,
                  padding: "4px 14px",
                  fontSize: 11,
                  fontWeight: 600,
                  cursor: "pointer",
                  flexShrink: 0,
                }}
              >
                Gửi lại
              </button>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
