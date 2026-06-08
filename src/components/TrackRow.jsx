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
        padding: "7px 8px",
        borderRadius: 8,
        cursor: "pointer",
        transition: "background 0.15s",
        background: playing ? `${C[500]}14` : hov ? "rgba(255,255,255,0.05)" : "transparent",
      }}
    >
      <span
        style={{
          width: 20,
          textAlign: "center",
          fontSize: 11,
          color: playing ? C[500] : "rgba(255,255,255,0.3)",
          flexShrink: 0,
        }}
      >
        {playing ? <EqBars size={14} /> : hov ? "▶" : index + 1}
      </span>

      <div
        style={{
          width: 36,
          height: 36,
          borderRadius: 6,
          background: song.bg,
          flexShrink: 0,
        }}
      />

      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            fontSize: 13,
            fontWeight: 500,
            color: playing ? C[400] : "#ede5dd",
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {song.title}
        </div>
        <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)" }}>
          {song.artist} · {song.genre}
        </div>
      </div>

      <span style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", flexShrink: 0 }}>
        {song.duration}
      </span>

      <button
        onClick={e => { e.stopPropagation(); onLike(song.id); }}
        style={{
          background: "none",
          border: "none",
          cursor: "pointer",
          fontSize: 15,
          color: liked ? R[400] : "rgba(255,255,255,0.2)",
          padding: "2px 4px",
          transition: "color 0.15s, transform 0.15s",
          lineHeight: 1,
        }}
      >
        {liked ? "♥" : "♡"}
      </button>

      <button
        onClick={e => e.stopPropagation()}
        style={{
          background: "none",
          border: "none",
          cursor: "pointer",
          fontSize: 13,
          color: "rgba(255,255,255,0.25)",
          padding: "2px 4px",
          letterSpacing: 1,
          lineHeight: 1,
        }}
      >
        •••
      </button>
    </div>
  );
}
