import useDelayedVisible from "../../../hooks/useDelayedVisible";
import Skeleton from "./Skeleton";

export default function ModalSkeleton() {
  const visible = useDelayedVisible(true);

  return (
    <div
      aria-hidden="true"
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 2000,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 20,
        visibility: visible ? "visible" : "hidden",
        background: "var(--scrim)",
      }}
    >
      <div
        style={{
          width: "min(620px, 100%)",
          minHeight: 420,
          padding: 24,
          borderRadius: 14,
          border: "1px solid var(--border)",
          background: "var(--bg-card)",
          boxShadow: "var(--shadow-modal)",
        }}
      >
        <Skeleton width="38%" height={26} radius={6} style={{ marginBottom: 10 }} />
        <Skeleton width="62%" height={12} style={{ marginBottom: 28 }} />
        <div style={{ display: "grid", gridTemplateColumns: "160px 1fr", gap: 24 }}>
          <div style={{ display: "grid", gap: 10, alignContent: "start" }}>
            {Array.from({ length: 4 }, (_, index) => (
              <Skeleton key={index} width="100%" height={36} radius={7} />
            ))}
          </div>
          <div style={{ display: "grid", gap: 16 }}>
            {Array.from({ length: 5 }, (_, index) => (
              <div key={index}>
                <Skeleton width={`${72 - (index % 2) * 14}%`} height={13} style={{ marginBottom: 7 }} />
                <Skeleton width="100%" height={42} radius={7} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
