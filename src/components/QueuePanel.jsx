import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { C } from "../constants/theme";
import { getSongImage } from "../data/media";

export default function QueuePanel({
  isOpen, onClose,
  currentSong,
  upcomingTracks = [],
  onPlayTrack,
  shuffle = false,
  recentTracks = [],
  onPlayRecent,
}) {
  const [tab, setTab] = useState("queue");

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
      aria-modal={isOpen}
      inert={!isOpen ? "" : undefined}
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
        pointerEvents: isOpen ? undefined : "none",
      }}
    >
      {/* Header — tab switcher + close button */}
      <div style={{
        display: "flex", alignItems: "flex-end", justifyContent: "space-between",
        padding: "12px 16px 0",
        borderBottom: "1px solid rgba(255,255,255,0.06)",
        flexShrink: 0,
      }}>
        <div role="tablist" aria-label="Queue sections" style={{ display: "flex", alignItems: "flex-end", gap: 0 }}>
          {[
            { id: "queue", label: "Queue" },
            { id: "recent", label: "Recently played" },
          ].map(({ id, label }) => (
            <button
              key={id}
              type="button"
              role="tab"
              aria-selected={tab === id}
              onClick={() => setTab(id)}
              style={{
                background: "none",
                border: "none",
                borderBottom: tab === id ? "2px solid #f4eee8" : "2px solid transparent",
                cursor: "pointer",
                fontSize: 13,
                fontWeight: 700,
                color: tab === id ? "#f4eee8" : "rgba(255,255,255,0.38)",
                padding: "0 0 10px",
                marginRight: id === "queue" ? 16 : 0,
                transition: "color 120ms ease, border-color 120ms ease",
                outline: "none",
              }}
              onFocus={e => { e.currentTarget.style.outline = `2px solid ${C[400]}`; e.currentTarget.style.outlineOffset = "3px"; }}
              onBlur={e => { e.currentTarget.style.outline = "none"; e.currentTarget.style.outlineOffset = "0"; }}
            >
              {label}
            </button>
          ))}
        </div>

        <button
          type="button"
          aria-label="Close queue"
          onClick={onClose}
          style={{
            background: "transparent", border: "none", cursor: "pointer",
            color: "rgba(255,255,255,0.54)", display: "inline-flex",
            padding: 4, borderRadius: 4,
            transition: "color 80ms ease",
            flexShrink: 0, marginBottom: 10,
          }}
          onMouseEnter={e => { e.currentTarget.style.color = "#fff"; }}
          onMouseLeave={e => { e.currentTarget.style.color = "rgba(255,255,255,0.54)"; }}
        >
          <X size={18} />
        </button>
      </div>

      {/* Body */}
      <div style={{ flex: 1, overflowY: "auto", paddingBottom: 12 }}>
        {tab === "queue" ? (
          <>
            {/* Now Playing */}
            {currentSong && (
              <section style={{ padding: "12px 12px 4px" }}>
                <p style={sectionLabel}>Now Playing</p>
                <QueueRow song={currentSong} isActive />
              </section>
            )}

            {/* Next Up */}
            <section style={{ padding: "12px 12px 4px" }}>
              <p style={sectionLabel}>Next Up</p>
              {upcomingTracks.length === 0 ? (
                shuffle ? (
                  <p style={{ fontSize: 11, color: "rgba(255,255,255,0.28)", textAlign: "center", padding: "16px 8px", fontStyle: "italic", margin: 0 }}>
                    Next cycle will reshuffle
                  </p>
                ) : (
                  <p style={{ fontSize: 13, color: "rgba(255,255,255,0.3)", textAlign: "center", padding: "24px 0", margin: 0 }}>
                    No upcoming tracks
                  </p>
                )
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
          </>
        ) : (
          /* Recently played tab */
          <section style={{ padding: "12px 12px 4px" }}>
            <p style={sectionLabel}>Recent</p>
            {recentTracks.length === 0 ? (
              <p style={{ fontSize: 13, color: "rgba(255,255,255,0.3)", textAlign: "center", padding: "24px 0", margin: 0 }}>
                Nothing played yet
              </p>
            ) : (
              recentTracks.map((song, i) => (
                <QueueRow
                  key={`${song.id}-${i}`}
                  song={song}
                  isActive={song.id === currentSong?.id}
                  onPlay={() => onPlayRecent?.(song)}
                />
              ))
            )}
          </section>
        )}
      </div>
    </div>
  );
}

const sectionLabel = {
  fontSize: 10, fontWeight: 600, color: "rgba(255,255,255,0.38)",
  textTransform: "uppercase", letterSpacing: "0.08em",
  marginBottom: 6, padding: "0 4px", margin: "0 0 6px",
};

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
      onMouseLeave={e => { if (onPlay) e.currentTarget.style.background = isActive ? "rgba(255,255,255,0.06)" : "transparent"; }}
    >
      <div style={{
        width: 40, height: 40, borderRadius: 4, flexShrink: 0,
        background: song.bg, overflow: "hidden",
        display: "flex", alignItems: "center", justifyContent: "center",
      }}>
        {cover && <img src={cover} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />}
      </div>

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

      <span style={{ fontSize: 11, color: "rgba(255,255,255,0.38)", flexShrink: 0, fontVariantNumeric: "tabular-nums" }}>
        {song.duration}
      </span>
    </div>
  );
}
