import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faUsers,
  faCrown,
  faMusic,
  faHeadphones,
  faListCheck,
  faMicrophoneLines,
  faCompactDisc,
} from "@fortawesome/free-solid-svg-icons";
import { C, BG, TEXT, BORDER } from "../../constants/theme";
import { StatCard, ActionChip } from "../../components/console/ConsoleUi";
import { loadAuditLog, ACTION_LABELS } from "../../lib/user/auditLog";
import { formatNotificationTime } from "../../lib/social/notifications";
import { actionColor } from "./AdminAudit";
import { getPendingRequests } from "../../lib/artist/upgradeRequests";

export default function AdminDashboard({ songs, pendingCount = 0, allUsers, onNavigateUsers }) {
  const activeUsers = (allUsers ?? []).filter((u) => !u.deleted);
  const listeners = activeUsers.filter((u) => u.role === "listener");
  const premiumCount = activeUsers.filter((u) => u.plan === "premium").length;
  const upgradeRequestCount = getPendingRequests().length;

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
    <div>
      <div style={{ display: "flex", gap: 14, flexWrap: "wrap", marginBottom: 20 }}>
        {statCards.map((card) => (
          <StatCard key={card.label} {...card} />
        ))}
      </div>

      {upgradeRequestCount > 0 && (
        <div
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
        </div>
      )}

      <div
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
      </div>

      <div
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
      </div>

      <div
        style={{
          background: BG.el,
          borderRadius: 10,
          border: "1px solid " + BORDER,
          minHeight: 140,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexDirection: "column",
          gap: 8,
        }}
      >
        <FontAwesomeIcon icon={faCompactDisc} style={{ fontSize: 28, color: TEXT.tertiary }} />
        <div style={{ fontSize: 13, color: TEXT.tertiary }}>
          Biểu đồ hoạt động — sắp ra mắt
        </div>
      </div>
    </div>
  );
}
