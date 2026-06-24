import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faXmark,
  faStar,
  faComments,
  faCircleCheck,
  faMusic,
} from "@fortawesome/free-solid-svg-icons";
import { C, BG, TEXT, BORDER, OVERLAY } from "../../constants/theme";
import StarRating from "./StarRating";
import CommentsSection from "./CommentsSection";
import {
  getRating,
  setRating,
  getSongRatingStats,
} from "../../lib/social/songRatings";

/* ─── motion ─────────────────────────────────────────────────────────── */
const overlayV = {
  hidden:  { opacity: 0 },
  visible: { opacity: 1 },
  exit:    { opacity: 0 },
};
const drawerV = {
  hidden:  { y: "100%" },
  visible: { y: 0, transition: { type: "spring", stiffness: 300, damping: 30 } },
  exit:    { y: "100%", transition: { type: "spring", stiffness: 300, damping: 30 } },
};

/* ─── tokens — CSS-variable-based, auto-adapt dark/light ─────────────── */
const CARD_BG    = BG.menu;            /* dark #282828 / light #ffffff */
const CARD_BD    = OVERLAY[2];         /* dark rgba(255,255,255,0.12) / light rgba(26,22,20,0.10) */
const CARD_SH    = "var(--shadow-card)"; /* theme-adaptive depth */
const ACCENT     = C[500];             /* #f97316 always */
const ACCENT_DIM = "rgba(249,115,22,0.13)";
const ACCENT_BD  = "rgba(249,115,22,0.28)";

/* ─── section label ─────────────────────────────────────────────────── */
function SectionLabel({ icon, children }) {
  return (
    <div style={{
      display: "flex", alignItems: "center", gap: 7, marginBottom: 14,
    }}>
      <FontAwesomeIcon icon={icon} style={{ color: ACCENT, fontSize: 12 }} />
      <span style={{
        fontSize: 10.5, fontWeight: 800, letterSpacing: "0.1em",
        textTransform: "uppercase", color: TEXT.secondary,
      }}>
        {children}
      </span>
    </div>
  );
}

/* ─── star row (visible interactive container) ──────────────────────── */
function InteractiveStars({ userRating, onRate }) {
  return (
    <div style={{
      marginTop: 14,
      background: CARD_BG,
      border: `1px solid ${CARD_BD}`,
      boxShadow: CARD_SH,
      borderRadius: 12,
      padding: "14px 16px",
    }}>
      <div style={{
        fontSize: 11.5, color: TEXT.secondary, fontWeight: 600, marginBottom: 12,
      }}>
        {userRating != null ? "Cập nhật đánh giá của bạn:" : "Đánh giá của bạn:"}
      </div>
      <StarRating
        value={userRating ?? 0}
        onChange={onRate}
        size="lg"
        showValue={false}
      />
      <div style={{ marginTop: 8, fontSize: 10.5, color: TEXT.tertiary }}>
        Nhấn sao để đánh giá
      </div>
    </div>
  );
}

/* ─── rating stats block ─────────────────────────────────────────────── */
function RatingStats({ average, count, userRating, loading }) {
  const fmtCount = (n) =>
    n >= 1000 ? `${(n / 1000).toFixed(1)}k` : String(n);

  return (
    <div style={{
      background: CARD_BG,
      border: `1px solid ${CARD_BD}`,
      boxShadow: CARD_SH,
      borderRadius: 12,
      padding: "14px 16px",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      gap: 16,
    }}>
      {/* left: score + stars + count */}
      <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
        <span style={{
          fontSize: 44, fontWeight: 800, lineHeight: 1,
          letterSpacing: "-0.03em",
          color: loading ? TEXT.tertiary : TEXT.strong,
          fontVariantNumeric: "tabular-nums",
        }}>
          {loading ? "—" : average.toFixed(1)}
        </span>
        <div>
          <StarRating value={average} readonly size="sm" showValue={false} />
          <div style={{
            marginTop: 4, fontSize: 11, color: TEXT.tertiary,
            fontVariantNumeric: "tabular-nums",
          }}>
            {loading ? "đang tải…"
              : count === 0 ? "Chưa có đánh giá"
              : `${fmtCount(count)} đánh giá`}
          </div>
        </div>
      </div>

      {/* right: user badge */}
      {!loading && userRating != null && (
        <div style={{
          display: "flex", alignItems: "center", gap: 6,
          background: ACCENT_DIM, border: `1px solid ${ACCENT_BD}`,
          borderRadius: 8, padding: "7px 12px", flexShrink: 0,
        }}>
          <FontAwesomeIcon icon={faStar} style={{ color: C[400], fontSize: 11 }} />
          <span style={{
            fontSize: 12, fontWeight: 800, color: C[400],
            fontVariantNumeric: "tabular-nums",
          }}>
            Bạn: {userRating}/5
          </span>
        </div>
      )}
    </div>
  );
}

