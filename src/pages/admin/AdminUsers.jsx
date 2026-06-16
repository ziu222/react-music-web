import { useState, useMemo } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faStar, faChevronRight, faMicrophoneLines } from "@fortawesome/free-solid-svg-icons";
import { TEXT, C } from "../../constants/theme";
import { SearchInput, FilterPills } from "../../components/console/ConsoleUi";
import { getPendingRequests } from "../../lib/artist/upgradeRequests";
import { grantPremium, GRANT_DURATIONS } from "../../lib/user/premiumGrants";
import { logAdminAction } from "../../lib/user/auditLog";

const ROLE_PILLS = [
  { key: "all", label: "Tất cả" },
  { key: "listener", label: "Listener" },
  { key: "artist", label: "Nghệ sĩ" },
  { key: "admin", label: "Admin" },
  { key: "deleted", label: "Đã xóa" },
  { key: "requests", label: "Đơn NS" },
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

export default function AdminUsers({ users, onOpenUser, authUser, onRefresh }) {
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [planFilter, setPlanFilter] = useState("all");
  const [bulkDuration, setBulkDuration] = useState("1m");
  const [bulkDone, setBulkDone] = useState(null);

  const pendingRequestEmails = useMemo(() => {
    const reqs = getPendingRequests();
    return new Set(reqs.map((r) => r.email));
  }, []);

  const filtered = users.filter((u) => {
    if (roleFilter === "deleted") {
      if (!u.deleted) return false;
    } else if (roleFilter === "requests") {
      if (!pendingRequestEmails.has(u.email)) return false;
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

      <div style={{
        background: "var(--overlay-1)", border: "1px solid var(--border)", borderRadius: 10,
        padding: "12px 16px", marginBottom: 16, display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap",
      }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: TEXT.mid, flexShrink: 0 }}>Bulk grant Premium:</div>
        {GRANT_DURATIONS.map((d) => (
          <button key={d.key} onClick={() => setBulkDuration(d.key)} style={{
            background: bulkDuration === d.key ? "#fbbf24" : "transparent",
            border: "1px solid #fbbf24", color: bulkDuration === d.key ? "#0a0a08" : "#fbbf24",
            borderRadius: 9999, padding: "5px 12px", fontSize: 11, fontWeight: 600, cursor: "pointer",
          }}>{d.label}</button>
        ))}
        <button onClick={() => {
          const listeners = filtered.filter((u) => !u.deleted && u.plan !== "premium" && u.role === "listener");
          listeners.forEach((u) => grantPremium(authUser?.email, u.email, bulkDuration, "bulk grant"));
          logAdminAction(authUser, "change_plan", listeners.length + " listeners", "bulk → premium " + GRANT_DURATIONS.find(d=>d.key===bulkDuration)?.label);
          setBulkDone(listeners.length);
          setTimeout(() => setBulkDone(null), 4000);
          onRefresh?.();
        }} style={{
          background: "#fbbf24", border: "none", color: "#0a0a08", borderRadius: 9999,
          padding: "6px 16px", fontSize: 12, fontWeight: 700, cursor: "pointer", marginLeft: "auto",
        }}>
          Áp dụng cho Listeners ({filtered.filter((u) => !u.deleted && u.plan !== "premium" && u.role === "listener").length})
        </button>
        {bulkDone !== null && (
          <div style={{ fontSize: 12, color: "#34d399" }}>✓ Đã grant {bulkDone} tài khoản</div>
        )}
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
        const hasRequest = pendingRequestEmails.has(user.email);
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
              {hasRequest && (
                <InlinePill color={C[400]}>
                  <FontAwesomeIcon icon={faMicrophoneLines} style={{ fontSize: 8, marginRight: 2 }} />
                  Đơn NS
                </InlinePill>
              )}
            </div>
            <div style={{ width: 86, flexShrink: 0, display: "flex", alignItems: "center", gap: 4, flexWrap: "wrap" }}>
              <InlinePill color={roleChip.color}>{roleChip.label}</InlinePill>
              {user.verified && (
                <span style={{ fontSize: 9, fontWeight: 800, background: "#3b82f6", color: "#fff",
                  borderRadius: 4, padding: "1px 5px", letterSpacing: "0.04em" }}>✓ Verified</span>
              )}
              {user.suspended && (
                <span style={{ fontSize: 9, fontWeight: 800, background: "#f59e0b", color: "#0a0a08",
                  borderRadius: 4, padding: "1px 5px" }}>Suspended</span>
              )}
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
