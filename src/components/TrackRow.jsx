import { useState } from "react";
import EqBars from "./EqBars";
import { C, R } from "../constants/theme";

export default function TrackRow({ song, index, cur, likedIds, onPlay, onLike }) {
  const [hov, setHov] = useState(false);
  const playing = cur?.id === song.id;
  const liked = likedIds.has(song.id);

  return (
    <div
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      onClick={() => onPlay(song)}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 10,
        padding: 7,
        borderRadius: 8,
        cursor: "pointer",
        transition: "background 0.15s",
        background: playing ? `${C[500]}14` : hov ? "rgba(255,255,255,0.05)" : "transparent",
      }}
    >
      {/* Index / playing indicator */}
      <span
        style={{
          width: 18,
          textAlign: "center",
          fontSize: 11,
          color: playing ? C[500] : "rgba(255,255,255,0.3)",
          flexShrink: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {playing ? <EqBars size={14} /> : hov ? "▶" : index + 1}
      </span>

      {/* Thumbnail */}
      <div
        style={{
          width: 34,
          height: 34,
          borderRadius: 5,
          background: song.bg,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}
      >
        <span style={{ fontSize: 13, color: "rgba(255,255,255,0.7)" }}>♪</span>
      </div>

      {/* Title + artist */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            fontSize: 12,
            fontWeight: 500,
            color: playing ? C[400] : "#ede5dd",
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {song.title}
        </div>
        <div style={{ fontSize: 10, color: "rgba(255,255,255,0.4)" }}>
          {song.artist} · {song.genre}
        </div>
      </div>

      {/* Duration */}
      <span style={{ fontSize: 10, color: "rgba(255,255,255,0.3)", flexShrink: 0 }}>
        {song.duration}
      </span>

      {/* Like */}
      <button
        onClick={e => { e.stopPropagation(); onLike(song.id); }}
        style={{
          background: "none",
          border: "none",
          cursor: "pointer",
          fontSize: 14,
          color: liked ? R[400] : "rgba(255,255,255,0.2)",
          padding: "2px 3px",
          transition: "color 0.15s",
          lineHeight: 1,
          flexShrink: 0,
        }}
      >
        {liked ? "♥" : "♡"}
      </button>

      {/* More */}
      <button
        onClick={e => e.stopPropagation()}
        style={{
          background: "none",
          border: "none",
          cursor: "pointer",
          fontSize: 13,
          color: "rgba(255,255,255,0.25)",
          padding: "2px 3px",
          letterSpacing: 1,
          lineHeight: 1,
          flexShrink: 0,
        }}
      >
        •••
      </button>
    </div>
  );
}
