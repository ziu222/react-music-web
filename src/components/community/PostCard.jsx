import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCalendar,
  faPen,
  faEye,
  faEyeSlash,
  faTrash,
  faComment,
} from "@fortawesome/free-solid-svg-icons";
import { C, BG, TEXT, BORDER } from "../../constants/theme";

function formatDateVi(dateStr) {
  const d = new Date(dateStr);
  if (isNaN(d)) return "";
  const day = d.getDate();
  const month = d.getMonth() + 1;
  const year = d.getFullYear();
  return `${day} tháng ${month}, ${year}`;
}

function excerpt(body, maxLen = 120) {
  if (!body) return "";
  const text = body.replace(/\s+/g, " ").trim();
  if (text.length <= maxLen) return text;
  return text.slice(0, maxLen) + "...";
}

export default function PostCard({
  post,
  onClick,
  isOwner = false,
  onEdit,
  onDelete,
  onTogglePublish,
}) {
  const { title, body, coverUrl, published, createdAt } = post || {};

  function handleAction(e, cb) {
    e.stopPropagation();
    if (cb) cb(post);
  }

  return (
    <div
      onClick={() => onClick && onClick(post)}
      style={{
        background: BG.el,
        border: `1px solid ${BORDER}`,
        borderRadius: 12,
        overflow: "hidden",
        cursor: "pointer",
        display: "flex",
        flexDirection: "column",
        transition: "transform 0.18s ease, box-shadow 0.18s ease",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "translateY(-3px)";
        e.currentTarget.style.boxShadow = "0 12px 32px rgba(0,0,0,0.5)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "translateY(0)";
        e.currentTarget.style.boxShadow = "none";
      }}
    >
      {/* Cover image area — 16:9 */}
      <div
        style={{
          position: "relative",
          paddingTop: "56.25%",
          overflow: "hidden",
          flexShrink: 0,
        }}
      >
        {coverUrl ? (
          <img
            src={coverUrl}
            alt={title || ""}
            style={{
              position: "absolute",
              inset: 0,
              width: "100%",
              height: "100%",
              objectFit: "cover",
              display: "block",
            }}
          />
        ) : (
          <div
            style={{
              position: "absolute",
              inset: 0,
              background: `linear-gradient(135deg, ${C[900]}, ${C[700]})`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <FontAwesomeIcon
              icon={faComment}
              style={{ fontSize: 32, color: "rgba(255,255,255,0.25)" }}
            />
          </div>
        )}

        {/* Draft badge */}
        {!published && (
          <span
            style={{
              position: "absolute",
              top: 10,
              right: 10,
              background: "#ea580c",
              color: "#fff",
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: "0.04em",
              padding: "3px 9px",
              borderRadius: 20,
              lineHeight: 1.4,
              pointerEvents: "none",
            }}
          >
            Bản nháp
          </span>
        )}
      </div>

      {/* Card body */}
      <div style={{ padding: "14px 16px", flex: 1, display: "flex", flexDirection: "column", gap: 0 }}>
        {/* Title */}
        <div
          style={{
            fontSize: 14,
            fontWeight: 700,
            color: TEXT.primary,
            lineHeight: 1.45,
            overflow: "hidden",
            display: "-webkit-box",
            WebkitBoxOrient: "vertical",
            WebkitLineClamp: 2,
          }}
        >
          {title || "Không có tiêu đề"}
        </div>

        {/* Excerpt */}
        <div
          style={{
            fontSize: 12,
            color: TEXT.secondary,
            lineHeight: 1.55,
            marginTop: 6,
            overflow: "hidden",
            display: "-webkit-box",
            WebkitBoxOrient: "vertical",
            WebkitLineClamp: 3,
            flex: 1,
          }}
        >
          {excerpt(body)}
        </div>

        {/* Footer: date */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            marginTop: 10,
            fontSize: 11,
            color: TEXT.tertiary,
          }}
        >
          <FontAwesomeIcon icon={faCalendar} style={{ fontSize: 10 }} />
          <span>{formatDateVi(createdAt)}</span>
        </div>
      </div>

      {/* Owner action row */}
      {isOwner && (
        <div
          style={{
            borderTop: `1px solid ${BORDER}`,
            padding: "10px 14px",
            display: "flex",
            alignItems: "center",
            gap: 14,
          }}
        >
          <button
            onClick={(e) => handleAction(e, onEdit)}
            style={actionBtnStyle()}
          >
            <FontAwesomeIcon icon={faPen} style={{ fontSize: 11 }} />
            Sửa
          </button>

          <button
            onClick={(e) => handleAction(e, onTogglePublish)}
            style={actionBtnStyle()}
          >
            <FontAwesomeIcon
              icon={published ? faEyeSlash : faEye}
              style={{ fontSize: 11 }}
            />
            {published ? "Ẩn" : "Đăng"}
          </button>

          <button
            onClick={(e) => handleAction(e, onDelete)}
            style={actionBtnStyle({ color: "#fb7185" })}
          >
            <FontAwesomeIcon icon={faTrash} style={{ fontSize: 11 }} />
            Xóa
          </button>
        </div>
      )}
    </div>
  );
}

function actionBtnStyle(overrides = {}) {
  return {
    background: "none",
    border: "none",
    cursor: "pointer",
    fontSize: 12,
    color: "rgba(255,255,255,0.5)",
    display: "flex",
    alignItems: "center",
    gap: 5,
    padding: 0,
    lineHeight: 1,
    transition: "color 0.15s",
    ...overrides,
  };
}
