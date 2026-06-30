import { motion } from "framer-motion";
import Skeleton from "./Skeleton";

const EASE = [0.2, 0, 0, 1];

const containerVariants = {
  initial: { opacity: 0, y: 6 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.24, ease: EASE, staggerChildren: 0.035 },
  },
};

const itemVariants = {
  initial: { opacity: 0, y: 4 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.22, ease: EASE } },
};

export default function TableSkeleton({ rows = 7, visible = true, cards = false }) {
  return (
    <motion.div
      aria-hidden="true"
      variants={containerVariants}
      initial="initial"
      animate="animate"
      style={{ display: "grid", gap: 10, visibility: visible ? "visible" : "hidden" }}
    >
      {cards && (
        <motion.div
          variants={itemVariants}
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
            gap: 12,
            marginBottom: 8,
          }}
        >
          {Array.from({ length: 4 }, (_, index) => (
            <div
              key={index}
              style={{
                minHeight: 92,
                padding: 14,
                border: "1px solid var(--border)",
                borderRadius: 10,
                background: "var(--bg-card)",
              }}
            >
              <Skeleton width={34} height={34} radius={8} delay={index * 45} style={{ marginBottom: 13 }} />
              <Skeleton width="62%" height={18} radius={5} delay={index * 45 + 30} style={{ marginBottom: 8 }} />
              <Skeleton width="44%" height={11} radius={4} delay={index * 45 + 60} />
            </div>
          ))}
        </motion.div>
      )}
      <motion.div
        variants={itemVariants}
        style={{
          display: "grid",
          gridTemplateColumns: "40px minmax(120px, 1.35fr) minmax(90px, 0.8fr) minmax(120px, 1fr) 72px",
          alignItems: "center",
          gap: 14,
          minHeight: 42,
          padding: "0 12px",
          borderBottom: "1px solid var(--border)",
        }}
      >
        <Skeleton width={22} height={10} radius={9999} />
        <Skeleton width="38%" height={10} radius={9999} delay={45} />
        <Skeleton width="50%" height={10} radius={9999} delay={90} />
        <Skeleton width="34%" height={10} radius={9999} delay={135} />
        <Skeleton width={54} height={10} radius={9999} delay={180} />
      </motion.div>
      {Array.from({ length: rows }, (_, index) => (
        <motion.div
          key={index}
          variants={itemVariants}
          style={{
            display: "grid",
            gridTemplateColumns: "40px minmax(120px, 1.35fr) minmax(90px, 0.8fr) minmax(120px, 1fr) 72px",
            alignItems: "center",
            gap: 14,
            minHeight: 54,
            padding: "0 12px",
            border: "1px solid var(--border)",
            borderRadius: 8,
            background: "var(--bg-card)",
          }}
        >
          <Skeleton width={34} height={34} radius={9999} delay={index * 45} />
          <div style={{ display: "grid", gap: 7, minWidth: 0 }}>
            <Skeleton width={`${72 - (index % 3) * 9}%`} height={13} radius={4} delay={index * 45 + 35} />
            <Skeleton width={`${48 - (index % 2) * 8}%`} height={10} radius={4} delay={index * 45 + 60} />
          </div>
          <Skeleton width={`${54 + (index % 2) * 12}%`} height={20} radius={9999} delay={index * 45 + 80} />
          <Skeleton width={`${62 - (index % 3) * 8}%`} height={11} radius={4} delay={index * 45 + 105} />
          <Skeleton width={58} height={22} radius={9999} delay={index * 45 + 130} />
        </motion.div>
      ))}
    </motion.div>
  );
}
