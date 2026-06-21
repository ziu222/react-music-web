import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

export default function EmptyState({ icon, title, desc, action, style: styleProp }) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "56px 24px",
        textAlign: "center",
        gap: 12,
        ...styleProp,
      }}
    >
      {icon && (
        <div
          style={{
            width: 52,
            height: 52,
            borderRadius: "50%",
            border: "2px dashed rgba(255,255,255,0.15)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "var(--text-tertiary, #5c524d)",
            marginBottom: 4,
            animation: "emptyFloat 3s ease-in-out infinite",
          }}
        >
          <FontAwesomeIcon icon={icon} style={{ fontSize: 18 }} />
        </div>
      )}
      <div style={{ fontSize: 14, fontWeight: 600, color: "var(--text-secondary, #b3b3b3)" }}>
        {title}
      </div>
      {desc && (
        <div style={{ fontSize: 12, color: "var(--text-tertiary, #5c524d)", maxWidth: 280, lineHeight: 1.55 }}>
          {desc}
        </div>
      )}
      {action && (
        <button
          type="button"
          onClick={action.onClick}
          style={{
            marginTop: 4,
            background: "transparent",
            border: "1px solid rgba(255,182,144,0.35)",
            color: "var(--color-coral-400, #ffb690)",
            borderRadius: 9999,
            padding: "7px 18px",
            fontSize: 12,
            fontWeight: 600,
            cursor: "pointer",
            transition: "background 0.15s, border-color 0.15s",
          }}
          onMouseEnter={e => {
            e.currentTarget.style.background = "rgba(255,182,144,0.1)";
            e.currentTarget.style.borderColor = "rgba(255,182,144,0.6)";
          }}
          onMouseLeave={e => {
            e.currentTarget.style.background = "transparent";
            e.currentTarget.style.borderColor = "rgba(255,182,144,0.35)";
          }}
        >
          {action.label}
        </button>
      )}

      <style>{`
        @keyframes emptyFloat {
          0%,100% { transform: translateY(0); }
          50%      { transform: translateY(-6px); }
        }
        @media (prefers-reduced-motion: reduce) {
          .emptyFloat { animation: none !important; }
        }
      `}</style>
    </div>
  );
}
