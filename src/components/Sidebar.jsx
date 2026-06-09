import { useState, useMemo, useRef, useLayoutEffect, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBars,
  faCircleDown,
  faCircleMinus,
  faCircleXmark,
  faCode,
  faCopy,
  faFolder,
  faHeart,
  faList,
  faListUl,
  faLock,
  faMagnifyingGlass,
  faMusic,
  faPen,
  faPlay,
  faPlus,
  faShareFromSquare,
  faTableCells,
  faTableCellsLarge,
  faThumbtack,
  faUserCircle,
  faUserPlus,
} from "@fortawesome/free-solid-svg-icons";
import { C, BORDER } from "../constants/theme";
import PlaylistCover from "./PlaylistCover";

const EASE = "cubic-bezier(0.2, 0, 0, 1)";
const RAIL_W = 64;
const PANEL_W = 300;

const FILTER_TABS = [
  { key: "Danh sách phát", label: "Danh sách phát" },
  { key: "Album", label: "Album" },
  { key: "Nghệ sĩ", label: "Nghệ sĩ" },
];

const SORT_OPTIONS = [
  { key: "recent",        label: "Recents" },
  { key: "recentlyAdded", label: "Recently added" },
  { key: "name",          label: "Alphabetical" },
  { key: "creator",       label: "Creator" },
];

const VIEW_MODES = [
  { key: "compact", title: "Compact" },
  { key: "list",    title: "List" },
  { key: "grid",    title: "Grid" },
  { key: "card",    title: "Cards" },
];

const CREATE_OPTIONS = [
  { key: "playlist", icon: "♪", label: "Playlist",       desc: "Tạo playlist với bài hát", disabled: false },
  { key: "mixed",    icon: "⇄", label: "Mixed Playlist",  desc: "Kết hợp bài hát mượt mà",   badge: "Beta", disabled: true },
  { key: "blend",    icon: "♫", label: "Blend",           desc: "Kết hợp gu âm nhạc bạn bè", disabled: true },
  { key: "folder",   icon: "⊞", label: "Folder",          desc: "Sắp xếp playlist của bạn",  disabled: true },
];

const CONTEXT_MENU_W = 298;
const CONTEXT_SUBMENU_W = 244;
const CONTEXT_MENU_ITEMS = [
  { key: "queue", icon: faListUl, label: "Add to queue" },
  { key: "profile", icon: faUserCircle, label: "Add to profile" },
  { type: "divider" },
  { key: "edit", icon: faPen, label: "Edit details" },
  { key: "delete", icon: faCircleMinus, label: "Delete" },
  { key: "download", icon: faCircleDown, label: "Download", disabled: true },
  { type: "divider" },
  { key: "createPlaylist", icon: faMusic, label: "Create playlist" },
  { key: "createFolder", icon: faPlus, label: "Create folder" },
  { type: "divider" },
  { key: "private", icon: faLock, label: "Make private" },
  { key: "invite", icon: faUserPlus, label: "Invite collaborators" },
  { key: "exclude", icon: faCircleXmark, label: "Exclude from your taste profile" },
  {
    key: "move",
    icon: faFolder,
    label: "Move to folder",
    submenu: [
      { key: "findFolder", icon: faMagnifyingGlass, label: "Find a folder" },
      { key: "newFolder", icon: faPlus, label: "Create folder" },
      { key: "removeFolder", icon: faCircleMinus, label: "Remove from folders" },
    ],
  },
  {
    key: "addToPlaylist",
    icon: faPlus,
    label: "Add to other playlist",
    submenu: [
      { key: "findPlaylist", icon: faMagnifyingGlass, label: "Find a playlist" },
      { key: "newPlaylist", icon: faPlus, label: "New playlist" },
      { key: "liked", icon: faHeart, label: "Liked Songs" },
    ],
  },
  { key: "pin", icon: faThumbtack, label: "Pin playlist" },
  {
    key: "share",
    icon: faShareFromSquare,
    label: "Share",
    submenu: [
      { key: "copyLink", icon: faCopy, label: "Copy link to playlist" },
      { key: "embed", icon: faCode, label: "Embed playlist" },
    ],
  },
];

/* ── animation helpers ────────────────────────────────────────── */
function railVis(open) {
  return {
    opacity: open ? 0 : 1,
    pointerEvents: open ? "none" : "auto",
    transition: open ? "opacity 80ms ease 0ms" : "opacity 120ms ease 100ms",
  };
}
function panelVis(open) {
  return {
    opacity: open ? 1 : 0,
    pointerEvents: open ? "auto" : "none",
    transition: open ? "opacity 100ms ease 80ms" : "opacity 60ms ease 0ms",
  };
}
function slideIn(open, delay = 0) {
  return {
    opacity: open ? 1 : 0,
    transition: open
      ? `opacity 130ms ease ${100 + delay}ms`
      : "opacity 80ms ease 0ms",
    pointerEvents: open ? "auto" : "none",
  };
}

/* ── View mode icon ───────────────────────────────────────────── */
const VIEW_ICONS = {
  compact: faBars,
  list:    faList,
  grid:    faTableCells,
  card:    faTableCellsLarge,
};
function ViewIcon({ mode, size = 13 }) {
  return <FontAwesomeIcon icon={VIEW_ICONS[mode]} style={{ fontSize: size }} />;
}

