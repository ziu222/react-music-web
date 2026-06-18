import { useState, useEffect, useMemo } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faXmark, faEyeSlash, faRotateLeft } from "@fortawesome/free-solid-svg-icons";
import { TEXT, BORDER } from "../../constants/theme";
import { ActionChip } from "../console/ConsoleUi";
import { Sparkline, MiniBars, StatTile } from "../ui/Charts";
import { getSnapshots } from "../../lib/music/playSnapshots";
import { getPlayCounts } from "../../lib/music/playLog";
import { getSongImage } from "../../data/media";

const TABS = [
  { key: "overview", label: "Tổng quan" },
  { key: "metadata", label: "Metadata" },
  { key: "lyrics", label: "Lyrics" },
  { key: "stats", label: "Thống kê" },
];

function compactNum(n) {
  if (n >= 1e9) return (n / 1e9).toFixed(1) + "B";
  if (n >= 1e6) return (n / 1e6).toFixed(1) + "M";
  if (n >= 1e3) return (n / 1e3).toFixed(1) + "K";
  return String(n ?? 0);
}

// Parse LRC: mỗi dòng "[mm:ss.xx] lời" → { timed, label, text }
function parseLrc(text) {
  return (text || "").split("\n").map((raw) => {
    const m = raw.match(/^\s*\[(\d{1,2}):(\d{2})(?:[.:](\d{1,2}))?\]\s*(.*)$/);
    if (!m) return { raw, timed: false, text: raw };
    return { raw, timed: true, label: `${+m[1]}:${m[2]}`, text: m[4] };
  });
}

