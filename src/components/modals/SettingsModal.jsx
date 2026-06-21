import { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBell,
  faCircleHalfStroke,
  faCrown,
  faLock,
  faSliders,
  faUser,
  faXmark,
} from "@fortawesome/free-solid-svg-icons";
import { C, G, BG, BORDER, TEXT } from "../../constants/theme";
import { NOTIFICATION_TYPES } from "../../lib/social/notifications";

const TABS = [
  { key: "account", icon: faUser, label: "Tài khoản" },
  { key: "playback", icon: faSliders, label: "Phát lại" },
  { key: "appearance", icon: faCircleHalfStroke, label: "Giao diện" },
  { key: "notifications", icon: faBell, label: "Thông báo" },
];

const ROLE_LABELS = {
  listener: "Người nghe",
  artist: "Nghệ sĩ",
  admin: "Quản trị viên",
};

const THEME_OPTIONS = [
  { key: "system", label: "Hệ thống" },
  { key: "dark", label: "Tối" },
  { key: "light", label: "Sáng" },
];

function ToggleSwitch({ on, disabled, onToggle }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      disabled={disabled}
      onClick={onToggle}
      style={{
        width: 38,
        height: 22,
        borderRadius: 9999,
        border: "none",
        padding: 2,
        flexShrink: 0,
        background: on ? C[500] : "var(--overlay-2)",
        cursor: disabled ? "default" : "pointer",
        opacity: disabled ? 0.45 : 1,
        transition: "background 0.22s cubic-bezier(0.34,1.56,0.64,1)",
      }}
    >
      <span
        style={{
          display: "block",
          width: 18,
          height: 18,
          borderRadius: "50%",
          background: "#fff",
          boxShadow: "0 1px 3px rgba(0,0,0,0.35)",
          transform: on ? "translateX(16px)" : "translateX(0)",
          transition: "transform 0.28s cubic-bezier(0.34,1.56,0.64,1)",
        }}
      />
    </button>
  );
}

function SettingRow({ title, desc, badge, children }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 14,
        padding: "13px 0",
        borderBottom: `1px solid ${BORDER}`,
      }}
    >
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 13, fontWeight: 700, color: TEXT.primary }}>{title}</span>
          {badge}
        </div>
        {desc && (
          <div style={{ fontSize: 11.5, color: TEXT.secondary, marginTop: 3, lineHeight: 1.4 }}>{desc}</div>
        )}
      </div>
      {children}
    </div>
  );
}

function PremiumTag() {
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
        letterSpacing: 0.4,
        textTransform: "uppercase",
        background: `linear-gradient(90deg, ${C[600]}, ${G[500]})`,
        color: "#fff",
      }}
    >
      <FontAwesomeIcon icon={faCrown} style={{ fontSize: 8 }} />
      Premium
    </span>
  );
}

function ComingSoonTag() {
  return (
    <span
      style={{
        borderRadius: 9999,
        padding: "2px 8px",
        fontSize: 9,
        fontWeight: 800,
        letterSpacing: 0.4,
        textTransform: "uppercase",
        background: "var(--overlay-1)",
        color: TEXT.secondary,
      }}
    >
      Sắp có
    </span>
  );
}

function Segmented({ options, value, onChange, lockedKeys = [], onLockedClick }) {
  return (
    <div
      style={{
        display: "flex",
        borderRadius: 9999,
        background: "var(--overlay-1)",
        padding: 3,
        flexShrink: 0,
      }}
    >
      {options.map(opt => {
        const active = value === opt.key;
        const locked = lockedKeys.includes(opt.key);
        return (
          <button
            key={opt.key}
            type="button"
            onClick={() => (locked ? onLockedClick?.() : onChange(opt.key))}
            style={{
              border: "none",
              borderRadius: 9999,
              padding: "6px 14px",
              fontSize: 12,
              fontWeight: 700,
              cursor: "pointer",
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              background: active ? C[500] : "transparent",
              color: active ? "#fff" : TEXT.secondary,
              transition: "background 0.18s, color 0.18s",
            }}
          >
            {opt.label}
            {locked && <FontAwesomeIcon icon={faLock} style={{ fontSize: 9, color: active ? "#fff" : TEXT.tertiary }} />}
          </button>
        );
      })}
    </div>
  );
}

