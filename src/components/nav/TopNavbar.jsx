import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHouse, faMagnifyingGlass, faChevronLeft, faChevronRight } from "@fortawesome/free-solid-svg-icons";
import logo from "../../assets/logo.png";
import { C, BG, TEXT, BORDER } from "../../constants/theme";

// Thanh điều hướng trên cùng. Nhận callback thay vì state điều hướng trực tiếp
// nên giữ nguyên interface khi App chuyển sang react-router.
export default function TopNavbar({
  isHomeActive,
  canBack,
  canForward,
  onBack,
  onForward,
  onHome,
  search,
  onSearchChange,
  isPremium,
  onOpenPremium,
  supportOpen,
  onOpenSupport,
  onOpenSettings,
  authUser,
  userActions,
  onRegister,
  onLogin,
}) {
  return (
    <div
      style={{
        height: 60,
        flexShrink: 0,
        display: "flex",
        alignItems: "center",
        gap: 10,
        padding: "0 16px",
        background: BG.base,
        borderBottom: `0.5px solid ${BORDER}`,
      }}
    >
      {/* Logo */}
      <div
        style={{
          width: 32,
          height: 32,
          borderRadius: "50%",
          background: BG.card,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          overflow: "hidden",
          flexShrink: 0,
          cursor: "pointer",
        }}
      >
        <img
          src={logo}
          alt="Melodies"
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            display: "block",
          }}
        />
      </div>

      {/* Back / forward */}
      <div style={{ display: "flex", gap: 4, flexShrink: 0 }}>
        {[
          { icon: faChevronLeft, label: "Quay lại", action: onBack, enabled: canBack },
          { icon: faChevronRight, label: "Tiến tới", action: onForward, enabled: canForward },
        ].map(btn => (
          <button
            key={btn.label}
            type="button"
            aria-label={btn.label}
            title={`${btn.label} (Alt+${btn.label === "Quay lại" ? "←" : "→"})`}
            disabled={!btn.enabled}
            onClick={btn.action}
            style={{
              width: 32,
              height: 32,
              borderRadius: "50%",
              border: "none",
              background: "var(--overlay-1)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: btn.enabled ? "pointer" : "default",
              color: btn.enabled ? "var(--text-strong)" : "var(--text-tertiary)",
              transition: "color 0.15s, background 0.15s",
            }}
            onMouseEnter={e => { if (btn.enabled) e.currentTarget.style.background = "var(--overlay-2)"; }}
            onMouseLeave={e => { e.currentTarget.style.background = "var(--overlay-1)"; }}
          >
            <FontAwesomeIcon icon={btn.icon} style={{ fontSize: 13 }} />
          </button>
        ))}
      </div>

      {/* Home button */}
      <button
        type="button"
        aria-label="Trang chủ"
        onClick={onHome}
        style={{
          width: 40,
          height: 40,
          borderRadius: "50%",
          border: "none",
          background: isHomeActive ? `${C[500]}20` : "var(--overlay-1)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer",
          color: isHomeActive ? C[400] : "var(--text-mid)",
          flexShrink: 0,
          transition: "all 0.15s",
        }}
      >
        <FontAwesomeIcon icon={faHouse} style={{ fontSize: 15 }} />
      </button>

      {/* Search bar */}
      <div style={{ flex: 1, maxWidth: 440, position: "relative" }}>
        <FontAwesomeIcon
          icon={faMagnifyingGlass}
          style={{
            position: "absolute",
            left: 14,
            top: "50%",
            transform: "translateY(-50%)",
            fontSize: 12,
            color: "var(--text-tertiary)",
            pointerEvents: "none",
          }}
        />
        <input
          value={search}
          onChange={e => onSearchChange(e.target.value)}
          placeholder="Bạn muốn phát nội dung gì?"
          style={{
            width: "100%",
            background: BG.el,
            border: "none",
            borderRadius: 500,
            padding: "9px 16px 9px 40px",
            color: TEXT.primary,
            fontSize: 13,
            outline: "none",
            boxShadow: "var(--border) 0px 0px 0px 1px inset",
            transition: "box-shadow 0.15s",
          }}
          onFocus={e => { e.target.style.boxShadow = `${C[500]} 0px 0px 0px 1.5px inset`; }}
          onBlur={e => { e.target.style.boxShadow = "var(--border) 0px 0px 0px 1px inset"; }}
        />
      </div>

      {/* Right links */}
      <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 6 }}>
        {!isPremium && (
          <span
            onClick={onOpenPremium}
            style={{ fontSize: 13, color: "var(--text-mid)", cursor: "pointer", padding: "0 6px", fontWeight: 500, transition: "color 0.15s" }}
            onMouseEnter={e => { e.currentTarget.style.color = C[400]; }}
            onMouseLeave={e => { e.currentTarget.style.color = "var(--text-mid)"; }}
          >
            Premium
          </span>
        )}
        <span
          onClick={onOpenSupport}
          style={{ fontSize: 13, color: supportOpen ? C[400] : "var(--text-mid)", cursor: "pointer", padding: "0 6px", fontWeight: 500, transition: "color 0.15s" }}
          onMouseEnter={e => { e.currentTarget.style.color = C[400]; }}
          onMouseLeave={e => { e.currentTarget.style.color = supportOpen ? C[400] : "var(--text-mid)"; }}
        >
          Hỗ trợ
        </span>
        <div style={{ width: 1, height: 20, background: BORDER, margin: "0 4px" }} />
        <span
          onClick={onOpenSettings}
          style={{ fontSize: 13, color: "var(--text-mid)", cursor: "pointer", padding: "0 6px", transition: "color 0.15s" }}
          onMouseEnter={e => { e.currentTarget.style.color = "var(--text-primary)"; }}
          onMouseLeave={e => { e.currentTarget.style.color = "var(--text-mid)"; }}
        >
          Cài đặt
        </span>
        {userActions}
        <button
          type="button"
          onClick={onRegister}
          style={{
            display: authUser ? "none" : "inline-block",
            background: "transparent",
            border: `1.5px solid var(--text-secondary)`,
            borderRadius: 9999,
            padding: "6px 16px",
            fontSize: 13,
            color: TEXT.primary,
            cursor: "pointer",
            fontWeight: 500,
            transition: "all 0.15s",
          }}
          onMouseEnter={e => { e.target.style.borderColor = "var(--text-primary)"; e.target.style.transform = "scale(1.02)"; }}
          onMouseLeave={e => { e.target.style.borderColor = "var(--text-secondary)"; e.target.style.transform = "scale(1)"; }}
        >
          Đăng ký
        </button>
        <button
          type="button"
          onClick={onLogin}
          style={{
            display: authUser ? "none" : "inline-block",
            background: "var(--text-primary)",
            border: "none",
            borderRadius: 9999,
            padding: "7px 18px",
            fontSize: 13,
            color: "var(--bg-base)",
            cursor: "pointer",
            fontWeight: 500,
            transition: "transform 0.15s",
          }}
          onMouseEnter={e => { e.target.style.transform = "scale(1.02)"; }}
          onMouseLeave={e => { e.target.style.transform = "scale(1)"; }}
        >
          Đăng nhập
        </button>
      </div>
    </div>
  );
}
