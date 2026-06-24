import { useState, useEffect, useRef } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCrown,
  faXmark,
  faCreditCard,
  faBuilding,
  faMobileScreen,
  faWallet,
  faCheck,
  faLock,
  faShieldHalved,
  faRotate,
  faChevronLeft,
} from "@fortawesome/free-solid-svg-icons";
import { C, G, BG, BORDER, TEXT } from "../../constants/theme";

const PLANS = [
  {
    key: "1m",
    label: "1 tháng",
    price: "59.000đ",
    sub: "59.000đ / tháng",
    save: null,
    popular: false,
  },
  {
    key: "3m",
    label: "3 tháng",
    price: "149.000đ",
    sub: "≈ 49.667đ / tháng",
    save: "Tiết kiệm 28.000đ",
    popular: false,
  },
  {
    key: "12m",
    label: "12 tháng",
    price: "499.000đ",
    sub: "≈ 41.583đ / tháng",
    save: "Tiết kiệm 209.000đ",
    popular: true,
  },
];

const METHODS = [
  { key: "card", label: "Thẻ tín dụng / ghi nợ", icon: faCreditCard },
  { key: "bank", label: "Chuyển khoản ngân hàng", icon: faBuilding },
  { key: "momo", label: "Ví MoMo", icon: faMobileScreen },
  { key: "zalopay", label: "ZaloPay", icon: faWallet },
];

/* Deterministic QR-like grid để tránh flicker khi re-render */
const QR_ROWS = [
  [1, 1, 0, 1, 1, 0, 1],
  [1, 0, 1, 0, 0, 1, 1],
  [0, 1, 1, 0, 1, 0, 0],
  [1, 0, 0, 1, 1, 0, 1],
  [1, 1, 0, 0, 0, 1, 1],
  [0, 0, 1, 1, 0, 0, 0],
  [1, 1, 0, 1, 1, 0, 1],
];

function QrPlaceholder() {
  return (
    <div
      style={{
        display: "inline-flex",
        flexDirection: "column",
        gap: 3,
        padding: 12,
        borderRadius: 12,
        background: BG.el,
        border: `1px solid ${BORDER}`,
      }}
    >
      {QR_ROWS.map((row, r) => (
        <div key={r} style={{ display: "flex", gap: 3 }}>
          {row.map((cell, c) => (
            <div
              key={c}
              style={{
                width: 12,
                height: 12,
                borderRadius: 2,
                background: cell
                  ? `${C[500]}cc`
                  : "rgba(255,255,255,0.07)",
              }}
            />
          ))}
        </div>
      ))}
    </div>
  );
}

function formatCard(v) {
  return v
    .replace(/\D/g, "")
    .slice(0, 16)
    .replace(/(.{4})/g, "$1 ")
    .trim();
}

function formatExpiry(v) {
  const d = v.replace(/\D/g, "").slice(0, 4);
  if (d.length <= 2) return d;
  return `${d.slice(0, 2)}/${d.slice(2)}`;
}

const fieldStyle = {
  width: "100%",
  boxSizing: "border-box",
  height: 42,
  borderRadius: 8,
  border: `1px solid ${BORDER}`,
  background: "var(--overlay-1)",
  color: TEXT.primary,
  fontSize: 14,
  padding: "0 12px",
  outline: "none",
  fontFamily: "inherit",
  transition: "border-color 0.15s, box-shadow 0.15s",
};

