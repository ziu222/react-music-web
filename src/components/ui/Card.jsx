import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlay, faPause } from "@fortawesome/free-solid-svg-icons";
import EqBars from "../player/EqBars";
import { C } from "../../constants/theme";
import { getSongImage } from "../../data/media";

export default function Card({ song, cur, onPlay, width }) {
  const [hov, setHov] = useState(false);
  const playing = cur?.id === song.id;
  const cover = getSongImage(song);

  return (
    <div
      role="button"
      tabIndex={0}
      className="discovery-card"
      aria-label={`Phát ${song.title} – ${song.artist}`}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      onClick={() => onPlay(song)}
      onKeyDown={e => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onPlay(song);
        }
      }}
      style={{
        flexShrink: 0,
        width: width || "100%",
        background: hov ? "var(--bg-el)" : "var(--bg-card)",
        border: "1px solid var(--border)",
        borderRadius: 10,
        padding: 14,
        cursor: "pointer",
        transition: "box-shadow 150ms cubic-bezier(0.2, 0, 0, 1), background 150ms cubic-bezier(0.2, 0, 0, 1), transform 200ms cubic-bezier(0.2, 0, 0, 1)",
        boxShadow: hov
          ? "var(--shadow-card-hover), 0 0 0 6px color-mix(in srgb, #f97316 22%, transparent)"
          : "var(--shadow-card)",
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
          boxShadow: "var(--shadow-cover)",
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
          className="card-play-btn"
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
            color: "#fff",
            boxShadow: "0 6px 20px rgba(0,0,0,0.5)",
            opacity: hov || playing ? 1 : 0,
            transform: hov || playing ? "translateY(0) scale(1)" : "translateY(8px) scale(0.85)",
            pointerEvents: "none",
          }}
        >
          <FontAwesomeIcon
            icon={playing ? faPause : faPlay}
            style={{ fontSize: 14, marginLeft: playing ? 0 : 2 }}
          />
        </div>
        {!hov && playing && (
          <div style={{
            position: "absolute",
            top: 8,
            left: 8,
            padding: "5px 7px",
            borderRadius: 6,
            background: "rgba(0,0,0,0.55)",
            backdropFilter: "blur(4px)",
          }}>
            <EqBars size={16} />
          </div>
        )}
        {!cover && !hov && !playing && (
          <span style={{ fontSize: 22, color: "rgba(255,255,255,0.4)", userSelect: "none" }}>♪</span>
        )}
      </div>

      {/* Title — 2 dòng rồi ellipsis */}
      <div
        style={{
          fontSize: 13,
          fontWeight: 600,
          color: playing ? C[400] : "var(--text-primary)",
          display: "-webkit-box",
          WebkitLineClamp: 2,
          WebkitBoxOrient: "vertical",
          overflow: "hidden",
          lineHeight: 1.4,
          minHeight: "calc(13px * 1.4 * 2)",
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
          color: "var(--text-secondary)",
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