function PlayCircle({ visible, onClick, size = 34 }) {
  return (
    <button
      type="button"
      aria-label="Play playlist"
      onClick={onClick}
      style={{
        position: "absolute",
        right: 6,
        bottom: 6,
        width: size,
        height: size,
        borderRadius: "50%",
        border: "none",
        background: "#1ed760",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        boxShadow: "rgba(0,0,0,0.5) 0px 8px 16px",
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0) scale(1)" : "translateY(6px) scale(0.92)",
        transition: "opacity 190ms cubic-bezier(0.2,0,0,1), transform 190ms cubic-bezier(0.2,0,0,1)",
        pointerEvents: visible ? "auto" : "none",
        cursor: "pointer",
      }}
    >
      <FontAwesomeIcon icon={faPlay} style={{ fontSize: size * 0.32, color: "#000", marginLeft: 2 }} />
    </button>
  );
}

function PlaylistContextMenu({ menu, pinned, onClose, onAction }) {
  const [submenuKey, setSubmenuKey] = useState(null);
  if (!menu) return null;

  const viewportW = window.innerWidth;
  const viewportH = window.innerHeight;
  const menuH = CONTEXT_MENU_ITEMS.reduce((sum, item) => sum + (item.type === "divider" ? 9 : 36), 16);
  const left = Math.min(menu.x, viewportW - CONTEXT_MENU_W - 8);
  const top = Math.min(menu.y, viewportH - menuH - 8);
  const safeTop = Math.max(8, top);
  const activeItem = CONTEXT_MENU_ITEMS.find(item => item.key === submenuKey);
  const submenuLeft =
    left + CONTEXT_MENU_W + CONTEXT_SUBMENU_W + 10 > viewportW
      ? left - CONTEXT_SUBMENU_W - 4
      : left + CONTEXT_MENU_W + 4;

  const menuItemStyle = {
    height: 36,
    borderRadius: 4,
    display: "flex",
    alignItems: "center",
    gap: 10,
    padding: "0 10px",
    fontSize: 12,
    color: "rgba(255,255,255,0.9)",
    cursor: "pointer",
    whiteSpace: "nowrap",
  };

  const renderItem = (item, itemIndex) => {
    if (item.type === "divider") {
      return (
        <div
          key={`divider-${itemIndex}`}
          style={{
            height: 1,
            background: "rgba(255,255,255,0.12)",
            margin: "4px -8px",
          }}
        />
      );
    }
    const label = item.key === "pin" ? (pinned ? "Unpin playlist" : "Pin playlist") : item.label;
    return (
      <div
        key={item.key}
        onMouseEnter={e => {
          if (!item.disabled) e.currentTarget.style.background = "rgba(255,255,255,0.1)";
          setSubmenuKey(!item.disabled && item.submenu ? item.key : null);
        }}
        onMouseLeave={e => { e.currentTarget.style.background = "transparent"; }}
        onClick={e => {
          e.stopPropagation();
          if (!item.disabled && !item.submenu) onAction(item.key, menu.pl);
        }}
        style={{
          ...menuItemStyle,
          color: item.disabled ? "rgba(255,255,255,0.32)" : "rgba(255,255,255,0.9)",
          cursor: item.disabled ? "default" : "pointer",
        }}
      >
        <span style={{ width: 18, textAlign: "center", color: item.disabled ? "rgba(255,255,255,0.26)" : "rgba(255,255,255,0.62)", flexShrink: 0 }}>
          <FontAwesomeIcon icon={item.icon} style={{ fontSize: 15 }} />
        </span>
        <span style={{ flex: 1, overflow: "hidden", textOverflow: "ellipsis" }}>{label}</span>
        {item.submenu && <span style={{ color: "rgba(255,255,255,0.55)" }}>›</span>}
      </div>
    );
  };

  return (
    <>
      <div style={{ position: "fixed", inset: 0, zIndex: 998 }} onClick={onClose} />
      <div
        style={{
          position: "fixed",
          left,
          top: safeTop,
          width: CONTEXT_MENU_W,
          padding: 8,
          borderRadius: 7,
          background: "#282828",
          boxShadow: "rgba(0,0,0,0.65) 0px 18px 48px",
          zIndex: 999,
          animation: "menuIn 150ms cubic-bezier(0.2,0,0,1) both",
        }}
        onClick={e => e.stopPropagation()}
      >
        {CONTEXT_MENU_ITEMS.map(renderItem)}
      </div>

      {activeItem?.submenu && (
        <div
          style={{
            position: "fixed",
            left: submenuLeft,
            top: Math.max(8, Math.min(safeTop + 36 * CONTEXT_MENU_ITEMS.findIndex(item => item.key === submenuKey), viewportH - 150)),
            width: CONTEXT_SUBMENU_W,
            padding: 8,
            borderRadius: 7,
            background: "#282828",
            boxShadow: "rgba(0,0,0,0.65) 0px 18px 48px",
            zIndex: 1000,
            animation: "menuIn 140ms cubic-bezier(0.2,0,0,1) both",
          }}
          onMouseEnter={() => setSubmenuKey(activeItem.key)}
          onClick={e => e.stopPropagation()}
        >
          {activeItem.submenu.map(item => (
            <div
              key={item.key}
              onMouseEnter={e => { e.currentTarget.style.background = "rgba(255,255,255,0.1)"; }}
              onMouseLeave={e => { e.currentTarget.style.background = "transparent"; }}
              onClick={() => onAction(item.key, menu.pl)}
              style={menuItemStyle}
            >
              <span style={{ width: 18, textAlign: "center", color: "rgba(255,255,255,0.62)", flexShrink: 0 }}>
                <FontAwesomeIcon icon={item.icon} style={{ fontSize: 14 }} />
              </span>
              <span style={{ flex: 1, overflow: "hidden", textOverflow: "ellipsis" }}>{item.label}</span>
            </div>
          ))}
        </div>
      )}
    </>
  );
}

