import { useState, useEffect } from "react";
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
  useEffect(() => { getDailyTotals().then(setDailyTotals).catch(() => {}); }, []);

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

  const recentAudit = loadAuditLog().slice(0, 5);

  return (
    <motion.div variants={staggerContainer} initial="initial" animate="animate">
      <motion.div variants={staggerContainer} style={{ display: "flex", gap: 14, flexWrap: "wrap", marginBottom: 20 }}>
        {statCards.map((card) => (
          <motion.div key={card.label} variants={cardVariants} style={{ flex: 1, minWidth: 150, display: "flex" }}>
            <StatCard {...card} />
          </motion.div>
        ))}
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
        {recentAudit.length === 0 && (
          <div style={{ fontSize: 12, color: TEXT.tertiary }}>Chưa có hoạt động</div>
        )}
        {recentAudit.map((e) => (
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
        <Sparkline data={dailyTotals.map((d) => d.plays)} color={C[500]} />
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
