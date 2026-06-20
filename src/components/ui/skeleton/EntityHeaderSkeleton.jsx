import Skeleton from "./Skeleton";

export default function EntityHeaderSkeleton({ type = "album" }) {
  const isArtist = type === "artist";
  return (
    <div
      aria-hidden="true"
      style={{ display: "flex", gap: 24, padding: "32px 28px 24px", alignItems: "flex-end" }}
    >
      <Skeleton
        width={180}
        height={180}
        radius={isArtist ? 9999 : 8}
        style={{ flexShrink: 0 }}
      />
      <div style={{ flex: 1 }}>
        <Skeleton width={64} height={11} style={{ marginBottom: 10 }} />
        <Skeleton width="55%" height={32} radius={6} style={{ marginBottom: 14 }} />
        <Skeleton width="35%" height={12} />
      </div>
    </div>
  );
}
