import { AnimatePresence, motion } from "framer-motion";
import { useToast } from "../../hooks/useToast";

const TYPE_STYLES = {
  success: { border: "#3de96f", dot: "#3de96f" },
  error:   { border: "#fb7185", dot: "#fb7185" },
  info:    { border: "rgba(255,182,144,0.6)", dot: "#ffb690" },
};

export default function Toast() {
  const { toasts, dismiss } = useToast();

  return (
    <div
      style={{
        position: "fixed",
        bottom: 96,
        right: 20,
        zIndex: 9999,
        display: "flex",
        flexDirection: "column",
        gap: 8,
        pointerEvents: "none",
      }}
      aria-live="polite"
    >
      <AnimatePresence initial={false}>
        {toasts.map(t => {
          const s = TYPE_STYLES[t.type] ?? TYPE_STYLES.info;
          return (
            <motion.div
              key={t.id}
              layout
              initial={{ opacity: 0, x: 32, scale: 0.95 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 24, scale: 0.95 }}
              transition={{ type: "spring", stiffness: 420, damping: 30 }}
              onClick={() => dismiss(t.id)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                background: "var(--bg-el, #222)",
                border: `1px solid var(--border, rgba(255,255,255,0.08))`,
                borderLeft: `3px solid ${s.border}`,
                borderRadius: 8,
                padding: "10px 14px",
                fontSize: 12.5,
                fontWeight: 500,
                color: "var(--text-primary, #ede5dd)",
                boxShadow: "0 4px 20px rgba(0,0,0,0.4)",
                minWidth: 220,
                maxWidth: 340,
                pointerEvents: "auto",
                cursor: "pointer",
                userSelect: "none",
              }}
            >
              <span
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: "50%",
                  background: s.dot,
                  flexShrink: 0,
                }}
              />
              {t.message}
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
