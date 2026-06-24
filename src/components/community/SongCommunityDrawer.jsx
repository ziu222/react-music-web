import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faXmark,
  faStar,
  faComments,
  faCircleCheck,
} from "@fortawesome/free-solid-svg-icons";
import { C, BG, TEXT, BORDER } from "../../constants/theme";
import StarRating from "./StarRating";
import CommentsSection from "./CommentsSection";
import {
  getRating,
  setRating,
  getSongRatingStats,
} from "../../lib/social/songRatings";

/* ─── motion variants ───────────────────────────────────────────── */
const overlayV = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
  exit: { opacity: 0 },
};
const drawerV = {
  hidden: { y: "100%" },
  visible: { y: 0, transition: { type: "spring", stiffness: 320, damping: 32 } },
  exit:   { y: "100%", transition: { type: "spring", stiffness: 320, damping: 32 } },
};

/* ─── design tokens ─────────────────────────────────────────────── */
const ELEVATED   = "#1e1e1e";
const ELEVATED_2 = "#252525";
const ACCENT     = C[500];                       // #f97316
const ACCENT_BG  = "rgba(249,115,22,0.10)";
const ACCENT_BD  = "rgba(249,115,22,0.22)";

/* ─── helper: section label ─────────────────────────────────────── */
function SectionHead({ icon, children, badge }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 14 }}>
      <FontAwesomeIcon icon={icon} style={{ color: ACCENT, fontSize: 11 }} />
      <span style={{
        fontSize: 10.5,
        fontWeight: 700,
        letterSpacing: "0.09em",
        textTransform: "uppercase",
        color: TEXT.secondary,
      }}>
        {children}
      </span>
      {badge != null && (
        <span style={{
          fontSize: 10,
          fontWeight: 600,
          color: TEXT.tertiary,
          marginLeft: 2,
        }}>
          ({badge})
        </span>
      )}
    </div>
  );
}

/* ─── rating stats card ─────────────────────────────────────────── */
function RatingCard({ average, count, userRating, loading }) {
  return (
    <div style={{
      background: ELEVATED,
      border: `1px solid ${BORDER}`,
      borderRadius: 12,
      padding: "14px 16px",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      gap: 16,
    }}>
      {/* Left: big score */}
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <span style={{
          fontSize: 40,
          fontWeight: 800,
          color: loading ? TEXT.tertiary : TEXT.primary,
          fontVariantNumeric: "tabular-nums",
          lineHeight: 1,
          letterSpacing: "-0.02em",
        }}>
          {loading ? "—" : average.toFixed(1)}
        </span>
        <div>
          <StarRating value={average} readonly size="sm" showValue={false} />
          <div style={{
            marginTop: 4,
            fontSize: 11,
            color: TEXT.tertiary,
            fontVariantNumeric: "tabular-nums",
          }}>
            {loading ? "…" : count === 0
              ? "Chưa có đánh giá"
              : `${count.toLocaleString("vi")} đánh giá`}
          </div>
        </div>
      </div>

      {/* Right: user's rating badge */}
      {userRating != null && (
        <div style={{
          display: "flex",
          alignItems: "center",
          gap: 5,
          background: ACCENT_BG,
          border: `1px solid ${ACCENT_BD}`,
          borderRadius: 8,
          padding: "6px 11px",
          flexShrink: 0,
        }}>
          <FontAwesomeIcon icon={faStar} style={{ color: C[400], fontSize: 11 }} />
          <span style={{
            fontSize: 12,
            fontWeight: 700,
            color: C[400],
            fontVariantNumeric: "tabular-nums",
          }}>
            Bạn: {userRating}/5
          </span>
        </div>
      )}
    </div>
  );
}

