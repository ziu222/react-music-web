import Card from "../components/Card";
import TrackRow from "../components/TrackRow";
import { C, GRADIENTS } from "../constants/theme";

export default function PageHome({ list, cur, onPlay, likedIds, onLike }) {
  const totalSecs = list.reduce((acc, s) => acc + s.durationSecs, 0);
  const hrs = Math.floor(totalSecs / 3600);
  const mins = Math.floor((totalSecs % 3600) / 60);

  return (
    <div style={{ animation: "slideUp 0.3s ease" }}>
      {/* Hero banner */}
      <div
        style={{
          background: GRADIENTS.hero,
          borderRadius: 12,
          padding: 22,
          marginBottom: 22,
          position: "relative",
        }}
      >
        <div
          style={{
            position: "absolute",
            right: 18,
            top: "50%",
            transform: "translateY(-50%)",
            width: 80,
            height: 80,
            borderRadius: 10,
            background: "rgba(0,0,0,0.2)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            fontSize: 30,
            color: "#fff",
          }}
        >
          ▶
        </div>
        <div
          style={{
            fontSize: 9,
            textTransform: "uppercase",
            letterSpacing: 1,
            color: "rgba(255,255,255,0.55)",
            marginBottom: 5,
          }}
        >
          Featured playlist
        </div>
        <div style={{ fontSize: 19, fontWeight: 500, marginBottom: 3 }}>Nhạc Việt Đỉnh Cao</div>
        <div style={{ fontSize: 11, color: "rgba(255,255,255,0.55)" }}>
          {list.length} songs · {hrs}hr {mins}min
        </div>
      </div>

      {/* Trending now */}
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
        <span style={{ fontSize: 14, fontWeight: 500 }}>Trending now</span>
        <span style={{ fontSize: 11, color: C[500], cursor: "pointer" }}>See all</span>
      </div>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gap: 9,
          marginBottom: 22,
        }}
      >
        {list.slice(0, 4).map(s => (
          <Card key={s.id} song={s} cur={cur} onPlay={onPlay} />
        ))}
      </div>

      {/* Recently played */}
      <div style={{ fontSize: 14, fontWeight: 500, marginBottom: 8 }}>Recently played</div>
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