export default function SettingsModal({
  user,
  isPremium,
  settings,
  onUpdateSettings,
  onUpdateNotifyType,
  onClose,
  onOpenPremium,
  onRequestAuth,
}) {
  const [tab, setTab] = useState("account");

  useEffect(() => {
    const onKey = e => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const roleLabel = ROLE_LABELS[user?.role] ?? ROLE_LABELS.listener;

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 1800,
        background: "rgba(0,0,0,0.7)",
        backdropFilter: "blur(3px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 20,
        animation: "fadeIn 140ms ease",
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          position: "relative",
          width: "min(680px, calc(100vw - 40px))",
          maxHeight: "min(620px, calc(100vh - 40px))",
          display: "flex",
          background: BG.card,
          border: `1px solid ${BORDER}`,
          borderRadius: 12,
          boxShadow: "var(--shadow-modal)",
          animation: "authModalIn 190ms cubic-bezier(0.2,0,0,1)",
          overflow: "hidden",
        }}
      >
        {/* Tab rail */}
        <div
          style={{
            width: 178,
            flexShrink: 0,
            padding: "18px 10px",
            borderRight: `1px solid ${BORDER}`,
            background: "var(--overlay-1)",
            display: "flex",
            flexDirection: "column",
            gap: 2,
          }}
        >
          <div style={{ fontSize: 16, fontWeight: 900, color: TEXT.primary, padding: "0 10px 12px" }}>
            Cài đặt
          </div>
          {TABS.map(t => {
            const active = tab === t.key;
            return (
              <button
                key={t.key}
                type="button"
                onClick={() => setTab(t.key)}
                style={{
                  height: 36,
                  border: "none",
                  borderRadius: 6,
                  background: active ? "var(--overlay-2)" : "transparent",
                  color: active ? TEXT.primary : TEXT.secondary,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  padding: "0 10px",
                  fontSize: 12.5,
                  fontWeight: 700,
                  textAlign: "left",
                  transition: "background 0.15s, color 0.15s",
                }}
                onMouseEnter={e => { if (!active) e.currentTarget.style.background = "var(--overlay-1)"; }}
                onMouseLeave={e => { e.currentTarget.style.background = active ? "var(--overlay-2)" : "transparent"; }}
              >
                <FontAwesomeIcon icon={t.icon} style={{ fontSize: 13, width: 16, color: active ? C[400] : "inherit" }} />
                {t.label}
              </button>
            );
          })}
        </div>

        {/* Content */}
        <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "16px 20px 0",
            }}
          >
            <div style={{ fontSize: 15, fontWeight: 800, color: TEXT.primary }}>
              {TABS.find(t => t.key === tab)?.label}
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label="Đóng cài đặt"
              style={{
                width: 30,
                height: 30,
                borderRadius: "50%",
                border: "none",
                background: "var(--overlay-1)",
                color: TEXT.secondary,
                cursor: "pointer",
                transition: "color 0.15s, background 0.15s",
              }}
              onMouseEnter={e => {
                e.currentTarget.style.color = TEXT.primary;
                e.currentTarget.style.background = "var(--overlay-2)";
              }}
              onMouseLeave={e => {
                e.currentTarget.style.color = TEXT.secondary;
                e.currentTarget.style.background = "var(--overlay-1)";
              }}
            >
              <FontAwesomeIcon icon={faXmark} style={{ fontSize: 13 }} />
            </button>
          </div>

          <div
            key={tab}
            style={{
              flex: 1,
              overflowY: "auto",
              padding: "6px 20px 20px",
              animation: "sectionIn 0.24s cubic-bezier(0.2,0,0,1) both",
              scrollbarWidth: "thin",
              scrollbarColor: "rgba(255,255,255,0.22) transparent",
            }}
          >
            {tab === "account" && (
              user ? (
                <>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 14,
                      padding: "14px 0",
                      borderBottom: `1px solid ${BORDER}`,
                    }}
                  >
                    <span
                      style={{
                        width: 52,
                        height: 52,
                        borderRadius: "50%",
                        background: user.color ?? C[500],
                        color: "#fff",
                        display: "inline-flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: 18,
                        fontWeight: 900,
                        flexShrink: 0,
                      }}
                    >
                      {(user.name ?? user.email)?.[0]?.toUpperCase() ?? "M"}
                    </span>
                    <div style={{ minWidth: 0 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <span style={{ fontSize: 15, fontWeight: 900, color: TEXT.primary, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          {user.name || "Người nghe Melodies"}
                        </span>
                        {isPremium && <PremiumTag />}
                      </div>
                      <div style={{ fontSize: 12, color: TEXT.secondary, marginTop: 3, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {user.email}
                      </div>
                    </div>
                  </div>

                  <SettingRow title="Vai trò" desc="Loại tài khoản trong hệ thống Melodies.">
                    <span style={{ fontSize: 12.5, fontWeight: 700, color: TEXT.primary, flexShrink: 0 }}>{roleLabel}</span>
                  </SettingRow>

                  <SettingRow
                    title="Gói hiện tại"
                    desc={isPremium
                      ? "Premium đang hoạt động — tải xuống và âm thanh chất lượng cao đã mở khóa."
                      : "Bạn đang dùng gói Free có quảng cáo."}
                  >
                    {isPremium ? (
                      <span style={{ fontSize: 12.5, fontWeight: 800, color: C[400], flexShrink: 0 }}>Premium</span>
                    ) : (
                      <button
                        type="button"
                        onClick={onOpenPremium}
                        style={{
                          border: "none",
                          borderRadius: 9999,
                          padding: "8px 16px",
                          background: C[500],
                          color: "#fff",
                          fontSize: 12,
                          fontWeight: 800,
                          cursor: "pointer",
                          flexShrink: 0,
                          transition: "background 0.15s, transform 0.12s",
                        }}
                        onMouseEnter={e => { e.currentTarget.style.background = C[600]; e.currentTarget.style.transform = "scale(1.02)"; }}
                        onMouseLeave={e => { e.currentTarget.style.background = C[500]; e.currentTarget.style.transform = "scale(1)"; }}
                      >
                        Nâng cấp
                      </button>
                    )}
                  </SettingRow>
                </>
              ) : (
                <div style={{ padding: "30px 10px", textAlign: "center" }}>
                  <div style={{ fontSize: 14, fontWeight: 800, color: TEXT.primary }}>Bạn chưa đăng nhập</div>
                  <div style={{ fontSize: 12, color: TEXT.secondary, marginTop: 6, lineHeight: 1.5 }}>
                    Đăng nhập để quản lý tài khoản, gói Premium và đồng bộ cài đặt của bạn.
                  </div>
                  <button
                    type="button"
                    onClick={() => { onClose(); onRequestAuth?.(); }}
                    style={{
                      marginTop: 16,
                      border: "none",
                      borderRadius: 9999,
                      padding: "10px 24px",
                      background: C[500],
                      color: "#fff",
                      fontSize: 13,
                      fontWeight: 800,
                      cursor: "pointer",
                    }}
                  >
                    Đăng nhập
                  </button>
                </div>
              )
            )}

            {tab === "playback" && (
              <>
                <SettingRow
                  title="Chất lượng âm thanh"
                  desc={isPremium
                    ? "Chất lượng cao cho trải nghiệm nghe tốt nhất."
                    : "Chất lượng cao yêu cầu gói Premium."}
                  badge={!isPremium && <PremiumTag />}
                >
                  <Segmented
                    options={[{ key: "normal", label: "Thường" }, { key: "high", label: "Cao" }]}
                    value={settings.audioQuality}
                    onChange={quality => onUpdateSettings({ audioQuality: quality })}
                    lockedKeys={isPremium ? [] : ["high"]}
                    onLockedClick={onOpenPremium}
                  />
                </SettingRow>

                <SettingRow
                  title="Tự động phát"
                  desc="Tự chuyển sang bài tiếp theo khi bài hiện tại kết thúc."
                >
                  <ToggleSwitch
                    on={settings.autoplay}
                    onToggle={() => onUpdateSettings({ autoplay: !settings.autoplay })}
                  />
                </SettingRow>

                <SettingRow
                  title="Nội dung nhạy cảm"
                  desc="Cho phép phát các bài hát được gắn nhãn explicit."
                  badge={<ComingSoonTag />}
                >
                  <ToggleSwitch on={settings.explicitContent} disabled />
                </SettingRow>
              </>
            )}

            {tab === "appearance" && (
              <>
                <SettingRow
                  title="Chế độ giao diện"
                  desc="Áp dụng cho khung ứng dụng, trang nội dung, modal và menu. Hệ thống theo cài đặt thiết bị của bạn."
                >
                  <Segmented
                    options={THEME_OPTIONS}
                    value={settings.themeMode}
                    onChange={mode => onUpdateSettings({ themeMode: mode })}
                  />
                </SettingRow>
                {settings.themeMode !== "dark" && (
                  <div
                    style={{
                      marginTop: 12,
                      borderRadius: 8,
                      background: `${C[500]}14`,
                      border: `1px solid ${C[500]}33`,
                      color: C[400],
                      fontSize: 11.5,
                      lineHeight: 1.5,
                      padding: "10px 12px",
                    }}
                  >
                    Giao diện sáng ở mức nền tảng: thanh thư viện và trình phát giữ nền tối để đồng nhất trải nghiệm nghe nhạc.
                  </div>
                )}
              </>
            )}

            {tab === "notifications" && (
              <>
                {Object.entries(NOTIFICATION_TYPES).map(([key, meta]) => (
                  <SettingRow
                    key={key}
                    title={meta.label}
                    desc={
                      key === "system" ? "Cập nhật và mẹo sử dụng Melodies." :
                      key === "library" ? "Mix hằng ngày, danh sách phát và hoạt động thư viện." :
                      key === "premium" ? "Trạng thái gói và quyền lợi Premium." :
                      "Nghệ sĩ bạn theo dõi và gợi ý mới."
                    }
                  >
                    <ToggleSwitch
                      on={settings.notifyTypes[key] !== false}
                      onToggle={() => onUpdateNotifyType(key, settings.notifyTypes[key] === false)}
                    />
                  </SettingRow>
                ))}
                <div style={{ fontSize: 11, color: TEXT.tertiary, marginTop: 12, lineHeight: 1.5 }}>
                  Thông báo đăng nhập và Premium quan trọng vẫn hiển thị trong luồng chính của ứng dụng.
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
