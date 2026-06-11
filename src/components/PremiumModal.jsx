import { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBolt,
  faCheck,
  faCircleDown,
  faCrown,
  faForwardStep,
  faHeadphones,
  faRectangleAd,
  faXmark,
} from "@fortawesome/free-solid-svg-icons";
import { C, G, BG, TEXT } from "../constants/theme";

const FREE_FEATURES = [
  { icon: faHeadphones, label: "Nghe toàn bộ danh mục nhạc" },
  { icon: faCheck, label: "Tạo và lưu danh sách phát" },
  { icon: faRectangleAd, label: "Có quảng cáo giữa các bài" },
];

const PREMIUM_FEATURES = [
  { icon: faRectangleAd, label: "Nghe nhạc không quảng cáo" },
  { icon: faCircleDown, label: "Tải xuống để nghe offline" },
  { icon: faBolt, label: "Âm thanh chất lượng cao" },
  { icon: faForwardStep, label: "Chuyển bài không giới hạn" },
];

function FeatureRow({ icon, label, muted, delay }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 10,
        fontSize: 12.5,
        fontWeight: 500,
        color: muted ? TEXT.secondary : "rgba(255,255,255,0.86)",
        animation: `slideUp 0.26s ease ${delay}ms both`,
      }}
    >
      <span
        style={{
          width: 22,
          height: 22,
          borderRadius: "50%",
          flexShrink: 0,
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          background: muted ? "rgba(255,255,255,0.07)" : `${C[500]}26`,
          color: muted ? "rgba(255,255,255,0.45)" : C[400],
        }}
      >
        <FontAwesomeIcon icon={icon} style={{ fontSize: 10 }} />
      </span>
      {label}
    </div>
  );
}

function PlanBadge({ children, premium }) {
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        borderRadius: 9999,
        padding: "4px 12px",
        fontSize: 11,
        fontWeight: 800,
        letterSpacing: 0.4,
        textTransform: "uppercase",
        background: premium ? `linear-gradient(90deg, ${C[600]}, ${G[500]})` : "rgba(255,255,255,0.08)",
        color: premium ? "#fff" : TEXT.secondary,
      }}
    >
      {premium && <FontAwesomeIcon icon={faCrown} style={{ fontSize: 10 }} />}
      {children}
    </span>
  );
}

