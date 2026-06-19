import { useMemo, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlay, faPause } from "@fortawesome/free-solid-svg-icons";
import SongCard from "../components/music/SongCard";
import HorizontalShelf from "../components/layout/HorizontalShelf";
import { getSongImage, artistImages, getPrimaryArtist } from "../data/media";

const ARTIST_COLORS = [
  "linear-gradient(135deg,#ea580c,#f97316)",
  "linear-gradient(135deg,#d97706,#fbbf24)",
  "linear-gradient(135deg,#e11d48,#fb7185)",
  "linear-gradient(135deg,#7c2d12,#f97316)",
  "linear-gradient(135deg,#1f1f1f,#7c2d12)",
  "linear-gradient(135deg,#c2410c,#f59e0b)",
  "linear-gradient(135deg,#be185d,#fb7185)",
  "linear-gradient(135deg,#92400e,#fbbf24)",
];

const US_UK_ARTISTS = new Set([
  "Justin Bieber", "The Weeknd", "Ed Sheeran", "Harry Styles", "Dua Lipa",
  "Adele", "Billie Eilish", "Taylor Swift", "Drake", "Post Malone",
  "Mark Ronson", "Ariana Grande", "Coldplay", "Imagine Dragons",
  "Lady Gaga & Bruno Mars", "Sabrina Carpenter", "Kendrick Lamar",
  "Chappell Roan",
]);

function getGreeting() {
  const h = new Date().getHours();
  if (h < 5) return "Đêm khuya an lành";
  if (h < 12) return "Chào buổi sáng";
  if (h < 18) return "Chào buổi chiều";
  return "Chào buổi tối";
}


function SectionHeader({ title }) {
  const [hov, setHov] = useState(false);
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 14 }}>
      <span style={{ fontSize: 22, fontWeight: 700, letterSpacing: -0.4 }}>{title}</span>
      <span
        onMouseEnter={() => setHov(true)}
        onMouseLeave={() => setHov(false)}
        style={{
          fontSize: 12,
          fontWeight: 600,
          color: hov ? "var(--text-primary)" : "var(--text-secondary)",
          textDecoration: hov ? "underline" : "none",
          cursor: "pointer",
          letterSpacing: 0.3,
          transition: "color 0.15s",
        }}
      >
        Hiện tất cả
      </span>
    </div>
  );
}

/* ── Quick pick tile (Spotify-style top grid) ──────────────────── */
function QuickTile({ song, cur, onPlay }) {
  const [hov, setHov] = useState(false);
  const playing = cur?.id === song.id;
  const cover = getSongImage(song);

  return (
    <div
      role="button"
      tabIndex={0}
      aria-label={`Phát ${song.title}`}
      onClick={() => onPlay(song)}
      onKeyDown={e => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onPlay(song);
        }
      }}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        display: "flex",
        alignItems: "center",
        position: "relative",
        height: 56,
        borderRadius: 6,
        overflow: "hidden",
        background: hov ? "var(--bg-el)" : "var(--bg-card)",
        border: "1px solid var(--border)",
        boxShadow: hov ? "var(--shadow-card-hover)" : "var(--shadow-card)",
        transition: "background 0.25s cubic-bezier(0.2, 0, 0, 1), box-shadow 0.25s cubic-bezier(0.2, 0, 0, 1)",
        cursor: "pointer",
      }}
    >
      <div style={{
        width: 56,
        height: 56,
        flexShrink: 0,
        background: song.bg ?? "rgba(255,255,255,0.08)",
        boxShadow: "var(--shadow-cover)",
      }}>
        {cover && (
          <img
            src={cover}
            alt=""
            style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
          />
        )}
      </div>
      <div style={{
        flex: 1,
        minWidth: 0,
        padding: "0 52px 0 12px",
        fontSize: 13,
        fontWeight: 600,
        color: playing ? "#fb923c" : "var(--text-primary)",
        whiteSpace: "nowrap",
        overflow: "hidden",
        textOverflow: "ellipsis",
        letterSpacing: -0.1,
      }}>
        {song.title}
      </div>
      <div
        className="card-play-btn"
        style={{
          position: "absolute",
          right: 10,
          top: "50%",
          width: 36,
          height: 36,
          borderRadius: "50%",
          background: "#f97316",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: "0 6px 16px rgba(0,0,0,0.5)",
          opacity: hov || playing ? 1 : 0,
          transform: hov || playing
            ? "translateY(-50%) scale(1)"
            : "translateY(-50%) scale(0.85)",
          pointerEvents: "none",
        }}
      >
        <FontAwesomeIcon
          icon={playing ? faPause : faPlay}
          style={{ fontSize: 12, color: "#fff", marginLeft: playing ? 0 : 1 }}
        />
      </div>
    </div>
  );
}

