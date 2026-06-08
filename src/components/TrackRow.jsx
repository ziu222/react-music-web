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
        gap: 12,
        padding: "8px 10px",
        borderRadius: 6,
        cursor: "pointer",
        transition: "background 0.15s",
        background: playing ? `${C[500]}12` : hov ? "rgba(255,255,255,0.06)" : "transparent",
        userSelect: "none",
      }}
    >
      {/* Index / eq */}
      <span
        style={{
          width: 20,
          textAlign: "center",
          fontSize: 12,
          color: playing ? C[500] : "rgba(255,255,255,0.3)",
          flexShrink: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontVariantNumeric: "tabular-nums",
        }}
      >
        {playing ? <EqBars size={14} /> : hov ? <span style={{ color: "#fff" }}>▶</span> : index + 1}
      </span>

      {/* Thumbnail */}
      <div
        style={{
          width: 40,
          height: 40,
          borderRadius: 5,
          background: song.bg,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
          boxShadow: "rgba(0,0,0,0.3) 0px 4px 10px",
        }}
      >
        <span style={{ fontSize: 14, color: "rgba(255,255,255,0.7)", userSelect: "none" }}>♪</span>
      </div>

      {/* Title + artist */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            fontSize: 13,
            fontWeight: 500,
            color: playing ? C[400] : "#ede5dd",
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
            marginBottom: 2,
          }}
        >
          {song.title}
        </div>
        <div
          style={{
            fontSize: 11,
            color: "rgba(255,255,255,0.45)",
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {song.artist}
        </div>
      </div>

      {/* Genre pill */}
      <span
        style={{
          flexShrink: 0,
          fontSize: 10,
          fontWeight: 500,
          color: "rgba(255,255,255,0.35)",
          background: "rgba(255,255,255,0.05)",
          borderRadius: 9999,
          padding: "2px 8px",
          letterSpacing: 0.2,
          display: hov || playing ? "none" : "block",
        }}
      >
        {song.genre}
      </span>

      {/* Duration */}
      <span
        style={{
          fontSize: 11,
          color: "rgba(255,255,255,0.3)",
          flexShrink: 0,
          minWidth: 28,
          textAlign: "right",
          fontVariantNumeric: "tabular-nums",
        }}
      >
        {song.duration}
      </span>

      {/* Like */}
      <button
        onClick={e => { e.stopPropagation(); onLike(song.id); }}
        style={{
          background: "none",
          border: "none",
          cursor: "pointer",
          fontSize: 15,
          color: liked ? R[400] : "rgba(255,255,255,0)",
          padding: "2px 4px",
          transition: "color 0.15s, transform 0.1s",
          lineHeight: 1,
          flexShrink: 0,
          opacity: liked || hov ? 1 : 0,
        }}
        onMouseEnter={e => { e.currentTarget.style.transform = "scale(1.2)"; }}
        onMouseLeave={e => { e.currentTarget.style.transform = "scale(1)"; }}
      >
        {liked ? "♥" : "♡"}
      </button>
    </div>
  );
}
