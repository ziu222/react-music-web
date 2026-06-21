import { useRef, useEffect, useState } from "react";
import { BG, BORDER, C, TEXT } from "../../constants/theme";

export default function EntityHeader({
  type,
  title,
  meta,
  image,
  fallback,
  round = false,
  accent = "#1d1616",
}) {
  const wrapRef = useRef(null);
  const [parallax, setParallax] = useState(0);

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    let scrollEl = el.parentElement;
    while (scrollEl && !/(auto|scroll)/.test(getComputedStyle(scrollEl).overflowY)) {
      scrollEl = scrollEl.parentElement;
    }
    if (!scrollEl) return;
    const onScroll = () => {
      const rect = el.getBoundingClientRect();
      const containerRect = scrollEl.getBoundingClientRect();
      const relTop = rect.top - containerRect.top + scrollEl.scrollTop;
      setParallax(Math.max(0, scrollEl.scrollTop - relTop) * 0.35);
    };
    scrollEl.addEventListener("scroll", onScroll, { passive: true });
    return () => scrollEl.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div ref={wrapRef} style={{
      padding: "40px 32px 28px",
      background: `linear-gradient(180deg, ${C[500]}14 0%, rgba(255,255,255,0.025) 48%, transparent 100%)`,
      borderBottom: `1px solid ${BORDER}`,
      display: "flex",
      alignItems: "flex-end",
      gap: 24,
    }}>
      <div style={{
        width: 180,
        height: 180,
        flexShrink: 0,
        borderRadius: round ? "50%" : 8,
        overflow: "hidden",
        background: BG.el,
        boxShadow: `0 12px 40px rgba(0,0,0,0.5), 0 0 0 1px ${accent}24`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: 52,
        fontWeight: 500,
        color: "var(--text-strong)",
      }}>
        {image ? (
          <img
            src={image}
            alt=""
            style={{
              width: "100%", height: "108%", objectFit: "cover", display: "block",
              transform: `translateY(${parallax * 0.4}px)`,
              transition: parallax === 0 ? "none" : undefined,
            }}
          />
        ) : (
          fallback
        )}
      </div>

      <div style={{ minWidth: 0, paddingBottom: 4 }}>
        <div style={{
          fontSize: 11,
          textTransform: "uppercase",
          letterSpacing: 1.2,
          color: TEXT.secondary,
          marginBottom: 8,
          fontWeight: 600,
        }}>
          {type}
        </div>
        <h1 style={{
          fontSize: title?.length > 28 ? 26 : 34,
          fontWeight: 700,
          color: TEXT.primary,
          marginBottom: 10,
          whiteSpace: "nowrap",
          overflow: "hidden",
          textOverflow: "ellipsis",
          lineHeight: 1.15,
        }}>
          {title}
        </h1>
        <div style={{ fontSize: 13, color: TEXT.secondary, display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
          {meta}
        </div>
      </div>
    </div>
  );
}
