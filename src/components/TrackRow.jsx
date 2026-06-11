import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlay, faPlus, faHeart } from "@fortawesome/free-solid-svg-icons";
import EqBars from "./EqBars";
import { C, R } from "../constants/theme";
import { getSongImage } from "../data/media";

export default function TrackRow({ song, index, cur, likedIds, onPlay, onLike, onAddToQueue }) {
  const [hov, setHov] = useState(false);
  const playing = cur?.id === song.id;
  const liked = likedIds.has(song.id);
  const cover = getSongImage(song);

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
        {playing
          ? <EqBars size={14} />
          : hov
            ? <FontAwesomeIcon icon={faPlay} style={{ fontSize: 10, color: "#fff" }} />
            : index + 1}
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
          overflow: "hidden",
          boxShadow: "rgba(0,0,0,0.3) 0px 4px 10px",
        }}
      >
        {cover ? (
          <img
            src={cover}
            alt=""
            style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
          />
        ) : (
          <span style={{ fontSize: 14, color: "rgba(255,255,255,0.7)", userSelect: "none" }}>♪</span>
        )}
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

      {/* Add to queue */}
      {onAddToQueue && (
        <button
          type="button"
          aria-label={`Add ${song.title} to queue`}
          tabIndex={hov ? 0 : -1}
          onClick={e => { e.stopPropagation(); onAddToQueue(song); }}
          title="Thêm vào hàng đợi"
          style={{
            background: "none",
            border: "none",
            cursor: "pointer",
            fontSize: 13,
            color: "rgba(255,255,255,0.5)",
            padding: "2px 4px",
            lineHeight: 1,
            flexShrink: 0,
            opacity: hov ? 1 : 0,
            pointerEvents: hov ? "auto" : "none",
            transition: "opacity 0.15s, color 0.1s",
          }}
          onMouseEnter={e => { e.currentTarget.style.color = "#fff"; }}
          onMouseLeave={e => { e.currentTarget.style.color = "rgba(255,255,255,0.5)"; }}
        >
          <FontAwesomeIcon icon={faPlus} />
        </button>
      )}

      {/* Like */}
      <button
        type="button"
        aria-label={liked ? `Bỏ thích ${song.title}` : `Thích ${song.title}`}
        title={liked ? "Bỏ thích" : "Thích"}
        tabIndex={liked || hov ? 0 : -1}
        onClick={e => { e.stopPropagation(); onLike(song.id); }}
        style={{
          background: "none",
          border: "none",
          cursor: "pointer",
          fontSize: 13,
          color: liked ? R[400] : "rgba(255,255,255,0.45)",
          padding: "2px 4px",
          transition: "color 0.15s, transform 0.1s, opacity 0.15s",
          lineHeight: 1,
          flexShrink: 0,
          opacity: liked || hov ? 1 : 0,
          pointerEvents: liked || hov ? "auto" : "none",
        }}
        onMouseEnter={e => { e.currentTarget.style.transform = "scale(1.2)"; }}
        onMouseLeave={e => { e.currentTarget.style.transform = "scale(1)"; }}
      >
        <FontAwesomeIcon icon={faHeart} />
      </button>
    </div>
  );
}
