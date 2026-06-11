import { TEXT } from "../constants/theme";

/**
 * Shared hero header for artist/album/playlist detail pages.
 * Dense, Spotify-like: gradient backdrop, art on the left,
 * type label + title + meta on the right.
 */
export default function EntityHeader({
  type,
  title,
  meta,
  image,
  fallback,
  round = false,
  accent = "#1d1616",
}) {
  return (
    <div style={{
      padding: "40px 32px 28px",
      background: `linear-gradient(180deg, ${accent}59 0%, ${accent}1f 60%, transparent 100%)`,
      display: "flex",
      alignItems: "flex-end",
      gap: 24,
    }}>
      <div style={{
        width: 180,
        height: 180,
        flexShrink: 0,
        borderRadius: round ? "50%" : 8,
        overflow: "hidden",
        background: "#241a1a",
        boxShadow: "0 12px 40px rgba(0,0,0,0.5)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: 52,
        fontWeight: 500,
        color: "rgba(255,255,255,0.85)",
      }}>
        {image ? (
          <img
            src={image}
            alt=""
            style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
          />
        ) : (
          fallback
        )}
      </div>

      <div style={{ minWidth: 0, paddingBottom: 4 }}>
        <div style={{
          fontSize: 11,
          textTransform: "uppercase",
          letterSpacing: 1.2,
          color: TEXT.secondary,
          marginBottom: 8,
          fontWeight: 600,
        }}>
          {type}
        </div>
        <h1 style={{
          fontSize: title?.length > 28 ? 26 : 34,
          fontWeight: 700,
          color: "#fff",
          marginBottom: 10,
          whiteSpace: "nowrap",
          overflow: "hidden",
          textOverflow: "ellipsis",
          lineHeight: 1.15,
        }}>
          {title}
        </h1>
        <div style={{ fontSize: 13, color: TEXT.secondary, display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
          {meta}
        </div>
      </div>
    </div>
  );
}
