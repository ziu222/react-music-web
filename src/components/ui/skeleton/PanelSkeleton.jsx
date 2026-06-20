import Skeleton from "./Skeleton";

export default function PanelSkeleton({ lines = 8, compact = false, visible = true }) {
  return (
    <div
      aria-hidden="true"
      style={{
        display: "grid",
        gap: compact ? 9 : 13,
        padding: compact ? 0 : "28px 0",
        visibility: visible ? "visible" : "hidden",
      }}
    >
      {Array.from({ length: lines }, (_, index) => (
        <Skeleton
          key={index}
          width={`${88 - (index % 4) * 11}%`}
          height={compact ? 17 : index % 3 === 0 ? 22 : 18}
          radius={6}
        />
      ))}
    </div>
  );
}
