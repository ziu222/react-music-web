import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faStar, faChevronRight } from "@fortawesome/free-solid-svg-icons";
import { C, TEXT } from "../../constants/theme";
import users from "../../data/users";
import { SearchInput, FilterPills } from "../../components/console/ConsoleUi";

const FILTER_PILLS = [
  { key: "all", label: "Tất cả" },
  { key: "premium", label: "★ Premium" },
  { key: "free", label: "Free" },
];

export default function AdminListeners({ onOpenProfile }) {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");

  const listeners = users.filter((u) => u.role === "listener");
  const filtered = listeners.filter((u) => {
    const q = search.trim().toLowerCase();
    const matchSearch =
      !q || u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q);
    const matchFilter = filter === "all" || u.plan === filter;
    return matchSearch && matchFilter;
  });

  return (
    <div>
      <div style={{ fontSize: 14, fontWeight: 600, color: TEXT.mid, marginBottom: 16 }}>
        Listeners · {filtered.length} người nghe
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
        <SearchInput
          value={search}
          onChange={setSearch}
          placeholder="Tìm theo tên, email..."
        />
        <FilterPills options={FILTER_PILLS} active={filter} onSelect={setFilter} />
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

      {filtered.map((user) => (
        <div
          key={user.id}
          onClick={() => onOpenProfile(user)}
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
          <div style={{ position: "relative", flexShrink: 0 }}>
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
                <FontAwesomeIcon icon={faStar} style={{ fontSize: 9 }} />
                Premium
              </span>
            ) : (
              <span style={{ fontSize: 12, color: TEXT.tertiary }}>Free</span>
            )}
          </div>
          <div style={{ width: 110, flexShrink: 0, fontSize: 11, color: TEXT.tertiary }}>
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

      {filtered.length === 0 && (
        <div style={{ padding: 24, textAlign: "center", color: TEXT.tertiary, fontSize: 13 }}>
          Không tìm thấy listener nào
        </div>
      )}
    </div>
  );
}
