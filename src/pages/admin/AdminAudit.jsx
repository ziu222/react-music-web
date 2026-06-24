import { useEffect, useMemo, useState } from "react";
import { TEXT, BG, BORDER } from "../../constants/theme";
import { loadAuditLog, fromRowRealtime, ACTION_LABELS } from "../../lib/user/auditLog";
import { subscribeToAuditLog } from "../../lib/supabase/realtime";
import { formatNotificationTime } from "../../lib/social/notifications";
import { FilterPills, SearchInput, ActionChip } from "../../components/console/ConsoleUi";

const USER_ACTIONS = [
  "ban_user",
  "unban_user",
  "change_role",
  "change_plan",
  "delete_user",
  "restore_user",
  "impersonate",
];
const SONG_ACTIONS = ["hide_song", "unhide_song", "approve_song", "reject_song"];

const GROUP_PILLS = [
  { key: "all", label: "Tất cả" },
  { key: "user", label: "Người dùng" },
  { key: "song", label: "Bài hát" },
  { key: "broadcast", label: "Thông báo" },
];

export function actionColor(action) {
  if (action === "broadcast") return "#fbbf24";
  if (action === "impersonate") return "#a78bfa";
  if (SONG_ACTIONS.includes(action)) return "#60a5fa";
  return "#fb923c";
}

// Select gọn, đồng bộ look với <select> của các màn admin khác
function FilterSelect({ value, onChange, children }) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      style={{
        background: BG.el,
        border: "1px solid " + BORDER,
        borderRadius: 6,
        padding: "8px 10px",
        color: TEXT.primary,
        fontSize: 13,
        outline: "none",
        cursor: "pointer",
        flexShrink: 0,
      }}
    >
      {children}
    </select>
  );
}

export default function AdminAudit() {
  const [group, setGroup] = useState("all");
  const [actor, setActor] = useState("all");      // lọc theo adminName
  const [actionType, setActionType] = useState("all"); // lọc theo action
  const [query, setQuery] = useState("");          // free-text target/detail/adminName
  const [log, setLog] = useState([]);

  // Load ban đầu
  useEffect(() => { loadAuditLog().then(setLog); }, []);

  // Realtime: prepend hành động mới, dedupe theo id
  useEffect(() => {
    const unsub = subscribeToAuditLog((row) =>
      setLog((prev) => {
        const item = fromRowRealtime(row);
        if (prev.some((e) => e.id === item.id)) return prev;
        return [item, ...prev];
      })
    );
    return unsub;
  }, []);

  // Options dropdown lấy từ toàn bộ log (không phụ thuộc filter) để giữ ổn định
  const actorOptions = useMemo(() => {
    const seen = new Set();
    const out = [];
    for (const e of log) {
      const name = e.adminName || "";
      if (name && !seen.has(name)) { seen.add(name); out.push(name); }
    }
    return out;
  }, [log]);

  const actionOptions = useMemo(() => {
    const seen = new Set();
    const out = [];
    for (const e of log) {
      const a = e.action;
      if (a && !seen.has(a)) { seen.add(a); out.push(a); }
    }
    return out;
  }, [log]);

  const q = query.trim().toLowerCase();
  const filtered = log.filter((e) => {
    // group pills
    if (group === "user" && !USER_ACTIONS.includes(e.action)) return false;
    if (group === "song" && !SONG_ACTIONS.includes(e.action)) return false;
    if (group === "broadcast" && e.action !== "broadcast") return false;
    // actor
    if (actor !== "all" && e.adminName !== actor) return false;
    // loại hành động
    if (actionType !== "all" && e.action !== actionType) return false;
    // free-text: target / detail / adminName chứa chuỗi
    if (q) {
      const hay = (e.target + " " + e.detail + " " + (e.adminName || "")).toLowerCase();
      if (!hay.includes(q)) return false;
    }
    return true;
  });

  return (
    <div>
      <div style={{ display: "flex", gap: 10, marginBottom: 16, flexWrap: "wrap", alignItems: "center" }}>
        <FilterPills options={GROUP_PILLS} active={group} onSelect={setGroup} />

        {/* Người thực hiện */}
        <FilterSelect value={actor} onChange={setActor}>
          <option value="all">Tất cả người thực hiện</option>
          {actorOptions.map((name) => (
            <option key={name} value={name}>{name}</option>
          ))}
        </FilterSelect>

        {/* Loại hành động */}
        <FilterSelect value={actionType} onChange={setActionType}>
          <option value="all">Tất cả loại hành động</option>
          {actionOptions.map((a) => (
            <option key={a} value={a}>{ACTION_LABELS[a] ?? a}</option>
          ))}
        </FilterSelect>

        {/* Tìm kiếm tự do */}
        <SearchInput
          value={query}
          onChange={setQuery}
          placeholder="Tìm theo đối tượng, chi tiết, người thực hiện…"
          width={260}
        />

        <div style={{ marginLeft: "auto", fontSize: 12, color: TEXT.tertiary, flexShrink: 0 }}>
          {filtered.length} hành động
        </div>
      </div>

      {filtered.length === 0 && (
        <div style={{ padding: 32, textAlign: "center", color: TEXT.tertiary, fontSize: 13 }}>
          Chưa có hành động nào được ghi lại
        </div>
      )}

      {filtered.map((e) => (
        <div
          key={e.id}
          onMouseEnter={(ev) => {
            ev.currentTarget.style.background = "var(--overlay-1)";
          }}
          onMouseLeave={(ev) => {
            ev.currentTarget.style.background = "transparent";
          }}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            padding: "9px 12px",
            borderRadius: 8,
            transition: "background 0.12s",
          }}
        >
          <div style={{ width: 90, flexShrink: 0, fontSize: 11, color: TEXT.tertiary }}>
            {formatNotificationTime(e.time)}
          </div>
          <div
            style={{
              width: 110,
              flexShrink: 0,
              fontSize: 12,
              fontWeight: 600,
              color: TEXT.strong,
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {e.adminName}
          </div>
          <div style={{ width: 130, flexShrink: 0 }}>
            <ActionChip color={actionColor(e.action)} label={ACTION_LABELS[e.action] ?? e.action} />
          </div>
          <div
            style={{
              width: 160,
              flexShrink: 0,
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
          <div
            style={{
              flex: 1,
              minWidth: 0,
              fontSize: 12,
              color: TEXT.secondary,
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {e.detail}
          </div>
        </div>
      ))}
    </div>
  );
}
