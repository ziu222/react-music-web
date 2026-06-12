import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faUserCircle,
  faCrown,
  faMusic,
  faClock,
  faHeart,
  faMicrophone,
} from "@fortawesome/free-solid-svg-icons";
import { C, G, BORDER, BG, TEXT } from "../constants/theme";
import { listenerStats } from "../data/listenerStats";

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
}) {
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
            {isPremium ? (
              <span
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 5,
                  borderRadius: 9999,
                  padding: "3px 12px",
                  fontSize: 11,
                  fontWeight: 700,
                  background: `linear-gradient(90deg, ${C[600]}, ${G[500]})`,
                  color: "#fff",
                }}
              >
                <FontAwesomeIcon icon={faCrown} style={{ fontSize: 10 }} />
                Premium
              </span>
            ) : (
              <span
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  borderRadius: 9999,
                  padding: "3px 12px",
                  fontSize: 11,
                  fontWeight: 700,
                  border: `1px solid ${BORDER}`,
                  color: TEXT.secondary,
                }}
              >
                Free
              </span>
            )}
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
