import { useState } from "react";
import EqBars from "./EqBars";
import { C } from "../constants/theme";

export default function Card({ song, cur, onPlay }) {
  const [hov, setHov] = useState(false);
  const playing = cur?.id === song.id;

  return (
    <div
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      onClick={() => onPlay(song)}
      style={{
        background: hov ? "rgba(255,255,255,0.07)" : "rgba(255,255,255,0.035)",
        borderRadius: 10,
        padding: 9,
        textAlign: "center",
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
          borderRadius: 7,
          marginBottom: 7,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {hov ? (
          <span style={{ fontSize: 22, color: "#fff" }}>▶</span>
        ) : playing ? (
          <EqBars size={20} />
        ) : (
          <span style={{ fontSize: 20, color: "rgba(255,255,255,0.6)" }}>♪</span>
        )}
      </div>

      {/* Title */}
      <div
        style={{
          fontSize: 11,
          fontWeight: 500,
          color: "#ede5dd",
          whiteSpace: "nowrap",
          overflow: "hidden",
          textOverflow: "ellipsis",
        }}
      >
        {song.title}
      </div>

      {/* Artist */}
      <div
        style={{
          fontSize: 9,
          color: "rgba(255,255,255,0.4)",
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
