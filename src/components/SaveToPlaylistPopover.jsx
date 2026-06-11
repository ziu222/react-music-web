import { useEffect, useRef, useState } from "react";

export default function SaveToPlaylistPopover({
  song,
  likedIds,
  onToggleLike,
  userPlaylists,
  onToggleSongInPlaylist,
  onCreatePlaylistWithSong,
  onClose,
  align = "bottom-left",
}) {
  const [query, setQuery] = useState("");
  const inputRef = useRef(null);

  const liked = likedIds.has(song.id);
  const editablePlaylists = userPlaylists.filter(pl => typeof pl.id === "string");
  const filtered = query
    ? editablePlaylists.filter(pl => pl.name.toLowerCase().includes(query.toLowerCase()))
    : editablePlaylists;

  useEffect(() => {
    const t = setTimeout(() => inputRef.current?.focus(), 40);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    const onKey = e => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  const popoverStyle = align === "center"
    ? { top: "50%", left: "50%", transform: "translate(-50%, -50%)" }
    : { bottom: 96, left: 20 };

  return (
    <>
      <div
        aria-hidden="true"
        style={{ position: "fixed", inset: 0, zIndex: 490 }}
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Add to playlist"
        style={{
          position: "fixed",
          ...popoverStyle,
          width: 280,
          background: "#282828",
          borderRadius: 8,
          boxShadow: "0 16px 48px rgba(0,0,0,0.6)",
          zIndex: 491,
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        }}
      >
        {/* Header */}
        <div style={{
          padding: "14px 16px 10px",
          fontSize: 14, fontWeight: 700, color: "#f4eee8",
          borderBottom: "1px solid rgba(255,255,255,0.07)",
          flexShrink: 0,
        }}>
          Add to playlist
        </div>

        {/* Search */}
        <div style={{ padding: "10px 12px 6px", flexShrink: 0 }}>
          <input
            ref={inputRef}
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Find a playlist"
            style={{
              width: "100%",
              background: "rgba(255,255,255,0.08)",
              border: "1px solid rgba(255,255,255,0.12)",
              borderRadius: 4,
              padding: "7px 10px",
              color: "#f4eee8",
              fontSize: 12,
              outline: "none",
              boxSizing: "border-box",
              transition: "border-color 80ms ease",
            }}
            onFocus={e => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.4)"; }}
            onBlur={e => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.12)"; }}
          />
        </div>

        {/* Rows */}
        <div style={{ maxHeight: 252, overflowY: "auto" }}>
          {!query && (
            <PopoverRow
              label="New playlist"
              checked={false}
              isNew
              onClick={() => onCreatePlaylistWithSong(song.id)}
              ariaLabel="Create new playlist and add this song"
            />
          )}

          {!query && (
            <PopoverRow
              label="Liked Songs"
              sublabel={`${likedIds.size} song${likedIds.size !== 1 ? "s" : ""}`}
              checked={liked}
              onClick={() => onToggleLike(song.id)}
              ariaLabel={liked ? "Remove from Liked Songs" : "Add to Liked Songs"}
            />
          )}

          {filtered.map(pl => {
            const inPlaylist = pl.songIds?.includes(song.id) ?? false;
            const count = pl.songIds?.length ?? 0;
            return (
              <PopoverRow
                key={pl.id}
                label={pl.name}
                sublabel={`${count} song${count !== 1 ? "s" : ""}`}
                checked={inPlaylist}
                onClick={() => onToggleSongInPlaylist(song.id, pl.id)}
                ariaLabel={inPlaylist ? `Remove from ${pl.name}` : `Add to ${pl.name}`}
              />
            );
          })}

          {query && filtered.length === 0 && (
            <div style={{ padding: "14px 16px", fontSize: 12, color: "rgba(255,255,255,0.36)", fontStyle: "italic" }}>
              No playlists found
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{ padding: "10px 12px", borderTop: "1px solid rgba(255,255,255,0.07)", flexShrink: 0 }}>
          <button
            type="button"
            aria-label="Cancel and close popover"
            onClick={onClose}
            style={{
              width: "100%",
              background: "none",
              border: "1px solid rgba(255,255,255,0.22)",
              borderRadius: 9999,
              padding: "7px 0",
              color: "#f4eee8",
              fontSize: 12,
              fontWeight: 600,
              cursor: "pointer",
              transition: "border-color 80ms ease",
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = "#fff"; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.22)"; }}
          >
            Cancel
          </button>
        </div>
      </div>
    </>
  );
}

function PopoverRow({ label, sublabel, checked, onClick, ariaLabel, isNew }) {
  const [hov, setHov] = useState(false);
  return (
    <div
      role="button"
      tabIndex={0}
      aria-label={ariaLabel}
      onClick={onClick}
      onKeyDown={e => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onClick(); } }}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 10,
        padding: "9px 14px",
        cursor: "pointer",
        background: hov ? "rgba(255,255,255,0.08)" : "transparent",
        transition: "background 80ms ease",
        userSelect: "none",
      }}
    >
      <span style={{
        width: 18, height: 18, flexShrink: 0,
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: isNew ? 16 : 13,
        color: isNew ? "rgba(255,255,255,0.6)" : checked ? "#1ed760" : "transparent",
        fontWeight: 700,
        lineHeight: 1,
        transition: "color 80ms ease",
      }}>
        {isNew ? "＋" : "✓"}
      </span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          fontSize: 13, fontWeight: 500,
          color: checked ? "#1ed760" : "#f4eee8",
          whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
          transition: "color 80ms ease",
        }}>
          {label}
        </div>
        {sublabel && (
          <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", marginTop: 1 }}>
            {sublabel}
          </div>
        )}
      </div>
    </div>
  );
}
