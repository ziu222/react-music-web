import { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faUsers,
  faCrown,
  faMusic,
  faHeadphones,
  faListCheck,
  faMicrophoneLines,
} from "@fortawesome/free-solid-svg-icons";
import { C, BG, TEXT, BORDER } from "../../constants/theme";
import { StatCard, ActionChip } from "../../components/console/ConsoleUi";
import { Sparkline, MiniBars } from "../../components/ui/Charts";
import { staggerContainer, cardVariants } from "../../lib/ui/consoleMotion";
import { loadAuditLog, ACTION_LABELS } from "../../lib/user/auditLog";
import { getDailyTotals } from "../../lib/music/playSnapshots";
import { formatNotificationTime } from "../../lib/social/notifications";
import { actionColor } from "./AdminAudit";
import { getPendingRequests } from "../../lib/artist/upgradeRequests";
import { getDashboardStats, formatVnd } from "../../data/dashboardStats";
import Skeleton from "../../components/ui/skeleton/Skeleton";
import PanelSkeleton from "../../components/ui/skeleton/PanelSkeleton";
import useDelayedVisible from "../../hooks/useDelayedVisible";

function compactNum(n) {
  if (n >= 1e9) return (n / 1e9).toFixed(1) + "B";
  if (n >= 1e6) return (n / 1e6).toFixed(1) + "M";
  if (n >= 1e3) return (n / 1e3).toFixed(1) + "K";
  return String(n ?? 0);
}

