import { useState, useEffect, useRef, useCallback } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPaperPlane,
  faTrash,
  faMicrophone,
  faComment,
} from "@fortawesome/free-solid-svg-icons";
import { C, BG, TEXT, BORDER } from "../../constants/theme";
import {
  getComments,
  addComment,
  deleteComment,
  subscribeToComments,
} from "../../lib/social/songComments";

/* ─── helpers ─────────────────────────────────────────────────────────────── */

function formatRelative(iso) {
  if (!iso) return "";
  const now = Date.now();
  const ts = new Date(iso).getTime();
  const diff = Math.floor((now - ts) / 1000); // seconds

  if (diff < 60) return "vừa xong";
  if (diff < 3600) return `${Math.floor(diff / 60)} phút trước`;

  const d = new Date(iso);
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);

  const sameDay = (a, b) =>
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate();

  if (sameDay(d, today)) return "hôm nay";
  if (sameDay(d, yesterday)) return "hôm qua";

  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const yyyy = d.getFullYear();
  return `${dd}/${mm}/${yyyy}`;
}

function getInitial(name) {
  if (!name) return "?";
  return name.trim()[0].toUpperCase();
}

/* ─── skeleton row ─────────────────────────────────────────────────────────── */

function SkeletonRow() {
  return (
    <div
      style={{
        display: "flex",
        gap: 10,
        padding: "12px 0",
        borderBottom: `1px solid ${BORDER}`,
      }}
    >
      <div
        aria-hidden="true"
        style={{
          width: 32,
          height: 32,
          borderRadius: "50%",
          flexShrink: 0,
          background: "var(--overlay-1)",
          animation: "skelPulse 1.4s ease-in-out infinite",
        }}
      />
      <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 6 }}>
        <div
          aria-hidden="true"
          style={{
            height: 11,
            width: "40%",
            borderRadius: 4,
            background: "var(--overlay-1)",
            animation: "skelPulse 1.4s ease-in-out infinite",
          }}
        />
        <div
          aria-hidden="true"
          style={{
            height: 11,
            width: "80%",
            borderRadius: 4,
            background: "var(--overlay-1)",
            animation: "skelPulse 1.4s ease-in-out 0.2s infinite",
          }}
        />
        <div
          aria-hidden="true"
          style={{
            height: 11,
            width: "55%",
            borderRadius: 4,
            background: "var(--overlay-1)",
            animation: "skelPulse 1.4s ease-in-out 0.35s infinite",
          }}
        />
      </div>
    </div>
  );
}

/* ─── single comment row ───────────────────────────────────────────────────── */

function CommentRow({ comment, authUser, onDelete }) {
  const [hoverTrash, setHoverTrash] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const isOwn = authUser?.email === comment.userEmail;

  function handleTrashClick() {
    if (!confirmDelete) {
      setConfirmDelete(true);
      return;
    }
    onDelete(comment.id);
  }

  // Reset confirm state if user moves away
  function handleTrashBlur() {
    setConfirmDelete(false);
  }

  return (
    <div
      style={{
        display: "flex",
        gap: 10,
        padding: "12px 0",
        borderBottom: `1px solid ${BORDER}`,
        alignItems: "flex-start",
      }}
    >
      {/* Avatar */}
      <div
        aria-hidden="true"
        style={{
          width: 32,
          height: 32,
          borderRadius: "50%",
          flexShrink: 0,
          background: comment.userColor ?? C[500],
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 13,
          fontWeight: 800,
          color: "#fff",
          letterSpacing: 0,
          userSelect: "none",
        }}
      >
        {getInitial(comment.userName)}
      </div>

      {/* Content */}
      <div style={{ flex: 1, minWidth: 0 }}>
        {/* Name row */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            marginBottom: 3,
            flexWrap: "wrap",
          }}
        >
          <span
            style={{
              fontSize: 12,
              fontWeight: 800,
              color: TEXT.primary,
              lineHeight: 1,
            }}
          >
            {comment.userName || comment.userEmail}
          </span>

          {comment.isArtistReply && (
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 4,
                background: "rgba(249,115,22,0.15)",
                border: `1px solid rgba(249,115,22,0.35)`,
                color: C[400],
                fontSize: 9,
                fontWeight: 800,
                letterSpacing: "0.06em",
                textTransform: "uppercase",
                borderRadius: 9999,
                padding: "2px 7px",
                lineHeight: 1.4,
              }}
            >
              <FontAwesomeIcon icon={faMicrophone} style={{ fontSize: 7 }} />
              Nghệ sĩ
            </span>
          )}

          <span
            style={{
              marginLeft: "auto",
              fontSize: 10,
              color: TEXT.tertiary,
              flexShrink: 0,
            }}
          >
            {formatRelative(comment.createdAt)}
          </span>
        </div>

        {/* Body */}
        <p
          style={{
            margin: 0,
            fontSize: 13,
            color: TEXT.mid,
            lineHeight: 1.55,
            wordBreak: "break-word",
            whiteSpace: "pre-wrap",
          }}
        >
          {comment.body}
        </p>
      </div>

      {/* Trash */}
      {isOwn && (
        <button
          type="button"
          aria-label={confirmDelete ? "Xác nhận xóa" : "Xóa bình luận"}
          title={confirmDelete ? "Bấm lại để xác nhận" : "Xóa"}
          onClick={handleTrashClick}
          onBlur={handleTrashBlur}
          onMouseEnter={() => setHoverTrash(true)}
          onMouseLeave={() => setHoverTrash(false)}
          style={{
            flexShrink: 0,
            border: "none",
            background: "transparent",
            cursor: "pointer",
            color: confirmDelete
              ? "#fb7185"
              : hoverTrash
              ? TEXT.secondary
              : TEXT.tertiary,
            padding: "4px 2px",
            fontSize: 11,
            transition: "color 0.15s",
            marginTop: 2,
          }}
        >
          <FontAwesomeIcon icon={faTrash} />
        </button>
      )}
    </div>
  );
}

