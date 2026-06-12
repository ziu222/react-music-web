import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faStar, faChevronRight } from "@fortawesome/free-solid-svg-icons";
import { TEXT } from "../../constants/theme";
import { SearchInput, FilterPills } from "../../components/console/ConsoleUi";

const ROLE_PILLS = [
  { key: "all", label: "Tất cả" },
  { key: "listener", label: "Listener" },
  { key: "artist", label: "Nghệ sĩ" },
  { key: "admin", label: "Admin" },
  { key: "deleted", label: "Đã xóa" },
];

const PLAN_PILLS = [
  { key: "all", label: "Mọi gói" },
  { key: "premium", label: "★ Premium" },
  { key: "free", label: "Free" },
];

const ROLE_CHIPS = {
  listener: { label: "Listener", color: null },
  artist: { label: "Nghệ sĩ", color: "#a78bfa" },
  admin: { label: "Admin", color: "#34d399" },
};

function InlinePill({ color, children }) {
  return (
    <span
      style={{
        borderRadius: 9999,
        padding: "1px 8px",
        fontSize: 10,
        fontWeight: 600,
        color: color ?? TEXT.tertiary,
        background: color ? color + "1f" : "var(--overlay-1)",
        border: "1px solid " + (color ? color + "44" : "var(--border)"),
        whiteSpace: "nowrap",
        flexShrink: 0,
      }}
    >
      {children}
    </span>
  );
}

export default function AdminUsers({ users, onOpenUser }) {
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [planFilter, setPlanFilter] = useState("all");

  const filtered = users.filter((u) => {
    if (roleFilter === "deleted") {
      if (!u.deleted) return false;
    } else {
      if (u.deleted) return false;
      if (roleFilter !== "all" && u.role !== roleFilter) return false;
    }
    if (planFilter !== "all" && u.plan !== planFilter) return false;
    const q = search.trim().toLowerCase();
    return !q || u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q);
  });

  return (
    <div>
      <div style={{ fontSize: 14, fontWeight: 600, color: TEXT.mid, marginBottom: 16 }}>
        {filtered.length} tài khoản
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
        <SearchInput value={search} onChange={setSearch} placeholder="Tìm theo tên, email..." />
        <FilterPills options={ROLE_PILLS} active={roleFilter} onSelect={setRoleFilter} />
        <div style={{ width: 1, height: 18, background: "var(--border)" }} />
        <FilterPills options={PLAN_PILLS} active={planFilter} onSelect={setPlanFilter} />
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
        <div style={{ flex: 1.3, minWidth: 120 }}>Tên</div>
        <div style={{ width: 86, flexShrink: 0 }}>Vai trò</div>
        <div style={{ flex: 1.4, minWidth: 140 }}>Email</div>
        <div style={{ width: 86, flexShrink: 0 }}>Plan</div>
        <div style={{ width: 100, flexShrink: 0 }}>Ngày tham gia</div>
        <div style={{ width: 20, flexShrink: 0 }} />
      </div>

      {filtered.map((user) => {
        const dimmed = user.status === "banned" || user.deleted;
        const roleChip = ROLE_CHIPS[user.role] ?? ROLE_CHIPS.listener;
        return (
          <div
            key={user.id}
            onClick={() => onOpenUser(user)}
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
                opacity: dimmed ? 0.5 : 1,
              }}
            >
              {user.initial}
            </div>
            <div
              style={{
                flex: 1.3,
                minWidth: 120,
                display: "flex",
                alignItems: "center",
                gap: 6,
                overflow: "hidden",
              }}
            >
              <span
                style={{
                  fontSize: 13,
                  fontWeight: 600,
                  color: dimmed ? TEXT.secondary : TEXT.strong,
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                }}
              >
                {user.name}
              </span>
              {user.status === "banned" && <InlinePill color="#f87171">Đã khóa</InlinePill>}
              {user.deleted && <InlinePill>Đã xóa</InlinePill>}
            </div>
            <div style={{ width: 86, flexShrink: 0 }}>
              <InlinePill color={roleChip.color}>{roleChip.label}</InlinePill>
            </div>
            <div
              style={{
                flex: 1.4,
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
            <div style={{ width: 86, flexShrink: 0 }}>
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
            <div style={{ width: 100, flexShrink: 0, fontSize: 11, color: TEXT.tertiary }}>
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
        );
      })}

      {filtered.length === 0 && (
        <div style={{ padding: 24, textAlign: "center", color: TEXT.tertiary, fontSize: 13 }}>
          Không tìm thấy tài khoản nào
        </div>
      )}
    </div>
  );
}
