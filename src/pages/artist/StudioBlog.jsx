import { useState, useEffect, useRef } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPlus,
  faPen,
  faImage,
  faSpinner,
  faNewspaper,
  faTrash,
  faEye,
  faEyeSlash,
  faXmark,
  faCalendar,
} from "@fortawesome/free-solid-svg-icons";
import { C, BG, TEXT, BORDER } from "../../constants/theme";
import {
  getAllPosts,
  createPost,
  updatePost,
  deletePost,
  publishPost,
  unpublishPost,
  uploadPostCover,
} from "../../lib/artist/artistPosts";

/* ── spin keyframes injected once ─────────────────────────────────────── */
const SPIN_STYLE_ID = "studio-blog-spin-style";
if (typeof document !== "undefined" && !document.getElementById(SPIN_STYLE_ID)) {
  const el = document.createElement("style");
  el.id = SPIN_STYLE_ID;
  el.textContent = `
    @keyframes sb-spin { to { transform: rotate(360deg); } }
    .sb-spin { animation: sb-spin 0.8s linear infinite; display: inline-block; }
    @keyframes sb-fade-in { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: none; } }
    .sb-fade { animation: sb-fade-in 0.22s ease both; }
  `;
  document.head.appendChild(el);
}

/* ── helpers ───────────────────────────────────────────────────────────── */
function fmtDate(iso) {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString("vi-VN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

/* ── PostCard (inline, isOwner variant) ────────────────────────────────── */
function PostCard({ post, onEdit, onDelete, onTogglePublish }) {
  const [hover, setHover] = useState(false);
  const isPublished = post.published;

  return (
    <div
      className="sb-fade"
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        background: hover ? "var(--bg-menu, #282828)" : BG.card,
        border: "1px solid " + (hover ? "rgba(255,255,255,0.14)" : BORDER),
        borderRadius: 10,
        padding: "14px 16px",
        cursor: "default",
        transition: "background 0.15s, border-color 0.15s",
        position: "relative",
      }}
    >
      {/* cover strip */}
      {post.coverUrl && (
        <div
          style={{
            borderRadius: 7,
            overflow: "hidden",
            marginBottom: 10,
            height: 110,
          }}
        >
          <img
            src={post.coverUrl}
            alt=""
            style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
          />
        </div>
      )}

      {/* status pill */}
      <div
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 5,
          borderRadius: 9999,
          padding: "2px 9px",
          fontSize: 10,
          fontWeight: 700,
          letterSpacing: "0.05em",
          textTransform: "uppercase",
          marginBottom: 8,
          background: isPublished ? "rgba(52,211,153,0.12)" : "rgba(251,191,36,0.12)",
          color: isPublished ? "#34d399" : "#fbbf24",
          border: `1px solid ${isPublished ? "rgba(52,211,153,0.28)" : "rgba(251,191,36,0.28)"}`,
        }}
      >
        <FontAwesomeIcon icon={isPublished ? faEye : faEyeSlash} style={{ fontSize: 9 }} />
        {isPublished ? "Đã đăng" : "Nháp"}
      </div>

      {/* title */}
      <div
        style={{
          fontSize: 14,
          fontWeight: 700,
          color: TEXT.strong,
          lineHeight: 1.4,
          marginBottom: 6,
          display: "-webkit-box",
          WebkitLineClamp: 2,
          WebkitBoxOrient: "vertical",
          overflow: "hidden",
        }}
      >
        {post.title || <span style={{ color: TEXT.tertiary, fontStyle: "italic" }}>Chưa có tiêu đề</span>}
      </div>

      {/* body preview */}
      <div
        style={{
          fontSize: 12,
          color: TEXT.secondary,
          lineHeight: 1.6,
          display: "-webkit-box",
          WebkitLineClamp: 2,
          WebkitBoxOrient: "vertical",
          overflow: "hidden",
          marginBottom: 10,
        }}
      >
        {post.body || <span style={{ color: TEXT.tertiary }}>Chưa có nội dung</span>}
      </div>

      {/* date + actions */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 11, color: TEXT.tertiary }}>
          <FontAwesomeIcon icon={faCalendar} style={{ fontSize: 10 }} />
          {fmtDate(post.updatedAt || post.createdAt)}
        </div>
        <div style={{ display: "flex", gap: 6 }}>
          <ActionBtn
            icon={faPen}
            title="Chỉnh sửa"
            color={C[400]}
            onClick={() => onEdit(post)}
          />
          <ActionBtn
            icon={isPublished ? faEyeSlash : faEye}
            title={isPublished ? "Rút về nháp" : "Đăng ngay"}
            color={isPublished ? "#fbbf24" : "#34d399"}
            onClick={() => onTogglePublish(post)}
          />
          <ActionBtn
            icon={faTrash}
            title="Xóa"
            color="#fb7185"
            onClick={() => onDelete(post)}
          />
        </div>
      </div>
    </div>
  );
}

