import { useState, useMemo } from "react";
import TrackRow from "../components/TrackRow";
import { TEXT } from "../constants/theme";

const GENRES = [
  { label: "Tất cả", value: "__all__", bg: "linear-gradient(135deg,#f97316,#fbbf24)" },
  { label: "V-Pop", value: "V-Pop", bg: "linear-gradient(135deg,#e11d48,#fb7185)" },
  { label: "Pop", value: "Pop", bg: "linear-gradient(135deg,#2563eb,#60a5fa)" },
  { label: "Ballad", value: "Ballad", bg: "linear-gradient(135deg,#7c3aed,#a78bfa)" },
  { label: "R&B", value: "R&B", bg: "linear-gradient(135deg,#0369a1,#38bdf8)" },
  { label: "Hip-hop", value: "Hip-hop", bg: "linear-gradient(135deg,#92400e,#fbbf24)" },
  { label: "Dance", value: "Dance", bg: "linear-gradient(135deg,#7c3aed,#c084fc)" },
  { label: "EDM", value: "EDM", bg: "linear-gradient(135deg,#0f766e,#34d399)" },
  { label: "Rock", value: "Rock", bg: "linear-gradient(135deg,#334155,#94a3b8)" },
  { label: "Funk", value: "Funk", bg: "linear-gradient(135deg,#be123c,#fb7185)" },
  { label: "Indie", value: "Indie", bg: "linear-gradient(135deg,#166534,#4ade80)" },
];

function GenrePill({ genre, active, onClick }) {
  return (
    <div
      onClick={onClick}
      style={{
        borderRadius: 8,
        padding: "0 16px",
        height: 56,
        display: "flex",
        alignItems: "flex-end",
        paddingBottom: 10,
        background: active ? genre.bg : "rgba(255,255,255,0.07)",
        cursor: "pointer",
        transition: "opacity 0.15s, transform 0.15s",
        minWidth: 140,
        position: "relative",
        overflow: "hidden",
        outline: active ? `2px solid rgba(255,255,255,0.3)` : "none",
        outlineOffset: 2,
      }}
      onMouseEnter={e => { e.currentTarget.style.opacity = "0.85"; }}
      onMouseLeave={e => { e.currentTarget.style.opacity = "1"; }}
    >
      <span style={{ fontSize: 14, fontWeight: 600, color: "#fff", letterSpacing: -0.2 }}>
        {genre.label}
      </span>
      <span
        style={{
          position: "absolute",
          right: -6,
          bottom: -8,
          fontSize: 42,
          opacity: 0.35,
          transform: "rotate(-20deg)",
          lineHeight: 1,
        }}
      >
        ♪
      </span>
    </div>
  );
}

export default function PageSearch({ list, query, cur, onPlay, likedIds, onLike, onAddToQueue }) {
  const [genre, setGenre] = useState(null);

  const results = useMemo(() => {
    let filtered = list;
    if (genre && genre !== "__all__") filtered = filtered.filter(s => s.genre === genre);
    if (query) {
      const q = query.toLowerCase();
      filtered = filtered.filter(
        s =>
          s.title.toLowerCase().includes(q) ||
          s.artist.toLowerCase().includes(q) ||
          s.album.toLowerCase().includes(q)
      );
    }
    return filtered;
  }, [list, genre, query]);

  const isSearching = query.trim().length > 0;
  const hasGenreFilter = genre !== null;

  const resultLabel = isSearching
    ? `Kết quả cho "${query}"`
    : genre === "__all__"
      ? "Tất cả bài hát"
      : genre;

  return (
    <div style={{ animation: "slideUp 0.3s ease", padding: "32px 28px 80px" }}>
      {/* Genre grid — luôn hiện */}
      <h1 style={{ fontSize: 22, fontWeight: 600, letterSpacing: -0.3, marginBottom: 20 }}>
        Duyệt qua tất cả
      </h1>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))",
          gap: 10,
          marginBottom: 40,
        }}
      >
        {GENRES.map(g => (
          <GenrePill
            key={g.label}
            genre={g}
            active={genre === g.value}
            onClick={() => setGenre(prev => (prev === g.value ? null : g.value))}
          />
        ))}
      </div>

      {/* Results: hiện khi đang search HOẶC đã chọn genre */}
      {(isSearching || hasGenreFilter) && (
        <>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 14,
            }}
          >
            <span style={{ fontSize: 22, fontWeight: 600, letterSpacing: -0.3 }}>
              {resultLabel}
            </span>
            <span style={{ fontSize: 12, color: TEXT.secondary }}>
              {results.length} {isSearching ? "kết quả" : "bài hát"}
            </span>
          </div>
          {results.length === 0 ? (
            <div
              style={{
                textAlign: "center",
                padding: "60px 0",
                color: TEXT.secondary,
              }}
            >
              <div style={{ fontSize: 40, marginBottom: 16, opacity: 0.4 }}>⌕</div>
              <div style={{ fontSize: 16, fontWeight: 500, marginBottom: 8 }}>
                Không tìm thấy kết quả
              </div>
              <div style={{ fontSize: 13, color: TEXT.tertiary }}>
                Hãy thử tìm kiếm với từ khóa khác
              </div>
            </div>
          ) : (
            results.map((s, i) => (
              <TrackRow
                key={s.id}
                song={s}
                index={i}
                cur={cur}
                onPlay={onPlay}
                likedIds={likedIds}
                onLike={onLike}
                onAddToQueue={onAddToQueue}
              />
            ))
          )}
        </>
      )}
    </div>
  );
}
