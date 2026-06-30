import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faStar, faStarHalfStroke } from "@fortawesome/free-solid-svg-icons";
import { C, TEXT } from "../../constants/theme";

const SIZE_MAP = { sm: 13, md: 17, lg: 22 };

/**
 * StarRating — interactive 1-5 star rating component.
 *
 * Props:
 *   value      {number}  0 = unrated, 1-5 = rated (supports decimals for display)
 *   onChange   {fn}      called with integer star index (1-5) on click
 *   readonly   {boolean} disables interaction, default false
 *   size       {string}  'sm' | 'md' | 'lg', default 'md'
 *   showValue  {boolean} show numeric value next to stars, default false
 *   count      {number}  if provided, show "(count)" muted label
 *   disabled   {boolean} disables interaction + dims, default false
 */
export default function StarRating({
  value = 0,
  onChange,
  readonly = false,
  size = "md",
  showValue = false,
  count,
  disabled = false,
}) {
  const px = SIZE_MAP[size] ?? SIZE_MAP.md;
  const gap = Math.round(px * 0.18);

  const [hovered, setHovered] = useState(0); // 0 = none hovered
  const [clicked, setClicked] = useState(0); // tracks which star was last clicked for scale anim

  const interactive = !readonly && !disabled;

  function getStarIcon(i) {
    const display = hovered > 0 ? hovered : value;
    if (display >= i) return faStar;
    const frac = display - Math.floor(display);
    if (Math.floor(display) === i - 1 && frac >= 0.25) return faStarHalfStroke;
    return faStar;
  }

  function getStarColor(i) {
    const display = hovered > 0 ? hovered : value;
    if (display >= i) return C[400]; // full
    const frac = display - Math.floor(display);
    if (Math.floor(display) === i - 1 && frac >= 0.25) return C[400]; // half
    return "var(--text-tertiary)"; // empty — visible dim star, không tàng hình
  }

  function handleClick(i) {
    if (!interactive) return;
    setClicked(i);
    onChange?.(i);
    // reset scale flag after animation completes
    setTimeout(() => setClicked(0), 300);
  }

  const displayValue = value > 0 ? value.toFixed(1) : null;

  return (
    <span
      role="group"
      aria-label={`Rating: ${value > 0 ? `${value} out of 5` : "unrated"}`}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: `${gap * 2}px`,
        opacity: disabled ? 0.45 : 1,
        transition: "opacity 0.2s",
        userSelect: "none",
      }}
    >
      {/* Stars row */}
      <span
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: `${gap}px`,
        }}
        onMouseLeave={() => interactive && setHovered(0)}
      >
        {[1, 2, 3, 4, 5].map((i) => {
          const isScaling = clicked === i;

          return (
            <button
              key={i}
              type="button"
              aria-label={`Rate ${i} out of 5 star${i !== 1 ? "s" : ""}`}
              disabled={!interactive}
              onClick={() => handleClick(i)}
              onMouseEnter={() => interactive && setHovered(i)}
              style={{
                all: "unset",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                width: `${px + 6}px`,
                height: `${px + 6}px`,
                cursor: interactive ? "pointer" : "default",
                color: getStarColor(i),
                opacity: 1,
                background: interactive && hovered === i ? "var(--overlay-2)" : "transparent",
                borderRadius: 4,
                transform: isScaling ? "scale(1.3)" : "scale(1)",
                transition: "transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1), color 0.15s, background 0.1s",
                outline: "none",
              }}
              // Keyboard focus ring via pseudo-element workaround: we handle via onFocus style
              onFocus={(e) => {
                if (interactive) e.currentTarget.style.boxShadow = `0 0 0 2px ${C[500]}55`;
              }}
              onBlur={(e) => {
                e.currentTarget.style.boxShadow = "none";
              }}
            >
              <FontAwesomeIcon
                icon={getStarIcon(i)}
                style={{ fontSize: `${px}px`, lineHeight: 1 }}
              />
            </button>
          );
        })}
      </span>

      {/* Numeric value */}
      {showValue && displayValue && (
        <span
          aria-hidden="true"
          style={{
            fontSize: `${Math.round(px * 0.88)}px`,
            fontVariantNumeric: "tabular-nums",
            fontWeight: 600,
            color: C[400],
            lineHeight: 1,
            letterSpacing: "0.01em",
          }}
        >
          {displayValue}
        </span>
      )}

      {/* Count label */}
      {count != null && (
        <span
          aria-hidden="true"
          style={{
            fontSize: `${Math.round(px * 0.82)}px`,
            color: TEXT.secondary,
            lineHeight: 1,
            fontVariantNumeric: "tabular-nums",
          }}
        >
          ({count.toLocaleString()})
        </span>
      )}
    </span>
  );
}
