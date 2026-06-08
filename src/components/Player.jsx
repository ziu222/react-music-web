import EqBars from "./EqBars";
import { C, R, BG } from "../constants/theme";

export default function Player({ s, playing, prog, onToggle, likedIds, onLike }) {
  if (!s) return null;

  const liked = likedIds.has(s.id);
  const pct = s.durationSecs > 0 ? (prog / s.durationSecs) * 100 : 0;
  const mins = Math.floor(prog / 60);
  const secs = String(prog % 60).padStart(2, "0");

  return (
    <div
      style={{
        background: BG.el,
        borderTop: "0.5px solid rgba(255,255,255,0.06)",
        padding: "9px 18px",
        display: "flex",
        alignItems: "center",
        gap: 14,
        flexShrink: 0,
      }}
    >
      {/* Now playing */}
      <div style={{ display: "flex", alignItems: "center", gap: 9, width: 170, flexShrink: 0 }}>
        <div
          style={{
            width: 38,
            height: 38,
            borderRadius: 5,
            background: s.bg,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          {playing ? (
            <EqBars size={14} />
          ) : (
            <span style={{ fontSize: 14, color: "rgba(255,255,255,0.8)" }}>♪</span>
          )}
        </div>
        <div style={{ minWidth: 0 }}>
          <div
            style={{
              fontSize: 11,
              fontWeight: 500,
              color: playing ? C[400] : "#ede5dd",
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {s.title}
          </div>
          <div style={{ fontSize: 9, color: "rgba(255,255,255,0.4)" }}>{s.artist}</div>
        </div>
        <button
          onClick={() => onLike(s.id)}
          style={{
            background: "none",
            border: "none",
            cursor: "pointer",
            fontSize: 14,
            color: liked ? R[400] : "rgba(255,255,255,0.2)",
            flexShrink: 0,
            transition: "color 0.15s",
            lineHeight: 1,
          }}
        >
          {liked ? "♥" : "♡"}
        </button>
      </div>

      {/* Controls + progress */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 3 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <button style={{ background: "none", border: "none", cursor: "pointer", fontSize: 13, color: C[500], lineHeight: 1 }}>⇄</button>
          <button style={{ background: "none", border: "none", cursor: "pointer", fontSize: 17, color: "rgba(255,255,255,0.65)", lineHeight: 1 }}>⏮</button>
          <div
            onClick={onToggle}
            style={{
              width: 30,
              height: 30,
              borderRadius: "50%",
              background: "#fff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              fontSize: 12,
              color: BG.base,
              flexShrink: 0,
            }}
          >
            {playing ? "⏸" : "▶"}
          </div>
          <button style={{ background: "none", border: "none", cursor: "pointer", fontSize: 17, color: "rgba(255,255,255,0.65)", lineHeight: 1 }}>⏭</button>
          <button style={{ background: "none", border: "none", cursor: "pointer", fontSize: 13, color: "rgba(255,255,255,0.35)", lineHeight: 1 }}>↻</button>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 6, width: "100%", maxWidth: 280 }}>
          <span style={{ fontSize: 9, color: "rgba(255,255,255,0.35)", minWidth: 24, textAlign: "right" }}>
            {mins}:{secs}
          </span>
          <div
            style={{
              flex: 1,
              height: 3,
              background: "rgba(255,255,255,0.08)",
              borderRadius: 2,
              position: "relative",
            }}
          >
            <div
              style={{
                width: `${pct}%`,
                height: "100%",
                background: C[500],
                borderRadius: 2,
                transition: "width 1s linear",
              }}
            />
            <div
              style={{
                position: "absolute",
                top: "50%",
                left: `${pct}%`,
                transform: "translate(-50%, -50%)",
                width: 9,
                height: 9,
                background: "#fff",
                borderRadius: "50%",
                transition: "left 1s linear",
              }}
            />
          </div>
          <span style={{ fontSize: 9, color: "rgba(255,255,255,0.35)", minWidth: 24 }}>
            {s.duration}
          </span>
        </div>
      </div>

      {/* Volume */}
      <div style={{ display: "flex", alignItems: "center", gap: 8, width: 120, justifyContent: "flex-end", flexShrink: 0 }}>
        <span style={{ fontSize: 11, color: "rgba(255,255,255,0.45)" }}>vol</span>
        <div style={{ width: 50, height: 3, background: "rgba(255,255,255,0.08)", borderRadius: 2 }}>
          <div style={{ width: "70%", height: "100%", background: "rgba(255,255,255,0.45)", borderRadius: 2 }} />
        </div>
      </div>
    </div>
  );
}
