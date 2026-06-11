import { useState, useEffect, useCallback, useMemo, useRef, lazy, Suspense } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHouse, faMagnifyingGlass, faChevronLeft, faChevronRight } from "@fortawesome/free-solid-svg-icons";
import songs from "./data/songs";
import playlistsSeed from "./data/playlists";
import Splash from "./components/Splash";
import Loader from "./components/Loader";
import Player from "./components/Player";
import Sidebar from "./components/Sidebar";
import AuthModal from "./components/AuthModal";
import AuthGateModal from "./components/AuthGateModal";
import NavbarUserActions from "./components/NavbarUserActions";

// Modal ít dùng — tách chunk để giảm bundle chính
const PremiumModal = lazy(() => import("./components/PremiumModal"));
const SettingsModal = lazy(() => import("./components/SettingsModal"));
import {
  loadSession, saveSession, clearSession,
  normalizeUser, applyEntitlement, saveEntitlement, isPremiumUser,
  PLAN_PREMIUM,
} from "./auth/session";
import { loadSettings, saveSettings, normalizeSettingsForEntitlement } from "./lib/settings";
import { loadNotifications, saveNotifications, createNotification } from "./lib/notifications";
import PageHome from "./pages/PageHome";
import PageSearch from "./pages/PageSearch";
import PageLibrary from "./pages/PageLibrary";
import PageArtist from "./pages/PageArtist";
import PageAlbum from "./pages/PageAlbum";
import logo from "./assets/logo.png";
import { C, G, BG, TEXT, BORDER, GRADIENTS } from "./constants/theme";

