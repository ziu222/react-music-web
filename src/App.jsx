import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import songs from "./data/songs";
import playlistsSeed from "./data/playlists";
import Splash from "./components/Splash";
import Loader from "./components/Loader";
import Player from "./components/Player";
import Sidebar from "./components/Sidebar";
import AuthModal from "./components/AuthModal";
import AuthGateModal from "./components/AuthGateModal";
import NavbarUserActions from "./components/NavbarUserActions";
import PageHome from "./pages/PageHome";
import PageSearch from "./pages/PageSearch";
import PageLibrary from "./pages/PageLibrary";
import logo from "./assets/logo.png";
import { C, BG, TEXT, BORDER } from "./constants/theme";

export default function App() {
  const audioRef = useRef(new Audio());
  const [screen, setScreen] = useState("splash");
  const [page, setPage] = useState("home");
  const [loading, setLoading] = useState(false);
  const [cur, setCur] = useState(null);
  const [playing, setPlaying] = useState(false);
  const [prog, setProg] = useState(0);
  const [volume, setVolume] = useState(0.7);
  const [muted, setMuted] = useState(false);
  const [shuffle, setShuffle] = useState(false);
  const [repeatMode, setRepeatMode] = useState("off");
  const [likedIds, setLikedIds] = useState(new Set());
  const [list] = useState(songs);
  const [search, setSearch] = useState("");
  const [authMode, setAuthMode] = useState(null);
  const [authUser, setAuthUser] = useState(null);
  const [authGate, setAuthGate] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [recentIds, setRecentIds] = useState([]);
  const [userPlaylists, setUserPlaylists] = useState(() => {
    try {
      const stored = JSON.parse(localStorage.getItem("melodies_playlists") || "null");
      if (!stored) return playlistsSeed;
      const seedMap = new Map(playlistsSeed.map(pl => [pl.id, pl]));
      return stored.map(pl => {
        const seed = typeof pl.id === "number" ? seedMap.get(pl.id) : null;
        return seed ? { ...pl, songIds: seed.songIds } : pl;
      });
    } catch { return playlistsSeed; }
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

  const openAuth = (mode) => setAuthMode(mode);

  const handleAuth = (user) => {
    setAuthUser(user);
    setAuthMode(null);
    const pendingAction = authGate?.afterAuth;
    setAuthGate(null);
    setSearch("");
    setPage("home");
    pendingAction?.();
  };

  const handleLogout = () => {
    setAuthUser(null);
    setAuthGate(null);
    setAuthMode(null);
    setCur(null);
    setPlaying(false);
    setProg(0);
    setSelectedPlaylistId(1);
  };

  const nav = (p) => {
    if (loading || p === page) return;
    setLoading(true);
    setTimeout(() => { setPage(p); setLoading(false); }, 500 + Math.random() * 300);
  };

  const play = useCallback((s) => {
    setCur(s);
    setPlaying(true);
    setProg(0);
    setRecentIds(prev => [s.id, ...prev.filter(id => id !== s.id)].slice(0, 12));
  }, []);

  const playByIndex = useCallback((index) => {
    if (!list.length) return;
    const normalized = (index + list.length) % list.length;
    play(list[normalized]);
  }, [list, play]);

  const playNext = useCallback(({ allowWrap = true } = {}) => {
    if (!list.length) return;

    const currentIndex = cur ? list.findIndex(song => song.id === cur.id) : -1;
    if (shuffle && list.length > 1) {
      let randomIndex = Math.floor(Math.random() * list.length);
      if (randomIndex === currentIndex) randomIndex = (randomIndex + 1) % list.length;
      playByIndex(randomIndex);
      return;
    }

    if (currentIndex === -1) {
      playByIndex(0);
      return;
    }

    if (currentIndex === list.length - 1 && !allowWrap) {
      setPlaying(false);
      setProg(0);
      return;
    }

    playByIndex(currentIndex + 1);
  }, [cur, list, playByIndex, shuffle]);

  const playPrevious = useCallback(() => {
    if (!list.length) return;

    const audio = audioRef.current;
    if ((audio.currentTime || prog) > 3) {
      audio.currentTime = 0;
      setProg(0);
      return;
    }

    const currentIndex = cur ? list.findIndex(song => song.id === cur.id) : -1;
    playByIndex(currentIndex <= 0 ? list.length - 1 : currentIndex - 1);
  }, [cur, list, playByIndex, prog]);

  const seekTo = useCallback((seconds) => {
    if (!cur) return;
    const clamped = Math.min(cur.durationSecs, Math.max(0, seconds));
    audioRef.current.currentTime = clamped;
    setProg(Math.floor(clamped));
  }, [cur]);

  const changeVolume = useCallback((value) => {
    const clamped = Math.min(1, Math.max(0, value));
    setVolume(clamped);
    setMuted(clamped === 0);
  }, []);

  const cycleRepeatMode = useCallback(() => {
    setRepeatMode(mode => mode === "off" ? "all" : mode === "all" ? "one" : "off");
  }, []);

  const requireAuth = (action, gate) => {
    if (authUser) {
      action();
      return;
    }
    setAuthGate({ ...gate, afterAuth: action });
  };

  const playWithAuth = (s) => {
    requireAuth(() => play(s), { reason: "play", song: s });
  };

  const getPlaylistSongs = (pl) => {
    if (!pl) return [];
    if (pl.type === "liked") return list.filter(s => likedIds.has(s.id));
    if (pl.songIds?.length) {
      const map = new Map(list.map(s => [s.id, s]));
      return pl.songIds.map(id => map.get(id)).filter(Boolean);
    }
    if (typeof pl.id === "string") return [];
    return [];
  };

  const playPlaylist = (pl) => {
    const firstSong = getPlaylistSongs(pl)[0];
    if (firstSong) {
      requireAuth(() => play(firstSong), { reason: "play", playlist: pl, song: firstSong });
    }
  };

  const openAlbum = (albumName) => {
    setLibraryFilter("Album");
    setSelectedPlaylistId(`album:${albumName}`);
    setSidebarOpen(true);
    nav("library");
  };

  const createPlaylist = () => {
    const newPl = {
      id: `local-${Date.now()}`,
      name: "Danh sách phát mới",
      type: "playlist",
      isPersonal: true,
      bg: "linear-gradient(135deg,#334155,#64748b)",
    };
    setUserPlaylists(prev => [...prev, newPl]);
    setSelectedPlaylistId(newPl.id);
    setSidebarOpen(true);
    setPage("library");
  };

  const createPlaylistWithAuth = () => {
    requireAuth(createPlaylist, { reason: "createPlaylist" });
  };

  const deletePlaylist = (id) => {
    setUserPlaylists(prev => prev.filter(pl => pl.id !== id));
    setSelectedPlaylistId(cur => (cur === id ? 1 : cur));
  };

  const renamePlaylist = (id, newName) => {
    const trimmed = newName.trim();
    if (!trimmed) return;
    setUserPlaylists(prev => prev.map(pl => pl.id === id ? { ...pl, name: trimmed } : pl));
  };

  const togglePinPlaylist = (id) => {
    setUserPlaylists(prev => prev.map(pl => pl.id === id ? { ...pl, isPinned: !pl.isPinned } : pl));
  };

  const togglePublicPlaylist = (id) => {
    setUserPlaylists(prev => prev.map(pl => pl.id === id ? { ...pl, isPublic: !pl.isPublic } : pl));
  };

  const toggleLike = (id) => {
    setLikedIds(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const toggleLikeWithAuth = (id) => {
    const song = list.find(s => s.id === id);
    requireAuth(() => toggleLike(id), { reason: "like", song });
  };

  const visiblePlaylists = useMemo(
    () => authUser ? userPlaylists : userPlaylists.filter(pl => typeof pl.id !== "string" && !pl.isPersonal),
    [authUser, userPlaylists]
  );

  const albumPlaylists = useMemo(() => {
    const albumMap = new Map();
    list.forEach((song, index) => {
      if (!albumMap.has(song.album)) {
        albumMap.set(song.album, { songs: [], firstIndex: index });
      }
      albumMap.get(song.album).songs.push(song);
    });

    return [...albumMap.entries()]
      .map(([albumName, value]) => {
        const representative = [...value.songs].sort((a, b) => b.plays - a.plays)[0];
        return {
          id: `album:${albumName}`,
          name: albumName,
          type: "album",
          artist: representative.artist.split(" ft.")[0].trim(),
          bg: representative.bg,
          songIds: value.songs.map(song => song.id),
          firstIndex: value.firstIndex,
          latestSongId: Math.max(...value.songs.map(song => song.id)),
          totalPlays: value.songs.reduce((sum, song) => sum + song.plays, 0),
        };
      })
      .sort((a, b) => b.songIds.length - a.songIds.length || b.latestSongId - a.latestSongId);
  }, [list]);

  useEffect(() => {
    const audio = audioRef.current;
    audio.preload = "metadata";

    const syncProgress = () => setProg(Math.floor(audio.currentTime || 0));
    const stopPlayback = () => setPlaying(false);
    audio.addEventListener("timeupdate", syncProgress);
    audio.addEventListener("error", stopPlayback);

    return () => {
      audio.pause();
      audio.removeEventListener("timeupdate", syncProgress);
      audio.removeEventListener("error", stopPlayback);
    };
  }, []);

  useEffect(() => {
    const audio = audioRef.current;
    const finishPlayback = () => {
      if (repeatMode === "one") {
        audio.currentTime = 0;
        setProg(0);
        setPlaying(true);
        audio.play().catch(() => setPlaying(false));
        return;
      }

      playNext({ allowWrap: repeatMode === "all" });
    };

    audio.addEventListener("ended", finishPlayback);
    return () => audio.removeEventListener("ended", finishPlayback);
  }, [playNext, repeatMode]);

  useEffect(() => {
    audioRef.current.volume = muted ? 0 : volume;
  }, [muted, volume]);

  useEffect(() => {
    const audio = audioRef.current;
    audio.pause();
    setProg(0);

    if (!cur?.audioUrl) {
      audio.removeAttribute("src");
      audio.load();
      return;
    }

    audio.src = cur.audioUrl;
    audio.currentTime = 0;
    audio.load();
  }, [cur]);

  useEffect(() => {
    const audio = audioRef.current;

    if (!cur?.audioUrl) {
      if (playing) setPlaying(false);
      return;
    }

    if (!playing) {
      audio.pause();
      return;
    }

    audio.play().catch(() => setPlaying(false));
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
            background: "#1f1713",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            overflow: "hidden",
            flexShrink: 0,
            cursor: "pointer",
          }}
        >
          <img
            src={logo}
            alt="Melodies"
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              display: "block",
            }}
          />
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
          <NavbarUserActions
            user={authUser}
            onHome={() => { nav("home"); setSearch(""); }}
            onLogout={handleLogout}
          />
          <button
            type="button"
            onClick={() => openAuth("register")}
            style={{
              display: authUser ? "none" : "inline-block",
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
            type="button"
            onClick={() => openAuth("login")}
            style={{
              display: authUser ? "none" : "inline-block",
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
          list={list}
          onNav={nav}
          userPlaylists={visiblePlaylists}
          albumPlaylists={albumPlaylists}
          isAuthed={Boolean(authUser)}
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
          onCreatePlaylist={createPlaylistWithAuth}
          onPlayPlaylist={playPlaylist}
          onDeletePlaylist={deletePlaylist}
          onRenamePlaylist={renamePlaylist}
          onTogglePinPlaylist={togglePinPlaylist}
          onTogglePublicPlaylist={togglePublicPlaylist}
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
                  onPlay={playWithAuth}
                  likedIds={likedIds}
                  onLike={toggleLikeWithAuth}
                  recentIds={recentIds}
                  onOpenAlbum={openAlbum}
                />
              )}
              {page === "search" && (
                <PageSearch
                  list={list}
                  query={search}
                  cur={cur}
                  onPlay={playWithAuth}
                  likedIds={likedIds}
                  onLike={toggleLikeWithAuth}
                />
              )}
              {page === "library" && (
                <PageLibrary
                  list={list}
                  cur={cur}
                  onPlay={playWithAuth}
                  likedIds={likedIds}
                  onLike={toggleLikeWithAuth}
                  userPlaylists={visiblePlaylists}
                  albumPlaylists={albumPlaylists}
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
        volume={volume}
        muted={muted}
        shuffle={shuffle}
        repeatMode={repeatMode}
        onToggle={() => setPlaying(p => !p)}
        onPrevious={playPrevious}
        onNext={() => playNext()}
        onSeek={seekTo}
        onVolumeChange={changeVolume}
        onMuteToggle={() => setMuted(p => !p)}
        onShuffleToggle={() => setShuffle(p => !p)}
        onRepeatCycle={cycleRepeatMode}
        likedIds={likedIds}
        onLike={toggleLikeWithAuth}
      />

      <AuthGateModal
        gate={authGate}
        onClose={() => setAuthGate(null)}
        onLogin={() => openAuth("login")}
        onRegister={() => openAuth("register")}
      />

      {authMode && (
        <AuthModal
          mode={authMode}
          onClose={() => setAuthMode(null)}
          onAuth={handleAuth}
        />
      )}

      {/* ── Bottom promo banner (when not logged in) ── */}
      {!cur && !authUser && (
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
            type="button"
            onClick={() => openAuth("register")}
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
