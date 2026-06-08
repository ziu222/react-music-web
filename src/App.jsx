import { useState, useEffect } from "react";
import songs from "./data/songs";
import playlists from "./data/playlists";
import Player from "./components/Player";
import PageHome from "./pages/PageHome";
import { C, G, R, BG, TEXT, BORDER } from "./constants/theme";

export default function App() {
  const [page, setPage] = useState("home");
  const [loading, setLoading] = useState(false);
  const [cur, setCur] = useState(null);
  const [playing, setPlaying] = useState(false);
  const [prog, setProg] = useState(0);
  const [likedIds, setLikedIds] = useState(new Set());
  const [list] = useState(songs);

  const nav = (p) => {
    if (loading || p === page) return;
    setLoading(true);
    setTimeout(() => { setPage(p); setLoading(false); }, 600);
  };

  const play = (s) => { setCur(s); setPlaying(true); setProg(0); };

  const toggleLike = (id) => {
    setLikedIds(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  useEffect(() => {
    if (!playing || !cur) return;
    const t = setInterval(() => {
      setProg(p => {
        if (p >= cur.durationSecs) { setPlaying(false); return 0; }
        return p + 1;
      });
    }, 1000);
    return () => clearInterval(t);
  }, [playing, cur]);

  const navItems = [
    { id: "home", label: "Home" },
    { id: "search", label: "Search" },
    { id: "library", label: "Library" },
  ];

  return (
    <div
      style={{
        display: "flex",
        height: "100vh",
        background: BG.base,
        color: TEXT.primary,
        fontFamily: "Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
        overflow: "hidden",
      }}
    >
      {/* Sidebar */}
      <div
        style={{
          width: 220,
          background: BG.card,
          padding: "20px 14px",
          display: "flex",
          flexDirection: "column",
          gap: 2,
          borderRight: `0.5px solid ${BORDER}`,
          flexShrink: 0,
        }}
      >
        {/* Logo */}
        <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "4px 0 20px" }}>
          <div
            style={{
              width: 28,
              height: 28,
              borderRadius: "50%",
              background: `linear-gradient(135deg, ${C[500]}, ${G[400]})`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 13,
              fontWeight: 500,
              color: "#fff",
              flexShrink: 0,
            }}
          >
            M
          </div>
          <span style={{ fontWeight: 500, fontSize: 15, letterSpacing: -0.3 }}>Melodies</span>
        </div>

        {/* Nav section label */}
        <div
          style={{
            fontSize: 10,
            textTransform: "uppercase",
            letterSpacing: 1.2,
            color: "rgba(255,255,255,0.25)",
            padding: "4px 8px",
            fontWeight: 500,
          }}
        >
          Menu
        </div>

        {/* Nav items */}
        {navItems.map(({ id, label }) => {
          const active = page === id && !loading;
          return (
            <div
              key={id}
              onClick={() => nav(id)}
              style={{
                background: active ? `${C[500]}1A` : "transparent",
                borderRadius: 8,
                padding: "9px 10px",
                fontSize: 13,
                cursor: "pointer",
                transition: "all 0.15s",
                color: active ? C[400] : TEXT.secondary,
                fontWeight: active ? 500 : 400,
              }}
            >
              {label}
            </div>
          );
        })}

        {/* Playlists section label */}
        <div
          style={{
            fontSize: 10,
            textTransform: "uppercase",
            letterSpacing: 1.2,
            color: "rgba(255,255,255,0.25)",
            padding: "16px 8px 4px",
            fontWeight: 500,
          }}
        >
          Playlists
        </div>

        {/* Playlist items */}
        {playlists.map(pl => (
          <div
            key={pl.id}
            style={{
              padding: "7px 10px",
              display: "flex",
              alignItems: "center",
              gap: 8,
              fontSize: 12,
              color: TEXT.secondary,
              cursor: "pointer",
              borderRadius: 8,
              transition: "background 0.15s",
            }}
          >
            <div
              style={{
                width: 8,
                height: 8,
                borderRadius: 2,
                background: pl.bg,
                flexShrink: 0,
              }}
            />
            {pl.name}
          </div>
        ))}

        {/* Liked count */}
        <div style={{ marginTop: "auto", padding: "12px 10px", fontSize: 11, color: "rgba(255,255,255,0.25)" }}>
          ♥ {likedIds.size} liked songs
        </div>
      </div>

      {/* Main */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        {/* Top bar */}
        <div
          style={{
            padding: "12px 24px",
            display: "flex",
            alignItems: "center",
            justifyContent: "flex-end",
            flexShrink: 0,
            borderBottom: `0.5px solid ${BORDER}`,
          }}
        >
          <div
            style={{
              width: 30,
              height: 30,
              borderRadius: "50%",
              background: `linear-gradient(135deg, ${C[600]}, ${C[500]})`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 12,
              fontWeight: 500,
              color: "#fff",
              cursor: "pointer",
            }}
          >
            N
          </div>
        </div>

        {/* Page content */}
        <div style={{ flex: 1, overflowY: "auto", padding: "24px 28px" }}>
          {loading ? (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                height: "60%",
                fontSize: 12,
                color: TEXT.tertiary,
              }}
            >
              Loading...
            </div>
          ) : (
            <>
              {page === "home" && (
                <PageHome
                  list={list}
                  cur={cur}
                  onPlay={play}
                  likedIds={likedIds}
                  onLike={toggleLike}
                />
              )}
            </>
          )}
        </div>

        <Player
          s={cur}
          playing={playing}
          prog={prog}
          onToggle={() => setPlaying(p => !p)}
          likedIds={likedIds}
          onLike={toggleLike}
        />
      </div>
    </div>
  );
}
