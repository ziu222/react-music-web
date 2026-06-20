import Skeleton from "./Skeleton";

export default function TableSkeleton({ rows = 7, visible = true, cards = false }) {
  return (
    <div aria-hidden="true" style={{ display: "grid", gap: 10, visibility: visible ? "visible" : "hidden" }}>
      {cards && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 12, marginBottom: 8 }}>
          {Array.from({ length: 4 }, (_, index) => (
            <Skeleton key={index} width="100%" height={86} radius={10} />
          ))}
        </div>
      )}
      <Skeleton width="100%" height={42} radius={8} />
      {Array.from({ length: rows }, (_, index) => (
        <div
          key={index}
          style={{
            display: "grid",
            gridTemplateColumns: "40px minmax(140px, 1.5fr) minmax(100px, 1fr) 88px",
            alignItems: "center",
            gap: 14,
            minHeight: 54,
            padding: "0 12px",
            border: "1px solid var(--border)",
            borderRadius: 8,
            background: "var(--bg-card)",
          }}
        >
          <Skeleton width={34} height={34} radius={9999} />
          <Skeleton width={`${72 - (index % 3) * 9}%`} height={13} />
          <Skeleton width="58%" height={11} />
          <Skeleton width={64} height={22} radius={9999} />
        </div>
      ))}
    </div>
  );
}
