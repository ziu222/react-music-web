import { useState } from "react";
import EqBars from "./EqBars";
import { C } from "../constants/theme";
import { getSongImage } from "../data/media";

export default function Card({ song, cur, onPlay, width }) {
  const [hov, setHov] = useState(false);
  const playing = cur?.id === song.id;
  const cover = getSongImage(song);

  return (
    <div
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      onClick={() => onPlay(song)}
      style={{
        flexShrink: 0,
        width: width || "100%",
        background: hov ? "#2a1f1f" : "#1d1616",
        borderRadius: 10,
        padding: 14,
        cursor: "pointer",
        transition: "background 0.2s ease, box-shadow 0.2s ease",
        boxShadow: hov ? "rgba(0,0,0,0.4) 0px 8px 20px" : "rgba(0,0,0,0.2) 0px 2px 8px",
        scrollSnapAlign: "start",
      }}
    >
      {/* Art */}
      <div
        style={{
          width: "100%",
          aspectRatio: "1 / 1",
          background: song.bg,
          borderRadius: 7,
          marginBottom: 12,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
          overflow: "hidden",
          boxShadow: "rgba(0,0,0,0.4) 0px 8px 24px",
        }}
      >
        {cover && (
          <img
            src={cover}
            alt=""
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              display: "block",
            }}
          />
        )}
        <div
          style={{
            position: "absolute",
            bottom: 8,
            right: 8,
            width: 44,
            height: 44,
            borderRadius: "50%",
            background: C[500],
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 16,
            color: "#fff",
            boxShadow: "0 6px 20px rgba(0,0,0,0.5)",
            opacity: hov ? 1 : 0,
            transform: hov ? "translateY(0) scale(1)" : "translateY(6px) scale(0.9)",
            transition: "opacity 0.2s ease, transform 0.2s ease",
          }}
        >
          {playing ? "⏸" : "▶"}
        </div>
        {!hov && playing && <EqBars size={20} />}
        {!cover && !hov && !playing && (
          <span style={{ fontSize: 22, color: "rgba(255,255,255,0.4)", userSelect: "none" }}>♪</span>
        )}
      </div>

      {/* Title */}
      <div
        style={{
          fontSize: 13,
          fontWeight: 600,
          color: playing ? C[400] : "#ede5dd",
          whiteSpace: "nowrap",
          overflow: "hidden",
          textOverflow: "ellipsis",
          marginBottom: 4,
          letterSpacing: -0.1,
        }}
      >
        {song.title}
      </div>

      {/* Artist */}
      <div
        style={{
          fontSize: 11,
          color: "rgba(255,255,255,0.5)",
          whiteSpace: "nowrap",
          overflow: "hidden",
          textOverflow: "ellipsis",
          lineHeight: 1.4,
        }}
      >
        {song.artist}
      </div>
    </div>
  );
}
