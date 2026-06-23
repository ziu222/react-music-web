import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlay, faPause, faPlus } from "@fortawesome/free-solid-svg-icons";
import EqBars from "../player/EqBars";
import ReportButton from "./ReportButton";
import LikeButton from "../primitives/LikeButton";
import { C } from "../../constants/theme";
import { getSongImage } from "../../data/media";

export default function TrackRow({ song, index, cur, playing = false, likedIds, onPlay, onLike, onAddToQueue }) {
  const [hov, setHov] = useState(false);
  const isCurrent = cur?.id === song.id;
  const isPlaying = isCurrent && playing;
  const liked = likedIds.has(song.id);
  const cover = getSongImage(song);

  return (
    <div
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      onClick={() => onPlay(song)}
      aria-label={isPlaying ? `Tạm dừng ${song.title}` : `Phát ${song.title} – ${song.artist}`}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 12,
        padding: "8px 10px",
        borderRadius: 6,
        cursor: "pointer",
        transition: "background 0.15s",
        background: isCurrent ? `${C[500]}12` : hov ? "var(--overlay-1)" : "transparent",
        userSelect: "none",
      }}
    >
      {/* Index / eq */}
      <span
        style={{
          width: 20,
          textAlign: "center",
          fontSize: 12,
          color: isCurrent ? C[500] : "var(--text-tertiary)",
          flexShrink: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontVariantNumeric: "tabular-nums",
        }}
      >
        {hov
          ? <FontAwesomeIcon icon={isPlaying ? faPause : faPlay} style={{ fontSize: 10, color: "var(--text-primary)" }} />
          : isPlaying
            ? <EqBars size={14} />
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
            color: isCurrent ? C[400] : "var(--text-primary)",
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
            color: "var(--text-tertiary)",
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
          color: "var(--text-tertiary)",
          background: "var(--overlay-1)",
          borderRadius: 9999,
          padding: "2px 8px",
          letterSpacing: 0.2,
          display: hov || isCurrent ? "none" : "block",
        }}
      >
        {song.genre}
      </span>

      {/* Duration */}
      <span
        style={{
          fontSize: 11,
          color: "var(--text-tertiary)",
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
            color: "var(--text-secondary)",
            padding: "2px 4px",
            lineHeight: 1,
            flexShrink: 0,
            opacity: hov ? 1 : 0,
            pointerEvents: hov ? "auto" : "none",
            transition: "opacity 0.15s, color 0.1s",
          }}
          onMouseEnter={e => { e.currentTarget.style.color = "var(--text-primary)"; }}
          onMouseLeave={e => { e.currentTarget.style.color = "var(--text-secondary)"; }}
        >
          <FontAwesomeIcon icon={faPlus} />
        </button>
      )}

      {/* Like */}
      <LikeButton liked={liked} visible={hov} onLike={() => onLike(song.id)} />

      {/* Report */}
      <ReportButton song={song} visible={hov} />
    </div>
  );
}
