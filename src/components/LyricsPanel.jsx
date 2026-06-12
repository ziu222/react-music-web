import { useEffect, useMemo, useRef, useState } from "react";
import { Music2, X } from "lucide-react";
import { loadLyricsForSong } from "../lib/lyrics";

export default function LyricsPanel({ isOpen, onClose, currentSong, currentTime = 0, onSeek }) {
  const [status, setStatus] = useState("idle");
  const [lyrics, setLyrics] = useState(null);
  const lineRefs = useRef([]);

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (!isOpen || !currentSong) return;
    const controller = new AbortController();
    Promise.resolve().then(() => {
      if (controller.signal.aborted) return;
      setStatus("loading");
      setLyrics(prev => prev?.trackId === currentSong.id ? prev : null);
    });

    loadLyricsForSong(currentSong, { signal: controller.signal })
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
  }, [isOpen, currentSong]);

  const syncedLines = useMemo(() => lyrics?.syncedLines ?? [], [lyrics?.syncedLines]);
  const plainLines = useMemo(() => (
    String(lyrics?.plainText || "")
      .split(/\r?\n/)
      .map(line => line.trim())
      .filter(Boolean)
  ), [lyrics?.plainText]);

  const activeIndex = useMemo(() => {
    if (lyrics?.type !== "synced" || syncedLines.length === 0) return -1;
    let index = 0;
    for (let i = 0; i < syncedLines.length; i += 1) {
      if (syncedLines[i].time <= currentTime + 0.15) index = i;
      else break;
    }
    return index;
  }, [currentTime, lyrics?.type, syncedLines]);

  useEffect(() => {
    if (!isOpen || activeIndex < 0) return;
    lineRefs.current[activeIndex]?.scrollIntoView({ block: "center", behavior: "smooth" });
  }, [activeIndex, isOpen]);

  const isLoading = status === "loading";
  const isUnavailable = status === "error"
    || !lyrics
    || lyrics.type === "unavailable"
    || (lyrics.type !== "instrumental" && syncedLines.length === 0 && plainLines.length === 0);

  return (
    <div
      role="dialog"
      aria-label="Lyrics"
      aria-hidden={!isOpen}
      aria-modal={isOpen}
      inert={!isOpen ? "" : undefined}
      className="player-side-panel"
      style={{
        position: "fixed",
        right: 0,
        top: 60,
        bottom: 90,
        width: 320,
        background: "var(--island-bg)",
        borderLeft: "1px solid var(--island-border)",
        zIndex: 100,
        display: "flex",
        flexDirection: "column",
        transform: isOpen ? "translateX(0)" : "translateX(100%)",
        transition: "transform 250ms cubic-bezier(0.4, 0, 0.2, 1)",
        overflow: "hidden",
        boxShadow: isOpen ? "-8px 0 24px rgba(0,0,0,0.36)" : "none",
        pointerEvents: isOpen ? undefined : "none",
      }}
    >
      <div style={{
        display: "flex", alignItems: "flex-start", justifyContent: "space-between",
        padding: "16px 16px 12px",
        borderBottom: "1px solid var(--island-border)",
        flexShrink: 0, gap: 8,
      }}>
        <div style={{ minWidth: 0, flex: 1 }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: "var(--island-text)" }}>Lyrics</div>
          {currentSong && (
            <div style={{ fontSize: 11, color: "var(--island-faint)", marginTop: 2, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
              {currentSong.title} - {currentSong.artist}
            </div>
          )}
        </div>
        <button
          type="button"
          aria-label="Close lyrics"
          onClick={onClose}
          style={{
            background: "transparent", border: "none", cursor: "pointer", flexShrink: 0,
            color: "var(--island-muted)", display: "inline-flex", padding: 4,
            borderRadius: 4, transition: "color 80ms ease",
          }}
          onMouseEnter={e => { e.currentTarget.style.color = "var(--island-text)"; }}
          onMouseLeave={e => { e.currentTarget.style.color = "var(--island-muted)"; }}
        >
          <X size={18} />
        </button>
      </div>

      <div style={{ flex: 1, overflowY: "auto", padding: "0 16px" }}>
        {isLoading ? (
          <LyricsSkeleton />
        ) : lyrics?.type === "instrumental" ? (
          <EmptyLyricsState
            title="Instrumental track"
            description="This track does not have lyrics."
          />
        ) : isUnavailable ? (
          <EmptyLyricsState
            title={status === "error" ? "Lyrics failed to load" : "Lyrics not available"}
            description={status === "error" ? "Check your connection and try again later." : "We don't have lyrics for this track yet."}
          />
        ) : lyrics?.type === "synced" ? (
          <div
            key={`synced-${currentSong?.id}`}
            style={{
              padding: "34px 0 56px",
              animation: "lyrics-panel-content-in 260ms cubic-bezier(0.2, 0, 0, 1)",
            }}
          >
            {syncedLines.map((line, i) => {
              const active = i === activeIndex;
              const past = i < activeIndex;
              return (
                <button
                  key={`${line.time}-${i}`}
                  ref={node => { lineRefs.current[i] = node; }}
                  type="button"
                  data-time={line.time}
                  onClick={() => onSeek?.(Math.max(0, Math.floor(line.time)))}
                  style={{
                    width: "100%",
                    display: "block",
                    border: "none",
                    background: active ? "rgba(249, 115, 22, 0.10)" : "transparent",
                    borderRadius: 8,
                    cursor: onSeek ? "pointer" : "default",
                    textAlign: "left",
                    padding: "7px 8px",
                    margin: "0 0 2px",
                    color: active ? "#fff" : past ? "var(--island-faint)" : "var(--island-fill)",
                    opacity: active ? 1 : past ? 0.48 : 0.78,
                    fontSize: active ? 18 : 16,
                    fontWeight: active ? 800 : 650,
                    lineHeight: 1.55,
                    transform: active ? "translateX(2px) scale(1.015)" : "translateX(0) scale(1)",
                    transition: "background 180ms ease, color 220ms ease, opacity 220ms ease, transform 220ms cubic-bezier(0.2, 0, 0, 1), font-size 220ms ease",
                  }}
                >
                  {line.text || "..."}
                </button>
              );
            })}
          </div>
        ) : (
          <div
            key={`plain-${currentSong?.id}`}
            style={{
              padding: "24px 0 40px",
              animation: "lyrics-panel-content-in 260ms cubic-bezier(0.2, 0, 0, 1)",
            }}
          >
            {plainLines.map((line, i) => (
              <p
                key={`${line}-${i}`}
                style={{
                  fontSize: 16,
                  fontWeight: 650,
                  color: "var(--island-fill)",
                  lineHeight: 1.75,
                  margin: "0 0 10px",
                }}
              >
                {line}
              </p>
            ))}
          </div>
        )}
      </div>

      {lyrics?.source === "lrclib" && !isUnavailable && !isLoading && (
        <div style={{
          borderTop: "1px solid var(--island-border)",
          padding: "8px 16px 10px",
          color: "var(--island-faint)",
          fontSize: 10,
          lineHeight: 1.4,
          flexShrink: 0,
        }}>
          Lyrics from LRCLIB
        </div>
      )}
    </div>
  );
}

