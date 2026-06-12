import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMagnifyingGlass } from "@fortawesome/free-solid-svg-icons";
import { BG, TEXT, BORDER } from "../../constants/theme";

export function ConsoleHeader({ title, subtitle }) {
  return (
    <>
      <div style={{ fontSize: 24, fontWeight: 800, color: TEXT.strong, marginBottom: 2 }}>
        {title}
      </div>
      <div style={{ fontSize: 13, color: TEXT.secondary, marginBottom: 24 }}>
        {subtitle}
      </div>
    </>
  );
}

export function StatCard({ icon, accent, number, label }) {
  return (
    <div
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "translateY(-2px)";
        e.currentTarget.style.boxShadow = "var(--shadow-card)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "translateY(0)";
        e.currentTarget.style.boxShadow = "none";
      }}
      style={{
        background: BG.card,
        border: "1px solid " + BORDER,
        borderRadius: 10,
        padding: "16px 18px",
        flex: 1,
        minWidth: 150,
        transition: "all 0.15s",
        boxSizing: "border-box",
      }}
    >
      <div
        style={{
          width: 34,
          height: 34,
          borderRadius: 8,
          background: accent + "22",
          color: accent,
          fontSize: 14,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <FontAwesomeIcon icon={icon} />
      </div>
      <div style={{ fontSize: 28, fontWeight: 700, color: TEXT.strong, marginTop: 12 }}>
        {number}
      </div>
      <div style={{ fontSize: 12, color: TEXT.secondary, marginTop: 2 }}>{label}</div>
    </div>
  );
}

export function SearchInput({ value, onChange, placeholder, width = 240 }) {
  return (
    <div style={{ position: "relative" }}>
      <FontAwesomeIcon
        icon={faMagnifyingGlass}
        style={{
          position: "absolute",
          left: 10,
          top: "50%",
          transform: "translateY(-50%)",
          color: TEXT.tertiary,
          fontSize: 12,
        }}
      />
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        style={{
          background: BG.el,
          border: "1px solid " + BORDER,
          borderRadius: 6,
          padding: "8px 12px 8px 34px",
          fontSize: 13,
          color: "var(--text-primary)",
          outline: "none",
          width,
          boxSizing: "border-box",
        }}
      />
    </div>
  );
}

export function FilterPills({ options, active, onSelect }) {
  return (
    <>
      {options.map((pill) => {
        const isActive = active === pill.key;
        return (
          <button
            key={pill.key}
            onClick={() => onSelect(pill.key)}
            style={{
              background: isActive ? "var(--overlay-2)" : "transparent",
              border: "1px solid " + BORDER,
              color: isActive ? TEXT.strong : TEXT.secondary,
              borderRadius: 9999,
              padding: "5px 14px",
              fontSize: 12,
              fontWeight: 500,
              cursor: "pointer",
              transition: "all 0.15s",
            }}
          >
            {pill.label}
          </button>
        );
      })}
    </>
  );
}

const STATUS_STYLES = {
  draft: { label: "Nháp", color: "#94a3b8" },
  pending: { label: "Chờ duyệt", color: "#fbbf24" },
  approved: { label: "Đã duyệt", color: "#34d399" },
  rejected: { label: "Từ chối", color: "#fb7185" },
};

export function StatusBadge({ status }) {
  const s = STATUS_STYLES[status] ?? STATUS_STYLES.pending;
  return (
    <span
      style={{
        borderRadius: 9999,
        padding: "3px 10px",
        fontSize: 11,
        fontWeight: 600,
        color: s.color,
        background: s.color + "1f",
        border: "1px solid " + s.color + "4d",
        whiteSpace: "nowrap",
      }}
    >
      {s.label}
    </span>
  );
}

export function ActionChip({ color, label }) {
  return (
    <span
      style={{
        borderRadius: 9999,
        padding: "2px 9px",
        fontSize: 10,
        fontWeight: 600,
        color,
        background: color + "1f",
        border: "1px solid " + color + "44",
        whiteSpace: "nowrap",
      }}
    >
      {label}
    </span>
  );
}