/* ── Album card ────────────────────────────────────────────────── */
function AlbumCard({ album, cur, onPlay, onOpenAlbum }) {
  const [hov, setHov] = useState(false);
  const cover = getSongImage(album.representative);
  const isActive = cur?.id === album.representative.id;

  return (
    <div
      onClick={() => onOpenAlbum?.(album.album)}
      onKeyDown={e => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onOpenAlbum?.(album.album);
        }
      }}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      role="button"
      tabIndex={0}
      style={{
        flexShrink: 0,
        width: 160,
        scrollSnapAlign: "start",
        padding: 12,
        borderRadius: 8,
        background: hov ? "var(--bg-el)" : "var(--bg-card)",
        border: "1px solid var(--border)",
        transition: "background 0.25s cubic-bezier(0.2, 0, 0, 1), box-shadow 0.25s cubic-bezier(0.2, 0, 0, 1)",
        boxShadow: hov ? "var(--shadow-card-hover)" : "var(--shadow-card)",
        cursor: "pointer",
      }}
    >
      <div style={{ position: "relative", marginBottom: 10 }}>
        <div style={{
          width: 136,
          height: 136,
          borderRadius: 6,
          background: album.representative.bg ?? "rgba(255,255,255,0.08)",
          overflow: "hidden",
          boxShadow: "var(--shadow-cover)",
        }}>
          {cover ? (
            <img
              src={cover}
              alt=""
              style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
            />
          ) : (
            <div style={{
              width: "100%", height: "100%",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 32, color: "rgba(255,255,255,0.4)",
            }}>
              ♪
            </div>
          )}
        </div>

        {/* Play button */}
        <div
          className="card-play-btn"
          onClick={e => {
            e.stopPropagation();
            onPlay(album.representative);
          }}
          style={{
            position: "absolute", right: 6, bottom: 6,
            width: 40, height: 40, borderRadius: "50%",
            background: "#f97316",
            display: "flex", alignItems: "center", justifyContent: "center",
            boxShadow: "rgba(0,0,0,0.5) 0px 8px 16px",
            opacity: hov || isActive ? 1 : 0,
            transform: hov || isActive ? "translateY(0) scale(1)" : "translateY(8px) scale(0.85)",
            pointerEvents: hov || isActive ? "auto" : "none",
          }}
        >
          <FontAwesomeIcon icon={faPlay} style={{ fontSize: 13, color: "#fff", marginLeft: 2 }} />
        </div>
      </div>

      <div style={{
        fontSize: 13, fontWeight: 600, color: "var(--text-primary)",
        whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
        marginBottom: 3,
      }}>
        {album.album}
      </div>
      <div style={{
        fontSize: 11, color: "var(--text-tertiary)",
        whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
      }}>
        {album.artist} · Album
      </div>
    </div>
  );
}

/* ── Artist card ───────────────────────────────────────────────── */
function ArtistCard({ artist, cur, onPlay, onOpenArtist }) {
  const [hov, setHov] = useState(false);
  const isActive = cur?.id === artist.song.id;
  const open = () => (onOpenArtist ? onOpenArtist(artist.name) : onPlay(artist.song));

  return (
    <div
      role="button"
      tabIndex={0}
      aria-label={onOpenArtist ? `Mở trang nghệ sĩ ${artist.name}` : `Phát nhạc của ${artist.name}`}
      onClick={open}
      onKeyDown={e => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          open();
        }
      }}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        flexShrink: 0,
        width: 168,
        padding: 12,
        borderRadius: 8,
        textAlign: "center",
        background: hov ? "var(--overlay-1)" : "transparent",
        border: "1px solid transparent",
        transition: "background 0.25s cubic-bezier(0.2, 0, 0, 1)",
        cursor: "pointer",
        scrollSnapAlign: "start",
      }}
    >
      <div style={{ position: "relative", marginBottom: 10 }}>
        <div style={{
          width: 144, height: 144, borderRadius: "50%",
          margin: "0 auto",
          background: artist.bg,
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 40, fontWeight: 500, color: "var(--text-strong)",
          overflow: "hidden",
          boxShadow: "var(--shadow-cover)",
        }}>
          {artist.image ? (
            <img
              src={artist.image}
              alt=""
              style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
            />
          ) : (
            artist.initial
          )}
        </div>
        <div
          className="card-play-btn"
          onClick={e => {
            e.stopPropagation();
            onPlay(artist.song);
          }}
          style={{
            position: "absolute", right: 8, bottom: 2,
            width: 40, height: 40, borderRadius: "50%",
            background: "#f97316",
            display: "flex", alignItems: "center", justifyContent: "center",
            boxShadow: "rgba(0,0,0,0.5) 0px 8px 16px",
            opacity: hov || isActive ? 1 : 0,
            transform: hov || isActive ? "translateY(0) scale(1)" : "translateY(8px) scale(0.85)",
            pointerEvents: hov || isActive ? "auto" : "none",
          }}
        >
          <FontAwesomeIcon icon={faPlay} style={{ fontSize: 13, color: "#fff", marginLeft: 2 }} />
        </div>
      </div>
      <div style={{
        fontSize: 13, fontWeight: 600, color: "var(--text-primary)",
        whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
      }}>
        {artist.name}
      </div>
      <div style={{ fontSize: 11, color: "var(--text-tertiary)", marginTop: 3 }}>
        Nghệ sĩ
      </div>
    </div>
  );
}

