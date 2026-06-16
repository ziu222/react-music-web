import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBellSlash,
  faCheckDouble,
  faCircleInfo,
  faCrown,
  faMusic,
  faUserGroup,
} from "@fortawesome/free-solid-svg-icons";
import { C, G, R, BG, BORDER, TEXT } from "../../constants/theme";
import { formatNotificationTime } from "../../lib/social/notifications";

const TYPE_META = {
  system: { icon: faCircleInfo, color: "var(--text-secondary)" },
  library: { icon: faMusic, color: C[400] },
  premium: { icon: faCrown, color: G[400] },
  social: { icon: faUserGroup, color: R[400] },
};

export default function NotificationsPanel({ notifications, onMarkRead, onMarkAllRead }) {
  const unread = notifications.filter(n => !n.read).length;

  return (
    <div
      style={{
        position: "absolute",
        top: 44,
        right: 76,
        width: 332,
        padding: 8,
        borderRadius: 8,
        background: BG.menu,
        border: `1px solid ${BORDER}`,
        boxShadow: "var(--shadow-menu)",
        zIndex: 1200,
        animation: "menuIn 150ms cubic-bezier(0.2,0,0,1) both",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "8px 10px 10px",
          borderBottom: `1px solid ${BORDER}`,
          marginBottom: 6,
        }}
      >
        <div>
          <div style={{ fontSize: 15, fontWeight: 900, color: TEXT.primary }}>Thông báo</div>
          {unread > 0 && (
            <div style={{ fontSize: 11, color: TEXT.secondary, marginTop: 2 }}>
              {unread} thông báo chưa đọc
            </div>
          )}
        </div>
        {unread > 0 && (
          <button
            type="button"
            onClick={onMarkAllRead}
            title="Đánh dấu tất cả đã đọc"
            style={{
              border: "none",
              borderRadius: 9999,
              background: "var(--overlay-1)",
              color: TEXT.secondary,
              cursor: "pointer",
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              padding: "6px 10px",
              fontSize: 11,
              fontWeight: 700,
              flexShrink: 0,
              transition: "background 0.15s, color 0.15s",
            }}
            onMouseEnter={e => {
              e.currentTarget.style.background = "var(--overlay-2)";
              e.currentTarget.style.color = TEXT.primary;
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = "var(--overlay-1)";
              e.currentTarget.style.color = TEXT.secondary;
            }}
          >
            <FontAwesomeIcon icon={faCheckDouble} style={{ fontSize: 10 }} />
            Đã đọc hết
          </button>
        )}
      </div>

      {notifications.length === 0 ? (
        <div style={{ padding: "26px 12px 22px", textAlign: "center" }}>
          <FontAwesomeIcon icon={faBellSlash} style={{ fontSize: 20, color: TEXT.tertiary }} />
          <div style={{ fontSize: 12.5, fontWeight: 700, color: TEXT.secondary, marginTop: 10 }}>
            Chưa có thông báo
          </div>
          <div style={{ fontSize: 11, color: TEXT.tertiary, marginTop: 3 }}>
            Thông báo mới sẽ xuất hiện ở đây.
          </div>
        </div>
      ) : (
        <div style={{ maxHeight: 360, overflowY: "auto", scrollbarWidth: "thin", scrollbarColor: "rgba(255,255,255,0.22) transparent" }}>
          {notifications.map(item => {
            const meta = TYPE_META[item.type] ?? TYPE_META.system;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => { if (!item.read) onMarkRead(item.id); }}
                style={{
                  width: "100%",
                  border: "none",
                  textAlign: "left",
                  display: "flex",
                  gap: 10,
                  padding: 10,
                  borderRadius: 6,
                  cursor: item.read ? "default" : "pointer",
                  background: item.read ? "transparent" : "var(--overlay-1)",
                  transition: "background 0.18s",
                }}
                onMouseEnter={e => { e.currentTarget.style.background = "var(--overlay-2)"; }}
                onMouseLeave={e => { e.currentTarget.style.background = item.read ? "transparent" : "var(--overlay-1)"; }}
              >
                <span
                  style={{
                    width: 30,
                    height: 30,
                    borderRadius: "50%",
                    flexShrink: 0,
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    background: "var(--overlay-1)",
                    color: meta.color,
                  }}
                >
                  <FontAwesomeIcon icon={meta.icon} style={{ fontSize: 12 }} />
                </span>
                <span style={{ minWidth: 0, flex: 1 }}>
                  <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <span
                      style={{
                        fontSize: 12,
                        color: TEXT.primary,
                        fontWeight: item.read ? 600 : 800,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                        flex: 1,
                        minWidth: 0,
                      }}
                    >
                      {item.title}
                    </span>
                    {!item.read && (
                      <span
                        className="notif-badge"
                        style={{
                          width: 7,
                          height: 7,
                          borderRadius: "50%",
                          background: C[500],
                          flexShrink: 0,
                          animation: "badgePop 180ms ease both",
                        }}
                      />
                    )}
                  </span>
                  <span style={{ display: "block", fontSize: 11, color: TEXT.secondary, marginTop: 3, lineHeight: 1.35 }}>
                    {item.body}
                  </span>
                  <span style={{ display: "block", fontSize: 10, color: TEXT.tertiary, marginTop: 4 }}>
                    {formatNotificationTime(item.time)}
                  </span>
                </span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