/* ── Rail icon button ─────────────────────────────────────────── */
function RailItem({ pl, coverSongs = [], tooltip, onClick, isActive }) {
  const [hov, setHov] = useState(false);
  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        width: 48, height: 48,
        display: "flex", alignItems: "center", justifyContent: "center",
        borderRadius: 8,
        background: hov ? "rgba(255,255,255,0.08)" : "transparent",
        cursor: "pointer", flexShrink: 0, position: "relative",
        transition: "background 0.15s",
      }}
    >
      <PlaylistCover
        pl={pl}
        songs={coverSongs}
        style={{
          width: 36, height: 36, borderRadius: 5,
          boxShadow: isActive ? `0 0 0 2px ${C[400]}` : "rgba(0,0,0,0.35) 0px 4px 12px",
        }}
      />
      {hov && tooltip && (
        <div style={{
          position: "absolute", left: "calc(100% + 10px)", top: "50%",
          transform: "translateY(-50%)",
          background: "#282828", color: "#fff",
          fontSize: 11, fontWeight: 600, padding: "5px 10px",
          borderRadius: 4, whiteSpace: "nowrap",
          boxShadow: "rgba(0,0,0,0.5) 0px 8px 24px",
          zIndex: 300, pointerEvents: "none", letterSpacing: 0.1,
        }}>
          {tooltip}
        </div>
      )}
    </div>
  );
}

/* ── Playlist list views ──────────────────────────────────────── */

/* 1. Compact — text only, no thumbnail */
function CompactRow({ pl, isActive, onClick, onContextMenu }) {
  const [hov, setHov] = useState(false);
  const name = pl.type === "liked" ? "Liked Songs" : pl.name;
  return (
    <div
      onClick={onClick}
      onContextMenu={onContextMenu}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        display: "flex", alignItems: "center", gap: 5,
        padding: "6px 8px", borderRadius: 4, cursor: "pointer",
        background: isActive ? "rgba(255,255,255,0.1)" : hov ? "rgba(255,255,255,0.07)" : "transparent",
        transition: "background 0.15s",
      }}
    >
      {pl.type === "liked" && (
        <span style={{ color: "#1ed760", fontSize: 9, flexShrink: 0, lineHeight: 1 }}>♦</span>
      )}
      <span style={{
        fontSize: 13, fontWeight: 500,
        color: isActive ? C[400] : "#ede5dd",
        overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
        flex: 1,
      }}>
        {name}
      </span>
      <span style={{ fontSize: 11, color: "rgba(255,255,255,0.38)", flexShrink: 0 }}>
        · Playlist
      </span>
    </div>
  );
}

/* 2. List — 48px cover + title + subtitle */
function ListRow({ pl, coverSongs = [], isActive, onClick, onContextMenu }) {
  const [hov, setHov] = useState(false);
  const name = pl.type === "liked" ? "Liked Songs" : pl.name;
  return (
    <div
      onClick={onClick}
      onContextMenu={onContextMenu}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        display: "flex", alignItems: "center", gap: 12,
        padding: "6px 8px", borderRadius: 6, cursor: "pointer",
        background: isActive ? "rgba(255,255,255,0.1)" : hov ? "rgba(255,255,255,0.07)" : "transparent",
        transition: "background 0.15s",
      }}
    >
      <PlaylistCover pl={pl} songs={coverSongs} style={{ width: 48, height: 48, borderRadius: 6, boxShadow: "rgba(0,0,0,0.35) 0px 4px 12px" }} />
      <div style={{ minWidth: 0 }}>
        <div style={{
          fontSize: 14, fontWeight: 600,
          color: isActive ? C[400] : "#ede5dd",
          whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
          marginBottom: 3,
        }}>
          {name}
        </div>
        <div style={{ fontSize: 12, color: "rgba(255,255,255,0.5)", display: "flex", alignItems: "center", gap: 4 }}>
          {pl.type === "liked" && <span style={{ color: "#1ed760", fontSize: 9 }}>♦</span>}
          Playlist · Nghĩa
        </div>
      </div>
    </div>
  );
}

/* 3. Grid item — square image only, 3-col */
function GridItem({ pl, coverSongs = [], isActive, onClick, onPlay, onContextMenu }) {
  const [hov, setHov] = useState(false);
  return (
    <div
      onClick={onClick}
      onContextMenu={onContextMenu}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        borderRadius: 6, overflow: "hidden", position: "relative",
        aspectRatio: "1", cursor: "pointer",
        outline: isActive ? `2px solid ${C[400]}` : "none",
        outlineOffset: -2,
        opacity: hov ? 0.9 : 1,
        transition: "opacity 0.15s, outline 0.15s",
      }}
    >
      <PlaylistCover pl={pl} songs={coverSongs} style={{ width: "100%", height: "100%", borderRadius: 0 }} />
      <PlayCircle
        visible={hov}
        size={32}
        onClick={e => {
          e.stopPropagation();
          onPlay?.(pl);
        }}
      />
    </div>
  );
}

