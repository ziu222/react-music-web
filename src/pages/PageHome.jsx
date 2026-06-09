import { useMemo, useRef, useState } from "react";
import Card from "../components/Card";
import { getSongImage, artistImages, getPrimaryArtist } from "../data/media";

const ARTIST_COLORS = [
  "linear-gradient(135deg,#ea580c,#f97316)",
  "linear-gradient(135deg,#d97706,#fbbf24)",
  "linear-gradient(135deg,#e11d48,#fb7185)",
  "linear-gradient(135deg,#0369a1,#38bdf8)",
  "linear-gradient(135deg,#7c3aed,#a78bfa)",
  "linear-gradient(135deg,#166534,#4ade80)",
  "linear-gradient(135deg,#be185d,#fb7185)",
  "linear-gradient(135deg,#0f766e,#34d399)",
];

const US_UK_ARTISTS = new Set([
  "Justin Bieber", "The Weeknd", "Ed Sheeran", "Harry Styles", "Dua Lipa",
  "Adele", "Billie Eilish", "Taylor Swift", "Drake", "Post Malone",
  "Mark Ronson", "Ariana Grande", "Coldplay", "Imagine Dragons",
]);

/* ── shared layout helpers ─────────────────────────────────────── */
function HScroll({ children }) {
  const ref = useRef(null);
  return (
    <div
      ref={ref}
      style={{
        display: "flex",
        gap: 16,
        overflowX: "auto",
        paddingBottom: 8,
        scrollbarWidth: "none",
        scrollSnapType: "x mandatory",
        WebkitOverflowScrolling: "touch",
      }}
    >
      {children}
    </div>
  );
}

function SectionHeader({ title }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
      <span style={{ fontSize: 22, fontWeight: 600, letterSpacing: -0.3 }}>{title}</span>
      <span style={{ fontSize: 12, color: "rgba(255,255,255,0.5)", cursor: "pointer", letterSpacing: 0.3 }}>
        Hiện tất cả
      </span>
    </div>
  );
}

/* ── Album card ────────────────────────────────────────────────── */
function AlbumCard({ album, cur, onPlay }) {
  const [hov, setHov] = useState(false);
  const cover = getSongImage(album.representative);
  const isActive = cur?.id === album.representative.id;

  return (
    <div
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        flexShrink: 0,
        width: 160,
        scrollSnapAlign: "start",
        padding: 12,
        borderRadius: 8,
        background: hov ? "rgba(255,255,255,0.08)" : "rgba(255,255,255,0.03)",
        transition: "background 0.15s",
        boxShadow: hov
          ? "rgba(0,0,0,0.4) 0px 8px 20px"
          : "rgba(0,0,0,0.2) 0px 2px 8px",
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
          boxShadow: "rgba(0,0,0,0.4) 0px 8px 24px",
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
          onClick={() => onPlay(album.representative)}
          style={{
            position: "absolute", right: 6, bottom: 6,
            width: 40, height: 40, borderRadius: "50%",
            background: "#f97316",
            display: "flex", alignItems: "center", justifyContent: "center",
            boxShadow: "rgba(0,0,0,0.5) 0px 8px 16px",
            opacity: hov || isActive ? 1 : 0,
            transform: hov || isActive ? "translateY(0) scale(1)" : "translateY(6px) scale(0.92)",
            transition: "opacity 0.2s, transform 0.2s",
            pointerEvents: hov || isActive ? "auto" : "none",
          }}
        >
          <span style={{ fontSize: 14, color: "#fff", marginLeft: 2 }}>▶</span>
        </div>
      </div>

      <div style={{
        fontSize: 13, fontWeight: 500, color: "#ede5dd",
        whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
        marginBottom: 3,
      }}>
        {album.album}
      </div>
      <div style={{
        fontSize: 11, color: "rgba(255,255,255,0.45)",
        whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
      }}>
        {album.artist} · Album
      </div>
    </div>
  );
}