/* ─── main component ───────────────────────────────────────────────────────── */

const ELEVATED = "#1e1e1e";
const ACCENT   = C[500]; // #f97316

export default function CommentsSection({
  songId,
  authUser,
  isArtist = false,
  onRequireAuth,
}) {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [draft, setDraft] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const textareaRef = useRef(null);
  const MAX = 500;

  /* load + realtime */
  useEffect(() => {
    if (!songId) return;
    setLoading(true);

    getComments(songId).then((rows) => {
      setComments(rows);
      setLoading(false);
    });

    const unsub = subscribeToComments(songId, (row, eventType) => {
      if (eventType === "INSERT") {
        setComments((prev) => {
          if (prev.some((c) => c.id === row.id)) return prev;
          return [...prev, row];
        });
      } else if (eventType === "DELETE") {
        setComments((prev) => prev.filter((c) => c.id !== row.id));
      } else if (eventType === "UPDATE") {
        setComments((prev) =>
          prev.map((c) => (c.id === row.id ? { ...c, ...row } : c))
        );
      }
    });

    return unsub;
  }, [songId]);

  /* submit */
  const handleSubmit = useCallback(
    async (e) => {
      e?.preventDefault();
      const body = draft.trim();
      if (!body || !authUser || submitting) return;

      setSubmitting(true);
      try {
        await addComment({
          songId,
          userEmail: authUser.email,
          userName:
            authUser.user_metadata?.display_name ||
            authUser.user_metadata?.full_name ||
            authUser.email.split("@")[0],
          userColor: authUser.user_metadata?.avatar_color ?? C[500],
          body,
          isArtistReply: isArtist,
        });
        setDraft("");
        textareaRef.current?.focus();
      } catch {
        // silently fail — parent can add toast if desired
      } finally {
        setSubmitting(false);
      }
    },
    [draft, authUser, submitting, songId, isArtist]
  );

  /* ctrl+enter */
  function handleKeyDown(e) {
    if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      handleSubmit();
    }
  }

  /* delete */
  async function handleDelete(commentId) {
    if (!authUser) return;
    setComments((prev) => prev.filter((c) => c.id !== commentId));
    await deleteComment(commentId, authUser.email);
  }

  // display newest first
  const displayed = [...comments].reverse();

  const hasContent = draft.trim().length > 0;

  return (
    <section style={{ paddingTop: 4 }}>
      <style>{`
        @keyframes skelPulse {
          0%, 100% { opacity: 0.35; }
          50%       { opacity: 0.7; }
        }
        .cd-send-btn:hover:not(:disabled) { opacity: 0.82; }
      `}</style>

      {/* ── Compose bar ── */}
      {authUser ? (
        <form onSubmit={handleSubmit} style={{ marginBottom: 14 }}>
          <div style={{
            display: "flex",
            alignItems: "flex-end",
            gap: 8,
            background: ELEVATED,
            border: `1px solid ${BORDER}`,
            borderRadius: 12,
            padding: "10px 10px 10px 14px",
            transition: "border-color 0.15s",
          }}
          onFocusCapture={(e) => { e.currentTarget.style.borderColor = "rgba(249,115,22,0.4)"; }}
          onBlurCapture={(e)  => { e.currentTarget.style.borderColor = BORDER; }}
          >
            <div style={{ flex: 1 }}>
              <textarea
                ref={textareaRef}
                rows={2}
                maxLength={MAX}
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Viết bình luận…"
                aria-label="Nội dung bình luận"
                style={{
                  display: "block",
                  width: "100%",
                  boxSizing: "border-box",
                  background: "transparent",
                  border: "none",
                  color: TEXT.primary,
                  fontSize: 13,
                  lineHeight: 1.55,
                  resize: "none",
                  padding: 0,
                  outline: "none",
                  fontFamily: "inherit",
                }}
              />
              <div style={{
                marginTop: 4,
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}>
                <span style={{
                  fontSize: 10,
                  color: draft.length > MAX * 0.9 ? C[400] : TEXT.tertiary,
                  fontVariantNumeric: "tabular-nums",
                  transition: "color 0.2s",
                }}>
                  {draft.length}/{MAX}
                </span>
                <span style={{ fontSize: 10, color: TEXT.tertiary }}>
                  Ctrl+Enter để gửi
                </span>
              </div>
            </div>

            {/* send button */}
            <button
              type="submit"
              disabled={!hasContent || submitting}
              aria-label="Gửi bình luận"
              className="cd-send-btn"
              style={{
                flexShrink: 0,
                width: 36,
                height: 36,
                borderRadius: "50%",
                border: "none",
                background: hasContent && !submitting ? ACCENT : "rgba(255,255,255,0.07)",
                color: hasContent && !submitting ? "#fff" : TEXT.tertiary,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: hasContent && !submitting ? "pointer" : "not-allowed",
                transition: "background 0.2s, color 0.2s, opacity 0.15s",
                alignSelf: "flex-end",
              }}
            >
              <FontAwesomeIcon icon={faPaperPlane} style={{ fontSize: 13 }} />
            </button>
          </div>
        </form>
      ) : (
        /* ── Login prompt ── */
        <div style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 12,
          padding: "10px 14px",
          background: ELEVATED,
          border: `1px solid ${BORDER}`,
          borderRadius: 10,
          marginBottom: 14,
        }}>
          <span style={{ fontSize: 13, color: TEXT.secondary }}>
            Đăng nhập để bình luận
          </span>
          <button
            type="button"
            onClick={onRequireAuth}
            style={{
              flexShrink: 0,
              border: "none",
              borderRadius: 9999,
              background: ACCENT,
              color: "#fff",
              fontSize: 12,
              fontWeight: 700,
              padding: "6px 14px",
              cursor: "pointer",
              transition: "opacity 0.15s",
            }}
            onMouseEnter={(e) => { e.currentTarget.style.opacity = "0.82"; }}
            onMouseLeave={(e) => { e.currentTarget.style.opacity = "1"; }}
          >
            Đăng nhập
          </button>
        </div>
      )}

      {/* ── Comments list ── */}
      {loading ? (
        <div>
          <SkeletonRow />
          <SkeletonRow />
          <SkeletonRow />
        </div>
      ) : displayed.length === 0 ? (
        /* ── Empty state ── */
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            padding: "32px 0 24px",
            gap: 10,
          }}
        >
          <FontAwesomeIcon
            icon={faComment}
            style={{ fontSize: 22, color: "var(--text-tertiary)" }}
          />
          <span
            style={{
              fontSize: 13,
              color: TEXT.secondary,
              fontWeight: 600,
            }}
          >
            Chưa có bình luận nào.
          </span>
        </div>
      ) : (
        <div>
          {displayed.map((c, i) => (
            <div
              key={c.id}
              style={
                i === displayed.length - 1
                  ? { borderBottom: "none" }
                  : undefined
              }
            >
              <CommentRow
                comment={c}
                authUser={authUser}
                onDelete={handleDelete}
              />
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
