import { useState } from "react";
import EqBars from "./EqBars";
import { C, R, BG, BORDER } from "../constants/theme";
import { getSongImage } from "../data/media";

export default function Player({ s, playing, prog, onToggle, likedIds, onLike }) {
  const [hovProgress, setHovProgress] = useState(false);
  if (!s) return null;

  const liked = likedIds.has(s.id);
  const cover = getSongImage(s);
  const pct = s.durationSecs > 0 ? (prog / s.durationSecs) * 100 : 0;
  const mins = Math.floor(prog / 60);
  const secs = String(prog % 60).padStart(2, "0");

  const ctrl = (label, size, active) => ({
    background: "none",
    border: "none",
    cursor: "pointer",
    fontSize: size,
    color: active ? C[400] : "rgba(255,255,255,0.55)",
    lineHeight: 1,
    padding: "4px 6px",
    transition: "color 0.12s, transform 0.1s",
    flexShrink: 0,
  });

  return (
    <div
      style={{
        height: 90,
        flexShrink: 0,
        background: BG.el,
        borderTop: `0.5px solid ${BORDER}`,
        display: "grid",
        gridTemplateColumns: "1fr 2fr 1fr",
        alignItems: "center",
        padding: "0 18px",
        gap: 12,
        boxShadow: "0 -4px 24px rgba(0,0,0,0.35)",
      }}
    >
      {/* Left: now playing */}
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <div
          style={{
            width: 56,
            height: 56,
            borderRadius: 6,
            background: s.bg,
            flexShrink: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            overflow: "hidden",
            position: "relative",
            boxShadow: "rgba(0,0,0,0.4) 0px 6px 16px",
          }}
        >
          {cover ? (
            <img
              src={cover}
              alt=""
              style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
            />
          ) : null}
          {playing ? (
            <div
              style={{
                position: cover ? "absolute" : "static",
                inset: 0,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: cover ? "rgba(0,0,0,0.32)" : "transparent",
              }}
            >
              <EqBars size={16} />
            </div>
          ) : !cover ? (
            <span style={{ fontSize: 18, color: "rgba(255,255,255,0.7)" }}>♪</span>
          ) : (
            null
          )}
        </div>
        <div style={{ minWidth: 0, flex: 1 }}>
          <div
            style={{
              fontSize: 13,
              fontWeight: 600,
              color: playing ? C[400] : "#ede5dd",
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
              marginBottom: 2,
            }}
          >
            {s.title}
          </div>
          <div
            style={{
              fontSize: 11,
              color: "rgba(255,255,255,0.5)",
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {s.artist}
          </div>
        </div>
        <button
          onClick={() => onLike(s.id)}
          style={{
            background: "none",
            border: "none",
            cursor: "pointer",
            fontSize: 16,
            color: liked ? R[400] : "rgba(255,255,255,0.2)",
            flexShrink: 0,
            transition: "color 0.15s, transform 0.1s",
            lineHeight: 1,
            padding: "4px",
          }}
          onMouseEnter={e => { e.currentTarget.style.transform = "scale(1.15)"; }}
          onMouseLeave={e => { e.currentTarget.style.transform = "scale(1)"; }}
        >
          {liked ? "♥" : "♡"}
        </button>
      </div>

      {/* Center: controls + progress */}
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
          <button style={ctrl("shuffle", 13, false)}>⇄</button>
          <button
            style={ctrl("prev", 18, false)}
            onMouseEnter={e => { e.currentTarget.style.color = "#fff"; }}
            onMouseLeave={e => { e.currentTarget.style.color = "rgba(255,255,255,0.55)"; }}
          >
            ⏮
          </button>
          <div
            onClick={onToggle}
            style={{
              width: 40,
              height: 40,
              borderRadius: "50%",
              background: "#fff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              fontSize: 14,
              color: "#141010",
              flexShrink: 0,
              margin: "0 6px",
              transition: "transform 0.12s, box-shadow 0.12s",
              boxShadow: "0 2px 12px rgba(0,0,0,0.4)",
            }}
            onMouseEnter={e => {
              e.currentTarget.style.transform = "scale(1.06)";
              e.currentTarget.style.boxShadow = "0 4px 18px rgba(0,0,0,0.5)";
            }}
            onMouseLeave={e => {
              e.currentTarget.style.transform = "scale(1)";
              e.currentTarget.style.boxShadow = "0 2px 12px rgba(0,0,0,0.4)";
            }}
          >
            {playing ? "⏸" : "▶"}
          </div>
          <button
            style={ctrl("next", 18, false)}
            onMouseEnter={e => { e.currentTarget.style.color = "#fff"; }}
            onMouseLeave={e => { e.currentTarget.style.color = "rgba(255,255,255,0.55)"; }}
          >
            ⏭
          </button>
          <button style={ctrl("repeat", 13, false)}>↻</button>
        </div>

        {/* Progress bar */}
        <div
          style={{ display: "flex", alignItems: "center", gap: 6, width: "100%", maxWidth: 360 }}
          onMouseEnter={() => setHovProgress(true)}
          onMouseLeave={() => setHovProgress(false)}
        >
          <span style={{ fontSize: 10, color: "rgba(255,255,255,0.3)", minWidth: 30, textAlign: "right", fontVariantNumeric: "tabular-nums" }}>
            {mins}:{secs}
          </span>
          <div
            style={{
              flex: 1,
              height: hovProgress ? 5 : 4,
              background: "rgba(255,255,255,0.1)",
              borderRadius: 3,
              position: "relative",
              cursor: "pointer",
              transition: "height 0.1s",
            }}
          >
            <div
              style={{
                width: `${pct}%`,
                height: "100%",
                background: hovProgress ? C[400] : C[500],
                borderRadius: 3,
                transition: "width 1s linear, background 0.15s",
              }}
            />
            {hovProgress && (
              <div
                style={{
                  position: "absolute",
                  top: "50%",
                  left: `${pct}%`,
                  transform: "translate(-50%, -50%)",
                  width: 13,
                  height: 13,
                  background: "#fff",
                  borderRadius: "50%",
                  boxShadow: "0 2px 6px rgba(0,0,0,0.4)",
                  transition: "left 1s linear",
                  pointerEvents: "none",
                }}
              />
            )}
          </div>
          <span style={{ fontSize: 10, color: "rgba(255,255,255,0.3)", minWidth: 30, fontVariantNumeric: "tabular-nums" }}>
            {s.duration}
          </span>
        </div>
      </div>

      {/* Right: volume */}
      <div style={{ display: "flex", alignItems: "center", gap: 8, justifyContent: "flex-end" }}>
        <span style={{ fontSize: 13, color: "rgba(255,255,255,0.4)" }}>♪</span>
        <div
          style={{
            width: 80,
            height: 4,
            background: "rgba(255,255,255,0.1)",
            borderRadius: 3,
            cursor: "pointer",
            position: "relative",
          }}
        >
          <div
            style={{
              width: "70%",
              height: "100%",
              background: "rgba(255,255,255,0.6)",
              borderRadius: 3,
            }}
          />
        </div>
      </div>
    </div>
  );
}
