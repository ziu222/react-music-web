import Skeleton from "./Skeleton";

export default function SkeletonText({ lines = 1, widths, gap = 6, style }) {
  const ws = widths ?? (lines === 1
    ? ["60%"]
    : Array.from({ length: lines }, (_, i) => i === lines - 1 ? "40%" : "100%"));
  return (
    <div aria-hidden="true" style={{ display: "flex", flexDirection: "column", gap, ...style }}>
      {ws.map((w, i) => <Skeleton key={i} width={w} height={12} />)}
    </div>
  );
}
