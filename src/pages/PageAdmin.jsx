import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faUsers,
  faMagnifyingGlass,
  faStar,
  faChevronRight,
  faShieldHalved,
  faCompactDisc,
} from "@fortawesome/free-solid-svg-icons";
import { C, BG, TEXT, BORDER } from "../constants/theme";
import users from "../data/users";
import { listenerStats } from "../data/listenerStats";

export default function PageAdmin({ onOpenProfile, authUser, songs }) {
  const [adminTab, setAdminTab] = useState("dashboard");
  const [listenerSearch, setListenerSearch] = useState("");
  const [listenerFilter, setListenerFilter] = useState("all");

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

  const tabs = [
    { key: "dashboard", label: "Dashboard" },
    { key: "listeners", label: "Listeners" },
  ];

  const statCards = [
    { number: totalUsers, label: "Người dùng" },
    { number: premiumCount, label: "Premium" },
    { number: songCount, label: "Bài hát" },
  ];

  const filterPills = [
    { key: "all", label: "Tất cả" },
    { key: "premium", label: "★ Premium" },
    { key: "free", label: "Free" },
  ];

  return (
    <div
      style={{
        padding: "28px 32px",
        minHeight: "100%",
        boxSizing: "border-box",
        background: "var(--bg-base, #0f0c0c)",
      }}
    >
      <div
        style={{
          fontSize: 26,
          fontWeight: 800,
          color: TEXT.strong,
          marginBottom: 2,
        }}
      >
        Admin
      </div>
      <div
        style={{ fontSize: 13, color: TEXT.secondary, marginBottom: 20 }}
      >
        Quản lý hệ thống Melodies
      </div>

      <div
        style={{
          display: "flex",
          gap: 0,
          borderBottom: "1px solid " + BORDER,
          marginBottom: 24,
        }}
      >
        {tabs.map((tab) => {
          const active = adminTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setAdminTab(tab.key)}
              onMouseEnter={(e) => {
                if (!active) e.currentTarget.style.color = TEXT.mid;
              }}
              onMouseLeave={(e) => {
                if (!active) e.currentTarget.style.color = TEXT.secondary;
              }}
              style={{
                background: "transparent",
                border: "none",
                padding: active ? "10px 18px 8px" : "10px 18px",
                fontSize: 13,
                fontWeight: 600,
                cursor: "pointer",
                color: active ? TEXT.strong : TEXT.secondary,
                borderBottom: active
                  ? "2px solid " + C[500]
                  : "2px solid transparent",
              }}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {adminTab === "dashboard" && (
        <div>
          <div
            style={{
              display: "flex",
              gap: 14,
              flexWrap: "wrap",
              marginBottom: 28,
            }}
          >
            {statCards.map((card) => (
              <div
                key={card.label}
                style={{
                  background: BG.card,
                  borderRadius: 8,
                  border: "1px solid " + BORDER,
                  padding: "18px 20px",
                  minWidth: 160,
                  flex: 1,
                }}
              >
                <div
                  style={{
                    fontSize: 32,
                    fontWeight: 700,
                    color: TEXT.strong,
                  }}
                >
                  {card.number}
                </div>
                <div
                  style={{
                    fontSize: 12,
                    color: TEXT.secondary,
                    marginTop: 4,
                  }}
                >
                  {card.label}
                </div>
              </div>
            ))}
          </div>

          <div
            style={{
              background: BG.el,
              borderRadius: 8,
              border: "1px solid " + BORDER,
              minHeight: 180,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexDirection: "column",
              gap: 8,
              marginBottom: 0,
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
              onClick={() => onOpenProfile(user.id)}
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
                  flexShrink: 0,
                }}
              >
                {user.initial}
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
  );
}