export default function PremiumModal({ onClose, user, isPremium, onUpgrade, onRequireAuth }) {
  const [justUpgraded, setJustUpgraded] = useState(false);

  useEffect(() => {
    const onKey = e => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const handleUpgradeClick = () => {
    if (!user) {
      onRequireAuth();
      return;
    }
    if (isPremium) return;
    onUpgrade();
    setJustUpgraded(true);
  };

  const showSuccess = justUpgraded && isPremium;

  const cardBase = {
    borderRadius: 10,
    padding: "22px 22px 24px",
    display: "flex",
    flexDirection: "column",
    gap: 14,
    minWidth: 0,
  };

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 1850,
        background: "rgba(0,0,0,0.72)",
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
          width: "min(720px, calc(100vw - 40px))",
          maxHeight: "calc(100vh - 40px)",
          overflowY: "auto",
          background: BG.card,
          border: "1px solid rgba(255,255,255,0.08)",
          borderRadius: 12,
          padding: "30px 32px 28px",
          boxShadow: "rgba(0,0,0,0.72) 0px 24px 64px",
          animation: "authModalIn 190ms cubic-bezier(0.2,0,0,1)",
          scrollbarWidth: "thin",
          scrollbarColor: "rgba(255,255,255,0.22) transparent",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            pointerEvents: "none",
            background: `radial-gradient(circle at 84% 8%, ${C[500]}22, transparent 36%), radial-gradient(circle at 8% 96%, ${G[500]}1c, transparent 30%)`,
          }}
        />

        <button
          type="button"
          onClick={onClose}
          aria-label="Đóng Premium"
          style={{
            position: "absolute",
            top: 14,
            right: 16,
            zIndex: 1,
            width: 32,
            height: 32,
            borderRadius: "50%",
            border: "none",
            background: "rgba(255,255,255,0.07)",
            color: TEXT.secondary,
            cursor: "pointer",
            transition: "color 0.15s, background 0.15s",
          }}
          onMouseEnter={e => {
            e.currentTarget.style.color = TEXT.primary;
            e.currentTarget.style.background = "rgba(255,255,255,0.12)";
          }}
          onMouseLeave={e => {
            e.currentTarget.style.color = TEXT.secondary;
            e.currentTarget.style.background = "rgba(255,255,255,0.07)";
          }}
        >
          <FontAwesomeIcon icon={faXmark} style={{ fontSize: 14 }} />
        </button>

        <div style={{ position: "relative", zIndex: 1 }}>
          {showSuccess ? (
            <div style={{ textAlign: "center", padding: "26px 12px 18px", animation: "slideUp 0.26s ease" }}>
              <div
                style={{
                  width: 86,
                  height: 86,
                  borderRadius: "50%",
                  background: `linear-gradient(135deg, ${C[500]}, ${G[400]})`,
                  color: "#0f0c0c",
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 34,
                  marginBottom: 18,
                  boxShadow: "rgba(249,115,22,0.32) 0px 18px 42px",
                  animation: "pulse 1.4s ease 1",
                }}
              >
                <FontAwesomeIcon icon={faCrown} />
              </div>
              <div style={{ fontSize: 24, fontWeight: 900, color: TEXT.primary }}>
                Bạn đã là Melodies Premium
              </div>
              <div style={{ fontSize: 13, color: TEXT.secondary, maxWidth: 380, margin: "10px auto 0", lineHeight: 1.55 }}>
                Tải xuống, âm thanh chất lượng cao và nghe không quảng cáo đã được mở khóa cho tài khoản {user?.email}.
              </div>
              <button
                type="button"
                onClick={onClose}
                style={{
                  marginTop: 26,
                  height: 46,
                  padding: "0 36px",
                  border: "none",
                  borderRadius: 9999,
                  background: C[500],
                  color: "#fff",
                  fontSize: 14,
                  fontWeight: 800,
                  cursor: "pointer",
                  transition: "background 0.15s, transform 0.12s",
                }}
                onMouseEnter={e => { e.currentTarget.style.background = C[600]; e.currentTarget.style.transform = "scale(1.02)"; }}
                onMouseLeave={e => { e.currentTarget.style.background = C[500]; e.currentTarget.style.transform = "scale(1)"; }}
              >
                Bắt đầu nghe
              </button>
            </div>
          ) : (
            <>
              <div style={{ textAlign: "center", marginBottom: 22 }}>
                <PlanBadge premium>Melodies Premium</PlanBadge>
                <div style={{ fontSize: 26, fontWeight: 900, color: TEXT.primary, marginTop: 12, lineHeight: 1.2 }}>
                  Nghe không giới hạn cùng Premium
                </div>
                <div style={{ fontSize: 13, color: TEXT.secondary, maxWidth: 430, margin: "8px auto 0", lineHeight: 1.5 }}>
                  Không quảng cáo, tải xuống nghe offline và chất lượng âm thanh cao —
                  hủy bất cứ lúc nào trong bản xem trước này.
                </div>
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
                  gap: 14,
                }}
              >
                {/* Free plan */}
                <div
                  style={{
                    ...cardBase,
                    background: "rgba(255,255,255,0.045)",
                    border: "1px solid rgba(255,255,255,0.09)",
                    animation: "slideUp 0.24s ease both",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <PlanBadge>Free</PlanBadge>
                    {user && !isPremium && (
                      <span style={{ fontSize: 11, fontWeight: 700, color: TEXT.secondary }}>Gói hiện tại</span>
                    )}
                  </div>
                  <div>
                    <span style={{ fontSize: 26, fontWeight: 900, color: TEXT.primary }}>0đ</span>
                    <span style={{ fontSize: 12, color: TEXT.secondary, marginLeft: 6 }}>/tháng</span>
                  </div>
                  <div style={{ display: "grid", gap: 10 }}>
                    {FREE_FEATURES.map((f, i) => (
                      <FeatureRow key={f.label} icon={f.icon} label={f.label} muted delay={60 + i * 40} />
                    ))}
                  </div>
                </div>

                {/* Premium plan */}
                <div
                  style={{
                    ...cardBase,
                    background: `linear-gradient(160deg, ${C[900]}55, ${BG.el} 55%)`,
                    border: `1px solid ${C[500]}66`,
                    boxShadow: `0 0 0 1px ${C[500]}22, rgba(0,0,0,0.4) 0px 14px 36px`,
                    animation: "slideUp 0.24s ease 60ms both",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <PlanBadge premium>Premium</PlanBadge>
                    {isPremium && (
                      <span style={{ fontSize: 11, fontWeight: 700, color: C[400] }}>Gói hiện tại</span>
                    )}
                  </div>
                  <div>
                    <span style={{ fontSize: 26, fontWeight: 900, color: TEXT.primary }}>59.000đ</span>
                    <span style={{ fontSize: 12, color: TEXT.secondary, marginLeft: 6 }}>/tháng</span>
                  </div>
                  <div style={{ display: "grid", gap: 10 }}>
                    {PREMIUM_FEATURES.map((f, i) => (
                      <FeatureRow key={f.label} icon={f.icon} label={f.label} delay={100 + i * 40} />
                    ))}
                  </div>
                  <button
                    type="button"
                    onClick={handleUpgradeClick}
                    disabled={isPremium}
                    style={{
                      marginTop: "auto",
                      height: 46,
                      border: "none",
                      borderRadius: 9999,
                      background: isPremium ? "rgba(255,255,255,0.1)" : C[500],
                      color: isPremium ? TEXT.secondary : "#fff",
                      fontSize: 14,
                      fontWeight: 800,
                      cursor: isPremium ? "default" : "pointer",
                      transition: "background 0.15s, transform 0.12s",
                    }}
                    onMouseEnter={e => {
                      if (!isPremium) { e.currentTarget.style.background = C[600]; e.currentTarget.style.transform = "scale(1.02)"; }
                    }}
                    onMouseLeave={e => {
                      if (!isPremium) { e.currentTarget.style.background = C[500]; e.currentTarget.style.transform = "scale(1)"; }
                    }}
                  >
                    {isPremium ? "Bạn đang dùng Premium" : user ? "Nâng cấp lên Premium" : "Đăng nhập để nâng cấp"}
                  </button>
                </div>
              </div>

              <div style={{ textAlign: "center", marginTop: 18, fontSize: 11, color: TEXT.tertiary, lineHeight: 1.5 }}>
                Bản xem trước frontend — thanh toán chưa được kết nối. Nâng cấp chỉ cập nhật gói mock trong trình duyệt này.
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