/* 4. Card — 2-col, image + title + subtitle + green play on hover */
function CardItem({ pl, coverSongs = [], isActive, onClick, onPlay, onContextMenu }) {
  const [hov, setHov] = useState(false);
  const name = pl.type === "liked" ? "Liked Songs" : pl.name;
  return (
    <div
      onClick={onClick}
      onContextMenu={onContextMenu}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        borderRadius: 8, padding: 8, cursor: "pointer",
        background: hov || isActive ? "rgba(255,255,255,0.08)" : "rgba(255,255,255,0.03)",
        transition: "background 0.15s",
      }}
    >
      <div style={{ position: "relative", marginBottom: 10 }}>
        <PlaylistCover
          pl={pl}
          songs={coverSongs}
          style={{
            width: "100%", aspectRatio: "1", borderRadius: 6,
            boxShadow: "rgba(0,0,0,0.4) 0px 8px 20px",
          }}
        />
        <PlayCircle
          visible={hov || isActive}
          onClick={e => {
            e.stopPropagation();
            onPlay?.(pl);
          }}
        />
      </div>
      <div style={{
        fontSize: 13, fontWeight: 600,
        color: isActive ? C[400] : "#ede5dd",
        overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
        marginBottom: 3,
      }}>
        {name}
      </div>
      <div style={{ fontSize: 11, color: "rgba(255,255,255,0.45)", display: "flex", alignItems: "center", gap: 4 }}>
        {pl.type === "liked" && <span style={{ color: "#1ed760", fontSize: 9 }}>♦</span>}
        Playlist · Nghĩa
      </div>
    </div>
  );
}

