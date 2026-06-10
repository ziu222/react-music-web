import { useEffect } from "react";
import { X } from "lucide-react";
import { C } from "../constants/theme";
import { getSongImage } from "../data/media";

export default function QueuePanel({ isOpen, onClose, currentSong, upcomingTracks = [], onPlayTrack }) {
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [isOpen, onClose]);

  return (
    <div
      role="dialog"
      aria-label="Queue"
      aria-hidden={!isOpen}
      className="player-side-panel"
      style={{
        position: "fixed",
        right: 0,
        top: 60,
        bottom: 90,
        width: 320,
        background: "#121212",
        borderLeft: "1px solid rgba(255,255,255,0.08)",
        zIndex: 100,
        display: "flex",
        flexDirection: "column",
        transform: isOpen ? "translateX(0)" : "translateX(100%)",
        transition: "transform 250ms cubic-bezier(0.4, 0, 0.2, 1)",
        overflow: "hidden",
        boxShadow: isOpen ? "-8px 0 24px rgba(0,0,0,0.36)" : "none",
      }}
    >
      {/* Header */}
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "16px 16px 12px",
        borderBottom: "1px solid rgba(255,255,255,0.06)",
        flexShrink: 0,
      }}>
        <span style={{ fontSize: 14, fontWeight: 700, color: "#f4eee8" }}>Queue</span>
        <button
          type="button"
          aria-label="Close queue"
          onClick={onClose}
          style={{
            background: "transparent", border: "none", cursor: "pointer",
            color: "rgba(255,255,255,0.54)", display: "inline-flex", padding: 4,
            borderRadius: 4, transition: "color 80ms ease",
          }}
          onMouseEnter={e => { e.currentTarget.style.color = "#fff"; }}
          onMouseLeave={e => { e.currentTarget.style.color = "rgba(255,255,255,0.54)"; }}
        >
          <X size={18} />
        </button>
      </div>

      {/* Body */}
      <div style={{ flex: 1, overflowY: "auto", paddingBottom: 12 }}>
        {/* Now Playing */}
        {currentSong && (
          <section style={{ padding: "12px 12px 4px" }}>
            <p style={{ fontSize: 10, fontWeight: 600, color: "rgba(255,255,255,0.38)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 6, padding: "0 4px" }}>
              Now Playing
            </p>
            <QueueRow song={currentSong} isActive />
          </section>
        )}

        {/* Next Up */}
        <section style={{ padding: "12px 12px 4px" }}>
          <p style={{ fontSize: 10, fontWeight: 600, color: "rgba(255,255,255,0.38)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 6, padding: "0 4px" }}>
            Next Up
          </p>
          {upcomingTracks.length === 0 ? (
            <div style={{ fontSize: 13, color: "rgba(255,255,255,0.3)", textAlign: "center", padding: "24px 0" }}>
              No upcoming tracks
            </div>
          ) : (
            upcomingTracks.map((song, i) => (
              <QueueRow
                key={`${song.id}-${i}`}
                song={song}
                onPlay={() => onPlayTrack(song)}
              />
            ))
          )}
        </section>
      </div>
    </div>
  );
}

function QueueRow({ song, isActive = false, onPlay }) {
  const cover = getSongImage(song);
  return (
    <div
      role={onPlay ? "button" : undefined}
      tabIndex={onPlay ? 0 : undefined}
      onClick={onPlay}
      onKeyDown={onPlay ? (e) => { if (e.key === "Enter" || e.key === " ") onPlay(); } : undefined}
      style={{
        display: "flex", alignItems: "center", gap: 10,
        padding: "5px 4px", borderRadius: 6,
        cursor: onPlay ? "pointer" : "default",
        background: isActive ? "rgba(255,255,255,0.06)" : "transparent",
        transition: "background 80ms ease",
      }}
      onMouseEnter={e => { if (onPlay) e.currentTarget.style.background = "rgba(255,255,255,0.08)"; }}
      onMouseLeave={e => { if (onPlay) e.currentTarget.style.background = "transparent"; }}
    >
      {/* Cover */}
      <div style={{
        width: 40, height: 40, borderRadius: 4, flexShrink: 0,
        background: song.bg, overflow: "hidden",
        display: "flex", alignItems: "center", justifyContent: "center",
      }}>
        {cover && <img src={cover} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />}
      </div>

      {/* Meta */}
      <div style={{ minWidth: 0, flex: 1 }}>
        <div style={{
          fontSize: 13, fontWeight: 600,
          color: isActive ? C[400] : "#f4eee8",
          whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
        }}>
          {song.title}
        </div>
        <div style={{ fontSize: 11, color: "rgba(255,255,255,0.5)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
          {song.artist}
        </div>
      </div>

      {/* Duration */}
      <span style={{ fontSize: 11, color: "rgba(255,255,255,0.38)", flexShrink: 0, fontVariantNumeric: "tabular-nums" }}>
        {song.duration}
      </span>
    </div>
  );
}
