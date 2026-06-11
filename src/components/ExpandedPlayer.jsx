import { useEffect, useRef, useState } from "react";
import {
  ChevronDown, Heart, Pause, Play, Repeat, Repeat1,
  Shuffle, SkipBack, SkipForward, Volume2, VolumeX,
} from "lucide-react";
import EqBars from "./EqBars";
import { C, R } from "../constants/theme";
import { getSongImage } from "../data/media";

export default function ExpandedPlayer({
  isOpen, onClose,
  s, playing, prog, volume, muted, shuffle, repeatMode,
  likedIds,
  onToggle, onPrevious, onNext, onSeek, onVolumeChange, onMuteToggle,
  onShuffleToggle, onRepeatCycle, onLike,
  queuedTracks = [],
  upcomingTracks = [],
  onPlayQueuedTrack,
  onPlayTrack,
  onOpenQueue,
  onOpenLyrics,
}) {
  const [hovProgress, setHovProgress] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const progressBarRef = useRef(null);
  const dragRef = useRef(false);
  const sRef = useRef(s);
  const onSeekRef = useRef(onSeek);
  useEffect(() => { sRef.current = s; }, [s]);
  useEffect(() => { onSeekRef.current = onSeek; }, [onSeek]);

  useEffect(() => {
    const onMove = (e) => {
      if (!dragRef.current || !progressBarRef.current) return;
      const rect = progressBarRef.current.getBoundingClientRect();
      const ratio = Math.min(1, Math.max(0, (e.clientX - rect.left) / rect.width));
      onSeekRef.current(Math.round(ratio * (sRef.current?.durationSecs || 0)));
    };
    const onUp = () => { dragRef.current = false; setIsDragging(false); };
    document.addEventListener("mousemove", onMove);
    document.addEventListener("mouseup", onUp);
    return () => { document.removeEventListener("mousemove", onMove); document.removeEventListener("mouseup", onUp); };
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [isOpen, onClose]);

  if (!s) return null;

  const liked = likedIds.has(s.id);
  const cover = getSongImage(s);
  const pct = s.durationSecs > 0 ? Math.min(100, Math.max(0, (prog / s.durationSecs) * 100)) : 0;
  const volPct = muted ? 0 : Math.round(volume * 100);
  const mins = Math.floor(prog / 60);
  const secs = String(Math.floor(prog % 60)).padStart(2, "0");

  const handleProgressDown = (e) => {
    e.preventDefault();
    dragRef.current = true;
    setIsDragging(true);
    if (progressBarRef.current) {
      const rect = progressBarRef.current.getBoundingClientRect();
      const ratio = Math.min(1, Math.max(0, (e.clientX - rect.left) / rect.width));
      onSeek(Math.round(ratio * s.durationSecs));
    }
  };

  const showThumb = hovProgress || isDragging;

  const previewItems = (() => {
    const queued = queuedTracks.slice(0, 3).map((song, i) => ({ song, type: "queued", queueIndex: i }));
    if (queued.length >= 3) return queued;
    const auto = upcomingTracks.slice(0, 3 - queued.length).map(song => ({ song, type: "auto" }));
    return [...queued, ...auto];
  })();

  const ctrlBtn = (active = false) => ({
    width: 36, height: 36, borderRadius: 999, border: "none",
    background: "transparent",
    color: active ? C[400] : "rgba(255,255,255,0.72)",
    display: "inline-flex", alignItems: "center", justifyContent: "center",
    cursor: "pointer", flexShrink: 0,
    transition: "background 80ms ease, color 80ms ease, transform 140ms cubic-bezier(0.2,0,0,1)",
  });

  const ctrlHoverOn = (e, active = false) => {
    e.currentTarget.style.background = "rgba(255,255,255,0.1)";
    e.currentTarget.style.color = active ? C[400] : "#fff";
  };
  const ctrlHoverOff = (e, active = false) => {
    e.currentTarget.style.background = "transparent";
    e.currentTarget.style.color = active ? C[400] : "rgba(255,255,255,0.72)";
  };
  const ctrlPress = (e) => { e.currentTarget.style.transform = "scale(0.94)"; };
  const ctrlRelease = (e) => { e.currentTarget.style.transform = "scale(1)"; };

  return (
    <div
      role="dialog"
      aria-modal={isOpen}
      aria-label="Expanded Player"
      aria-hidden={!isOpen}
      inert={!isOpen ? "" : undefined}
      style={{
        position: "fixed", inset: 0, zIndex: 300, overflow: "hidden",
        transform: isOpen ? "translateY(0)" : "translateY(100%)",
        transition: "transform 300ms cubic-bezier(0.4, 0, 0.2, 1)",
        pointerEvents: isOpen ? undefined : "none",
      }}
    >
      {/* Layered background: song color + heavy dark overlay */}
      <div style={{ position: "absolute", inset: 0, background: s.bg, opacity: 0.55 }} />
      <div style={{ position: "absolute", inset: 0, background: "rgba(12,10,10,0.84)" }} />

      {/* Content */}
      <div style={{ position: "relative", zIndex: 1, height: "100%", display: "flex", flexDirection: "column" }}>

        {/* Top bar */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 24px", flexShrink: 0 }}>
          <button
            type="button" aria-label="Close expanded player"
            onClick={onClose}
            style={{
              background: "transparent", border: "none", cursor: "pointer",
              color: "rgba(255,255,255,0.64)", display: "inline-flex",
              padding: 6, borderRadius: "50%",
              transition: "background 80ms ease, color 80ms ease",
            }}
            onMouseEnter={e => { e.currentTarget.style.background = "rgba(255,255,255,0.1)"; e.currentTarget.style.color = "#fff"; }}
            onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "rgba(255,255,255,0.64)"; }}
          >
            <ChevronDown size={24} />
          </button>
          <span style={{ fontSize: 13, fontWeight: 600, color: "rgba(255,255,255,0.72)", letterSpacing: "0.04em" }}>
            Now Playing
          </span>
          <div style={{ display: "flex", gap: 2 }}>
            <button
              type="button"
              aria-label="Open lyrics panel"
              onClick={onOpenLyrics}
              style={{ background: "transparent", border: "none", cursor: "pointer", color: "rgba(255,255,255,0.52)", fontSize: 17, display: "inline-flex", alignItems: "center", padding: "4px 6px", borderRadius: 4, transition: "color 80ms ease" }}
              onMouseEnter={e => { e.currentTarget.style.color = "#fff"; }}
              onMouseLeave={e => { e.currentTarget.style.color = "rgba(255,255,255,0.52)"; }}
            >♪</button>
            <button
              type="button"
              aria-label="Open queue panel"
              onClick={onOpenQueue}
              style={{ background: "transparent", border: "none", cursor: "pointer", color: "rgba(255,255,255,0.52)", fontSize: 17, display: "inline-flex", alignItems: "center", padding: "4px 6px", borderRadius: 4, transition: "color 80ms ease" }}
              onMouseEnter={e => { e.currentTarget.style.color = "#fff"; }}
              onMouseLeave={e => { e.currentTarget.style.color = "rgba(255,255,255,0.52)"; }}
            >≡</button>
          </div>
        </div>

        {/* Main layout */}
        <div style={{
          flex: 1, display: "flex", alignItems: "flex-start", justifyContent: "center",
          padding: "0 48px 32px", gap: 56, overflowY: "auto", minHeight: 0,
        }}>
          {/* ── Cover ── */}
          <div style={{
            width: 260, height: 260, borderRadius: 12, overflow: "hidden", flexShrink: 0, marginTop: 16,
            background: s.bg, boxShadow: "0 32px 80px rgba(0,0,0,0.6)",
            display: "flex", alignItems: "center", justifyContent: "center", position: "relative",
          }}>
            {cover && <img src={cover} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />}
            {playing && (
              <div style={{
                position: cover ? "absolute" : "static", inset: 0,
                display: "flex", alignItems: "center", justifyContent: "center",
                background: cover ? "rgba(0,0,0,0.28)" : "transparent",
              }}>
                <EqBars size={22} />
              </div>
            )}
          </div>

          {/* ── Right panel ── */}
          <div style={{ flex: 1, maxWidth: 420, display: "flex", flexDirection: "column", gap: 0 }}>

            {/* Track info + like */}
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 24 }}>
              <div style={{ minWidth: 0, flex: 1 }}>
                <div style={{ fontSize: 24, fontWeight: 700, color: "#f4eee8", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", marginBottom: 6 }}>
                  {s.title}
                </div>
                <div style={{ fontSize: 14, color: "rgba(255,255,255,0.58)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                  {s.artist}
                </div>
              </div>
              <button
                type="button" aria-label={liked ? "Unlike" : "Like"}
                onClick={() => onLike(s.id)}
                style={{
                  background: "transparent", border: "none", cursor: "pointer",
                  color: liked ? R[400] : "rgba(255,255,255,0.38)",
                  flexShrink: 0, display: "inline-flex", padding: 6, marginLeft: 12,
                  transition: "color 0.15s, transform 0.12s",
                }}
                onMouseEnter={e => { e.currentTarget.style.transform = "scale(1.12)"; }}
                onMouseLeave={e => { e.currentTarget.style.transform = "scale(1)"; }}
              >
                <Heart size={22} fill={liked ? R[400] : "none"} />
              </button>
            </div>

            {/* Progress */}
            <div style={{ marginBottom: 20 }}>
              <div
                ref={progressBarRef}
                onMouseDown={handleProgressDown}
                onMouseEnter={() => setHovProgress(true)}
                onMouseLeave={() => setHovProgress(false)}
                style={{ height: 16, display: "flex", alignItems: "center", position: "relative", cursor: "pointer", userSelect: "none" }}
              >
                <div style={{
                  position: "absolute", left: 0, right: 0, top: "50%", transform: "translateY(-50%)",
                  height: showThumb ? 6 : 4,
                  background: "rgba(255,255,255,0.18)", borderRadius: 999, overflow: "hidden",
                  transition: "height 0.1s",
                }}>
                  <div style={{ width: `${pct}%`, height: "100%", background: C[500], borderRadius: 999, transition: isDragging ? "none" : "width 1s linear" }} />
                </div>
                {showThumb && (
                  <div style={{
                    position: "absolute", top: "50%", left: `${pct}%`,
                    transform: "translate(-50%, -50%)",
                    width: 14, height: 14, background: "#fff", borderRadius: "50%",
                    boxShadow: "0 2px 6px rgba(0,0,0,0.4)", pointerEvents: "none", zIndex: 1,
                  }} />
                )}
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", marginTop: 4 }}>
                <span style={{ fontSize: 10, color: "rgba(255,255,255,0.4)", fontVariantNumeric: "tabular-nums" }}>{mins}:{secs}</span>
                <span style={{ fontSize: 10, color: "rgba(255,255,255,0.4)", fontVariantNumeric: "tabular-nums" }}>{s.duration}</span>
              </div>
            </div>

            {/* Playback controls */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, marginBottom: 20 }}>
              <div style={{ position: "relative" }}>
                <button type="button" aria-label="Shuffle" style={ctrlBtn(shuffle)}
                  onClick={onShuffleToggle}
                  onMouseEnter={e => ctrlHoverOn(e, shuffle)} onMouseLeave={e => ctrlHoverOff(e, shuffle)}
                  onMouseDown={ctrlPress} onMouseUp={ctrlRelease}>
                  <Shuffle size={18} />
                </button>
                {shuffle && <span className="player-active-dot" />}
              </div>

              <button type="button" aria-label="Previous track" style={ctrlBtn()}
                onClick={onPrevious}
                onMouseEnter={ctrlHoverOn} onMouseLeave={ctrlHoverOff}
                onMouseDown={ctrlPress} onMouseUp={ctrlRelease}>
                <SkipBack size={22} fill="currentColor" />
              </button>

              <button
                type="button" aria-label={playing ? "Pause" : "Play"}
                onClick={onToggle}
                style={{
                  width: 52, height: 52, borderRadius: "50%", border: "none",
                  background: "#fff", display: "flex", alignItems: "center", justifyContent: "center",
                  cursor: "pointer", color: "#141010", flexShrink: 0,
                  transition: "transform 0.12s, box-shadow 0.12s",
                  boxShadow: "0 8px 24px rgba(0,0,0,0.5)",
                }}
                onMouseEnter={e => { e.currentTarget.style.transform = "scale(1.06)"; }}
                onMouseLeave={e => { e.currentTarget.style.transform = "scale(1)"; }}>
                {playing ? <Pause size={22} fill="currentColor" /> : <Play size={22} fill="currentColor" style={{ marginLeft: 2 }} />}
              </button>

              <button type="button" aria-label="Next track" style={ctrlBtn()}
                onClick={onNext}
                onMouseEnter={ctrlHoverOn} onMouseLeave={ctrlHoverOff}
                onMouseDown={ctrlPress} onMouseUp={ctrlRelease}>
                <SkipForward size={22} fill="currentColor" />
              </button>

              <div style={{ position: "relative" }}>
                <button type="button" aria-label="Repeat" style={ctrlBtn(repeatMode !== "off")}
                  onClick={onRepeatCycle}
                  onMouseEnter={e => ctrlHoverOn(e, repeatMode !== "off")} onMouseLeave={e => ctrlHoverOff(e, repeatMode !== "off")}
                  onMouseDown={ctrlPress} onMouseUp={ctrlRelease}>
                  {repeatMode === "one" ? <Repeat1 size={18} /> : <Repeat size={18} />}
                </button>
                {repeatMode !== "off" && <span className="player-active-dot" />}
              </div>
            </div>

            {/* Volume */}
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 28 }}>
              <button
                type="button" aria-label={muted ? "Unmute" : "Mute"}
                onClick={onMuteToggle}
                style={{ background: "transparent", border: "none", cursor: "pointer", color: "rgba(255,255,255,0.52)", display: "inline-flex", padding: 2, transition: "color 80ms ease" }}
                onMouseEnter={e => { e.currentTarget.style.color = "#fff"; }}
                onMouseLeave={e => { e.currentTarget.style.color = "rgba(255,255,255,0.52)"; }}>
                {muted || volPct === 0 ? <VolumeX size={16} /> : <Volume2 size={16} />}
              </button>
              <div
                onClick={(e) => {
                  const rect = e.currentTarget.getBoundingClientRect();
                  const ratio = Math.min(1, Math.max(0, (e.clientX - rect.left) / rect.width));
                  onVolumeChange(Number(ratio.toFixed(2)));
                }}
                style={{ flex: 1, height: 16, display: "flex", alignItems: "center", position: "relative", cursor: "pointer" }}
              >
                <div style={{ position: "absolute", left: 0, right: 0, height: 4, top: "50%", transform: "translateY(-50%)", background: "rgba(255,255,255,0.16)", borderRadius: 999, overflow: "hidden" }}>
                  <div style={{ width: `${volPct}%`, height: "100%", background: "rgba(255,255,255,0.72)", borderRadius: 999, transition: "width 160ms ease" }} />
                </div>
              </div>
            </div>

            {/* Lyrics preview */}
            <div style={{ borderTop: "1px solid rgba(255,255,255,0.08)", paddingTop: 20 }}>
              <div style={{ fontSize: 11, fontWeight: 600, color: "rgba(255,255,255,0.36)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 10 }}>
                Lyrics
              </div>
              <div style={{ fontSize: 14, color: "rgba(255,255,255,0.26)", fontStyle: "italic" }}>
                Lyrics not available for this track.
              </div>
            </div>

            {/* Next Up preview */}
            <div style={{ borderTop: "1px solid rgba(255,255,255,0.08)", paddingTop: 20, marginTop: 20, paddingBottom: 8 }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
                <div style={{ fontSize: 11, fontWeight: 600, color: "rgba(255,255,255,0.36)", textTransform: "uppercase", letterSpacing: "0.08em" }}>
                  Next Up
                </div>
                {onOpenQueue && (
                  <button
                    type="button"
                    aria-label="Open full queue"
                    onClick={onOpenQueue}
                    style={{ background: "none", border: "none", cursor: "pointer", fontSize: 11, fontWeight: 600, color: "rgba(255,255,255,0.36)", padding: "2px 4px", borderRadius: 3, transition: "color 80ms ease" }}
                    onMouseEnter={e => { e.currentTarget.style.color = "#fff"; }}
                    onMouseLeave={e => { e.currentTarget.style.color = "rgba(255,255,255,0.36)"; }}
                  >
                    See all →
                  </button>
                )}
              </div>
              {previewItems.length === 0 ? (
                <div style={{ fontSize: 13, color: "rgba(255,255,255,0.26)", fontStyle: "italic" }}>
                  No upcoming tracks
                </div>
              ) : (
                previewItems.map((item, i) => (
                  <ExpandedQueueRow
                    key={`preview-${item.song.id}-${i}`}
                    song={item.song}
                    onPlay={() => {
                      if (item.type === "queued") onPlayQueuedTrack?.(item.song, item.queueIndex);
                      else onPlayTrack?.(item.song);
                    }}
                  />
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ExpandedQueueRow({ song, onPlay }) {
  const cover = getSongImage(song);
  const [hov, setHov] = useState(false);
  return (
    <div
      role="button"
      tabIndex={0}
      aria-label={`Play ${song.title}`}
      onClick={onPlay}
      onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onPlay(); } }}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        display: "flex", alignItems: "center", gap: 10,
        padding: "5px 4px", borderRadius: 6,
        cursor: "pointer",
        background: hov ? "rgba(255,255,255,0.08)" : "transparent",
        transition: "background 80ms ease",
      }}
    >
      <div style={{
        width: 36, height: 36, borderRadius: 4, flexShrink: 0,
        background: song.bg, overflow: "hidden",
        display: "flex", alignItems: "center", justifyContent: "center",
      }}>
        {cover && <img src={cover} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />}
      </div>
      <div style={{ minWidth: 0, flex: 1 }}>
        <div style={{ fontSize: 12, fontWeight: 600, color: "#f4eee8", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
          {song.title}
        </div>
        <div style={{ fontSize: 11, color: "rgba(255,255,255,0.45)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
          {song.artist}
        </div>
      </div>
      <span style={{ fontSize: 11, color: "rgba(255,255,255,0.36)", flexShrink: 0, fontVariantNumeric: "tabular-nums" }}>
        {song.duration}
      </span>
    </div>
  );
}
