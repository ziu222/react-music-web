import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlay, faPlus, faHeart, faXmark } from "@fortawesome/free-solid-svg-icons";
import EqBars from "../player/EqBars";
import { C, R, TEXT, BORDER } from "../../constants/theme";
import { getSongImage, getPrimaryArtist } from "../../data/media";
import { formatPlays } from "../../data/derived";

/**
 * Reusable numbered track table for artist/album/playlist surfaces.
 * Columns adapt to options: album, plays, remove-from-playlist.
 */
export default function TrackList({
  songs,
  cur,
  likedIds,
  onPlay,
  onLike,
  onAddToQueue,
  onOpenArtist,
  onOpenAlbum,
  onRemove,
  showAlbum = false,
  showPlays = false,
  showHeader = true,
}) {
  const cols = [
    "36px",
    "minmax(200px, 2fr)",
    ...(showAlbum ? ["minmax(140px, 1fr)"] : []),
    ...(showPlays ? ["110px"] : []),
    "54px",
    "34px",
    "34px",
    ...(onRemove ? ["34px"] : []),
  ].join(" ");

  return (
    <div>
      {showHeader && (
        <div style={{
          display: "grid",
          gridTemplateColumns: cols,
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
          <span>Tiêu đề</span>
          {showAlbum && <span>Album</span>}
          {showPlays && <span style={{ textAlign: "right" }}>Lượt phát</span>}
          <span style={{ textAlign: "right" }}>Time</span>
          <span />
          <span />
          {onRemove && <span />}
        </div>
      )}
      {songs.map((song, i) => (
        <Row
          key={song.id}
          song={song}
          index={i}
          cols={cols}
          cur={cur}
          likedIds={likedIds}
          onPlay={onPlay}
          onLike={onLike}
          onAddToQueue={onAddToQueue}
          onOpenArtist={onOpenArtist}
          onOpenAlbum={onOpenAlbum}
          onRemove={onRemove}
          showAlbum={showAlbum}
          showPlays={showPlays}
        />
      ))}
    </div>
  );
}

function Row({
  song, index, cols, cur, likedIds,
  onPlay, onLike, onAddToQueue, onOpenArtist, onOpenAlbum, onRemove,
  showAlbum, showPlays,
}) {
  const [hov, setHov] = useState(false);
  const playing = cur?.id === song.id;
  const liked = likedIds.has(song.id);
  const cover = getSongImage(song);
  const primaryArtist = getPrimaryArtist(song.artist);

  const iconBtnStyle = (visible, color) => ({
    background: "none",
    border: "none",
    cursor: "pointer",
    color,
    fontSize: 14,
    lineHeight: 1,
    padding: 4,
    opacity: visible ? 1 : 0,
    pointerEvents: visible ? "auto" : "none",
    transition: "opacity 0.15s, color 0.15s, transform 0.1s",
  });

  return (
    <div
      role="button"
      tabIndex={0}
      aria-label={`Phát ${song.title} – ${song.artist}`}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      onClick={() => onPlay(song)}
      onKeyDown={e => {
        if (e.target !== e.currentTarget) return; // ignore keys on nested buttons
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onPlay(song);
        }
      }}
      style={{
        display: "grid",
        gridTemplateColumns: cols,
        alignItems: "center",
        gap: 12,
        minHeight: 52,
        padding: "0 10px",
        borderRadius: 6,
        cursor: "pointer",
        background: playing ? `${C[500]}12` : hov ? "var(--overlay-1)" : "transparent",
        transition: "background 0.15s",
      }}
    >
      {/* # / play / eq */}
      <div style={{
        fontSize: 12,
        color: playing ? C[400] : "var(--text-tertiary)",
        textAlign: "center",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontVariantNumeric: "tabular-nums",
      }}>
        {playing
          ? <EqBars size={14} />
          : hov
            ? <FontAwesomeIcon icon={faPlay} style={{ fontSize: 10, color: "var(--text-primary)" }} />
            : index + 1}
      </div>

      {/* Cover + title + artist */}
      <div style={{ display: "flex", alignItems: "center", gap: 12, minWidth: 0 }}>
        <div style={{
          width: 40, height: 40, borderRadius: 5,
          background: song.bg, flexShrink: 0, overflow: "hidden",
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          {cover ? (
            <img src={cover} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
          ) : (
            <span style={{ fontSize: 14, color: "rgba(255,255,255,0.7)" }}>♪</span>
          )}
        </div>
        <div style={{ minWidth: 0 }}>
          <div style={{
            fontSize: 13, fontWeight: 600,
            color: playing ? C[400] : TEXT.primary,
            overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
            marginBottom: 2,
          }}>
            {song.title}
          </div>
          {onOpenArtist ? (
            <button
              type="button"
              aria-label={`Mở trang nghệ sĩ ${primaryArtist}`}
              onClick={e => { e.stopPropagation(); onOpenArtist(primaryArtist); }}
              style={{
                background: "none", border: "none", padding: 0,
                fontSize: 11, color: TEXT.secondary, cursor: "pointer",
                overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                maxWidth: "100%", display: "block", textAlign: "left",
                transition: "color 0.15s",
              }}
              onMouseEnter={e => { e.currentTarget.style.color = "var(--text-primary)"; e.currentTarget.style.textDecoration = "underline"; }}
              onMouseLeave={e => { e.currentTarget.style.color = "var(--text-secondary)"; e.currentTarget.style.textDecoration = "none"; }}
            >
              {song.artist}
            </button>
          ) : (
            <div style={{
              fontSize: 11, color: TEXT.secondary,
              overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
            }}>
              {song.artist}
            </div>
          )}
        </div>
      </div>

      {/* Album */}
      {showAlbum && (
        onOpenAlbum ? (
          <button
            type="button"
            aria-label={`Mở album ${song.album}`}
            onClick={e => { e.stopPropagation(); onOpenAlbum(song.album); }}
            style={{
              background: "none", border: "none", padding: 0,
              fontSize: 12, color: TEXT.secondary, cursor: "pointer",
              overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
              textAlign: "left", transition: "color 0.15s",
            }}
            onMouseEnter={e => { e.currentTarget.style.color = "var(--text-primary)"; e.currentTarget.style.textDecoration = "underline"; }}
            onMouseLeave={e => { e.currentTarget.style.color = "var(--text-secondary)"; e.currentTarget.style.textDecoration = "none"; }}
          >
            {song.album}
          </button>
        ) : (
          <div style={{ fontSize: 12, color: TEXT.secondary, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {song.album}
          </div>
        )
      )}

      {/* Plays */}
      {showPlays && (
        <div style={{
          fontSize: 12, color: TEXT.secondary, textAlign: "right",
          fontVariantNumeric: "tabular-nums",
          overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
        }}>
          {formatPlays(song.plays)}
        </div>
      )}

      {/* Duration */}
      <div style={{ fontSize: 12, color: TEXT.secondary, textAlign: "right", fontVariantNumeric: "tabular-nums" }}>
        {song.duration}
      </div>

      {/* Add to queue */}
      {onAddToQueue ? (
        <button
          type="button"
          aria-label={`Thêm ${song.title} vào hàng đợi`}
          title="Thêm vào hàng đợi"
          tabIndex={hov ? 0 : -1}
          onClick={e => { e.stopPropagation(); onAddToQueue(song); }}
          style={iconBtnStyle(hov, "var(--text-secondary)")}
          onMouseEnter={e => { e.currentTarget.style.color = "var(--text-primary)"; }}
          onMouseLeave={e => { e.currentTarget.style.color = "var(--text-secondary)"; }}
        >
          <FontAwesomeIcon icon={faPlus} />
        </button>
      ) : <span />}

      {/* Like */}
      <button
        type="button"
        aria-label={liked ? `Bỏ thích ${song.title}` : `Thích ${song.title}`}
        title={liked ? "Bỏ thích" : "Thích"}
        tabIndex={liked || hov ? 0 : -1}
        onClick={e => { e.stopPropagation(); onLike(song.id); }}
        style={iconBtnStyle(liked || hov, liked ? R[400] : "var(--text-tertiary)")}
        onMouseEnter={e => { e.currentTarget.style.transform = "scale(1.15)"; }}
        onMouseLeave={e => { e.currentTarget.style.transform = "scale(1)"; }}
      >
        <FontAwesomeIcon icon={faHeart} />
      </button>

      {/* Remove from playlist */}
      {onRemove && (
        <button
          type="button"
          aria-label={`Xóa ${song.title} khỏi danh sách phát`}
          title="Xóa khỏi danh sách phát"
          tabIndex={hov ? 0 : -1}
          onClick={e => { e.stopPropagation(); onRemove(song); }}
          style={iconBtnStyle(hov, "var(--text-secondary)")}
          onMouseEnter={e => { e.currentTarget.style.color = "var(--text-primary)"; }}
          onMouseLeave={e => { e.currentTarget.style.color = "var(--text-secondary)"; }}
        >
          <FontAwesomeIcon icon={faXmark} />
        </button>
      )}
    </div>
  );
}
