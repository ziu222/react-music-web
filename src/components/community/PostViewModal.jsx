import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faXmark } from "@fortawesome/free-solid-svg-icons";
import { C, BG, TEXT, BORDER } from "../../constants/theme";

function formatDate(dateStr) {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  return d.toLocaleDateString("vi-VN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export default function PostViewModal({
  post,
  artistName,
  artistColor = "#f97316",
  onClose,
}) {
  useEffect(() => {
    function handleKey(e) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [onClose]);

  if (!post) return null;

  const initial = artistName ? artistName.charAt(0).toUpperCase() : "A";
  const paragraphs = post.body
    ? post.body.split(/\n\n+/)
    : [];

  return (
    <AnimatePresence>
      <div
        onClick={onClose}
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 2100,
          background: "rgba(0,0,0,0.85)",
          backdropFilter: "blur(6px)",
          WebkitBackdropFilter: "blur(6px)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "20px",
        }}
      >
        <motion.div
          onClick={(e) => e.stopPropagation()}
          initial={{ scale: 0.93, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.93, opacity: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 28 }}
          style={{
            position: "relative",
            width: "min(660px, calc(100vw - 40px))",
            maxHeight: "88vh",
            overflowY: "auto",
            background: BG.card,
            border: `1px solid ${BORDER}`,
            borderRadius: "16px",
            scrollbarWidth: "thin",
            scrollbarColor: "rgba(255,255,255,0.15) transparent",
          }}
        >
          {/* Close button */}
          <button
            onClick={onClose}
            aria-label="Đóng"
            style={{
              position: "absolute",
              top: "14px",
              right: "16px",
              zIndex: 10,
              width: "32px",
              height: "32px",
              borderRadius: "50%",
              background: "var(--overlay-2, rgba(255,255,255,0.12))",
              border: "none",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: TEXT.primary,
              fontSize: "14px",
              flexShrink: 0,
            }}
          >
            <FontAwesomeIcon icon={faXmark} />
          </button>

          {/* Hero: cover image or gradient */}
          {post.coverUrl ? (
            <img
              src={post.coverUrl}
              alt={post.title || ""}
              style={{
                display: "block",
                width: "100%",
                height: "220px",
                objectFit: "cover",
                borderRadius: "16px 16px 0 0",
              }}
            />
          ) : (
            <div
              style={{
                width: "100%",
                height: "80px",
                background: `linear-gradient(135deg, ${C[900]}, ${C[700]})`,
                borderRadius: "16px 16px 0 0",
              }}
            />
          )}

          {/* Content */}
          <div
            style={{
              padding: "28px 32px 36px",
            }}
          >
            {/* Byline */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
              }}
            >
              <div
                style={{
                  width: "34px",
                  height: "34px",
                  borderRadius: "50%",
                  background: artistColor,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#fff",
                  fontWeight: 700,
                  fontSize: "14px",
                  flexShrink: 0,
                  letterSpacing: "0.01em",
                }}
              >
                {initial}
              </div>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "2px",
                }}
              >
                <span
                  style={{
                    color: TEXT.strong,
                    fontSize: "13.5px",
                    fontWeight: 600,
                    lineHeight: 1.2,
                  }}
                >
                  {artistName || post.artistEmail || ""}
                </span>
                <span
                  style={{
                    color: TEXT.secondary,
                    fontSize: "12px",
                    lineHeight: 1.2,
                  }}
                >
                  {formatDate(post.createdAt)}
                </span>
              </div>
            </div>

            {/* Title */}
            {post.title && (
              <h2
                style={{
                  marginTop: "20px",
                  marginBottom: 0,
                  fontSize: "26px",
                  fontWeight: 900,
                  letterSpacing: "-0.3px",
                  color: TEXT.strong,
                  lineHeight: 1.25,
                  textWrap: "balance",
                }}
              >
                {post.title}
              </h2>
            )}

            {/* Body */}
            {paragraphs.length > 0 && (
              <div
                style={{
                  marginTop: "6px",
                  maxWidth: "580px",
                }}
              >
                {paragraphs.map((para, i) => (
                  <p
                    key={i}
                    style={{
                      marginTop: i === 0 ? "16px" : "12px",
                      marginBottom: 0,
                      fontSize: "14.5px",
                      lineHeight: 1.78,
                      color: TEXT.mid,
                    }}
                  >
                    {para}
                  </p>
                ))}
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
