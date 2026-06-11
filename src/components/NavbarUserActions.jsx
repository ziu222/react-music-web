import { useEffect, useRef, useState } from "react";
import { Bell, LogOut, Settings, UserRound } from "lucide-react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBolt, faCrown, faLock } from "@fortawesome/free-solid-svg-icons";
import { C, G, BORDER, TEXT } from "../constants/theme";

const notifications = [
  {
    id: 1,
    title: "Mix hằng ngày của bạn đã sẵn sàng",
    body: "Gợi ý mới dựa trên những bài bạn vừa nghe.",
  },
  {
    id: 2,
    title: "Danh sách phát đã được lưu",
    body: "Danh sách phát cá nhân hiện đã có trong Thư viện.",
  },
  {
    id: 3,
    title: "Nhạc mới dành cho bạn",
    body: "Gợi ý US-UK và V-Pop vừa được cập nhật.",
  },
];

function FloatingPanel({ right = 0, children }) {
  return (
    <div
      style={{
        position: "absolute",
        top: 44,
        right,
        width: 318,
        padding: 8,
        borderRadius: 8,
        background: "#282828",
        border: "1px solid rgba(255,255,255,0.08)",
        boxShadow: "rgba(0,0,0,0.65) 0px 18px 48px",
        zIndex: 1200,
        animation: "menuIn 150ms cubic-bezier(0.2,0,0,1) both",
      }}
    >
      {children}
    </div>
  );
}

function IconButton({ label, active, children, onClick }) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      style={{
        width: 36,
        height: 36,
        borderRadius: "50%",
        border: `1px solid ${active ? "rgba(249,115,22,0.42)" : "rgba(255,255,255,0.08)"}`,
        background: active ? `${C[500]}24` : "rgba(255,255,255,0.07)",
        color: active ? C[400] : "rgba(255,255,255,0.74)",
        cursor: "pointer",
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        position: "relative",
        transition: "background 0.15s, color 0.15s, border-color 0.15s",
      }}
    >
      {children}
    </button>
  );
}

function PlanChip({ premium }) {
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 4,
        borderRadius: 9999,
        padding: "2px 8px",
        fontSize: 9,
        fontWeight: 800,
        letterSpacing: 0.5,
        textTransform: "uppercase",
        flexShrink: 0,
        background: premium ? `linear-gradient(90deg, ${C[600]}, ${G[500]})` : "rgba(255,255,255,0.1)",
        color: premium ? "#fff" : "rgba(255,255,255,0.6)",
      }}
    >
      {premium && <FontAwesomeIcon icon={faCrown} style={{ fontSize: 8 }} />}
      {premium ? "Premium" : "Free"}
    </span>
  );
}

