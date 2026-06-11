import { useMemo } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlay, faCirclePlus, faCircleCheck } from "@fortawesome/free-solid-svg-icons";
import EntityHeader from "../components/EntityHeader";
import TrackList from "../components/TrackList";
import AlbumTile from "../components/AlbumTile";
import { TEXT } from "../constants/theme";
import { getSongImage, getPrimaryArtist } from "../data/media";
import { getAlbum, deriveAlbums, formatTotalDuration } from "../data/derived";

export default function PageAlbum({
  albumName,
  list,
  cur,
  onPlay,
  likedIds,
  onLike,
  onAddToQueue,
  onOpenArtist,
  onOpenAlbum,
  isSaved,
  onToggleSave,
}) {
  const album = useMemo(() => getAlbum(list, albumName), [list, albumName]);

  const moreFromArtist = useMemo(() => {
    if (!album) return [];
    const artistSongs = list.filter(s => getPrimaryArtist(s.artist) === album.artist);
    return deriveAlbums(artistSongs)
      .filter(al => al.name !== album.name)
      .sort((a, b) => b.totalPlays - a.totalPlays)
      .slice(0, 10);
  }, [list, album]);

  if (!album) {
    return (
      <div style={{ padding: 60, textAlign: "center", color: TEXT.secondary, animation: "slideUp 0.3s ease" }}>
        <div style={{ fontSize: 16, fontWeight: 500, marginBottom: 8 }}>Không tìm thấy album</div>
        <div style={{ fontSize: 13, color: TEXT.tertiary }}>Album này không có trong thư viện nhạc</div>
      </div>
    );
  }

  const cover = getSongImage(album.representative);
  const accent = album.representative.bg?.match(/#[0-9a-f]{6}/i)?.[0] ?? "#1d1616";

  return (
    <div style={{ animation: "slideUp 0.3s ease", paddingBottom: 80 }}>
      <EntityHeader
        type={album.songCount > 1 ? "Album" : "Đĩa đơn"}
        title={album.name}
        image={cover}
        fallback="♪"
        accent={accent}
        meta={
          <>
            <button
              type="button"
              aria-label={`Mở trang nghệ sĩ ${album.artist}`}
              onClick={() => onOpenArtist(album.artist)}
              style={{
                background: "none", border: "none", padding: 0,
                fontSize: 13, fontWeight: 600, color: "#fff",
                cursor: "pointer", transition: "color 0.15s",
              }}
              onMouseEnter={e => { e.currentTarget.style.textDecoration = "underline"; }}
              onMouseLeave={e => { e.currentTarget.style.textDecoration = "none"; }}
            >
              {album.artist}
            </button>
            <span aria-hidden="true">·</span>
            <span>{album.songCount} bài hát</span>
            <span aria-hidden="true">·</span>
            <span>{formatTotalDuration(album.songs)}</span>
          </>
        }
      />

      {/* Action row */}
      <div style={{ padding: "16px 32px 8px", display: "flex", alignItems: "center", gap: 18 }}>
        <button
          type="button"
          aria-label={`Phát album ${album.name}`}
          onClick={() => onPlay(album.songs[0])}
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
          aria-label={isSaved ? `Xóa album ${album.name} khỏi thư viện` : `Lưu album ${album.name} vào thư viện`}
          aria-pressed={isSaved}
          title={isSaved ? "Xóa khỏi thư viện" : "Lưu vào thư viện"}
          onClick={onToggleSave}
          style={{
            background: "transparent", border: "none", cursor: "pointer",
            color: isSaved ? "#1ed760" : "rgba(255,255,255,0.55)",
            display: "inline-flex", padding: 6,
            transition: "color 0.15s, transform 0.1s",
          }}
          onMouseEnter={e => { e.currentTarget.style.color = isSaved ? "#1ed760" : "#fff"; e.currentTarget.style.transform = "scale(1.1)"; }}
          onMouseLeave={e => { e.currentTarget.style.color = isSaved ? "#1ed760" : "rgba(255,255,255,0.55)"; e.currentTarget.style.transform = "scale(1)"; }}
        >
          <FontAwesomeIcon icon={isSaved ? faCircleCheck : faCirclePlus} style={{ fontSize: 26 }} />
        </button>
      </div>

      {/* Track list */}
      <div style={{ padding: "12px 24px 0" }}>
        <TrackList
          songs={album.songs}
          cur={cur}
          likedIds={likedIds}
          onPlay={onPlay}
          onLike={onLike}
          onAddToQueue={onAddToQueue}
          onOpenArtist={onOpenArtist}
          showPlays
        />
      </div>

      {/* More from this artist */}
      {moreFromArtist.length > 0 && onOpenAlbum && (
        <section style={{ padding: "40px 32px 0" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 14 }}>
            <h2 style={{ fontSize: 20, fontWeight: 700, letterSpacing: -0.3 }}>
              Thêm từ {album.artist}
            </h2>
            <button
              type="button"
              aria-label={`Mở trang nghệ sĩ ${album.artist}`}
              onClick={() => onOpenArtist(album.artist)}
              style={{
                background: "none", border: "none", padding: 0,
                fontSize: 12, fontWeight: 600, letterSpacing: 0.3,
                color: TEXT.secondary, cursor: "pointer",
                transition: "color 0.15s",
              }}
              onMouseEnter={e => { e.currentTarget.style.color = "#fff"; e.currentTarget.style.textDecoration = "underline"; }}
              onMouseLeave={e => { e.currentTarget.style.color = "rgba(255,255,255,0.5)"; e.currentTarget.style.textDecoration = "none"; }}
            >
              Xem nghệ sĩ
            </button>
          </div>
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
            {moreFromArtist.map(al => (
              <AlbumTile key={al.name} album={al} onOpenAlbum={onOpenAlbum} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
