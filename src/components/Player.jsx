import { useState, useRef, useEffect } from "react";
import {
  CircleCheck,
  CirclePlus,
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
import QueuePanel from "./QueuePanel";
import LyricsPanel from "./LyricsPanel";
import ExpandedPlayer from "./ExpandedPlayer";
import { C } from "../constants/theme";
import { getSongImage } from "../data/media";

export default function Player({
  s,
  playing,
  prog,
  volume,
  muted,
  shuffle,
  repeatMode,
  upcomingTracks = [],
  queuedTracks = [],
  onToggle,
  onPrevious,
  onNext,
  onSeek,
  onVolumeChange,
  onMuteToggle,
  onShuffleToggle,
  onRepeatCycle,
  onPlayTrack,
  onPlayRecent,
  onPlayQueuedTrack,
  onRemoveFromQueue,
  onMoveQueueItem,
  onClearQueue,
  recentSongs = [],
  likedIds,
  onLike,
}) {
  const [hovProgress, setHovProgress] = useState(false);
  const [hovVolume, setHovVolume] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [isVolDragging, setIsVolDragging] = useState(false);
  const [pressedBtn, setPressedBtn] = useState(null);
  const [queueOpen, setQueueOpen] = useState(false);
  const [lyricsOpen, setLyricsOpen] = useState(false);
  const [expandOpen, setExpandOpen] = useState(false);
  const [connectFlash, setConnectFlash] = useState(false);
  const connectTimerRef = useRef(null);

  const toggleQueue = () => { setQueueOpen(o => !o); setLyricsOpen(false); };
  const toggleLyrics = () => { setLyricsOpen(o => !o); setQueueOpen(false); };
  useEffect(() => () => { if (connectTimerRef.current) clearTimeout(connectTimerRef.current); }, []);

  const pressTimerRef = useRef(null);
  const progressBarRef = useRef(null);
  const volumeBarRef = useRef(null);
  const dragStateRef = useRef({ progress: false, volume: false });

  const sRef = useRef(s);
  const onSeekRef = useRef(onSeek);
  const onVolumeChangeRef = useRef(onVolumeChange);
  useEffect(() => { sRef.current = s; }, [s]);
  useEffect(() => { onSeekRef.current = onSeek; }, [onSeek]);
  useEffect(() => { onVolumeChangeRef.current = onVolumeChange; }, [onVolumeChange]);

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (dragStateRef.current.progress && progressBarRef.current) {
        const rect = progressBarRef.current.getBoundingClientRect();
        const ratio = Math.min(1, Math.max(0, (e.clientX - rect.left) / rect.width));
        onSeekRef.current(Math.round(ratio * (sRef.current?.durationSecs || 0)));
      }
      if (dragStateRef.current.volume && volumeBarRef.current) {
        const rect = volumeBarRef.current.getBoundingClientRect();
        const ratio = Math.min(1, Math.max(0, (e.clientX - rect.left) / rect.width));
        onVolumeChangeRef.current(Number(ratio.toFixed(2)));
      }
    };
    const handleMouseUp = () => {
      if (dragStateRef.current.progress) { dragStateRef.current.progress = false; setIsDragging(false); }
      if (dragStateRef.current.volume) { dragStateRef.current.volume = false; setIsVolDragging(false); }
    };
    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, []);

  if (!s) return null;

  const liked = likedIds.has(s.id);
  const cover = getSongImage(s);
  const pct = s.durationSecs > 0 ? Math.min(100, Math.max(0, (prog / s.durationSecs) * 100)) : 0;
  const volPct = muted ? 0 : Math.round(volume * 100);
  const mins = Math.floor(prog / 60);
  const secs = String(Math.floor(prog % 60)).padStart(2, "0");

  const handleProgressMouseDown = (e) => {
    e.preventDefault();
    dragStateRef.current.progress = true;
    setIsDragging(true);
    if (progressBarRef.current) {
      const rect = progressBarRef.current.getBoundingClientRect();
      const ratio = Math.min(1, Math.max(0, (e.clientX - rect.left) / rect.width));
      onSeek(Math.round(ratio * s.durationSecs));
    }
  };

  const handleVolumeMouseDown = (e) => {
    e.preventDefault();
    dragStateRef.current.volume = true;
    setIsVolDragging(true);
    if (volumeBarRef.current) {
      const rect = volumeBarRef.current.getBoundingClientRect();
      const ratio = Math.min(1, Math.max(0, (e.clientX - rect.left) / rect.width));
      onVolumeChange(Number(ratio.toFixed(2)));
    }
  };

  const pressAnim = (id, callback) => {
    clearTimeout(pressTimerRef.current);
    setPressedBtn(id);
    callback?.();
    pressTimerRef.current = setTimeout(() => setPressedBtn(null), 180);
  };

  const btnClass = (id) => (pressedBtn === id ? "player-btn-press" : undefined);

  const iconButton = (active = false) => ({
    width: 32, height: 32, borderRadius: 999, border: "none",
    background: "transparent",
    color: active ? C[400] : "rgba(255,255,255,0.64)",
    display: "inline-flex", alignItems: "center", justifyContent: "center",
    cursor: "pointer", flexShrink: 0,
    transition: "background 80ms ease, color 80ms ease",
  });

  const hoverOn = (e, active = false) => {
    e.currentTarget.style.background = "rgba(255,255,255,0.08)";
    e.currentTarget.style.color = active ? C[400] : "#fff";
  };
  const hoverOff = (e, active = false) => {
    e.currentTarget.style.background = "transparent";
    e.currentTarget.style.color = active ? C[400] : "rgba(255,255,255,0.64)";
  };

  const showThumb = hovProgress || isDragging;
  const showVolThumb = hovVolume || isVolDragging;

  return (
    <>
      <ExpandedPlayer
        isOpen={expandOpen}
        onClose={() => setExpandOpen(false)}
        s={s} playing={playing} prog={prog} volume={volume} muted={muted}
        shuffle={shuffle} repeatMode={repeatMode} likedIds={likedIds}
        onToggle={onToggle} onPrevious={onPrevious} onNext={onNext}
        onSeek={onSeek} onVolumeChange={onVolumeChange} onMuteToggle={onMuteToggle}
        onShuffleToggle={onShuffleToggle} onRepeatCycle={onRepeatCycle} onLike={onLike}
        queuedTracks={queuedTracks}
        upcomingTracks={upcomingTracks}
        onPlayQueuedTrack={onPlayQueuedTrack}
        onPlayTrack={onPlayTrack}
        onOpenQueue={() => { setExpandOpen(false); setQueueOpen(true); }}
        onOpenLyrics={() => { setExpandOpen(false); setLyricsOpen(true); }}
      />
      <LyricsPanel
        isOpen={lyricsOpen}
        onClose={() => setLyricsOpen(false)}
        currentSong={s}
      />
      <QueuePanel
        isOpen={queueOpen}
        onClose={() => setQueueOpen(false)}
        currentSong={s}
        upcomingTracks={upcomingTracks}
        onPlayTrack={onPlayTrack}
        shuffle={shuffle}
        recentTracks={recentSongs}
        onPlayRecent={onPlayRecent}
        queuedTracks={queuedTracks}
        onPlayQueuedTrack={onPlayQueuedTrack}
        onRemoveFromQueue={onRemoveFromQueue}
        onMoveQueueItem={onMoveQueueItem}
        onClearQueue={onClearQueue}
      />

      <div
        className="player-bar"
        style={{
          minHeight: 90, flexShrink: 0,
          background: "#181818",
          borderTop: "1px solid rgba(255,255,255,0.08)",
          display: "grid",
          gridTemplateColumns: "minmax(230px,1fr) minmax(360px,1.45fr) minmax(220px,1fr)",
          alignItems: "center",
          padding: "10px 18px", gap: 14,
          boxShadow: "0 -10px 28px rgba(0,0,0,0.32)",
          position: "relative", zIndex: 101,
        }}
      >
        {/* ── Now Playing ── */}
        <div className="player-now" style={{ display: "flex", alignItems: "center", gap: 12, minWidth: 0 }}>
          <div
            onClick={() => setExpandOpen(true)}
            title="Open expanded player"
            style={{
              width: 56, height: 56, borderRadius: 8, background: s.bg, flexShrink: 0,
              display: "flex", alignItems: "center", justifyContent: "center",
              overflow: "hidden", position: "relative", boxShadow: "0 8px 22px rgba(0,0,0,0.38)",
              cursor: "pointer",
            }}>
            {cover && <img src={cover} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />}
            {playing ? (
              <div style={{
                position: cover ? "absolute" : "static", inset: 0,
                display: "flex", alignItems: "center", justifyContent: "center",
                background: cover ? "rgba(0,0,0,0.34)" : "transparent",
              }}>
                <EqBars size={16} />
              </div>
            ) : !cover ? <Music size={18} color="rgba(255,255,255,0.7)" /> : null}
          </div>

          <div style={{ minWidth: 0, flex: 1 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: "#f4eee8", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", marginBottom: 3 }}>
              {s.title}
            </div>
            <div style={{ fontSize: 11, color: "rgba(255,255,255,0.52)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
              {s.artist}
            </div>
          </div>

          <button
            type="button"
            aria-label={liked ? "Remove from Liked Songs" : "Save to Liked Songs"}
            onClick={() => onLike(s.id)}
            style={{
              background: "transparent", border: "none", cursor: "pointer",
              color: liked ? "#1ed760" : "rgba(255,255,255,0.55)",
              flexShrink: 0, transition: "color 0.15s, transform 0.1s",
              display: "inline-flex", padding: 5,
            }}
            onMouseEnter={e => { e.currentTarget.style.color = liked ? "#1ed760" : "#fff"; e.currentTarget.style.transform = "scale(1.12)"; }}
            onMouseLeave={e => { e.currentTarget.style.color = liked ? "#1ed760" : "rgba(255,255,255,0.55)"; e.currentTarget.style.transform = "scale(1)"; }}
            onMouseDown={e => { e.currentTarget.style.transform = "scale(0.92)"; }}
            onMouseUp={e => { e.currentTarget.style.transform = "scale(1.12)"; }}
          >
            {liked ? <CircleCheck size={18} /> : <CirclePlus size={18} />}
          </button>
        </div>

        {/* ── Playback Controls ── */}
        <div className="player-controls" style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>

            <div style={{ position: "relative" }}>
              <button type="button" aria-label="Shuffle" className={btnClass("shuffle")}
                onClick={() => pressAnim("shuffle", onShuffleToggle)}
                style={iconButton(shuffle)}
                onMouseEnter={e => hoverOn(e, shuffle)} onMouseLeave={e => hoverOff(e, shuffle)}>
                <Shuffle size={16} />
              </button>
              {shuffle && <span className="player-active-dot" />}
            </div>

            <button type="button" aria-label="Previous track" className={btnClass("prev")}
              onClick={() => pressAnim("prev", onPrevious)}
              style={iconButton(false)} onMouseEnter={hoverOn} onMouseLeave={hoverOff}>
              <SkipBack size={19} fill="currentColor" />
            </button>

            <button type="button" aria-label={playing ? "Pause" : "Play"} onClick={onToggle}
              style={{
                width: 40, height: 40, borderRadius: "50%", border: "none",
                background: "#fff", display: "flex", alignItems: "center", justifyContent: "center",
                cursor: "pointer", color: "#141010", flexShrink: 0, margin: "0 4px",
                transition: "transform 0.12s, box-shadow 0.12s",
                boxShadow: "0 6px 18px rgba(0,0,0,0.44)",
              }}
              onMouseEnter={e => { e.currentTarget.style.transform = "scale(1.06)"; e.currentTarget.style.boxShadow = "0 8px 24px rgba(0,0,0,0.52)"; }}
              onMouseLeave={e => { e.currentTarget.style.transform = "scale(1)"; e.currentTarget.style.boxShadow = "0 6px 18px rgba(0,0,0,0.44)"; }}>
              {playing ? <Pause size={19} fill="currentColor" /> : <Play size={19} fill="currentColor" style={{ marginLeft: 2 }} />}
            </button>

            <button type="button" aria-label="Next track" className={btnClass("next")}
              onClick={() => pressAnim("next", onNext)}
              style={iconButton(false)} onMouseEnter={hoverOn} onMouseLeave={hoverOff}>
              <SkipForward size={19} fill="currentColor" />
            </button>

            <div style={{ position: "relative" }}>
              <button type="button" aria-label="Repeat" className={btnClass("repeat")}
                onClick={() => pressAnim("repeat", onRepeatCycle)}
                style={iconButton(repeatMode !== "off")}
                onMouseEnter={e => hoverOn(e, repeatMode !== "off")} onMouseLeave={e => hoverOff(e, repeatMode !== "off")}>
                {repeatMode === "one" ? <Repeat1 size={16} /> : <Repeat size={16} />}
              </button>
              {repeatMode !== "off" && <span className="player-active-dot" />}
            </div>
          </div>

          {/* Progress bar — 16px hit area */}
          <div style={{ display: "flex", alignItems: "center", gap: 8, width: "100%", maxWidth: 520 }}>
            <span style={{ fontSize: 10, color: "rgba(255,255,255,0.42)", minWidth: 34, textAlign: "right", fontVariantNumeric: "tabular-nums" }}>
              {mins}:{secs}
            </span>
            <div
              ref={progressBarRef}
              onMouseDown={handleProgressMouseDown}
              onMouseEnter={() => setHovProgress(true)}
              onMouseLeave={() => setHovProgress(false)}
              style={{ flex: 1, height: 16, display: "flex", alignItems: "center", position: "relative", cursor: "pointer", userSelect: "none" }}
            >
              <div style={{
                position: "absolute", left: 0, right: 0, top: "50%", transform: "translateY(-50%)",
                height: showThumb ? 6 : 4,
                background: "rgba(255,255,255,0.16)", borderRadius: 999, overflow: "hidden",
                transition: "height 0.1s",
              }}>
                <div style={{ width: `${pct}%`, height: "100%", background: C[500], borderRadius: 999, transition: isDragging ? "none" : "width 1s linear" }} />
              </div>
              {showThumb && (
                <div style={{
                  position: "absolute", top: "50%", left: `${pct}%`,
                  transform: "translate(-50%, -50%)",
                  width: 13, height: 13, background: "#fff", borderRadius: "50%",
                  boxShadow: "0 2px 6px rgba(0,0,0,0.4)", pointerEvents: "none", zIndex: 1,
                }} />
              )}
            </div>
            <span style={{ fontSize: 10, color: "rgba(255,255,255,0.42)", minWidth: 34, fontVariantNumeric: "tabular-nums" }}>
              {s.duration}
            </span>
          </div>
        </div>

        {/* ── Side Tools ── */}
        <div className="player-side-tools" style={{ display: "flex", alignItems: "center", gap: 4, justifyContent: "flex-end", minWidth: 0 }}>
          <button type="button" aria-label="Lyrics"
            className={btnClass("lyrics")}
            onClick={() => { pressAnim("lyrics"); toggleLyrics(); }}
            style={iconButton(lyricsOpen)}
            onMouseEnter={e => hoverOn(e, lyricsOpen)}
            onMouseLeave={e => hoverOff(e, lyricsOpen)}>
            <Mic2 size={16} />
          </button>

          <button type="button" aria-label="Queue"
            className={btnClass("queue")}
            onClick={() => { pressAnim("queue"); toggleQueue(); }}
            style={iconButton(queueOpen)}
            onMouseEnter={e => hoverOn(e, queueOpen)}
            onMouseLeave={e => hoverOff(e, queueOpen)}>
            <ListMusic size={16} />
          </button>

          <div style={{ position: "relative" }}>
            <button
              type="button" aria-label="Connect device"
              title="Connect to a device"
              className={btnClass("connect")}
              onClick={() => {
                pressAnim("connect");
                if (connectTimerRef.current) clearTimeout(connectTimerRef.current);
                setConnectFlash(true);
                connectTimerRef.current = setTimeout(() => setConnectFlash(false), 2000);
              }}
              style={iconButton(false)}
              onMouseEnter={hoverOn} onMouseLeave={hoverOff}>
              <MonitorSpeaker size={16} />
            </button>
            {connectFlash && (
              <div style={{
                position: "absolute", bottom: "calc(100% + 8px)", left: "50%",
                transform: "translateX(-50%)",
                background: "rgba(24,20,20,0.96)", color: "rgba(255,255,255,0.76)",
                fontSize: 11, fontWeight: 500, padding: "4px 8px",
                borderRadius: 4, whiteSpace: "nowrap", pointerEvents: "none",
                zIndex: 200, border: "1px solid rgba(255,255,255,0.10)",
                boxShadow: "0 2px 8px rgba(0,0,0,0.4)",
              }}>
                Not available
              </div>
            )}
          </div>

          <button type="button" aria-label={muted ? "Unmute" : "Mute"} className={`${btnClass("mute")} player-mute-btn`}
            onClick={() => pressAnim("mute", onMuteToggle)}
            style={iconButton(false)} onMouseEnter={hoverOn} onMouseLeave={hoverOff}>
            {muted || volPct === 0 ? <VolumeX size={17} /> : <Volume2 size={17} />}
          </button>

          {/* Volume — 16px hit area, drag */}
          <div
            ref={volumeBarRef}
            className="player-vol-slider"
            onMouseDown={handleVolumeMouseDown}
            onMouseEnter={() => setHovVolume(true)}
            onMouseLeave={() => setHovVolume(false)}
            style={{ width: 92, height: 16, display: "flex", alignItems: "center", position: "relative", cursor: "pointer", flexShrink: 0, userSelect: "none" }}
          >
            <div style={{
              position: "absolute", left: 0, right: 0, top: "50%", transform: "translateY(-50%)",
              height: showVolThumb ? 6 : 4,
              background: "rgba(255,255,255,0.16)", borderRadius: 999, overflow: "hidden",
              transition: "height 0.1s ease",
            }}>
              <div style={{
                width: `${volPct}%`, height: "100%",
                background: muted ? "rgba(255,255,255,0.34)" : "rgba(255,255,255,0.72)",
                borderRadius: 999,
                transition: isVolDragging ? "none" : "width 160ms ease, background 140ms ease",
              }} />
            </div>
            <div style={{
              position: "absolute", top: "50%", left: `${volPct}%`,
              transform: "translate(-50%, -50%)",
              width: 11, height: 11, background: "#fff", borderRadius: "50%",
              boxShadow: "0 2px 6px rgba(0,0,0,0.4)", pointerEvents: "none", zIndex: 1,
              opacity: showVolThumb ? 1 : 0,
              transition: isVolDragging ? "opacity 140ms ease" : "left 160ms ease, opacity 140ms ease",
            }} />
          </div>

          <button type="button" aria-label="Expanded player"
            className={btnClass("expand")}
            onClick={() => { pressAnim("expand"); setExpandOpen(o => !o); }}
            style={iconButton(expandOpen)}
            onMouseEnter={e => hoverOn(e, expandOpen)} onMouseLeave={e => hoverOff(e, expandOpen)}>
            <Maximize2 size={16} />
          </button>
        </div>
      </div>
    </>
  );
}
