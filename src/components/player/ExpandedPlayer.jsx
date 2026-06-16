import { useEffect, useMemo, useRef, useState } from "react";
import {
  ChevronDown, CircleCheck, CirclePlus, Pause, Play, Repeat, Repeat1,
  Shuffle, SkipBack, SkipForward, Volume2, VolumeX,
} from "lucide-react";
import EqBars from "./EqBars";
import SaveToPlaylistPopover from "../modals/SaveToPlaylistPopover";
import { C } from "../../constants/theme";
import { getSongImage } from "../../data/media";
import { loadLyricsForSong, loadLyricsOffsetMs } from "../../lib/music/lyrics";

export default function ExpandedPlayer({
  isOpen, onClose,
  s, playing, prog, actualDurationSecs, volume, muted, shuffle, repeatMode,
  likedIds,
  onToggle, onPrevious, onNext, onSeek, onVolumeChange, onMuteToggle,
  onShuffleToggle, onRepeatCycle, onLike,
  queuedTracks = [],
  upcomingTracks = [],
  onPlayQueuedTrack,
  onPlayTrack,
  onOpenQueue,
  onOpenLyrics,
  userPlaylists = [],
  onToggleSongInPlaylist,
  onCreatePlaylistWithSong,
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
      const duration = sRef.current?.actualDurationSecs || sRef.current?.durationSecs || 0;
      onSeekRef.current(ratio * duration);
    };
    const onUp = () => { dragRef.current = false; setIsDragging(false); };
    document.addEventListener("mousemove", onMove);
    document.addEventListener("mouseup", onUp);
    return () => { document.removeEventListener("mousemove", onMove); document.removeEventListener("mouseup", onUp); };
  }, []);

  const [saveOpen, setSaveOpen] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [isOpen, onClose]);

  if (!s) return null;

  const liked = likedIds.has(s.id);
  const isSaved = liked || userPlaylists.some(pl => typeof pl.id === "string" && pl.songIds?.includes(s.id));
  const cover = getSongImage(s);
  const playbackDurationSecs = actualDurationSecs || s.actualDurationSecs || s.durationSecs || 0;
  const pct = playbackDurationSecs > 0 ? Math.min(100, Math.max(0, (prog / playbackDurationSecs) * 100)) : 0;
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
      onSeek(ratio * playbackDurationSecs);
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
    color: active ? C[400] : "var(--island-fill)",
    display: "inline-flex", alignItems: "center", justifyContent: "center",
    cursor: "pointer", flexShrink: 0,
    transition: "background 80ms ease, color 80ms ease, transform 140ms cubic-bezier(0.2,0,0,1)",
  });

  const ctrlHoverOn = (e, active = false) => {
    e.currentTarget.style.background = "var(--island-hover)";
    e.currentTarget.style.color = active ? C[400] : "var(--island-text)";
  };
  const ctrlHoverOff = (e, active = false) => {
    e.currentTarget.style.background = "transparent";
    e.currentTarget.style.color = active ? C[400] : "var(--island-fill)";
  };
  const ctrlPress = (e) => { e.currentTarget.style.transform = "scale(0.94)"; };
  const ctrlRelease = (e) => { e.currentTarget.style.transform = "scale(1)"; };

  return (
    <>
      {saveOpen && isOpen && (
        <SaveToPlaylistPopover
          song={s}
          likedIds={likedIds}
          onToggleLike={onLike}
          userPlaylists={userPlaylists}
          onToggleSongInPlaylist={onToggleSongInPlaylist}
          onCreatePlaylistWithSong={onCreatePlaylistWithSong}
          onClose={() => setSaveOpen(false)}
          align="center"
        />
      )}
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
              color: "var(--island-muted)", display: "inline-flex",
              padding: 6, borderRadius: "50%",
              transition: "background 80ms ease, color 80ms ease",
            }}
            onMouseEnter={e => { e.currentTarget.style.background = "var(--island-hover)"; e.currentTarget.style.color = "var(--island-text)"; }}
            onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "var(--island-muted)"; }}
          >
            <ChevronDown size={24} />
          </button>
          <span style={{ fontSize: 13, fontWeight: 600, color: "var(--island-fill)", letterSpacing: "0.04em" }}>
            Now Playing
          </span>
          <div style={{ display: "flex", gap: 2 }}>
            <button
              type="button"
              aria-label="Open lyrics panel"
              onClick={onOpenLyrics}
              style={{ background: "transparent", border: "none", cursor: "pointer", color: "var(--island-muted)", fontSize: 17, display: "inline-flex", alignItems: "center", padding: "4px 6px", borderRadius: 4, transition: "color 80ms ease" }}
              onMouseEnter={e => { e.currentTarget.style.color = "var(--island-text)"; }}
              onMouseLeave={e => { e.currentTarget.style.color = "var(--island-muted)"; }}
            >♪</button>
            <button
              type="button"
              aria-label="Open queue panel"
              onClick={onOpenQueue}
              style={{ background: "transparent", border: "none", cursor: "pointer", color: "var(--island-muted)", fontSize: 17, display: "inline-flex", alignItems: "center", padding: "4px 6px", borderRadius: 4, transition: "color 80ms ease" }}
              onMouseEnter={e => { e.currentTarget.style.color = "var(--island-text)"; }}
              onMouseLeave={e => { e.currentTarget.style.color = "var(--island-muted)"; }}
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
                <div style={{ fontSize: 24, fontWeight: 700, color: "var(--island-text)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", marginBottom: 6 }}>
                  {s.title}
                </div>
                <div style={{ fontSize: 14, color: "var(--island-muted)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                  {s.artist}
                </div>
              </div>
              <button
                type="button"
                aria-label={isSaved ? "Remove from Liked Songs" : "Save to Liked Songs"}
                onClick={() => setSaveOpen(p => !p)}
                style={{
                  background: "transparent", border: "none", cursor: "pointer",
                  color: isSaved ? "#1ed760" : "var(--island-muted)",
                  flexShrink: 0, display: "inline-flex", padding: 6, marginLeft: 12,
                  transition: "color 0.15s, transform 0.12s",
                }}
                onMouseEnter={e => { e.currentTarget.style.color = isSaved ? "#1ed760" : "var(--island-text)"; e.currentTarget.style.transform = "scale(1.12)"; }}
                onMouseLeave={e => { e.currentTarget.style.color = isSaved ? "#1ed760" : "var(--island-muted)"; e.currentTarget.style.transform = "scale(1)"; }}
                onMouseDown={e => { e.currentTarget.style.transform = "scale(0.92)"; }}
                onMouseUp={e => { e.currentTarget.style.transform = "scale(1.12)"; }}
              >
                {isSaved ? <CircleCheck size={22} /> : <CirclePlus size={22} />}
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
                  background: "var(--island-rail)", borderRadius: 999, overflow: "hidden",
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
                <span style={{ fontSize: 10, color: "var(--island-faint)", fontVariantNumeric: "tabular-nums" }}>{mins}:{secs}</span>
                <span style={{ fontSize: 10, color: "var(--island-faint)", fontVariantNumeric: "tabular-nums" }}>{s.duration}</span>
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
            <ExpandedLyricsPreview
              song={s}
              currentTime={prog}
              onSeek={onSeek}
              onOpenLyrics={onOpenLyrics}
            />

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
    </>
  );
}