/* ── Main Sidebar ─────────────────────────────────────────────── */
export default function Sidebar({
  isOpen, onToggle,
  onNav,
  likedIds,
  list = [],
  userPlaylists,
  isAuthed = false,
  selectedPlaylistId, onSelectPlaylist,
  libraryFilter, onSetLibraryFilter,
  librarySearch, onSetLibrarySearch,
  librarySort, onSetLibrarySort,
  libraryViewMode, onSetLibraryViewMode,
  onCreatePlaylist,
  onPlayPlaylist,
}) {
  const [showSearch,     setShowSearch]     = useState(false);
  const [showSortMenu,   setShowSortMenu]   = useState(false);
  const [showCreateMenu, setShowCreateMenu] = useState(false);
  const [libHov,         setLibHov]         = useState(false);
  const [contextMenu,    setContextMenu]    = useState(null);
  const [pinnedIds,      setPinnedIds]      = useState(() => new Set());

  const createBtnRef = useRef(null);
  const sortBtnRef   = useRef(null);
  const [createMenuPos, setCreateMenuPos] = useState({ top: 0, right: 0 });
  const [sortMenuPos,   setSortMenuPos]   = useState({ top: 0, right: 0 });

  const filterTabRefs = useRef([]);
  const [filterPill, setFilterPill] = useState({ left: 0, width: 0, ready: false });
  useLayoutEffect(() => {
    if (!isOpen) return;
    const idx = FILTER_TABS.findIndex(t => t.key === libraryFilter);
    const el  = filterTabRefs.current[idx];
    if (el) setFilterPill({ left: el.offsetLeft, width: el.offsetWidth, ready: true });
  }, [libraryFilter, isOpen]);

  const viewModeIdx = VIEW_MODES.findIndex(m => m.key === libraryViewMode);

  const openCreateMenu = () => {
    if (!isAuthed) {
      onCreatePlaylist?.();
      return;
    }
    if (createBtnRef.current) {
      const r = createBtnRef.current.getBoundingClientRect();
      setCreateMenuPos({ top: r.bottom + 6, right: window.innerWidth - r.right });
    }
    setShowCreateMenu(s => !s);
    setShowSortMenu(false);
  };

  const openSortMenu = () => {
    if (sortBtnRef.current) {
      const r = sortBtnRef.current.getBoundingClientRect();
      setSortMenuPos({ top: r.bottom + 6, right: window.innerWidth - r.right });
    }
    setShowSortMenu(s => !s);
    setShowCreateMenu(false);
  };

  useEffect(() => {
    if (!contextMenu) return undefined;
    const onKeyDown = e => {
      if (e.key === "Escape") setContextMenu(null);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [contextMenu]);

  const dur = isOpen ? "280ms" : "220ms";

  const songMap = useMemo(() => new Map(list.map(s => [s.id, s])), [list]);
  const getCoverSongs = (pl) => {
    if (pl.type === "liked") {
      return Array.from(likedIds ?? []).slice(0, 4).map(id => songMap.get(id)).filter(Boolean);
    }
    if (!pl.songIds?.length) return [];
    return pl.songIds.slice(0, 4).map(id => songMap.get(id)).filter(Boolean);
  };

  /* ── filtered + sorted playlists ─────────────────────────────── */
  const filteredPlaylists = useMemo(() => {
    if (libraryFilter === "Album" || libraryFilter === "Nghệ sĩ") return [];
    let result = userPlaylists ?? [];
    if (librarySearch.trim()) {
      const q = librarySearch.toLowerCase();
      result = result.filter(pl => pl.name.toLowerCase().includes(q));
    }
    if (librarySort === "name" || librarySort === "creator") {
      result = [...result].sort((a, b) => a.name.localeCompare(b.name));
    }
    return result;
  }, [userPlaylists, libraryFilter, librarySearch, librarySort]);

  const railPlaylists = useMemo(() => {
    const result = userPlaylists ?? [];
    if (librarySort === "name" || librarySort === "creator") {
      return [...result].sort((a, b) => a.name.localeCompare(b.name));
    }
    return result;
  }, [userPlaylists, librarySort]);

  const currentSortLabel = SORT_OPTIONS.find(s => s.key === librarySort)?.label ?? "Recents";

  const selectAndNav = (id) => { setContextMenu(null); onSelectPlaylist(id); onNav("library"); };
  const openContextMenu = (e, pl) => {
    e.preventDefault();
    e.stopPropagation();
    setShowCreateMenu(false);
    setShowSortMenu(false);
    setContextMenu({ x: e.clientX, y: e.clientY, pl });
  };
  const runContextAction = (key, pl) => {
    if (key === "createPlaylist" || key === "newPlaylist") {
      onCreatePlaylist?.();
    }
    if (key === "pin") {
      setPinnedIds(prev => {
        const next = new Set(prev);
        next.has(pl.id) ? next.delete(pl.id) : next.add(pl.id);
        return next;
      });
    }
    setContextMenu(null);
  };

  /* ── empty state text ─────────────────────────────────────────── */
  const emptyText =
    libraryFilter === "Album"   ? "Chưa có album nào" :
    libraryFilter === "Nghệ sĩ" ? "Chưa theo dõi nghệ sĩ nào" :
    librarySearch               ? "Không tìm thấy kết quả" :
                                  "Thư viện trống";

  return (
    <div style={{
      width: isOpen ? PANEL_W : RAIL_W,
      flexShrink: 0,
      position: "relative",
      transition: `width ${dur} ${EASE}`,
      overflow: "hidden",
      borderRadius: 8, marginRight: 8,
      background: "#121212",
    }}>
      <PlaylistContextMenu
        menu={contextMenu}
        pinned={contextMenu ? pinnedIds.has(contextMenu.pl.id) : false}
        onClose={() => setContextMenu(null)}
        onAction={runContextAction}
      />

      {/* ══ RAIL ═══════════════════════════════════════════════════ */}
      <div style={{
        position: "absolute", top: 0, left: 0, bottom: 0, width: RAIL_W,
        display: "flex", flexDirection: "column", alignItems: "center",
        padding: "10px 0 16px", gap: 2, zIndex: 2,
        ...railVis(isOpen),
      }}>
        {/* Collapse icon */}
        <div
          onClick={onToggle}
          onMouseEnter={() => setLibHov(true)}
          onMouseLeave={() => setLibHov(false)}
          style={{
            width: 48, height: 48, borderRadius: 8,
            background: libHov ? "rgba(255,255,255,0.08)" : "transparent",
            display: "flex", alignItems: "center", justifyContent: "center",
            cursor: "pointer", fontSize: 17,
            color: libHov ? "#fff" : "rgba(255,255,255,0.6)",
            transition: "background 0.15s, color 0.15s",
            flexShrink: 0, position: "relative",
          }}
        >
          ☷
          {libHov && (
            <div style={{
              position: "absolute", left: "calc(100% + 10px)", top: "50%",
              transform: "translateY(-50%)",
              background: "#282828", color: "#fff",
              fontSize: 11, fontWeight: 600, padding: "5px 10px",
              borderRadius: 4, whiteSpace: "nowrap",
              boxShadow: "rgba(0,0,0,0.5) 0px 8px 24px",
              zIndex: 300, pointerEvents: "none",
            }}>
              Open Your Library
            </div>
          )}
        </div>

        {/* Create button */}
        <div
          onClick={onCreatePlaylist}
          style={{
            width: 48, height: 40, borderRadius: 8,
            display: "flex", alignItems: "center", justifyContent: "center",
            cursor: "pointer", fontSize: 22, fontWeight: 300,
            color: "rgba(255,255,255,0.5)",
            transition: "background 0.15s, color 0.15s",
          }}
          onMouseEnter={e => { e.currentTarget.style.background = "rgba(255,255,255,0.08)"; e.currentTarget.style.color = "#fff"; }}
          onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "rgba(255,255,255,0.5)"; }}
        >
          <FontAwesomeIcon icon={isAuthed ? faPlus : faLock} style={{ fontSize: isAuthed ? 16 : 13 }} />
        </div>

        {/* Playlist thumbnails */}
        {railPlaylists.map(pl => (
          <RailItem
            key={pl.id}
            pl={pl}
            coverSongs={getCoverSongs(pl)}
            tooltip={pl.type === "liked" ? "Bài hát đã thích" : pl.name}
            isActive={selectedPlaylistId === pl.id}
            onClick={() => selectAndNav(pl.id)}
          />
        ))}
      </div>

      {/* ══ PANEL ══════════════════════════════════════════════════ */}
      <div style={{
        position: "absolute", top: 0, left: 0, bottom: 0, width: PANEL_W,
        display: "flex", flexDirection: "column", zIndex: 1,
        ...panelVis(isOpen),
      }}>

        {/* Header */}
        <div style={{
          display: "flex", alignItems: "center",
          padding: "12px 8px 8px 12px", gap: 6, flexShrink: 0,
          ...slideIn(isOpen, 0),
        }}>
          {/* Library icon + label = collapse trigger */}
          <div
            onClick={onToggle}
            title="Collapse Your Library"
            style={{
              display: "flex", alignItems: "center", gap: 8,
              flex: 1, cursor: "pointer", minWidth: 0,
              borderRadius: 6, padding: "4px 6px",
              transition: "background 0.15s",
            }}
            onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.08)"}
            onMouseLeave={e => e.currentTarget.style.background = "transparent"}
          >
            <span style={{ fontSize: 18, flexShrink: 0, color: "rgba(255,255,255,0.85)" }}>☷</span>
            <span style={{ fontSize: 14, fontWeight: 600, color: "#fff", whiteSpace: "nowrap" }}>
              Thư viện
            </span>
          </div>

          {/* Create dropdown */}
          <div style={{ position: "relative", flexShrink: 0 }}>
            <div
              ref={createBtnRef}
              onClick={openCreateMenu}
              style={{
                display: "flex", alignItems: "center", gap: 4,
                background: showCreateMenu ? "rgba(255,255,255,0.15)" : "rgba(255,255,255,0.07)",
                borderRadius: 9999, padding: "5px 12px",
                cursor: "pointer", fontSize: 12,
                color: showCreateMenu ? "#fff" : "rgba(255,255,255,0.7)",
                whiteSpace: "nowrap", transition: "background 0.15s",
              }}
              onMouseEnter={e => { if (!showCreateMenu) e.currentTarget.style.background = "rgba(255,255,255,0.12)"; }}
              onMouseLeave={e => { if (!showCreateMenu) e.currentTarget.style.background = "rgba(255,255,255,0.07)"; }}
            >
              <FontAwesomeIcon icon={isAuthed ? faPlus : faLock} style={{ fontSize: 11 }} />
              {showCreateMenu ? "× Tạo" : "+ Tạo"}
            </div>

            {showCreateMenu && (
              <>
                <div
                  style={{ position: "fixed", inset: 0, zIndex: 98 }}
                  onClick={() => setShowCreateMenu(false)}
                />
                <div style={{
                  position: "fixed", top: createMenuPos.top, right: createMenuPos.right,
                  background: "#282828", borderRadius: 8, zIndex: 999,
                  padding: 8, width: 244,
                  boxShadow: "rgba(0,0,0,0.6) 0px 16px 48px",
                  transformOrigin: "top right",
                  animation: "menuIn 160ms cubic-bezier(0.2,0,0,1) both",
                }}>
                  {CREATE_OPTIONS.map(opt => (
                    <div
                      key={opt.key}
                      onClick={
                        opt.disabled ? undefined :
                        () => { if (opt.key === "playlist") { onCreatePlaylist(); setShowCreateMenu(false); } }
                      }
                      style={{
                        display: "flex", alignItems: "flex-start", gap: 12,
                        padding: "10px 12px", borderRadius: 6, cursor: opt.disabled ? "default" : "pointer",
                        opacity: opt.disabled ? 0.4 : 1,
                        transition: "background 0.12s",
                      }}
                      onMouseEnter={e => { if (!opt.disabled) e.currentTarget.style.background = "rgba(255,255,255,0.1)"; }}
                      onMouseLeave={e => { e.currentTarget.style.background = "transparent"; }}
                    >
                      <span style={{ fontSize: 18, flexShrink: 0, marginTop: 1 }}>{opt.icon}</span>
                      <div>
                        <div style={{
                          display: "flex", alignItems: "center", gap: 6,
                          fontSize: 13, fontWeight: 600, color: "#fff", marginBottom: 2,
                        }}>
                          {opt.label}
                          {opt.badge && (
                            <span style={{
                              background: "#2d4fe0", color: "#fff",
                              fontSize: 9, fontWeight: 700, padding: "1px 5px",
                              borderRadius: 3, letterSpacing: 0.5,
                            }}>
                              {opt.badge}
                            </span>
                          )}
                        </div>
                        <div style={{ fontSize: 11, color: "rgba(255,255,255,0.5)", lineHeight: 1.4 }}>
                          {opt.desc}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Filter pills */}
        <div style={{
          display: "flex", gap: 6, padding: "0 8px 8px", flexShrink: 0,
          position: "relative", zIndex: 100,
          ...slideIn(isOpen, 20),
        }}>
          {/* Sliding active pill */}
          {filterPill.ready && (
            <div style={{
              position: "absolute",
              top: 0, bottom: 8,
              left: filterPill.left,
              width: filterPill.width,
              background: "rgba(255,255,255,0.14)",
              borderRadius: 9999,
              transition: "left 180ms cubic-bezier(0.4,0,0.2,1), width 180ms cubic-bezier(0.4,0,0.2,1)",
              pointerEvents: "none",
            }} />
          )}
          {FILTER_TABS.map((t, i) => (
            <button
              key={t.key}
              ref={el => { filterTabRefs.current[i] = el; }}
              onClick={() => { onSetLibraryFilter(t.key); setShowCreateMenu(false); setShowSortMenu(false); setContextMenu(null); }}
              style={{
                background: "transparent",
                border: "none", borderRadius: 9999, padding: "4px 12px",
                fontSize: 12, fontWeight: 500,
                color: libraryFilter === t.key ? "#fff" : "rgba(255,255,255,0.6)",
                cursor: "pointer", whiteSpace: "nowrap",
                position: "relative", zIndex: 1,
                transition: "color 160ms ease",
              }}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Search + Sort row */}
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "0 14px 6px", flexShrink: 0,
          ...slideIn(isOpen, 40),
        }}>
          {/* Search icon */}
          <span
            onClick={() => setShowSearch(s => !s)}
            style={{
              fontSize: 16,
              color: showSearch || librarySearch ? "#fff" : "rgba(255,255,255,0.4)",
              cursor: "pointer", transition: "color 0.15s",
            }}
          >
            ⌕
          </span>

          {/* Sort dropdown */}
          <div style={{ position: "relative" }}>
            <div
              ref={sortBtnRef}
              onClick={openSortMenu}
              style={{
                display: "flex", alignItems: "center", gap: 4, cursor: "pointer",
                fontSize: 11, color: "rgba(255,255,255,0.55)",
                userSelect: "none", transition: "color 0.15s",
              }}
              onMouseEnter={e => e.currentTarget.style.color = "#fff"}
              onMouseLeave={e => e.currentTarget.style.color = "rgba(255,255,255,0.55)"}
            >
              {currentSortLabel}
              <span style={{ fontSize: 8 }}>▼</span>
            </div>

            {showSortMenu && (
              <>
                <div
                  style={{ position: "fixed", inset: 0, zIndex: 98 }}
                  onClick={() => setShowSortMenu(false)}
                />
                <div style={{
                  position: "fixed", top: sortMenuPos.top, right: sortMenuPos.right,
                  background: "#282828", borderRadius: 8, zIndex: 999,
                  padding: 8, width: 200,
                  boxShadow: "rgba(0,0,0,0.6) 0px 16px 48px",
                  transformOrigin: "top right",
                  animation: "menuIn 160ms cubic-bezier(0.2,0,0,1) both",
                }}>
                  {/* Sort options */}
                  <div style={{ padding: "4px 12px 8px", fontSize: 10, fontWeight: 600, color: "rgba(255,255,255,0.35)", textTransform: "uppercase", letterSpacing: 0.8 }}>
                    Sort by
                  </div>
                  {SORT_OPTIONS.map(opt => (
                    <div
                      key={opt.key}
                      onClick={() => { onSetLibrarySort(opt.key); setShowSortMenu(false); }}
                      style={{
                        display: "flex", alignItems: "center", gap: 8,
                        padding: "8px 12px", borderRadius: 4, cursor: "pointer",
                        fontSize: 13,
                        color: librarySort === opt.key ? C[400] : "rgba(255,255,255,0.8)",
                        transition: "background 0.12s",
                      }}
                      onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.1)"}
                      onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                    >
                      <span style={{ width: 14, textAlign: "center", flexShrink: 0, fontSize: 11 }}>
                        {librarySort === opt.key ? "✓" : ""}
                      </span>
                      {opt.label}
                    </div>
                  ))}

                  {/* Divider */}
                  <div style={{ height: 0.5, background: "rgba(255,255,255,0.1)", margin: "8px 12px" }} />

                  {/* View as */}
                  <div style={{ padding: "4px 12px 6px", fontSize: 10, fontWeight: 600, color: "rgba(255,255,255,0.35)", textTransform: "uppercase", letterSpacing: 0.8 }}>
                    View as
                  </div>
                  {/* Segmented control */}
                  <div style={{
                    position: "relative", display: "flex",
                    margin: "0 12px 4px",
                    background: "rgba(255,255,255,0.05)",
                    borderRadius: 8, padding: 2,
                  }}>
                    {/* Sliding active indicator */}
                    <div style={{
                      position: "absolute", top: 2, left: 2, bottom: 2,
                      width: "calc((100% - 4px) / 4)",
                      background: "rgba(255,255,255,0.14)",
                      borderRadius: 6,
                      transform: `translateX(${viewModeIdx * 100}%)`,
                      transition: "transform 200ms cubic-bezier(0.4,0,0.2,1)",
                      pointerEvents: "none",
                    }} />
                    {VIEW_MODES.map(m => (
                      <div
                        key={m.key}
                        onClick={() => { setContextMenu(null); onSetLibraryViewMode(m.key); }}
                        title={m.title}
                        style={{
                          flex: 1, height: 30, borderRadius: 6,
                          display: "flex", alignItems: "center", justifyContent: "center",
                          cursor: "pointer", position: "relative", zIndex: 1,
                          color: libraryViewMode === m.key ? C[400] : "rgba(255,255,255,0.55)",
                          transition: "color 180ms ease",
                        }}
                      >
                        <ViewIcon mode={m.key} size={13} />
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Search input */}
        <div style={{
          overflow: "hidden",
          maxHeight: showSearch ? 44 : 0,
          opacity: showSearch ? 1 : 0,
          transition: "max-height 0.2s ease, opacity 0.15s ease",
          padding: showSearch ? "0 14px 8px" : "0 14px 0",
          flexShrink: 0, pointerEvents: isOpen ? "auto" : "none",
        }}>
          <input
            value={librarySearch}
            onChange={e => { setContextMenu(null); onSetLibrarySearch(e.target.value); }}
            placeholder="Tìm trong thư viện..."
            autoFocus={showSearch}
            style={{
              width: "100%", background: "rgba(255,255,255,0.1)",
              border: "none", borderRadius: 4, padding: "6px 10px",
              color: "#fff", fontSize: 12, outline: "none", boxSizing: "border-box",
            }}
          />
        </div>

        {/* Scrollable playlist list */}
        <div
          onScroll={() => { if (contextMenu) setContextMenu(null); }}
          className={isOpen ? "sidebar-list-scroll is-open" : "sidebar-list-scroll"}
          style={{
            flex: 1,
            overflowY: isOpen ? "auto" : "hidden",
            overflowX: "hidden",
            padding: libraryViewMode === "card" ? "0 8px" : libraryViewMode === "grid" ? "0 6px" : "0 4px",
            pointerEvents: isOpen ? "auto" : "none",
          }}
        >
          {filteredPlaylists.length === 0 ? (
            <div style={{
              padding: "20px 12px", fontSize: 12, color: "rgba(255,255,255,0.3)",
              textAlign: "center", opacity: isOpen ? 1 : 0, transition: "opacity 0.15s",
            }}>
              {emptyText}
            </div>
          ) : libraryViewMode === "grid" ? (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 4, paddingBottom: 4 }}>
              {filteredPlaylists.map(pl => (
                <GridItem
                  key={pl.id} pl={pl}
                  coverSongs={getCoverSongs(pl)}
                  isActive={selectedPlaylistId === pl.id}
                  onClick={() => selectAndNav(pl.id)}
                  onPlay={onPlayPlaylist}
                  onContextMenu={e => openContextMenu(e, pl)}
                />
              ))}
            </div>
          ) : libraryViewMode === "card" ? (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, paddingBottom: 4 }}>
              {filteredPlaylists.map(pl => (
                <CardItem
                  key={pl.id} pl={pl}
                  coverSongs={getCoverSongs(pl)}
                  isActive={selectedPlaylistId === pl.id}
                  onClick={() => selectAndNav(pl.id)}
                  onPlay={onPlayPlaylist}
                  onContextMenu={e => openContextMenu(e, pl)}
                />
              ))}
            </div>
          ) : libraryViewMode === "compact" ? (
            filteredPlaylists.map(pl => (
              <CompactRow
                key={pl.id} pl={pl}
                isActive={selectedPlaylistId === pl.id}
                onClick={() => selectAndNav(pl.id)}
                onContextMenu={e => openContextMenu(e, pl)}
              />
            ))
          ) : (
            filteredPlaylists.map((pl, i) => (
              <ListRow
                key={pl.id} pl={pl}
                index={i}
                coverSongs={getCoverSongs(pl)}
                isActive={selectedPlaylistId === pl.id}
                onClick={() => selectAndNav(pl.id)}
                onContextMenu={e => openContextMenu(e, pl)}
              />
            ))
          )}

          {/* Promo card */}
          {libraryFilter === "Danh sách phát" && !librarySearch && (
            <div style={{
              background: "rgba(255,255,255,0.06)", borderRadius: 8,
              padding: 16, margin: "10px 4px 4px",
              opacity: isOpen ? 1 : 0,
              transform: isOpen ? "translateY(0) scale(1)" : "translateY(8px) scale(0.98)",
              transition: isOpen
                ? "opacity 200ms ease 280ms, transform 200ms ease 280ms"
                : "opacity 60ms ease 0ms, transform 60ms ease 0ms",
              pointerEvents: isOpen ? "auto" : "none",
            }}>
              <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 5 }}>
                Tạo danh sách phát đầu tiên
              </div>
              <div style={{ fontSize: 12, color: "rgba(255,255,255,0.5)", marginBottom: 12, lineHeight: 1.5 }}>
                Rất dễ! Chúng tôi sẽ giúp bạn
              </div>
              <button
                onClick={onCreatePlaylist}
                style={{
                  background: "#fff", border: "none", borderRadius: 9999,
                  padding: "7px 16px", fontSize: 12, color: "#141010",
                  fontWeight: 600, cursor: "pointer",
                }}
              >
                Tạo danh sách phát
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{
          padding: "10px 16px", borderTop: `0.5px solid ${BORDER}`, flexShrink: 0,
          opacity: isOpen ? 1 : 0,
          transition: isOpen ? "opacity 100ms ease 80ms" : "opacity 60ms ease 0ms",
          pointerEvents: isOpen ? "auto" : "none",
        }}>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "3px 10px", marginBottom: 8 }}>
            {["Pháp lý", "Quyền riêng tư", "Cookie", "Hỗ trợ"].map(l => (
              <span key={l} style={{ fontSize: 10, color: "rgba(255,255,255,0.3)", cursor: "pointer" }}>
                {l}
              </span>
            ))}
          </div>
          <button style={{
            background: "transparent", border: "1px solid rgba(255,255,255,0.3)",
            borderRadius: 9999, padding: "5px 12px", fontSize: 11, color: "#ede5dd",
            cursor: "pointer", display: "flex", alignItems: "center", gap: 5,
          }}>
            ⊕ Tiếng Việt
          </button>
        </div>
      </div>
    </div>
  );
}
