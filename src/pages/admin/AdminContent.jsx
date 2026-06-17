import { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEyeSlash, faRotateLeft } from "@fortawesome/free-solid-svg-icons";
import { TEXT } from "../../constants/theme";
import { supabase } from "../../lib/supabase/supabase";
import { loadSongOverrides, toggleSongHidden } from "../../lib/music/songOverrides";
import { recordDailySnapshot } from "../../lib/music/playSnapshots";
import { logAdminAction } from "../../lib/user/auditLog";
import { SearchInput, ActionChip } from "../../components/console/ConsoleUi";
import SongDetailDrawer from "../../components/modals/SongDetailDrawer";
import { getSongImage } from "../../data/media";

function bulkBtn(accent) {
  return {
    background: "transparent",
    border: "1px solid " + (accent || "var(--border)"),
    color: accent || TEXT.secondary,
    borderRadius: 9999,
    padding: "5px 12px",
    fontSize: 11,
    fontWeight: 600,
    cursor: "pointer",
  };
}

export default function AdminContent({ songs, authUser }) {
  const [hiddenIds, setHiddenIds] = useState(() => loadSongOverrides().hiddenIds);
  const [search, setSearch] = useState("");
  const [detailTarget, setDetailTarget] = useState(null);
  const [detailTab, setDetailTab] = useState("overview");
  const [localEdits, setLocalEdits] = useState({});
  const [page, setPage] = useState(0);
  const [viewMode, setViewMode] = useState("songs"); // "songs" | "albums"
  const [albumFilter, setAlbumFilter] = useState(null);
  const [selected, setSelected] = useState(() => new Set());

  // Ghi snapshot tổng lượt nghe theo ngày (1 lần/ngày) để dựng chart
  useEffect(() => { recordDailySnapshot(songs); }, [songs]);

  const merge = (s) => (localEdits[s.id] ? { ...s, ...localEdits[s.id] } : s);
  const albumOf = (s) => s.album || "(Không có album)";

  const PAGE_SIZE = 12;
  const q = search.trim().toLowerCase();
  const matchesSearch = (s) =>
    !q ||
    s.title.toLowerCase().includes(q) ||
    s.artist.toLowerCase().includes(q) ||
    (s.album || "").toLowerCase().includes(q);

  const filtered = songs.map(merge).filter(
    (s) => matchesSearch(s) && (!albumFilter || albumOf(s) === albumFilter)
  );

  // Gom theo album cho view "Album"
  const albumGroups = (() => {
    const map = new Map();
    songs.map(merge).filter(matchesSearch).forEach((s) => {
      const key = albumOf(s);
      const g = map.get(key) || { album: key, artist: s.artist, cover: getSongImage(s), bg: s.bg, count: 0, plays: 0 };
      g.count += 1;
      g.plays += s.plays || 0;
      map.set(key, g);
    });
    return [...map.values()].sort((a, b) => b.plays - a.plays);
  })();
  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, pageCount - 1);
  const paged = filtered.slice(safePage * PAGE_SIZE, safePage * PAGE_SIZE + PAGE_SIZE);

  const applyLocal = (id, patch) => setLocalEdits((m) => ({ ...m, [id]: { ...(m[id] ?? {}), ...patch } }));

  const openDetail = (song, tab = "overview") => {
    setDetailTab(tab);
    setDetailTarget(song);
  };

  const toggle = (song, hide) => {
    setHiddenIds(toggleSongHidden(song.id));
    logAdminAction(authUser, hide ? "hide_song" : "unhide_song", song.title, song.artist);
  };

  const featureSong = (song, featured) => {
    if (supabase) {
      supabase.from("songs").update({ featured }).eq("id", song.id).then().catch(() => {});
    }
    applyLocal(song.id, { featured });
    logAdminAction(authUser, featured ? "feature_song" : "unfeature_song", song.title, song.artist);
  };

  // Lưu metadata từ drawer (form camelCase → cột songs)
  const saveMetadata = (song, form) => {
    const patch = {
      title: form.title,
      album: form.album,
      genre: form.genre,
      language: form.language,
      explicit: form.explicit,
    };
    if (supabase) supabase.from("songs").update(patch).eq("id", song.id).then().catch(() => {});
    applyLocal(song.id, patch);
    logAdminAction(authUser, "edit_metadata", form.title, JSON.stringify(patch));
    setDetailTarget((t) => (t && t.id === song.id ? { ...t, ...patch } : t));
  };

  const saveLyrics = (song, text) => {
    if (supabase) supabase.from("songs").update({ lyrics_text: text }).eq("id", song.id).then().catch(() => {});
    applyLocal(song.id, { lyricsText: text });
    logAdminAction(authUser, "edit_metadata", song.title, "lyrics updated");
    setDetailTarget((t) => (t && t.id === song.id ? { ...t, lyricsText: text } : t));
  };

  // ── Bulk actions ──────────────────────────────────────────────
  const clearSel = () => setSelected(new Set());
  const toggleSel = (id) =>
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  const allSelected = filtered.length > 0 && filtered.every((s) => selected.has(s.id));
  const toggleAll = () => (allSelected ? clearSel() : setSelected(new Set(filtered.map((s) => s.id))));

  const bulkFeature = (featured) => {
    [...selected].forEach((id) => {
      if (supabase) supabase.from("songs").update({ featured }).eq("id", id).then().catch(() => {});
      applyLocal(id, { featured });
    });
    logAdminAction(authUser, featured ? "feature_song" : "unfeature_song", selected.size + " bài", "bulk");
    clearSel();
  };

  const bulkHide = (hide) => {
    let next = hiddenIds;
    [...selected].forEach((id) => {
      if (next.includes(id) !== hide) next = toggleSongHidden(id);
    });
    setHiddenIds(next);
    logAdminAction(authUser, hide ? "hide_song" : "unhide_song", selected.size + " bài", "bulk");
    clearSel();
  };

  const bulkGenre = () => {
    const g = window.prompt(`Đổi thể loại cho ${selected.size} bài thành:`);
    if (!g?.trim()) return;
    [...selected].forEach((id) => {
      if (supabase) supabase.from("songs").update({ genre: g.trim() }).eq("id", id).then().catch(() => {});
      applyLocal(id, { genre: g.trim() });
    });
    logAdminAction(authUser, "edit_metadata", selected.size + " bài", "bulk genre → " + g.trim());
    clearSel();
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
          {viewMode === "albums"
            ? `${albumGroups.length} album`
            : `${songs.length} bài hát · ${hiddenIds.length} đã gỡ`}
        </div>
        <SearchInput
          value={search}
          onChange={(v) => { setSearch(v); setPage(0); clearSel(); }}
          placeholder="Tìm theo tên, nghệ sĩ, album..."
          width={260}
        />
        <div style={{ display: "flex", gap: 6, marginLeft: "auto" }}>
          {[["songs", "Bài hát"], ["albums", "Album"]].map(([k, l]) => (
            <button
              key={k}
              onClick={() => { setViewMode(k); setAlbumFilter(null); setPage(0); clearSel(); }}
              style={{
                background: viewMode === k ? "#fff" : "transparent",
                border: "1px solid " + (viewMode === k ? "#fff" : "var(--border)"),
                color: viewMode === k ? "#0a0a08" : TEXT.secondary,
                borderRadius: 9999, padding: "5px 14px", fontSize: 12, fontWeight: 600, cursor: "pointer",
              }}
            >
              {l}
            </button>
          ))}
        </div>
      </div>

      {viewMode === "songs" && albumFilter && (
        <button
          onClick={() => { setAlbumFilter(null); setViewMode("albums"); }}
          style={{
            background: "transparent", border: "1px solid var(--border)", color: TEXT.secondary,
            borderRadius: 9999, padding: "5px 14px", fontSize: 12, cursor: "pointer", marginBottom: 12,
          }}
        >
          ← Tất cả album · <span style={{ color: TEXT.strong, fontWeight: 600 }}>{albumFilter}</span>
        </button>
      )}

      {viewMode === "albums" && (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))",
            gap: 16,
          }}
        >
          {albumGroups.map((al) => (
            <div
              key={al.album}
              onClick={() => { setAlbumFilter(al.album); setViewMode("songs"); setPage(0); clearSel(); }}
              onMouseEnter={(e) => { e.currentTarget.style.background = "var(--overlay-1)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = "var(--bg-card, #181818)"; }}
              style={{
                background: "var(--bg-card, #181818)",
                border: "1px solid var(--border)",
                borderRadius: 10,
                padding: 12,
                cursor: "pointer",
                transition: "background 0.12s",
              }}
            >
              <div style={{ width: "100%", aspectRatio: "1", borderRadius: 8, background: al.bg, overflow: "hidden", marginBottom: 10 }}>
                {al.cover && <img src={al.cover} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />}
              </div>
              <div style={{ fontSize: 13, fontWeight: 600, color: TEXT.strong, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                {al.album}
              </div>
              <div style={{ fontSize: 12, color: TEXT.secondary, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                {al.artist}
              </div>
              <div style={{ fontSize: 11, color: TEXT.tertiary, marginTop: 4 }}>
                {al.count} bài · {(al.plays / 1e6).toFixed(0)}M lượt nghe
              </div>
            </div>
          ))}
          {albumGroups.length === 0 && (
            <div style={{ padding: 24, color: TEXT.tertiary, fontSize: 13 }}>Không có album nào</div>
          )}
        </div>
      )}

      {viewMode === "songs" && selected.size > 0 && (
        <div
          style={{
            display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap",
            background: "var(--overlay-1)", border: "1px solid var(--border)",
            borderRadius: 10, padding: "10px 14px", marginBottom: 12,
          }}
        >
          <span style={{ fontSize: 12, fontWeight: 700, color: TEXT.mid }}>Đã chọn {selected.size}</span>
          <button onClick={() => bulkFeature(true)} style={bulkBtn("#fbbf24")}>★ Feature</button>
          <button onClick={() => bulkFeature(false)} style={bulkBtn()}>Bỏ feature</button>
          <button onClick={() => bulkHide(true)} style={bulkBtn("#ef4444")}>Gỡ bài</button>
          <button onClick={() => bulkHide(false)} style={bulkBtn("#34d399")}>Khôi phục</button>
          <button onClick={bulkGenre} style={bulkBtn()}>Đổi thể loại</button>
          <button onClick={clearSel} style={{ ...bulkBtn(), marginLeft: "auto" }}>Bỏ chọn</button>
        </div>
      )}

      {viewMode === "songs" && filtered.length > 0 && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            padding: "0 12px 8px",
            fontSize: 10,
            fontWeight: 700,
            letterSpacing: "0.06em",
            textTransform: "uppercase",
            color: TEXT.tertiary,
            borderBottom: "1px solid var(--border)",
            marginBottom: 4,
          }}
        >
          <div style={{ width: 22, flexShrink: 0 }}>
            <input type="checkbox" checked={allSelected} onChange={toggleAll} style={{ cursor: "pointer" }} />
          </div>
          <div style={{ width: 36, flexShrink: 0 }}>Ảnh</div>
          <div style={{ flex: 1.4, minWidth: 140 }}>Tiêu đề &amp; nghệ sĩ</div>
          <div style={{ flex: 1, minWidth: 110 }}>Album</div>
          <div style={{ width: 76, flexShrink: 0 }}>Thể loại</div>
          <div style={{ width: 56, flexShrink: 0, textAlign: "right" }}>Lượt nghe</div>
          <div style={{ width: 260, flexShrink: 0, textAlign: "right" }}>Thao tác</div>
        </div>
      )}

      {viewMode === "songs" && paged.map((song) => {
        const hidden = hiddenIds.includes(song.id);
        const cover = getSongImage(song);
        return (
          <div
            key={song.id}
            onClick={() => openDetail(song)}
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
              cursor: "pointer",
            }}
          >
            <div style={{ width: 22, flexShrink: 0 }} onClick={(e) => e.stopPropagation()}>
              <input
                type="checkbox"
                checked={selected.has(song.id)}
                onChange={() => toggleSel(song.id)}
                style={{ cursor: "pointer" }}
              />
            </div>
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
                width: 56,
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
                width: 260,
                flexShrink: 0,
                display: "flex",
                justifyContent: "flex-end",
                gap: 8,
                alignItems: "center",
              }}
            >
              <button
                onClick={(e) => { e.stopPropagation(); openDetail(song, "metadata"); }}
                style={{
                  background: "transparent", border: "1px solid var(--border)",
                  color: TEXT.tertiary, borderRadius: 9999, padding: "5px 12px",
                  fontSize: 11, fontWeight: 600, cursor: "pointer",
                }}
              >
                Sửa
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); featureSong(song, !song.featured); }}
                title={song.featured ? "Bỏ nổi bật" : "Đánh dấu nổi bật"}
                style={{
                  background: "transparent",
                  border: "1px solid " + (song.featured ? "#fbbf24" : "var(--border)"),
                  color: song.featured ? "#fbbf24" : TEXT.tertiary,
                  borderRadius: 9999, padding: "5px 12px", fontSize: 11, fontWeight: 600,
                  cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 4,
                }}
              >
                ★ {song.featured ? "Nổi bật" : "Feature"}
              </button>
              {hidden ? (
                <button
                  onClick={(e) => { e.stopPropagation(); toggle(song, false); }}
                  style={{
                    background: "transparent",
                    border: "1px solid #34d399",
                    color: "#34d399",
                    borderRadius: 9999,
                    padding: "5px 12px",
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
                  onClick={(e) => { e.stopPropagation(); toggle(song, true); }}
                  style={{
                    background: "transparent",
                    border: "1px solid #ef4444",
                    color: "#ef4444",
                    borderRadius: 9999,
                    padding: "5px 12px",
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

      {viewMode === "songs" && filtered.length === 0 && (
        <div style={{ padding: 24, textAlign: "center", color: TEXT.tertiary, fontSize: 13 }}>
          Không tìm thấy bài hát nào
        </div>
      )}

      {viewMode === "songs" && pageCount > 1 && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginTop: 16,
            paddingTop: 12,
            borderTop: "1px solid var(--border)",
            flexWrap: "wrap",
            gap: 8,
          }}
        >
          <div style={{ fontSize: 12, color: TEXT.tertiary }}>
            Hiển thị {safePage * PAGE_SIZE + 1}–{Math.min(safePage * PAGE_SIZE + PAGE_SIZE, filtered.length)} trên {filtered.length} bài hát
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <button
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              disabled={safePage === 0}
              style={{
                background: "transparent", border: "1px solid var(--border)",
                color: safePage === 0 ? TEXT.tertiary : TEXT.secondary,
                borderRadius: 9999, width: 30, height: 30, fontSize: 12,
                cursor: safePage === 0 ? "default" : "pointer", opacity: safePage === 0 ? 0.4 : 1,
              }}
            >
              ‹
            </button>
            {Array.from({ length: pageCount }).map((_, i) => (
              <button
                key={i}
                onClick={() => setPage(i)}
                style={{
                  background: i === safePage ? "#fff" : "transparent",
                  border: "1px solid " + (i === safePage ? "#fff" : "var(--border)"),
                  color: i === safePage ? "#0a0a08" : TEXT.secondary,
                  borderRadius: 9999, minWidth: 30, height: 30, padding: "0 8px",
                  fontSize: 12, fontWeight: 600, cursor: "pointer",
                }}
              >
                {i + 1}
              </button>
            ))}
            <button
              onClick={() => setPage((p) => Math.min(pageCount - 1, p + 1))}
              disabled={safePage === pageCount - 1}
              style={{
                background: "transparent", border: "1px solid var(--border)",
                color: safePage === pageCount - 1 ? TEXT.tertiary : TEXT.secondary,
                borderRadius: 9999, width: 30, height: 30, fontSize: 12,
                cursor: safePage === pageCount - 1 ? "default" : "pointer",
                opacity: safePage === pageCount - 1 ? 0.4 : 1,
              }}
            >
              ›
            </button>
          </div>
        </div>
      )}

      {detailTarget && (
        <SongDetailDrawer
          key={detailTarget.id}
          song={merge(detailTarget)}
          allSongs={songs.map(merge)}
          hidden={hiddenIds.includes(detailTarget.id)}
          initialTab={detailTab}
          onClose={() => setDetailTarget(null)}
          onSaveMetadata={(form) => saveMetadata(detailTarget, form)}
          onSaveLyrics={(text) => saveLyrics(detailTarget, text)}
          onToggleHidden={() => toggle(detailTarget, !hiddenIds.includes(detailTarget.id))}
          onFeature={() => featureSong(detailTarget, !merge(detailTarget).featured)}
        />
      )}
    </div>
  );
}
