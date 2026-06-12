import { useState } from "react";
import { TEXT } from "../constants/theme";
import { getSongImage } from "../data/media";

/**
 * Compact album/single tile for horizontal shelves
 * (artist discography, "more from artist" on album pages).
 */
export default function AlbumTile({ album, onOpenAlbum }) {
  const [hov, setHov] = useState(false);
  const cover = getSongImage(album.representative);

  return (
    <div
      role="button"
      tabIndex={0}
      aria-label={`Mở album ${album.name}`}
      onClick={() => onOpenAlbum(album.name)}
      onKeyDown={e => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onOpenAlbum(album.name);
        }
      }}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        flexShrink: 0,
        width: 160,
        padding: 12,
        borderRadius: 8,
        scrollSnapAlign: "start",
        background: hov ? "var(--bg-el)" : "var(--bg-card)",
        border: "1px solid var(--border)",
        boxShadow: hov ? "var(--shadow-card-hover)" : "var(--shadow-card)",
        transition: "background 0.25s cubic-bezier(0.2, 0, 0, 1), box-shadow 0.25s cubic-bezier(0.2, 0, 0, 1)",
        cursor: "pointer",
      }}
    >
      <div style={{
        width: 136, height: 136, borderRadius: 6,
        background: album.representative.bg ?? "rgba(255,255,255,0.08)",
        overflow: "hidden", marginBottom: 10,
        boxShadow: "var(--shadow-cover)",
      }}>
        {cover && (
          <img src={cover} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
        )}
      </div>
      <div style={{
        fontSize: 13, fontWeight: 600, color: TEXT.primary,
        whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", marginBottom: 3,
      }}>
        {album.name}
      </div>
      <div style={{ fontSize: 11, color: TEXT.secondary }}>
        {album.songCount > 1 ? `Album · ${album.songCount} bài hát` : "Đĩa đơn"}
      </div>
    </div>
  );
}
