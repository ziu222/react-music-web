import { useState, useMemo } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMusic, faPenToSquare, faCompactDisc, faHeadphones, faHeart } from "@fortawesome/free-solid-svg-icons";
import { TEXT, C } from "../../constants/theme";
import { getSongImage } from "../../data/media";
import { formatCompact } from "../../lib/artist/artistStats";
import { updateSongMeta, renameAlbumForArtist } from "../../lib/artist/artistSongs";

const GENRES = ["Pop", "Ballad", "R&B", "Hip-hop", "Rap", "EDM", "Indie", "Rock", "Acoustic", "Khác"];

/* StudioReleases — nghệ sĩ quản lý bài đã phát hành + album.
 * songs: bài của chính artist (đã lọc theo artist_email ở PageArtistStudio). */
export default function StudioReleases({ songs = [], artistEmail, onGoSubmit }) {
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState({ title: "", album: "", genre: "" });
  const [lyrics, setLyrics] = useState("");
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);
  // Patch cục bộ để UI phản hồi tức thì trước khi realtime refetch catalog
  const [patches, setPatches] = useState({});

  const merged = useMemo(
    () => songs.map((s) => (patches[s.id] ? { ...s, ...patches[s.id] } : s)),
    [songs, patches]
  );

  // Gom bài theo album
  const albums = useMemo(() => {
    const map = new Map();
    merged.forEach((s) => {
      const key = s.album || "(Chưa có album)";
      if (!map.has(key)) map.set(key, []);
      map.get(key).push(s);
    });
    return [...map.entries()];
  }, [merged]);

  const flash = (msg) => { setToast(msg); setTimeout(() => setToast(null), 2000); };

  const openEdit = (s) => {
    setEditId(s.id);
    setForm({ title: s.title, album: s.album || "", genre: s.genre || "" });
    setLyrics(s.lyricsText || "");
  };

  const save = async (s) => {
    if (!form.title.trim()) return;
    setSaving(true);
    const patch = {
      title: form.title.trim(),
      album: form.album.trim(),
      genre: form.genre,
      lyrics_text: lyrics,
    };
    const { error } = await updateSongMeta(s.id, patch);
    setSaving(false);
    if (error) { flash("Lỗi: " + error.message); return; }
    setPatches((p) => ({ ...p, [s.id]: { title: patch.title, album: patch.album, genre: patch.genre, lyricsText: patch.lyrics_text } }));
    setEditId(null);
    flash("Đã lưu");
  };

  const renameAlbum = async (oldName) => {
    if (oldName === "(Chưa có album)") return;
    const next = window.prompt("Đổi tên album:", oldName);
    if (!next?.trim() || next.trim() === oldName) return;
    const { error } = await renameAlbumForArtist(artistEmail, oldName, next.trim());
    if (error) { flash("Lỗi: " + error.message); return; }
    setPatches((p) => {
      const np = { ...p };
      merged.filter((s) => (s.album || "(Chưa có album)") === oldName)
        .forEach((s) => { np[s.id] = { ...np[s.id], album: next.trim() }; });
      return np;
    });
    flash("Đã đổi tên album");
  };

  if (!songs.length) {
    return (
      <div style={{ padding: "60px 24px", textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", gap: 14 }}>
        <FontAwesomeIcon icon={faCompactDisc} style={{ fontSize: 28, color: TEXT.tertiary }} />
        <div style={{ fontSize: 14, color: TEXT.secondary }}>Bạn chưa có bài hát nào được phát hành.</div>
        {onGoSubmit && (
          <button type="button" onClick={onGoSubmit} style={{
            marginTop: 4, padding: "8px 20px", borderRadius: 9999, border: "none",
            background: C[500], color: "#fff", fontSize: 13, fontWeight: 700, cursor: "pointer",
          }}>
            Đăng bài mới
          </button>
        )}
      </div>
    );
  }

  return (
    <div style={{ position: "relative" }}>
      {albums.map(([album, list]) => (
        <div key={album} style={{ marginBottom: 24 }}>
          {/* Album header */}
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
            <FontAwesomeIcon icon={faCompactDisc} style={{ fontSize: 13, color: C[400] }} />
            <span style={{ fontSize: 14, fontWeight: 700, color: TEXT.strong }}>{album}</span>
            <span style={{ fontSize: 12, color: TEXT.tertiary }}>· {list.length} bài</span>
            {album !== "(Chưa có album)" && (
              <button type="button" onClick={() => renameAlbum(album)} style={{
                marginLeft: 4, border: "none", background: "transparent", color: C[400],
                fontSize: 11, fontWeight: 700, cursor: "pointer",
              }}>
                Đổi tên
              </button>
            )}
          </div>

          {/* Songs */}
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {list.map((s) => {
              const img = getSongImage(s);
              const editing = editId === s.id;
              return (
                <div key={s.id} style={{
                  borderRadius: 10, border: "1px solid var(--border)",
                  background: "var(--overlay-1)", overflow: "hidden",
                }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 14px" }}>
                    {img
                      ? <img src={img} alt="" style={{ width: 44, height: 44, borderRadius: 6, objectFit: "cover", flexShrink: 0 }} />
                      : <div style={{ width: 44, height: 44, borderRadius: 6, background: s.bg || "var(--overlay-2)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", flexShrink: 0 }}><FontAwesomeIcon icon={faMusic} /></div>}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 14, fontWeight: 700, color: TEXT.strong, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{s.title}</div>
                      <div style={{ fontSize: 12, color: TEXT.tertiary, display: "flex", gap: 12, marginTop: 2 }}>
                        <span>{s.genre || "—"}</span>
                        <span><FontAwesomeIcon icon={faHeadphones} style={{ fontSize: 9, marginRight: 3 }} />{formatCompact(s.plays ?? 0)}</span>
                        <span><FontAwesomeIcon icon={faHeart} style={{ fontSize: 9, marginRight: 3 }} />{formatCompact(s.likes ?? 0)}</span>
                      </div>
                    </div>
                    <button type="button" onClick={() => editing ? setEditId(null) : openEdit(s)} style={{
                      flexShrink: 0, padding: "6px 12px", borderRadius: 8,
                      border: "1px solid var(--border)", background: editing ? C[500] : "var(--overlay-2)",
                      color: editing ? "#fff" : TEXT.secondary, fontSize: 12, fontWeight: 600, cursor: "pointer",
                      display: "flex", alignItems: "center", gap: 6,
                    }}>
                      <FontAwesomeIcon icon={faPenToSquare} style={{ fontSize: 11 }} />
                      {editing ? "Đóng" : "Sửa"}
                    </button>
                  </div>

                  {/* Edit form */}
                  {editing && (
                    <div style={{ padding: "0 14px 14px", display: "flex", flexDirection: "column", gap: 10, borderTop: "1px solid var(--border)", paddingTop: 14 }}>
                      <Field label="Tên bài hát">
                        <input value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} style={inputStyle} />
                      </Field>
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                        <Field label="Album">
                          <input value={form.album} onChange={(e) => setForm((f) => ({ ...f, album: e.target.value }))} placeholder="Tên album" style={inputStyle} />
                        </Field>
                        <Field label="Thể loại">
                          <select value={form.genre} onChange={(e) => setForm((f) => ({ ...f, genre: e.target.value }))} style={inputStyle}>
                            <option value="">— Chọn —</option>
                            {GENRES.map((g) => <option key={g} value={g}>{g}</option>)}
                          </select>
                        </Field>
                      </div>
                      <Field label="Lời bài hát">
                        <textarea value={lyrics} onChange={(e) => setLyrics(e.target.value)} rows={4} placeholder="Lời bài hát…" style={{ ...inputStyle, height: "auto", resize: "vertical", lineHeight: 1.5, padding: "8px 12px" }} />
                      </Field>
                      <div style={{ display: "flex", gap: 8 }}>
                        <button type="button" onClick={() => save(s)} disabled={!form.title.trim() || saving} style={{
                          height: 36, padding: "0 20px", borderRadius: 9999, border: "none",
                          background: C[500], color: "#fff", fontSize: 13, fontWeight: 700,
                          cursor: form.title.trim() && !saving ? "pointer" : "not-allowed",
                          opacity: form.title.trim() && !saving ? 1 : 0.5,
                        }}>
                          {saving ? "Đang lưu…" : "Lưu"}
                        </button>
                        <button type="button" onClick={() => setEditId(null)} style={{
                          height: 36, padding: "0 16px", borderRadius: 9999,
                          border: "1px solid var(--border)", background: "var(--overlay-2)",
                          color: TEXT.secondary, fontSize: 13, fontWeight: 600, cursor: "pointer",
                        }}>
                          Huỷ
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ))}

      {toast && (
        <div style={{
          position: "fixed", bottom: 24, left: "50%", transform: "translateX(-50%)",
          background: "rgba(28,28,28,0.96)", color: "#f4eee8", fontSize: 13, fontWeight: 600,
          padding: "9px 18px", borderRadius: 8, zIndex: 200, boxShadow: "0 4px 16px rgba(0,0,0,0.4)",
        }}>
          {toast}
        </div>
      )}
    </div>
  );
}

const inputStyle = {
  width: "100%", boxSizing: "border-box", height: 36, borderRadius: 8,
  border: "1px solid var(--border)", background: "var(--overlay-2)",
  color: "var(--text-primary)", fontSize: 13, padding: "0 12px", outline: "none", fontFamily: "inherit",
};

function Field({ label, children }) {
  return (
    <div>
      <div style={{ fontSize: 11, fontWeight: 700, color: TEXT.secondary, marginBottom: 5, textTransform: "uppercase", letterSpacing: 0.4 }}>{label}</div>
      {children}
    </div>
  );
}
