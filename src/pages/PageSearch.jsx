import { useState, useMemo } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlay } from "@fortawesome/free-solid-svg-icons";
import TrackRow from "../components/TrackRow";
import PlaylistCover from "../components/PlaylistCover";
import { TEXT } from "../constants/theme";
import { getSongImage } from "../data/media";
import { deriveArtists, deriveAlbums } from "../data/derived";

const GENRES = [
  { label: "Tất cả", value: "__all__", bg: "linear-gradient(135deg,#f97316,#fbbf24)" },
  { label: "V-Pop", value: "V-Pop", bg: "linear-gradient(135deg,#e11d48,#fb7185)" },
  { label: "Pop", value: "Pop", bg: "linear-gradient(135deg,#ea580c,#fb923c)" },
  { label: "Ballad", value: "Ballad", bg: "linear-gradient(135deg,#7c2d12,#f97316)" },
  { label: "R&B", value: "R&B", bg: "linear-gradient(135deg,#d97706,#fbbf24)" },
  { label: "Hip-hop", value: "Hip-hop", bg: "linear-gradient(135deg,#92400e,#fbbf24)" },
  { label: "Dance", value: "Dance", bg: "linear-gradient(135deg,#be123c,#fb7185)" },
  { label: "EDM", value: "EDM", bg: "linear-gradient(135deg,#c2410c,#f59e0b)" },
  { label: "Rock", value: "Rock", bg: "linear-gradient(135deg,#1f1f1f,#7c2d12)" },
  { label: "Funk", value: "Funk", bg: "linear-gradient(135deg,#be123c,#fb7185)" },
  { label: "Indie", value: "Indie", bg: "linear-gradient(135deg,#7c2d12,#d97706)" },
];

function GenrePill({ genre, active, onClick }) {
  return (
    <div
      role="button"
      tabIndex={0}
      aria-pressed={active}
      onClick={onClick}
      onKeyDown={e => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onClick();
        }
      }}
      style={{
        borderRadius: 8,
        padding: "0 16px",
        height: 56,
        display: "flex",
        alignItems: "flex-end",
        paddingBottom: 10,
        background: active ? genre.bg : "rgba(255,255,255,0.07)",
        cursor: "pointer",
        transition: "opacity 0.15s, transform 0.15s",
        minWidth: 140,
        position: "relative",
        overflow: "hidden",
        outline: active ? `2px solid rgba(255,255,255,0.3)` : "none",
        outlineOffset: 2,
      }}
      onMouseEnter={e => { e.currentTarget.style.opacity = "0.85"; }}
      onMouseLeave={e => { e.currentTarget.style.opacity = "1"; }}
    >
      <span style={{ fontSize: 14, fontWeight: 600, color: "#fff", letterSpacing: -0.2 }}>
        {genre.label}
      </span>
      <span
        aria-hidden="true"
        style={{
          position: "absolute",
          right: -6,
          bottom: -8,
          fontSize: 42,
          opacity: 0.35,
          transform: "rotate(-20deg)",
          lineHeight: 1,
        }}
      >
        ♪
      </span>
    </div>
  );
}

function GroupHeading({ children, count }) {
  return (
    <div style={{ display: "flex", alignItems: "baseline", gap: 10, marginBottom: 12 }}>
      <h2 style={{ fontSize: 20, fontWeight: 700, letterSpacing: -0.3 }}>{children}</h2>
      {count != null && (
        <span style={{ fontSize: 12, color: TEXT.secondary }}>{count} kết quả</span>
      )}
    </div>
  );
}

