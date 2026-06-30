import { motion } from "framer-motion";
import Skeleton from "./Skeleton";

const EASE = [0.2, 0, 0, 1];

const containerVariants = {
  initial: { opacity: 0, y: 8 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.26, ease: EASE, staggerChildren: 0.045 },
  },
};

const itemVariants = {
  initial: { opacity: 0, y: 6 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.24, ease: EASE } },
};

function Shell({ children, style }) {
  return (
    <div
      style={{
        background: "var(--bg-card)",
        border: "1px solid var(--border)",
        borderRadius: 10,
        padding: 18,
        ...style,
      }}
    >
      {children}
    </div>
  );
}

function StatTile({ index }) {
  return (
    <Shell style={{ minHeight: 126 }}>
      <Skeleton width={34} height={34} radius={8} delay={index * 50} style={{ marginBottom: 14 }} />
      <Skeleton width="46%" height={26} radius={6} delay={index * 50 + 30} style={{ marginBottom: 9 }} />
      <Skeleton width="58%" height={11} radius={4} delay={index * 50 + 60} />
    </Shell>
  );
}

function KpiTile({ index }) {
  return (
    <Shell style={{ minHeight: 104, padding: "14px 16px" }}>
      <Skeleton width="54%" height={10} radius={4} delay={index * 45} style={{ marginBottom: 12 }} />
      <Skeleton width="44%" height={23} radius={6} delay={index * 45 + 35} />
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 12 }}>
        <Skeleton width={48} height={18} radius={9999} delay={index * 45 + 70} />
        <Skeleton width="42%" height={10} radius={4} delay={index * 45 + 100} />
      </div>
    </Shell>
  );
}

function ChartCell({ index }) {
  return (
    <div style={{ minWidth: 180 }}>
      <Skeleton width="46%" height={11} radius={4} delay={index * 50} style={{ marginBottom: 7 }} />
      <Skeleton width="32%" height={18} radius={5} delay={index * 50 + 25} style={{ marginBottom: 10 }} />
      <Skeleton width="100%" height={70} radius={7} delay={index * 50 + 50} />
    </div>
  );
}

export default function AdminDashboardSkeleton({ visible = true }) {
  return (
    <motion.div
      aria-hidden="true"
      variants={containerVariants}
      initial="initial"
      animate="animate"
      style={{ visibility: visible ? "visible" : "hidden" }}
    >
      <motion.div
        variants={itemVariants}
        style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 14, marginBottom: 20 }}
      >
        {Array.from({ length: 5 }, (_, index) => (
          <StatTile key={index} index={index} />
        ))}
      </motion.div>

      <motion.div
        variants={itemVariants}
        style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 14, marginBottom: 20 }}
      >
        {Array.from({ length: 5 }, (_, index) => (
          <KpiTile key={index} index={index} />
        ))}
      </motion.div>

      <motion.div variants={itemVariants}>
        <Shell style={{ marginBottom: 20 }}>
          <Skeleton width={150} height={13} radius={4} delay={70} style={{ marginBottom: 18 }} />
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 16 }}>
            {Array.from({ length: 4 }, (_, index) => (
              <ChartCell key={index} index={index} />
            ))}
          </div>
        </Shell>
      </motion.div>

      <motion.div
        variants={itemVariants}
        style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 16, marginBottom: 20 }}
      >
        {Array.from({ length: 2 }, (_, panelIndex) => (
          <Shell key={panelIndex}>
            <Skeleton width={panelIndex === 0 ? 132 : 170} height={13} radius={4} delay={panelIndex * 80} style={{ marginBottom: 15 }} />
            {Array.from({ length: 3 }, (_, rowIndex) => (
              <div key={rowIndex} style={{ display: "flex", alignItems: "center", gap: 10, padding: "7px 0" }}>
                <Skeleton width={30} height={30} radius={9999} delay={rowIndex * 45 + panelIndex * 80} />
                <div style={{ flex: 1, display: "grid", gap: 6, minWidth: 0 }}>
                  <Skeleton width={`${62 - rowIndex * 8}%`} height={12} radius={4} delay={rowIndex * 45 + 35 + panelIndex * 80} />
                  <Skeleton width={`${78 - rowIndex * 10}%`} height={10} radius={4} delay={rowIndex * 45 + 65 + panelIndex * 80} />
                </div>
                <Skeleton width={62} height={10} radius={4} delay={rowIndex * 45 + 95 + panelIndex * 80} />
              </div>
            ))}
          </Shell>
        ))}
      </motion.div>

      <motion.div variants={itemVariants}>
        <Shell>
          <Skeleton width={208} height={13} radius={4} delay={80} style={{ marginBottom: 14 }} />
          <Skeleton width="100%" height={74} radius={7} delay={130} />
        </Shell>
      </motion.div>
    </motion.div>
  );
}
