import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faHeadphones,
  faUsers,
  faHeart,
  faBookmark,
  faLocationDot,
  faChartSimple,
} from "@fortawesome/free-solid-svg-icons";
import { C, BG, TEXT, BORDER } from "../../constants/theme";
import { FilterPills } from "../../components/console/ConsoleUi";
import { TrendBarChart, ProgressBar } from "../../components/console/Charts";
import { getArtistAnalytics, formatCompact } from "../../lib/artistStats";

const PERIOD_PILLS = [
  { key: "7", label: "7 ngày" },
  { key: "14", label: "14 ngày" },
  { key: "28", label: "28 ngày" },
];

const SOURCE_COLORS = ["#f97316", "#60a5fa", "#a78bfa", "#34d399"];

function MiniStat({ icon, accent, number, label, stagger = 0 }) {
  return (
    <div
      className="studio-card"
      style={{
        background: BG.card,
        border: "1px solid " + BORDER,
        borderRadius: 10,
        padding: "14px 16px",
        flex: 1,
        minWidth: 140,
        display: "flex",
        alignItems: "center",
        gap: 12,
        boxSizing: "border-box",
        "--stagger": stagger,
      }}
    >
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
          flexShrink: 0,
        }}
      >
        <FontAwesomeIcon icon={icon} />
      </div>
      <div style={{ minWidth: 0 }}>
        <div style={{ fontSize: 20, fontWeight: 700, color: TEXT.strong, lineHeight: 1.2 }}>
          {number}
        </div>
        <div style={{ fontSize: 11, color: TEXT.secondary }}>{label}</div>
      </div>
    </div>
  );
}

function PanelCard({ title, children, stagger = 0 }) {
  return (
    <div
      className="studio-card"
      style={{
        flex: 1,
        minWidth: 280,
        background: BG.card,
        border: "1px solid " + BORDER,
        borderRadius: 10,
        padding: 18,
        boxSizing: "border-box",
        "--stagger": stagger,
      }}
    >
      <div style={{ fontSize: 13, fontWeight: 700, color: TEXT.mid, marginBottom: 14 }}>
        {title}
      </div>
      {children}
    </div>
  );
}