function ExpandedLyricsPreview({ song, currentTime, onSeek, onOpenLyrics }) {
  const [status, setStatus] = useState("idle");
  const [lyrics, setLyrics] = useState(null);
  const [offsetMs, setOffsetMs] = useState(0);
  const songId = song?.id;

  useEffect(() => {
    if (!song) return;
    const controller = new AbortController();
    Promise.resolve().then(() => {
      if (controller.signal.aborted) return;
      setStatus("loading");
      setLyrics(prev => prev?.trackId === song.id ? prev : null);
    });

    loadLyricsForSong(song, { signal: controller.signal })
      .then(result => {
        setLyrics(result);
        setStatus("ready");
      })
      .catch(err => {
        if (err?.name === "AbortError") return;
        setLyrics(null);
        setStatus("error");
      });

    return () => controller.abort();
  }, [song]);

  useEffect(() => {
    if (!songId) return;
    Promise.resolve().then(() => setOffsetMs(loadLyricsOffsetMs(songId)));
  }, [songId]);

  const syncedLines = useMemo(() => lyrics?.syncedLines ?? [], [lyrics?.syncedLines]);
  const plainLines = useMemo(() => (
    String(lyrics?.plainText || "")
      .split(/\r?\n/)
      .map(line => line.trim())
      .filter(Boolean)
  ), [lyrics?.plainText]);

  const activeIndex = useMemo(() => {
    if (lyrics?.type !== "synced" || syncedLines.length === 0) return -1;
    const syncedTime = currentTime + offsetMs / 1000;
    let index = 0;
    for (let i = 0; i < syncedLines.length; i += 1) {
      if (syncedLines[i].time <= syncedTime + 0.15) index = i;
      else break;
    }
    return index;
  }, [currentTime, lyrics?.type, offsetMs, syncedLines]);

  const previewLines = useMemo(() => {
    if (lyrics?.type === "synced") {
      const start = Math.max(0, activeIndex <= 0 ? 0 : activeIndex - 1);
      return syncedLines.slice(start, start + 3).map((line, offset) => ({
        ...line,
        index: start + offset,
      }));
    }
    return plainLines.slice(0, 3).map((text, index) => ({ text, index }));
  }, [activeIndex, lyrics?.type, plainLines, syncedLines]);

  const emptyCopy = lyrics?.type === "instrumental"
    ? "Instrumental track"
    : status === "error"
      ? "Lyrics failed to load"
      : "Lyrics not available for this track.";

  return (
    <div style={{ borderTop: "1px solid rgba(255,255,255,0.08)", paddingTop: 20 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
        <div style={{ fontSize: 11, fontWeight: 600, color: "rgba(255,255,255,0.36)", textTransform: "uppercase", letterSpacing: "0.08em" }}>
          Lyrics
        </div>
        {onOpenLyrics && (
          <button
            type="button"
            aria-label="Open full lyrics"
            onClick={onOpenLyrics}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              fontSize: 11,
              fontWeight: 700,
              color: "var(--island-muted)",
              padding: "2px 4px",
              borderRadius: 4,
              transition: "color 100ms ease, background 100ms ease",
            }}
            onMouseEnter={e => { e.currentTarget.style.color = "var(--island-text)"; e.currentTarget.style.background = "var(--island-hover)"; }}
            onMouseLeave={e => { e.currentTarget.style.color = "var(--island-muted)"; e.currentTarget.style.background = "transparent"; }}
          >
            Open
          </button>
        )}
      </div>

      {status === "loading" ? (
        <div style={{ display: "grid", gap: 9 }}>
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              style={{
                width: `${86 - i * 12}%`,
                height: 17,
                borderRadius: 5,
                background: "linear-gradient(90deg, var(--island-hover), var(--island-rail), var(--island-hover))",
                backgroundSize: "220% 100%",
                animation: "lyrics-panel-skeleton 1.2s ease-in-out infinite",
              }}
            />
          ))}
        </div>
      ) : previewLines.length > 0 ? (
        <div style={{ display: "grid", gap: 2, animation: "lyrics-panel-content-in 260ms cubic-bezier(0.2, 0, 0, 1)" }}>
          {previewLines.map(line => {
            const active = lyrics?.type === "synced" && line.index === activeIndex;
            return (
              <button
                key={`${line.index}-${line.time ?? line.text}`}
                type="button"
                onClick={() => typeof line.time === "number" && onSeek?.(Math.max(0, line.time - offsetMs / 1000))}
                style={{
                  border: "none",
                  background: active ? "rgba(249,115,22,0.10)" : "transparent",
                  borderRadius: 6,
                  textAlign: "left",
                  cursor: typeof line.time === "number" ? "pointer" : "default",
                  padding: "5px 6px",
                  color: active ? "#fff" : "var(--island-fill)",
                  opacity: active ? 1 : 0.58,
                  fontSize: active ? 15 : 14,
                  fontWeight: active ? 800 : 650,
                  lineHeight: 1.45,
                  transition: "opacity 180ms ease, color 180ms ease, background 180ms ease, transform 180ms cubic-bezier(0.2,0,0,1), font-size 180ms ease",
                  transform: active ? "translateX(2px)" : "translateX(0)",
                }}
              >
                {line.text || "..."}
              </button>
            );
          })}
        </div>
      ) : (
        <div style={{ fontSize: 14, color: "rgba(255,255,255,0.26)", fontStyle: "italic" }}>
          {emptyCopy}
        </div>
      )}
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
