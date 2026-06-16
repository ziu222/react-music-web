import { useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faXmark, faMusic, faStar } from "@fortawesome/free-solid-svg-icons";
import { listenerStats } from "../data/listenerStats";

function formatJoinDate(dateStr) {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  return d.toLocaleDateString("vi-VN", { year: "numeric", month: "long" });
}

export default function ListenerProfileModal({ user, onClose }) {
  useEffect(() => {
    if (!user) return undefined;
    const onKey = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [user, onClose]);

  if (!user) return null;

  const stats = listenerStats.find(s => s.userId === user.id) ?? {
    songsListened: 0, totalHours: 0, topGenres: [], topArtists: [],
  };
  const isPremium = user.plan === "premium";

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed", inset: 0,
        background: "var(--scrim)",
        backdropFilter: "blur(12px)",
        zIndex: 300,
        display: "flex", alignItems: "center", justifyContent: "center",
        animation: "fadeIn 150ms ease",
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: "var(--island-bg)",
          borderRadius: 12,
          maxWidth: 440, width: "90%",
          boxShadow: "var(--shadow-modal)",
          overflow: "hidden",
          animation: "authModalIn 200ms cubic-bezier(0.4,0,0.2,1)",
          maxHeight: "90vh",
          overflowY: "auto",
        }}
      >
        {/* ── Header with gradient ── */}
        <div style={{
          background: `linear-gradient(160deg, ${user.color}44 0%, ${user.color}11 60%, transparent 100%)`,
          padding: "28px 24px 20px",
          position: "relative",
        }}>
          <button
            onClick={onClose}
            style={{
              position: "absolute", top: 12, right: 14,
              background: "transparent", border: "none",
              color: "var(--island-muted)", cursor: "pointer",
              fontSize: 16, width: 28, height: 28,
              display: "flex", alignItems: "center", justifyContent: "center",
              borderRadius: "50%", transition: "color 0.15s, background 0.15s",
            }}
            onMouseEnter={e => { e.currentTarget.style.color = "var(--island-text)"; e.currentTarget.style.background = "var(--island-hover)"; }}
            onMouseLeave={e => { e.currentTarget.style.color = "var(--island-muted)"; e.currentTarget.style.background = "transparent"; }}
          >
            <FontAwesomeIcon icon={faXmark} />
          </button>

          <div style={{ display: "flex", alignItems: "flex-start", gap: 16 }}>
            {/* Avatar */}
            <div style={{
              width: 72, height: 72, borderRadius: "50%",
              background: user.color,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 26, fontWeight: 700,
              color: "#fff", flexShrink: 0,
              boxShadow: `0 4px 16px ${user.color}55`,
            }}>
              {user.initial}
            </div>

            {/* Info */}
            <div style={{ minWidth: 0, flex: 1 }}>
              <div style={{ fontSize: 20, fontWeight: 700, color: "var(--island-text)", marginBottom: 4, lineHeight: 1.2 }}>
                {user.name}
              </div>
              <div style={{ fontSize: 12, color: "var(--island-muted)", marginBottom: 8, wordBreak: "break-all" }}>
                {user.email}
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                {isPremium && (
                  <span style={{
                    display: "inline-flex", alignItems: "center", gap: 4,
                    background: "rgba(251,191,36,0.15)",
                    border: "1px solid rgba(251,191,36,0.3)",
                    borderRadius: 9999, padding: "2px 9px",
                    fontSize: 11, fontWeight: 600, color: "#fbbf24",
                  }}>
                    <FontAwesomeIcon icon={faStar} style={{ fontSize: 9 }} />
                    Premium
                  </span>
                )}
                {!isPremium && (
                  <span style={{
                    display: "inline-flex", alignItems: "center",
                    background: "var(--overlay-1)", border: "1px solid var(--island-border)",
                    borderRadius: 9999, padding: "2px 9px",
                    fontSize: 11, fontWeight: 500, color: "var(--island-faint)",
                  }}>
                    Free
                  </span>
                )}
                <span style={{ fontSize: 11, color: "var(--island-faint)" }}>
                  Thành viên từ {formatJoinDate(user.joinedAt)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* ── Stats ── */}
        <div style={{ padding: "16px 24px" }}>
          <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.08em", color: "var(--island-faint)", marginBottom: 10, textTransform: "uppercase" }}>
            Thống kê nghe nhạc
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 20 }}>
            {[
              { value: stats.songsListened.toLocaleString("vi-VN"), label: "Bài đã nghe" },
              { value: `${stats.totalHours.toLocaleString("vi-VN")} giờ`, label: "Thời gian nghe" },
            ].map(s => (
              <div key={s.label} style={{
                background: "var(--overlay-1)", border: "1px solid var(--island-border)",
                borderRadius: 8, padding: "12px 14px",
              }}>
                <div style={{ fontSize: 22, fontWeight: 700, color: "var(--island-text)", lineHeight: 1.2 }}>{s.value}</div>
                <div style={{ fontSize: 11, color: "var(--island-muted)", marginTop: 3 }}>{s.label}</div>
              </div>
            ))}
          </div>

          {/* Genres */}
          {stats.topGenres.length > 0 && (
            <div style={{ marginBottom: 18 }}>
              <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.08em", color: "var(--island-faint)", marginBottom: 8, textTransform: "uppercase" }}>
                Thể loại yêu thích
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                {stats.topGenres.map(g => (
                  <span key={g} style={{
                    background: "var(--overlay-1)", border: "1px solid var(--island-border)",
                    borderRadius: 9999, padding: "4px 12px",
                    fontSize: 12, color: "var(--island-muted)",
                  }}>
                    {g}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Artists */}
          {stats.topArtists.length > 0 && (
            <div style={{ marginBottom: 8 }}>
              <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.08em", color: "var(--island-faint)", marginBottom: 8, textTransform: "uppercase" }}>
                Nghệ sĩ yêu thích
              </div>
              <div style={{ display: "flex", flexDirection: "column" }}>
                {stats.topArtists.map((a, i) => (
                  <div key={a} style={{
                    display: "flex", alignItems: "center", gap: 10,
                    padding: "8px 10px", borderRadius: 6,
                    borderTop: i > 0 ? "1px solid var(--island-border)" : "none",
                    transition: "background 0.12s",
                  }}
                    onMouseEnter={e => e.currentTarget.style.background = "var(--island-hover)"}
                    onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                  >
                    <FontAwesomeIcon icon={faMusic} style={{ fontSize: 11, color: "var(--island-faint)", flexShrink: 0 }} />
                    <span style={{ fontSize: 13, color: "var(--island-text)" }}>{a}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
