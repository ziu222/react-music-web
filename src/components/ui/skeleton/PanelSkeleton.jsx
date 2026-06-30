import { motion } from "framer-motion";
import Skeleton from "./Skeleton";

const EASE = [0.2, 0, 0, 1];

export default function PanelSkeleton({ lines = 8, compact = false, visible = true }) {
  return (
    <motion.div
      aria-hidden="true"
      initial={{ opacity: 0, y: compact ? 3 : 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.24, ease: EASE, staggerChildren: 0.035 }}
      style={{
        display: "grid",
        gap: compact ? 9 : 13,
        padding: compact ? 0 : "28px 0",
        visibility: visible ? "visible" : "hidden",
      }}
    >
      {Array.from({ length: lines }, (_, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, y: 3 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2, ease: EASE, delay: index * 0.025 }}
        >
          <Skeleton
            width={`${88 - (index % 4) * 11}%`}
            height={compact ? 17 : index % 3 === 0 ? 22 : 18}
            radius={6}
            delay={index * 45}
          />
        </motion.div>
      ))}
    </motion.div>
  );
}
