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
        padding: 10,
        cursor: "pointer",
        transition: "all 0.2s",
        transform: hov ? "translateY(-2px)" : "none",
      }}
    >
      <div
        style={{
          width: "100%",
          aspectRatio: "1 / 1",
          background: song.bg,
          borderRadius: 8,
          marginBottom: 8,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {hov ? (
          <div
            style={{
              width: 38,
              height: 38,
              borderRadius: "50%",
              background: C[500],
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 14,
              color: "#fff",
            }}
          >
            ▶
          </div>
        ) : playing ? (
          <EqBars size={20} />
        ) : null}
      </div>

      <div
        style={{
          fontSize: 12,
          fontWeight: 500,
          color: "#ede5dd",
          whiteSpace: "nowrap",
          overflow: "hidden",
          textOverflow: "ellipsis",
        }}
      >
        {song.title}
      </div>
      <div
        style={{
          fontSize: 10,
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
