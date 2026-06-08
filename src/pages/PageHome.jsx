import { useRef } from "react";
import Card from "../components/Card";
import TrackRow from "../components/TrackRow";
import { C, R, GRADIENTS } from "../constants/theme";
import { artistImages, getPrimaryArtist } from "../data/media";

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

export default function PageHome({ list, cur, onPlay, likedIds, onLike }) {
  const artists = [
    ...new Map(
      [...list]
        .sort((a, b) => b.plays - a.plays)
        .map(s => [getPrimaryArtist(s.artist), s])
    ).values(),
  ].slice(0, 12).map((s, i) => ({
    name: getPrimaryArtist(s.artist),
    initial: s.artist[0],
    bg: ARTIST_COLORS[i % ARTIST_COLORS.length],
    image: artistImages[getPrimaryArtist(s.artist)],
  }));

  return (
    <div style={{ animation: "slideUp 0.3s ease", padding: "32px 28px 48px" }}>

      {/* Trending */}
      <section style={{ marginBottom: 48 }}>
        <SectionHeader title="Những bài hát thịnh hành" />
        <HScroll>
          {list.map(s => (
            <Card key={s.id} song={s} cur={cur} onPlay={onPlay} width={160} />
          ))}
        </HScroll>
      </section>

      {/* Popular Artists */}
      <section style={{ marginBottom: 48 }}>
        <SectionHeader title="Nghệ sĩ phổ biến" />
        <HScroll>
          {artists.map((a, i) => (
            <div
              key={i}
              style={{ flexShrink: 0, width: 150, cursor: "pointer", textAlign: "center", scrollSnapAlign: "start" }}
            >
              <div
                style={{
                  width: 150,
                  height: 150,
                  borderRadius: "50%",
                  background: a.bg,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: 10,
                  fontSize: 40,
                  fontWeight: 500,
                  color: "rgba(255,255,255,0.9)",
                  overflow: "hidden",
                }}
              >
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
              <div
                style={{
                  fontSize: 13,
                  fontWeight: 500,
                  color: "#ede5dd",
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                {a.name}
              </div>
              <div style={{ fontSize: 11, color: "rgba(255,255,255,0.45)", marginTop: 3 }}>
                Nghệ sĩ
              </div>
            </div>
          ))}
        </HScroll>
      </section>

      {/* Recently played */}
      <section>
        <SectionHeader title="Nghe gần đây" />
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
      </section>
    </div>
  );
}
