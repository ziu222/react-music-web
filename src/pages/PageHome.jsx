import Card from "../components/Card";
import TrackRow from "../components/TrackRow";
import { C, GRADIENTS } from "../constants/theme";

export default function PageHome({ list, cur, onPlay, likedIds, onLike }) {
  const totalMins = list.reduce((acc, s) => acc + s.durationSecs, 0);
  const hrs = Math.floor(totalMins / 3600);
  const mins = Math.floor((totalMins % 3600) / 60);

  return (
    <div style={{ animation: "slideUp 0.3s ease" }}>
      {/* Hero banner */}
      <div
        style={{
          background: GRADIENTS.hero,
          borderRadius: 14,
          padding: "24px 28px",
          marginBottom: 28,
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute",
            right: 24,
            top: "50%",
            transform: "translateY(-50%)",
            width: 72,
            height: 72,
            borderRadius: 12,
            background: "rgba(0,0,0,0.2)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            fontSize: 26,
            color: "#fff",
            transition: "background 0.2s",
          }}
        >
          ▶
        </div>
        <div
          style={{
            fontSize: 10,
            textTransform: "uppercase",
            letterSpacing: 1.2,
            color: "rgba(255,255,255,0.55)",
            marginBottom: 6,
            fontWeight: 500,
          }}
        >
          Featured Playlist
        </div>
        <div style={{ fontSize: 22, fontWeight: 500, marginBottom: 4 }}>Nhạc Việt Đỉnh Cao</div>
        <div style={{ fontSize: 12, color: "rgba(255,255,255,0.55)" }}>
          {list.length} songs · {hrs}hr {mins}min
        </div>
      </div>

      {/* Trending now */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 12,
        }}
      >
        <span style={{ fontSize: 15, fontWeight: 500 }}>Trending now</span>
        <span style={{ fontSize: 12, color: C[500], cursor: "pointer" }}>See all</span>
      </div>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gap: 10,
          marginBottom: 28,
        }}
      >
        {list.slice(0, 4).map(s => (
          <Card key={s.id} song={s} cur={cur} onPlay={onPlay} />
        ))}
      </div>

      {/* Recently played */}
      <div style={{ fontSize: 15, fontWeight: 500, marginBottom: 10 }}>Recently played</div>
      {list.map((s, i) => (
        <TrackRow
          key={s.id}
          song={s}
          index={i}
          cur={cur}
          onPlay={onPlay}
          likedIds={likedIds}
          onLike={onLike}
        />
      ))}
    </div>
  );
}
