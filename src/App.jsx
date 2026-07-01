import { useState, useEffect, useCallback, useMemo, useRef, lazy, Suspense } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useLocation, useNavigate, Navigate } from "react-router-dom";
import useDelayedVisible from "./hooks/useDelayedVisible";
import { useApplyTheme } from "./lib/theme/useTheme";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faCrown } from "@fortawesome/free-solid-svg-icons";
import playlistsSeed from "./data/playlists";
import Splash from "./components/ui/Splash";
import Player from "./components/player/Player";
import Sidebar from "./components/nav/Sidebar";
import TopNavbar from "./components/nav/TopNavbar";
import NavbarUserActions from "./components/nav/NavbarUserActions";
import AuthModal from "./components/modals/AuthModal";
import AuthGateModal from "./components/modals/AuthGateModal";
import SupportWidget from "./components/SupportWidget";
import ArtistUpgradeModal from "./components/modals/ArtistUpgradeModal";
import MaintenanceScreen from "./components/MaintenanceScreen";
import AdBanner from "./components/player/AdBanner";
import ModalSkeleton from "./components/ui/skeleton/ModalSkeleton";

// Modal ít dùng — tách chunk để giảm bundle chính
const PremiumModal = lazy(() => import("./components/modals/PremiumModal"));
const PaymentModal = lazy(() => import("./components/modals/PaymentModal"));
const SongCommunityDrawer = lazy(() => import("./components/community/SongCommunityDrawer"));
const SettingsModal = lazy(() => import("./components/modals/SettingsModal"));
import {
  loadSession, saveSession, clearSession,
  normalizeUser, applyEntitlement, saveEntitlement, isPremiumUser,
  restoreSessionFromSupabase,
  PLAN_PREMIUM,
} from "./auth/session";
import { loadSettings, saveSettings, syncSettingsFromDB, normalizeSettingsForEntitlement } from "./lib/user/settings";
import { loadNotifications, saveNotifications, createNotification } from "./lib/social/notifications";
import { syncFromSupabase } from "./lib/supabase/syncFromSupabase";
import { applyUserOverride, setUserOverride } from "./lib/user/userOverrides";
import { grantPremium, getActiveGrant } from "./lib/user/premiumGrants";
import { logAdminAction } from "./lib/user/auditLog";
import { loadAppConfig, toConfigMap } from "./lib/admin/appConfig";
import { applySongOverrides } from "./lib/music/songOverrides";
import { incrementPlay, incrementLike, decrementLike } from "./lib/music/playLog";
import { fetchSongsFromSupabase } from "./lib/supabase/songCatalog";
import { subscribeToNotifications, subscribeToSongs, subscribeToUsers } from "./lib/supabase/realtime";
import { saveLibraryToSupabase } from "./lib/supabase/librarySync";
import { fetchCuratedPlaylists } from "./lib/supabase/curatedPlaylists";
import { recordUserPlay, loadUserRecent, loadUserPlayHistory } from "./lib/supabase/userPlayHistory";
import { addFollower, removeFollower } from "./lib/social/followerIndex";
import PageHome from "./pages/PageHome";
import PageSearch from "./pages/PageSearch";
import PageLibrary from "./pages/PageLibrary";
import PageArtist from "./pages/PageArtist";
import PageAlbum from "./pages/PageAlbum";
const PageAdmin = lazy(() => import("./pages/admin/PageAdmin"));
const PageArtistStudio = lazy(() => import("./pages/artist/PageArtistStudio"));
import PageProfile from "./pages/PageProfile";
import { C, G, BG, TEXT, GRADIENTS } from "./constants/theme";

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
  const skipWindowRef = useRef({ count: 0, windowStart: 0 });
  const [screen, setScreen] = useState("splash");
  const location = useLocation();
  const navigate = useNavigate();
  // URL là nguồn sự thật cho điều hướng — page/artist/album suy ra từ pathname
  const pathname = location.pathname;

  // Scroll về đầu trang mỗi khi chuyển route
  useEffect(() => {
    document.querySelector("[aria-busy]")?.scrollTo(0, 0);
  }, [pathname]);

  let page = "home";
  let selectedArtist = null;
  let selectedAlbum = null;
  if (pathname.startsWith("/search")) page = "search";
  else if (pathname.startsWith("/library")) page = "library";
  else if (pathname.startsWith("/artist/")) { page = "artist"; selectedArtist = decodeURIComponent(pathname.slice(8)); }
  else if (pathname.startsWith("/album/")) { page = "album"; selectedAlbum = decodeURIComponent(pathname.slice(7)); }
  else if (pathname.startsWith("/profile")) page = "profile";
  const [appConfig, setAppConfig] = useState({});
  const [cur, setCur] = useState(null);
  const [playing, setPlaying] = useState(false);
  const [prog, setProg] = useState(0);
  const [actualDurationSecs, setActualDurationSecs] = useState(null);
  const [volume, setVolume] = useState(0.7);
  const [muted, setMuted] = useState(false);
  const [shuffle, setShuffle] = useState(false);
  const [shuffleQueue, setShuffleQueue] = useState([]);
  const [shufflePos, setShufflePos] = useState(0);
  const [repeatMode, setRepeatMode] = useState("off");
  const [likedIds, setLikedIds] = useState(() => new Set());
  const [catalogSongs, setCatalogSongs] = useState([]);
  const [catalogStatus, setCatalogStatus] = useState("loading");
  const catalogRequestRef = useRef(0);
  const loadCatalog = useCallback(() => {
    const requestId = catalogRequestRef.current + 1;
    catalogRequestRef.current = requestId;
    return fetchSongsFromSupabase()
      .then(songs => {
        if (catalogRequestRef.current !== requestId) return;
        setCatalogSongs(songs);
        setCatalogStatus("success");
      })
      .catch(() => {
        if (catalogRequestRef.current === requestId) setCatalogStatus("error");
      });
  }, []);
  const retryCatalog = () => {
    setCatalogStatus("loading");
    loadCatalog();
  };

  useEffect(() => {
    loadCatalog();
  }, [loadCatalog]);

  // Realtime: khi admin approve bài mới → refetch toàn catalog
  useEffect(() => {
    return subscribeToSongs(() => {
      setCatalogStatus("loading");
      loadCatalog();
    });
  }, [loadCatalog]);

  const catalogPending = catalogStatus === "loading" && catalogSongs.length === 0;
  const showCatalogSkeleton = useDelayedVisible(catalogPending);
  const holdCatalogPlaceholder = catalogPending || showCatalogSkeleton;

  // Bài bị admin gỡ biến mất — tính lại khi rời màn admin
  const list = useMemo(() => {
    void pathname; // tính lại khi điều hướng (vd rời màn admin) để áp takedown mới nhất
    return applySongOverrides(catalogSongs);
  }, [pathname, catalogSongs]);
  const [search, setSearch] = useState(""); // ô tìm kiếm giữ state cục bộ để gõ mượt
  const [authMode, setAuthMode] = useState(null);
  const [authUser, setAuthUser] = useState(() => loadSession());
  const [impersonatorAdmin, setImpersonatorAdmin] = useState(null);
  const [authGate, setAuthGate] = useState(null);
  const [premiumOpen, setPremiumOpen] = useState(false);
  const [paymentOpen, setPaymentOpen] = useState(false);
  const [communityOpen, setCommunityOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [supportOpen, setSupportOpen] = useState(false);
  const [artistUpgradeOpen, setArtistUpgradeOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [recentIds, setRecentIds] = useState([]);
  const [myPlayHistory, setMyPlayHistory] = useState([]);
  // Current user's email in a ref so play() can record per-user plays without
  // being recreated (and re-propagated as onPlay) on every auth change.
  const authEmailRef = useRef(authUser?.email);
  useEffect(() => { authEmailRef.current = authUser?.email; }, [authUser?.email]);
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

  // Every library write pushes the FULL snapshot — the debounced upsert in
  // librarySync is last-write-wins, so a partial payload would clobber the
  // fields it omitted (e.g. a like toggle wiping followed artists).
  // followedArtists không cần vào snapshot — follows table là canonical source
  const librarySnapshot = () => ({ likedIds, playlists: userPlaylists, savedAlbums });

  useEffect(() => {
    try { localStorage.setItem("melodies_playlists", JSON.stringify(userPlaylists)); }
    catch (err) { void err; }
    if (authUser?.email) saveLibraryToSupabase(authUser.email, librarySnapshot());
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userPlaylists]);

  useEffect(() => {
    if (authUser?.email) saveLibraryToSupabase(authUser.email, librarySnapshot());
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [likedIds]);

  useEffect(() => {
    try { localStorage.setItem("melodies_followed_artists", JSON.stringify([...followedArtists])); }
    catch (err) { void err; }
    if (authUser?.email) saveLibraryToSupabase(authUser.email, librarySnapshot());
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [followedArtists]);

  useEffect(() => {
    try { localStorage.setItem("melodies_saved_albums", JSON.stringify([...savedAlbums])); }
    catch (err) { void err; }
    if (authUser?.email) saveLibraryToSupabase(authUser.email, librarySnapshot());
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [savedAlbums]);

  useEffect(() => () => { clearTimeout(feedbackTimerRef.current); }, []);

  // Refresh curated (seed) playlists from Supabase; keep personal ones.
  // Falls back to the bundled static seed if the fetch fails.
  useEffect(() => {
    fetchCuratedPlaylists()
      .then((curated) => {
        if (!curated) return;
        setUserPlaylists((prev) => [...curated, ...prev.filter((pl) => pl.isPersonal)]);
      })
      .catch(() => {});
  }, []);

  // Nạp cờ cấu hình hệ thống (feature flags) từ bảng app_config.
  // Lỗi -> giữ appConfig {} (fail-safe: không chặn người dùng).
  useEffect(() => {
    loadAppConfig()
      .then((list) => setAppConfig(toConfigMap(list)))
      .catch(() => {});
  }, []);

  const done = useCallback(() => setScreen("app"), []);

  const isPremium = isPremiumUser(authUser);
  const premiumExpiresAt = authUser?.premiumExpiresAt ?? null;
  const daysUntilExpiry = premiumExpiresAt
    ? Math.ceil((new Date(premiumExpiresAt).getTime() - Date.now()) / 86400000)
    : null;
  const showExpiryWarning = isPremium && daysUntilExpiry !== null && daysUntilExpiry <= 7 && daysUntilExpiry >= 0;

  // Restore Supabase session on mount (token còn hạn → tự động đăng nhập lại)
  useEffect(() => {
    if (!authUser) {
      restoreSessionFromSupabase()
        .then(user => { if (user) setAuthUser(user); })
        .catch(() => {});
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Persist session và clear Supabase session khi logout
  useEffect(() => {
    if (authUser) saveSession(authUser);
    else {
      clearSession();
      import("./lib/supabase/supabase.js")
        .then(({ supabase }) => supabase?.auth.signOut())
        .catch(() => {});
    }
  }, [authUser]);

  // Sync from Supabase whenever user logs in — hydrate liked songs + playlists
  useEffect(() => {
    if (!authUser?.email) return;
    syncFromSupabase(authUser.email)
      .then((library) => {
        if (!library) return;
        if (Array.isArray(library.liked_ids) && library.liked_ids.length > 0) {
          // Merge: giữ lại likes user đã click trong lúc chờ sync
          setLikedIds(prev => new Set([...library.liked_ids, ...prev]));
        }
        if (Array.isArray(library.playlists) && library.playlists.length > 0) {
          setUserPlaylists(prev => {
            const seedIds = new Set(prev.filter(pl => !pl.isPersonal).map(pl => pl.id));
            const personal = library.playlists.filter(pl => !seedIds.has(pl.id));
            return [...prev.filter(pl => !pl.isPersonal), ...personal];
          });
        }
        // Merge follows/saves (union) so a fresh device picks up server state
        // without dropping anything toggled locally before sync landed.
        if (Array.isArray(library.followed_artists) && library.followed_artists.length > 0) {
          setFollowedArtists(prev => new Set([...library.followed_artists, ...prev]));
        }
        if (Array.isArray(library.saved_albums) && library.saved_albums.length > 0) {
          setSavedAlbums(prev => new Set([...library.saved_albums, ...prev]));
        }
      })
      .catch(() => {});
  }, [authUser?.email]);

  // Hydrate per-user play history → cross-device "Nghe gần đây" + real stats.
  useEffect(() => {
    if (!authUser?.email) { setMyPlayHistory([]); return; }
    loadUserPlayHistory(authUser.email).then(setMyPlayHistory).catch(() => {});
    loadUserRecent(authUser.email).then(ids => {
      if (ids.length) setRecentIds(prev => [...new Set([...prev, ...ids])].slice(0, 12));
    }).catch(() => {});
  }, [authUser?.email]);

  // Realtime: admin cấp/thu hồi Premium (hoặc đổi plan) trên hàng users của mình
  // → session listener cập nhật plan + hạn trực tiếp, không cần đăng nhập lại.
  // RLS chỉ đẩy hàng của chính user (listener) nên callback chỉ chạy cho đúng người.
  useEffect(() => {
    const myId = authUser?.id;
    const myEmail = authUser?.email;
    if (!myId) return undefined;
    return subscribeToUsers((row) => {
      if (row.id !== myId) return;
      if (row.plan === PLAN_PREMIUM) {
        // Lấy hạn thật từ grant; không có grant (self-upgrade cũ) coi như vĩnh viễn.
        getActiveGrant(myEmail)
          .then((g) => setAuthUser(prev => prev && prev.id === myId
            ? { ...prev, plan: PLAN_PREMIUM, premiumExpiresAt: g?.expiresAt ?? null } : prev))
          .catch(() => setAuthUser(prev => prev && prev.id === myId
            ? { ...prev, plan: PLAN_PREMIUM } : prev));
      } else {
        // Admin thu hồi → hạ free + xoá cache entitlement để không "hồi sinh" lần sau.
        saveEntitlement(myEmail, "free", null);
        setAuthUser(prev => prev && prev.id === myId
          ? { ...prev, plan: "free", premiumExpiresAt: null } : prev);
      }
    });
  }, [authUser?.id, authUser?.email]);

  /* ── Per-user settings + notifications (key theo email hoặc guest) ── */
  const userKey = authUser?.email?.toLowerCase() ?? "guest";
  const [settingsState, setSettingsState] = useState(() => ({ key: userKey, value: loadSettings(userKey) }));
  const [notifState, setNotifState] = useState(() => ({ key: userKey, value: loadNotifications(userKey) }));
  // High quality chỉ hợp lệ khi premium — guest/free luôn thấy normal dù stored là high
  const settings = normalizeSettingsForEntitlement(settingsState.value, isPremium);
  const notifications = notifState.value;

  // Sync settings from DB after login — cross-device preferences
  useEffect(() => {
    if (!authUser?.email) return;
    const key = authUser.email.toLowerCase();
    syncSettingsFromDB(key).then(dbSettings => {
      if (!dbSettings) return;
      setSettingsState(s => s.key === key ? { ...s, value: dbSettings } : s);
    }).catch(() => {});
  }, [authUser?.email]);

  // Realtime: push notifications from Supabase (admin broadcast, song approved, etc.)
  useEffect(() => {
    if (!authUser?.email) return;
    const key = authUser.email.toLowerCase();
    return subscribeToNotifications(key, (items) => {
      setNotifState(s => {
        if (s.key !== key) return s;
        return { ...s, value: items };
      });
    });
  }, [authUser?.email]);

  useApplyTheme(settings.themeMode);

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
    // Override của admin (role/plan/ban/xóa) đè lên seed, rồi mới tới entitlement
    const effective = applyUserOverride(user);
    if (effective.deleted || effective.status === "banned") return;
    const resolvedUser = normalizeUser(applyEntitlement(effective));
    setAuthUser(resolvedUser);
    syncFromSupabase(resolvedUser.email).catch(() => {});
    setAuthMode(null);
    const pendingAction = authGate?.afterAuth;
    setAuthGate(null);
    if (pendingAction) {
      // Giữ nguyên ngữ cảnh (search/artist/album) để hành động chờ chạy đúng chỗ
      pendingAction();
      return;
    }
    setSearch("");
    navigate("/");
  };

  const handleImpersonate = (target) => {
    logAdminAction(authUser, "impersonate", target.name, target.email);
    setImpersonatorAdmin(authUser);
    setAuthUser(normalizeUser(applyEntitlement(applyUserOverride(target))));
    setScreen("app");
    navigate("/");
  };

  const stopImpersonate = () => {
    if (!impersonatorAdmin) return;
    setAuthUser(impersonatorAdmin);
    setImpersonatorAdmin(null);
    navigate("/admin");
  };

  const handleLogout = () => {
    clearSession();
    setImpersonatorAdmin(null);
    setAuthUser(null);
    setAuthGate(null);
    setAuthMode(null);
    setPremiumOpen(false);
    setPaymentOpen(false);
    setCommunityOpen(false);
    setSettingsOpen(false);
    setSupportOpen(false);
    setCur(null);
    setPlaying(false);
    setProg(0);
    setSelectedPlaylistId(1);
    setQueuedTrackIds([]);
  };

  const upgradeToPremium = () => {
    if (!authUser) return;
    const email = authUser.email;
    // 1. Cache cục bộ để UI phản hồi tức thì (offline-first).
    saveEntitlement(email, PLAN_PREMIUM, null); // null = lifetime/no expiry
    setAuthUser(prev => prev ? { ...prev, plan: PLAN_PREMIUM, premiumExpiresAt: null } : prev);
    // 2. Persist DB (chạy nền): grant lifetime để qua được kiểm tra hết hạn ở lần đăng nhập sau,
    //    + users.plan để màn admin (đọc users.plan) thấy đúng trạng thái. RLS: user ghi được hàng của chính mình.
    grantPremium(email, email, "lifetime", "Tự nâng cấp (preview)").catch(() => {});
    setUserOverride(email, { plan: PLAN_PREMIUM }).catch(() => {});
    pushNotification(
      "premium",
      "Chào mừng đến Melodies Premium",
      "Tải xuống, âm thanh chất lượng cao và nghe không quảng cáo đã được mở khóa."
    );
  };

  const toggleAudioQuality = () => {
    updateSettings({ audioQuality: audioQuality === "high" ? "normal" : "high" });
  };

  /* ── Điều hướng: dùng history trình duyệt (Alt+← / Alt+→ là mặc định trình duyệt) ── */
  // canForward không suy ra được từ History API → luôn cho bấm (no-op nếu đã ở cuối stack)
  const canBack = (window.history.state?.idx ?? 0) > 0;
  const canForward = true;
  const goBack = useCallback(() => navigate(-1), [navigate]);
  const goForward = useCallback(() => navigate(1), [navigate]);

  // Thư mục library: bộ lọc/playlist giữ ở state cục bộ, URL chỉ là /library
  const openLibrary = (entry = {}) => {
    if (entry.libraryFilter) setLibraryFilter(entry.libraryFilter);
    if (entry.playlistId !== undefined) {
      setSelectedPlaylistId(entry.playlistId);
      if (!entry.libraryFilter) setLibraryFilter("Danh sách phát");
    }
    navigate("/library");
  };

  const handleSearchChange = (value) => {
    setSearch(value);
    if (page !== "search") navigate("/search");
  };

  const play = useCallback((s) => {
    setCur(s);
    setPlaying(true);
    setProg(0);
    incrementPlay(s.id);
    setRecentIds(prev => [s.id, ...prev.filter(id => id !== s.id)].slice(0, 12));
    if (authEmailRef.current) {
      recordUserPlay(authEmailRef.current, s.id);
      setMyPlayHistory(prev => {
        const rest = prev.filter(h => h.songId !== s.id);
        const cur = prev.find(h => h.songId === s.id);
        return [...rest, { songId: s.id, plays: (cur?.plays ?? 0) + 1 }];
      });
    }
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

  // Unified play/pause toggle for every control OUTSIDE the player bar
  // (song cards, track rows, entity headers). Same song → pause/resume in
  // place; a different song → start it. Keeps all those buttons in sync with
  // the global `playing` state instead of always restarting.
  const togglePlaySong = useCallback((song) => {
    if (!song) return;
    if (cur?.id === song.id) setPlaying(p => !p);
    else playExternal(song);
  }, [cur, playExternal]);

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

  const handleSkipNext = useCallback(() => {
    if (!isPremium) {
      const now = Date.now();
      const sw = skipWindowRef.current;
      if (now - sw.windowStart > 3600000) { // reset every hour
        sw.count = 0;
        sw.windowStart = now;
      }
      const SKIP_LIMIT = 6;
      if (sw.count >= SKIP_LIMIT) {
        setPremiumOpen(true);
        return;
      }
      sw.count += 1;
    }
    playNext();
  }, [isPremium, playNext]);

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
    const duration = actualDurationSecs || cur.durationSecs;
    const clamped = Math.min(duration, Math.max(0, seconds));
    audioRef.current.currentTime = clamped;
    setProg(clamped);
  }, [actualDurationSecs, cur]);

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

  const togglePlayWithAuth = (s) => {
    requireAuth(() => togglePlaySong(s), { reason: "play", song: s });
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
    navigate("/album/" + encodeURIComponent(albumName));
  };

  const openArtist = (artistName) => {
    if (!artistName) return;
    navigate("/artist/" + encodeURIComponent(artistName));
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
    if (isFollowing) {
      removeFollower(artistName, authUser?.email);
    } else {
      addFollower(artistName, authUser?.email);
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
      if (next.has(id)) {
        next.delete(id);
        decrementLike(id);
      } else {
        next.add(id);
        incrementLike(id);
      }
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

    const syncProgress = () => setProg(audio.currentTime || 0);
    const syncDuration = () => {
      setActualDurationSecs(Number.isFinite(audio.duration) && audio.duration > 0 ? audio.duration : null);
    };
    const stopPlayback = () => setPlaying(false);
    audio.addEventListener("timeupdate", syncProgress);
    audio.addEventListener("loadedmetadata", syncDuration);
    audio.addEventListener("durationchange", syncDuration);
    audio.addEventListener("error", stopPlayback);

    return () => {
      audio.pause();
      audio.removeEventListener("timeupdate", syncProgress);
      audio.removeEventListener("loadedmetadata", syncDuration);
      audio.removeEventListener("durationchange", syncDuration);
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
      Promise.resolve().then(() => setActualDurationSecs(null));
      return;
    }

    audio.src = cur.audioUrl;
    audio.currentTime = 0;
    Promise.resolve().then(() => setActualDurationSecs(null));
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

  if (pathname.startsWith("/admin")) {
    if (authUser?.role !== "admin") return <Navigate to="/" replace />;
    return (
      <Suspense fallback={<ModalSkeleton />}>
        <PageAdmin
          authUser={authUser}
          songs={catalogSongs}
          onExit={() => navigate("/")}
          onImpersonate={handleImpersonate}
        />
      </Suspense>
    );
  }

  if (pathname.startsWith("/artist-studio")) {
    if (authUser?.role !== "artist") return <Navigate to="/" replace />;
    return (
      <Suspense fallback={<ModalSkeleton />}>
        <PageArtistStudio authUser={authUser} onExit={() => navigate("/")} />
      </Suspense>
    );
  }

  // Chế độ bảo trì: chặn toàn bộ app, trừ admin (để còn tắt được cờ).
  // Fail-safe: nếu config chưa nạp xong thì maintenance_mode undefined -> không chặn.
  if (appConfig.maintenance_mode && authUser?.role !== "admin") return <MaintenanceScreen />;

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
      {impersonatorAdmin && (
        <div
          style={{
            height: 34,
            flexShrink: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 12,
            background: "linear-gradient(90deg, #7c2d12, #c2410c)",
            color: "#fff",
            fontSize: 12,
            fontWeight: 600,
          }}
        >
          <FontAwesomeIcon icon={faEye} style={{ fontSize: 11 }} />
          <span>
            Đang xem với tư cách {authUser?.name} ({authUser?.role})
          </span>
          <button
            onClick={stopImpersonate}
            style={{
              background: "rgba(255,255,255,0.15)",
              border: "1px solid rgba(255,255,255,0.35)",
              color: "#fff",
              borderRadius: 9999,
              padding: "3px 12px",
              fontSize: 11,
              fontWeight: 700,
              cursor: "pointer",
            }}
          >
            Quay lại Admin
          </button>
        </div>
      )}

      {showExpiryWarning && (
        <div style={{
          height: 32, flexShrink: 0, display: 'flex', alignItems: 'center',
          justifyContent: 'center', gap: 10,
          background: 'linear-gradient(90deg, #92400e, #b45309)',
          color: '#fef3c7', fontSize: 12, fontWeight: 600,
        }}>
          <FontAwesomeIcon icon={faCrown} style={{ fontSize: 10 }} />
          <span>
            Premium hết hạn {daysUntilExpiry === 0 ? 'hôm nay' : `sau ${daysUntilExpiry} ngày`} —{' '}
            <span
              style={{ textDecoration: 'underline', cursor: 'pointer' }}
              onClick={() => setPremiumOpen(true)}
            >
              Gia hạn ngay
            </span>
          </span>
        </div>
      )}

      {/* ── Top navbar ── */}
      <TopNavbar
        isHomeActive={page === "home"}
        canBack={canBack}
        canForward={canForward}
        onBack={goBack}
        onForward={goForward}
        onHome={() => { navigate("/"); setSearch(""); }}
        search={search}
        onSearchChange={handleSearchChange}
        isPremium={isPremium}
        onOpenPremium={() => setPremiumOpen(true)}
        supportOpen={supportOpen}
        onOpenSupport={() => { setSupportOpen(true); setPremiumOpen(false); setSettingsOpen(false); }}
        onOpenSettings={() => setSettingsOpen(true)}
        authUser={authUser}
        onRegister={() => openAuth("register")}
        onLogin={() => openAuth("login")}
        userActions={
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
            onOpenProfile={() => navigate("/profile")}
            onLogout={handleLogout}
          />
        }
      />

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
          isAdmin={authUser?.role === "admin"}
          onNavAdmin={() => navigate("/admin")}
          isArtist={authUser?.role === "artist"}
          onNavArtist={() => navigate("/artist-studio")}
        />

        {/* Main content */}
        <div
          style={{ flex: 1, overflowY: "auto", background: BG.base }}
          aria-busy={catalogStatus === "loading"}
        >
          {catalogStatus === "error" && catalogSongs.length === 0 && (
            <div
              role="status"
              style={{
                margin: "12px 20px 0",
                padding: "10px 14px",
                border: `1px solid ${C[500]}55`,
                borderRadius: 8,
                background: `${C[500]}12`,
                color: TEXT.secondary,
                fontSize: 12,
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 12,
              }}
            >
              <span>Không thể tải danh mục nhạc.</span>
              <button
                type="button"
                onClick={retryCatalog}
                style={{
                  border: "none",
                  background: "transparent",
                  color: C[400],
                  font: "inherit",
                  fontWeight: 700,
                  cursor: "pointer",
                }}
              >
                Thử lại
              </button>
            </div>
          )}
          <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={pathname}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
            style={{ minHeight: "100%" }}
          >
          {page === "home" && (
            <PageHome
              list={list}
              cur={cur}
              playing={playing}
              onPlay={togglePlayWithAuth}
              likedIds={likedIds}
              onLike={toggleLikeWithAuth}
              recentIds={recentIds}
              onOpenAlbum={openAlbum}
              onOpenArtist={openArtist}
              catalogLoading={holdCatalogPlaceholder}
              skeletonVisible={showCatalogSkeleton}
            />
          )}
          {page === "artist" && (
            <PageArtist
              artistName={selectedArtist}
              list={list}
              cur={cur}
              playing={playing}
              onPlay={togglePlayWithAuth}
              likedIds={likedIds}
              onLike={toggleLikeWithAuth}
              onAddToQueue={addToQueue}
              onOpenAlbum={openAlbum}
              isFollowed={selectedArtist ? followedArtists.has(selectedArtist) : false}
              onToggleFollow={() => toggleFollowArtistWithAuth(selectedArtist)}
              catalogLoading={holdCatalogPlaceholder}
              skeletonVisible={showCatalogSkeleton}
            />
          )}
          {page === "album" && (
            <PageAlbum
              albumName={selectedAlbum}
              list={list}
              cur={cur}
              playing={playing}
              onPlay={togglePlayWithAuth}
              likedIds={likedIds}
              onLike={toggleLikeWithAuth}
              onAddToQueue={addToQueue}
              onOpenArtist={openArtist}
              onOpenAlbum={openAlbum}
              isSaved={selectedAlbum ? savedAlbums.has(selectedAlbum) : false}
              onToggleSave={() => toggleSaveAlbumWithAuth(selectedAlbum)}
              catalogLoading={holdCatalogPlaceholder}
              skeletonVisible={showCatalogSkeleton}
            />
          )}
          {page === "search" && (
            <PageSearch
              list={list}
              query={search}
              cur={cur}
              playing={playing}
              onPlay={togglePlayWithAuth}
              likedIds={likedIds}
              onLike={toggleLikeWithAuth}
              onAddToQueue={addToQueue}
              userPlaylists={visiblePlaylists}
              onOpenArtist={openArtist}
              onOpenAlbum={openAlbum}
              onOpenPlaylist={openPlaylist}
              catalogLoading={holdCatalogPlaceholder}
              skeletonVisible={showCatalogSkeleton}
            />
          )}
          {page === "library" && (
            <PageLibrary
              list={list}
              cur={cur}
              playing={playing}
              onPlay={togglePlayWithAuth}
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
          {page === "profile" && (
            <PageProfile
              user={authUser}
              isPremium={isPremium}
              likedCount={likedIds.size}
              likedSongs={list.filter(s => likedIds.has(s.id))}
              playHistory={myPlayHistory}
              catalog={list}
              recentSongs={recentSongs}
              onPlay={togglePlayWithAuth}
              cur={cur}
              playing={playing}
              onOpenPremium={() => setPremiumOpen(true)}
              onOpenArtistUpgrade={() => { setArtistUpgradeOpen(true); }}
              premiumExpiresAt={authUser?.premiumExpiresAt ?? null}
              onRedeemCode={(result) => {
                setAuthUser(prev => prev ? { ...prev, plan: 'premium', premiumExpiresAt: result.expiresAt ?? null } : prev);
                if (authUser?.email) setUserOverride(authUser.email, { plan: 'premium' }).catch(() => {});
                pushNotification('premium', 'Mã khuyến mãi đã áp dụng', `Bạn đã nhận ${result.durationLabel} Premium.`);
              }}
              onProfileUpdate={(patch) => {
                setAuthUser(prev => prev ? { ...prev, ...patch } : prev);
              }}
            />
          )}
          {/* 404 — route không khớp bất kỳ page nào */}
          {!["home","search","library","artist","album","profile"].includes(page) && (
            <div style={{
              display: "flex", flexDirection: "column", alignItems: "center",
              justifyContent: "center", height: "60vh", gap: 12,
              color: "var(--text-tertiary)",
            }}>
              <div style={{ fontSize: 48, fontWeight: 800, letterSpacing: "-0.04em" }}>404</div>
              <div style={{ fontSize: 14 }}>Trang không tồn tại</div>
              <button
                type="button"
                onClick={() => navigate("/")}
                style={{
                  marginTop: 8, padding: "8px 20px", borderRadius: 9999,
                  background: "var(--overlay-1)", border: "1px solid var(--border)",
                  color: "var(--text-secondary)", fontSize: 13, fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                Về trang chủ
              </button>
            </div>
          )}
          </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {cur && !isPremium && (
        <AdBanner
          onOpenPremium={() => setPremiumOpen(true)}
        />
      )}
      {/* ── Player ── */}
      <Player
        s={cur}
        playing={playing}
        prog={prog}
        actualDurationSecs={actualDurationSecs}
        volume={volume}
        muted={muted}
        shuffle={shuffle}
        repeatMode={repeatMode}
        upcomingTracks={upcomingTracks}
        queuedTracks={queuedTracks}
        onToggle={() => setPlaying(p => !p)}
        onPrevious={playPrevious}
        onNext={handleSkipNext}
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
        isPremium={isPremium}
        onOpenPremium={() => setPremiumOpen(true)}
        onOpenCommunity={() => setCommunityOpen(true)}
      />

      <SupportWidget
        hasPlayer={Boolean(cur)}
        hasPromoBanner={!cur && !isPremium}
        open={supportOpen}
        onOpenChange={setSupportOpen}
        onAction={(action) => {
          if (action === "start_artist_signup") {
            setSupportOpen(false);
            if (!authUser) {
              setAuthMode("login");
            } else {
              setArtistUpgradeOpen(true);
            }
          }
        }}
      />

      <ArtistUpgradeModal
        open={artistUpgradeOpen}
        onClose={() => setArtistUpgradeOpen(false)}
        authUser={authUser}
        registrationOpen={appConfig.artist_registration_open !== false}
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
        <Suspense fallback={<ModalSkeleton />}>
          <PremiumModal
            onClose={() => setPremiumOpen(false)}
            user={authUser}
            isPremium={isPremium}
            onUpgrade={upgradeToPremium}
            onRequireAuth={() => setAuthGate({ reason: "premium", afterAuth: () => setPremiumOpen(true) })}
            onOpenPayment={() => { setPremiumOpen(false); setPaymentOpen(true); }}
          />
        </Suspense>
      )}

      {paymentOpen && (
        <Suspense fallback={<ModalSkeleton />}>
          <PaymentModal
            onClose={() => setPaymentOpen(false)}
            onUpgrade={upgradeToPremium}
            user={authUser}
            onBack={() => { setPaymentOpen(false); setPremiumOpen(true); }}
          />
        </Suspense>
      )}

      {communityOpen && cur && (
        <Suspense fallback={<ModalSkeleton />}>
          <SongCommunityDrawer
            song={cur}
            authUser={authUser}
            open={communityOpen}
            onClose={() => setCommunityOpen(false)}
            onRequireAuth={() => { setCommunityOpen(false); setAuthGate({ reason: "community", afterAuth: () => setCommunityOpen(true) }); }}
          />
        </Suspense>
      )}

      {settingsOpen && (
        <Suspense fallback={<ModalSkeleton />}>
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
