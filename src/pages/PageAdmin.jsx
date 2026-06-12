import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faUsers,
  faMagnifyingGlass,
  faStar,
  faChevronRight,
  faShieldHalved,
  faCompactDisc,
  faChartPie,
  faCrown,
  faMusic,
  faHeadphones,
  faArrowLeft,
} from "@fortawesome/free-solid-svg-icons";
import { C, BG, TEXT, BORDER } from "../constants/theme";
import users from "../data/users";
import ListenerProfileModal from "../components/ListenerProfileModal";

export default function PageAdmin({ authUser, songs, onExit }) {
  const [adminTab, setAdminTab] = useState("dashboard");
  const [listenerSearch, setListenerSearch] = useState("");
  const [listenerFilter, setListenerFilter] = useState("all");
  const [selectedListener, setSelectedListener] = useState(null);

  const listeners = users.filter((u) => u.role === "listener");
  const totalUsers = users.length;
  const premiumCount = users.filter((u) => u.plan === "premium").length;
  const songCount = songs.length;

  const filteredListeners = listeners.filter((u) => {
    const q = listenerSearch.trim().toLowerCase();
    const matchSearch =
      !q ||
      u.name.toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q);
    const matchFilter = listenerFilter === "all" || u.plan === listenerFilter;
    return matchSearch && matchFilter;
  });

  const navItems = [
    { key: "dashboard", label: "Dashboard", icon: faChartPie },
    { key: "listeners", label: "Listeners", icon: faUsers },
  ];

  const statCards = [
    { number: totalUsers, label: "Người dùng", icon: faUsers, accent: C[500] },
    { number: premiumCount, label: "Premium", icon: faCrown, accent: "#fbbf24" },
    { number: songCount, label: "Bài hát", icon: faMusic, accent: "#60a5fa" },
    {
      number: listeners.length,
      label: "Listeners",
      icon: faHeadphones,
      accent: "#34d399",
    },
  ];

  const recentUsers = [...users]
    .sort((a, b) => new Date(b.joinedAt) - new Date(a.joinedAt))
    .slice(0, 3);

  const filterPills = [
    { key: "all", label: "Tất cả" },
    { key: "premium", label: "★ Premium" },
    { key: "free", label: "Free" },
  ];

  const headers = {
    dashboard: { title: "Dashboard", subtitle: "Tổng quan hệ thống Melodies" },
    listeners: { title: "Listeners", subtitle: "Quản lý người nghe" },
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "row",
        height: "100vh",
        background: "var(--bg-base)",
        color: "var(--text-primary)",
        fontFamily: "'Be Vietnam Pro', 'Noto Sans', sans-serif",
        overflow: "hidden",
      }}
    >
      {/* ── Admin sidebar ── */}
      <div
        style={{
          width: 230,
          flexShrink: 0,
          borderRight: "1px solid " + BORDER,
          display: "flex",
          flexDirection: "column",
          padding: "20px 14px",
          background: "var(--bg-card)",
          boxSizing: "border-box",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            marginBottom: 28,
            padding: "0 4px",
          }}
        >
          <FontAwesomeIcon
            icon={faShieldHalved}
            style={{ color: C[500], fontSize: 18 }}
          />
          <div style={{ fontSize: 15, fontWeight: 800, color: TEXT.strong }}>
            Melodies Admin
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          {navItems.map((item) => {
            const active = adminTab === item.key;
            return (
              <div
                key={item.key}
                onClick={() => setAdminTab(item.key)}
                onMouseEnter={(e) => {
                  if (!active)
                    e.currentTarget.style.background = "var(--overlay-1)";
                }}
                onMouseLeave={(e) => {
                  if (!active)
                    e.currentTarget.style.background = "transparent";
                }}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  padding: "10px 12px",
                  borderRadius: 8,
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: "pointer",
                  transition: "background 0.15s",
                  background: active ? "var(--overlay-2)" : "transparent",
                  color: active ? TEXT.strong : TEXT.secondary,
                  boxShadow: active ? `inset 3px 0 0 ${C[500]}` : "none",
                }}
              >
                <FontAwesomeIcon icon={item.icon} style={{ fontSize: 13 }} />
                {item.label}
              </div>
            );
          })}
        </div>

        <div style={{ flex: 1 }} />

        {authUser && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              marginBottom: 12,
              padding: "0 4px",
            }}
          >
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: "50%",
                background: authUser.color,
                color: "#fff",
                fontSize: 12,
                fontWeight: 700,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              {authUser.initial}
            </div>
            <div style={{ minWidth: 0 }}>
              <div
                style={{
                  fontSize: 12,
                  fontWeight: 600,
                  color: TEXT.strong,
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                {authUser.name}
              </div>
              <div style={{ fontSize: 10, color: TEXT.tertiary }}>
                Quản trị viên
              </div>
            </div>
          </div>
        )}

        <button
          onClick={onExit}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = TEXT.mid;
            e.currentTarget.style.color = TEXT.strong;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = BORDER;
            e.currentTarget.style.color = TEXT.mid;
          }}
          style={{
            width: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
            padding: "9px 12px",
            borderRadius: 9999,
            border: "1px solid " + BORDER,
            background: "transparent",
            color: TEXT.mid,
            fontSize: 12,
            fontWeight: 600,
            cursor: "pointer",
            transition: "all 0.15s",
          }}
        >
          <FontAwesomeIcon icon={faArrowLeft} style={{ fontSize: 11 }} />
          Quay lại Melodies
        </button>
      </div>

      {/* ── Main area ── */}
      <div
        style={{
          flex: 1,
          overflowY: "auto",
          padding: "28px 36px",
          boxSizing: "border-box",
        }}
      >
        <div
          style={{
            fontSize: 24,
            fontWeight: 800,
            color: TEXT.strong,
            marginBottom: 2,
          }}
        >
          {headers[adminTab].title}
        </div>
        <div style={{ fontSize: 13, color: TEXT.secondary, marginBottom: 24 }}>
          {headers[adminTab].subtitle}
        </div>

        {adminTab === "dashboard" && (
          <div>
            <div
              style={{
                display: "flex",
                gap: 14,
                flexWrap: "wrap",
                marginBottom: 20,
              }}
            >
              {statCards.map((card) => (
                <div
                  key={card.label}
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
                  }}
                >
                  <div
                    style={{
                      width: 34,
                      height: 34,
                      borderRadius: 8,
                      background: card.accent + "22",
                      color: card.accent,
                      fontSize: 14,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <FontAwesomeIcon icon={card.icon} />
                  </div>
                  <div
                    style={{
                      fontSize: 28,
                      fontWeight: 700,
                      color: TEXT.strong,
                      marginTop: 12,
                    }}
                  >
                    {card.number}
                  </div>
                  <div
                    style={{
                      fontSize: 12,
                      color: TEXT.secondary,
                      marginTop: 2,
                    }}
                  >
                    {card.label}
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
              <div
                style={{
                  fontSize: 13,
                  fontWeight: 700,
                  color: TEXT.mid,
                  marginBottom: 12,
                }}
              >
                Người dùng mới nhất
              </div>
              {recentUsers.map((user) => (
                <div
                  key={user.id}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    padding: "7px 0",
                  }}
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
                  <div
                    style={{
                      fontSize: 11,
                      color: TEXT.tertiary,
                      flexShrink: 0,
                    }}
                  >
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
              <FontAwesomeIcon
                icon={faCompactDisc}
                style={{ fontSize: 28, color: TEXT.tertiary }}
              />
              <div style={{ fontSize: 13, color: TEXT.tertiary }}>
                Biểu đồ hoạt động — sắp ra mắt
              </div>
            </div>
          </div>
        )}

        {adminTab === "listeners" && (
          <div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: 16,
              }}
            >
              <div
                style={{ fontSize: 14, fontWeight: 600, color: TEXT.mid }}
              >
                Listeners · {filteredListeners.length} người nghe
              </div>
              <div />
            </div>

            <div
              style={{
                display: "flex",
                gap: 10,
                marginBottom: 16,
                flexWrap: "wrap",
                alignItems: "center",
              }}
            >
              <div style={{ position: "relative" }}>
                <FontAwesomeIcon
                  icon={faMagnifyingGlass}
                  style={{
                    position: "absolute",
                    left: 10,
                    top: "50%",
                    transform: "translateY(-50%)",
                    color: TEXT.tertiary,
                    fontSize: 12,
                  }}
                />
                <input
                  value={listenerSearch}
                  onChange={(e) => setListenerSearch(e.target.value)}
                  placeholder="Tìm theo tên, email..."
                  style={{
                    background: BG.el,
                    border: "1px solid " + BORDER,
                    borderRadius: 6,
                    padding: "8px 12px 8px 34px",
                    fontSize: 13,
                    color: "var(--text-primary)",
                    outline: "none",
                    width: 240,
                    boxSizing: "border-box",
                  }}
                />
              </div>
              {filterPills.map((pill) => {
                const active = listenerFilter === pill.key;
                return (
                  <button
                    key={pill.key}
                    onClick={() => setListenerFilter(pill.key)}
                    style={{
                      background: active ? "var(--overlay-2)" : "transparent",
                      border: "1px solid " + BORDER,
                      color: active ? TEXT.strong : TEXT.secondary,
                      borderRadius: 9999,
                      padding: "5px 14px",
                      fontSize: 12,
                      fontWeight: 500,
                      cursor: "pointer",
                      transition: "all 0.15s",
                    }}
                  >
                    {pill.label}
                  </button>
                );
              })}
            </div>

            <div
              style={{
                display: "flex",
                padding: "8px 12px",
                marginBottom: 4,
                gap: 12,
                color: TEXT.tertiary,
                fontSize: 11,
                fontWeight: 600,
              }}
            >
              <div style={{ width: 36, flexShrink: 0 }} />
              <div style={{ flex: 1, minWidth: 100 }}>Tên</div>
              <div style={{ flex: 1.5, minWidth: 140 }}>Email</div>
              <div style={{ width: 90, flexShrink: 0 }}>Plan</div>
              <div style={{ width: 110, flexShrink: 0 }}>Ngày tham gia</div>
              <div style={{ width: 20, flexShrink: 0 }} />
            </div>

            {filteredListeners.map((user) => (
              <div
                key={user.id}
                onClick={() => setSelectedListener(user)}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "var(--overlay-1)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "transparent";
                }}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  padding: "10px 12px",
                  borderRadius: 8,
                  cursor: "pointer",
                  transition: "background 0.12s",
                }}
              >
                <div
                  style={{ position: "relative", flexShrink: 0 }}
                >
                  <div
                    style={{
                      width: 34,
                      height: 34,
                      borderRadius: "50%",
                      background: user.color,
                      color: "#fff",
                      fontSize: 12,
                      fontWeight: 700,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    {user.initial}
                  </div>
                  <div
                    style={{
                      position: "absolute",
                      bottom: 0,
                      right: 0,
                      width: 8,
                      height: 8,
                      borderRadius: "50%",
                      background: user.status === "new" ? C[500] : "#34d399",
                      border: "2px solid var(--bg-base)",
                    }}
                  />
                </div>
                <div
                  style={{
                    flex: 1,
                    minWidth: 100,
                    fontSize: 13,
                    fontWeight: 600,
                    color: TEXT.strong,
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                  }}
                >
                  {user.name}
                </div>
                <div
                  style={{
                    flex: 1.5,
                    minWidth: 140,
                    fontSize: 12,
                    color: TEXT.secondary,
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                  }}
                >
                  {user.email}
                </div>
                <div style={{ width: 90, flexShrink: 0 }}>
                  {user.plan === "premium" ? (
                    <span
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 3,
                        color: "#fbbf24",
                        fontSize: 12,
                        fontWeight: 600,
                      }}
                    >
                      <FontAwesomeIcon
                        icon={faStar}
                        style={{ fontSize: 9 }}
                      />
                      Premium
                    </span>
                  ) : (
                    <span style={{ fontSize: 12, color: TEXT.tertiary }}>
                      Free
                    </span>
                  )}
                </div>
                <div
                  style={{
                    width: 110,
                    flexShrink: 0,
                    fontSize: 11,
                    color: TEXT.tertiary,
                  }}
                >
                  {new Date(user.joinedAt).toLocaleDateString("vi-VN", {
                    year: "numeric",
                    month: "short",
                  })}
                </div>
                <div style={{ width: 20, flexShrink: 0 }}>
                  <FontAwesomeIcon
                    icon={faChevronRight}
                    style={{ fontSize: 10, color: TEXT.tertiary }}
                  />
                </div>
              </div>
            ))}

            {filteredListeners.length === 0 && (
              <div
                style={{
                  padding: 24,
                  textAlign: "center",
                  color: TEXT.tertiary,
                  fontSize: 13,
                }}
              >
                Không tìm thấy listener nào
              </div>
            )}
          </div>
        )}
      </div>

      <ListenerProfileModal
        user={selectedListener}
        onClose={() => setSelectedListener(null)}
      />
    </div>
  );
}
