import { C } from "../constants/theme";

export default function EqBars({ size = 16 }) {
  const bars = ["eq1", "eq2", "eq3", "eq4"];
  return (
    <div style={{ display: "flex", gap: 2, alignItems: "flex-end", height: size }}>
      {bars.map((anim, i) => (
        <div
          key={i}
          style={{
            width: 2.5,
            // Orange đọc được trên cả dark overlay (Card) lẫn row sáng/tối
            background: C[500],
            borderRadius: 1,
            animation: `${anim} 0.55s ${i * 0.12}s ease-in-out infinite alternate`,
          }}
        />
      ))}
    </div>
  );
}
