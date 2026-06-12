import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft } from "@fortawesome/free-solid-svg-icons";
import { C, TEXT, BORDER } from "../../constants/theme";

/* Khung màn hình console standalone (admin / artist studio):
 * sidebar 230px (brand + nav + user chip + nút thoát) + main cuộn riêng. */
export default function ConsoleShell({
  brandIcon,
  brandLabel,
  navItems,
  activeTab,
  onSelectTab,
  user,
  userRoleLabel,
  onExit,
  children,
}) {
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
          <FontAwesomeIcon icon={brandIcon} style={{ color: C[500], fontSize: 18 }} />
          <div style={{ fontSize: 15, fontWeight: 800, color: TEXT.strong }}>
            {brandLabel}
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          {navItems.map((item) => {
            const active = activeTab === item.key;
            return (
              <div
                key={item.key}
                onClick={() => onSelectTab(item.key)}
                onMouseEnter={(e) => {
                  if (!active) e.currentTarget.style.background = "var(--overlay-1)";
                }}
                onMouseLeave={(e) => {
                  if (!active) e.currentTarget.style.background = "transparent";
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
                <span style={{ flex: 1, minWidth: 0 }}>{item.label}</span>
                {item.badge > 0 && (
                  <span
                    style={{
                      borderRadius: 9999,
                      background: C[500],
                      color: "#fff",
                      fontSize: 10,
                      fontWeight: 700,
                      padding: "1px 7px",
                      flexShrink: 0,
                    }}
                  >
                    {item.badge}
                  </span>
                )}
              </div>
            );
          })}
        </div>

        <div style={{ flex: 1 }} />

        {user && (
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
                {user.name}
              </div>
              <div style={{ fontSize: 10, color: TEXT.tertiary }}>{userRoleLabel}</div>
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

      <div
        style={{
          flex: 1,
          overflowY: "auto",
          padding: "28px 36px",
          boxSizing: "border-box",
        }}
      >
        {children}
      </div>
    </div>
  );
}
