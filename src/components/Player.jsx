import { useState, useRef } from "react";
import {
  Heart,
  ListMusic,
  Maximize2,
  Mic2,
  MonitorSpeaker,
  Music,
  Pause,
  Play,
  Repeat,
  Repeat1,
  Shuffle,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
} from "lucide-react";
import EqBars from "./EqBars";
import { C, R } from "../constants/theme";
import { getSongImage } from "../data/media";

export default function Player({
  s,
  playing,
  prog,
  volume,
  muted,
  shuffle,
  repeatMode,
  onToggle,
  onPrevious,
  onNext,
  onSeek,
  onVolumeChange,
  onMuteToggle,
  onShuffleToggle,
  onRepeatCycle,
  likedIds,
  onLike,
}) {
  const [hovProgress, setHovProgress] = useState(false);
  const [hovVolume, setHovVolume] = useState(false);
  const [pressedBtn, setPressedBtn] = useState(null);
  const pressTimerRef = useRef(null);

  if (!s) return null;

  const liked = likedIds.has(s.id);
  const cover = getSongImage(s);
  const pct = s.durationSecs > 0 ? Math.min(100, Math.max(0, (prog / s.durationSecs) * 100)) : 0;
  const volPct = muted ? 0 : Math.round(volume * 100);
  const mins = Math.floor(prog / 60);
  const secs = String(prog % 60).padStart(2, "0");

  const seekFromEvent = (event) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const ratio = Math.min(1, Math.max(0, (event.clientX - rect.left) / rect.width));
    onSeek(Math.round(ratio * s.durationSecs));
  };

  const volumeFromEvent = (event) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const ratio = Math.min(1, Math.max(0, (event.clientX - rect.left) / rect.width));
    onVolumeChange(Number(ratio.toFixed(2)));
  };

  const pressAnim = (id, callback) => {
    clearTimeout(pressTimerRef.current);
    setPressedBtn(id);
    callback?.();
    pressTimerRef.current = setTimeout(() => setPressedBtn(null), 180);
  };

  const btnClass = (id, extraClass = "") => {
    const parts = [];
    if (pressedBtn === id) parts.push("player-btn-press");
    if (extraClass) parts.push(extraClass);
    return parts.join(" ") || undefined;
  };

  const iconButton = (active = false) => ({
    width: 32,
    height: 32,
    borderRadius: 999,
    border: "none",
    background: "transparent",
    color: active ? C[400] : "rgba(255,255,255,0.64)",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    flexShrink: 0,
    transition: "background 0.14s ease, color 0.14s ease",
  });

  const hoverOn = (event, active = false) => {
    event.currentTarget.style.background = "rgba(255,255,255,0.08)";
    event.currentTarget.style.color = active ? C[400] : "#fff";
  };

  const hoverOff = (event, active = false) => {
    event.currentTarget.style.background = "transparent";
    event.currentTarget.style.color = active ? C[400] : "rgba(255,255,255,0.64)";
  };

  return (
    <div
      className="player-bar"
      style={{
        minHeight: 90,
        flexShrink: 0,
        background: "#181818",
        borderTop: "1px solid rgba(255,255,255,0.08)",
        display: "grid",
        gridTemplateColumns: "minmax(230px, 1fr) minmax(360px, 1.45fr) minmax(220px, 1fr)",
        alignItems: "center",
        padding: "10px 18px",
        gap: 14,
        boxShadow: "0 -10px 28px rgba(0,0,0,0.32)",
      }}
    >
      {/* Now playing */}
      <div className="player-now" style={{ display: "flex", alignItems: "center", gap: 12, minWidth: 0 }}>
        <div
          style={{
            width: 56,
            height: 56,
            borderRadius: 8,
            background: s.bg,
            flexShrink: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            overflow: "hidden",
            position: "relative",
            boxShadow: "0 8px 22px rgba(0,0,0,0.38)",
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
                background: cover ? "rgba(0,0,0,0.34)" : "transparent",
              }}
            >
              <EqBars size={16} />
            </div>
          ) : !cover ? (
            <Music size={18} color="rgba(255,255,255,0.7)" />
          ) : null}
        </div>

        <div style={{ minWidth: 0, flex: 1 }}>
          <div
            style={{
              fontSize: 13,
              fontWeight: 700,
              color: "#f4eee8",
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
              marginBottom: 3,
            }}
          >
            {s.title}
          </div>
          <div
            style={{
              fontSize: 11,
              color: "rgba(255,255,255,0.52)",
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {s.artist}
          </div>
        </div>

        <button
          type="button"
          aria-label={liked ? "Unlike song" : "Like song"}
          onClick={() => onLike(s.id)}
          style={{
            background: "transparent",
            border: "none",
            cursor: "pointer",
            color: liked ? R[400] : "rgba(255,255,255,0.34)",
            flexShrink: 0,
            transition: "color 0.15s, transform 0.1s",
            display: "inline-flex",
            padding: 5,
          }}
          onMouseEnter={e => { e.currentTarget.style.transform = "scale(1.15)"; }}
          onMouseLeave={e => { e.currentTarget.style.transform = "scale(1)"; }}
        >
          <Heart size={18} fill={liked ? R[400] : "none"} />
        </button>
      </div>

      {/* Playback controls + progress */}
      <div className="player-controls" style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8, minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <button
            type="button"
            aria-label="Shuffle"
            className={btnClass("shuffle", shuffle ? "player-btn-active-glow" : "")}
            onClick={() => pressAnim("shuffle", onShuffleToggle)}
            style={iconButton(shuffle)}
            onMouseEnter={e => hoverOn(e, shuffle)}
            onMouseLeave={e => hoverOff(e, shuffle)}
          >
            <Shuffle size={16} />
          </button>
          <button
            type="button"
            aria-label="Previous track"
            className={btnClass("prev")}
            onClick={() => pressAnim("prev", onPrevious)}
            style={iconButton(false)}
            onMouseEnter={hoverOn}
            onMouseLeave={hoverOff}
          >
            <SkipBack size={19} fill="currentColor" />
          </button>
          <button
            type="button"
            aria-label={playing ? "Pause" : "Play"}
            onClick={onToggle}
            style={{
              width: 40,
              height: 40,
              borderRadius: "50%",
              border: "none",
              background: "#fff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              color: "#141010",
              flexShrink: 0,
              margin: "0 4px",
              transition: "transform 0.12s, box-shadow 0.12s",
              boxShadow: "0 6px 18px rgba(0,0,0,0.44)",
            }}
            onMouseEnter={e => {
              e.currentTarget.style.transform = "scale(1.06)";
              e.currentTarget.style.boxShadow = "0 8px 24px rgba(0,0,0,0.52)";
            }}
            onMouseLeave={e => {
              e.currentTarget.style.transform = "scale(1)";
              e.currentTarget.style.boxShadow = "0 6px 18px rgba(0,0,0,0.44)";
            }}
          >
            {playing ? <Pause size={19} fill="currentColor" /> : <Play size={19} fill="currentColor" style={{ marginLeft: 2 }} />}
          </button>
          <button
            type="button"
            aria-label="Next track"
            className={btnClass("next")}
            onClick={() => pressAnim("next", onNext)}
            style={iconButton(false)}
            onMouseEnter={hoverOn}
            onMouseLeave={hoverOff}
          >
            <SkipForward size={19} fill="currentColor" />
          </button>
          <button
            type="button"
            aria-label="Repeat"
            className={btnClass("repeat", repeatMode !== "off" ? "player-btn-active-glow" : "")}
            onClick={() => pressAnim("repeat", onRepeatCycle)}
            style={iconButton(repeatMode !== "off")}
            onMouseEnter={e => hoverOn(e, repeatMode !== "off")}
            onMouseLeave={e => hoverOff(e, repeatMode !== "off")}
          >
            {repeatMode === "one" ? <Repeat1 size={16} /> : <Repeat size={16} />}
          </button>
        </div>

        {/* Progress bar */}
        <div
          style={{ display: "flex", alignItems: "center", gap: 8, width: "100%", maxWidth: 520 }}
          onMouseEnter={() => setHovProgress(true)}
          onMouseLeave={() => setHovProgress(false)}
        >
          <span style={{ fontSize: 10, color: "rgba(255,255,255,0.42)", minWidth: 34, textAlign: "right", fontVariantNumeric: "tabular-nums" }}>
            {mins}:{secs}
          </span>
          <div
            onClick={seekFromEvent}
            style={{
              flex: 1,
              height: hovProgress ? 6 : 4,
              background: "rgba(255,255,255,0.16)",
              borderRadius: 999,
              position: "relative",
              cursor: "pointer",
              transition: "height 0.1s",
            }}
          >
            <div
              style={{
                width: `${pct}%`,
                height: "100%",
                background: C[500],
                borderRadius: 999,
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
          <span style={{ fontSize: 10, color: "rgba(255,255,255,0.42)", minWidth: 34, fontVariantNumeric: "tabular-nums" }}>
            {s.duration}
          </span>
        </div>
      </div>

      {/* Side tools + volume */}
      <div className="player-side-tools" style={{ display: "flex", alignItems: "center", gap: 4, justifyContent: "flex-end", minWidth: 0 }}>
        <button
          type="button"
          aria-label="Lyrics"
          className={btnClass("lyrics")}
          onClick={() => pressAnim("lyrics")}
          style={iconButton(false)}
          onMouseEnter={hoverOn}
          onMouseLeave={hoverOff}
        >
          <Mic2 size={16} />
        </button>
        <button
          type="button"
          aria-label="Queue"
          className={btnClass("queue")}
          onClick={() => pressAnim("queue")}
          style={iconButton(false)}
          onMouseEnter={hoverOn}
          onMouseLeave={hoverOff}
        >
          <ListMusic size={16} />
        </button>
        <button
          type="button"
          aria-label="Connect device"
          className={btnClass("connect")}
          onClick={() => pressAnim("connect")}
          style={iconButton(false)}
          onMouseEnter={hoverOn}
          onMouseLeave={hoverOff}
        >
          <MonitorSpeaker size={16} />
        </button>
        <button
          type="button"
          aria-label={muted ? "Unmute" : "Mute"}
          className={btnClass("mute")}
          onClick={() => pressAnim("mute", onMuteToggle)}
          style={iconButton(false)}
          onMouseEnter={hoverOn}
          onMouseLeave={hoverOff}
        >
          {muted || volPct === 0 ? <VolumeX size={17} /> : <Volume2 size={17} />}
        </button>

        {/* Volume slider */}
        <div
          onClick={volumeFromEvent}
          onMouseEnter={() => setHovVolume(true)}
          onMouseLeave={() => setHovVolume(false)}
          style={{
            width: 92,
            height: hovVolume ? 6 : 4,
            background: "rgba(255,255,255,0.16)",
            borderRadius: 999,
            cursor: "pointer",
            position: "relative",
            flexShrink: 0,
            transition: "height 0.1s ease",
          }}
        >
          <div
            style={{
              width: `${volPct}%`,
              height: "100%",
              background: muted ? "rgba(255,255,255,0.34)" : "rgba(255,255,255,0.72)",
              borderRadius: 999,
              transition: "width 160ms ease, background 140ms ease",
            }}
          />
          <div
            style={{
              position: "absolute",
              top: "50%",
              left: `${volPct}%`,
              transform: "translate(-50%, -50%)",
              width: 11,
              height: 11,
              background: "#fff",
              borderRadius: "50%",
              boxShadow: "0 2px 6px rgba(0,0,0,0.4)",
              pointerEvents: "none",
              opacity: hovVolume ? 1 : 0,
              transition: "left 160ms ease, opacity 140ms ease, transform 140ms ease",
            }}
          />
        </div>

        <button
          type="button"
          aria-label="Fullscreen"
          className={btnClass("fullscreen")}
          onClick={() => pressAnim("fullscreen")}
          style={iconButton(false)}
          onMouseEnter={hoverOn}
          onMouseLeave={hoverOff}
        >
          <Maximize2 size={16} />
        </button>
      </div>
    </div>
  );
}