function ActionBtn({ icon, title, color, onClick }) {
  const [h, setH] = useState(false);
  return (
    <button
      title={title}
      onClick={onClick}
      onMouseEnter={() => setH(true)}
      onMouseLeave={() => setH(false)}
      style={{
        width: 28,
        height: 28,
        borderRadius: 7,
        border: "none",
        background: h ? color + "22" : "transparent",
        color: h ? color : TEXT.tertiary,
        cursor: "pointer",
        fontSize: 12,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        transition: "background 0.13s, color 0.13s",
        flexShrink: 0,
      }}
    >
      <FontAwesomeIcon icon={icon} />
    </button>
  );
}

/* ── StudioBlog ─────────────────────────────────────────────────────────── */
const FORM_DEFAULT = { title: "", body: "", coverUrl: null };

export default function StudioBlog({ authUser }) {
  const [posts, setPosts] = useState([]);
  const [editing, setEditing] = useState(null); // null | "new" | post object
  const [form, setForm] = useState(FORM_DEFAULT);
  const [coverFile, setCoverFile] = useState(null);
  const [coverPreview, setCoverPreview] = useState(null);
  const [saving, setSaving] = useState(false);
  const [narrow, setNarrow] = useState(false);
  const [pane, setPane] = useState("list"); // "list" | "editor" (narrow mode)

  const fileRef = useRef(null);
  const coverObjRef = useRef(null);
  const containerRef = useRef(null);

  /* ── responsive narrow detection ── */
  useEffect(() => {
    const obs = typeof ResizeObserver !== "undefined"
      ? new ResizeObserver(([entry]) => {
          setNarrow(entry.contentRect.width < 720);
        })
      : null;
    if (obs && containerRef.current) obs.observe(containerRef.current);
    return () => obs && obs.disconnect();
  }, []);

  /* ── load posts ── */
  const load = () => {
    if (!authUser?.email) return;
    getAllPosts(authUser.email).then(setPosts).catch(() => {});
  };
  useEffect(load, [authUser?.email]);

  /* ── cover preview lifecycle ── */
  useEffect(() => {
    if (coverObjRef.current) {
      URL.revokeObjectURL(coverObjRef.current);
      coverObjRef.current = null;
    }
    if (coverFile) {
      const url = URL.createObjectURL(coverFile);
      coverObjRef.current = url;
      setCoverPreview(url);
    } else {
      setCoverPreview(null);
    }
    return () => {
      if (coverObjRef.current) {
        URL.revokeObjectURL(coverObjRef.current);
        coverObjRef.current = null;
      }
    };
  }, [coverFile]);

  /* ── actions ── */
  function openNew() {
    setForm(FORM_DEFAULT);
    setCoverFile(null);
    setEditing("new");
    if (narrow) setPane("editor");
  }

  function openEdit(post) {
    setForm({ title: post.title || "", body: post.body || "", coverUrl: post.coverUrl });
    setCoverFile(null);
    setEditing(post);
    if (narrow) setPane("editor");
  }

  function cancel() {
    setEditing(null);
    setForm(FORM_DEFAULT);
    setCoverFile(null);
    if (narrow) setPane("list");
  }

  async function handleDelete(post) {
    if (!window.confirm(`Xóa story "${post.title || "Chưa có tiêu đề"}"?`)) return;
    await deletePost(post.id, authUser.email);
    load();
  }

  async function handleTogglePublish(post) {
    if (post.published) {
      await unpublishPost(post.id, authUser.email);
    } else {
      await publishPost(post.id, authUser.email);
    }
    load();
  }

  async function handleSave(publish) {
    if (!authUser?.email) return;
    setSaving(true);
    try {
      let finalCoverUrl = form.coverUrl;

      if (editing === "new") {
        /* create */
        const newPost = await createPost({
          artistEmail: authUser.email,
          title: form.title,
          body: form.body,
          coverUrl: finalCoverUrl,
        });
        if (coverFile) {
          finalCoverUrl = await uploadPostCover(coverFile, newPost.id);
          await updatePost(newPost.id, authUser.email, { coverUrl: finalCoverUrl });
        }
        if (publish) await publishPost(newPost.id, authUser.email);
      } else {
        /* update */
        if (coverFile) {
          finalCoverUrl = await uploadPostCover(coverFile, editing.id);
        }
        await updatePost(editing.id, authUser.email, {
          title: form.title,
          body: form.body,
          coverUrl: finalCoverUrl,
        });
        if (publish) {
          await publishPost(editing.id, authUser.email);
        } else {
          await unpublishPost(editing.id, authUser.email);
        }
      }

      load();
      cancel();
    } catch (err) {
      console.error("StudioBlog save error", err);
    } finally {
      setSaving(false);
    }
  }

  /* ── derived ── */
  const displayPreview = coverPreview || form.coverUrl;
  const charCount = form.body.length;

  /* ── layout helpers ── */
  const showList = !narrow || pane === "list";
  const showEditor = editing !== null && (!narrow || pane === "editor");

  /* ── grid: 2-col wide, 1-col narrow ── */
  const gridStyle = narrow
    ? { display: "block" }
    : {
        display: "grid",
        gridTemplateColumns: editing ? "1fr 1.5fr" : "1fr",
        gap: 20,
        alignItems: "start",
      };

  return (
    <div ref={containerRef} style={{ ...gridStyle }}>
      {/* ── LEFT: post list ─────────────────────────────────────────────── */}
      {showList && (
        <div>
          {/* toolbar */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: 14,
              gap: 10,
            }}
          >
            <div style={{ fontSize: 13, fontWeight: 700, color: TEXT.mid }}>
              {posts.length} story
            </div>
            <button
              onClick={openNew}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 7,
                background: `linear-gradient(90deg, ${C[600]}, ${C[500]})`,
                color: "#fff",
                border: "none",
                borderRadius: 9999,
                padding: "7px 16px",
                fontSize: 12,
                fontWeight: 700,
                cursor: "pointer",
                letterSpacing: "0.02em",
                boxShadow: `0 2px 10px ${C[600]}55`,
                transition: "opacity 0.15s",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.88")}
              onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
            >
              <FontAwesomeIcon icon={faPlus} />
              Viết story mới
            </button>
          </div>

          {/* list */}
          {posts.length === 0 ? (
            <div
              style={{
                background: BG.card,
                border: "1px solid " + BORDER,
                borderRadius: 10,
                padding: "48px 24px",
                textAlign: "center",
                color: TEXT.tertiary,
              }}
            >
              <FontAwesomeIcon
                icon={faNewspaper}
                style={{ fontSize: 32, marginBottom: 14, color: "rgba(255,255,255,0.12)" }}
              />
              <div style={{ fontSize: 13, color: TEXT.secondary, marginBottom: 4 }}>
                Chưa có story nào.
              </div>
              <div style={{ fontSize: 12, color: TEXT.tertiary }}>
                Hãy chia sẻ hành trình của bạn!
              </div>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {posts.map((post) => (
                <PostCard
                  key={post.id}
                  post={post}
                  onEdit={openEdit}
                  onDelete={handleDelete}
                  onTogglePublish={handleTogglePublish}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── RIGHT: editor ───────────────────────────────────────────────── */}
      {showEditor && (
        <div
          className="sb-fade"
          style={{
            background: BG.card,
            border: "1px solid " + BORDER,
            borderRadius: 12,
            overflow: "hidden",
          }}
        >
          {/* editor header */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "14px 18px",
              borderBottom: "1px solid " + BORDER,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <FontAwesomeIcon icon={faPen} style={{ color: C[400], fontSize: 13 }} />
              <span style={{ fontSize: 13, fontWeight: 700, color: TEXT.mid }}>
                {editing === "new" ? "Story mới" : "Chỉnh sửa story"}
              </span>
            </div>
            <button
              onClick={cancel}
              title="Đóng"
              style={{
                background: "transparent",
                border: "none",
                color: TEXT.tertiary,
                cursor: "pointer",
                fontSize: 15,
                padding: "2px 6px",
                borderRadius: 6,
                lineHeight: 1,
                transition: "color 0.13s",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = TEXT.primary)}
              onMouseLeave={(e) => (e.currentTarget.style.color = TEXT.tertiary)}
            >
              <FontAwesomeIcon icon={faXmark} />
            </button>
          </div>

          <div style={{ padding: "18px 20px", display: "flex", flexDirection: "column", gap: 16 }}>
            {/* title input */}
            <input
              type="text"
              placeholder="Tiêu đề story..."
              maxLength={100}
              value={form.title}
              onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
              style={{
                width: "100%",
                boxSizing: "border-box",
                background: "transparent",
                border: "none",
                borderBottom: "2px solid " + BORDER,
                color: TEXT.primary,
                fontSize: 20,
                fontWeight: 700,
                outline: "none",
                padding: "4px 0 10px",
                lineHeight: 1.3,
              }}
              onFocus={(e) => (e.target.style.borderBottomColor = C[500])}
              onBlur={(e) => (e.target.style.borderBottomColor = BORDER)}
            />

            {/* cover upload */}
            <div>
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                style={{ display: "none" }}
                onChange={(e) => {
                  const f = e.target.files?.[0] ?? null;
                  setCoverFile(f);
                  e.target.value = "";
                }}
              />
              <div
                onClick={() => fileRef.current?.click()}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => e.key === "Enter" && fileRef.current?.click()}
                style={{
                  borderRadius: 8,
                  border: `1.5px dashed ${displayPreview ? "transparent" : BORDER}`,
                  overflow: "hidden",
                  cursor: "pointer",
                  minHeight: displayPreview ? "auto" : 80,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  background: displayPreview ? "transparent" : "var(--overlay-1, rgba(255,255,255,0.04))",
                  transition: "border-color 0.15s, background 0.15s",
                  position: "relative",
                }}
                onMouseEnter={(e) => {
                  if (!displayPreview) e.currentTarget.style.borderColor = "rgba(255,255,255,0.22)";
                }}
                onMouseLeave={(e) => {
                  if (!displayPreview) e.currentTarget.style.borderColor = BORDER;
                }}
              >
                {displayPreview ? (
                  <div style={{ position: "relative", width: "100%" }}>
                    <img
                      src={displayPreview}
                      alt="Ảnh bìa"
                      style={{
                        width: "100%",
                        maxHeight: 180,
                        objectFit: "cover",
                        display: "block",
                        borderRadius: 7,
                      }}
                    />
                    <div
                      style={{
                        position: "absolute",
                        inset: 0,
                        background: "rgba(0,0,0,0.45)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        opacity: 0,
                        transition: "opacity 0.15s",
                        borderRadius: 7,
                        gap: 7,
                        fontSize: 12,
                        fontWeight: 700,
                        color: "#fff",
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.opacity = "1")}
                      onMouseLeave={(e) => (e.currentTarget.style.opacity = "0")}
                    >
                      <FontAwesomeIcon icon={faImage} />
                      Thay ảnh bìa
                    </div>
                  </div>
                ) : (
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      gap: 6,
                      padding: "16px 0",
                      color: TEXT.tertiary,
                    }}
                  >
                    <FontAwesomeIcon icon={faImage} style={{ fontSize: 20 }} />
                    <span style={{ fontSize: 12 }}>Thêm ảnh bìa (tùy chọn)</span>
                  </div>
                )}
              </div>
            </div>

            {/* body textarea */}
            <div>
              <textarea
                placeholder="Chia sẻ câu chuyện, cảm xúc, quá trình sáng tác..."
                value={form.body}
                onChange={(e) => setForm((f) => ({ ...f, body: e.target.value }))}
                style={{
                  width: "100%",
                  boxSizing: "border-box",
                  minHeight: 220,
                  resize: "vertical",
                  background: "var(--overlay-1, rgba(255,255,255,0.05))",
                  border: "1px solid " + BORDER,
                  borderRadius: 8,
                  padding: "14px",
                  color: TEXT.primary,
                  fontSize: 14,
                  lineHeight: 1.7,
                  outline: "none",
                  fontFamily: "inherit",
                  transition: "border-color 0.15s",
                }}
                onFocus={(e) => (e.target.style.borderColor = "rgba(255,255,255,0.2)")}
                onBlur={(e) => (e.target.style.borderColor = BORDER)}
              />
              <div
                style={{
                  fontSize: 11,
                  color: TEXT.tertiary,
                  textAlign: "right",
                  marginTop: 4,
                  fontVariantNumeric: "tabular-nums",
                }}
              >
                {charCount.toLocaleString("vi-VN")} ký tự
              </div>
            </div>

            {/* action row */}
            <div
              style={{
                display: "flex",
                gap: 8,
                alignItems: "center",
                flexWrap: "wrap",
                paddingTop: 4,
              }}
            >
              <button
                onClick={() => handleSave(false)}
                disabled={saving}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  background: "var(--overlay-1, rgba(255,255,255,0.07))",
                  border: "1px solid " + BORDER,
                  color: TEXT.mid,
                  borderRadius: 8,
                  padding: "8px 16px",
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: saving ? "not-allowed" : "pointer",
                  opacity: saving ? 0.6 : 1,
                  transition: "background 0.13s",
                }}
                onMouseEnter={(e) => {
                  if (!saving) e.currentTarget.style.background = "rgba(255,255,255,0.11)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "var(--overlay-1, rgba(255,255,255,0.07))";
                }}
              >
                {saving && (
                  <span className="sb-spin">
                    <FontAwesomeIcon icon={faSpinner} />
                  </span>
                )}
                Lưu nháp
              </button>

              <button
                onClick={() => handleSave(true)}
                disabled={saving}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  background: `linear-gradient(90deg, ${C[600]}, ${C[500]})`,
                  border: "none",
                  color: "#fff",
                  borderRadius: 8,
                  padding: "8px 18px",
                  fontSize: 13,
                  fontWeight: 700,
                  cursor: saving ? "not-allowed" : "pointer",
                  opacity: saving ? 0.6 : 1,
                  boxShadow: `0 2px 10px ${C[600]}55`,
                  transition: "opacity 0.13s",
                }}
                onMouseEnter={(e) => {
                  if (!saving) e.currentTarget.style.opacity = "0.88";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.opacity = saving ? "0.6" : "1";
                }}
              >
                {saving && (
                  <span className="sb-spin">
                    <FontAwesomeIcon icon={faSpinner} />
                  </span>
                )}
                Đăng ngay
              </button>

              <button
                onClick={cancel}
                disabled={saving}
                style={{
                  background: "transparent",
                  border: "none",
                  color: TEXT.tertiary,
                  fontSize: 13,
                  fontWeight: 500,
                  cursor: "pointer",
                  padding: "8px 10px",
                  borderRadius: 8,
                  transition: "color 0.13s",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.color = TEXT.secondary)}
                onMouseLeave={(e) => (e.currentTarget.style.color = TEXT.tertiary)}
              >
                Hủy
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