export default function PaymentModal({ onClose, onUpgrade, user, onBack }) {
  const [plan, setPlan] = useState("1m");
  const [method, setMethod] = useState("card");
  const [step, setStep] = useState("form");
  const [card, setCard] = useState({ number: "", expiry: "", cvv: "", name: "" });
  const [focusedField, setFocusedField] = useState(null);
  const timerRef = useRef(null);

  const selectedPlan = PLANS.find((p) => p.key === plan);

  useEffect(() => {
    const onKey = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  useEffect(() => () => clearTimeout(timerRef.current), []);

  const handleSubmit = (e) => {
    e.preventDefault();
    setStep("processing");
    timerRef.current = setTimeout(() => {
      setStep("success");
      onUpgrade?.();
    }, 2400);
  };

  const fieldFocusStyle = (name) =>
    focusedField === name
      ? { ...fieldStyle, borderColor: C[500], boxShadow: `0 0 0 2px ${C[500]}28` }
      : fieldStyle;

  return (
    <>
      <style>{`
        @keyframes pmSpin { to { transform: rotate(360deg); } }
        @keyframes pmScaleIn { from { transform: scale(0.6); opacity: 0; } to { transform: scale(1); opacity: 1; } }
      `}</style>

      <div
        onClick={onClose}
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 1900,
          background: "rgba(0,0,0,0.8)",
          backdropFilter: "blur(4px)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: 20,
          animation: "fadeIn 140ms ease",
        }}
      >
        <div
          onClick={(e) => e.stopPropagation()}
          style={{
            position: "relative",
            width: "min(860px, calc(100vw - 40px))",
            maxHeight: "calc(100vh - 40px)",
            overflowY: "auto",
            background: BG.card,
            border: `1px solid ${BORDER}`,
            borderRadius: 14,
            boxShadow: "var(--shadow-modal, 0 32px 80px rgba(0,0,0,0.7))",
            animation: "authModalIn 190ms cubic-bezier(0.2,0,0,1)",
            scrollbarWidth: "thin",
            scrollbarColor: "rgba(255,255,255,0.12) transparent",
          }}
        >
          {/* Ambient glow */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              borderRadius: 14,
              pointerEvents: "none",
              background: `radial-gradient(circle at 88% 8%, ${C[500]}22, transparent 38%),
                           radial-gradient(circle at 6% 92%, ${G[500]}18, transparent 30%)`,
            }}
          />

          {/* Close */}
          <button
            type="button"
            onClick={onClose}
            style={{
              position: "absolute",
              top: 14,
              right: 16,
              zIndex: 10,
              width: 32,
              height: 32,
              borderRadius: "50%",
              border: "none",
              background: "var(--overlay-1)",
              color: TEXT.secondary,
              cursor: "pointer",
              transition: "background 0.15s, color 0.15s",
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = "var(--overlay-2)"; e.currentTarget.style.color = TEXT.primary; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = "var(--overlay-1)"; e.currentTarget.style.color = TEXT.secondary; }}
          >
            <FontAwesomeIcon icon={faXmark} style={{ fontSize: 14 }} />
          </button>

          {/* ── SUCCESS ── */}
          {step === "success" && (
            <div
              style={{
                position: "relative",
                zIndex: 1,
                padding: "60px 40px",
                textAlign: "center",
                animation: "slideUp 0.28s ease",
              }}
            >
              <div
                style={{
                  width: 90,
                  height: 90,
                  borderRadius: "50%",
                  background: `linear-gradient(135deg, ${C[500]}, ${G[400]})`,
                  color: "#0f0c0c",
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 38,
                  marginBottom: 22,
                  boxShadow: `${C[500]}44 0px 20px 52px`,
                  animation: "pmScaleIn 0.4s cubic-bezier(0.34,1.56,0.64,1)",
                }}
              >
                <FontAwesomeIcon icon={faCrown} />
              </div>
              <div style={{ fontSize: 26, fontWeight: 900, color: TEXT.primary }}>
                Thanh toán thành công!
              </div>
              <div
                style={{
                  fontSize: 14,
                  color: TEXT.secondary,
                  maxWidth: 380,
                  margin: "10px auto 0",
                  lineHeight: 1.65,
                }}
              >
                Chào mừng đến với{" "}
                <strong style={{ color: C[400] }}>Melodies Premium</strong>.
                <br />
                Tài khoản <strong style={{ color: TEXT.strong }}>{user?.email}</strong> đã được kích hoạt.
              </div>
              <button
                type="button"
                onClick={onClose}
                style={{
                  marginTop: 32,
                  height: 48,
                  padding: "0 48px",
                  border: "none",
                  borderRadius: 9999,
                  background: `linear-gradient(90deg, ${C[500]}, ${G[500]})`,
                  color: "#fff",
                  fontSize: 15,
                  fontWeight: 800,
                  cursor: "pointer",
                  boxShadow: `${C[500]}44 0 6px 20px`,
                  transition: "transform 0.12s",
                }}
                onMouseEnter={(e) => { e.currentTarget.style.transform = "scale(1.03)"; }}
                onMouseLeave={(e) => { e.currentTarget.style.transform = "scale(1)"; }}
              >
                Bắt đầu nghe
              </button>
            </div>
          )}

          {/* ── PROCESSING ── */}
          {step === "processing" && (
            <div
              style={{
                position: "relative",
                zIndex: 1,
                padding: "80px 40px",
                textAlign: "center",
                animation: "slideUp 0.22s ease",
              }}
            >
              <div
                style={{
                  width: 72,
                  height: 72,
                  borderRadius: "50%",
                  border: `3px solid rgba(255,255,255,0.1)`,
                  borderTopColor: C[500],
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  animation: "pmSpin 0.85s linear infinite",
                  marginBottom: 24,
                }}
              >
                <FontAwesomeIcon icon={faLock} style={{ fontSize: 22, color: C[400] }} />
              </div>
              <div style={{ fontSize: 18, fontWeight: 700, color: TEXT.primary }}>
                Đang xử lý thanh toán...
              </div>
              <div style={{ fontSize: 13, color: TEXT.secondary, marginTop: 6 }}>
                Vui lòng không đóng cửa sổ này
              </div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 6,
                  marginTop: 22,
                  fontSize: 11.5,
                  color: TEXT.tertiary,
                }}
              >
                <FontAwesomeIcon icon={faShieldHalved} style={{ fontSize: 11, color: C[400] }} />
                Kết nối bảo mật SSL 256-bit
              </div>
            </div>
          )}

          {/* ── FORM ── */}
          {step === "form" && (
            <div
              style={{
                position: "relative",
                zIndex: 1,
                display: "grid",
                gridTemplateColumns: "1fr 290px",
              }}
            >
              {/* LEFT */}
              <form
                onSubmit={handleSubmit}
                style={{
                  padding: "32px 28px 32px 32px",
                  display: "flex",
                  flexDirection: "column",
                  gap: 22,
                }}
              >
                {/* Header */}
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  {onBack && (
                    <button
                      type="button"
                      onClick={onBack}
                      style={{
                        width: 32,
                        height: 32,
                        borderRadius: "50%",
                        border: "none",
                        background: "var(--overlay-1)",
                        color: TEXT.secondary,
                        cursor: "pointer",
                        flexShrink: 0,
                      }}
                    >
                      <FontAwesomeIcon icon={faChevronLeft} style={{ fontSize: 12 }} />
                    </button>
                  )}
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 3 }}>
                      <div
                        style={{
                          width: 22,
                          height: 22,
                          borderRadius: "50%",
                          background: `linear-gradient(135deg, ${C[500]}, ${G[400]})`,
                          display: "inline-flex",
                          alignItems: "center",
                          justifyContent: "center",
                          color: "#0f0c0c",
                        }}
                      >
                        <FontAwesomeIcon icon={faCrown} style={{ fontSize: 10 }} />
                      </div>
                      <span
                        style={{
                          fontSize: 10,
                          fontWeight: 800,
                          textTransform: "uppercase",
                          letterSpacing: 0.7,
                          color: C[400],
                        }}
                      >
                        Melodies Premium
                      </span>
                    </div>
                    <div style={{ fontSize: 21, fontWeight: 900, color: TEXT.primary }}>
                      Thanh toán
                    </div>
                  </div>
                </div>

                {/* Plan selector */}
                <div>
                  <div
                    style={{
                      fontSize: 11,
                      fontWeight: 700,
                      color: TEXT.secondary,
                      textTransform: "uppercase",
                      letterSpacing: 0.5,
                      marginBottom: 10,
                    }}
                  >
                    Chọn gói
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    {PLANS.map((p) => (
                      <label
                        key={p.key}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 12,
                          padding: "12px 14px",
                          borderRadius: 10,
                          border: `1.5px solid ${plan === p.key ? C[500] : BORDER}`,
                          background:
                            plan === p.key
                              ? `${C[500]}14`
                              : "var(--overlay-1)",
                          cursor: "pointer",
                          position: "relative",
                          transition: "border-color 0.15s, background 0.15s",
                        }}
                      >
                        <input
                          type="radio"
                          name="plan"
                          value={p.key}
                          checked={plan === p.key}
                          onChange={() => setPlan(p.key)}
                          style={{ display: "none" }}
                        />
                        {/* Radio dot */}
                        <div
                          style={{
                            width: 18,
                            height: 18,
                            borderRadius: "50%",
                            border: `2px solid ${plan === p.key ? C[500] : "rgba(255,255,255,0.22)"}`,
                            background:
                              plan === p.key ? C[500] : "transparent",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            flexShrink: 0,
                            transition: "border-color 0.15s, background 0.15s",
                          }}
                        >
                          {plan === p.key && (
                            <FontAwesomeIcon
                              icon={faCheck}
                              style={{ fontSize: 8, color: "#fff" }}
                            />
                          )}
                        </div>
                        <div style={{ flex: 1 }}>
                          <div
                            style={{
                              fontSize: 13.5,
                              fontWeight: 700,
                              color: TEXT.strong,
                            }}
                          >
                            {p.label}
                          </div>
                          <div style={{ fontSize: 11.5, color: TEXT.secondary }}>
                            {p.sub}
                          </div>
                        </div>
                        <div style={{ textAlign: "right" }}>
                          <div
                            style={{
                              fontSize: 14,
                              fontWeight: 800,
                              color: TEXT.primary,
                            }}
                          >
                            {p.price}
                          </div>
                          {p.save && (
                            <div
                              style={{
                                fontSize: 10,
                                fontWeight: 700,
                                color: p.popular ? G[400] : C[400],
                                marginTop: 2,
                              }}
                            >
                              {p.save}
                            </div>
                          )}
                        </div>
                        {p.popular && (
                          <div
                            style={{
                              position: "absolute",
                              top: -9,
                              right: 14,
                              background: `linear-gradient(90deg, ${C[500]}, ${G[500]})`,
                              color: "#fff",
                              fontSize: 9,
                              fontWeight: 800,
                              padding: "2px 9px",
                              borderRadius: 9999,
                              letterSpacing: 0.4,
                              textTransform: "uppercase",
                            }}
                          >
                            Phổ biến nhất
                          </div>
                        )}
                      </label>
                    ))}
                  </div>
                </div>

                {/* Payment method */}
                <div>
                  <div
                    style={{
                      fontSize: 11,
                      fontWeight: 700,
                      color: TEXT.secondary,
                      textTransform: "uppercase",
                      letterSpacing: 0.5,
                      marginBottom: 10,
                    }}
                  >
                    Phương thức thanh toán
                  </div>
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr",
                      gap: 8,
                    }}
                  >
                    {METHODS.map((m) => (
                      <button
                        key={m.key}
                        type="button"
                        onClick={() => setMethod(m.key)}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 8,
                          padding: "10px 12px",
                          borderRadius: 8,
                          border: `1.5px solid ${
                            method === m.key ? C[500] : BORDER
                          }`,
                          background:
                            method === m.key
                              ? `${C[500]}14`
                              : "var(--overlay-1)",
                          color:
                            method === m.key ? TEXT.strong : TEXT.secondary,
                          fontSize: 12.5,
                          fontWeight: 600,
                          cursor: "pointer",
                          textAlign: "left",
                          transition:
                            "border-color 0.15s, background 0.15s, color 0.15s",
                        }}
                      >
                        <FontAwesomeIcon
                          icon={m.icon}
                          style={{
                            fontSize: 14,
                            color:
                              method === m.key ? C[400] : TEXT.tertiary,
                            flexShrink: 0,
                            width: 16,
                          }}
                        />
                        {m.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Card form */}
                {method === "card" && (
                  <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    <div
                      style={{
                        fontSize: 11,
                        fontWeight: 700,
                        color: TEXT.secondary,
                        textTransform: "uppercase",
                        letterSpacing: 0.5,
                      }}
                    >
                      Thông tin thẻ
                    </div>
                    <div style={{ position: "relative" }}>
                      <input
                        style={fieldFocusStyle("number")}
                        placeholder="4242 4242 4242 4242"
                        value={card.number}
                        onChange={(e) =>
                          setCard((c) => ({
                            ...c,
                            number: formatCard(e.target.value),
                          }))
                        }
                        onFocus={() => setFocusedField("number")}
                        onBlur={() => setFocusedField(null)}
                        maxLength={19}
                        inputMode="numeric"
                        autoComplete="cc-number"
                      />
                      <FontAwesomeIcon
                        icon={faCreditCard}
                        style={{
                          position: "absolute",
                          right: 12,
                          top: "50%",
                          transform: "translateY(-50%)",
                          fontSize: 14,
                          color: TEXT.tertiary,
                          pointerEvents: "none",
                        }}
                      />
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                      <input
                        style={fieldFocusStyle("expiry")}
                        placeholder="MM/YY"
                        value={card.expiry}
                        onChange={(e) =>
                          setCard((c) => ({
                            ...c,
                            expiry: formatExpiry(e.target.value),
                          }))
                        }
                        onFocus={() => setFocusedField("expiry")}
                        onBlur={() => setFocusedField(null)}
                        maxLength={5}
                        inputMode="numeric"
                        autoComplete="cc-exp"
                      />
                      <input
                        style={fieldFocusStyle("cvv")}
                        placeholder="CVV"
                        value={card.cvv}
                        onChange={(e) =>
                          setCard((c) => ({
                            ...c,
                            cvv: e.target.value.replace(/\D/g, "").slice(0, 4),
                          }))
                        }
                        onFocus={() => setFocusedField("cvv")}
                        onBlur={() => setFocusedField(null)}
                        maxLength={4}
                        inputMode="numeric"
                        autoComplete="cc-csc"
                        type="password"
                      />
                    </div>
                    <input
                      style={fieldFocusStyle("name")}
                      placeholder="Tên chủ thẻ (VD: NGUYEN VAN A)"
                      value={card.name}
                      onChange={(e) =>
                        setCard((c) => ({
                          ...c,
                          name: e.target.value.toUpperCase(),
                        }))
                      }
                      onFocus={() => setFocusedField("name")}
                      onBlur={() => setFocusedField(null)}
                      autoComplete="cc-name"
                    />
                  </div>
                )}

                {/* Bank transfer */}
                {method === "bank" && (
                  <div
                    style={{
                      padding: "18px 20px",
                      borderRadius: 10,
                      background: "var(--overlay-1)",
                      border: `1px solid ${BORDER}`,
                      fontSize: 13,
                      lineHeight: 2,
                    }}
                  >
                    <div
                      style={{
                        fontWeight: 700,
                        color: TEXT.strong,
                        marginBottom: 8,
                        fontSize: 13.5,
                      }}
                    >
                      Thông tin chuyển khoản
                    </div>
                    {[
                      ["Ngân hàng", "VietcomBank"],
                      ["Số tài khoản", "1234 5678 9012 3456"],
                      ["Chủ tài khoản", "CONG TY MELODIES AUDIO"],
                      [
                        "Nội dung CK",
                        `PREMIUM ${(user?.email ?? "").split("@")[0].toUpperCase()}`,
                      ],
                    ].map(([label, value]) => (
                      <div key={label} style={{ display: "flex", gap: 10 }}>
                        <span
                          style={{
                            color: TEXT.secondary,
                            minWidth: 130,
                            flexShrink: 0,
                          }}
                        >
                          {label}
                        </span>
                        <span
                          style={{
                            color:
                              label === "Nội dung CK"
                                ? C[400]
                                : TEXT.primary,
                            fontWeight: 700,
                            fontFamily:
                              label === "Số tài khoản" ? "monospace" : "inherit",
                          }}
                        >
                          {value}
                        </span>
                      </div>
                    ))}
                    <div
                      style={{
                        marginTop: 10,
                        padding: "8px 12px",
                        borderRadius: 7,
                        background: `${C[500]}12`,
                        border: `1px solid ${C[500]}30`,
                        fontSize: 11.5,
                        color: C[400],
                        lineHeight: 1.5,
                      }}
                    >
                      Hệ thống sẽ kích hoạt tự động sau khi nhận được thanh toán (demo).
                    </div>
                  </div>
                )}

                {/* MoMo / ZaloPay */}
                {(method === "momo" || method === "zalopay") && (
                  <div style={{ textAlign: "center", padding: "8px 0" }}>
                    <QrPlaceholder />
                    <div
                      style={{
                        fontSize: 13,
                        color: TEXT.secondary,
                        marginTop: 14,
                        lineHeight: 1.5,
                      }}
                    >
                      Mở ứng dụng{" "}
                      <strong style={{ color: TEXT.primary }}>
                        {method === "momo" ? "MoMo" : "ZaloPay"}
                      </strong>{" "}
                      và quét mã QR
                    </div>
                    <div
                      style={{
                        fontSize: 11,
                        color: TEXT.tertiary,
                        marginTop: 5,
                      }}
                    >
                      Mã QR demo — không thực hiện giao dịch thật
                    </div>
                  </div>
                )}

                {/* Submit */}
                <button
                  type="submit"
                  style={{
                    height: 48,
                    border: "none",
                    borderRadius: 9999,
                    background: `linear-gradient(90deg, ${C[500]}, ${G[500]})`,
                    color: "#fff",
                    fontSize: 15,
                    fontWeight: 800,
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 8,
                    boxShadow: `${C[500]}3c 0 6px 20px`,
                    transition: "transform 0.12s, box-shadow 0.12s",
                    marginTop: "auto",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = "scale(1.025)";
                    e.currentTarget.style.boxShadow = `${C[500]}55 0 8px 28px`;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "scale(1)";
                    e.currentTarget.style.boxShadow = `${C[500]}3c 0 6px 20px`;
                  }}
                >
                  <FontAwesomeIcon icon={faLock} style={{ fontSize: 13 }} />
                  Thanh toán {selectedPlan?.price}
                </button>

                <div
                  style={{
                    fontSize: 11,
                    color: TEXT.tertiary,
                    textAlign: "center",
                  }}
                >
                  Giao diện demo — không có giao dịch thật nào được thực hiện
                </div>
              </form>

              {/* RIGHT: order summary */}
              <div
                style={{
                  borderLeft: `1px solid ${BORDER}`,
                  padding: "32px 24px",
                  background: "var(--overlay-1)",
                  borderRadius: "0 14px 14px 0",
                  display: "flex",
                  flexDirection: "column",
                  gap: 20,
                }}
              >
                <div
                  style={{
                    fontSize: 11,
                    fontWeight: 700,
                    color: TEXT.secondary,
                    textTransform: "uppercase",
                    letterSpacing: 0.5,
                  }}
                >
                  Tóm tắt đơn hàng
                </div>

                {/* Product card */}
                <div
                  style={{
                    padding: "14px 16px",
                    borderRadius: 10,
                    background: `${C[500]}14`,
                    border: `1px solid ${C[500]}40`,
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <div
                      style={{
                        width: 38,
                        height: 38,
                        borderRadius: 9,
                        background: `linear-gradient(135deg, ${C[500]}, ${G[400]})`,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "#0f0c0c",
                        flexShrink: 0,
                      }}
                    >
                      <FontAwesomeIcon icon={faCrown} style={{ fontSize: 16 }} />
                    </div>
                    <div>
                      <div
                        style={{
                          fontSize: 13.5,
                          fontWeight: 700,
                          color: TEXT.primary,
                        }}
                      >
                        Melodies Premium
                      </div>
                      <div style={{ fontSize: 12, color: TEXT.secondary }}>
                        Gói {selectedPlan?.label}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Line items */}
                <div style={{ display: "flex", flexDirection: "column", gap: 10, fontSize: 13 }}>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span style={{ color: TEXT.secondary }}>Giá gói</span>
                    <span style={{ color: TEXT.primary, fontWeight: 600 }}>
                      {selectedPlan?.price}
                    </span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span style={{ color: TEXT.secondary }}>Phí dịch vụ</span>
                    <span style={{ color: TEXT.secondary }}>Miễn phí</span>
                  </div>
                  {selectedPlan?.save && (
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                      <span style={{ color: G[400] }}>Tiết kiệm</span>
                      <span style={{ color: G[400], fontWeight: 600 }}>
                        -{selectedPlan.save.replace(/[^\d.]/g, "").replace(/(\d+)/, (n) => n)}đ
                      </span>
                    </div>
                  )}
                  <div style={{ height: 1, background: BORDER }} />
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span style={{ fontWeight: 700, color: TEXT.strong }}>
                      Tổng cộng
                    </span>
                    <span
                      style={{
                        fontWeight: 900,
                        fontSize: 17,
                        color: C[400],
                      }}
                    >
                      {selectedPlan?.price}
                    </span>
                  </div>
                </div>

                {/* Trust */}
                <div
                  style={{
                    marginTop: "auto",
                    display: "flex",
                    flexDirection: "column",
                    gap: 10,
                    paddingTop: 16,
                    borderTop: `1px solid ${BORDER}`,
                  }}
                >
                  {[
                    { icon: faLock, text: "Thanh toán mã hóa SSL" },
                    { icon: faShieldHalved, text: "Bảo đảm hoàn tiền 7 ngày" },
                    { icon: faRotate, text: "Hủy bất cứ lúc nào" },
                  ].map((b) => (
                    <div
                      key={b.text}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                        fontSize: 11.5,
                        color: TEXT.secondary,
                      }}
                    >
                      <FontAwesomeIcon
                        icon={b.icon}
                        style={{ fontSize: 11, color: C[400], width: 14, flexShrink: 0 }}
                      />
                      {b.text}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
