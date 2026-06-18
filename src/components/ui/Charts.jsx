/* Chart components SVG thuần — không phụ thuộc thư viện ngoài.
 * Theme-aware qua CSS vars; accent mặc định cam brand #f97316. */

const ACCENT = "#f97316";

/** Đường xu hướng + vùng fill nhẹ. data = [number, ...]. */
export function Sparkline({
  data = [],
  width = 520,
  height = 120,
  color = ACCENT,
  pad = 6,
}) {
  const pts = data.filter((n) => typeof n === "number" && !Number.isNaN(n));
  if (pts.length < 2) {
    return (
      <div
        style={{
          height,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 12,
          color: "var(--text-tertiary, rgba(255,255,255,0.3))",
          border: "1px dashed var(--border, rgba(255,255,255,0.08))",
          borderRadius: 8,
        }}
      >
        Chưa đủ dữ liệu — đường xu hướng đầy dần theo ngày
      </div>
    );
  }
  const min = Math.min(...pts);
  const max = Math.max(...pts);
  const span = max - min || 1;
  const stepX = (width - pad * 2) / (pts.length - 1);
  const y = (v) => pad + (height - pad * 2) * (1 - (v - min) / span);
  const coords = pts.map((v, i) => [pad + i * stepX, y(v)]);
  const line = coords.map(([x, yy], i) => `${i ? "L" : "M"}${x.toFixed(1)} ${yy.toFixed(1)}`).join(" ");
  const area = `${line} L${coords[coords.length - 1][0].toFixed(1)} ${height - pad} L${coords[0][0].toFixed(1)} ${height - pad} Z`;
  const [lx, ly] = coords[coords.length - 1];
  const gid = "spark-" + color.replace("#", "");
  return (
    <svg width="100%" viewBox={`0 0 ${width} ${height}`} style={{ display: "block" }}>
      <defs>
        <linearGradient id={gid} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.28" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={area} fill={`url(#${gid})`} />
      <path d={line} fill="none" stroke={color} strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
      <circle cx={lx} cy={ly} r="3.5" fill={color} />
    </svg>
  );
}

/** So sánh ngang. items = [{ label, value, highlight }]. */
export function MiniBars({ items = [], color = ACCENT }) {
  const max = Math.max(1, ...items.map((i) => i.value));
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      {items.map((it, i) => (
        <div key={i} style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div
            style={{
              width: 120,
              flexShrink: 0,
              fontSize: 12,
              color: it.highlight ? "var(--text-strong, #fff)" : "var(--text-secondary, rgba(255,255,255,0.5))",
              fontWeight: it.highlight ? 700 : 400,
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {it.label}
          </div>
          <div style={{ flex: 1, height: 10, background: "var(--overlay-1, rgba(255,255,255,0.07))", borderRadius: 9999, overflow: "hidden" }}>
            <div
              className="bar-grow"
              style={{
                width: `${(it.value / max) * 100}%`,
                height: "100%",
                background: it.highlight ? color : "var(--overlay-2, rgba(255,255,255,0.18))",
                borderRadius: 9999,
                animationDelay: `${i * 50}ms`,
              }}
            />
          </div>
          <div style={{ width: 52, flexShrink: 0, textAlign: "right", fontSize: 11, color: "var(--text-tertiary, rgba(255,255,255,0.3))" }}>
            {it.display ?? it.value}
          </div>
        </div>
      ))}
    </div>
  );
}

/** Ô số liệu. */
export function StatTile({ label, value, sub, accent }) {
  return (
    <div
      style={{
        flex: 1,
        minWidth: 120,
        background: "var(--bg-card, #181818)",
        border: "1px solid var(--border, rgba(255,255,255,0.08))",
        borderRadius: 10,
        padding: "12px 14px",
      }}
    >
      <div style={{ fontSize: 11, color: "var(--text-tertiary, rgba(255,255,255,0.3))", marginBottom: 4 }}>{label}</div>
      <div style={{ fontSize: 20, fontWeight: 700, color: accent ?? "var(--text-strong, #fff)", lineHeight: 1.1 }}>{value}</div>
      {sub && <div style={{ fontSize: 11, color: "var(--text-secondary, rgba(255,255,255,0.5))", marginTop: 3 }}>{sub}</div>}
    </div>
  );
}
