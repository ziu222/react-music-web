import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faXmark, faStar, faComments } from "@fortawesome/free-solid-svg-icons";
import { C, BG, TEXT, BORDER } from "../../constants/theme";
import StarRating from "./StarRating";
import CommentsSection from "./CommentsSection";
import {
  getRating,
  setRating,
  getSongRatingStats,
} from "../../lib/social/songRatings";

/* ─── overlay animation ─────────────────────────────── */
const overlayVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
  exit: { opacity: 0 },
};

/* ─── drawer spring ──────────────────────────────────── */
const drawerVariants = {
  hidden: { y: "100%" },
  visible: {
    y: 0,
    transition: { type: "spring", stiffness: 300, damping: 30 },
  },
  exit: {
    y: "100%",
    transition: { type: "spring", stiffness: 300, damping: 30 },
  },
};

/* ─── small helpers ──────────────────────────────────── */
function Divider() {
  return (
    <hr
      style={{
        border: "none",
        borderTop: `1px solid ${BORDER}`,
        margin: "0",
      }}
    />
  );
}

function SectionLabel({ icon, children }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "8px",
        color: TEXT.secondary,
        fontSize: "11px",
        fontWeight: 600,
        letterSpacing: "0.08em",
        textTransform: "uppercase",
        marginBottom: "14px",
      }}
    >
      {icon && (
        <FontAwesomeIcon
          icon={icon}
          style={{ color: C[500], fontSize: "12px" }}
        />
      )}
      {children}
    </div>
  );
}

