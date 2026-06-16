import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEyeSlash, faRotateLeft } from "@fortawesome/free-solid-svg-icons";
import { TEXT } from "../../constants/theme";
import { loadSongOverrides, toggleSongHidden } from "../../lib/music/songOverrides";
import { logAdminAction } from "../../lib/user/auditLog";
import { SearchInput, ActionChip } from "../../components/console/ConsoleUi";
import { getSongImage } from "../../data/media";

export default function AdminContent({ songs, authUser }) {
  const [hiddenIds, setHiddenIds] = useState(() => loadSongOverrides().hiddenIds);
  const [search, setSearch] = useState("");

  const q = search.trim().toLowerCase();
  const filtered = songs.filter(
    (s) =>
      !q ||
      s.title.toLowerCase().includes(q) ||
      s.artist.toLowerCase().includes(q) ||
      s.album.toLowerCase().includes(q)
  );

  const toggle = (song, hide) => {
    setHiddenIds(toggleSongHidden(song.id));
    logAdminAction(authUser, hide ? "hide_song" : "unhide_song", song.title, song.artist);
  };

  return (
    <div>
      <div
        style={{
          display: "flex",
          gap: 12,
          alignItems: "center",
          marginBottom: 16,
          flexWrap: "wrap",
        }}
      >
        <div style={{ fontSize: 13, fontWeight: 600, color: TEXT.mid }}>
          {songs.length} bài hát · {hiddenIds.length} đã gỡ
        </div>
        <SearchInput
          value={search}
          onChange={setSearch}
          placeholder="Tìm theo tên, nghệ sĩ, album..."
          width={260}
        />
      </div>

      {filtered.map((song) => {
        const hidden = hiddenIds.includes(song.id);
        const cover = getSongImage(song);
        return (
          <div
            key={song.id}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "var(--overlay-1)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "transparent";
            }}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              padding: "8px 12px",
              borderRadius: 8,
              transition: "background 0.12s",
            }}
          >
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: 6,
                background: song.bg,
                flexShrink: 0,
                opacity: hidden ? 0.45 : 1,
                overflow: "hidden",
              }}
            >
              {cover && (
                <img
                  src={cover}
                  alt=""
                  style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                />
              )}
            </div>
            <div style={{ flex: 1.4, minWidth: 140, opacity: hidden ? 0.45 : 1 }}>
              <div
                style={{
                  fontSize: 13,
                  fontWeight: 600,
                  color: TEXT.strong,
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                {song.title}
              </div>
              <div
                style={{
                  fontSize: 12,
                  color: TEXT.secondary,
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                {song.artist}
              </div>
            </div>
            <div
              style={{
                flex: 1,
                minWidth: 110,
                fontSize: 12,
                color: TEXT.tertiary,
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
                opacity: hidden ? 0.45 : 1,
              }}
            >
              {song.album}
            </div>
            <div style={{ width: 76, flexShrink: 0, opacity: hidden ? 0.45 : 1 }}>
              <ActionChip color="#60a5fa" label={song.genre} />
            </div>
            <div
              style={{
                width: 50,
                flexShrink: 0,
                fontSize: 11,
                color: TEXT.tertiary,
                textAlign: "right",
              }}
            >
              {(song.plays / 1e6).toFixed(0)}M
            </div>
            <div
              style={{
                width: 170,
                flexShrink: 0,
                display: "flex",
                justifyContent: "flex-end",
                gap: 8,
                alignItems: "center",
              }}
            >
              {hidden && <ActionChip color="#ef4444" label="Đã gỡ" />}
              {hidden ? (
                <button
                  onClick={() => toggle(song, false)}
                  style={{
                    background: "transparent",
                    border: "1px solid #34d399",
                    color: "#34d399",
                    borderRadius: 9999,
                    padding: "5px 14px",
                    fontSize: 11,
                    fontWeight: 600,
                    cursor: "pointer",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 5,
                  }}
                >
                  <FontAwesomeIcon icon={faRotateLeft} style={{ fontSize: 10 }} />
                  Khôi phục
                </button>
              ) : (
                <button
                  onClick={() => toggle(song, true)}
                  style={{
                    background: "transparent",
                    border: "1px solid #ef4444",
                    color: "#ef4444",
                    borderRadius: 9999,
                    padding: "5px 14px",
                    fontSize: 11,
                    fontWeight: 600,
                    cursor: "pointer",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 5,
                  }}
                >
                  <FontAwesomeIcon icon={faEyeSlash} style={{ fontSize: 10 }} />
                  Gỡ bài
                </button>
              )}
            </div>
          </div>
        );
      })}

      {filtered.length === 0 && (
        <div style={{ padding: 24, textAlign: "center", color: TEXT.tertiary, fontSize: 13 }}>
          Không tìm thấy bài hát nào
        </div>
      )}
    </div>
  );
}