function EmptyLyricsState({ title, description }) {
  return (
    <div style={{
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      height: "100%",
      padding: "0 16px",
      textAlign: "center",
      animation: "lyrics-panel-content-in 240ms cubic-bezier(0.2, 0, 0, 1)",
    }}>
      <div style={{
        width: 52,
        height: 52,
        borderRadius: 999,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        marginBottom: 14,
        color: "var(--island-muted)",
        background: "var(--island-hover)",
        border: "1px solid var(--island-border)",
      }}>
        <Music2 size={22} />
      </div>
      <div style={{ fontSize: 14, fontWeight: 700, color: "var(--island-muted)", marginBottom: 6 }}>
        {title}
      </div>
      <div style={{ fontSize: 12, color: "var(--island-faint)", lineHeight: 1.5 }}>
        {description}
      </div>
    </div>
  );
}

function LyricsSkeleton() {
  return (
    <div style={{ padding: "28px 0", animation: "lyrics-panel-content-in 220ms cubic-bezier(0.2, 0, 0, 1)" }}>
      {Array.from({ length: 9 }).map((_, i) => (
        <div
          key={i}
          style={{
            height: i % 3 === 0 ? 22 : 18,
            width: `${86 - (i % 4) * 11}%`,
            borderRadius: 6,
            margin: "0 0 13px",
            background: "linear-gradient(90deg, var(--island-hover), var(--island-rail), var(--island-hover))",
            backgroundSize: "220% 100%",
            animation: "lyrics-panel-skeleton 1.2s ease-in-out infinite",
          }}
        />
      ))}
    </div>
  );
}
