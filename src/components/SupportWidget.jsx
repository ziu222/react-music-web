import { useCallback, useEffect, useRef, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHeadset, faXmark } from "@fortawesome/free-solid-svg-icons";
import { C } from "../constants/theme";
import { supportFaq } from "../data/supportFaq";

const GREETING = {
  from: "bot",
  text: "Xin chào! 👋 Mình là trợ lý Melodies. Bạn cần hỗ trợ vấn đề gì? Chọn một câu hỏi bên dưới nhé.",
};

export default function SupportWidget({ hasPlayer = false, hasPromoBanner = false, open: controlledOpen, onOpenChange, onAction }) {
  const [internalOpen, setInternalOpen] = useState(false);
  const [messages, setMessages] = useState([GREETING]);
  const [askedIds, setAskedIds] = useState(() => new Set());
  const [typing, setTyping] = useState(false);
  const [btnHover, setBtnHover] = useState(false);
  const [hoverChip, setHoverChip] = useState(null);
  const listRef = useRef(null);
  const timerRef = useRef(null);
  const open = controlledOpen ?? internalOpen;

  const setWidgetOpen = useCallback((next) => {
    const value = typeof next === "function" ? next(open) : next;
    if (onOpenChange) onOpenChange(value);
    else setInternalOpen(value);
  }, [onOpenChange, open]);

  useEffect(() => {
    if (listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight;
    }
  }, [messages, typing]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => {
      if (e.key === "Escape") setWidgetOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, setWidgetOpen]);

  useEffect(() => () => clearTimeout(timerRef.current), []);

  const askQuestion = (item) => {
    if (typing) return;
    setMessages((m) => [...m, { from: "user", text: item.q }]);
    setAskedIds((prev) => {
      const next = new Set(prev);
      next.add(item.id);
      return next;
    });
    setTyping(true);
    timerRef.current = setTimeout(() => {
      setMessages((m) => [
        ...m,
        { from: "bot", text: item.a, action: item.action ?? null },
      ]);
      setTyping(false);
    }, 600);
  };

  const reset = () => {
    clearTimeout(timerRef.current);
    setTyping(false);
    setMessages([GREETING]);
    setAskedIds(new Set());
  };

  const remaining = supportFaq.filter((f) => !askedIds.has(f.id));

  const chipBase = {
    textAlign: "left",
    background: "transparent",
    border: "1px solid var(--island-border)",
    borderRadius: 9999,
    padding: "7px 13px",
    fontSize: 12,
    color: "var(--island-muted)",
    cursor: "pointer",
    transition: "all 0.15s",
    fontFamily: "inherit",
  };

  return (
    <>
      {open && (
        <div
          style={{
            position: "fixed",
            right: 24,
            bottom: hasPlayer ? 178 : hasPromoBanner ? 144 : 88,
            zIndex: 240,
            width: 340,
            maxWidth: "calc(100vw - 48px)",
            height: 460,
            maxHeight: "calc(100vh - 220px)",
            display: "flex",
            flexDirection: "column",
            background: "var(--island-bg)",
            border: "1px solid var(--island-border)",
            borderRadius: 14,
            boxShadow: "var(--shadow-modal)",
            overflow: "hidden",
            animation: "popoverIn 180ms cubic-bezier(0.2,0,0,1) both",
          }}
        >
          {/* Header */}
          <div
            style={{
              padding: "14px 16px",
              background: `linear-gradient(135deg, ${C[700]}, ${C[500]})`,
              display: "flex",
              alignItems: "center",
              gap: 10,
            }}
          >
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: "50%",
                background: "rgba(255,255,255,0.2)",
                color: "#fff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 15,
                flexShrink: 0,
              }}
            >
              <FontAwesomeIcon icon={faHeadset} />
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: "#fff" }}>
                Hỗ trợ Melodies
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <span
                  style={{
                    width: 7,
                    height: 7,
                    borderRadius: "50%",
                    background: "#4ade80",
                    flexShrink: 0,
                  }}
                />
                <span style={{ fontSize: 11, color: "rgba(255,255,255,0.85)" }}>
                  Trực tuyến — phản hồi ngay
                </span>
              </div>
            </div>
          </div>

          {/* Messages */}
          <div
            ref={listRef}
            style={{
              flex: 1,
              overflowY: "auto",
              padding: 14,
              display: "flex",
              flexDirection: "column",
              gap: 8,
            }}
          >
            {messages.map((m, i) =>
              m.from === "bot" ? (
                <div
                  key={i}
                  style={{
                    alignSelf: "flex-start",
                    maxWidth: "85%",
                    background: "var(--overlay-1)",
                    border: "1px solid var(--island-border)",
                    color: "var(--island-text)",
                    borderRadius: "12px 12px 12px 4px",
                    padding: "9px 13px",
                    fontSize: 13,
                    lineHeight: 1.55,
                    animation: "fadeIn 200ms ease both",
                  }}
                >
                  {m.text}
                  {m.action && onAction && (
                    <button
                      onClick={() => onAction(m.action)}
                      style={{
                        display: "block", marginTop: 10,
                        background: `linear-gradient(90deg, ${C[600]}, ${C[500]})`,
                        color: "#fff", border: "none", borderRadius: 9999,
                        padding: "6px 16px", fontSize: 12, fontWeight: 700,
                        cursor: "pointer", width: "100%",
                      }}
                    >
                      Bắt đầu đăng ký →
                    </button>
                  )}
                </div>
              ) : (
                <div
                  key={i}
                  style={{
                    alignSelf: "flex-end",
                    maxWidth: "85%",
                    background: C[500],
                    color: "#fff",
                    borderRadius: "12px 12px 4px 12px",
                    padding: "9px 13px",
                    fontSize: 13,
                    lineHeight: 1.5,
                  }}
                >
                  {m.text}
                </div>
              )
            )}
            {typing && (
              <div
                style={{
                  alignSelf: "flex-start",
                  maxWidth: "85%",
                  background: "var(--overlay-1)",
                  border: "1px solid var(--island-border)",
                  color: "var(--island-muted)",
                  borderRadius: "12px 12px 12px 4px",
                  padding: "9px 13px",
                  fontSize: 13,
                  lineHeight: 1.55,
                  animation: "pulse 1s infinite",
                  letterSpacing: "2px",
                }}
              >
                •••
              </div>
            )}
          </div>

          {/* Question chips */}
          <div
            style={{
              borderTop: "1px solid var(--island-border)",
              padding: "10px 12px",
              maxHeight: 150,
              overflowY: "auto",
              display: "flex",
              flexDirection: "column",
              gap: 6,
            }}
          >
            <div
              style={{
                fontSize: 10,
                fontWeight: 700,
                letterSpacing: "0.06em",
                textTransform: "uppercase",
                color: "var(--island-faint)",
                marginBottom: 2,
              }}
            >
              Câu hỏi thường gặp
            </div>
            {remaining.length > 0 ? (
              remaining.map((f) => (
                <button
                  key={f.id}
                  onClick={() => askQuestion(f)}
                  onMouseEnter={() => setHoverChip(f.id)}
                  onMouseLeave={() => setHoverChip(null)}
                  style={{
                    ...chipBase,
                    ...(hoverChip === f.id
                      ? {
                          background: "var(--island-hover)",
                          color: "var(--island-text)",
                          borderColor:
                            "var(--island-rail, rgba(255,255,255,0.16))",
                        }
                      : null),
                  }}
                >
                  {f.q}
                </button>
              ))
            ) : (
              <button
                onClick={reset}
                onMouseEnter={() => setHoverChip("reset")}
                onMouseLeave={() => setHoverChip(null)}
                style={{
                  ...chipBase,
                  textAlign: "center",
                  color: C[400],
                  ...(hoverChip === "reset"
                    ? {
                        background: "var(--island-hover)",
                        borderColor:
                          "var(--island-rail, rgba(255,255,255,0.16))",
                      }
                    : null),
                }}
              >
                Bắt đầu lại
              </button>
            )}
          </div>
        </div>
      )}

      {/* Floating button */}
      <button
        aria-label="Hỗ trợ"
        onClick={() => setWidgetOpen((o) => !o)}
        onMouseEnter={() => setBtnHover(true)}
        onMouseLeave={() => setBtnHover(false)}
        style={{
          position: "fixed",
          right: 24,
          bottom: hasPlayer ? 114 : hasPromoBanner ? 80 : 24,
          zIndex: 240,
          width: 52,
          height: 52,
          borderRadius: "50%",
          background: `linear-gradient(135deg, ${C[600]}, ${C[500]})`,
          color: "#fff",
          border: "none",
          cursor: "pointer",
          boxShadow: "0 8px 24px rgba(249,115,22,0.4)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 20,
          transform: btnHover ? "scale(1.08)" : "scale(1)",
          transition: "transform 0.15s",
        }}
      >
        <FontAwesomeIcon icon={open ? faXmark : faHeadset} />
      </button>
    </>
  );
}
