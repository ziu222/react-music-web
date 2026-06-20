import Skeleton from "./Skeleton";

export default function TrackRowSkeleton() {
  return (
    <div
      aria-hidden="true"
      style={{ display: "flex", alignItems: "center", gap: 12, padding: "8px 10px", minHeight: 52 }}
    >
      <Skeleton width={36} height={36} radius={4} style={{ flexShrink: 0 }} />
      <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 5 }}>
        <Skeleton width="48%" height={13} />
        <Skeleton width="28%" height={11} radius={3} />
      </div>
      <Skeleton width={36} height={11} radius={3} style={{ flexShrink: 0 }} />
    </div>
  );
}
