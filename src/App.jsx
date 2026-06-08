import { useState, useEffect, useCallback } from "react";
import songs from "./data/songs";
import playlistsSeed from "./data/playlists";
import Splash from "./components/Splash";
import Loader from "./components/Loader";
import Player from "./components/Player";
import Sidebar from "./components/Sidebar";
import PageHome from "./pages/PageHome";
import PageSearch from "./pages/PageSearch";
import PageLibrary from "./pages/PageLibrary";
import { C, G, BG, TEXT, BORDER } from "./constants/theme";

export default function App() {
  const [screen, setScreen] = useState("splash");
  const [page, setPage] = useState("home");
  const [loading, setLoading] = useState(false);
  const [cur, setCur] = useState(null);
  const [playing, setPlaying] = useState(false);
  const [prog, setProg] = useState(0);
  const [likedIds, setLikedIds] = useState(new Set());
  const [list] = useState(songs);
  const [search, setSearch] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [recentIds, setRecentIds] = useState([]);
  const [userPlaylists, setUserPlaylists] = useState(() => {
    try { return JSON.parse(localStorage.getItem("melodies_playlists") || "null") || playlistsSeed; }
    catch { return playlistsSeed; }
  });
  const [selectedPlaylistId, setSelectedPlaylistId] = useState(1);
  const [libraryFilter, setLibraryFilter] = useState("Danh sách phát");
  const [librarySearch, setLibrarySearch] = useState("");
  const [librarySort, setLibrarySort] = useState("recent");
  const [libraryViewMode, setLibraryViewMode] = useState("list");

  useEffect(() => {
    try { localStorage.setItem("melodies_playlists", JSON.stringify(userPlaylists)); }
    catch (err) { void err; }
  }, [userPlaylists]);

  const done = useCallback(() => setScreen("app"), []);

  const nav = (p) => {
    if (loading || p === page) return;
    setLoading(true);
    setTimeout(() => { setPage(p); setLoading(false); }, 500 + Math.random() * 300);
  };

  const play = (s) => {
    setCur(s);
    setPlaying(true);
    setProg(0);
    setRecentIds(prev => [s.id, ...prev.filter(id => id !== s.id)].slice(0, 12));
  };

  const createPlaylist = () => {
    const newPl = {
      id: `local-${Date.now()}`,
      name: "Danh sách phát mới",
      type: "playlist",
      bg: "linear-gradient(135deg,#334155,#64748b)",
    };
    setUserPlaylists(prev => [...prev, newPl]);
    setSelectedPlaylistId(newPl.id);
    setSidebarOpen(true);
    setPage("library");
  };

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

  return (
    <div
      style={{
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        background: BG.base,
        color: TEXT.primary,
        fontFamily: "'Be Vietnam Pro', 'Noto Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
        overflow: "hidden",
      }}
    >
      {/* ── Top navbar ── */}
      <div
        style={{
          height: 60,
          flexShrink: 0,
          display: "flex",
          alignItems: "center",
          gap: 10,
          padding: "0 16px",
          background: BG.base,
          borderBottom: `0.5px solid ${BORDER}`,
        }}
      >
        {/* Logo */}
        <div
          style={{
            width: 32,
            height: 32,
            borderRadius: "50%",
            background: `linear-gradient(135deg, ${C[500]}, ${G[400]})`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 13,
            fontWeight: 500,
            color: "#fff",
            flexShrink: 0,
            cursor: "pointer",
          }}
        >
          M
        </div>

        {/* Home button */}
        <div
          onClick={() => { nav("home"); setSearch(""); }}
          style={{
            width: 40,
            height: 40,
            borderRadius: "50%",
            background: page === "home" ? `${C[500]}20` : "rgba(255,255,255,0.07)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            fontSize: 17,
            color: page === "home" ? C[400] : "rgba(255,255,255,0.7)",
            flexShrink: 0,
            transition: "all 0.15s",
          }}
        >
          ⌂
        </div>

        {/* Search bar */}
        <div style={{ flex: 1, maxWidth: 440, position: "relative" }}>
          <span
            style={{
              position: "absolute",
              left: 14,
              top: "50%",
              transform: "translateY(-50%)",
              fontSize: 13,
              color: "rgba(255,255,255,0.4)",
              pointerEvents: "none",
            }}
          >
            ⌕
          </span>
          <input
            value={search}
            onChange={e => { setSearch(e.target.value); if (page !== "search") setPage("search"); }}
            placeholder="Bạn muốn phát nội dung gì?"
            style={{
              width: "100%",
              background: "#1f1f1f",
              border: "none",
              borderRadius: 500,
              padding: "9px 16px 9px 40px",
              color: TEXT.primary,
              fontSize: 13,
              outline: "none",
              boxShadow: "rgb(18,18,18) 0px 1px 0px, rgb(80,80,80) 0px 0px 0px 1px inset",
              transition: "box-shadow 0.15s",
            }}
            onFocus={e => { e.target.style.boxShadow = `rgb(18,18,18) 0px 1px 0px, ${C[500]} 0px 0px 0px 1.5px inset`; }}
            onBlur={e => { e.target.style.boxShadow = "rgb(18,18,18) 0px 1px 0px, rgb(80,80,80) 0px 0px 0px 1px inset"; }}
          />
        </div>

        {/* Right links */}
        <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 6 }}>
          {["Premium", "Hỗ trợ"].map(l => (
            <span
              key={l}
              style={{ fontSize: 13, color: "rgba(255,255,255,0.7)", cursor: "pointer", padding: "0 6px", fontWeight: 500 }}
            >
              {l}
            </span>
          ))}
          <div style={{ width: 1, height: 20, background: BORDER, margin: "0 4px" }} />
          <span style={{ fontSize: 13, color: "rgba(255,255,255,0.7)", cursor: "pointer", padding: "0 6px" }}>
            Cài đặt
          </span>
          <button
            style={{
              background: "transparent",
              border: `1.5px solid rgba(255,255,255,0.5)`,
              borderRadius: 9999,
              padding: "6px 16px",
              fontSize: 13,
              color: TEXT.primary,
              cursor: "pointer",
              fontWeight: 500,
              transition: "all 0.15s",
            }}
            onMouseEnter={e => { e.target.style.borderColor = "#fff"; e.target.style.transform = "scale(1.02)"; }}
            onMouseLeave={e => { e.target.style.borderColor = "rgba(255,255,255,0.5)"; e.target.style.transform = "scale(1)"; }}
          >
            Đăng ký
          </button>
          <button
            style={{
              background: "#fff",
              border: "none",
              borderRadius: 9999,
              padding: "7px 18px",
              fontSize: 13,
              color: "#141010",
              cursor: "pointer",
              fontWeight: 500,
              transition: "transform 0.15s",
            }}
            onMouseEnter={e => { e.target.style.transform = "scale(1.02)"; }}
            onMouseLeave={e => { e.target.style.transform = "scale(1)"; }}
          >
            Đăng nhập
          </button>
        </div>
      </div>

      {/* ── Body ── */}
      <div style={{ flex: 1, display: "flex", overflow: "hidden" }}>
        <Sidebar
          isOpen={sidebarOpen}
          onToggle={() => setSidebarOpen(p => !p)}
          likedIds={likedIds}
          onNav={nav}
          userPlaylists={userPlaylists}
          selectedPlaylistId={selectedPlaylistId}
          onSelectPlaylist={setSelectedPlaylistId}
          libraryFilter={libraryFilter}
          onSetLibraryFilter={setLibraryFilter}
          librarySearch={librarySearch}
          onSetLibrarySearch={setLibrarySearch}
          librarySort={librarySort}
          onSetLibrarySort={setLibrarySort}
          libraryViewMode={libraryViewMode}
          onSetLibraryViewMode={setLibraryViewMode}
          onCreatePlaylist={createPlaylist}
        />

        {/* Main content */}
        <div style={{ flex: 1, overflowY: "auto", background: BG.base }}>
          {loading ? (
            <Loader text={`Đang tải ${page}...`} />
          ) : (
            <>
              {page === "home" && (
                <PageHome
                  list={list}
                  cur={cur}
                  onPlay={play}
                  likedIds={likedIds}
                  onLike={toggleLike}
                  recentIds={recentIds}
                />
              )}
              {page === "search" && (
                <PageSearch
                  list={list}
                  query={search}
                  cur={cur}
                  onPlay={play}
                  likedIds={likedIds}
                  onLike={toggleLike}
                />
              )}
              {page === "library" && (
                <PageLibrary
                  list={list}
                  cur={cur}
                  onPlay={play}
                  likedIds={likedIds}
                  onLike={toggleLike}
                  userPlaylists={userPlaylists}
                  selectedPlaylistId={selectedPlaylistId}
                  onSelectPlaylist={setSelectedPlaylistId}
                  libraryFilter={libraryFilter}
                  onSetLibraryFilter={setLibraryFilter}
                />
              )}
            </>
          )}
        </div>
      </div>

      {/* ── Player ── */}
      <Player
        s={cur}
        playing={playing}
        prog={prog}
        onToggle={() => setPlaying(p => !p)}
        likedIds={likedIds}
        onLike={toggleLike}
      />

      {/* ── Bottom promo banner (when not logged in) ── */}
      {!cur && (
        <div
          style={{
            background: `linear-gradient(90deg, ${C[700]}, #7c3aed)`,
            padding: "14px 24px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexShrink: 0,
          }}
        >
          <div>
            <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 2 }}>Xem trước Melodies</div>
            <div style={{ fontSize: 11, color: "rgba(255,255,255,0.75)" }}>
              Đăng ký để nghe không giới hạn, không quảng cáo
            </div>
          </div>
          <button
            style={{
              background: "#fff",
              border: "none",
              borderRadius: 9999,
              padding: "10px 24px",
              fontSize: 13,
              fontWeight: 500,
              color: "#141010",
              cursor: "pointer",
              flexShrink: 0,
            }}
          >
            Đăng ký miễn phí
          </button>
        </div>
      )}
    </div>
  );
}
