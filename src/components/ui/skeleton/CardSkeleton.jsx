import Skeleton from "./Skeleton";

export default function CardSkeleton({ width = 160 }) {
  return (
    <div
      aria-hidden="true"
      style={{
        width,
        flexShrink: 0,
        padding: 14,
        borderRadius: 10,
        border: "1px solid var(--border)",
        background: "var(--bg-card)",
      }}
    >
      <Skeleton width="100%" height={width - 28} radius={7} style={{ marginBottom: 12 }} />
      <Skeleton width="82%" height={13} style={{ marginBottom: 6 }} />
      <Skeleton width="52%" height={11} radius={3} />
    </div>
  );
}
