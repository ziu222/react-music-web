import { useMemo, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlay } from "@fortawesome/free-solid-svg-icons";
import EntityHeader from "../components/EntityHeader";
import TrackList from "../components/TrackList";
import AlbumTile from "../components/AlbumTile";
import { TEXT } from "../constants/theme";
import { getArtist, deriveAlbums, formatPlays } from "../data/derived";

export default function PageArtist({
  artistName,
  list,
  cur,
  onPlay,
  likedIds,
  onLike,
  onAddToQueue,
  onOpenAlbum,
  isFollowed,
  onToggleFollow,
}) {
  const artist = useMemo(() => getArtist(list, artistName), [list, artistName]);
  const [showAllSongs, setShowAllSongs] = useState(false);

  const artistAlbums = useMemo(() => {
    if (!artist) return [];
    return deriveAlbums(artist.songs)
      .sort((a, b) => b.totalPlays - a.totalPlays);
  }, [artist]);

  if (!artist) {
    return (
      <div style={{ padding: 60, textAlign: "center", color: TEXT.secondary, animation: "slideUp 0.3s ease" }}>
        <div style={{ fontSize: 16, fontWeight: 500, marginBottom: 8 }}>Không tìm thấy nghệ sĩ</div>
        <div style={{ fontSize: 13, color: TEXT.tertiary }}>Nghệ sĩ này không có trong thư viện nhạc</div>
      </div>
    );
  }

  const popular = artist.songs.slice(0, 5);
  const allSongs = showAllSongs ? artist.songs : artist.songs.slice(0, 10);
  const accent = artist.topSong.bg?.match(/#[0-9a-f]{6}/i)?.[0] ?? "#f97316";

  return (
    <div style={{ animation: "slideUp 0.3s ease", paddingBottom: 80 }}>
      <EntityHeader
        type="Nghệ sĩ"
        title={artist.name}
        round
        image={artist.image}
        fallback={artist.name[0]}
        accent={accent}
        meta={
          <>
            <span>{formatPlays(artist.totalPlays)} lượt phát</span>
            <span aria-hidden="true">·</span>
            <span>{artist.songs.length} bài hát</span>
          </>
        }
      />

      {/* Action row */}
      <div style={{ padding: "16px 32px 8px", display: "flex", alignItems: "center", gap: 18 }}>
        <button
          type="button"
          aria-label={`Phát nhạc của ${artist.name}`}
          onClick={() => onPlay(artist.topSong)}
          style={{
            width: 52, height: 52, borderRadius: "50%",
            background: "#1ed760", border: "none",
            display: "flex", alignItems: "center", justifyContent: "center",
            color: "#000", cursor: "pointer",
            boxShadow: "0 6px 20px rgba(30,215,96,0.35)",
            transition: "transform 0.15s, filter 0.15s",
          }}
          onMouseEnter={e => { e.currentTarget.style.transform = "scale(1.06)"; e.currentTarget.style.filter = "brightness(1.08)"; }}
          onMouseLeave={e => { e.currentTarget.style.transform = "scale(1)"; e.currentTarget.style.filter = "none"; }}
        >
          <FontAwesomeIcon icon={faPlay} style={{ fontSize: 18, marginLeft: 2 }} />
        </button>
        <button
          type="button"
          aria-label={isFollowed ? `Bỏ theo dõi ${artist.name}` : `Theo dõi ${artist.name}`}
          aria-pressed={isFollowed}
          onClick={onToggleFollow}
          style={{
            background: "transparent",
            border: `1.5px solid ${isFollowed ? "#1ed760" : "var(--text-tertiary)"}`,
            borderRadius: 9999,
            padding: "7px 18px",
            fontSize: 12.5,
            fontWeight: 600,
            color: isFollowed ? "#1ed760" : TEXT.primary,
            cursor: "pointer",
            letterSpacing: 0.3,
            transition: "border-color 0.15s, color 0.15s, transform 0.1s",
          }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = isFollowed ? "#1ed760" : "var(--text-primary)"; e.currentTarget.style.transform = "scale(1.03)"; }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = isFollowed ? "#1ed760" : "var(--text-tertiary)"; e.currentTarget.style.transform = "scale(1)"; }}
        >
          {isFollowed ? "Đang theo dõi" : "Theo dõi"}
        </button>
      </div>

      {/* Popular */}
      <section style={{ padding: "20px 24px 0" }}>
        <h2 style={{ fontSize: 20, fontWeight: 700, letterSpacing: -0.3, marginBottom: 10, padding: "0 8px" }}>
          Phổ biến
        </h2>
        <TrackList
          songs={popular}
          cur={cur}
          likedIds={likedIds}
          onPlay={onPlay}
          onLike={onLike}
          onAddToQueue={onAddToQueue}
          showPlays
          showHeader={false}
        />
      </section>

      {/* Albums & singles */}
      {artistAlbums.length > 0 && (
        <section style={{ padding: "36px 32px 0" }}>
          <h2 style={{ fontSize: 20, fontWeight: 700, letterSpacing: -0.3, marginBottom: 14 }}>
            Album và đĩa đơn
          </h2>
          <div
            className="hscroll"
            style={{
              display: "flex", gap: 16, overflowX: "auto",
              padding: "4px 0 8px",
              scrollbarWidth: "none",
              scrollSnapType: "x proximity",
              WebkitOverflowScrolling: "touch",
            }}
          >
            {artistAlbums.map(al => (
              <AlbumTile key={al.name} album={al} onOpenAlbum={onOpenAlbum} />
            ))}
          </div>
        </section>
      )}

      {/* All songs */}
      {artist.songs.length > 5 && (
        <section style={{ padding: "36px 24px 0" }}>
          <h2 style={{ fontSize: 20, fontWeight: 700, letterSpacing: -0.3, marginBottom: 10, padding: "0 8px" }}>
            Tất cả bài hát
          </h2>
          <TrackList
            songs={allSongs}
            cur={cur}
            likedIds={likedIds}
            onPlay={onPlay}
            onLike={onLike}
            onAddToQueue={onAddToQueue}
            onOpenAlbum={onOpenAlbum}
            showAlbum
          />
          {artist.songs.length > 10 && (
            <button
              type="button"
              onClick={() => setShowAllSongs(s => !s)}
              style={{
                marginTop: 12,
                marginLeft: 8,
                background: "transparent",
                border: "none",
                color: TEXT.secondary,
                fontSize: 12,
                fontWeight: 700,
                letterSpacing: 0.4,
                textTransform: "uppercase",
                cursor: "pointer",
                padding: "6px 0",
                transition: "color 0.15s",
              }}
              onMouseEnter={e => { e.currentTarget.style.color = "#fff"; }}
              onMouseLeave={e => { e.currentTarget.style.color = "var(--text-secondary)"; }}
            >
              {showAllSongs ? "Thu gọn" : `Xem thêm (${artist.songs.length - 10})`}
            </button>
          )}
        </section>
      )}
    </div>
  );
}
