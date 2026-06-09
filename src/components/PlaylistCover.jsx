import { getSongImage } from "../data/media";

/**
 * Playlist cover that renders a 2×2 song collage when ≥2 songs have covers,
 * a single image when exactly 1 cover exists, or a gradient fallback otherwise.
 *
 * Pass sizing, borderRadius, boxShadow etc. via the `style` prop.
 */
export default function PlaylistCover({ pl, songs = [], style = {} }) {
  const covers = songs.slice(0, 4).map(s => getSongImage(s)).filter(Boolean);
  const base = pl.type === "liked" ? "linear-gradient(135deg,#4c1d95,#7c3aed)" : (pl.bg ?? "#282828");
  const wrapStyle = { flexShrink: 0, overflow: "hidden", ...style };

  if (covers.length >= 2) {
    return (
      <div style={{ ...wrapStyle, display: "grid", gridTemplateColumns: "1fr 1fr", gridTemplateRows: "1fr 1fr" }}>
        {[0, 1, 2, 3].map(i =>
          covers[i]
            ? <img key={i} src={covers[i]} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
            : <div key={i} style={{ background: base }} />
        )}
      </div>
    );
  }

  if (covers.length === 1) {
    return (
      <div style={wrapStyle}>
        <img src={covers[0]} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
      </div>
    );
  }

  const sz = typeof style.width === "number" ? style.width : 48;
  return (
    <div style={{
      ...wrapStyle,
      background: base,
      display: "flex", alignItems: "center", justifyContent: "center",
      fontSize: style.fontSize ?? Math.round(sz * 0.38),
      color: "rgba(255,255,255,0.85)",
    }}>
      {pl.type === "liked" ? "♥" : "♪"}
    </div>
  );
}
