import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faUsers,
  faCrown,
  faMusic,
  faHeadphones,
  faCompactDisc,
  faListCheck,
} from "@fortawesome/free-solid-svg-icons";
import { C, BG, TEXT, BORDER } from "../../constants/theme";
import users from "../../data/users";
import { StatCard } from "../../components/console/ConsoleUi";

export default function AdminDashboard({ songs, pendingCount = 0, allUsers }) {
  const activeUsers = (allUsers ?? users).filter((u) => !u.deleted);
  const listeners = activeUsers.filter((u) => u.role === "listener");
  const premiumCount = activeUsers.filter((u) => u.plan === "premium").length;

  const statCards = [
    { number: activeUsers.length, label: "Người dùng", icon: faUsers, accent: C[500] },
    { number: premiumCount, label: "Premium", icon: faCrown, accent: "#fbbf24" },
    { number: songs.length, label: "Bài hát", icon: faMusic, accent: "#60a5fa" },
    { number: listeners.length, label: "Listeners", icon: faHeadphones, accent: "#34d399" },
    { number: pendingCount, label: "Chờ duyệt", icon: faListCheck, accent: "#fbbf24" },
  ];

  const recentUsers = [...users]
    .sort((a, b) => new Date(b.joinedAt) - new Date(a.joinedAt))
    .slice(0, 3);

  return (
    <div>
      <div style={{ display: "flex", gap: 14, flexWrap: "wrap", marginBottom: 20 }}>
        {statCards.map((card) => (
          <StatCard key={card.label} {...card} />
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