/* ─── main component ─────────────────────────────────────────────── */
export default function SongCommunityDrawer({
  song,
  authUser,
  open,
  onClose,
  onRequireAuth,
}) {
  const [stats,       setStats]       = useState({ average: 0, count: 0 });
  const [userRating,  setUserRating]  = useState(null);
  const [thanked,     setThanked]     = useState(false);
  const [loadingRate, setLoadingRate] = useState(false);

  /* load rating data */
  const loadRating = useCallback(async () => {
    if (!song?.id) return;
    setLoadingRate(true);
    try {
      const [s, r] = await Promise.all([
        getSongRatingStats(song.id),
        authUser ? getRating(song.id, authUser.email) : null,
      ]);
      setStats(s);
      setUserRating(r);
    } finally {
      setLoadingRate(false);
    }
  }, [song?.id, authUser]);

  useEffect(() => {
    if (open && song?.id) { setThanked(false); loadRating(); }
  }, [open, song?.id, loadRating]);

  /* ESC */
  useEffect(() => {
    if (!open) return;
    const fn = (e) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", fn);
    return () => document.removeEventListener("keydown", fn);
  }, [open, onClose]);

  /* handle rate */
  async function handleRate(value) {
    if (!authUser || !song?.id) return;
    setUserRating(value);
    await setRating(song.id, authUser.email, value);
    const fresh = await getSongRatingStats(song.id);
    setStats(fresh);
    setThanked(true);
    setTimeout(() => setThanked(false), 2200);
  }

  const isArtist = authUser?.email === song?.artistEmail;

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* overlay */}
          <motion.div
            key="cd-overlay"
            variants={overlayV}
            initial="hidden" animate="visible" exit="exit"
            transition={{ duration: 0.2 }}
            onClick={onClose}
            style={{
              position: "fixed", inset: 0, zIndex: 1800,
              background: "rgba(0,0,0,0.65)",
              backdropFilter: "blur(5px)",
              WebkitBackdropFilter: "blur(5px)",
            }}
          />

          {/* drawer */}
          <motion.div
            key="cd-drawer"
            role="dialog"
            aria-modal="true"
            aria-label={song ? `Cộng đồng: ${song.title}` : "Cộng đồng"}
            variants={drawerV}
            initial="hidden" animate="visible" exit="exit"
            style={{
              position: "fixed",
              bottom: 0, left: 0, right: 0,
              zIndex: 1801,
              maxHeight: "80vh",
              display: "flex",
              flexDirection: "column",
              background: BG.card,
              borderRadius: "18px 18px 0 0",
              borderTop: `1px solid ${BORDER}`,
              overflow: "hidden",
            }}
          >
            {/* drag handle */}
            <div aria-hidden="true" style={{
              width: 38, height: 4,
              background: "rgba(255,255,255,0.15)",
              borderRadius: 2,
              margin: "10px auto 0",
              flexShrink: 0,
            }} />

            {/* ── sticky header ── */}
            <div style={{
              flexShrink: 0,
              display: "flex",
              alignItems: "center",
              gap: 12,
              padding: "10px 16px 14px",
              borderBottom: `1px solid ${BORDER}`,
            }}>
              {/* cover art */}
              {song?.cover_url ? (
                <img
                  src={song.cover_url}
                  alt={song.title}
                  style={{
                    width: 48, height: 48,
                    borderRadius: 8,
                    objectFit: "cover",
                    flexShrink: 0,
                    border: `1px solid ${BORDER}`,
                    boxShadow: "0 2px 8px rgba(0,0,0,0.4)",
                  }}
                />
              ) : (
                <div style={{
                  width: 48, height: 48,
                  borderRadius: 8,
                  flexShrink: 0,
                  background: song?.bg ?? ACCENT_BG,
                  border: `1px solid ${BORDER}`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}>
                  <FontAwesomeIcon icon={faComments} style={{ color: ACCENT, fontSize: 18 }} />
                </div>
              )}

              {/* meta */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{
                  fontSize: 14,
                  fontWeight: 700,
                  color: TEXT.primary,
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  lineHeight: 1.3,
                }}>
                  {song?.title ?? "—"}
                </div>
                <div style={{
                  fontSize: 12,
                  color: TEXT.secondary,
                  marginTop: 2,
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}>
                  {song?.artist ?? ""}
                </div>
              </div>

              {/* close */}
              <button
                onClick={onClose}
                aria-label="Đóng"
                style={{
                  flexShrink: 0,
                  background: "rgba(255,255,255,0.06)",
                  border: "none",
                  borderRadius: "50%",
                  width: 34, height: 34,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                  color: TEXT.secondary,
                  transition: "background 0.15s, color 0.15s",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "rgba(255,255,255,0.13)";
                  e.currentTarget.style.color = TEXT.primary;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "rgba(255,255,255,0.06)";
                  e.currentTarget.style.color = TEXT.secondary;
                }}
              >
                <FontAwesomeIcon icon={faXmark} style={{ fontSize: 15 }} />
              </button>
            </div>

            {/* ── scrollable body ── */}
            <div style={{ flex: 1, overflowY: "auto", padding: "18px 16px 28px" }}>

              {/* ── Rating section ── */}
              <SectionHead icon={faStar}>Đánh giá</SectionHead>

              {/* stats card */}
              <RatingCard
                average={stats.average}
                count={stats.count}
                userRating={userRating}
                loading={loadingRate}
              />

              {/* interactive stars / login prompt */}
              <div style={{ marginTop: 16, marginBottom: 6 }}>
                {authUser ? (
                  <div>
                    <div style={{
                      fontSize: 11.5,
                      color: TEXT.secondary,
                      marginBottom: 10,
                      fontWeight: 500,
                    }}>
                      {userRating != null ? "Cập nhật đánh giá của bạn:" : "Đánh giá của bạn:"}
                    </div>
                    <StarRating
                      value={userRating ?? 0}
                      onChange={handleRate}
                      size="lg"
                      showValue={false}
                    />
                    <AnimatePresence>
                      {thanked && (
                        <motion.div
                          key="thanked"
                          initial={{ opacity: 0, y: 6 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -4 }}
                          transition={{ duration: 0.2 }}
                          style={{
                            marginTop: 10,
                            display: "flex",
                            alignItems: "center",
                            gap: 6,
                            color: C[400],
                            fontSize: 12.5,
                            fontWeight: 600,
                          }}
                        >
                          <FontAwesomeIcon icon={faCircleCheck} style={{ fontSize: 13 }} />
                          Cảm ơn bạn đã đánh giá!
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ) : (
                  <div style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: 12,
                    background: ELEVATED,
                    border: `1px solid ${BORDER}`,
                    borderRadius: 10,
                    padding: "10px 14px",
                  }}>
                    <span style={{ fontSize: 13, color: TEXT.secondary }}>
                      Đăng nhập để đánh giá bài hát
                    </span>
                    <button
                      type="button"
                      onClick={onRequireAuth}
                      style={{
                        flexShrink: 0,
                        background: ACCENT,
                        border: "none",
                        borderRadius: 9999,
                        padding: "6px 14px",
                        fontSize: 12,
                        fontWeight: 700,
                        color: "#fff",
                        cursor: "pointer",
                        transition: "opacity 0.15s",
                      }}
                      onMouseEnter={(e) => { e.currentTarget.style.opacity = "0.85"; }}
                      onMouseLeave={(e) => { e.currentTarget.style.opacity = "1"; }}
                    >
                      Đăng nhập
                    </button>
                  </div>
                )}
              </div>

              {/* divider */}
              <hr style={{
                border: "none",
                borderTop: `1px solid ${BORDER}`,
                margin: "20px 0 18px",
              }} />

              {/* ── Comments section ── */}
              <SectionHead icon={faComments}>
                Bình luận
              </SectionHead>

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