export default function AdminDashboard({ songs, pendingCount = 0, allUsers, onNavigateUsers }) {
  const activeUsers = (allUsers ?? []).filter((u) => !u.deleted);
  const listeners = activeUsers.filter((u) => u.role === "listener");
  const premiumCount = activeUsers.filter((u) => u.plan === "premium").length;
  const upgradeRequestCount = getPendingRequests().length;

  const [dailyTotals, setDailyTotals] = useState([]);
  const [loadingTotals, setLoadingTotals] = useState(true);
  useEffect(() => {
    getDailyTotals().then(setDailyTotals).catch(() => {}).finally(() => setLoadingTotals(false));
  }, []);

  // Phân bố thể loại (theo số bài)
  const genreBars = (() => {
    const map = new Map();
    (songs ?? []).forEach((s) => map.set(s.genre || "Khác", (map.get(s.genre || "Khác") ?? 0) + 1));
    return [...map.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6)
      .map(([label, value]) => ({ label, value, display: value + " bài" }));
  })();

  // Top bài hát theo lượt nghe
  const topSongs = [...(songs ?? [])]
    .sort((a, b) => (b.plays ?? 0) - (a.plays ?? 0))
    .slice(0, 5)
    .map((s, i) => ({ label: s.title, value: s.plays ?? 0, display: compactNum(s.plays), highlight: i === 0 }));

  // Stat ảo (deterministic theo ngày) — lai số thật để vẽ biểu đồ xu hướng
  const stats = useMemo(
    () =>
      getDashboardStats({
        totalUsers: activeUsers.length,
        activeUsers: activeUsers.length,
        premiumCount,
        totalPlays: (songs ?? []).reduce((s, sg) => s + (sg.plays ?? 0), 0),
        songCount: (songs ?? []).length,
      }),
    [activeUsers.length, premiumCount, songs],
  );

  const statCards = [
    { number: activeUsers.length, label: "Người dùng", icon: faUsers, accent: C[500] },
    { number: premiumCount, label: "Premium", icon: faCrown, accent: "#fbbf24" },
    { number: songs.length, label: "Bài hát", icon: faMusic, accent: "#60a5fa" },
    { number: listeners.length, label: "Listeners", icon: faHeadphones, accent: "#34d399" },
    { number: pendingCount, label: "Chờ duyệt", icon: faListCheck, accent: "#fbbf24" },
  ];

  const recentUsers = [...(allUsers ?? [])]
    .sort((a, b) => new Date(b.joinedAt) - new Date(a.joinedAt))
    .slice(0, 3);

  const [recentAudit, setRecentAudit] = useState([]);
  const [loadingAudit, setLoadingAudit] = useState(true);
  useEffect(() => {
    loadAuditLog().then(data => { setRecentAudit(data.slice(0, 5)); setLoadingAudit(false); });
  }, []);

  const showTotalsSkeleton = useDelayedVisible(loadingTotals);
  const showAuditSkeleton = useDelayedVisible(loadingAudit);

  return (
    <motion.div variants={staggerContainer} initial="initial" animate="animate">
      <motion.div variants={staggerContainer} style={{ display: "flex", gap: 14, flexWrap: "wrap", marginBottom: 20 }}>
        {statCards.map((card) => (
          <motion.div key={card.label} variants={cardVariants} style={{ flex: 1, minWidth: 150, display: "flex" }}>
            <StatCard {...card} />
          </motion.div>
        ))}
      </motion.div>

      {/* KPI strip — 5 chỉ số ảo kèm delta so với 7 ngày trước */}
      <motion.div variants={staggerContainer} style={{ display: "flex", gap: 14, flexWrap: "wrap", marginBottom: 20 }}>
        {stats.kpis.map((kpi) => {
          const up = kpi.trend === "up";
          const deltaColor = up ? "#34d399" : "#fb7185"; // xanh tăng / đỏ giảm
          return (
            <motion.div
              key={kpi.key}
              variants={cardVariants}
              style={{
                flex: 1,
                minWidth: 180,
                background: BG.card,
                border: "1px solid " + BORDER,
                borderRadius: 10,
                padding: "14px 16px",
              }}
            >
              <div style={{ fontSize: 11, color: TEXT.tertiary, marginBottom: 6 }}>{kpi.label}</div>
              <div style={{ fontSize: 22, fontWeight: 800, color: TEXT.strong, lineHeight: 1.1 }}>
                {kpi.valueLabel ?? compactNum(kpi.value)}
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 8 }}>
                <span
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 3,
                    fontSize: 11,
                    fontWeight: 700,
                    color: deltaColor,
                    background: deltaColor + "1f",
                    borderRadius: 9999,
                    padding: "2px 7px",
                  }}
                >
                  {/* mũi tên ký tự, không dùng icon lucide */}
                  <span style={{ fontSize: 10 }}>{up ? "▲" : "▼"}</span>
                  {Math.abs(kpi.deltaPct)}%
                </span>
                <span style={{ fontSize: 11, color: TEXT.tertiary }}>so với 7 ngày trước</span>
              </div>
            </motion.div>
          );
        })}
      </motion.div>

      {/* Xu hướng 30 ngày — lưới small-multiples 4 ô */}
      <motion.div
        variants={cardVariants}
        style={{
          background: BG.card,
          border: "1px solid " + BORDER,
          borderRadius: 10,
          padding: 18,
          marginBottom: 20,
        }}
      >
        <div style={{ fontSize: 13, fontWeight: 700, color: TEXT.mid, marginBottom: 14 }}>
          Xu hướng 30 ngày
        </div>
        <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
          {[
            { key: "dau", title: "Người nghe", data: stats.series.dau, color: C[500], display: compactNum(stats.series.dau[stats.series.dau.length - 1]) },
            { key: "signups", title: "Đăng ký mới", data: stats.series.signups, color: "#60a5fa", display: compactNum(stats.series.signups[stats.series.signups.length - 1]) },
            { key: "revenue", title: "Doanh thu", data: stats.series.revenue, color: "#fbbf24", display: formatVnd(stats.series.revenue[stats.series.revenue.length - 1]) },
            { key: "conversions", title: "Nâng Premium", data: stats.series.conversions, color: "#34d399", display: compactNum(stats.series.conversions[stats.series.conversions.length - 1]) },
          ].map((cell) => (
            <div key={cell.key} style={{ flex: 1, minWidth: 260 }}>
              <div style={{ fontSize: 12, color: TEXT.secondary, marginBottom: 2 }}>{cell.title}</div>
              <div style={{ fontSize: 18, fontWeight: 700, color: TEXT.strong, marginBottom: 6 }}>{cell.display}</div>
              <Sparkline data={cell.data} color={cell.color} height={70} />
            </div>
          ))}
        </div>
      </motion.div>

      {upgradeRequestCount > 0 && (
        <motion.div
          variants={cardVariants}
          onClick={onNavigateUsers}
          style={{
            background: `${C[500]}12`, border: `1px solid ${C[500]}44`,
            borderRadius: 10, padding: "14px 18px", marginBottom: 20,
            display: "flex", alignItems: "center", gap: 12,
            cursor: onNavigateUsers ? "pointer" : "default",
          }}
        >
          <div style={{
            width: 36, height: 36, borderRadius: 8,
            background: `${C[500]}22`, flexShrink: 0,
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <FontAwesomeIcon icon={faMicrophoneLines} style={{ color: C[400], fontSize: 15 }} />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: TEXT.strong }}>
              Đơn đăng ký Nghệ sĩ
            </div>
            <div style={{ fontSize: 12, color: TEXT.secondary, marginTop: 2 }}>
              {upgradeRequestCount} đơn đang chờ xét duyệt
            </div>
          </div>
          <div style={{
            background: "#ef4444", color: "#fff", borderRadius: 9999,
            minWidth: 22, height: 22, display: "flex", alignItems: "center",
            justifyContent: "center", fontSize: 11, fontWeight: 800, padding: "0 6px",
          }}>
            {upgradeRequestCount}
          </div>
        </motion.div>
      )}

      <motion.div
        variants={cardVariants}
        style={{
          background: BG.card,
          border: "1px solid " + BORDER,
          borderRadius: 10,
          padding: 18,
          marginBottom: 20,
        }}
      >
        <div style={{ fontSize: 13, fontWeight: 700, color: TEXT.mid, marginBottom: 12 }}>
          Người dùng mới nhất
        </div>
        {recentUsers.map((user) => (
          <div
            key={user.id}
            style={{ display: "flex", alignItems: "center", gap: 10, padding: "7px 0" }}
          >
            <div
              style={{
                width: 30,
                height: 30,
                borderRadius: "50%",
                background: user.color,
                color: "#fff",
                fontSize: 11,
                fontWeight: 700,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              {user.initial}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div
                style={{
                  fontSize: 13,
                  color: TEXT.strong,
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                {user.name}
              </div>
              <div
                style={{
                  fontSize: 11,
                  color: TEXT.tertiary,
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                {user.email}
              </div>
            </div>
            <div style={{ fontSize: 11, color: TEXT.tertiary, flexShrink: 0 }}>
              {new Date(user.joinedAt).toLocaleDateString("vi-VN")}
            </div>
          </div>
        ))}
      </motion.div>

      <motion.div
        variants={cardVariants}
        style={{
          background: BG.card,
          border: "1px solid " + BORDER,
          borderRadius: 10,
          padding: 18,
          marginBottom: 20,
        }}
      >
        <div style={{ fontSize: 13, fontWeight: 700, color: TEXT.mid, marginBottom: 12 }}>
          Hoạt động quản trị gần đây
        </div>
        {showAuditSkeleton && <PanelSkeleton lines={5} compact />}
        {!loadingAudit && recentAudit.length === 0 && (
          <div style={{ fontSize: 12, color: TEXT.tertiary }}>Chưa có hoạt động</div>
        )}
        {!loadingAudit && recentAudit.map((e) => (
          <div
            key={e.id}
            style={{ display: "flex", alignItems: "center", gap: 10, padding: "6px 0" }}
          >
            <ActionChip color={actionColor(e.action)} label={ACTION_LABELS[e.action] ?? e.action} />
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
              {e.target}
            </div>
            <div style={{ fontSize: 11, color: TEXT.tertiary, flexShrink: 0 }}>
              {formatNotificationTime(e.time)}
            </div>
          </div>
        ))}
      </motion.div>

      <motion.div variants={cardVariants} style={{ background: BG.card, border: "1px solid " + BORDER, borderRadius: 10, padding: 18, marginBottom: 20 }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: TEXT.mid, marginBottom: 12 }}>
          Xu hướng lượt nghe (toàn hệ thống)
        </div>
        {showTotalsSkeleton ? (
          <Skeleton height={70} radius={6} />
        ) : (
          <Sparkline data={dailyTotals.map((d) => d.plays)} color={C[500]} />
        )}
      </motion.div>

      <motion.div variants={cardVariants} style={{ display: "flex", gap: 16, flexWrap: "wrap", marginBottom: 20 }}>
        <div style={{ flex: 1, minWidth: 280, background: BG.card, border: "1px solid " + BORDER, borderRadius: 10, padding: 18 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: TEXT.mid, marginBottom: 14 }}>
            Top bài hát
          </div>
          <MiniBars items={topSongs} color={C[500]} />
        </div>
        <div style={{ flex: 1, minWidth: 280, background: BG.card, border: "1px solid " + BORDER, borderRadius: 10, padding: 18 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: TEXT.mid, marginBottom: 14 }}>
            Phân bố thể loại
          </div>
          <MiniBars items={genreBars} color="#60a5fa" />
        </div>
      </motion.div>
    </motion.div>
  );
}