/* Spotify-style top result card */
function TopResultCard({ result, onPlay, onOpenArtist, onOpenAlbum }) {
  const [hov, setHov] = useState(false);

  const isArtist = result.type === "artist";
  const entity = result.artist ?? result.album ?? result.song;
  const title = isArtist ? entity.name : result.type === "album" ? entity.name : entity.title;
  const subtitle = isArtist
    ? "Nghệ sĩ"
    : result.type === "album"
    ? `${entity.songCount > 1 ? "Album" : "Đĩa đơn"} · ${entity.artist}`
    : `Bài hát · ${entity.artist}`;
  const image = isArtist
    ? entity.image
    : result.type === "album"
    ? getSongImage(entity.representative)
    : getSongImage(entity);
  const bg = isArtist
    ? entity.topSong?.bg
    : result.type === "album"
    ? entity.representative.bg
    : entity.bg;
  const playTarget = isArtist
    ? entity.topSong
    : result.type === "album"
    ? entity.songs[0]
    : entity;

  const open = () => {
    if (isArtist) onOpenArtist(entity.name);
    else if (result.type === "album") onOpenAlbum(entity.name);
    else onPlay(entity);
  };

  return (
    <div
      role="button"
      tabIndex={0}
      aria-label={isArtist
        ? `Mở trang nghệ sĩ ${title}`
        : result.type === "album"
        ? `Mở album ${title}`
        : `Phát ${title}`}
      onClick={open}
      onKeyDown={e => {
        if (e.target !== e.currentTarget) return;
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          open();
        }
      }}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        position: "relative",
        padding: 20,
        borderRadius: 8,
        background: hov ? "rgba(255,255,255,0.09)" : "rgba(255,255,255,0.04)",
        transition: "background 0.25s cubic-bezier(0.2, 0, 0, 1)",
        cursor: "pointer",
        minHeight: 200,
      }}
    >
      <div style={{
        width: 92, height: 92,
        borderRadius: isArtist ? "50%" : 6,
        overflow: "hidden",
        background: bg ?? "#241a1a",
        marginBottom: 16,
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: 28, color: "rgba(255,255,255,0.85)",
        boxShadow: "rgba(0,0,0,0.5) 0px 8px 24px",
      }}>
        {image ? (
          <img src={image} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
        ) : (
          title[0]
        )}
      </div>
      <div style={{
        fontSize: 24, fontWeight: 700, color: "#fff", letterSpacing: -0.3,
        whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
        marginBottom: 8,
      }}>
        {title}
      </div>
      <span style={{
        display: "inline-block",
        fontSize: 12,
        fontWeight: 600,
        color: TEXT.primary,
        background: "rgba(0,0,0,0.4)",
        borderRadius: 9999,
        padding: "5px 12px",
      }}>
        {subtitle}
      </span>

      <button
        type="button"
        aria-label={`Phát ${title}`}
        className="card-play-btn"
        tabIndex={hov ? 0 : -1}
        onClick={e => { e.stopPropagation(); onPlay(playTarget); }}
        style={{
          position: "absolute", right: 18, bottom: 18,
          width: 48, height: 48, borderRadius: "50%",
          background: "#1ed760", border: "none",
          display: "flex", alignItems: "center", justifyContent: "center",
          color: "#000", cursor: "pointer",
          boxShadow: "rgba(0,0,0,0.5) 0px 8px 18px",
          opacity: hov ? 1 : 0,
          transform: hov ? "translateY(0) scale(1)" : "translateY(8px) scale(0.85)",
          pointerEvents: hov ? "auto" : "none",
        }}
      >
        <FontAwesomeIcon icon={faPlay} style={{ fontSize: 16, marginLeft: 2 }} />
      </button>
    </div>
  );
}

/* Round artist result card */
function ArtistResult({ artist, onOpenArtist }) {
  const [hov, setHov] = useState(false);
  return (
    <div
      role="button"
      tabIndex={0}
      aria-label={`Mở trang nghệ sĩ ${artist.name}`}
      onClick={() => onOpenArtist(artist.name)}
      onKeyDown={e => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onOpenArtist(artist.name);
        }
      }}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        flexShrink: 0,
        width: 150,
        padding: 12,
        borderRadius: 8,
        textAlign: "center",
        background: hov ? "rgba(255,255,255,0.07)" : "rgba(255,255,255,0.03)",
        transition: "background 0.2s",
        cursor: "pointer",
      }}
    >
      <div style={{
        width: 110, height: 110, borderRadius: "50%",
        margin: "0 auto 10px",
        background: artist.topSong?.bg ?? "#241a1a",
        overflow: "hidden",
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: 32, color: "rgba(255,255,255,0.85)",
        boxShadow: "rgba(0,0,0,0.4) 0px 6px 18px",
      }}>
        {artist.image ? (
          <img src={artist.image} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
        ) : (
          artist.name[0]
        )}
      </div>
      <div style={{
        fontSize: 13, fontWeight: 600, color: TEXT.primary,
        whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
      }}>
        {artist.name}
      </div>
      <div style={{ fontSize: 11, color: TEXT.secondary, marginTop: 3 }}>Nghệ sĩ</div>
    </div>
  );
}

