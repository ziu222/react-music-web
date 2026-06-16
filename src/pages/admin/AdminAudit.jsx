import { useMemo, useState } from "react";
import { TEXT } from "../../constants/theme";
import { loadAuditLog, ACTION_LABELS } from "../../lib/user/auditLog";
import { formatNotificationTime } from "../../lib/social/notifications";
import { FilterPills, ActionChip } from "../../components/console/ConsoleUi";

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

export default function AdminAudit() {
  const [group, setGroup] = useState("all");
  const log = useMemo(() => loadAuditLog(), []);

  const filtered = log.filter((e) => {
    if (group === "all") return true;
    if (group === "user") return USER_ACTIONS.includes(e.action);
    if (group === "song") return SONG_ACTIONS.includes(e.action);
    return e.action === "broadcast";
  });

  return (
    <div>
      <div style={{ display: "flex", gap: 10, marginBottom: 16, flexWrap: "wrap" }}>
        <FilterPills options={GROUP_PILLS} active={group} onSelect={setGroup} />
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
