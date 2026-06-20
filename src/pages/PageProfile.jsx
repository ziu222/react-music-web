import { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faUserCircle,
  faMusic,
  faClock,
  faHeart,
  faMicrophone,
  faArrowUp,
  faCircleNotch,
  faTriangleExclamation,
  faXmarkCircle,
  faReply,
} from "@fortawesome/free-solid-svg-icons";
import { C, BORDER, BG, TEXT } from "../constants/theme";
import PlanBadge from "../components/primitives/PlanBadge";
import { listenerStats } from "../data/listenerStats";
import { getRequest, withdrawUpgradeRequest, replyToInfoRequest } from "../lib/artist/upgradeRequests";
import { createNotification, loadNotifications, saveNotifications } from "../lib/social/notifications";

const ADMIN_KEY = "linh@melodies.local";

function StatCard({ icon, accent, value, label }) {
  return (
    <div
      style={{
        background: BG.card,
        border: `1px solid ${BORDER}`,
        borderRadius: 10,
        padding: "16px 20px",
        flex: 1,
        minWidth: 150,
      }}
    >
      <div
        style={{
          width: 34,
          height: 34,
          borderRadius: 8,
          background: accent + "22",
          color: accent,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <FontAwesomeIcon icon={icon} style={{ fontSize: 15 }} />
      </div>
      <div style={{ fontSize: 26, fontWeight: 700, color: TEXT.strong, marginTop: 10 }}>
        {value}
      </div>
      <div style={{ fontSize: 12, color: TEXT.secondary, marginTop: 2 }}>{label}</div>
    </div>
  );
}

function SectionTitle({ children }) {
  return (
    <div style={{ fontSize: 16, fontWeight: 700, color: TEXT.strong, marginBottom: 12 }}>
      {children}
    </div>
  );
}

export default function PageProfile({
  user,
  isPremium,
  likedCount,
  recentSongs = [],
  onPlay,
  cur,
  onOpenPremium,
  onOpenArtistUpgrade,
}) {
  const [upgradeReq, setUpgradeReq] = useState(() => user ? getRequest(user.email) : null);
  const [infoReply, setInfoReply] = useState("");
  const [replySent, setReplySent] = useState(false);

  useEffect(() => {
    if (user) setUpgradeReq(getRequest(user.email)); // eslint-disable-line react-hooks/set-state-in-effect
  }, [user]);

  const handleWithdraw = () => {
    withdrawUpgradeRequest(user.email);
    setUpgradeReq(null);
  };

  const handleReply = () => {
    if (!infoReply.trim()) return;
    replyToInfoRequest(user.email, infoReply.trim());
    const notif = createNotification(
      "system",
      "Phản hồi đơn đăng ký nghệ sĩ",
      `${user.name} đã phản hồi yêu cầu bổ sung thông tin`
    );
    saveNotifications(ADMIN_KEY, [notif, ...loadNotifications(ADMIN_KEY)]);
    setUpgradeReq(getRequest(user.email));
    setReplySent(true);
    setInfoReply("");
  };
  if (!user) {
    return (
      <div style={{ padding: 60, textAlign: "center" }}>
        <FontAwesomeIcon icon={faUserCircle} style={{ fontSize: 40, color: TEXT.tertiary }} />
        <div style={{ fontSize: 14, color: TEXT.secondary, marginTop: 14 }}>
          Đăng nhập để xem hồ sơ của bạn
        </div>
      </div>
    );
  }

  const stats =
    listenerStats.find(s => s.userId === user.id) ?? {
      songsListened: 0,
      totalHours: 0,
      topGenres: [],
      topArtists: [],
    };

  const joined = new Date(user.joinedAt).toLocaleDateString("vi-VN", {
    year: "numeric",
    month: "long",
  });

  return (
    <div>
      {/* ── Hero ── */}
      <div
        style={{
          padding: "48px 32px 28px",
          background: `linear-gradient(180deg, ${user.color}55 0%, ${user.color}18 55%, transparent 100%)`,
          display: "flex",
          alignItems: "flex-end",
          gap: 24,
          animation: "slideUp 0.3s ease",
        }}
      >
        <div
          style={{
            width: 128,
            height: 128,
            borderRadius: "50%",
            background: user.color,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 44,
            fontWeight: 800,
            color: "#fff",
            boxShadow: `0 8px 32px ${user.color}66`,
            flexShrink: 0,
          }}
        >
          {user.initial}
        </div>

        <div>
          <div
            style={{
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: "0.1em",
              color: TEXT.mid,
            }}
          >
            HỒ SƠ
          </div>
          <div
            style={{
              fontSize: 40,
              fontWeight: 800,
              color: TEXT.strong,
              lineHeight: 1.1,
              margin: "6px 0 10px",
            }}
          >
            {user.name}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
            <span style={{ fontSize: 13, color: TEXT.secondary }}>{user.email}</span>
            <span style={{ color: TEXT.tertiary }}>·</span>
            <PlanBadge premium={isPremium} />
            <span style={{ fontSize: 12, color: TEXT.tertiary }}>Thành viên từ {joined}</span>
          </div>

          {!isPremium && (
            <button
              type="button"
              onClick={onOpenPremium}
              style={{
                marginTop: 12,
                borderRadius: 9999,
                padding: "7px 18px",
                background: `linear-gradient(90deg, ${C[600]}, ${C[500]})`,
                color: "#fff",
                fontSize: 12,
                fontWeight: 700,
                border: "none",
                cursor: "pointer",
                transition: "transform 0.15s",
              }}
              onMouseEnter={e => { e.currentTarget.style.transform = "scale(1.03)"; }}
              onMouseLeave={e => { e.currentTarget.style.transform = "scale(1)"; }}
            >
              Nâng cấp Premium
            </button>
          )}
        </div>
      </div>

      {/* ── Body ── */}
      <div style={{ padding: "8px 32px 48px" }}>
        <div style={{ display: "flex", gap: 14, flexWrap: "wrap", marginBottom: 32 }}>
          <StatCard
            icon={faMusic}
            accent={C[500]}
            value={stats.songsListened.toLocaleString("vi-VN")}
            label="Bài đã nghe"
          />
          <StatCard
            icon={faClock}
            accent="#60a5fa"
            value={stats.totalHours + " giờ"}
            label="Thời gian nghe"
          />
          <StatCard icon={faHeart} accent="#fb7185" value={likedCount} label="Bài đã thích" />
        </div>

        {/* ── Artist Upgrade Section ── */}
        {user.role !== "artist" && user.role !== "admin" && (
          <div style={{ marginBottom: 32 }}>
            <SectionTitle>Trở thành Nghệ sĩ</SectionTitle>

            {/* State 1: Chưa gửi */}
            {!upgradeReq && (
              <div style={{
                background: BG.card, border: "1px solid " + BORDER,
                borderRadius: 12, padding: "20px 24px",
                display: "flex", alignItems: "center", gap: 16,
              }}>
                <div style={{
                  width: 44, height: 44, borderRadius: 10,
                  background: `${C[500]}22`, flexShrink: 0,
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  <FontAwesomeIcon icon={faMicrophone} style={{ color: C[400], fontSize: 18 }} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: TEXT.strong }}>Bắt đầu hành trình âm nhạc</div>
                  <div style={{ fontSize: 12, color: TEXT.secondary, marginTop: 3 }}>
                    Upload nhạc, xem analytics và xây dựng fan base riêng
                  </div>
                </div>
                <button
                  onClick={onOpenArtistUpgrade}
                  style={{
                    background: `linear-gradient(90deg, ${C[600]}, ${C[500]})`,
                    color: "#fff", border: "none", borderRadius: 9999,
                    padding: "8px 20px", fontSize: 12, fontWeight: 700,
                    cursor: "pointer", display: "flex", alignItems: "center", gap: 6,
                    flexShrink: 0,
                  }}
                >
                  <FontAwesomeIcon icon={faArrowUp} style={{ fontSize: 11 }} />
                  Đăng ký ngay
                </button>
              </div>
            )}

            {/* State 2: Đang chờ duyệt */}
            {upgradeReq?.status === "pending" && (
              <div style={{
                background: BG.card, border: "1px solid " + BORDER,
                borderRadius: 12, padding: "18px 24px",
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
                  <FontAwesomeIcon icon={faCircleNotch} style={{ color: "#fbbf24", fontSize: 14 }} />
                  <span style={{ fontSize: 14, fontWeight: 700, color: TEXT.strong }}>Đang chờ xét duyệt</span>
                  <span style={{
                    fontSize: 10, fontWeight: 700, borderRadius: 9999,
                    padding: "2px 10px", background: "#fbbf2422", color: "#fbbf24",
                  }}>PENDING</span>
                </div>
                <div style={{ fontSize: 12, color: TEXT.secondary, marginBottom: 14 }}>
                  Tên nghệ sĩ: <strong style={{ color: TEXT.strong }}>{upgradeReq.artistName}</strong> · {upgradeReq.genre}
                </div>
                <div style={{ fontSize: 11, color: TEXT.tertiary, marginBottom: 14 }}>
                  Gửi lúc {new Date(upgradeReq.requestedAt).toLocaleDateString("vi-VN", { day: "2-digit", month: "long", year: "numeric" })}
                </div>
                <button
                  onClick={handleWithdraw}
                  style={{
                    background: "transparent", border: "1px solid " + BORDER,
                    color: TEXT.secondary, borderRadius: 9999,
                    padding: "6px 16px", fontSize: 12, fontWeight: 600,
                    cursor: "pointer",
                  }}
                >
                  Rút yêu cầu
                </button>
              </div>
            )}

            {/* State 3: Cần bổ sung thông tin */}
            {upgradeReq?.status === "info_requested" && (
              <div style={{
                background: BG.card, borderRadius: 12,
                border: "1px solid #f59e0b44",
                overflow: "hidden",
              }}>
                <div style={{
                  background: "#f59e0b18", padding: "12px 20px",
                  display: "flex", alignItems: "center", gap: 10,
                }}>
                  <FontAwesomeIcon icon={faTriangleExclamation} style={{ color: "#f59e0b", fontSize: 13 }} />
                  <span style={{ fontSize: 13, fontWeight: 700, color: "#f59e0b" }}>Admin cần thêm thông tin</span>
                </div>
                <div style={{ padding: "16px 20px" }}>
                  <div style={{
                    fontSize: 13, color: TEXT.strong, lineHeight: 1.6,
                    marginBottom: 14,
                    padding: "10px 14px", borderRadius: 8, background: "var(--overlay-1)",
                    border: "1px solid " + BORDER,
                  }}>
                    {upgradeReq.adminNote}
                  </div>
                  {replySent || upgradeReq.listenerReply ? (
                    <div style={{ fontSize: 12, color: "#34d399" }}>
                      Phản hồi của bạn đã được gửi. Đang chờ admin xét duyệt lại.
                    </div>
                  ) : (
                    <>
                      <textarea
                        value={infoReply}
                        onChange={(e) => setInfoReply(e.target.value)}
                        placeholder="Nhập phản hồi của bạn..."
                        rows={3}
                        style={{
                          width: "100%", boxSizing: "border-box",
                          padding: "10px 14px", borderRadius: 8,
                          background: "var(--overlay-1)", border: "1px solid " + BORDER,
                          color: TEXT.strong, fontSize: 13, resize: "vertical",
                          outline: "none", fontFamily: "inherit",
                        }}
                      />
                      <button
                        onClick={handleReply}
                        disabled={!infoReply.trim()}
                        style={{
                          marginTop: 10,
                          background: `linear-gradient(90deg, ${C[600]}, ${C[500]})`,
                          color: "#fff", border: "none", borderRadius: 9999,
                          padding: "7px 20px", fontSize: 12, fontWeight: 700,
                          cursor: infoReply.trim() ? "pointer" : "not-allowed",
                          opacity: infoReply.trim() ? 1 : 0.45,
                          display: "flex", alignItems: "center", gap: 6,
                        }}
                      >
                        <FontAwesomeIcon icon={faReply} style={{ fontSize: 10 }} />
                        Gửi phản hồi
                      </button>
                    </>
                  )}
                </div>
              </div>
            )}

            {/* State 4: Bị từ chối */}
            {upgradeReq?.status === "rejected" && (
              <div style={{
                background: BG.card, borderRadius: 12,
                border: "1px solid #ef444444", overflow: "hidden",
              }}>
                <div style={{
                  background: "#ef444418", padding: "12px 20px",
                  display: "flex", alignItems: "center", gap: 10,
                }}>
                  <FontAwesomeIcon icon={faXmarkCircle} style={{ color: "#ef4444", fontSize: 13 }} />
                  <span style={{ fontSize: 13, fontWeight: 700, color: "#ef4444" }}>Chưa được duyệt</span>
                </div>
                <div style={{ padding: "14px 20px" }}>
                  {upgradeReq.rejectReason && (
                    <div style={{ fontSize: 13, color: TEXT.secondary, marginBottom: 14, lineHeight: 1.6 }}>
                      Lý do: {upgradeReq.rejectReason}
                    </div>
                  )}
                  <button
                    onClick={() => onOpenArtistUpgrade?.({ ...upgradeReq })}
                    style={{
                      background: `linear-gradient(90deg, ${C[600]}, ${C[500]})`,
                      color: "#fff", border: "none", borderRadius: 9999,
                      padding: "7px 20px", fontSize: 12, fontWeight: 700,
                      cursor: "pointer",
                    }}
                  >
                    Gửi lại đơn
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {stats.topGenres.length > 0 && (
          <div style={{ marginBottom: 32 }}>
            <SectionTitle>Thể loại yêu thích</SectionTitle>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {stats.topGenres.map(genre => (
                <span
                  key={genre}
                  style={{
                    borderRadius: 9999,
                    padding: "6px 16px",
                    background: "var(--overlay-1)",
                    border: `1px solid ${BORDER}`,
                    fontSize: 13,
                    color: TEXT.mid,
                    transition: "background 0.15s",
                  }}
                  onMouseEnter={e => { e.currentTarget.style.background = "var(--overlay-2)"; }}
                  onMouseLeave={e => { e.currentTarget.style.background = "var(--overlay-1)"; }}
                >
                  {genre}
                </span>
              ))}
            </div>
          </div>
        )}

        {stats.topArtists.length > 0 && (
          <div style={{ marginBottom: 32 }}>
            <SectionTitle>Nghệ sĩ yêu thích</SectionTitle>
            {stats.topArtists.map(artist => (
              <div
                key={artist}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  padding: "10px 12px",
                  borderRadius: 8,
                  transition: "background 0.15s",
                }}
                onMouseEnter={e => { e.currentTarget.style.background = "var(--overlay-1)"; }}
                onMouseLeave={e => { e.currentTarget.style.background = "transparent"; }}
              >
                <div
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: "50%",
                    background: "var(--overlay-2)",
                    color: TEXT.mid,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  <FontAwesomeIcon icon={faMicrophone} style={{ fontSize: 14 }} />
                </div>
                <div style={{ fontSize: 14, fontWeight: 600, color: TEXT.strong }}>{artist}</div>
              </div>
            ))}
          </div>
        )}


        {recentSongs.length > 0 && (
          <div style={{ marginBottom: 32 }}>
            <SectionTitle>Nghe gần đây</SectionTitle>
            {recentSongs.slice(0, 6).map((song, i) => {
              const active = cur?.id === song.id;
              return (
                <div
                  key={song.id}
                  onClick={() => onPlay(song)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    padding: "8px 12px",
                    borderRadius: 8,
                    cursor: "pointer",
                    transition: "background 0.15s",
                  }}
                  onMouseEnter={e => { e.currentTarget.style.background = "var(--overlay-1)"; }}
                  onMouseLeave={e => { e.currentTarget.style.background = "transparent"; }}
                >
                  <span
                    style={{
                      width: 18,
                      fontSize: 13,
                      color: active ? C[500] : TEXT.tertiary,
                      flexShrink: 0,
                    }}
                  >
                    {i + 1}
                  </span>
                  {song.cover ? (
                    <img
                      src={song.cover}
                      alt={song.title}
                      style={{ width: 40, height: 40, borderRadius: 4, objectFit: "cover", flexShrink: 0 }}
                    />
                  ) : (
                    <div
                      style={{
                        width: 40,
                        height: 40,
                        borderRadius: 4,
                        background: song.bg || "var(--overlay-2)",
                        color: "#fff",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                      }}
                    >
                      <FontAwesomeIcon icon={faMusic} style={{ fontSize: 13 }} />
                    </div>
                  )}
                  <div style={{ minWidth: 0 }}>
                    <div
                      style={{
                        fontSize: 13,
                        fontWeight: 600,
                        color: active ? C[500] : TEXT.strong,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {song.title}
                    </div>
                    <div style={{ fontSize: 11, color: TEXT.secondary }}>{song.artist}</div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
