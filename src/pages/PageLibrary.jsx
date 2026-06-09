import { useState, useMemo, useRef, useEffect } from "react";
import { C, TEXT, BORDER } from "../constants/theme";
import { getSongImage } from "../data/media";
import PlaylistCover from "../components/PlaylistCover";

const FILTER_TABS = ["Danh sách phát", "Album", "Nghệ sĩ"];
const TRACK_SORT_OPTIONS = [
  { key: "custom", label: "Custom order" },
  { key: "title", label: "Title" },
  { key: "artist", label: "Artist" },
  { key: "album", label: "Album" },
  { key: "date", label: "Date added" },
  { key: "duration", label: "Duration" },
];

function dateLabel(song) {
  return song.dateAdded ?? "Feb 23, 2022";
}

function LibraryTrackRow({ song, index, cur, likedIds, onPlay, onLike }) {
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
        display: "grid",
        gridTemplateColumns: "36px minmax(210px,2fr) minmax(150px,1fr) 118px 54px 34px",
        alignItems: "center",
        gap: 12,
        minHeight: 52,
        padding: "0 10px",
        borderRadius: 6,
        cursor: "pointer",
        background: playing ? `${C[500]}12` : hov ? "rgba(255,255,255,0.06)" : "transparent",
        transition: "background 0.15s",
      }}
    >
      <div style={{
        fontSize: 12,
        color: playing ? C[400] : "rgba(255,255,255,0.45)",
        textAlign: "center",
        fontVariantNumeric: "tabular-nums",
      }}>
        {hov && !playing ? "▶" : index + 1}
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 12, minWidth: 0 }}>
        <div style={{
          width: 40,
          height: 40,
          borderRadius: 5,
          background: song.bg,
          flexShrink: 0,
          overflow: "hidden",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}>
          {cover ? (
            <img src={cover} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
          ) : (
            <span style={{ fontSize: 14, color: "rgba(255,255,255,0.7)" }}>♪</span>
          )}
        </div>
        <div style={{ minWidth: 0 }}>
          <div style={{
            fontSize: 13,
            fontWeight: 600,
            color: playing ? C[400] : TEXT.primary,
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
            marginBottom: 2,
          }}>
            {song.title}
          </div>
          <div style={{
            fontSize: 11,
            color: TEXT.secondary,
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}>
            {song.artist}
          </div>
        </div>
      </div>

      <div style={{ fontSize: 12, color: TEXT.secondary, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
        {song.album}
      </div>
      <div style={{ fontSize: 12, color: TEXT.secondary }}>
        {dateLabel(song)}
      </div>
      <div style={{ fontSize: 12, color: TEXT.secondary, textAlign: "right", fontVariantNumeric: "tabular-nums" }}>
        {song.duration}
      </div>
      <button
        type="button"
        onClick={e => { e.stopPropagation(); onLike(song.id); }}
        style={{
          background: "none",
          border: "none",
          cursor: "pointer",
          color: liked ? "#fb7185" : "rgba(255,255,255,0)",
          opacity: liked || hov ? 1 : 0,
          fontSize: 15,
          lineHeight: 1,
          transition: "opacity 0.15s, color 0.15s, transform 0.1s",
        }}
        onMouseEnter={e => { e.currentTarget.style.transform = "scale(1.15)"; }}
        onMouseLeave={e => { e.currentTarget.style.transform = "scale(1)"; }}
      >
        {liked ? "♥" : "♡"}
      </button>
    </div>
  );
}

/* ── PlaylistCard ─────────────────────────────────────────────── */
function PlaylistCard({ pl, likedCount, coverSongs = [], isActive, onClick }) {
  const [hov, setHov] = useState(false);
  const meta =
    pl.type === "liked"
      ? `${likedCount} bài hát`
      : typeof pl.id === "string"
      ? "0 bài hát"
      : pl.songIds?.length
      ? `${pl.songIds.length} bài hát`
      : "Danh sách phát";

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
      <PlaylistCover
        pl={pl}
        songs={coverSongs}
        style={{ width: 56, height: 56, borderRadius: 8, boxShadow: "0 4px 12px rgba(0,0,0,0.3)" }}
      />
      <div style={{ minWidth: 0 }}>
        <div style={{
          fontSize: 14, fontWeight: 500,
          color: isActive ? C[400] : TEXT.primary,
          whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
        }}>
          {pl.type === "liked" ? "Bài hát đã thích" : pl.name}
        </div>
        <div style={{ fontSize: 12, color: TEXT.secondary, marginTop: 2 }}>
          {meta}
        </div>
      </div>
    </div>
  );
}

/* ── Page ─────────────────────────────────────────────────────── */
export default function PageLibrary({
  list, cur, onPlay, likedIds, onLike,
  userPlaylists = [],
  selectedPlaylistId,
  onSelectPlaylist,
  libraryFilter = "Danh sách phát",
  onSetLibraryFilter,
}) {
  const [trackSort, setTrackSort] = useState("custom");
  const [trackQuery, setTrackQuery] = useState("");
  const [showTrackSearch, setShowTrackSearch] = useState(false);
  const [showTrackSortMenu, setShowTrackSortMenu] = useState(false);
  const sortBtnRef = useRef(null);
  const [sortMenuPos, setSortMenuPos] = useState({ top: 0, right: 0 });

  const activePl =
    userPlaylists.find(pl => pl.id === selectedPlaylistId) ??
    userPlaylists[0] ??
    null;

  const likedSongs = list.filter(s => likedIds.has(s.id));
  const isLocalCreated = typeof activePl?.id === "string";
  const songMap = useMemo(() => new Map(list.map(s => [s.id, s])), [list]);

  const getCoverSongs = (pl) => {
    if (pl.type === "liked") {
      return Array.from(likedIds).slice(0, 4).map(id => songMap.get(id)).filter(Boolean);
    }
    if (!pl.songIds?.length) return [];
    return pl.songIds.slice(0, 4).map(id => songMap.get(id)).filter(Boolean);
  };

  const displaySongs = useMemo(() => {
    if (!activePl) return [];
    if (activePl.type === "liked") return likedSongs;
    if (isLocalCreated) return [];
    if (activePl.songIds?.length) {
      return activePl.songIds.map(id => songMap.get(id)).filter(Boolean);
    }
    return [];
  }, [activePl, likedSongs, isLocalCreated, songMap]);

  const visibleSongs = useMemo(() => {
    const q = trackQuery.trim().toLowerCase();
    let rows = displaySongs.map((song, originalIndex) => ({ song, originalIndex }));

    if (q) {
      rows = rows.filter(({ song }) =>
        song.title.toLowerCase().includes(q) ||
        song.artist.toLowerCase().includes(q) ||
        song.album.toLowerCase().includes(q) ||
        song.genre.toLowerCase().includes(q)
      );
    }

    const byText = key => (a, b) => a.song[key].localeCompare(b.song[key]);
    if (trackSort === "title") rows = [...rows].sort(byText("title"));
    if (trackSort === "artist") rows = [...rows].sort(byText("artist"));
    if (trackSort === "album") rows = [...rows].sort(byText("album"));
    if (trackSort === "duration") rows = [...rows].sort((a, b) => a.song.durationSecs - b.song.durationSecs);
    if (trackSort === "date") rows = [...rows].sort((a, b) => a.originalIndex - b.originalIndex);

    return rows;
  }, [displaySongs, trackQuery, trackSort]);

  const currentTrackSortLabel = TRACK_SORT_OPTIONS.find(opt => opt.key === trackSort)?.label ?? "Custom order";

  const openTrackSortMenu = () => {
    if (sortBtnRef.current) {
      const r = sortBtnRef.current.getBoundingClientRect();
      setSortMenuPos({ top: r.bottom + 6, right: window.innerWidth - r.right });
    }
    setShowTrackSortMenu(s => !s);
  };

  useEffect(() => {
    if (!showTrackSortMenu) return undefined;
    const onKeyDown = e => {
      if (e.key === "Escape") setShowTrackSortMenu(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [showTrackSortMenu]);

  /* filtered playlist list for left panel */
  const shownPlaylists =
    libraryFilter === "Danh sách phát" ? userPlaylists : [];

  return (
    <div style={{ animation: "slideUp 0.3s ease", display: "flex", height: "100%" }}>
      {/* ── Left: playlist list ── */}
      <div style={{
        width: 340, flexShrink: 0,
        borderRight: `0.5px solid ${BORDER}`,
        display: "flex", flexDirection: "column",
        overflow: "hidden",
      }}>
        {/* Header */}
        <div style={{ padding: "24px 20px 16px", flexShrink: 0 }}>
          <div style={{
            display: "flex", alignItems: "center",
            justifyContent: "space-between", marginBottom: 16,
          }}>
            <span style={{ fontSize: 20, fontWeight: 600, letterSpacing: -0.3 }}>Thư viện</span>
          </div>

          {/* Filter tabs */}
          <div style={{ display: "flex", gap: 6, overflowX: "auto", scrollbarWidth: "none" }}>
            {FILTER_TABS.map(t => (
              <button
                key={t}
                onClick={() => onSetLibraryFilter?.(t)}
                style={{
                  flexShrink: 0,
                  background: libraryFilter === t ? C[500] : "rgba(255,255,255,0.08)",
                  border: "none",
                  borderRadius: 9999,
                  padding: "5px 14px",
                  fontSize: 12, fontWeight: 500,
                  color: libraryFilter === t ? "#fff" : TEXT.secondary,
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
          {shownPlaylists.length === 0 ? (
            <div style={{ padding: "32px 12px", textAlign: "center", color: TEXT.secondary, fontSize: 13 }}>
              {libraryFilter === "Album"
                ? "Chưa có album nào"
                : libraryFilter === "Nghệ sĩ"
                ? "Chưa theo dõi nghệ sĩ nào"
                : "Thư viện trống"}
            </div>
          ) : (
            shownPlaylists.map(pl => (
              <PlaylistCard
                key={pl.id}
                pl={pl}
                likedCount={likedIds.size}
                coverSongs={getCoverSongs(pl)}
                isActive={activePl?.id === pl.id}
                onClick={() => onSelectPlaylist?.(pl.id)}
              />
            ))
          )}
        </div>
      </div>

      {/* ── Right: playlist detail ── */}
      <div style={{ flex: 1, overflowY: "auto" }}>
        {activePl ? (
          <>
            {/* Hero */}
            <div style={{
              padding: "40px 32px 28px",
              background: `linear-gradient(180deg, ${activePl.bg.match(/#[0-9a-f]{6}/i)?.[0] ?? "#1d1616"}33 0%, transparent 100%)`,
              display: "flex", alignItems: "flex-end", gap: 24,
            }}>
              <PlaylistCover
                pl={activePl}
                songs={displaySongs.slice(0, 4)}
                style={{
                  width: 160, height: 160, borderRadius: 10,
                  flexShrink: 0,
                  boxShadow: "0 12px 40px rgba(0,0,0,0.5)",
                  fontSize: 48,
                }}
              />
              <div>
                <div style={{
                  fontSize: 11, textTransform: "uppercase",
                  letterSpacing: 1.2, color: TEXT.secondary, marginBottom: 8,
                }}>
                  Danh sách phát
                </div>
                <div style={{ fontSize: 32, fontWeight: 700, letterSpacing: -0.5, marginBottom: 10 }}>
                  {activePl.type === "liked" ? "Bài hát đã thích" : activePl.name}
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
                disabled={displaySongs.length === 0}
                style={{
                  width: 52, height: 52, borderRadius: "50%",
                  background: C[500], border: "none",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 18, color: "#fff",
                  cursor: displaySongs.length === 0 ? "default" : "pointer",
                  opacity: displaySongs.length === 0 ? 0.4 : 1,
                  boxShadow: `0 6px 20px ${C[500]}60`,
                  transition: "transform 0.15s, opacity 0.15s",
                }}
                onMouseEnter={e => { if (displaySongs.length > 0) e.currentTarget.style.transform = "scale(1.06)"; }}
                onMouseLeave={e => { e.currentTarget.style.transform = "scale(1)"; }}
              >
                ▶
              </button>
              <span style={{ fontSize: 13, color: TEXT.secondary }}>
                {activePl.type === "liked" && likedIds.size === 0
                  ? "Bạn chưa thích bài hát nào"
                  : isLocalCreated && displaySongs.length === 0
                  ? "Danh sách phát trống"
                  : "Phát tất cả"}
              </span>
            </div>

            {/* Track tools + list */}
            <div style={{ padding: "0 24px 80px" }}>
              {displaySongs.length === 0 ? (
                <div style={{ textAlign: "center", padding: "60px 0", color: TEXT.secondary }}>
                  <div style={{ fontSize: 36, marginBottom: 14, opacity: 0.35 }}>
                    {activePl.type === "liked" ? "♡" : "♪"}
                  </div>
                  <div style={{ fontSize: 15, fontWeight: 500, marginBottom: 6 }}>
                    {activePl.type === "liked"
                      ? "Chưa có bài hát nào"
                      : "Danh sách phát trống"}
                  </div>
                  <div style={{ fontSize: 13, color: TEXT.tertiary }}>
                    {activePl.type === "liked"
                      ? "Nhấn ♡ để thêm bài hát yêu thích vào đây"
                      : "Hãy thêm bài hát vào danh sách này"}
                  </div>
                </div>
              ) : (
                <>
                  <div style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: 16,
                    padding: "0 4px 10px",
                  }}>
                    <div style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                      minWidth: 0,
                      flex: 1,
                    }}>
                      <button
                        type="button"
                        onClick={() => setShowTrackSearch(s => !s)}
                        style={{
                          width: 32,
                          height: 32,
                          borderRadius: "50%",
                          border: "none",
                          background: showTrackSearch || trackQuery ? "rgba(255,255,255,0.12)" : "transparent",
                          color: showTrackSearch || trackQuery ? "#fff" : TEXT.secondary,
                          cursor: "pointer",
                          fontSize: 14,
                          transition: "background 0.15s, color 0.15s",
                          flexShrink: 0,
                        }}
                      >
                        ⌕
                      </button>
                      <div style={{
                        overflow: "hidden",
                        width: showTrackSearch ? 260 : 0,
                        opacity: showTrackSearch ? 1 : 0,
                        transition: "width 180ms cubic-bezier(0.2,0,0,1), opacity 150ms ease",
                      }}>
                        <input
                          value={trackQuery}
                          onChange={e => setTrackQuery(e.target.value)}
                          placeholder="Tìm trong danh sách này"
                          autoFocus={showTrackSearch}
                          style={{
                            width: 260,
                            background: "rgba(255,255,255,0.1)",
                            border: "none",
                            borderRadius: 4,
                            padding: "7px 10px",
                            color: TEXT.primary,
                            fontSize: 12,
                            outline: "none",
                            boxSizing: "border-box",
                          }}
                        />
                      </div>
                    </div>

                    <div style={{ position: "relative", flexShrink: 0 }}>
                      <button
                        ref={sortBtnRef}
                        type="button"
                        onClick={openTrackSortMenu}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 6,
                          background: "transparent",
                          border: "none",
                          color: showTrackSortMenu ? "#fff" : TEXT.secondary,
                          cursor: "pointer",
                          fontSize: 12,
                          fontWeight: 600,
                          padding: "7px 4px",
                          transition: "color 0.15s",
                        }}
                      >
                        {currentTrackSortLabel}
                        <span style={{ fontSize: 9 }}>▾</span>
                      </button>

                      {showTrackSortMenu && (
                        <>
                          <div
                            style={{ position: "fixed", inset: 0, zIndex: 98 }}
                            onClick={() => setShowTrackSortMenu(false)}
                          />
                          <div style={{
                            position: "fixed",
                            top: sortMenuPos.top,
                            right: sortMenuPos.right,
                            width: 190,
                            padding: 8,
                            borderRadius: 8,
                            background: "#282828",
                            boxShadow: "rgba(0,0,0,0.6) 0px 16px 48px",
                            zIndex: 999,
                            transformOrigin: "top right",
                            animation: "menuIn 160ms cubic-bezier(0.2,0,0,1) both",
                          }}>
                            <div style={{
                              padding: "4px 12px 8px",
                              fontSize: 10,
                              fontWeight: 700,
                              color: "rgba(255,255,255,0.35)",
                              textTransform: "uppercase",
                              letterSpacing: 0.8,
                            }}>
                              Sort songs
                            </div>
                            {TRACK_SORT_OPTIONS.map(opt => (
                              <div
                                key={opt.key}
                                onClick={() => { setTrackSort(opt.key); setShowTrackSortMenu(false); }}
                                onMouseEnter={e => { e.currentTarget.style.background = "rgba(255,255,255,0.1)"; }}
                                onMouseLeave={e => { e.currentTarget.style.background = "transparent"; }}
                                style={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: 8,
                                  padding: "8px 12px",
                                  borderRadius: 4,
                                  cursor: "pointer",
                                  fontSize: 13,
                                  color: trackSort === opt.key ? C[400] : "rgba(255,255,255,0.85)",
                                  transition: "background 0.12s",
                                }}
                              >
                                <span style={{ width: 14, textAlign: "center", fontSize: 11 }}>
                                  {trackSort === opt.key ? "✓" : ""}
                                </span>
                                {opt.label}
                              </div>
                            ))}
                          </div>
                        </>
                      )}
                    </div>
                  </div>

                  <div style={{
                    display: "grid",
                    gridTemplateColumns: "36px minmax(210px,2fr) minmax(150px,1fr) 118px 54px 34px",
                    gap: 12,
                    alignItems: "center",
                    minHeight: 34,
                    padding: "0 10px",
                    borderBottom: `1px solid ${BORDER}`,
                    color: TEXT.secondary,
                    fontSize: 11,
                    textTransform: "uppercase",
                    letterSpacing: 0.6,
                  }}>
                    <span style={{ textAlign: "center" }}>#</span>
                    <span>Title</span>
                    <span>Album</span>
                    <span>Date added</span>
                    <span style={{ textAlign: "right" }}>Time</span>
                    <span />
                  </div>

                  {visibleSongs.length === 0 ? (
                    <div style={{ textAlign: "center", padding: "40px 0", color: TEXT.secondary, fontSize: 13 }}>
                      Không tìm thấy bài hát phù hợp
                    </div>
                  ) : (
                    visibleSongs.map(({ song }, i) => (
                      <LibraryTrackRow
                        key={song.id}
                        song={song}
                        index={i}
                        cur={cur}
                        onPlay={onPlay}
                        likedIds={likedIds}
                        onLike={onLike}
                      />
                    ))
                  )}
                </>
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
