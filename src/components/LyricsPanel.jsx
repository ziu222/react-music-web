import { useEffect } from "react";
import { X } from "lucide-react";

export default function LyricsPanel({ isOpen, onClose, currentSong, lyrics = null }) {
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [isOpen, onClose]);

  const hasLyrics = Array.isArray(lyrics) && lyrics.length > 0;

  return (
    <div
      role="dialog"
      aria-label="Lyrics"
      aria-hidden={!isOpen}
      aria-modal={isOpen}
      inert={!isOpen ? "" : undefined}
      className="player-side-panel"
      style={{
        position: "fixed",
        right: 0,
        top: 60,
        bottom: 90,
        width: 320,
        background: "var(--island-bg)",
        borderLeft: "1px solid var(--island-border)",
        zIndex: 100,
        display: "flex",
        flexDirection: "column",
        transform: isOpen ? "translateX(0)" : "translateX(100%)",
        transition: "transform 250ms cubic-bezier(0.4, 0, 0.2, 1)",
        overflow: "hidden",
        boxShadow: isOpen ? "-8px 0 24px rgba(0,0,0,0.36)" : "none",
        pointerEvents: isOpen ? undefined : "none",
      }}
    >
      {/* Header */}
      <div style={{
        display: "flex", alignItems: "flex-start", justifyContent: "space-between",
        padding: "16px 16px 12px",
        borderBottom: "1px solid var(--island-border)",
        flexShrink: 0, gap: 8,
      }}>
        <div style={{ minWidth: 0, flex: 1 }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: "var(--island-text)" }}>Lyrics</div>
          {currentSong && (
            <div style={{ fontSize: 11, color: "var(--island-faint)", marginTop: 2, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
              {currentSong.title} — {currentSong.artist}
            </div>
          )}
        </div>
        <button
          type="button"
          aria-label="Close lyrics"
          onClick={onClose}
          style={{
            background: "transparent", border: "none", cursor: "pointer", flexShrink: 0,
            color: "var(--island-muted)", display: "inline-flex", padding: 4,
            borderRadius: 4, transition: "color 80ms ease",
          }}
          onMouseEnter={e => { e.currentTarget.style.color = "var(--island-text)"; }}
          onMouseLeave={e => { e.currentTarget.style.color = "var(--island-muted)"; }}
        >
          <X size={18} />
        </button>
      </div>

      {/* Content */}
      <div style={{ flex: 1, overflowY: "auto", padding: "0 16px" }}>
        {!hasLyrics ? (
          /* Empty state */
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%", padding: "0 16px", textAlign: "center" }}>
            <div style={{ fontSize: 36, marginBottom: 14, opacity: 0.22, userSelect: "none" }}>♪</div>
            <div style={{ fontSize: 14, fontWeight: 600, color: "var(--island-muted)", marginBottom: 6 }}>
              Lyrics not available
            </div>
            <div style={{ fontSize: 12, color: "var(--island-faint)", lineHeight: 1.5 }}>
              We don't have lyrics for this track yet.
            </div>
          </div>
        ) : (
          /* Lyrics lines — structure ready for synced highlighting */
          <div style={{ padding: "16px 0 24px" }}>
            {lyrics.map((line, i) => (
              <p
                key={i}
                data-time={line.time ?? null}
                style={{
                  fontSize: 16, fontWeight: 500,
                  color: "var(--island-fill)",
                  lineHeight: 1.75, marginBottom: 2,
                  transition: "color 200ms ease, opacity 200ms ease",
                }}
              >
                {typeof line === "string" ? line : line.text}
              </p>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