/* ─── main ───────────────────────────────────────────────────────────── */
export default function SongCommunityDrawer({
  song, authUser, open, onClose, onRequireAuth,
}) {
  const [stats,       setStats]       = useState({ average: 0, count: 0 });
  const [userRating,  setUserRating]  = useState(null);
  const [thanked,     setThanked]     = useState(false);
  const [loadingRate, setLoadingRate] = useState(false);

  const loadRating = useCallback(async () => {
    if (!song?.id) return;
    setLoadingRate(true);
    try {
      const [s, r] = await Promise.all([
        getSongRatingStats(song.id),
        authUser ? getRating(song.id, authUser.email) : null,
      ]);
      setStats(s); setUserRating(r);
    } finally { setLoadingRate(false); }
  }, [song?.id, authUser]);

  useEffect(() => {
    if (open && song?.id) { setThanked(false); loadRating(); }
  }, [open, song?.id, loadRating]);

  useEffect(() => {
    if (!open) return;
    const fn = (e) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", fn);
    return () => document.removeEventListener("keydown", fn);
  }, [open, onClose]);

  async function handleRate(value) {
    if (!authUser || !song?.id) return;
    setUserRating(value);
    await setRating(song.id, authUser.email, value);
    const fresh = await getSongRatingStats(song.id);
    setStats(fresh);
    setThanked(true);
    setTimeout(() => setThanked(false), 2500);
  }

  const isArtist = authUser?.email === song?.artistEmail;

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* overlay */}
          <motion.div
            key="cdo"
            variants={overlayV} initial="hidden" animate="visible" exit="exit"
            transition={{ duration: 0.2 }}
            onClick={onClose}
            style={{
              position: "fixed", inset: 0, zIndex: 1800,
              background: "var(--scrim)",
              backdropFilter: "blur(6px)",
              WebkitBackdropFilter: "blur(6px)",
            }}
          />

          {/* drawer */}
          <motion.div
            key="cdd"
            role="dialog" aria-modal="true"
            aria-label={song ? `Cộng đồng: ${song.title}` : "Cộng đồng"}
            variants={drawerV} initial="hidden" animate="visible" exit="exit"
            style={{
              position: "fixed",
              bottom: 0, left: 0, right: 0,
              zIndex: 1801,
              maxHeight: "82vh",
              display: "flex",
              flexDirection: "column",
              background: BG.card,
              borderRadius: "20px 20px 0 0",
              borderTop: `1px solid ${CARD_BD}`,
              boxShadow: "var(--shadow-modal)",
              overflow: "hidden",
            }}
          >
            {/* drag handle */}
            <div aria-hidden="true" style={{
              width: 40, height: 4,
              background: CARD_BD,
              borderRadius: 2,
              margin: "12px auto 0",
              flexShrink: 0,
            }} />

            {/* ── header ── */}
            <div style={{
              flexShrink: 0,
              display: "flex", alignItems: "center", gap: 12,
              padding: "12px 16px 14px",
              borderBottom: `1px solid ${CARD_BD}`,
            }}>
              {/* cover / fallback */}
              {song?.cover_url ? (
                <img
                  src={song.cover_url} alt={song.title}
                  style={{
                    width: 48, height: 48, borderRadius: 8, objectFit: "cover",
                    flexShrink: 0, border: `1px solid ${CARD_BD}`,
                    boxShadow: "0 2px 10px rgba(0,0,0,0.5)",
                  }}
                />
              ) : (
                <div style={{
                  width: 48, height: 48, borderRadius: 8, flexShrink: 0,
                  background: "linear-gradient(135deg,#7c2d12,#f97316)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  boxShadow: "0 2px 10px rgba(249,115,22,0.3)",
                }}>
                  <FontAwesomeIcon icon={faMusic} style={{ color: "#fff", fontSize: 18 }} />
                </div>
              )}

              {/* title / artist */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{
                  fontSize: 14, fontWeight: 700, color: TEXT.strong,
                  whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
                  lineHeight: 1.35,
                }}>
                  {song?.title ?? "—"}
                </div>
                <div style={{
                  fontSize: 12, color: TEXT.secondary, marginTop: 2,
                  whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
                }}>
                  {song?.artist ?? ""}
                </div>
              </div>

              {/* close button */}
              <button
                onClick={onClose} aria-label="Đóng"
                style={{
                  flexShrink: 0,
                  background: OVERLAY[1],
                  border: `1px solid ${CARD_BD}`,
                  borderRadius: "50%",
                  width: 36, height: 36,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  cursor: "pointer", color: TEXT.secondary,
                  transition: "background 0.15s, color 0.15s",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = OVERLAY[2];
                  e.currentTarget.style.color = TEXT.strong;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = OVERLAY[1];
                  e.currentTarget.style.color = TEXT.secondary;
                }}
              >
                <FontAwesomeIcon icon={faXmark} style={{ fontSize: 15 }} />
              </button>
            </div>

            {/* ── scrollable body ── */}
            <div style={{ flex: 1, overflowY: "auto", padding: "20px 16px 32px" }}>

              {/* RATING */}
              <SectionLabel icon={faStar}>Đánh giá</SectionLabel>

              <RatingStats
                average={stats.average} count={stats.count}
                userRating={userRating} loading={loadingRate}
              />

              {/* interactive or login */}
              {authUser ? (
                <>
                  <InteractiveStars userRating={userRating} onRate={handleRate} />
                  <AnimatePresence>
                    {thanked && (
                      <motion.div
                        key="thanks"
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        style={{
                          marginTop: 10, display: "flex", alignItems: "center",
                          gap: 6, color: C[400], fontSize: 13, fontWeight: 700,
                        }}
                      >
                        <FontAwesomeIcon icon={faCircleCheck} style={{ fontSize: 14 }} />
                        Cảm ơn bạn đã đánh giá!
                      </motion.div>
                    )}
                  </AnimatePresence>
                </>
              ) : (
                <div style={{
                  marginTop: 14,
                  display: "flex", alignItems: "center", justifyContent: "space-between",
                  gap: 12, background: CARD_BG, border: `1px solid ${CARD_BD}`,
                  boxShadow: CARD_SH, borderRadius: 12, padding: "12px 16px",
                }}>
                  <span style={{ fontSize: 13, color: TEXT.secondary }}>
                    Đăng nhập để đánh giá bài hát
                  </span>
                  <button
                    type="button" onClick={onRequireAuth}
                    style={{
                      flexShrink: 0, background: ACCENT, border: "none",
                      borderRadius: 9999, padding: "7px 16px",
                      fontSize: 12, fontWeight: 700, color: "#fff",
                      cursor: "pointer", transition: "opacity 0.15s",
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.opacity = "0.82"; }}
                    onMouseLeave={(e) => { e.currentTarget.style.opacity = "1"; }}
                  >
                    Đăng nhập
                  </button>
                </div>
              )}

              {/* divider */}
              <hr style={{
                border: "none", borderTop: `1px solid ${CARD_BD}`,
                margin: "22px 0 20px",
              }} />

              {/* COMMENTS */}
              <SectionLabel icon={faComments}>Bình luận</SectionLabel>

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