/* Square album result card */
function AlbumResult({ album, onOpenAlbum, onPlay }) {
  const [hov, setHov] = useState(false);
  const cover = getSongImage(album.representative);
  return (
    <div
      role="button"
      tabIndex={0}
      aria-label={`Mở album ${album.name}`}
      onClick={() => onOpenAlbum(album.name)}
      onKeyDown={e => {
        if (e.target !== e.currentTarget) return; // ignore keys on the nested play button
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onOpenAlbum(album.name);
        }
      }}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        flexShrink: 0,
        width: 150,
        padding: 12,
        borderRadius: 8,
        background: hov ? "rgba(255,255,255,0.08)" : "rgba(255,255,255,0.03)",
        transition: "background 0.2s",
        cursor: "pointer",
      }}
    >
      <div style={{ position: "relative", marginBottom: 10 }}>
        <div style={{
          width: 126, height: 126, borderRadius: 6,
          background: album.representative.bg ?? "rgba(255,255,255,0.08)",
          overflow: "hidden",
          boxShadow: "rgba(0,0,0,0.4) 0px 6px 18px",
        }}>
          {cover && (
            <img src={cover} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
          )}
        </div>
        <button
          type="button"
          aria-label={`Phát album ${album.name}`}
          className="card-play-btn"
          tabIndex={hov ? 0 : -1}
          onClick={e => { e.stopPropagation(); onPlay(album.songs[0]); }}
          style={{
            position: "absolute", right: 6, bottom: 6,
            width: 36, height: 36, borderRadius: "50%",
            background: "#1ed760", border: "none",
            display: "flex", alignItems: "center", justifyContent: "center",
            color: "#000", cursor: "pointer",
            boxShadow: "rgba(0,0,0,0.5) 0px 6px 14px",
            opacity: hov ? 1 : 0,
            transform: hov ? "translateY(0) scale(1)" : "translateY(8px) scale(0.85)",
            pointerEvents: hov ? "auto" : "none",
          }}
        >
          <FontAwesomeIcon icon={faPlay} style={{ fontSize: 12, marginLeft: 1 }} />
        </button>
      </div>
      <div style={{
        fontSize: 13, fontWeight: 600, color: TEXT.primary,
        whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", marginBottom: 3,
      }}>
        {album.name}
      </div>
      <div style={{
        fontSize: 11, color: TEXT.secondary,
        whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
      }}>
        {album.artist} · {album.songCount > 1 ? "Album" : "Đĩa đơn"}
      </div>
    </div>
  );
}

/* Compact playlist result row */
function PlaylistResult({ pl, coverSongs, meta, onOpen }) {
  const [hov, setHov] = useState(false);
  const displayName = pl.type === "liked" ? "Bài hát đã thích" : pl.name;
  return (
    <div
      role="button"
      tabIndex={0}
      aria-label={`Mở danh sách phát ${displayName}`}
      onClick={onOpen}
      onKeyDown={e => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onOpen();
        }
      }}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 14,
        padding: "8px 10px",
        borderRadius: 8,
        cursor: "pointer",
        background: hov ? "rgba(255,255,255,0.06)" : "transparent",
        transition: "background 0.15s",
      }}
    >
      <PlaylistCover
        pl={pl}
        songs={coverSongs}
        style={{ width: 52, height: 52, borderRadius: 6, boxShadow: "0 4px 12px rgba(0,0,0,0.3)" }}
      />
      <div style={{ minWidth: 0 }}>
        <div style={{
          fontSize: 13, fontWeight: 600, color: TEXT.primary,
          whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
        }}>
          {displayName}
        </div>
        <div style={{ fontSize: 11, color: TEXT.secondary, marginTop: 2 }}>{meta}</div>
      </div>
    </div>
  );
}