function fisherYates(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export default function App() {
  const audioRef = useRef(new Audio());
  const feedbackTimerRef = useRef(null);
  const [screen, setScreen] = useState("splash");
  const [page, setPage] = useState("home");
  const [loading, setLoading] = useState(false);
  const [cur, setCur] = useState(null);
  const [playing, setPlaying] = useState(false);
  const [prog, setProg] = useState(0);
  const [volume, setVolume] = useState(0.7);
  const [muted, setMuted] = useState(false);
  const [shuffle, setShuffle] = useState(false);
  const [shuffleQueue, setShuffleQueue] = useState([]);
  const [shufflePos, setShufflePos] = useState(0);
  const [repeatMode, setRepeatMode] = useState("off");
  const [likedIds, setLikedIds] = useState(new Set());
  const [list] = useState(songs);
  const [search, setSearch] = useState("");
  const [authMode, setAuthMode] = useState(null);
  const [authUser, setAuthUser] = useState(() => loadSession());
  const [authGate, setAuthGate] = useState(null);
  const [premiumOpen, setPremiumOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [recentIds, setRecentIds] = useState([]);
  const [queuedTrackIds, setQueuedTrackIds] = useState([]);
  const [queueFeedback, setQueueFeedback] = useState(null);
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
  const [selectedArtist, setSelectedArtist] = useState(null);
  const [selectedAlbum, setSelectedAlbum] = useState(null);
  const [followedArtists, setFollowedArtists] = useState(() => {
    try { return new Set(JSON.parse(localStorage.getItem("melodies_followed_artists") || "[]")); }
    catch { return new Set(); }
  });
  const [savedAlbums, setSavedAlbums] = useState(() => {
    try { return new Set(JSON.parse(localStorage.getItem("melodies_saved_albums") || "[]")); }
    catch { return new Set(); }
  });
  const [libraryFilter, setLibraryFilter] = useState("Danh sách phát");
  const [librarySearch, setLibrarySearch] = useState("");
  const [librarySort, setLibrarySort] = useState("recent");
  const [libraryViewMode, setLibraryViewMode] = useState("list");

  useEffect(() => {
    try { localStorage.setItem("melodies_playlists", JSON.stringify(userPlaylists)); }
    catch (err) { void err; }
  }, [userPlaylists]);

  useEffect(() => {
    try { localStorage.setItem("melodies_followed_artists", JSON.stringify([...followedArtists])); }
    catch (err) { void err; }
  }, [followedArtists]);

  useEffect(() => {
    try { localStorage.setItem("melodies_saved_albums", JSON.stringify([...savedAlbums])); }
    catch (err) { void err; }
  }, [savedAlbums]);

  useEffect(() => () => { clearTimeout(feedbackTimerRef.current); }, []);

  const done = useCallback(() => setScreen("app"), []);

  const isPremium = isPremiumUser(authUser);

  // Persist mock session so reload giữ trạng thái đăng nhập/gói
  useEffect(() => {
    if (authUser) saveSession(authUser);
    else clearSession();
  }, [authUser]);

  /* ── Per-user settings + notifications (key theo email hoặc guest) ── */
  const userKey = authUser?.email?.toLowerCase() ?? "guest";
  const [settingsState, setSettingsState] = useState(() => ({ key: userKey, value: loadSettings(userKey) }));
  const [notifState, setNotifState] = useState(() => ({ key: userKey, value: loadNotifications(userKey) }));
  // High quality chỉ hợp lệ khi premium — guest/free luôn thấy normal dù stored là high
  const settings = normalizeSettingsForEntitlement(settingsState.value, isPremium);
  const notifications = notifState.value;

  // Đổi user → reset state theo key ngay trong render (React adjust-state-on-prop-change pattern)
  if (settingsState.key !== userKey) {
    setSettingsState({ key: userKey, value: loadSettings(userKey) });
  }
  if (notifState.key !== userKey) {
    setNotifState({ key: userKey, value: loadNotifications(userKey) });
  }

  // Guard theo key để không ghi nhầm dữ liệu user cũ sang user mới lúc chuyển session
  useEffect(() => {
    if (settingsState.key === userKey) saveSettings(userKey, settingsState.value);
  }, [settingsState, userKey]);

  useEffect(() => {
    if (notifState.key === userKey) saveNotifications(userKey, notifState.value);
  }, [notifState, userKey]);

  const updateSettings = (patch) => {
    setSettingsState(s => ({ ...s, value: { ...s.value, ...patch } }));
  };

  const updateNotifyType = (type, enabled) => {
    setSettingsState(s => ({
      ...s,
      value: { ...s.value, notifyTypes: { ...s.value.notifyTypes, [type]: enabled } },
    }));
  };

  const pushNotification = (type, title, body) => {
    if (settings.notifyTypes[type] === false) return;
    setNotifState(s => ({ ...s, value: [createNotification(type, title, body), ...s.value].slice(0, 30) }));
  };

  const markNotificationRead = (id) => {
    setNotifState(s => ({ ...s, value: s.value.map(n => n.id === id ? { ...n, read: true } : n) }));
  };

  const markAllNotificationsRead = () => {
    setNotifState(s => ({ ...s, value: s.value.map(n => n.read ? n : { ...n, read: true }) }));
  };

  const visibleNotifications = useMemo(
    () => notifications.filter(n => settings.notifyTypes[n.type] !== false),
    [notifications, settings.notifyTypes]
  );
  const unreadCount = useMemo(
    () => visibleNotifications.filter(n => !n.read).length,
    [visibleNotifications]
  );

  const audioQuality = settings.audioQuality;

  const openAuth = (mode) => setAuthMode(mode);

  const handleAuth = (user) => {
    // Entitlement đã mua (premium) thắng plan mặc định của tài khoản seed
    setAuthUser(normalizeUser(applyEntitlement(user)));
    setAuthMode(null);
    const pendingAction = authGate?.afterAuth;
    setAuthGate(null);
    if (pendingAction) {
      // Giữ nguyên ngữ cảnh (search/artist/album) để hành động chờ chạy đúng chỗ
      pendingAction();
      return;
    }
    setSearch("");
    setPage("home");
  };

  const handleLogout = () => {
    clearSession();
    setAuthUser(null);
    setAuthGate(null);
    setAuthMode(null);
    setPremiumOpen(false);
    setSettingsOpen(false);
    setCur(null);
    setPlaying(false);
    setProg(0);
    setSelectedPlaylistId(1);
    setQueuedTrackIds([]);
  };

  const upgradeToPremium = () => {
    if (!authUser) return;
    saveEntitlement(authUser.email, PLAN_PREMIUM);
    setAuthUser(prev => prev ? { ...prev, plan: PLAN_PREMIUM } : prev);
    pushNotification(
      "premium",
      "Chào mừng đến Melodies Premium",
      "Tải xuống, âm thanh chất lượng cao và nghe không quảng cáo đã được mở khóa."
    );
  };

  const toggleAudioQuality = () => {
    updateSettings({ audioQuality: audioQuality === "high" ? "normal" : "high" });
  };

  /* ── In-app navigation history (back / forward) ── */
  const [hist, setHist] = useState({ stack: [{ page: "home" }], index: 0 });
  const canBack = hist.index > 0;
  const canForward = hist.index < hist.stack.length - 1;

  const pushEntry = useCallback((entry) => {
    setHist(h => {
      const last = h.stack[h.index];
      if (
        last &&
        last.page === entry.page &&
        last.artist === entry.artist &&
        last.album === entry.album &&
        last.playlistId === entry.playlistId &&
        last.libraryFilter === entry.libraryFilter &&
        last.query === entry.query
      ) return h;
      const stack = [...h.stack.slice(0, h.index + 1), entry];
      return { stack, index: stack.length - 1 };
    });
  }, []);

  const replaceEntry = useCallback((patch) => {
    setHist(h => {
      const stack = [...h.stack];
      const current = stack[h.index] ?? { page };
      stack[h.index] = { ...current, ...patch };
      return { ...h, stack };
    });
  }, [page]);

  const applyEntry = useCallback((entry) => {
    if (entry.artist) setSelectedArtist(entry.artist);
    if (entry.album) setSelectedAlbum(entry.album);
    if (entry.page === "search") setSearch(entry.query ?? "");
    if (entry.page !== "search" && entry.query === undefined) setSearch("");
    if (entry.libraryFilter) setLibraryFilter(entry.libraryFilter);
    if (entry.playlistId !== undefined) {
      setSelectedPlaylistId(entry.playlistId);
      if (!entry.libraryFilter) setLibraryFilter("Danh sách phát");
    }
    setPage(entry.page);
  }, []);

  // entry: extra route state (artist/album/playlistId) recorded in history
  const nav = (p, entry) => {
    if (loading || (p === page && !entry)) return;
    pushEntry({ page: p, ...entry });
    if (p === page) return; // same page, new entity — switch without loader
    setLoading(true);
    setTimeout(() => { setPage(p); setLoading(false); }, 500 + Math.random() * 300);
  };

  const openLibrary = (entry = {}) => {
    const nextFilter = entry.libraryFilter ?? libraryFilter;
    const nextPlaylistId = entry.playlistId ?? selectedPlaylistId;
    setLibraryFilter(nextFilter);
    if (entry.playlistId !== undefined) setSelectedPlaylistId(nextPlaylistId);
    nav("library", { playlistId: nextPlaylistId, libraryFilter: nextFilter });
  };

  const handleSearchChange = (value) => {
    setSearch(value);
    if (page !== "search") {
      pushEntry({ page: "search", query: value });
      setLoading(false);
      setPage("search");
      return;
    }
    replaceEntry({ page: "search", query: value });
  };

  // Back/forward restore instantly — no fake loader on history moves
  const goBack = useCallback(() => {
    if (loading || hist.index <= 0) return;
    const idx = hist.index - 1;
    applyEntry(hist.stack[idx]);
    setHist(h => ({ ...h, index: idx }));
  }, [loading, hist, applyEntry]);

  const goForward = useCallback(() => {
    if (loading || hist.index >= hist.stack.length - 1) return;
    const idx = hist.index + 1;
    applyEntry(hist.stack[idx]);
    setHist(h => ({ ...h, index: idx }));
  }, [loading, hist, applyEntry]);

  useEffect(() => {
    const onKey = (e) => {
      if (!e.altKey) return;
      if (e.key === "ArrowLeft") { e.preventDefault(); goBack(); }
      if (e.key === "ArrowRight") { e.preventDefault(); goForward(); }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [goBack, goForward]);

  const play = useCallback((s) => {
    setCur(s);
    setPlaying(true);
    setProg(0);
    setRecentIds(prev => [s.id, ...prev.filter(id => id !== s.id)].slice(0, 12));
  }, []);

  // Play a track selected outside the queue (library, home, search) — rebuilds shuffle queue.
  const playExternal = useCallback((song) => {
    play(song);
    if (shuffle) {
      const otherIds = list.filter(s => s.id !== song.id).map(s => s.id);
      const queue = [song.id, ...fisherYates(otherIds)];
      setShuffleQueue(queue);
      setShufflePos(0);
    }
  }, [play, shuffle, list]);

  // Play a track that the user picked from the Queue panel — seeks in the existing queue.
  const playFromQueue = useCallback((song) => {
    if (shuffle) {
      if (shuffleQueue.length > 0) {
        const pos = shuffleQueue.indexOf(song.id);
        if (pos >= 0) setShufflePos(pos);
      } else {
        // shuffle on but queue missing — build it now
        const otherIds = list.filter(s => s.id !== song.id).map(s => s.id);
        setShuffleQueue([song.id, ...fisherYates(otherIds)]);
        setShufflePos(0);
      }
    }
    play(song);
  }, [play, shuffle, shuffleQueue, list]);

  const playByIndex = useCallback((index) => {
    if (!list.length) return;
    const normalized = (index + list.length) % list.length;
    play(list[normalized]);
  }, [list, play]);

  const playNext = useCallback(({ allowWrap = true } = {}) => {
    if (!list.length) return;

    // Manual queue takes priority over shuffle/linear
    if (queuedTrackIds.length > 0) {
      const [nextId, ...rest] = queuedTrackIds;
      setQueuedTrackIds(rest);
      const song = list.find(s => s.id === nextId);
      if (song) play(song);
      return;
    }

    if (shuffle) {
      let queue = shuffleQueue;
      let pos = shufflePos;
      if (queue.length === 0 && cur) {
        // queue missing while shuffle is on — build it from current song
        const otherIds = list.filter(s => s.id !== cur.id).map(s => s.id);
        queue = [cur.id, ...fisherYates(otherIds)];
        setShuffleQueue(queue);
        pos = 0;
      }
      if (queue.length > 0) {
        let nextPos = pos + 1;
        if (nextPos >= queue.length) {
          // End of shuffle cycle: put cur at front, shuffle everything else,
          // then start from position 1 so cur is not replayed immediately.
          const curId = cur?.id;
          if (curId && list.length > 1) {
            const rest = fisherYates(queue.filter(id => id !== curId));
            queue = [curId, ...rest];
            nextPos = 1;
          } else {
            queue = fisherYates([...queue]);
            nextPos = 0;
          }
          setShuffleQueue(queue);
        }
        setShufflePos(nextPos);
        const song = list.find(s => s.id === queue[nextPos]);
        if (song) play(song);
        return;
      }
    }

    const currentIndex = cur ? list.findIndex(song => song.id === cur.id) : -1;
    if (currentIndex === -1) { playByIndex(0); return; }

    if (currentIndex === list.length - 1 && !allowWrap) {
      setPlaying(false);
      setProg(0);
      return;
    }

    playByIndex(currentIndex + 1);
  }, [cur, list, play, playByIndex, shuffle, shuffleQueue, shufflePos, queuedTrackIds]);

  const playPrevious = useCallback(() => {
    if (!list.length) return;

    const audio = audioRef.current;
    if ((audio.currentTime || prog) > 3) {
      audio.currentTime = 0;
      setProg(0);
      return;
    }

    if (shuffle && shuffleQueue.length > 0) {
      if (shufflePos <= 0) {
        audioRef.current.currentTime = 0;
        setProg(0);
        return;
      }
      const prevPos = shufflePos - 1;
      setShufflePos(prevPos);
      const song = list.find(s => s.id === shuffleQueue[prevPos]);
      if (song) play(song);
      return;
    }

    const currentIndex = cur ? list.findIndex(song => song.id === cur.id) : -1;
    playByIndex(currentIndex <= 0 ? list.length - 1 : currentIndex - 1);
  }, [cur, list, play, playByIndex, prog, shuffle, shuffleQueue, shufflePos]);

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

  const toggleShuffle = useCallback(() => {
    setShuffle(prev => {
      if (!prev) {
        if (cur) {
          const otherIds = list.filter(s => s.id !== cur.id).map(s => s.id);
          const queue = [cur.id, ...fisherYates(otherIds)];
          setShuffleQueue(queue);
          setShufflePos(0);
        }
      } else {
        setShuffleQueue([]);
        setShufflePos(0);
      }
      return !prev;
    });
  }, [cur, list]);

  const requireAuth = (action, gate) => {
    if (authUser) {
      action();
      return;
    }
    setAuthGate({ ...gate, afterAuth: action });
  };

  // Download là premium gate nhẹ: guest → auth gate, free → modal nâng cấp
  const requestDownload = (pl) => {
    if (!authUser) {
      setAuthGate({ reason: "download", playlist: pl, afterAuth: () => setPremiumOpen(true) });
      return;
    }
    setPremiumOpen(true);
  };

  const playWithAuth = (s) => {
    requireAuth(() => playExternal(s), { reason: "play", song: s });
  };

  const playFromQueueWithAuth = (s) => {
    requireAuth(() => playFromQueue(s), { reason: "play", song: s });
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
      requireAuth(() => playExternal(firstSong), { reason: "play", playlist: pl, song: firstSong });
    }
  };

  const openAlbum = (albumName) => {
    if (!albumName) return;
    setSelectedAlbum(albumName);
    nav("album", { album: albumName });
  };

  const openArtist = (artistName) => {
    if (!artistName) return;
    setSelectedArtist(artistName);
    nav("artist", { artist: artistName });
  };

  const openPlaylist = (pl) => {
    if (!pl) return;
    openLibrary({ playlistId: pl.id, libraryFilter: "Danh sách phát" });
  };

  const toggleFollowArtist = (artistName) => {
    const isFollowing = followedArtists.has(artistName);
    setFollowedArtists(prev => {
      const next = new Set(prev);
      next.has(artistName) ? next.delete(artistName) : next.add(artistName);
      return next;
    });
    if (!isFollowing) {
      pushNotification("social", `Đang theo dõi ${artistName}`, "Nghệ sĩ đã được thêm vào thư viện của bạn.");
    }
  };

  const toggleFollowArtistWithAuth = (artistName) => {
    requireAuth(() => toggleFollowArtist(artistName), { reason: "follow", entityName: artistName });
  };

  const toggleSaveAlbum = (albumName) => {
    setSavedAlbums(prev => {
      const next = new Set(prev);
      next.has(albumName) ? next.delete(albumName) : next.add(albumName);
      return next;
    });
  };

  const toggleSaveAlbumWithAuth = (albumName) => {
    requireAuth(() => toggleSaveAlbum(albumName), { reason: "saveAlbum", entityName: albumName });
  };

  const createPlaylist = () => {
    const newPl = {
      id: `local-${Date.now()}`,
      name: "Danh sách phát mới",
      type: "playlist",
      isPersonal: true,
      bg: GRADIENTS.hero,
    };
    setUserPlaylists(prev => [...prev, newPl]);
    setSelectedPlaylistId(newPl.id);
    setSidebarOpen(true);
    openLibrary({ playlistId: newPl.id, libraryFilter: "Danh sách phát" });
    pushNotification("library", "Đã tạo danh sách phát mới", "Danh sách phát mới đã có trong thư viện của bạn.");
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

  const toggleSongInPlaylist = useCallback((songId, playlistId) => {
    setUserPlaylists(prev => prev.map(pl => {
      if (pl.id !== playlistId) return pl;
      const ids = pl.songIds ?? [];
      return ids.includes(songId)
        ? { ...pl, songIds: ids.filter(id => id !== songId) }
        : { ...pl, songIds: [...ids, songId] };
    }));
  }, []);

  const createPlaylistWithSong = useCallback((songId) => {
    const newPl = {
      id: `local-${Date.now()}`,
      name: "Danh sách phát mới",
      type: "playlist",
      isPersonal: true,
      bg: GRADIENTS.hero,
      songIds: [songId],
    };
    setUserPlaylists(prev => [...prev, newPl]);
  }, []);

  const addToQueue = useCallback((song) => {
    setQueuedTrackIds(prev => [...prev, song.id]);
    clearTimeout(feedbackTimerRef.current);
    setQueueFeedback(song.title);
    feedbackTimerRef.current = setTimeout(() => setQueueFeedback(null), 2000);
  }, []);

  const removeFromQueue = useCallback((index) => {
    setQueuedTrackIds(prev => prev.filter((_, i) => i !== index));
  }, []);

  const moveQueueItem = useCallback((from, to) => {
    setQueuedTrackIds(prev => {
      if (to < 0 || to >= prev.length) return prev;
      const next = [...prev];
      const [item] = next.splice(from, 1);
      next.splice(to, 0, item);
      return next;
    });
  }, []);

  const clearQueue = useCallback(() => setQueuedTrackIds([]), []);

  const playManualQueued = useCallback((song, index) => {
    setQueuedTrackIds(prev => prev.filter((_, i) => i !== index));
    play(song);
  }, [play]);

  const visiblePlaylists = useMemo(
    () => authUser ? userPlaylists : userPlaylists.filter(pl => typeof pl.id !== "string" && !pl.isPersonal),
    [authUser, userPlaylists]
  );

  const upcomingTracks = useMemo(() => {
    if (shuffle) {
      if (shuffleQueue.length > 0) {
        const songMap = new Map(list.map(s => [s.id, s]));
        return shuffleQueue
          .slice(shufflePos + 1, shufflePos + 21)
          .map(id => songMap.get(id))
          .filter(Boolean);
      }
      return []; // shuffle on but queue not yet built — show empty
    }
    const curIdx = cur ? list.findIndex(s => s.id === cur.id) : -1;
    return curIdx >= 0 ? list.slice(curIdx + 1, curIdx + 21) : [];
  }, [shuffle, shuffleQueue, shufflePos, cur, list]);

  const recentSongs = useMemo(() => {
    const songMap = new Map(list.map(s => [s.id, s]));
    return recentIds.map(id => songMap.get(id)).filter(Boolean);
  }, [recentIds, list]);

  const queuedTracks = useMemo(() => {
    const songMap = new Map(list.map(s => [s.id, s]));
    return queuedTrackIds.map(id => songMap.get(id)).filter(Boolean);
  }, [queuedTrackIds, list]);

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

      // Repeat do người dùng chủ động bật nên vẫn ưu tiên hơn autoplay tắt
      if (repeatMode === "off" && !settings.autoplay) {
        setPlaying(false);
        setProg(0);
        return;
      }

      playNext({ allowWrap: repeatMode === "all" });
    };

    audio.addEventListener("ended", finishPlayback);
    return () => audio.removeEventListener("ended", finishPlayback);
  }, [playNext, repeatMode, settings.autoplay]);

  useEffect(() => {
    audioRef.current.volume = muted ? 0 : volume;
  }, [muted, volume]);

  useEffect(() => {
    const audio = audioRef.current;
    audio.pause();

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
      audio.pause();
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
      data-theme={settings.themeMode}
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
            background: BG.card,
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

        {/* Back / forward */}
        <div style={{ display: "flex", gap: 4, flexShrink: 0 }}>
          {[
            { icon: faChevronLeft, label: "Quay lại", action: goBack, enabled: canBack },
            { icon: faChevronRight, label: "Tiến tới", action: goForward, enabled: canForward },
          ].map(btn => (
            <button
              key={btn.label}
              type="button"
              aria-label={btn.label}
              title={`${btn.label} (Alt+${btn.label === "Quay lại" ? "←" : "→"})`}
              disabled={!btn.enabled}
              onClick={btn.action}
              style={{
                width: 32,
                height: 32,
                borderRadius: "50%",
                border: "none",
                background: "var(--overlay-1)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: btn.enabled ? "pointer" : "default",
                color: btn.enabled ? "var(--text-strong)" : "var(--text-tertiary)",
                transition: "color 0.15s, background 0.15s",
              }}
              onMouseEnter={e => { if (btn.enabled) e.currentTarget.style.background = "var(--overlay-2)"; }}
              onMouseLeave={e => { e.currentTarget.style.background = "var(--overlay-1)"; }}
            >
              <FontAwesomeIcon icon={btn.icon} style={{ fontSize: 13 }} />
            </button>
          ))}
        </div>

        {/* Home button */}
        <button
          type="button"
          aria-label="Trang chủ"
          onClick={() => { nav("home"); setSearch(""); }}
          style={{
            width: 40,
            height: 40,
            borderRadius: "50%",
            border: "none",
            background: page === "home" ? `${C[500]}20` : "var(--overlay-1)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            color: page === "home" ? C[400] : "var(--text-mid)",
            flexShrink: 0,
            transition: "all 0.15s",
          }}
        >
          <FontAwesomeIcon icon={faHouse} style={{ fontSize: 15 }} />
        </button>

        {/* Search bar */}
        <div style={{ flex: 1, maxWidth: 440, position: "relative" }}>
          <FontAwesomeIcon
            icon={faMagnifyingGlass}
            style={{
              position: "absolute",
              left: 14,
              top: "50%",
              transform: "translateY(-50%)",
              fontSize: 12,
              color: "var(--text-tertiary)",
              pointerEvents: "none",
            }}
          />
          <input
            value={search}
            onChange={e => handleSearchChange(e.target.value)}
            placeholder="Bạn muốn phát nội dung gì?"
            style={{
              width: "100%",
              background: BG.el,
              border: "none",
              borderRadius: 500,
              padding: "9px 16px 9px 40px",
              color: TEXT.primary,
              fontSize: 13,
              outline: "none",
              boxShadow: "var(--border) 0px 0px 0px 1px inset",
              transition: "box-shadow 0.15s",
            }}
            onFocus={e => { e.target.style.boxShadow = `${C[500]} 0px 0px 0px 1.5px inset`; }}
            onBlur={e => { e.target.style.boxShadow = "var(--border) 0px 0px 0px 1px inset"; }}
          />
        </div>

        {/* Right links */}
        <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 6 }}>
          {!isPremium && (
            <span
              onClick={() => setPremiumOpen(true)}
              style={{ fontSize: 13, color: "var(--text-mid)", cursor: "pointer", padding: "0 6px", fontWeight: 500, transition: "color 0.15s" }}
              onMouseEnter={e => { e.currentTarget.style.color = C[400]; }}
              onMouseLeave={e => { e.currentTarget.style.color = "var(--text-mid)"; }}
            >
              Premium
            </span>
          )}
          <span
            style={{ fontSize: 13, color: "var(--text-mid)", cursor: "pointer", padding: "0 6px", fontWeight: 500 }}
          >
            Hỗ trợ
          </span>
          <div style={{ width: 1, height: 20, background: BORDER, margin: "0 4px" }} />
          <span
            onClick={() => setSettingsOpen(true)}
            style={{ fontSize: 13, color: "var(--text-mid)", cursor: "pointer", padding: "0 6px", transition: "color 0.15s" }}
            onMouseEnter={e => { e.currentTarget.style.color = "var(--text-primary)"; }}
            onMouseLeave={e => { e.currentTarget.style.color = "var(--text-mid)"; }}
          >
            Cài đặt
          </span>
          <NavbarUserActions
            user={authUser}
            isPremium={isPremium}
            audioQuality={audioQuality}
            notifications={visibleNotifications}
            unreadCount={unreadCount}
            onMarkRead={markNotificationRead}
            onMarkAllRead={markAllNotificationsRead}
            onOpenPremium={() => setPremiumOpen(true)}
            onOpenSettings={() => setSettingsOpen(true)}
            onToggleAudioQuality={toggleAudioQuality}
            onHome={() => { nav("home"); setSearch(""); }}
            onLogout={handleLogout}
          />
          <button
            type="button"
            onClick={() => openAuth("register")}
            style={{
              display: authUser ? "none" : "inline-block",
              background: "transparent",
              border: `1.5px solid var(--text-secondary)`,
              borderRadius: 9999,
              padding: "6px 16px",
              fontSize: 13,
              color: TEXT.primary,
              cursor: "pointer",
              fontWeight: 500,
              transition: "all 0.15s",
            }}
            onMouseEnter={e => { e.target.style.borderColor = "var(--text-primary)"; e.target.style.transform = "scale(1.02)"; }}
            onMouseLeave={e => { e.target.style.borderColor = "var(--text-secondary)"; e.target.style.transform = "scale(1)"; }}
          >
            Đăng ký
          </button>
          <button
            type="button"
            onClick={() => openAuth("login")}
            style={{
              display: authUser ? "none" : "inline-block",
              background: "var(--text-primary)",
              border: "none",
              borderRadius: 9999,
              padding: "7px 18px",
              fontSize: 13,
              color: "var(--bg-base)",
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
          userPlaylists={visiblePlaylists}
          albumPlaylists={albumPlaylists}
          isAuthed={Boolean(authUser)}
          selectedPlaylistId={selectedPlaylistId}
          onSelectPlaylist={(pl) => openLibrary({
            playlistId: pl.id,
            libraryFilter: pl.type === "album" ? "Album" : "Danh sách phát",
          })}
          libraryFilter={libraryFilter}
          onSetLibraryFilter={(filter) => openLibrary({ libraryFilter: filter })}
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
          canDownload={isPremium}
          onRequestDownload={requestDownload}
        />

        {/* Main content */}
        <div style={{ flex: 1, overflowY: "auto", background: BG.base }}>
          {loading ? (
            <Loader text={`Đang tải ${
              { home: "trang chủ", search: "tìm kiếm", library: "thư viện", artist: "nghệ sĩ", album: "album" }[page] ?? page
            }...`} />
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
                  onOpenArtist={openArtist}
                />
              )}
              {page === "artist" && (
                <PageArtist
                  artistName={selectedArtist}
                  list={list}
                  cur={cur}
                  onPlay={playWithAuth}
                  likedIds={likedIds}
                  onLike={toggleLikeWithAuth}
                  onAddToQueue={addToQueue}
                  onOpenAlbum={openAlbum}
                  isFollowed={selectedArtist ? followedArtists.has(selectedArtist) : false}
                  onToggleFollow={() => toggleFollowArtistWithAuth(selectedArtist)}
                />
              )}
              {page === "album" && (
                <PageAlbum
                  albumName={selectedAlbum}
                  list={list}
                  cur={cur}
                  onPlay={playWithAuth}
                  likedIds={likedIds}
                  onLike={toggleLikeWithAuth}
                  onAddToQueue={addToQueue}
                  onOpenArtist={openArtist}
                  onOpenAlbum={openAlbum}
                  isSaved={selectedAlbum ? savedAlbums.has(selectedAlbum) : false}
                  onToggleSave={() => toggleSaveAlbumWithAuth(selectedAlbum)}
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
                  onAddToQueue={addToQueue}
                  userPlaylists={visiblePlaylists}
                  onOpenArtist={openArtist}
                  onOpenAlbum={openAlbum}
                  onOpenPlaylist={openPlaylist}
                />
              )}
              {page === "library" && (
                <PageLibrary
                  list={list}
                  cur={cur}
                  onPlay={playWithAuth}
                  likedIds={likedIds}
                  onLike={toggleLikeWithAuth}
                  onAddToQueue={addToQueue}
                  userPlaylists={visiblePlaylists}
                  albumPlaylists={albumPlaylists}
                  selectedPlaylistId={selectedPlaylistId}
                  onSelectPlaylist={(playlistId) => openLibrary({ playlistId, libraryFilter: "Danh sách phát" })}
                  libraryFilter={libraryFilter}
                  onSetLibraryFilter={(filter) => openLibrary({ libraryFilter: filter })}
                  onToggleSongInPlaylist={toggleSongInPlaylist}
                  followedArtists={followedArtists}
                  savedAlbums={savedAlbums}
                  recentIds={recentIds}
                  onOpenArtist={openArtist}
                  onOpenAlbum={openAlbum}
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
        upcomingTracks={upcomingTracks}
        queuedTracks={queuedTracks}
        onToggle={() => setPlaying(p => !p)}
        onPrevious={playPrevious}
        onNext={() => playNext()}
        onSeek={seekTo}
        onVolumeChange={changeVolume}
        onMuteToggle={() => setMuted(p => !p)}
        onShuffleToggle={toggleShuffle}
        onRepeatCycle={cycleRepeatMode}
        onPlayTrack={playFromQueueWithAuth}
        onPlayRecent={playWithAuth}
        onPlayQueuedTrack={playManualQueued}
        onRemoveFromQueue={removeFromQueue}
        onMoveQueueItem={moveQueueItem}
        onClearQueue={clearQueue}
        recentSongs={recentSongs}
        likedIds={likedIds}
        onLike={toggleLikeWithAuth}
        userPlaylists={userPlaylists}
        onToggleSongInPlaylist={toggleSongInPlaylist}
        onCreatePlaylistWithSong={createPlaylistWithSong}
      />

      {queueFeedback && (
        <div
          style={{
            position: "fixed",
            bottom: cur ? 104 : 24,
            left: "50%",
            transform: "translateX(-50%)",
            background: "rgba(28,28,28,0.96)",
            border: "1px solid rgba(255,255,255,0.1)",
            borderRadius: 6,
            padding: "9px 18px",
            fontSize: 13,
            fontWeight: 500,
            color: "#f4eee8",
            zIndex: 200,
            pointerEvents: "none",
            boxShadow: "0 4px 16px rgba(0,0,0,0.4)",
            whiteSpace: "nowrap",
          }}
        >
          Added to queue
        </div>
      )}

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

      {premiumOpen && (
        <Suspense fallback={null}>
          <PremiumModal
            onClose={() => setPremiumOpen(false)}
            user={authUser}
            isPremium={isPremium}
            onUpgrade={upgradeToPremium}
            onRequireAuth={() => setAuthGate({ reason: "premium", afterAuth: () => setPremiumOpen(true) })}
          />
        </Suspense>
      )}

      {settingsOpen && (
        <Suspense fallback={null}>
          <SettingsModal
            user={authUser}
            isPremium={isPremium}
            settings={settings}
            onUpdateSettings={updateSettings}
            onUpdateNotifyType={updateNotifyType}
            onClose={() => setSettingsOpen(false)}
            onOpenPremium={() => setPremiumOpen(true)}
            onRequestAuth={() => openAuth("login")}
          />
        </Suspense>
      )}

      {/* ── Bottom promo banner: guest → đăng ký, free → nâng cấp, premium → ẩn ── */}
      {!cur && !isPremium && (
        <div
          style={{
            background: `linear-gradient(90deg, ${C[700]}, ${C[500]}, ${G[500]})`,
            padding: "14px 24px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexShrink: 0,
          }}
        >
          <div>
            <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 2 }}>
              {authUser ? "Nâng cấp lên Melodies Premium" : "Xem trước Melodies"}
            </div>
            <div style={{ fontSize: 11, color: "rgba(255,255,255,0.75)" }}>
              {authUser
                ? "Không quảng cáo, tải xuống offline và âm thanh chất lượng cao"
                : "Đăng ký để nghe không giới hạn, không quảng cáo"}
            </div>
          </div>
          <button
            type="button"
            onClick={() => authUser ? setPremiumOpen(true) : openAuth("register")}
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
              transition: "transform 0.15s",
            }}
            onMouseEnter={e => { e.currentTarget.style.transform = "scale(1.03)"; }}
            onMouseLeave={e => { e.currentTarget.style.transform = "scale(1)"; }}
          >
            {authUser ? "Khám phá Premium" : "Đăng ký miễn phí"}
          </button>
        </div>
      )}
    </div>
  );
}
