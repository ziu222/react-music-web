import { useMemo } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlay, faPause, faCirclePlus, faCircleCheck } from "@fortawesome/free-solid-svg-icons";
import EntityHeader from "../components/ui/EntityHeader";
import TrackList from "../components/ui/TrackList";
import AlbumTile from "../components/ui/AlbumTile";
import { useContextPlay } from "../hooks/useContextPlay";
import { TEXT } from "../constants/theme";
import { getSongImage, getPrimaryArtist } from "../data/media";
import { getAlbum, deriveAlbums, formatTotalDuration } from "../data/derived";
import EntityHeaderSkeleton from "../components/ui/skeleton/EntityHeaderSkeleton";
import TrackRowSkeleton from "../components/ui/skeleton/TrackRowSkeleton";

export default function PageAlbum({
  albumName,
  list,
  cur,
  playing = false,
  onPlay,
  likedIds,
  onLike,
  onAddToQueue,
  onOpenArtist,
  onOpenAlbum,
  isSaved,
  onToggleSave,
  catalogLoading,
  skeletonVisible,
}) {
  const album = useMemo(() => getAlbum(list, albumName), [list, albumName]);

  // Context-aware play/pause for the big button (toggle if a track from this
  // album is current, else start from the top).
  const { ctxSong, ctxPlaying } = useContextPlay(album?.songs, cur, playing);

  const moreFromArtist = useMemo(() => {
    if (!album) return [];
    const artistSongs = list.filter(s => getPrimaryArtist(s.artist) === album.artist);
    return deriveAlbums(artistSongs)
      .filter(al => al.name !== album.name)
      .sort((a, b) => b.totalPlays - a.totalPlays)
      .slice(0, 10);
  }, [list, album]);

  if (!album) {
    if (catalogLoading) {
      return (
        <div aria-hidden="true" style={{ paddingBottom: 80, visibility: skeletonVisible ? "visible" : "hidden" }}>
          <EntityHeaderSkeleton type="album" />
          <div style={{ padding: "0 28px" }}>
            {Array.from({ length: 8 }, (_, i) => <TrackRowSkeleton key={i} />)}
          </div>
        </div>
      );
    }
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
                fontSize: 13, fontWeight: 600, color: "var(--text-primary)",
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
          aria-label={ctxPlaying ? `Tạm dừng album ${album.name}` : `Phát album ${album.name}`}
          onClick={() => onPlay(ctxSong ?? album.songs[0])}
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
          <FontAwesomeIcon icon={ctxPlaying ? faPause : faPlay} style={{ fontSize: 18, marginLeft: ctxPlaying ? 0 : 2 }} />
        </button>
        <button
          type="button"
          aria-label={isSaved ? `Xóa album ${album.name} khỏi thư viện` : `Lưu album ${album.name} vào thư viện`}
          aria-pressed={isSaved}
          title={isSaved ? "Xóa khỏi thư viện" : "Lưu vào thư viện"}
          onClick={onToggleSave}
          style={{
            background: "transparent", border: "none", cursor: "pointer",
            color: isSaved ? "#1ed760" : "var(--text-secondary)",
            display: "inline-flex", padding: 6,
            transition: "color 0.15s, transform 0.1s",
          }}
          onMouseEnter={e => { e.currentTarget.style.color = isSaved ? "#1ed760" : "var(--text-primary)"; e.currentTarget.style.transform = "scale(1.1)"; }}
          onMouseLeave={e => { e.currentTarget.style.color = isSaved ? "#1ed760" : "var(--text-secondary)"; e.currentTarget.style.transform = "scale(1)"; }}
        >
          <FontAwesomeIcon icon={isSaved ? faCircleCheck : faCirclePlus} style={{ fontSize: 26 }} />
        </button>
      </div>

      {/* Track list */}
      <div style={{ padding: "12px 24px 0" }}>
        <TrackList
          songs={album.songs}
          cur={cur}
          playing={playing}
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
              onMouseEnter={e => { e.currentTarget.style.color = "var(--text-primary)"; e.currentTarget.style.textDecoration = "underline"; }}
              onMouseLeave={e => { e.currentTarget.style.color = "var(--text-secondary)"; e.currentTarget.style.textDecoration = "none"; }}
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