export default function StudioAnalytics({ authUser, mySubs }) {
  const [period, setPeriod] = useState("14");
  const analytics = getArtistAnalytics(authUser?.email ?? "", mySubs);

  const points = analytics.dailyPlays.slice(-Number(period));
  const totalPlays = points.reduce((s, d) => s + d.plays, 0);

  const approved = mySubs.filter((s) => s.status === "approved");
  const totalLikes = approved.reduce(
    (s, sub) => s + (analytics.songStats[sub.id]?.likes ?? 0),
    0
  );
  const totalSaves = approved.reduce(
    (s, sub) => s + (analytics.songStats[sub.id]?.saves ?? 0),
    0
  );

  const topSongs = approved
    .map((s) => ({ ...s, stats: analytics.songStats[s.id] ?? { plays: 0, likes: 0 } }))
    .sort((a, b) => b.stats.plays - a.stats.plays)
    .slice(0, 5);
  const maxPlays = Math.max(...topSongs.map((s) => s.stats.plays), 1);

  if (!approved.length && !mySubs.length) {
    return (
      <div
        style={{
          padding: "60px 24px",
          textAlign: "center",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 12,
        }}
      >
        <FontAwesomeIcon icon={faChartSimple} style={{ fontSize: 28, color: TEXT.tertiary }} />
        <div style={{ fontSize: 14, color: TEXT.secondary }}>
          Thống kê sẽ xuất hiện khi bạn có bài hát được phát hành.
        </div>
      </div>
    );
  }

  return (
    <div>
      <div
        style={{
          display: "flex",
          gap: 10,
          alignItems: "center",
          marginBottom: 16,
          flexWrap: "wrap",
        }}
      >
        <FilterPills options={PERIOD_PILLS} active={period} onSelect={setPeriod} />
      </div>

      <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 20 }}>
        <MiniStat
          icon={faHeadphones}
          accent={C[500]}
          number={formatCompact(totalPlays)}
          label={`Lượt nghe ${period} ngày`}
          stagger={0}
        />
        <MiniStat
          icon={faUsers}
          accent="#60a5fa"
          number={formatCompact(analytics.monthlyListeners)}
          label="Người nghe hàng tháng"
          stagger={1}
        />
        <MiniStat icon={faHeart} accent="#fb7185" number={formatCompact(totalLikes)} label="Lượt thích" stagger={2} />
        <MiniStat icon={faBookmark} accent="#34d399" number={formatCompact(totalSaves)} label="Lượt lưu" stagger={3} />
      </div>

      <div
        className="studio-card"
        style={{
          background: BG.card,
          border: "1px solid " + BORDER,
          borderRadius: 10,
          padding: 18,
          marginBottom: 20,
          "--stagger": 4,
        }}
      >
        <div style={{ fontSize: 13, fontWeight: 700, color: TEXT.mid, marginBottom: 4 }}>
          Lượt nghe theo ngày
        </div>
        <TrendBarChart points={points} height={160} accent={C[500]} />
      </div>

      <div style={{ display: "flex", gap: 14, flexWrap: "wrap", marginBottom: 14 }}>
        <PanelCard title="Top bài hát" stagger={5}>
          {topSongs.length === 0 && (
            <div style={{ fontSize: 12, color: TEXT.tertiary }}>Chưa có bài phát hành</div>
          )}
          {topSongs.map((s, i) => (
            <div key={s.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "7px 0" }}>
              <div style={{ width: 16, fontSize: 13, fontWeight: 700, color: i === 0 ? C[400] : TEXT.tertiary }}>
                {i + 1}
              </div>
              <div style={{ width: 32, height: 32, borderRadius: 6, background: s.bg, flexShrink: 0 }} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div
                  style={{
                    fontSize: 13,
                    fontWeight: 600,
                    color: TEXT.strong,
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    marginBottom: 4,
                  }}
                >
                  {s.title}
                </div>
                <ProgressBar pct={(s.stats.plays / maxPlays) * 100} color={C[500]} height={5} />
              </div>
              <div style={{ textAlign: "right", flexShrink: 0 }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: TEXT.strong }}>
                  {formatCompact(s.stats.plays)}
                </div>
                <div style={{ fontSize: 10, color: TEXT.tertiary }}>
                  {formatCompact(s.stats.likes)} thích
                </div>
              </div>
            </div>
          ))}
        </PanelCard>

        <PanelCard title="Nguồn nghe" stagger={6}>
          {analytics.sources.map((src, i) => (
            <div key={src.name} style={{ marginBottom: 12 }}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  fontSize: 12,
                  marginBottom: 5,
                }}
              >
                <span style={{ color: TEXT.strong, fontWeight: 600 }}>{src.name}</span>
                <span style={{ color: TEXT.secondary }}>{src.pct}%</span>
              </div>
              <ProgressBar pct={src.pct} color={SOURCE_COLORS[i % SOURCE_COLORS.length]} height={6} />
            </div>
          ))}
        </PanelCard>
      </div>

      <PanelCard title="Khu vực nghe nhiều nhất" stagger={7}>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {analytics.topLocations.map((loc) => (
            <div key={loc.name} style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <FontAwesomeIcon
                icon={faLocationDot}
                style={{ fontSize: 12, color: TEXT.tertiary, width: 14, flexShrink: 0 }}
              />
              <div style={{ width: 130, fontSize: 12, fontWeight: 600, color: TEXT.strong, flexShrink: 0 }}>
                {loc.name}
              </div>
              <div style={{ flex: 1 }}>
                <ProgressBar pct={loc.pct} color="#60a5fa" height={6} />
              </div>
              <div style={{ width: 36, fontSize: 12, color: TEXT.secondary, textAlign: "right", flexShrink: 0 }}>
                {loc.pct}%
              </div>
            </div>
          ))}
        </div>
      </PanelCard>
    </div>
  );
}