export default function PageSearch({
  list, query, cur, onPlay, likedIds, onLike, onAddToQueue,
  userPlaylists = [],
  onOpenArtist,
  onOpenAlbum,
  onOpenPlaylist,
}) {
  const [genre, setGenre] = useState(null);

  const q = query.trim().toLowerCase();
  const isSearching = q.length > 0;
  const hasGenreFilter = genre !== null;

  /* Genre browse results (no text query) */
  const genreResults = useMemo(() => {
    if (!hasGenreFilter) return [];
    if (genre === "__all__") return list;
    return list.filter(s => s.genre === genre);
  }, [list, genre, hasGenreFilter]);

  /* Grouped text-query results */
  const songMatches = useMemo(() => {
    if (!isSearching) return [];
    return list.filter(
      s =>
        s.title.toLowerCase().includes(q) ||
        s.artist.toLowerCase().includes(q) ||
        s.album.toLowerCase().includes(q)
    );
  }, [list, q, isSearching]);

  const artistMatches = useMemo(() => {
    if (!isSearching) return [];
    return deriveArtists(list)
      .filter(a => a.name.toLowerCase().includes(q))
      .sort((a, b) => b.totalPlays - a.totalPlays)
      .slice(0, 6);
  }, [list, q, isSearching]);

  const albumMatches = useMemo(() => {
    if (!isSearching) return [];
    return deriveAlbums(list)
      .filter(al => al.name.toLowerCase().includes(q) || al.artist.toLowerCase().includes(q))
      .sort((a, b) => b.totalPlays - a.totalPlays)
      .slice(0, 6);
  }, [list, q, isSearching]);

  const songMap = useMemo(() => new Map(list.map(s => [s.id, s])), [list]);

  const playlistMatches = useMemo(() => {
    if (!isSearching) return [];
    return userPlaylists
      .filter(pl => {
        const displayName = pl.type === "liked" ? "bài hát đã thích" : pl.name.toLowerCase();
        return displayName.includes(q) || pl.name.toLowerCase().includes(q);
      })
      .slice(0, 4);
  }, [userPlaylists, q, isSearching]);

  const getCoverSongs = (pl) => {
    if (pl.type === "liked") {
      return [...likedIds].slice(0, 4).map(id => songMap.get(id)).filter(Boolean);
    }
    return (pl.songIds ?? []).slice(0, 4).map(id => songMap.get(id)).filter(Boolean);
  };

  const getPlaylistMeta = (pl) => {
    if (pl.type === "liked") return `Danh sách phát · ${likedIds.size} bài hát`;
    const count = pl.songIds?.length ?? 0;
    return `Danh sách phát · ${count} bài hát`;
  };

  const totalResults =
    songMatches.length + artistMatches.length + albumMatches.length + playlistMatches.length;

  /* Best match: prefer name-prefix artist, then prefix album, then top song */
  const topResult = useMemo(() => {
    if (!isSearching) return null;
    const prefixArtist = artistMatches.find(a => a.name.toLowerCase().startsWith(q));
    if (prefixArtist) return { type: "artist", artist: prefixArtist };
    const prefixAlbum = albumMatches.find(al => al.name.toLowerCase().startsWith(q));
    if (prefixAlbum) return { type: "album", album: prefixAlbum };
    if (songMatches[0]) return { type: "song", song: songMatches[0] };
    if (artistMatches[0]) return { type: "artist", artist: artistMatches[0] };
    if (albumMatches[0]) return { type: "album", album: albumMatches[0] };
    return null;
  }, [isSearching, q, artistMatches, albumMatches, songMatches]);

  return (
    <div style={{ animation: "slideUp 0.3s ease", padding: "32px 28px 80px" }}>
      {/* ── Browse state: genre grid (query empty) ── */}
      {!isSearching && (
        <>
          <h1 style={{ fontSize: 22, fontWeight: 600, letterSpacing: -0.3, marginBottom: 20 }}>
            Duyệt qua tất cả
          </h1>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))",
              gap: 10,
              marginBottom: 40,
            }}
          >
            {GENRES.map(g => (
              <GenrePill
                key={g.label}
                genre={g}
                active={genre === g.value}
                onClick={() => setGenre(prev => (prev === g.value ? null : g.value))}
              />
            ))}
          </div>

          {hasGenreFilter && (
            <section>
              <GroupHeading count={genreResults.length}>
                {genre === "__all__" ? "Tất cả bài hát" : genre}
              </GroupHeading>
              {genreResults.map((s, i) => (
                <TrackRow
                  key={s.id}
                  song={s}
                  index={i}
                  cur={cur}
                  onPlay={onPlay}
                  likedIds={likedIds}
                  onLike={onLike}
                  onAddToQueue={onAddToQueue}
                />
              ))}
            </section>
          )}
        </>
      )}

      {/* ── Grouped search results (query present) ── */}
      {isSearching && (
        totalResults === 0 ? (
          <div style={{ textAlign: "center", padding: "80px 0", color: TEXT.secondary }}>
            <div style={{ fontSize: 16, fontWeight: 500, marginBottom: 8 }}>
              Không tìm thấy kết quả cho "{query}"
            </div>
            <div style={{ fontSize: 13, color: TEXT.tertiary }}>
              Hãy kiểm tra chính tả hoặc thử từ khóa khác
            </div>
          </div>
        ) : (
          <>
            {/* Top result + songs */}
            {(topResult || songMatches.length > 0) && (
              <section style={{
                marginBottom: 36,
                display: "grid",
                gridTemplateColumns: topResult && songMatches.length > 0
                  ? "minmax(280px, 1fr) minmax(0, 1.7fr)"
                  : "1fr",
                gap: 24,
                alignItems: "start",
              }}>
                {topResult && (
                  <div>
                    <GroupHeading>Kết quả hàng đầu</GroupHeading>
                    <TopResultCard
                      result={topResult}
                      onPlay={onPlay}
                      onOpenArtist={onOpenArtist}
                      onOpenAlbum={onOpenAlbum}
                    />
                  </div>
                )}
                {songMatches.length > 0 && (
                  <div>
                    <GroupHeading count={songMatches.length}>Bài hát</GroupHeading>
                    {songMatches.slice(0, topResult ? 4 : 10).map((s, i) => (
                      <TrackRow
                        key={s.id}
                        song={s}
                        index={i}
                        cur={cur}
                        onPlay={onPlay}
                        likedIds={likedIds}
                        onLike={onLike}
                        onAddToQueue={onAddToQueue}
                      />
                    ))}
                  </div>
                )}
              </section>
            )}

            {/* Artists */}
            {artistMatches.length > 0 && (
              <section style={{ marginBottom: 36 }}>
                <GroupHeading>Nghệ sĩ</GroupHeading>
                <div
                  className="hscroll"
                  style={{
                    display: "flex", gap: 14, overflowX: "auto",
                    padding: "4px 0 8px", scrollbarWidth: "none",
                  }}
                >
                  {artistMatches.map(a => (
                    <ArtistResult key={a.name} artist={a} onOpenArtist={onOpenArtist} />
                  ))}
                </div>
              </section>
            )}

            {/* Albums */}
            {albumMatches.length > 0 && (
              <section style={{ marginBottom: 36 }}>
                <GroupHeading>Album</GroupHeading>
                <div
                  className="hscroll"
                  style={{
                    display: "flex", gap: 14, overflowX: "auto",
                    padding: "4px 0 8px", scrollbarWidth: "none",
                  }}
                >
                  {albumMatches.map(al => (
                    <AlbumResult key={al.name} album={al} onOpenAlbum={onOpenAlbum} onPlay={onPlay} />
                  ))}
                </div>
              </section>
            )}

            {/* Playlists */}
            {playlistMatches.length > 0 && (
              <section style={{ marginBottom: 36 }}>
                <GroupHeading>Danh sách phát</GroupHeading>
                <div style={{ maxWidth: 480 }}>
                  {playlistMatches.map(pl => (
                    <PlaylistResult
                      key={pl.id}
                      pl={pl}
                      coverSongs={getCoverSongs(pl)}
                      meta={getPlaylistMeta(pl)}
                      onOpen={() => onOpenPlaylist?.(pl)}
                    />
                  ))}
                </div>
              </section>
            )}
          </>
        )
      )}
    </div>
  );
}