/* ── Page ──────────────────────────────────────────────────────── */
export default function PageHome({ list, cur, onPlay, likedIds, recentIds = [], onOpenAlbum, onOpenArtist }) {
  const idMap = useMemo(() => new Map(list.map(s => [s.id, s])), [list]);
  const sorted = useMemo(() => [...list].sort((a, b) => b.plays - a.plays), [list]);

  const trending = useMemo(() => sorted.slice(0, 12), [sorted]);

  const quickPicks = useMemo(() => {
    const seen = new Set();
    const picks = [];
    recentIds.forEach(id => {
      const s = idMap.get(id);
      if (s && !seen.has(s.id) && picks.length < 8) {
        picks.push(s);
        seen.add(s.id);
      }
    });
    for (const s of sorted) {
      if (picks.length >= 8) break;
      if (!seen.has(s.id)) {
        picks.push(s);
        seen.add(s.id);
      }
    }
    return picks;
  }, [recentIds, idMap, sorted]);

  const usuk = useMemo(() =>
    sorted.filter(s => US_UK_ARTISTS.has(getPrimaryArtist(s.artist))).slice(0, 12),
    [sorted]);

  const vpop = useMemo(() =>
    sorted.filter(s => !US_UK_ARTISTS.has(getPrimaryArtist(s.artist))).slice(0, 12),
    [sorted]);

  const madeForYou = useMemo(() => {
    if (likedIds.size > 0) {
      const likedGenres = new Set(
        list.filter(s => likedIds.has(s.id)).map(s => s.genre)
      );
      const recs = sorted
        .filter(s => !likedIds.has(s.id) && likedGenres.has(s.genre))
        .slice(0, 12);
      if (recs.length >= 4) return recs;
    }
    // Fallback: best song per genre, then fill remaining slots
    const seen = new Set();
    const result = [];
    const byGenre = new Map();
    sorted.forEach(s => { if (!byGenre.has(s.genre)) byGenre.set(s.genre, s); });
    byGenre.forEach(s => { result.push(s); seen.add(s.id); });
    sorted.forEach(s => {
      if (result.length >= 12 || seen.has(s.id)) return;
      result.push(s);
      seen.add(s.id);
    });
    return result.slice(0, 12);
  }, [sorted, list, likedIds]);

  const albumCollections = useMemo(() => {
    const albumMap = new Map();
    list.forEach(s => {
      if (!albumMap.has(s.album)) albumMap.set(s.album, []);
      albumMap.get(s.album).push(s);
    });
    return [...albumMap.entries()]
      .map(([albumName, songs]) => {
        const rep = [...songs].sort((a, b) => b.plays - a.plays)[0];
        return {
          album: albumName,
          artist: getPrimaryArtist(rep.artist),
          representative: rep,
          songCount: songs.length,
          latestSongId: Math.max(...songs.map(s => s.id)),
          totalPlays: songs.reduce((acc, s) => acc + s.plays, 0),
        };
      })
  }, [list]);

  const newAlbums = useMemo(() =>
    [...albumCollections]
      .filter(album => album.songCount > 1)
      .sort((a, b) => b.songCount - a.songCount || b.latestSongId - a.latestSongId)
      .slice(0, 10),
    [albumCollections]);

  const albums = useMemo(() =>
    [...albumCollections]
      .sort((a, b) => b.totalPlays - a.totalPlays)
      .slice(0, 10),
    [albumCollections]);

  const artists = useMemo(() =>
    [...new Map(
      sorted.map(s => [getPrimaryArtist(s.artist), s])
    ).values()]
    .slice(0, 12)
    .map((s, i) => ({
      name: getPrimaryArtist(s.artist),
      initial: s.artist[0],
      bg: ARTIST_COLORS[i % ARTIST_COLORS.length],
      image: artistImages[getPrimaryArtist(s.artist)],
      song: s,
    })),
    [sorted]);

  const recentSongs = useMemo(() => {
    if (recentIds.length > 0) {
      return recentIds.map(id => idMap.get(id)).filter(Boolean);
    }
    return sorted.slice(0, 8);
  }, [recentIds, idMap, sorted]);

  let stagger = 0;

  return (
    <div style={{ position: "relative", padding: "28px 28px 48px" }}>
      {/* Gradient hero backdrop — fades into the base background */}
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          top: 0, left: 0, right: 0,
          height: 360,
          background: "linear-gradient(180deg, rgba(249,115,22,0.16), rgba(249,115,22,0.05) 55%, rgba(249,115,22,0) 100%)",
          pointerEvents: "none",
        }}
      />

      {/* Greeting + quick picks */}
      <header
        className="home-section"
        style={{ "--stagger": stagger++, position: "relative", marginBottom: 40 }}
      >
        <h1 style={{ fontSize: 28, fontWeight: 700, letterSpacing: -0.5, marginBottom: 18 }}>
          {getGreeting()}
        </h1>
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))",
          gap: 10,
        }}>
          {quickPicks.map(s => (
            <QuickTile key={s.id} song={s} cur={cur} onPlay={onPlay} />
          ))}
        </div>
      </header>

      {/* Những bài hát thịnh hành */}
      <section className="home-section" style={{ "--stagger": stagger++, marginBottom: 44 }}>
        <SectionHeader title="Những bài hát thịnh hành" />
        <HorizontalShelf>
          {trending.map(s => (
            <SongCard key={s.id} song={s} cur={cur} onPlay={onPlay} width={160} />
          ))}
        </HorizontalShelf>
      </section>

      {/* Được tạo cho bạn */}
      {madeForYou.length > 0 && (
        <section className="home-section" style={{ "--stagger": stagger++, marginBottom: 44 }}>
          <SectionHeader title="Được tạo cho bạn" />
          <HorizontalShelf>
            {madeForYou.map(s => (
              <SongCard key={s.id} song={s} cur={cur} onPlay={onPlay} width={160} />
            ))}
          </HorizontalShelf>
        </section>
      )}

      {/* Top US-UK */}
      {usuk.length > 0 && (
        <section className="home-section" style={{ "--stagger": stagger++, marginBottom: 44 }}>
          <SectionHeader title="Top US-UK" />
          <HorizontalShelf>
            {usuk.map(s => (
              <SongCard key={s.id} song={s} cur={cur} onPlay={onPlay} width={160} />
            ))}
          </HorizontalShelf>
        </section>
      )}

      {/* V-Pop nổi bật */}
      {vpop.length > 0 && (
        <section className="home-section" style={{ "--stagger": stagger++, marginBottom: 44 }}>
          <SectionHeader title="V-Pop nổi bật" />
          <HorizontalShelf>
            {vpop.map(s => (
              <SongCard key={s.id} song={s} cur={cur} onPlay={onPlay} width={160} />
            ))}
          </HorizontalShelf>
        </section>
      )}

      {/* Album mới */}
      {newAlbums.length > 0 && (
        <section className="home-section" style={{ "--stagger": stagger++, marginBottom: 44 }}>
          <SectionHeader title="Album mới" />
          <HorizontalShelf>
            {newAlbums.map(al => (
              <AlbumCard key={al.album} album={al} cur={cur} onPlay={onPlay} onOpenAlbum={onOpenAlbum} />
            ))}
          </HorizontalShelf>
        </section>
      )}

      {/* Album phổ biến */}
      {albums.length > 0 && (
        <section className="home-section" style={{ "--stagger": stagger++, marginBottom: 44 }}>
          <SectionHeader title="Album phổ biến" />
          <HorizontalShelf>
            {albums.map(al => (
              <AlbumCard key={al.album} album={al} cur={cur} onPlay={onPlay} onOpenAlbum={onOpenAlbum} />
            ))}
          </HorizontalShelf>
        </section>
      )}

      {/* Nghệ sĩ phổ biến */}
      <section className="home-section" style={{ "--stagger": stagger++, marginBottom: 44 }}>
        <SectionHeader title="Nghệ sĩ phổ biến" />
        <HorizontalShelf>
          {artists.map(a => (
            <ArtistCard key={a.name} artist={a} cur={cur} onPlay={onPlay} onOpenArtist={onOpenArtist} />
          ))}
        </HorizontalShelf>
      </section>

      {/* Nghe gần đây */}
      <section className="home-section" style={{ "--stagger": stagger }}>
        <SectionHeader title={recentIds.length > 0 ? "Nghe gần đây" : "Đề xuất cho bạn"} />
        <HorizontalShelf>
          {recentSongs.map(s => (
            <SongCard key={s.id} song={s} cur={cur} onPlay={onPlay} width={160} />
          ))}
        </HorizontalShelf>
      </section>
    </div>
  );
}
