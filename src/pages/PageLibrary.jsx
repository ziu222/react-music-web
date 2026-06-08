import { useState } from "react";
import playlists from "../data/playlists";
import TrackRow from "../components/TrackRow";
import { C, G, R, BG, TEXT, BORDER } from "../constants/theme";

const FILTER_TABS = ["Danh sách phát", "Album", "Nghệ sĩ", "Podcast"];

function PlaylistCard({ pl, likedCount, isActive, onClick }) {
  const [hov, setHov] = useState(false);
  const count = pl.type === "liked" ? likedCount : Math.floor(Math.random() * 20) + 5;

  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 14,
        padding: "8px 10px",
        borderRadius: 8,
        cursor: "pointer",
        background: isActive
          ? "rgba(255,255,255,0.1)"
          : hov
          ? "rgba(255,255,255,0.06)"
          : "transparent",
        transition: "background 0.15s",
      }}
    >
      <div
        style={{
          width: 56,
          height: 56,
          borderRadius: pl.type === "liked" ? 8 : 8,
          background: pl.bg,
          flexShrink: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 20,
          color: "rgba(255,255,255,0.85)",
          boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
        }}
      >
        {pl.type === "liked" ? "♥" : "♪"}
      </div>
      <div style={{ minWidth: 0 }}>
        <div
          style={{
            fontSize: 14,
            fontWeight: 500,
            color: isActive ? C[400] : TEXT.primary,
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {pl.name}
        </div>
        <div style={{ fontSize: 12, color: TEXT.secondary, marginTop: 2 }}>
          Danh sách phát · {count} bài hát
        </div>
      </div>
    </div>
  );
}

export default function PageLibrary({ list, cur, onPlay, likedIds, onLike }) {
  const [filter, setFilter] = useState("Danh sách phát");
  const [activePl, setActivePl] = useState(playlists[0]);

  const likedSongs = list.filter(s => likedIds.has(s.id));
  const displaySongs = activePl?.type === "liked" ? likedSongs : list.slice(0, 8);

  return (
    <div style={{ animation: "slideUp 0.3s ease", display: "flex", height: "100%" }}>
      {/* Left: playlist list */}
      <div
        style={{
          width: 340,
          flexShrink: 0,
          borderRight: `0.5px solid ${BORDER}`,
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        }}
      >
        {/* Header */}
        <div style={{ padding: "24px 20px 16px", flexShrink: 0 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: 16,
            }}
          >
            <span style={{ fontSize: 20, fontWeight: 600, letterSpacing: -0.3 }}>Thư viện</span>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 4,
                background: "rgba(255,255,255,0.06)",
                borderRadius: 9999,
                padding: "5px 12px",
                cursor: "pointer",
                fontSize: 12,
                color: TEXT.secondary,
              }}
            >
              <span style={{ fontSize: 16, lineHeight: 1 }}>+</span> Tạo mới
            </div>
          </div>

          {/* Filter tabs */}
          <div style={{ display: "flex", gap: 6, overflowX: "auto", scrollbarWidth: "none" }}>
            {FILTER_TABS.map(t => (
              <button
                key={t}
                onClick={() => setFilter(t)}
                style={{
                  flexShrink: 0,
                  background: filter === t ? C[500] : "rgba(255,255,255,0.08)",
                  border: "none",
                  borderRadius: 9999,
                  padding: "5px 14px",
                  fontSize: 12,
                  fontWeight: 500,
                  color: filter === t ? "#fff" : TEXT.secondary,
                  cursor: "pointer",
                  transition: "all 0.15s",
                }}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        {/* Playlist scroll */}
        <div style={{ flex: 1, overflowY: "auto", padding: "0 10px 16px" }}>
          {playlists.map(pl => (
            <PlaylistCard
              key={pl.id}
              pl={pl}
              likedCount={likedIds.size}
              isActive={activePl?.id === pl.id}
              onClick={() => setActivePl(pl)}
            />
          ))}
        </div>
      </div>

      {/* Right: playlist detail */}
      <div style={{ flex: 1, overflowY: "auto" }}>
        {activePl ? (
          <>
            {/* Hero */}
            <div
              style={{
                padding: "40px 32px 28px",
                background: `linear-gradient(180deg, ${activePl.bg.match(/#[0-9a-f]{6}/i)?.[0] ?? "#1d1616"}33 0%, transparent 100%)`,
                display: "flex",
                alignItems: "flex-end",
                gap: 24,
              }}
            >
              <div
                style={{
                  width: 160,
                  height: 160,
                  borderRadius: 10,
                  background: activePl.bg,
                  flexShrink: 0,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 48,
                  color: "rgba(255,255,255,0.85)",
                  boxShadow: "0 12px 40px rgba(0,0,0,0.5)",
                }}
              >
                {activePl.type === "liked" ? "♥" : "♪"}
              </div>
              <div>
                <div
                  style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: 1.2, color: TEXT.secondary, marginBottom: 8 }}
                >
                  Danh sách phát
                </div>
                <div style={{ fontSize: 32, fontWeight: 700, letterSpacing: -0.5, marginBottom: 10 }}>
                  {activePl.name}
                </div>
                <div style={{ fontSize: 13, color: TEXT.secondary }}>
                  {displaySongs.length} bài hát
                </div>
              </div>
            </div>

            {/* Play button row */}
            <div style={{ padding: "16px 32px 12px", display: "flex", alignItems: "center", gap: 16 }}>
              <button
                onClick={() => displaySongs[0] && onPlay(displaySongs[0])}
                style={{
                  width: 52,
                  height: 52,
                  borderRadius: "50%",
                  background: C[500],
                  border: "none",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 18,
                  color: "#fff",
                  cursor: "pointer",
                  boxShadow: `0 6px 20px ${C[500]}60`,
                  transition: "transform 0.15s",
                }}
                onMouseEnter={e => { e.currentTarget.style.transform = "scale(1.06)"; }}
                onMouseLeave={e => { e.currentTarget.style.transform = "scale(1)"; }}
                disabled={displaySongs.length === 0}
              >
                ▶
              </button>
              <span style={{ fontSize: 13, color: TEXT.secondary }}>
                {activePl.type === "liked" && likedIds.size === 0
                  ? "Bạn chưa thích bài hát nào"
                  : "Phát tất cả"}
              </span>
            </div>

            {/* Track list */}
            <div style={{ padding: "0 24px 80px" }}>
              {displaySongs.length === 0 ? (
                <div
                  style={{
                    textAlign: "center",
                    padding: "60px 0",
                    color: TEXT.secondary,
                  }}
                >
                  <div style={{ fontSize: 36, marginBottom: 14, opacity: 0.35 }}>♡</div>
                  <div style={{ fontSize: 15, fontWeight: 500, marginBottom: 6 }}>
                    Chưa có bài hát nào
                  </div>
                  <div style={{ fontSize: 13, color: TEXT.tertiary }}>
                    Nhấn ♡ để thêm bài hát yêu thích vào đây
                  </div>
                </div>
              ) : (
                displaySongs.map((s, i) => (
                  <TrackRow
                    key={s.id}
                    song={s}
                    index={i}
                    cur={cur}
                    onPlay={onPlay}
                    likedIds={likedIds}
                    onLike={onLike}
                  />
                ))
              )}
            </div>
          </>
        ) : (
          <div style={{ padding: 40, color: TEXT.secondary }}>
            Chọn danh sách phát để xem
          </div>
        )}
      </div>
    </div>
  );
}
