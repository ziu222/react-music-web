import { useState } from "react";
import { TEXT } from "../../constants/theme";

/* Bar chart thuần CSS — không dùng thư viện chart. */
export function TrendBarChart({ points, height = 140, accent = "#f97316" }) {
  const [hover, setHover] = useState(null);
  const max = Math.max(...points.map((p) => p.plays ?? p.value ?? 0), 1);
  const val = (p) => p.plays ?? p.value ?? 0;
  const hovered = hover != null ? points[hover] : null;
  const total = points.reduce((s, p) => s + val(p), 0);

  return (
    <div>
      <div
        style={{
          fontSize: 12,
          color: TEXT.secondary,
          marginBottom: 10,
          minHeight: 16,
        }}
      >
        {hovered
          ? `${hovered.label} · ${val(hovered).toLocaleString("vi-VN")} lượt nghe`
          : `Tổng ${total.toLocaleString("vi-VN")} lượt nghe`}
      </div>
      <div
        onMouseLeave={() => setHover(null)}
        style={{ display: "flex", alignItems: "flex-end", gap: 3, height }}
      >
        {points.map((p, i) => (
          <div
            key={i}
            onMouseEnter={() => setHover(i)}
            style={{
              flex: 1,
              height: "100%",
              display: "flex",
              flexDirection: "column",
              justifyContent: "flex-end",
              cursor: "default",
            }}
          >
            <div
              className="studio-bar"
              style={{
                height: `${Math.max((val(p) / max) * 100, 2)}%`,
                background: hover === i ? accent : accent + "8c",
                borderRadius: "4px 4px 0 0",
                transition: "background 0.12s",
                "--stagger": i,
              }}
            />
          </div>
        ))}
      </div>
      <div style={{ display: "flex", gap: 3, marginTop: 6 }}>
        {points.map((p, i) => {
          const step = Math.ceil(points.length / 7);
          const show = i % step === 0 || i === points.length - 1;
          return (
            <div
              key={i}
              style={{
                flex: 1,
                fontSize: 9,
                color: TEXT.tertiary,
                textAlign: "center",
                whiteSpace: "nowrap",
                visibility: show ? "visible" : "hidden",
              }}
            >
              {p.label}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function ProgressBar({ pct, color = "#f97316", height = 6 }) {
  return (
    <div
      style={{
        width: "100%",
        height,
        borderRadius: 9999,
        background: "var(--overlay-1)",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          width: `${Math.min(Math.max(pct, 0), 100)}%`,
          height: "100%",
          borderRadius: 9999,
          background: color,
          transition: "width 0.4s ease",
        }}
      />
    </div>
  );
}

export function TrendChip({ pct }) {
  const up = pct >= 0;
  const color = up ? "#34d399" : "#fb7185";
  return (
    <span
      style={{
        borderRadius: 9999,
        padding: "1px 8px",
        fontSize: 10,
        fontWeight: 700,
        color,
        background: color + "1f",
        border: "1px solid " + color + "44",
        whiteSpace: "nowrap",
      }}
    >
      {up ? "▲" : "▼"} {Math.abs(pct)}%
    </span>
  );
}