export default function SongDetailDrawer({
  song,
  allSongs = [],
  hidden,
  initialTab = "overview",
  onClose,
  onSaveMetadata,
  onSaveLyrics,
  onToggleHidden,
  onFeature,
}) {
  const [tab, setTab] = useState(initialTab);
  const [form, setForm] = useState({});
  const [lyrics, setLyrics] = useState("");
  const [lyricsMode, setLyricsMode] = useState("plain"); // "plain" | "lrc"
  const [snapshots, setSnapshots] = useState([]);

  useEffect(() => {
    if (!song) return;
    setTab(initialTab);
    setForm({
      title: song.title ?? "",
      album: song.album ?? "",
      genre: song.genre ?? "",
      language: song.language ?? "",
      explicit: song.explicit ?? false,
    });
    const lx = song.lyricsText ?? "";
    setLyrics(lx);
    setLyricsMode(/\[\d{1,2}:\d{2}/.test(lx) ? "lrc" : "plain");
    setSnapshots([]);
    getSnapshots(song.id).then(setSnapshots).catch(() => {});
  }, [song, initialTab]);

  const counts = useMemo(() => getPlayCounts(), [song]);
  const stats = useMemo(() => {
    if (!song) return null;
    const eff = (s) => counts[s.id]?.plays ?? s.plays ?? 0;
    const plays = eff(song);
    const likes = counts[song.id]?.likes ?? 0;
    const sorted = [...allSongs].sort((a, b) => eff(b) - eff(a));
    const rank = sorted.findIndex((s) => s.id === song.id) + 1;
    const sameGenre = sorted.filter((s) => s.genre === song.genre).slice(0, 5);
    return {
      plays,
      likes,
      rank,
      total: allSongs.length,
      likeRate: plays ? ((likes / plays) * 100).toFixed(1) : "0",
      genreBars: sameGenre.map((s) => ({
        label: s.title,
        value: eff(s),
        display: compactNum(eff(s)),
        highlight: s.id === song.id,
      })),
    };
  }, [song, allSongs, counts]);

  if (!song) return null;
  const cover = getSongImage(song);

  return (
    <>
      <div className="overlay-fade-in" onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 1200 }} />
      <div
        className="drawer-panel-in"
        style={{
          position: "fixed",
          top: 0,
          right: 0,
          bottom: 0,
          width: 460,
          maxWidth: "92vw",
          background: "var(--bg-card, #181818)",
          borderLeft: "1px solid " + BORDER,
          zIndex: 1201,
          display: "flex",
          flexDirection: "column",
          boxShadow: "rgba(0,0,0,0.5) -16px 0 48px",
        }}
      >
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "16px 18px", borderBottom: "1px solid " + BORDER }}>
          <div style={{ width: 48, height: 48, borderRadius: 6, background: song.bg, overflow: "hidden", flexShrink: 0 }}>
            {cover && <img src={cover} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 15, fontWeight: 700, color: TEXT.strong, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
              {song.title}
            </div>
            <div style={{ fontSize: 12, color: TEXT.secondary, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
              {song.artist}
            </div>
          </div>
          <button onClick={onClose} style={{ background: "transparent", border: "none", color: TEXT.tertiary, cursor: "pointer", fontSize: 16, padding: 6 }}>
            <FontAwesomeIcon icon={faXmark} />
          </button>
        </div>

        {/* Tabs */}
        <div style={{ display: "flex", gap: 6, padding: "10px 18px", borderBottom: "1px solid " + BORDER, flexWrap: "wrap" }}>
          {TABS.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              style={{
                background: tab === t.key ? "var(--overlay-2)" : "transparent",
                border: "1px solid " + (tab === t.key ? "transparent" : BORDER),
                color: tab === t.key ? TEXT.strong : TEXT.secondary,
                borderRadius: 9999, padding: "5px 14px", fontSize: 12, fontWeight: 500, cursor: "pointer",
              }}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Body */}
        <div style={{ flex: 1, overflowY: "auto", padding: 18 }}>
          {tab === "overview" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                <ActionChip color="#60a5fa" label={song.genre || "—"} />
                {song.featured && <ActionChip color="#fbbf24" label="★ Nổi bật" />}
                {song.explicit && <ActionChip color="#fb7185" label="Explicit" />}
                {song.community && <ActionChip color="#34d399" label="Cộng đồng" />}
                {hidden && <ActionChip color="#ef4444" label="Đã gỡ" />}
              </div>
              {[["Album", song.album], ["Thể loại", song.genre], ["Ngôn ngữ", song.language || "—"], ["Thời lượng", song.duration || "—"], ["Lượt nghe", compactNum(stats?.plays)]].map(([k, v]) => (
                <div key={k} style={{ display: "flex", justifyContent: "space-between", fontSize: 13, borderBottom: "1px solid " + BORDER, paddingBottom: 8 }}>
                  <span style={{ color: TEXT.tertiary }}>{k}</span>
                  <span style={{ color: TEXT.strong, fontWeight: 500, textAlign: "right", maxWidth: "60%", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{v}</span>
                </div>
              ))}
              <div style={{ display: "flex", gap: 8, marginTop: 4 }}>
                <button onClick={onFeature} style={btn(song.featured ? "#fbbf24" : null)}>
                  ★ {song.featured ? "Bỏ nổi bật" : "Feature"}
                </button>
                <button onClick={onToggleHidden} style={btn(hidden ? "#34d399" : "#ef4444")}>
                  <FontAwesomeIcon icon={hidden ? faRotateLeft : faEyeSlash} style={{ fontSize: 11, marginRight: 5 }} />
                  {hidden ? "Khôi phục" : "Gỡ bài"}
                </button>
              </div>
            </div>
          )}

          {tab === "metadata" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {[["Tên bài", "title"], ["Album", "album"], ["Thể loại", "genre"], ["Ngôn ngữ", "language"]].map(([label, key]) => (
                <div key={key}>
                  <label style={{ fontSize: 11, color: TEXT.tertiary, display: "block", marginBottom: 4 }}>{label}</label>
                  <input
                    value={form[key] ?? ""}
                    onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
                    style={inputStyle}
                  />
                </div>
              ))}
              <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12, color: TEXT.secondary, cursor: "pointer" }}>
                <input type="checkbox" checked={form.explicit || false} onChange={(e) => setForm((f) => ({ ...f, explicit: e.target.checked }))} />
                Nội dung nhạy cảm (Explicit)
              </label>
              <button onClick={() => onSaveMetadata?.(form)} style={primaryBtn}>Lưu metadata</button>
            </div>
          )}

          {tab === "lyrics" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <label style={{ fontSize: 11, color: TEXT.tertiary, marginRight: "auto" }}>Lời bài hát</label>
                {[["plain", "Thường"], ["lrc", "LRC · timestamp"]].map(([k, l]) => (
                  <button
                    key={k}
                    onClick={() => setLyricsMode(k)}
                    style={{
                      background: lyricsMode === k ? "var(--overlay-2)" : "transparent",
                      border: "1px solid " + (lyricsMode === k ? "transparent" : BORDER),
                      color: lyricsMode === k ? TEXT.strong : TEXT.secondary,
                      borderRadius: 9999, padding: "4px 10px", fontSize: 11, fontWeight: 500, cursor: "pointer",
                    }}
                  >
                    {l}
                  </button>
                ))}
              </div>

              {lyricsMode === "lrc" && (
                <div style={{ display: "flex", gap: 8 }}>
                  <button
                    onClick={() => setLyrics((l) => (l && !l.endsWith("\n") ? l + "\n" : l) + "[00:00.00] ")}
                    style={{ ...btn(), flex: "none", padding: "5px 12px", fontSize: 11 }}
                  >
                    + Dòng [mm:ss]
                  </button>
                  <span style={{ fontSize: 11, color: TEXT.tertiary, alignSelf: "center" }}>
                    {parseLrc(lyrics).filter((l) => l.timed).length} dòng có timestamp
                  </span>
                </div>
              )}

              <textarea
                value={lyrics}
                onChange={(e) => setLyrics(e.target.value)}
                placeholder={lyricsMode === "lrc" ? "[00:12.50] Dòng lời…" : "Nhập lời bài hát…"}
                style={{
                  ...inputStyle, minHeight: lyricsMode === "lrc" ? 200 : 300,
                  resize: "vertical", fontFamily: lyricsMode === "lrc" ? "monospace" : "inherit", lineHeight: 1.6,
                }}
              />

              {lyricsMode === "lrc" && (
                <div>
                  <div style={sectionLabel}>Xem trước</div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 2, maxHeight: 200, overflowY: "auto" }}>
                    {parseLrc(lyrics).filter((l) => l.text || l.timed).map((l, i) => (
                      <div key={i} style={{ display: "flex", gap: 10, fontSize: 13, padding: "3px 0" }}>
                        <span style={{ width: 48, flexShrink: 0, color: l.timed ? "#f97316" : "var(--text-tertiary)", fontFamily: "monospace", fontSize: 11 }}>
                          {l.timed ? l.label : "—"}
                        </span>
                        <span style={{ color: l.text ? TEXT.primary : TEXT.tertiary }}>{l.text || "(trống)"}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <button onClick={() => onSaveLyrics?.(lyrics)} style={primaryBtn}>Lưu lyrics</button>
            </div>
          )}

          {tab === "stats" && stats && (
            <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
              <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                <StatTile label="Lượt nghe" value={compactNum(stats.plays)} accent="#f97316" />
                <StatTile label="Lượt thích" value={compactNum(stats.likes)} />
                <StatTile label="Hạng catalog" value={"#" + stats.rank} sub={"trên " + stats.total + " bài"} />
                <StatTile label="Tỷ lệ thích" value={stats.likeRate + "%"} />
              </div>

              <div>
                <div style={sectionLabel}>Lượt nghe theo ngày</div>
                <Sparkline data={snapshots.map((s) => s.plays)} />
              </div>

              <div>
                <div style={sectionLabel}>So với top {song.genre || "thể loại"}</div>
                {stats.genreBars.length > 1 ? (
                  <MiniBars items={stats.genreBars} />
                ) : (
                  <div style={{ fontSize: 12, color: TEXT.tertiary }}>Không đủ bài cùng thể loại để so sánh</div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

const inputStyle = {
  width: "100%",
  background: "var(--overlay-1)",
  border: "1px solid " + BORDER,
  borderRadius: 8,
  padding: "8px 10px",
  color: TEXT.primary,
  fontSize: 13,
  outline: "none",
  boxSizing: "border-box",
};

const primaryBtn = {
  background: "#f97316",
  border: "none",
  color: "#fff",
  borderRadius: 9999,
  padding: "9px 18px",
  fontSize: 13,
  fontWeight: 700,
  cursor: "pointer",
  alignSelf: "flex-start",
};

const sectionLabel = {
  fontSize: 10,
  fontWeight: 700,
  letterSpacing: "0.06em",
  textTransform: "uppercase",
  color: "var(--text-tertiary, rgba(255,255,255,0.3))",
  marginBottom: 10,
};

function btn(accent) {
  return {
    flex: 1,
    background: "transparent",
    border: "1px solid " + (accent || "var(--border)"),
    color: accent || TEXT.secondary,
    borderRadius: 9999,
    padding: "8px 12px",
    fontSize: 12,
    fontWeight: 600,
    cursor: "pointer",
  };
}