/* ─── main component ─────────────────────────────────── */
export default function SongCommunityDrawer({
  song,
  authUser,
  open,
  onClose,
  onRequireAuth,
}) {
  /* rating state */
  const [stats, setStats] = useState({ average: 0, count: 0 });
  const [userRating, setUserRating] = useState(null);
  const [thanked, setThanked] = useState(false);
  const [loadingStats, setLoadingStats] = useState(false);

  /* load rating data whenever song changes and drawer is open */
  const loadRatingData = useCallback(async () => {
    if (!song?.id) return;
    setLoadingStats(true);
    try {
      const [statsData, myRating] = await Promise.all([
        getSongRatingStats(song.id),
        authUser ? getRating(song.id, authUser.email) : Promise.resolve(null),
      ]);
      setStats(statsData);
      setUserRating(myRating);
    } finally {
      setLoadingStats(false);
    }
  }, [song?.id, authUser]);

  useEffect(() => {
    if (open && song?.id) {
      setThanked(false);
      loadRatingData();
    }
  }, [open, song?.id, loadRatingData]);

  /* ESC key handler */
  useEffect(() => {
    if (!open) return;
    function handleKey(e) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [open, onClose]);

  /* handle user submitting a rating */
  async function handleRate(value) {
    if (!authUser || !song?.id) return;
    setUserRating(value);
    await setRating(song.id, authUser.email, value);
    const fresh = await getSongRatingStats(song.id);
    setStats(fresh);
    setThanked(true);
    setTimeout(() => setThanked(false), 2000);
  }

  const isArtist = authUser?.email === song?.artistEmail;

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* ── overlay ── */}
          <motion.div
            key="overlay"
            variants={overlayVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            transition={{ duration: 0.22 }}
            onClick={onClose}
            style={{
              position: "fixed",
              inset: 0,
              zIndex: 1800,
              background: "rgba(0,0,0,0.60)",
              backdropFilter: "blur(4px)",
              WebkitBackdropFilter: "blur(4px)",
            }}
          />

          {/* ── drawer ── */}
          <motion.div
            key="drawer"
            role="dialog"
            aria-modal="true"
            aria-label={song ? `Cộng đồng: ${song.title}` : "Cộng đồng"}
            variants={drawerVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            style={{
              position: "fixed",
              bottom: 0,
              left: 0,
              right: 0,
              zIndex: 1801,
              maxHeight: "78vh",
              overflowY: "auto",
              background: BG.card,
              borderRadius: "16px 16px 0 0",
              borderTop: `1px solid ${BORDER}`,
              display: "flex",
              flexDirection: "column",
            }}
          >
            {/* ── drag handle ── */}
            <div
              aria-hidden="true"
              style={{
                width: "36px",
                height: "4px",
                background: "rgba(255,255,255,0.18)",
                borderRadius: "2px",
                margin: "10px auto 6px",
                flexShrink: 0,
              }}
            />

            {/* ── header ── */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
                padding: "8px 16px 14px",
                flexShrink: 0,
              }}
            >
              {/* cover art */}
              {song?.cover_url ? (
                <img
                  src={song.cover_url}
                  alt={song.title}
                  style={{
                    width: "40px",
                    height: "40px",
                    borderRadius: "6px",
                    objectFit: "cover",
                    flexShrink: 0,
                    border: `1px solid ${BORDER}`,
                  }}
                />
              ) : (
                <div
                  style={{
                    width: "40px",
                    height: "40px",
                    borderRadius: "6px",
                    flexShrink: 0,
                    background: song?.bg || "rgba(249,115,22,0.18)",
                    border: `1px solid ${BORDER}`,
                  }}
                />
              )}

              {/* title + artist */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div
                  style={{
                    color: TEXT.strong,
                    fontSize: "14px",
                    fontWeight: 600,
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                >
                  {song?.title ?? "—"}
                </div>
                <div
                  style={{
                    color: TEXT.secondary,
                    fontSize: "12px",
                    marginTop: "2px",
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                >
                  {song?.artist ?? ""}
                </div>
              </div>

              {/* close button */}
              <button
                onClick={onClose}
                aria-label="Đóng"
                style={{
                  flexShrink: 0,
                  background: "rgba(255,255,255,0.07)",
                  border: "none",
                  borderRadius: "50%",
                  width: "32px",
                  height: "32px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                  color: TEXT.secondary,
                  transition: "background 0.15s, color 0.15s",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "rgba(255,255,255,0.14)";
                  e.currentTarget.style.color = TEXT.primary;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "rgba(255,255,255,0.07)";
                  e.currentTarget.style.color = TEXT.secondary;
                }}
              >
                <FontAwesomeIcon icon={faXmark} style={{ fontSize: "14px" }} />
              </button>
            </div>

            <Divider />

            {/* ── rating section ── */}
            <div style={{ padding: "18px 16px 16px", flexShrink: 0 }}>
              <SectionLabel icon={faStar}>Đánh giá bài hát</SectionLabel>

              {/* average stats row */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: "16px",
                  flexWrap: "wrap",
                  marginBottom: "16px",
                }}
              >
                {/* community average */}
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                  }}
                >
                  <div
                    style={{
                      fontSize: "28px",
                      fontWeight: 700,
                      color: TEXT.strong,
                      fontVariantNumeric: "tabular-nums",
                      lineHeight: 1,
                    }}
                  >
                    {loadingStats ? "—" : stats.average.toFixed(1)}
                  </div>
                  <div>
                    <StarRating
                      value={stats.average}
                      readonly
                      showValue={false}
                    />
                    <div
                      style={{
                        color: TEXT.tertiary,
                        fontSize: "11px",
                        marginTop: "3px",
                        fontVariantNumeric: "tabular-nums",
                      }}
                    >
                      {loadingStats
                        ? "…"
                        : stats.count === 0
                        ? "Chưa có đánh giá"
                        : `${stats.count} đánh giá`}
                    </div>
                  </div>
                </div>

                {/* user's own rating badge */}
                {authUser && userRating !== null && (
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                      background: "rgba(249,115,22,0.12)",
                      border: `1px solid rgba(249,115,22,0.25)`,
                      borderRadius: "8px",
                      padding: "5px 10px",
                    }}
                  >
                    <FontAwesomeIcon
                      icon={faStar}
                      style={{ color: C[400], fontSize: "11px" }}
                    />
                    <span
                      style={{
                        color: C[400],
                        fontSize: "12px",
                        fontWeight: 600,
                        fontVariantNumeric: "tabular-nums",
                      }}
                    >
                      Bạn: {userRating}/5
                    </span>
                  </div>
                )}
              </div>

              {/* interactive rating or login prompt */}
              {authUser ? (
                <div>
                  <div
                    style={{
                      color: TEXT.secondary,
                      fontSize: "12px",
                      marginBottom: "8px",
                    }}
                  >
                    {userRating !== null
                      ? "Cập nhật đánh giá của bạn:"
                      : "Đánh giá của bạn:"}
                  </div>
                  <StarRating
                    value={userRating ?? 0}
                    onChange={handleRate}
                    readonly={false}
                  />
                  <AnimatePresence>
                    {thanked && (
                      <motion.div
                        key="thanked"
                        initial={{ opacity: 0, y: 4 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        style={{
                          marginTop: "10px",
                          color: C[400],
                          fontSize: "13px",
                          fontWeight: 500,
                        }}
                      >
                        Cam on ban da danh gia!
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <button
                  onClick={onRequireAuth}
                  style={{
                    background: "none",
                    border: "none",
                    padding: 0,
                    cursor: "pointer",
                    color: C[500],
                    fontSize: "13px",
                    fontWeight: 500,
                    textDecoration: "underline",
                    textDecorationColor: "rgba(249,115,22,0.4)",
                    textUnderlineOffset: "3px",
                  }}
                >
                  Dang nhap de danh gia
                </button>
              )}
            </div>

            <Divider />

            {/* ── comments section ── */}
            <div style={{ padding: "18px 16px 24px", flex: 1 }}>
              <SectionLabel icon={faComments}>Binh luan</SectionLabel>
              <CommentsSection
                songId={song?.id}
                authUser={authUser}
                isArtist={isArtist}
                onRequireAuth={onRequireAuth}
              />
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
