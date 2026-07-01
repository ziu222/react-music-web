import { useState, useEffect, useMemo } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faStar, faTrash, faComments, faMusic } from "@fortawesome/free-solid-svg-icons";
import { TEXT, C } from "../../constants/theme";
import { SearchInput, FilterPills } from "./ConsoleUi";
import { StatCard } from "./ConsoleUi";
import { fetchEngagement, deleteComment, deleteRating } from "../../lib/social/moderation";

const VIEW_PILLS = [
  { key: "comments", label: "Bình luận" },
  { key: "ratings", label: "Đánh giá" },
];

function timeAgo(iso) {
  if (!iso) return "";
  const diff = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (diff < 60) return "vừa xong";
  if (diff < 3600) return `${Math.floor(diff / 60)} phút trước`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} giờ trước`;
  return new Date(iso).toLocaleDateString("vi-VN");
}

/* ReviewManager — kiểm duyệt bình luận + đánh giá.
 * songs: danh sách bài được phép quản (admin: toàn catalog; artist: bài của mình).
 * Xoá gọi thẳng Supabase; RLS quyết định có được phép hay không. */
export default function ReviewManager({ songs = [] }) {
  const [view, setView] = useState("comments");
  const [search, setSearch] = useState("");
  const [comments, setComments] = useState([]);
  const [ratings, setRatings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(null); // id đang xoá

  const songMap = useMemo(() => {
    const m = new Map();
    songs.forEach((s) => m.set(s.id, s));
    return m;
  }, [songs]);

  const songIds = useMemo(() => songs.map((s) => s.id), [songs]);
  const idsKey = songIds.join(",");

  useEffect(() => {
    let alive = true;
    setLoading(true);
    fetchEngagement(songIds)
      .then(({ comments: c, ratings: r }) => {
        if (!alive) return;
        setComments(c);
        setRatings(r);
      })
      .finally(() => { if (alive) setLoading(false); });
    return () => { alive = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idsKey]);

  const songTitle = (id) => songMap.get(id)?.title ?? `Bài #${id}`;

  const avgRating = ratings.length
    ? (ratings.reduce((s, r) => s + r.rating, 0) / ratings.length).toFixed(1)
    : "—";

  const q = search.trim().toLowerCase();
  const filteredComments = comments.filter((c) =>
    !q || c.body?.toLowerCase().includes(q) || c.user_name?.toLowerCase().includes(q) || songTitle(c.song_id).toLowerCase().includes(q)
  );
  const filteredRatings = ratings.filter((r) =>
    !q || r.user_email?.toLowerCase().includes(q) || songTitle(r.song_id).toLowerCase().includes(q)
  );

  const handleDeleteComment = async (c) => {
    if (!window.confirm(`Xoá bình luận của ${c.user_name}?`)) return;
    setBusy(c.id);
    const { error } = await deleteComment(c.id);
    setBusy(null);
    if (error) { window.alert("Không thể xoá: " + error.message); return; }
    setComments((prev) => prev.filter((x) => x.id !== c.id));
  };

  const handleDeleteRating = async (r) => {
    if (!window.confirm(`Xoá đánh giá ${r.rating}★ của ${r.user_email}?`)) return;
    setBusy(r.id);
    const { error } = await deleteRating(r.id);
    setBusy(null);
    if (error) { window.alert("Không thể xoá: " + error.message); return; }
    setRatings((prev) => prev.filter((x) => x.id !== r.id));
  };

  return (
    <div>
      {/* Stats */}
      <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 18 }}>
        <StatCard icon={faComments} accent={C[500]} number={comments.length} label="Bình luận" />
        <StatCard icon={faStar} accent="#fbbf24" number={ratings.length} label="Lượt đánh giá" />
        <StatCard icon={faStar} accent="#34d399" number={avgRating} label="Điểm trung bình" />
      </div>

      {/* Toolbar */}
      <div style={{ display: "flex", gap: 12, alignItems: "center", marginBottom: 16, flexWrap: "wrap" }}>
        <SearchInput value={search} onChange={setSearch} placeholder="Tìm theo nội dung, người dùng, bài hát..." width={280} />
        <FilterPills options={VIEW_PILLS} active={view} onSelect={setView} />
      </div>

      {loading ? (
        <div style={{ padding: 32, textAlign: "center", color: TEXT.tertiary, fontSize: 13 }}>Đang tải…</div>
      ) : view === "comments" ? (
        filteredComments.length === 0 ? (
          <EmptyRow label="Chưa có bình luận nào" />
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {filteredComments.map((c) => (
              <div key={c.id} style={rowStyle}>
                <div style={{
                  width: 34, height: 34, borderRadius: "50%", flexShrink: 0,
                  background: c.user_color || "var(--overlay-2)", color: "#fff",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 13, fontWeight: 700,
                }}>
                  {(c.user_name?.[0] ?? "?").toUpperCase()}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                    <span style={{ fontSize: 13, fontWeight: 700, color: TEXT.strong }}>{c.user_name}</span>
                    {c.is_artist_reply && (
                      <span style={{ fontSize: 9, fontWeight: 800, color: C[400], background: `${C[500]}1f`, border: `1px solid ${C[500]}44`, borderRadius: 6, padding: "1px 6px" }}>
                        NGHỆ SĨ
                      </span>
                    )}
                    <span style={{ fontSize: 11, color: TEXT.tertiary }}>· {timeAgo(c.created_at)}</span>
                  </div>
                  <div style={{ fontSize: 13, color: TEXT.secondary, margin: "3px 0", wordBreak: "break-word" }}>{c.body}</div>
                  <div style={{ fontSize: 11, color: TEXT.tertiary, display: "flex", alignItems: "center", gap: 5 }}>
                    <FontAwesomeIcon icon={faMusic} style={{ fontSize: 9 }} />
                    {songTitle(c.song_id)}
                    {c.parent_id && <span> · trả lời</span>}
                  </div>
                </div>
                <DeleteBtn onClick={() => handleDeleteComment(c)} busy={busy === c.id} />
              </div>
            ))}
          </div>
        )
      ) : filteredRatings.length === 0 ? (
        <EmptyRow label="Chưa có đánh giá nào" />
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {filteredRatings.map((r) => (
            <div key={r.id} style={rowStyle}>
              <div style={{ display: "flex", gap: 2, flexShrink: 0, width: 84 }}>
                {[1, 2, 3, 4, 5].map((i) => (
                  <FontAwesomeIcon key={i} icon={faStar} style={{ fontSize: 12, color: i <= r.rating ? "#fbbf24" : "var(--text-tertiary)" }} />
                ))}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13, color: TEXT.strong, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{r.user_email}</div>
                <div style={{ fontSize: 11, color: TEXT.tertiary, display: "flex", alignItems: "center", gap: 5 }}>
                  <FontAwesomeIcon icon={faMusic} style={{ fontSize: 9 }} />
                  {songTitle(r.song_id)} · {timeAgo(r.created_at)}
                </div>
              </div>
              <DeleteBtn onClick={() => handleDeleteRating(r)} busy={busy === r.id} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

const rowStyle = {
  display: "flex", alignItems: "center", gap: 12,
  padding: "12px 14px", borderRadius: 10,
  background: "var(--overlay-1)", border: "1px solid var(--border)",
};

function DeleteBtn({ onClick, busy }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={busy}
      aria-label="Xoá"
      style={{
        flexShrink: 0, width: 32, height: 32, borderRadius: 8, border: "1px solid #ef444455",
        background: "#ef444414", color: "#f87171", cursor: busy ? "wait" : "pointer",
        display: "flex", alignItems: "center", justifyContent: "center",
        transition: "background 0.15s",
      }}
      onMouseEnter={(e) => { if (!busy) e.currentTarget.style.background = "#ef444426"; }}
      onMouseLeave={(e) => { e.currentTarget.style.background = "#ef444414"; }}
    >
      <FontAwesomeIcon icon={faTrash} style={{ fontSize: 12 }} />
    </button>
  );
}

function EmptyRow({ label }) {
  return (
    <div style={{ padding: 40, textAlign: "center", color: TEXT.tertiary, fontSize: 13 }}>
      {label}
    </div>
  );
}