/* ── Page ──────────────────────────────────────────────────────── */
export default function PageHome({ list, cur, onPlay, likedIds, recentIds = [] }) {
  const idMap = useMemo(() => new Map(list.map(s => [s.id, s])), [list]);
  const sorted = useMemo(() => [...list].sort((a, b) => b.plays - a.plays), [list]);

  const trending = useMemo(() => sorted.slice(0, 12), [sorted]);

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

  const albums = useMemo(() => {
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
          totalPlays: songs.reduce((acc, s) => acc + s.plays, 0),
        };
      })
      .sort((a, b) => b.totalPlays - a.totalPlays)
      .slice(0, 10);
  }, [list]);

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
    })),
    [sorted]);

  const recentSongs = useMemo(() => {
    if (recentIds.length > 0) {
      return recentIds.map(id => idMap.get(id)).filter(Boolean);
    }
    return sorted.slice(0, 8);
  }, [recentIds, idMap, sorted]);

  return (
    <div style={{ animation: "slideUp 0.3s ease", padding: "32px 28px 48px" }}>

      {/* Những bài hát thịnh hành */}
      <section style={{ marginBottom: 48 }}>
        <SectionHeader title="Những bài hát thịnh hành" />
        <HScroll>
          {trending.map(s => (
            <Card key={s.id} song={s} cur={cur} onPlay={onPlay} width={160} />
          ))}
        </HScroll>
      </section>

      {/* Được tạo cho bạn */}
      {madeForYou.length > 0 && (
        <section style={{ marginBottom: 48 }}>
          <SectionHeader title="Được tạo cho bạn" />
          <HScroll>
            {madeForYou.map(s => (
              <Card key={s.id} song={s} cur={cur} onPlay={onPlay} width={160} />
            ))}
          </HScroll>
        </section>
      )}

      {/* Top US-UK */}
      {usuk.length > 0 && (
        <section style={{ marginBottom: 48 }}>
          <SectionHeader title="Top US-UK" />
          <HScroll>
            {usuk.map(s => (
              <Card key={s.id} song={s} cur={cur} onPlay={onPlay} width={160} />
            ))}
          </HScroll>
        </section>
      )}

      {/* V-Pop nổi bật */}
      {vpop.length > 0 && (
        <section style={{ marginBottom: 48 }}>
          <SectionHeader title="V-Pop nổi bật" />
          <HScroll>
            {vpop.map(s => (
              <Card key={s.id} song={s} cur={cur} onPlay={onPlay} width={160} />
            ))}
          </HScroll>
        </section>
      )}

      {/* Album phổ biến */}
      {albums.length > 0 && (
        <section style={{ marginBottom: 48 }}>
          <SectionHeader title="Album phổ biến" />
          <HScroll>
            {albums.map((al, i) => (
              <AlbumCard key={i} album={al} cur={cur} onPlay={onPlay} />
            ))}
          </HScroll>
        </section>
      )}

      {/* Nghệ sĩ phổ biến */}
      <section style={{ marginBottom: 48 }}>
        <SectionHeader title="Nghệ sĩ phổ biến" />
        <HScroll>
          {artists.map((a, i) => (
            <div
              key={i}
              style={{
                flexShrink: 0, width: 150,
                cursor: "pointer", textAlign: "center",
                scrollSnapAlign: "start",
              }}
            >
              <div style={{
                width: 150, height: 150, borderRadius: "50%",
                background: a.bg,
                display: "flex", alignItems: "center", justifyContent: "center",
                marginBottom: 10,
                fontSize: 40, fontWeight: 500, color: "rgba(255,255,255,0.9)",
                overflow: "hidden",
              }}>
                {a.image ? (
                  <img
                    src={a.image}
                    alt=""
                    style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                  />
                ) : (
                  a.initial
                )}
              </div>
              <div style={{
                fontSize: 13, fontWeight: 500, color: "#ede5dd",
                whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
              }}>
                {a.name}
              </div>
              <div style={{ fontSize: 11, color: "rgba(255,255,255,0.45)", marginTop: 3 }}>
                Nghệ sĩ
              </div>
            </div>
          ))}
        </HScroll>
      </section>

      {/* Nghe gần đây */}
      <section>
        <SectionHeader title={recentIds.length > 0 ? "Nghe gần đây" : "Đề xuất cho bạn"} />
        <HScroll>
          {recentSongs.map(s => (
            <Card key={s.id} song={s} cur={cur} onPlay={onPlay} width={160} />
          ))}
        </HScroll>
      </section>
    </div>
  );
}
