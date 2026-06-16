import { C } from "../../constants/theme";

export default function Loader({ text }) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        height: 260,
        gap: 14,
      }}
    >
      <div
        style={{
          width: 24,
          height: 24,
          borderRadius: "50%",
          border: "2.5px solid var(--border)",
          borderTopColor: C[500],
          animation: "spin 0.8s linear infinite",
        }}
      />
      <span style={{ fontSize: 12, color: "var(--text-tertiary)" }}>{text}</span>
    </div>
  );
}
