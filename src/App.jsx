import { useState, useEffect, useCallback } from "react";
import songs from "./data/songs";
import playlists from "./data/playlists";
import Splash from "./components/Splash";
import Loader from "./components/Loader";
import Player from "./components/Player";
import PageHome from "./pages/PageHome";
import { C, G, R, BG, TEXT, BORDER } from "./constants/theme";

export default function App() {
  const [screen, setScreen] = useState("splash");
  const [page, setPage] = useState("home");
  const [loading, setLoading] = useState(false);
  const [cur, setCur] = useState(null);
  const [playing, setPlaying] = useState(false);
  const [prog, setProg] = useState(0);
  const [likedIds, setLikedIds] = useState(new Set());
  const [list] = useState(songs);

  const done = useCallback(() => setScreen("app"), []);

  const nav = (p) => {
    if (loading || p === page) return;
    setLoading(true);
    setTimeout(() => { setPage(p); setLoading(false); }, 500 + Math.random() * 300);
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

  if (screen === "splash") return <Splash onDone={done} />;

  const navItems = [
    { id: "home", label: "Home" },
    { id: "search", label: "Search" },
    { id: "library", label: "Library" },
  ];

  return (
    <div
      style={{
        background: BG.base,
        color: TEXT.primary,
        fontFamily: "Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
        borderRadius: 12,
        overflow: "hidden",
        minHeight: "100vh",
      }}
    >
      <div style={{ display: "flex", height: "calc(100vh - 72px)" }}>
        {/* Sidebar */}
        <div
          style={{
            width: 195,
            background: BG.card,
            padding: "18px 14px",
            display: "flex",
            flexDirection: "column",
            gap: 3,
            borderRight: `0.5px solid ${BORDER}`,
            flexShrink: 0,
          }}
        >
          {/* Logo */}
          <div style={{ display: "flex", alignItems: "center", gap: 7, padding: "6px 0 18px" }}>
            <div
              style={{
                width: 26,
                height: 26,
                borderRadius: "50%",
                background: `linear-gradient(135deg, ${C[500]}, ${G[400]})`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 12,
                color: "#fff",
                fontWeight: 500,
                flexShrink: 0,
              }}
            >
              M
            </div>
            <span style={{ fontWeight: 500, fontSize: 14, letterSpacing: -0.3 }}>Melodies</span>
          </div>

          {/* Menu label */}
          <div
            style={{
              fontSize: 9,
              textTransform: "uppercase",
              letterSpacing: 1.2,
              color: "rgba(255,255,255,0.25)",
              padding: "6px 9px 3px",
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
                  borderRadius: 7,
                  padding: "8px 9px",
                  display: "flex",
                  alignItems: "center",
                  gap: 7,
                  fontSize: 12,
                  cursor: "pointer",
                  transition: "all 0.15s",
                  color: active ? C[400] : "rgba(255,255,255,0.45)",
                  fontWeight: active ? 500 : 400,
                }}
              >
                {label}
              </div>
            );
          })}

          {/* Playlists label */}
          <div
            style={{
              fontSize: 9,
              textTransform: "uppercase",
              letterSpacing: 1.2,
              color: "rgba(255,255,255,0.25)",
              padding: "14px 9px 3px",
              fontWeight: 500,
            }}
          >
            Playlists
          </div>

          {/* Playlist items */}
          {playlists.map((pl, i) => (
            <div
              key={pl.id}
              style={{
                padding: "6px 9px",
                display: "flex",
                alignItems: "center",
                gap: 7,
                fontSize: 12,
                color: "rgba(255,255,255,0.45)",
                cursor: "pointer",
              }}
            >
              {i === 0 ? (
                <span style={{ fontSize: 12, color: R[400] }}>♥</span>
              ) : (
                <span style={{ fontSize: 12, color: "rgba(255,255,255,0.3)" }}>≡</span>
              )}
              {pl.name}
            </div>
          ))}

          {/* Liked count */}
          <div style={{ marginTop: "auto", padding: "10px 9px 0", fontSize: 11, color: "rgba(255,255,255,0.2)" }}>
            ♥ {likedIds.size} liked
          </div>
        </div>

        {/* Main */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
          {/* Top bar */}
          <div
            style={{
              padding: "14px 20px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              flexShrink: 0,
            }}
          >
            <div style={{ display: "flex", gap: 5 }}>
              {["‹", "›"].map((ch, i) => (
                <div
                  key={i}
                  style={{
                    width: 26,
                    height: 26,
                    borderRadius: "50%",
                    background: "rgba(255,255,255,0.06)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 16,
                    color: "rgba(255,255,255,0.35)",
                    cursor: "pointer",
                    lineHeight: 1,
                  }}
                >
                  {ch}
                </div>
              ))}
            </div>
            <div
              style={{
                width: 28,
                height: 28,
                borderRadius: "50%",
                background: `linear-gradient(135deg, ${C[600]}, ${C[500]})`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 11,
                fontWeight: 500,
                color: "#fff",
                cursor: "pointer",
              }}
            >
              N
            </div>
          </div>

          {/* Page content */}
          <div style={{ flex: 1, overflowY: "auto", padding: "0 20px 12px" }}>
            {loading ? (
              <Loader text={`Loading ${page}...`} />
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
        </div>
      </div>

      {/* Player */}
      <Player
        s={cur}
        playing={playing}
        prog={prog}
        onToggle={() => setPlaying(p => !p)}
        likedIds={likedIds}
        onLike={toggleLike}
      />
    </div>
  );
}
