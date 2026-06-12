import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faMusic,
  faClock,
  faCircleXmark,
  faUsers,
  faHeadphones,
  faCircleCheck,
} from "@fortawesome/free-solid-svg-icons";
import { C, BG, TEXT, BORDER } from "../../constants/theme";
import { StatusBadge } from "../../components/console/ConsoleUi";
import { TrendBarChart, ProgressBar, TrendChip } from "../../components/console/Charts";
import { getArtistAnalytics, weeklyTrend, formatCompact } from "../../lib/artistStats";

function InsightCard({ icon, accent, number, label, trend, stagger = 0 }) {
  return (
    <div
      className="studio-card"
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "translateY(-2px)";
        e.currentTarget.style.boxShadow = "var(--shadow-card)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "translateY(0)";
        e.currentTarget.style.boxShadow = "none";
      }}
      style={{
        background: BG.card,
        border: "1px solid " + BORDER,
        borderRadius: 10,
        padding: "16px 18px",
        flex: 1,
        minWidth: 150,
        transition: "all 0.15s",
        boxSizing: "border-box",
        "--stagger": stagger,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div
          style={{
            width: 34,
            height: 34,
            borderRadius: 8,
            background: accent + "22",
            color: accent,
            fontSize: 14,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <FontAwesomeIcon icon={icon} />
        </div>
        {trend != null && <TrendChip pct={trend} />}
      </div>
      <div style={{ fontSize: 26, fontWeight: 700, color: TEXT.strong, marginTop: 12 }}>
        {number}
      </div>
      <div style={{ fontSize: 12, color: TEXT.secondary, marginTop: 2 }}>{label}</div>
    </div>
  );
}

export default function StudioOverview({ authUser, mySubs, onGoSubmit }) {
  const analytics = getArtistAnalytics(authUser?.email ?? "", mySubs);
  const trend = weeklyTrend(analytics.dailyPlays);

  const approved = mySubs.filter((s) => s.status === "approved");
  const pending = mySubs.filter((s) => s.status === "pending").length;
  const rejected = mySubs.filter((s) => s.status === "rejected").length;

  const topSongs = approved
    .map((s) => ({ ...s, plays: analytics.songStats[s.id]?.plays ?? 0 }))
    .sort((a, b) => b.plays - a.plays)
    .slice(0, 3);
  const maxPlays = Math.max(...topSongs.map((s) => s.plays), 1);

  const recent = [...mySubs]
    .sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt))
    .slice(0, 4);

  return (
    <div>
      {/* Hero */}
      <div
        className="studio-card"
        style={{
          background: `linear-gradient(135deg, ${authUser?.color ?? C[500]}3d 0%, ${authUser?.color ?? C[500]}14 55%, transparent 100%)`,
          border: "1px solid " + BORDER,
          borderRadius: 12,
          padding: "22px 24px",
          display: "flex",
          alignItems: "center",
          gap: 18,
          marginBottom: 20,
          flexWrap: "wrap",
        }}
      >
        <div
          style={{
            width: 64,
            height: 64,
            borderRadius: "50%",
            background: authUser?.color ?? C[500],
            color: "#fff",
            fontSize: 24,
            fontWeight: 800,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
            boxShadow: `0 6px 20px ${authUser?.color ?? C[500]}55`,
          }}
        >
          {authUser?.initial}
        </div>
        <div style={{ flex: 1, minWidth: 200 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
            <span style={{ fontSize: 20, fontWeight: 800, color: TEXT.strong }}>
              Chào, {authUser?.name}!
            </span>
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 4,
                borderRadius: 9999,
                padding: "2px 9px",
                fontSize: 10,
                fontWeight: 700,
                color: "#60a5fa",
                background: "rgba(96,165,250,0.12)",
                border: "1px solid rgba(96,165,250,0.3)",
              }}
            >
              <FontAwesomeIcon icon={faCircleCheck} style={{ fontSize: 9 }} />
              Nghệ sĩ Melodies
            </span>
          </div>
          <div style={{ fontSize: 12, color: TEXT.secondary, marginTop: 4 }}>
            Đây là bức tranh tổng quan về âm nhạc của bạn trong 28 ngày qua.
          </div>
        </div>
        <div style={{ display: "flex", gap: 24, flexShrink: 0 }}>
          <div>
            <div style={{ fontSize: 20, fontWeight: 800, color: TEXT.strong }}>
              {formatCompact(analytics.followers)}
            </div>
            <div style={{ fontSize: 11, color: TEXT.secondary }}>Người theo dõi</div>
          </div>
          <div>
            <div style={{ fontSize: 20, fontWeight: 800, color: TEXT.strong }}>
              {formatCompact(analytics.monthlyListeners)}
            </div>
            <div style={{ fontSize: 11, color: TEXT.secondary }}>Người nghe hàng tháng</div>
          </div>
        </div>
      </div>

      {/* Insight cards */}
      <div style={{ display: "flex", gap: 14, flexWrap: "wrap", marginBottom: 20 }}>
        <InsightCard
          icon={faHeadphones}
          accent={C[500]}
          number={formatCompact(trend.last7)}
          label="Lượt nghe 7 ngày"
          trend={trend.pct}
          stagger={0}
        />
        <InsightCard
          icon={faUsers}
          accent="#60a5fa"
          number={formatCompact(analytics.followers)}
          label="Người theo dõi"
          stagger={1}
        />
        <InsightCard icon={faMusic} accent="#34d399" number={approved.length} label="Đã phát hành" stagger={2} />
        <InsightCard icon={faClock} accent="#fbbf24" number={pending} label="Chờ duyệt" stagger={3} />
        <InsightCard icon={faCircleXmark} accent="#fb7185" number={rejected} label="Từ chối" stagger={4} />
      </div>

      {/* Chart */}
      <div
        className="studio-card"
        style={{
          background: BG.card,
          border: "1px solid " + BORDER,
          borderRadius: 10,
          padding: 18,
          marginBottom: 20,
          "--stagger": 5,
        }}
      >
        <div style={{ fontSize: 13, fontWeight: 700, color: TEXT.mid, marginBottom: 4 }}>
          Lượt nghe 14 ngày qua
        </div>
        <TrendBarChart points={analytics.dailyPlays.slice(-14)} height={120} accent={C[500]} />
      </div>

      {/* Two columns */}
      <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
        <div
          className="studio-card"
          style={{
            flex: 1,
            minWidth: 280,
            background: BG.card,
            border: "1px solid " + BORDER,
            borderRadius: 10,
            padding: 18,
            "--stagger": 6,
          }}
        >
          <div style={{ fontSize: 13, fontWeight: 700, color: TEXT.mid, marginBottom: 12 }}>
            Top bài hát
          </div>
          {topSongs.length === 0 && (
            <div style={{ fontSize: 12, color: TEXT.tertiary }}>
              Chưa có bài hát phát hành — bài được duyệt sẽ hiện thống kê ở đây.
            </div>
          )}
          {topSongs.map((s, i) => (
            <div key={s.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "8px 0" }}>
              <div style={{ width: 16, fontSize: 13, fontWeight: 700, color: i === 0 ? C[400] : TEXT.tertiary }}>
                {i + 1}
              </div>
              <div style={{ width: 36, height: 36, borderRadius: 6, background: s.bg, flexShrink: 0 }} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div
                  style={{
                    fontSize: 13,
                    fontWeight: 600,
                    color: TEXT.strong,
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    marginBottom: 5,
                  }}
                >
                  {s.title}
                </div>
                <ProgressBar pct={(s.plays / maxPlays) * 100} color={C[500]} height={5} />
              </div>
              <div style={{ fontSize: 12, fontWeight: 600, color: TEXT.secondary, flexShrink: 0 }}>
                {formatCompact(s.plays)}
              </div>
            </div>
          ))}
        </div>

        <div
          className="studio-card"
          style={{
            flex: 1,
            minWidth: 280,
            background: BG.card,
            border: "1px solid " + BORDER,
            borderRadius: 10,
            padding: 18,
            "--stagger": 7,
          }}
        >
          <div style={{ fontSize: 13, fontWeight: 700, color: TEXT.mid, marginBottom: 12 }}>
            Hoạt động gần đây
          </div>
          {recent.length === 0 && (
            <div
              style={{
                fontSize: 12,
                color: TEXT.tertiary,
                display: "flex",
                flexDirection: "column",
                gap: 10,
                alignItems: "flex-start",
              }}
            >
              Chưa có bài hát nào — hãy đăng bài đầu tiên!
              <button
                onClick={onGoSubmit}
                style={{
                  background: `linear-gradient(90deg, ${C[600]}, ${C[500]})`,
                  color: "#fff",
                  border: "none",
                  borderRadius: 9999,
                  padding: "7px 18px",
                  fontSize: 12,
                  fontWeight: 700,
                  cursor: "pointer",
                }}
              >
                Đăng bài mới
              </button>
            </div>
          )}
          {recent.map((sub) => (
            <div key={sub.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "7px 0" }}>
              <div style={{ width: 32, height: 32, borderRadius: 6, background: sub.bg, flexShrink: 0 }} />
              <div
                style={{
                  flex: 1,
                  minWidth: 0,
                  fontSize: 13,
                  fontWeight: 600,
                  color: TEXT.strong,
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                {sub.title}
              </div>
              <StatusBadge status={sub.status} />
              <div style={{ fontSize: 11, color: TEXT.tertiary, flexShrink: 0, width: 64, textAlign: "right" }}>
                {new Date(sub.submittedAt).toLocaleDateString("vi-VN", { day: "numeric", month: "numeric" })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
