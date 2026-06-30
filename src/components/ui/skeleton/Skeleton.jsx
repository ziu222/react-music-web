import styles from "./Skeleton.module.css";

export default function Skeleton({
  width = "100%",
  height = 14,
  radius,
  className = "",
  style,
  delay = 0,
}) {
  const shimmerDelay = typeof delay === "number" ? `${delay}ms` : delay;

  return (
    <div
      className={`${styles.block} ${className}`.trim()}
      aria-hidden="true"
      style={{ width, height, borderRadius: radius ?? 4, "--skeleton-delay": shimmerDelay, ...style }}
    />
  );
}