export default function NavbarUserActions({
  user,
  isPremium = false,
  audioQuality = "normal",
  onOpenPremium,
  onToggleAudioQuality,
  onHome,
  onLogout,
}) {
  const [openPanel, setOpenPanel] = useState(null);
  const ref = useRef(null);

  useEffect(() => {
    const onPointerDown = event => {
      if (!ref.current?.contains(event.target)) setOpenPanel(null);
    };
    const onKey = event => {
      if (event.key === "Escape") setOpenPanel(null);
    };
    window.addEventListener("pointerdown", onPointerDown);
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("keydown", onKey);
    };
  }, []);

  if (!user) return null;

  const initial = user.email?.[0]?.toUpperCase() ?? user.name?.[0]?.toUpperCase() ?? "M";

  return (
    <div ref={ref} style={{ display: "flex", alignItems: "center", gap: 8, position: "relative" }}>
      <IconButton
        label="Thông báo"
        active={openPanel === "notifications"}
        onClick={() => setOpenPanel(openPanel === "notifications" ? null : "notifications")}
      >
        <Bell size={17} strokeWidth={2.4} />
        <span
          style={{
            position: "absolute",
            top: 6,
            right: 7,
            width: 7,
            height: 7,
            borderRadius: "50%",
            background: C[500],
            boxShadow: "0 0 0 2px #141010",
          }}
        />
      </IconButton>

      <button
        type="button"
        onClick={() => setOpenPanel(openPanel === "profile" ? null : "profile")}
        title={user.email}
        style={{
          height: 36,
          minWidth: 36,
          borderRadius: 9999,
          border: `1px solid ${openPanel === "profile" ? "rgba(249,115,22,0.42)" : BORDER}`,
          background: openPanel === "profile" ? `${C[500]}24` : "rgba(255,255,255,0.07)",
          color: "#fff",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          gap: 8,
          padding: "0 10px 0 4px",
          fontSize: 12,
          fontWeight: 800,
          maxWidth: 180,
        }}
      >
        <span
          style={{
            width: 28,
            height: 28,
            borderRadius: "50%",
            background: C[500],
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          {initial}
        </span>
        <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {user.name || user.email}
        </span>
        <PlanChip premium={isPremium} />
      </button>

      {openPanel === "notifications" && (
        <FloatingPanel right={76}>
          <div style={{ padding: "8px 10px 10px" }}>
            <div style={{ fontSize: 15, fontWeight: 900, color: TEXT.primary }}>Thông báo</div>
            <div style={{ fontSize: 11, color: TEXT.secondary, marginTop: 3 }}>Hộp thông báo xem trước</div>
          </div>
          {notifications.map(item => (
            <div
              key={item.id}
              style={{
                display: "flex",
                gap: 10,
                padding: "10px",
                borderRadius: 6,
                background: item.id === 1 ? "rgba(255,255,255,0.08)" : "transparent",
              }}
            >
              <span style={{ width: 8, height: 8, borderRadius: "50%", background: C[500], marginTop: 5, flexShrink: 0 }} />
              <span style={{ minWidth: 0 }}>
                <div style={{ fontSize: 12, color: TEXT.primary, fontWeight: 800 }}>{item.title}</div>
                <div style={{ fontSize: 11, color: "rgba(255,255,255,0.52)", marginTop: 3, lineHeight: 1.35 }}>{item.body}</div>
              </span>
            </div>
          ))}
        </FloatingPanel>
      )}

      {openPanel === "profile" && (
        <FloatingPanel right={0}>
          <div style={{ padding: "10px", borderBottom: "1px solid rgba(255,255,255,0.08)", marginBottom: 6 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div style={{ fontSize: 13, color: TEXT.primary, fontWeight: 900, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {user.name || "Người nghe Melodies"}
              </div>
              <PlanChip premium={isPremium} />
            </div>
            <div style={{ fontSize: 11, color: TEXT.secondary, marginTop: 3, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {user.email}
            </div>
          </div>

          {!isPremium && (
            <button
              type="button"
              onClick={() => { setOpenPanel(null); onOpenPremium?.(); }}
              style={{
                width: "100%",
                height: 38,
                border: "none",
                borderRadius: 5,
                background: `linear-gradient(90deg, ${C[600]}33, ${G[500]}26)`,
                color: C[400],
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: 10,
                padding: "0 10px",
                fontSize: 12,
                fontWeight: 800,
                textAlign: "left",
                marginBottom: 4,
                transition: "background 0.15s",
              }}
              onMouseEnter={e => { e.currentTarget.style.background = `linear-gradient(90deg, ${C[600]}4d, ${G[500]}3d)`; }}
              onMouseLeave={e => { e.currentTarget.style.background = `linear-gradient(90deg, ${C[600]}33, ${G[500]}26)`; }}
            >
              <FontAwesomeIcon icon={faCrown} style={{ fontSize: 13, width: 15 }} />
              Nâng cấp Premium
            </button>
          )}

          <button
            type="button"
            onClick={() => {
              if (isPremium) { onToggleAudioQuality?.(); return; }
              setOpenPanel(null);
              onOpenPremium?.();
            }}
            title={isPremium ? "Bật/tắt âm thanh chất lượng cao" : "Tính năng Premium"}
            style={{
              width: "100%",
              height: 38,
              border: "none",
              borderRadius: 5,
              background: "transparent",
              color: TEXT.primary,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: 10,
              padding: "0 10px",
              fontSize: 12,
              fontWeight: 800,
              textAlign: "left",
            }}
            onMouseEnter={e => { e.currentTarget.style.background = "rgba(255,255,255,0.1)"; }}
            onMouseLeave={e => { e.currentTarget.style.background = "transparent"; }}
          >
            <FontAwesomeIcon icon={faBolt} style={{ fontSize: 13, width: 15, color: isPremium && audioQuality === "high" ? C[400] : "inherit" }} />
            <span style={{ flex: 1 }}>Âm thanh chất lượng cao</span>
            {isPremium ? (
              <span
                style={{
                  fontSize: 10,
                  fontWeight: 800,
                  color: audioQuality === "high" ? C[400] : TEXT.secondary,
                  textTransform: "uppercase",
                  letterSpacing: 0.4,
                }}
              >
                {audioQuality === "high" ? "Bật" : "Tắt"}
              </span>
            ) : (
              <FontAwesomeIcon icon={faLock} style={{ fontSize: 11, color: TEXT.tertiary }} />
            )}
          </button>

          {[
            { key: "profile", icon: UserRound, label: "Hồ sơ", onClick: onHome },
            { key: "settings", icon: Settings, label: "Cài đặt", onClick: onHome },
            { key: "logout", icon: LogOut, label: "Đăng xuất", onClick: onLogout },
          ].map(item => {
            const Icon = item.icon;
            return (
              <button
                key={item.key}
                type="button"
                onClick={() => {
                  setOpenPanel(null);
                  item.onClick?.();
                }}
                style={{
                  width: "100%",
                  height: 38,
                  border: "none",
                  borderRadius: 5,
                  background: "transparent",
                  color: item.key === "logout" ? "#fecaca" : TEXT.primary,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  padding: "0 10px",
                  fontSize: 12,
                  fontWeight: 800,
                  textAlign: "left",
                }}
                onMouseEnter={e => { e.currentTarget.style.background = "rgba(255,255,255,0.1)"; }}
                onMouseLeave={e => { e.currentTarget.style.background = "transparent"; }}
              >
                <Icon size={15} />
                {item.label}
              </button>
            );
          })}
        </FloatingPanel>
      )}
    </div>
  );
}
