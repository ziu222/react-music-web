import { useState } from "react";
import EqBars from "./EqBars";
import { C } from "../constants/theme";

export default function Card({ song, cur, onPlay, width }) {
  const [hov, setHov] = useState(false);
  const playing = cur?.id === song.id;

  return (
    <div
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      onClick={() => onPlay(song)}
      style={{
        flexShrink: 0,
        width: width || "100%",
        background: hov ? "rgba(255,255,255,0.07)" : "rgba(255,255,255,0.035)",
        borderRadius: 10,
        padding: 12,
        cursor: "pointer",
        transition: "all 0.2s",
        transform: hov ? "translateY(-2px)" : "none",
      }}
    >
      {/* Art */}
      <div
        style={{
          width: "100%",
          aspectRatio: "1 / 1",
          background: song.bg,
          borderRadius: 6,
          marginBottom: 10,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
        }}
      >
        {hov && (
          <div
            style={{
              position: "absolute",
              bottom: 8,
              right: 8,
              width: 36,
              height: 36,
              borderRadius: "50%",
              background: C[500],
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 14,
              color: "#fff",
              boxShadow: "0 4px 12px rgba(0,0,0,0.4)",
            }}
          >
            ▶
          </div>
        )}
        {!hov && playing && (
          <EqBars size={20} />
        )}
        {!hov && !playing && (
          <span style={{ fontSize: 20, color: "rgba(255,255,255,0.5)" }}>♪</span>
        )}
      </div>

      {/* Title */}
      <div
        style={{
          fontSize: 13,
          fontWeight: 500,
          color: "#ede5dd",
          whiteSpace: "nowrap",
          overflow: "hidden",
          textOverflow: "ellipsis",
          marginBottom: 3,
        }}
      >
        {song.title}
      </div>

      {/* Artist */}
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
  );
}
